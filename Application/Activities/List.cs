//Query handler for MediatR
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using AutoMapper;
using Domain;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

//This is Command handler for List command
namespace Application.Activities
{
    public class List
    {
        public class ActivitiesEnvelope
        {
            public List<ActivityDto> Activities { get; set; }
            public int ActivityCount { get; set; }
        }

        //Query
        public class Query : IRequest<ActivitiesEnvelope>
        {
        
            //Constractor ; this is used for paging
            public Query(int? limit, int? offset,  bool isGoing, bool isHost, DateTime? startDate) 
            {
                Limit = limit;
                Offset = offset;
                IsGoing = isGoing;
                IsHost = isHost;
                //activities in future only
                StartDate = startDate ?? DateTime.Now;
                
            }
                public int? Limit { get; set; }
                public int? Offset { get; set; }
                 public bool IsGoing { get; set; }
                public bool IsHost { get; set; }
                public DateTime? StartDate { get; set; }
        }

        //Handler
        public class Handler : IRequestHandler<Query, ActivitiesEnvelope>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;
            private readonly IUserAccessor _userAccessor;

            //Constructor
            public Handler(DataContext context, IMapper mapper,IUserAccessor userAccessor)
            {
                _userAccessor = userAccessor;
                _mapper = mapper;
                _context = context;
            }

            // Activities - all logic is contained here
            public async Task<ActivitiesEnvelope> Handle(Query request, CancellationToken cancellationToken)
            {
                var queryable = _context.Activities
                    .Where(x => x.Date >= request.StartDate)
                    .OrderBy(x => x.Date)
                    .AsQueryable();

                if (request.IsGoing && !request.IsHost)
                {
                    queryable = queryable.Where(x => x.UserActivities.Any(a => 
                    a.AppUser.UserName == _userAccessor.GetCurrentUsername()));
                }

                if (request.IsHost && !request.IsGoing)
                {
                    queryable = queryable.Where(x => x.UserActivities.Any(a => 
                    a.AppUser.UserName == _userAccessor.GetCurrentUsername() && a.IsHost));
                }

                var activities = await queryable
                    .Skip(request.Offset ?? 0)
                    .Take(request.Limit ?? 3).ToListAsync();

                return new ActivitiesEnvelope
                {
                    Activities = _mapper.Map<List<Activity>, List<ActivityDto>>(activities),
                    ActivityCount = queryable.Count()
                };

                //Original code module 4
               //  Console.WriteLine("IN List.cs >>>>>>>>>>Handler>>>>>>>>>>>>  Net Core" );
                //Eager Loading   
                // var activities = await _context.Activities.ToListAsync();

                // //Lazy loading
                // var activities = await _context.Activities
                // .Include(x => x.UserActivities)
                // .ThenInclude(x => x.AppUser)
                // .ToListAsync();
            }
        }
    }
}
