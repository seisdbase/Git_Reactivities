using System;
using Domain;
using Microsoft.AspNetCore;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Persistence;

namespace API
{
    public class Program
    {
        public static void Main(string[] args)
        {
            System.Console.WriteLine("IN===========================================Program.cs");   
           
            var host = CreateHostBuilder(args).Build();

            using(var scope = host.Services.CreateScope())
            {
               var services = scope.ServiceProvider;

               try
               {
                //applies any pending migrations to the context
                //    var context = services.GetRequiredService<DataContext>();
                //    var userManager = services.GetRequiredService<UserManager<AppUser>>();
                //    context.Database.Migrate();
                //    Seed.SeedData(context, userManager).Wait();
                    
               }
               catch (System.Exception ex)
               {
                   var logger = services.GetRequiredService<ILogger<Program>>();
                   logger.LogError(ex, "An error occurred during migration");
               } 
            }
             host.Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
           //below: applies appsetting.json, User-secrest etc.; configures Logging
            Host.CreateDefaultBuilder(args)
                //below: configures kestrel server
                 .ConfigureWebHostDefaults(webBuilder =>
                 {
                    //Header security - dont send server info
                     webBuilder.UseKestrel(x => x.AddServerHeader = false);
                    //Startup.cs
                    webBuilder.UseStartup<Startup>();
                    //     debugger;
                    //    .UseStartup<Startup>();
                 });

        //   public static IWebHostBuilder CreateWebHostBuilder(string[] args) =>
        //     WebHost.CreateDefaultBuilder(args)
        //         .UseStartup<Startup>();
                 
    }
}
