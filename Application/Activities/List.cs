using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
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
        public class Query : IRequest<List<Activity>> { }

        //Handler
        public class Handler : IRequestHandler<Query, List<Activity>>
        {
            private readonly DataContext _context;

                       public Handler(DataContext context)
            {
                this._context = context;

            }

             // All logic is contained here

            public async Task<List<Activity>> Handle(Query request,
            CancellationToken cancellationToken)
            {
                var activities = await _context.Activities.ToListAsync();

                return activities;
            }
        }

    }
}