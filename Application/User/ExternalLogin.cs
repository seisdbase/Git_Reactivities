//Facebook Login
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using Domain;
using Application.Interfaces;
using MediatR;
using Application.Errors;
using System.Net;
using System.Linq;

namespace Application.User
{
    public class ExternalLogin
    {
        public class Query : IRequest<User> 
        {
            public string AccessToken { get; set; }
        }

        //Handler
        public class Handler : IRequestHandler<Query, User>
        {
            private readonly UserManager<AppUser> _userManager;
            private readonly IFacebookAccessor _facebookAccessor;
            private readonly IJwtGenerator _jwtGenerator;

            public Handler(UserManager<AppUser> userManager, IFacebookAccessor
                    facebookAccessor, IJwtGenerator jwtGenerator)
            {
                _userManager = userManager;
                _facebookAccessor = facebookAccessor;
                _jwtGenerator = jwtGenerator;
            }

            public async Task<User> Handle(Query request, CancellationToken cancellationToken)
            {
                var userInfo = await _facebookAccessor.FacebookLogin(request.AccessToken);

                if(userInfo == null)
                  throw new RestException(HttpStatusCode.BadRequest, new {User = "Problem validating token"});

                var user = await _userManager.FindByEmailAsync(userInfo.Email);

                var refreshToken = _jwtGenerator.GenerateRefreshToken();
                user.RefreshTokens.Add(refreshToken);

                //Check user was logged in previously hence issue Refresh Token
                if (user != null)
                {
                    user.RefreshTokens.Add(refreshToken);
                    //Update via _userManager since we are storing tokens in the db; it's saved automatically
                    await _userManager.UpdateAsync(user);
                    return new User(user, _jwtGenerator, refreshToken.Token);
                }

                //If user not logged in
                user = new AppUser
                {
                    DisplayName = userInfo.Name,
                    Id = userInfo.Id,
                    Email = userInfo.Email,
                    UserName = "fb_" + userInfo.Id   //To differentiate from normal username
                };

                var photo = new Photo
                {
                    Id = "fb_" + userInfo.Id,
                    Url = userInfo.Picture.Data.Url,
                    IsMain = true
                };

                user.RefreshTokens.Add(refreshToken);

                user.Photos.Add(photo);  //Had to modify AppUser.cs n create a constructor with Photos collection                    
                var result = await _userManager.CreateAsync(user);  //Password stored in FB

                if (!result.Succeeded)
                    throw new RestException(HttpStatusCode.BadRequest, new { User = "Problem creating user" });

                return new User(user, _jwtGenerator, refreshToken.Token);


            }
            
        }
    }
}