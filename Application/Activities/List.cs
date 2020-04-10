using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
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
        //Query
        public class Query : IRequest<List<ActivityDto>>
        {

        }

        //Handler
        public class Handler : IRequestHandler<Query, List<ActivityDto>>
        {
            private readonly DataContext _context;
            private readonly IMapper _mapper;

            public Handler(DataContext context, IMapper mapper)
            {
                _mapper = mapper;
                _context = context;
            }

            // All logic is contained here
            public async Task<List<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                //Eager Loading   
                var activities = await _context.Activities
                          .ToListAsync();

                // //Lazy loading
                // var activities = await _context.Activities
                // .Include(x => x.UserActivities)
                // .ThenInclude(x => x.AppUser)
                // .ToListAsync();

                return _mapper.Map<List<Activity>, List<ActivityDto>>(activities);
            }
        }
    }
}