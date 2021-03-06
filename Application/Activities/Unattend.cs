using System;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Unattend
    {
        public class Command : IRequest
        {
            //Need to get id of the activity passed as root param
            public Guid Id { get; set; }
        }

        public class Handler : IRequestHandler<Command>
        {
            private readonly DataContext _context;
            private readonly IUserAccessor _userAccessor;
           
            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _context = context;

            }
            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                //handler logic
                   var  activity = await _context.Activities.FindAsync(request.Id);

                if(activity == null)
                    throw new RestException(System.Net.HttpStatusCode.NotFound, 
                                new {Activity = "Could not find activity"});

                var  user =  await _context.Users.SingleOrDefaultAsync(x => 
                                x.UserName ==_userAccessor.GetCurrentUsername());

                var  attendance =  await _context.UserActivities.SingleOrDefaultAsync(x => 
                                x.ActivityId == activity.Id && x.AppUserId == user.Id);

                //Just exit
                if(attendance == null)
                    return Unit.Value;

                //Check if user of this activity is host
                if(attendance.IsHost) 
                    throw new RestException(HttpStatusCode.BadRequest,  new {Attendance = "Host cannot unattend himself"});

                 _context.UserActivities.Remove(attendance);

                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;
                throw new Exception("Problem saving changes");
            }
        }
    }
}