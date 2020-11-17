using System;
using System.Threading.Tasks;
using Application.User;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class UserController : BaseController
    {
        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login(Login.Query query)  
        {
                Console.WriteLine("IN UserController.cs ...............................Net Core" );
                var user = await Mediator.Send(query);  //username and password
                SetTokenCookie(user.RefreshToken);
                return user;
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(Register.Command command)
        {
                var user = await Mediator.Send(command);
                SetTokenCookie(user.RefreshToken);
                return user;
        }

        [HttpGet]
        public async Task<ActionResult<User>> CurrentUser()
        {
                var user = await Mediator.Send(new CurrentUser.Query());
                SetTokenCookie(user.RefreshToken);
                return user;
        }

        //Will use agents.ts and userStore.ts
        [AllowAnonymous]
        [HttpPost("facebook")]
        public async Task<ActionResult<User>> FacebookLogin(ExternalLogin.Query query)
        {
                //return await Mediator.Send(query);
                var user = await Mediator.Send(query);
                SetTokenCookie(user.RefreshToken);
                return user;

        }

        //Refresh token cnat be anonymous
        [HttpPost("refreshToken")]
        public async Task<ActionResult<User>> RefreshToken(Application.User.RefreshToken.Command command)
        {
                //get refresh token from cookies
                command.RefreshToken = Request.Cookies["refreshToken"];
                var user = await Mediator.Send(command);
                SetTokenCookie(user.RefreshToken);
                return user;
        }

        private void SetTokenCookie(string refreshToken)
        {
                var cookieOptions = new CookieOptions
                {
                   //Issue cookie to the client, cant do anything else with it   
                   HttpOnly = true,
                   Expires = DateTime.UtcNow.AddDays(7)
                };
                Response.Cookies.Append("refreshToken", refreshToken, cookieOptions);
        }
    }
}