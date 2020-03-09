using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Details
    {

           public class Query : IRequest<Activity> 
           {
               public Guid Id { get; set; }
           }

        //Handler
        public class Handler : IRequestHandler<Query, Activity>
        {
            private readonly DataContext _context;
            public Handler(DataContext context)
            {
                this._context = context;

            }

            public async Task<Activity> Handle(Query request,
                    CancellationToken cancellationToken)
            {
               // throw new Exception("foo");

                var activity = await _context.Activities.FindAsync(request.Id);

                if (activity == null)
                    throw new RestException(System.Net.HttpStatusCode.NotFound, 
                    new {activity = "Not found"} );

                return activity;
            }
        }
        
    }
}