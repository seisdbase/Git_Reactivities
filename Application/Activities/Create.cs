using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Activities;
using Application.Interfaces;
using Domain;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Activities
{
    public class Create
    {
        public class Command : IRequest
        {
            public Guid Id { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Category { get; set; }
            public DateTime Date { get; set; }
            public string City { get; set; }
            public string Venue { get; set; }
        }
    }


    public class CommandValidator : AbstractValidator<Create.Command>
    {
        public CommandValidator()
        {
            RuleFor(x => x.Title).NotEmpty();
            RuleFor(x => x.Description).NotEmpty();
            RuleFor(x => x.Category).NotEmpty();
            RuleFor(x => x.Date).NotEmpty();
            RuleFor(x => x.City).NotEmpty();
            RuleFor(x => x.Venue).NotEmpty();

        }

    }
    public class Handler : IRequestHandler<Create.Command>
    {
        private readonly DataContext _context;
        private readonly IUserAccessor _userAccessor;
        public Handler(DataContext context, IUserAccessor userAccessor)
        {
            _userAccessor = userAccessor;
            _context = context;

        }
        public async Task<Unit> Handle(Create.Command request, CancellationToken cancellationToken)
        {
            var activity = new Activity
            {
                Id = request.Id,
                Title = request.Title,
                Description = request.Description,
                Category = request.Category,
                Date = request.Date,
                City = request.City,
                Venue = request.Venue
            };

            //Since not using EF should NOT use here AddAsync
            _context.Activities.Add(activity);

            //Get user object, use async here dt going to db
            var user = await _context.Users.SingleOrDefaultAsync(
                       x => x.UserName == _userAccessor.GetCurrentUsername());

            var attendee = new UserActivity
            {
                AppUser = user,
                Activity = activity,
                DateJoined = DateTime.Now,
                IsHost = true
            };

            _context.UserActivities.Add(attendee);

            //This task for SaveChangesAsync returns number of changes
            var success = await _context.SaveChangesAsync() > 0;

            if (success) return Unit.Value;
            
            //Failure
            throw new Exception("Problem saving changes");
        }
    }
}