using System;
using System.Text.Json;
using System.Threading.Tasks;
using Application.Errors;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;


namespace API.Middleware
{
    public class ErrorHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ErrorHandlingMiddleware> _logger;
        public ErrorHandlingMiddleware(RequestDelegate next, ILogger<ErrorHandlingMiddleware> logger)
        {
            this._logger = logger;
            this._next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            Console.WriteLine("IN ErrorHandlingMiddleware.cs ---------------------Task Invoke(HttpContext context)" );
            try
            {
                await _next(context);      //just pass on to next
            }
            catch (Exception ex)
            {
                //out special error handling
                // Console.WriteLine("Error: " + ex.Message);
                await HandleExceptionAsync (context, ex, _logger);
            }
        }

        private async Task HandleExceptionAsync(HttpContext context, Exception ex, ILogger<ErrorHandlingMiddleware> logger)
        {
            //Our logic here; if its our RestException or Server exception
            object errors = null;

            switch(ex)
            {
                case RestException re:
                   logger.LogError(ex, "REST ERROR");
                   errors = re.Errors;
                   //  Console.WriteLine("Error: " + ex.Message);
                   context.Response.StatusCode = (int) re.Code;
                   break;
                case Exception e:
                    logger.LogError(ex, "SERVER ERROR");
                    //  Console.WriteLine("Error: " + ex.Message);
                    errors = string.IsNullOrWhiteSpace(e.Message) ? "Error" : e.Message;
                    context.Response.StatusCode = (int)System.Net.HttpStatusCode.InternalServerError;
                    break;
            }

            context.Response.ContentType = "application/json";
            if(errors != null)
            {
                var result = JsonSerializer.Serialize( new
                    {
                        errors
                    });
                      // Console.WriteLine("Error: " + ex.Message);
                await context.Response.WriteAsync(result);
            }

        }
    }
}