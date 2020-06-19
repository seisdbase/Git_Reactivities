//Command handler for comments chat
using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Comments
{
    public class Create
    {
        //Constructor to return comment from this command hence CommentDto
        //Its not http request that goes to this command so we need to pass username as part of Command
        public class Command : IRequest<CommentDto>
        {
            public string Body { get; set; }
            public Guid ActivityId { get; set; }
            public string Username { get; set; }

        }


        public class Handler : IRequestHandler<Command, CommentDto>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            //Handler contructor
            public Handler(DataContext context, IMapper mapper)
            {
                this._mapper = mapper;
                this._context = context;

            }

            //Handler logic
            public async Task<CommentDto> Handle(Command request, CancellationToken cancellationToken)
            {
              var activity = await _context.Activities.FindAsync(request.ActivityId);

                if (activity == null)
                    throw new RestException(HttpStatusCode.NotFound, new {Activity = "Not found"});
               
               //Cant use UserAccessor since that relies on http context (we ar using WebSockets in SignalR)
                var user = await _context.Users.SingleOrDefaultAsync(x => x.UserName == request.Username);

                var comment = new Comment
                {
                    Author = user,
                    Activity = activity,
                    Body = request.Body,
                    CreatedAt = DateTime.Now
                };

                activity.Comments.Add(comment);

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return _mapper.Map<CommentDto>(comment);

                throw new Exception("Problem saving changes");
            }
        }
    }
}