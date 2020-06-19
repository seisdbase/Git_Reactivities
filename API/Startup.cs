using API.Middleware;
using Application.Activities;
using Domain;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Persistence;
using Microsoft.AspNetCore.Identity;
using Application.Interfaces;
using Infrastructure.Security;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc.Authorization;
using AutoMapper;
using Infrastructure.Photos;
using Microsoft.AspNetCore.Http.Features;
using Microsoft.AspNetCore.Routing;
using System;
using Microsoft.AspNetCore.Http;
using API.SignalR;
using System.Threading.Tasks;
using Application.Profiles;
//using API.SignalR;

namespace API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
             Console.WriteLine("IN STARTUP.CS BEGINNING ----------------------------------------------------" );
        }

        public IConfiguration Configuration { get; }

         //SERVICES DEPNEDENCY INJECTION CONTAINER
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
             Console.WriteLine("IN STARTUP.CS ConfigureServices ----------------------------------------------------" );
            services.AddDbContext<DataContext>(opt => 
            {
              opt.UseLazyLoadingProxies();
              opt.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
            });

            //Service for Cross-Origin Resource Sharing
            services.AddCors(opt => 
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins(
                        "http://localhost:3000"
                    ).AllowCredentials();   //this was the fix for CORS error 
                });
                            
            });
            
            //--MediatR is message hub; gives a reference where our handlers are located
            services.AddMediatR(typeof(List.Handler).Assembly);

            //AutoMapper
            services.AddAutoMapper(typeof(List.Handler));

           //SignalR
           services.AddSignalR();

            
            //services.AddMvc was replaced by AddControllers 
            //Authoriztion policy --> every request must be authorized
            services.AddControllers( opt =>
                {
                    var policy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
                    opt.Filters.Add(new AuthorizeFilter(policy));
                })

                .AddFluentValidation(cfg =>
                    {
                        //Will register all methods, not only create
                        cfg.RegisterValidatorsFromAssemblyContaining<Create>();  

                        //Identity setup
                        var builder = services.AddIdentityCore<AppUser>();
                        var identityBuilder = new IdentityBuilder(builder.UserType, builder.Services);
                        identityBuilder.AddEntityFrameworkStores<DataContext>();
                        identityBuilder.AddSignInManager<SignInManager<AppUser>>();

                        //Auth policy see IsHostRequirements.cs
                        services.AddAuthorization(opt =>
                        {
                            opt.AddPolicy("IsActivityHost", policy =>
                            {
                                policy.Requirements.Add(new IsHostRequirement());
                            });
                        });

                        //Authorization handler
                        services.AddTransient<IAuthorizationHandler, IsHostRequirementHandler>();
                        
                        //Token generator
                        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes
                                                    (Configuration["TokenKey"]));
                        services.AddScoped<IJwtGenerator, JwtGenerator>();

                        //Service for retrieving username from token
                        services.AddScoped<IUserAccessor, UserAccessor>();

                        //Service for cloudinary photos
                        services.AddScoped<IPhotoAccessor, PhotoAccessor>();

                        //Service for injecting profile reader
                        services.AddScoped<IProfileReader, ProfileReader>();

                        //Service for Cloudinary.com eg "Cloudinary:CloudName" "dp23kepfs"
                        services.Configure<CloudinarySettings>(Configuration.GetSection("Cloudinary"));

                        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                          .AddJwtBearer(opt =>
                          {
                              opt.TokenValidationParameters = new TokenValidationParameters
                              {
                                  ValidateIssuerSigningKey = true,
                                  IssuerSigningKey = key,
                                  ValidateAudience = false,       //url where its coming from
                                  ValidateIssuer = false
                              };

                              //Get token for SignalR --> server side
                              opt.Events = new JwtBearerEvents
                              {
                                  OnMessageReceived = context =>
                                  {
                                      var accessToken = context.Request.Query["access_token"];
                                      var path = context.HttpContext.Request.Path;
                                      if (!string.IsNullOrEmpty(accessToken) && (path.StartsWithSegments("/chat")))
                                      {
                                          context.Token = accessToken;
                                      }

                                      return Task.CompletedTask;
                                  }
                              };

                          });
                    });
        }

         // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
             Console.WriteLine("IN STARTUP.CS Configure ----------------------------------------------------" );


            app.UseMiddleware<ErrorHandlingMiddleware>();

            
            if (env.IsDevelopment())
            {
               // app.UseDeveloperExceptionPage();
            }

            //Adds middleware to redirect from Http to Https
            //app.UseHttpsRedirection();

            //Ordering of these matters; this allows [Authorize] attribute to be used inside controllers
            //so that endpoints are protected
            app.UseRouting();
                      
            app.UseCors("CorsPolicy"); 

            app.UseAuthentication();

            app.Use((context, next) =>
                {
                    var endpointFeature = context.Features[typeof(IEndpointFeature)] as IEndpointFeature;
                    var endpoint = endpointFeature?.Endpoint;

                    //note: endpoint will be null, if there was no
                    //route match found for the request by the endpoint route resolver middleware
                    if (endpoint != null)
                    {
                        var routePattern = (endpoint as RouteEndpoint)?.RoutePattern?.RawText;
                        
                        Console.WriteLine("----------------------------------------------------" );                                             
                        Console.WriteLine("IN STARTUP.CS app.Use ----------------------------------------------------" );
                        Console.WriteLine("ENDPOINT NAME: " + endpoint.DisplayName);
                        Console.WriteLine("----------------------------------------------------" );
                        Console.WriteLine($"ROUTE PATTERN: {routePattern}");
                        Console.WriteLine("----------------------------------------------------" );
                      // Console.WriteLine("METADATA TYPES: " + string.Join(", ", endpoint.Metadata));
                    }
                    return next();
                });


            
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                 //orig code
                // endpoints.MapControllers();

                //new code route map configuration
                endpoints.MapControllers();

                //route map I added to show Authorization setup
                endpoints.MapGet("/secret", context =>
                {
                    return context.Response.WriteAsync("secret");
                }).RequireAuthorization(new AuthorizeAttribute() { Roles = "admin" });

                //There are nowwhere  routes to redirect SignalR, must add them, SR gonna act as endpoint
                endpoints.MapHub<ChatHub>("/chat");

            });
        }
    }
}
