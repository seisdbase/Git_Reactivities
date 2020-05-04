using System.Threading.Tasks;
using Application.Profiles;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProfilesController : BaseController
    {
        [HttpGet("{username}")]
        //It is a ActionResult that returns Profile
        public async Task<ActionResult<Profile>> Get(string username)
        {
                return await Mediator.Send(new Details.Query{Username=username});
        }
    }
}