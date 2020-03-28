using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Application.Activities;
using Domain;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

//ActivitiesController is very thin and 'dumb' 
//Passes requests to Handlers via MediatR.Send

namespace API.Controllers
{
  
    //ControllerBase since our controller only used as an API, React is used for Views
    public class ActivitiesController : BaseController
    {
       
        [HttpGet]
        public async Task<ActionResult<List<Activity>>> List()
        {
            return await Mediator.Send(new List.Query());  //List.Query is the Command Handler in List.cs

        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<ActionResult<Activity>> Details(Guid id)
        {
            return await Mediator.Send(new Details.Query{Id = id});

        }

        // Can use Post wt root since  "api/[controller]"
        //If not using ApiController attribute we would need to use Create[FromBody]Create.Command command
        [HttpPost]
        public async Task<ActionResult<Unit>> Create(Create.Command command)
        {
            return await Mediator.Send(command);

        }

        //Edit handler
        [HttpPut("{id}")]
        public async Task<ActionResult<Unit>> Edit(Guid id, Edit.Command command)
        {

            command.Id = id;
            return await Mediator.Send(command);

        }

        [HttpDelete("{id}")]
        public async Task<ActionResult<Unit>> Delete(Guid id)
        {

            return await Mediator.Send(new Delete.Command{Id = id});

        }

    }
}