//Command handler for editing profile
using System;
using System.Threading;
using System.Threading.Tasks;
using Application.Interfaces;
using FluentValidation;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Persistence;

namespace Application.Profiles
{
    public class Edit
    {
        public class Command : IRequest
        {
            public string DisplayName { get; set; }
            public string Bio { get; set; }
        }

        public class CommandValidator : AbstractValidator<Edit.Command>
        {
            public CommandValidator()
            {
                RuleFor(x => x.DisplayName).NotEmpty();
            }
        }
      
         //Handler - UserAccessor to get to the user and his token
        public class Handler : IRequestHandler<Command>
        {
             private readonly DataContext _context;
             private readonly IUserAccessor _userAccessor;

            public Handler(DataContext context, IUserAccessor userAccessor)
            {
                _context = context;
                _userAccessor = userAccessor;
            }
            
             //handler logic
            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
                var user = await _context.Users.SingleOrDefaultAsync(x =>
                                             x.UserName == _userAccessor.GetCurrentUsername());

                if(String.IsNullOrEmpty(user.UserName))
                        throw new Exception("User was not found");

                    user.DisplayName = request.DisplayName ?? user.DisplayName;
                    user.Bio = request.Bio ?? user.Bio;
               
                var success = await _context.SaveChangesAsync() > 0;

                if (success) return Unit.Value;

                throw new Exception("Problem saving changes");
            }
        }
    }
}