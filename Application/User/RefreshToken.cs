// Refresh token handler
using System;
using System.Linq;
using System.Net;
using System.Threading;
using System.Threading.Tasks;
using Application.Errors;
using Application.Interfaces;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Identity;

namespace Application.User
{
    public class RefreshToken
    {
        public class Command : IRequest<User>
        {
            public string RefreshToken { get; set; }
        }

        //Handler
        public class Handler : IRequestHandler<Command, User>
        {
            //Generate constructor
            private readonly UserManager<AppUser> _userManager;
            private readonly IJwtGenerator _jwtGenerator;
            private readonly IUserAccessor _userAccessor;
             
             //Initialize fields from parameters
            public Handler(UserManager<AppUser> userManager, IJwtGenerator jwtGenerator, IUserAccessor userAccessor)
            {
              _userAccessor = userAccessor;
              _jwtGenerator = jwtGenerator;
              _userManager = userManager;
            }

            //Implement interface
            public async Task<User> Handle(Command request, CancellationToken cancellationToken)
            {
                //Logic
               var user = await _userManager.FindByNameAsync(_userAccessor.GetCurrentUsername());
               var oldToken = user.RefreshTokens.SingleOrDefault(w => w.Token == request.RefreshToken);

               //Make sure oldToken is valid else return 401
               if(oldToken != null && !oldToken.IsActive) throw new RestException(HttpStatusCode.Unauthorized);

               //Revoke the token
               if(oldToken != null)
               {
                  oldToken.Revoked = DateTime.Now; 	    
               }

               //Create new token
               var newRefreshToken = _jwtGenerator.GenerateRefreshToken();
               user.RefreshTokens.Add(newRefreshToken);

               await _userManager.UpdateAsync(user);

               return new User(user, _jwtGenerator, newRefreshToken.Token);
            }


        }
    }
}