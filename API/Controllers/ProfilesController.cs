using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Profiles;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    public class ProfilesController : BaseController
    {
         //It is a ActionResult that returns Profile
        [HttpGet("{username}")]
        public async Task<ActionResult<Profile>> Get(string username)
        {
                return await Mediator.Send(new Details.Query{Username=username});
        }

         //Edit handler
        [HttpPut]
        public async Task<ActionResult<Unit>> Edit(Edit.Command command)
        {
             return await Mediator.Send(command);
        }

        [HttpGet("{username}/activities")]
        public async Task<ActionResult<List<UserActivityDto>>> GetUserActivities(string username, string predicate) 
        {
            return await Mediator.Send(new ListActivities.Query{Username = username, Predicate = predicate});
        }
    }
}