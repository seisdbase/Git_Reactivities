using System.Linq;
using System.Security.Claims;
using Application.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Security
{
    public class UserAccessor : IUserAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
       
         //Ctor to get http context
        public UserAccessor(IHttpContextAccessor httpContextAccessor)
        {
            this._httpContextAccessor = httpContextAccessor;
        }

        //Interface implementation
        public string GetCurrentUsername()
        {
        var username = _httpContextAccessor.HttpContext.User?.Claims?.FirstOrDefault(x =>
          x.Type == ClaimTypes.NameIdentifier)?.Value;

          return username;
        }
    }
}