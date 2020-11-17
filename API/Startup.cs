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

        //--
        //SqlLite for development
        public void ConfigureDevelopmentServices(IServiceCollection services)
        {
            services.AddDbContext<DataContext>(opt =>
            {
                opt.UseLazyLoadingProxies();
                opt.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
                Console.WriteLine("IN STARTUP.CS -------------------------------DbContext for SQLite" );
            });

            ConfigureServices(services);
        }

        //MySql for production
        public void ConfigureProductionServices(IServiceCollection services)
        {
            services.AddDbContext<DataContext>(opt =>
            {
                opt.UseLazyLoadingProxies();
                opt.UseMySql(Configuration.GetConnectionString("DefaultConnection"));
                Console.WriteLine("IN STARTUP.CS--------------------------------- DbContext for MySql" );
            });

            ConfigureServices(services);
        }


         //SERVICES DEPENEDENCY INJECTION CONTAINER
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            
            // services.AddDbContext<DataContext>(opt =>
            // {
            //     opt.UseLazyLoadingProxies();
            //     opt.UseMySql(Configuration.GetConnectionString("DefaultConnection"));
            //     var foo = Configuration.GetConnectionString("DefaultConnection");
            //     Console.WriteLine("IN STARTUP.CS DbContext for MySql ---->" + foo );
            // });

            
            //Service for Cross-Origin Resource Sharing
            services.AddCors(opt => 
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    policy
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .WithExposedHeaders("WWW-Authenticate")
                          .WithOrigins("http://localhost:3000")
                          .AllowCredentials();   //this was the fix for CORS error 
                });
                            
            });
            
            //--MediatR is message hub; gives a reference where our handlers are located
            services.AddMediatR(typeof(List.Handler).Assembly);

            //AutoMapper
            services.AddAutoMapper(typeof(List.Handler));

           //SignalR
           services.AddSignalR();

            
            //WebApi: services.AddMvc was replaced by AddControllers 
            //Authorization policy --> every request must be authorized
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
                        services.AddScoped<IJwtGenerator, JwtGenerator>();

                        //Service for retrieving username from token
                        services.AddScoped<IUserAccessor, UserAccessor>();

                        //Service for cloudinary photos
                        services.AddScoped<IPhotoAccessor, PhotoAccessor>();

                        //Service for injecting profile reader
                        services.AddScoped<IProfileReader, ProfileReader>();

                        //Service for Facebook accessor
                        services.AddScoped<IFacebookAccessor, FacebookAccessor>();

                        //Service for Cloudinary.com eg "Cloudinary:CloudName" "dp23kepfs"
                        services.Configure<CloudinarySettings>(Configuration.GetSection("Cloudinary"));

                        //Facebook
                        services.Configure<FacebookAppSettings>(Configuration.GetSection("Authentication:Facebook"));

                        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["TokenKey"]));

                        services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                          .AddJwtBearer(opt =>
                          {
                              opt.TokenValidationParameters = new TokenValidationParameters
                              {
                                  ValidateIssuerSigningKey = true,
                                  IssuerSigningKey = key,
                                  ValidateAudience = false,       //url where its coming from
                                  ValidateIssuer = false,
                                  ValidateLifetime = true,
                                  ClockSkew = TimeSpan.Zero      //no 5 min leeway
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
         //Means we can add middleware to do something when sending request or receiving them 
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
             Console.WriteLine("IN STARTUP.CS --> public void Configure() --> Http request pipeline --> adding middleware to pipeline -->" );

           //Ordering is important - error handling must be highest
           //Refer to migration guide:
           //https://docs.microsoft.com/cs-cz/aspnet/core/migration/22-to-30?view=aspnetcore-3.1&tabs=visual-studio
           //see: Routing startup code
            app.UseMiddleware<ErrorHandlingMiddleware>();

            
            if (env.IsDevelopment())
            {
                //This is full-page info to be displayed - not useful for user in PROD mode
               // app.UseDeveloperExceptionPage();
            }
            else
            {
                // The default HSTS value is 30 days. You may want to change 
                //this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }


            //Adds middleware to redirect from Http to Https
            //in launchSettings.json removed from API/"applicationUrl" https://localhost:5000;
            //app.UseHttpsRedirection();

            //SECURITY POLICY
            //Middleware for security headers
            //Prevent content sniffing
             app.UseXContentTypeOptions();
            //Restrict amount of info passed to other sites
             app.UseReferrerPolicy(opt => opt.NoReferrer());
            // //Prevent reflected x-site attacks
            app.UseXXssProtection(opt => opt.EnabledWithBlockMode());
            // //Prevetns IFrames and click-jacking
            app.UseXfo(opt => opt.Deny());
            // //Content security policy
            app.UseCsp(opt => opt
                    .BlockAllMixedContent()
                    .StyleSources(s => s.Self()
                        .CustomSources("https://fonts.googleapis.com", "sha256-F4GpCPyRepgP5znjMD8sc7PEjzet5Eef4r09dEGPpTs="))
                    .FontSources(s => s.Self().CustomSources("https://fonts.gstatic.com", "data:"))
                    .FormActions(s => s.Self())
                    .FrameAncestors(s => s.Self())
                    .ImageSources(s => s.Self().CustomSources("https://res.cloudinary.com", "blob:", "data:"))
                    .ScriptSources(s => s.Self().CustomSources("sha256-zTmokOtDNMlBIULqs//ZgFtzokerG72Q30ccMjdGbSA="))
            );

             //This looks in wwwroot for any index.html files
             app.UseDefaultFiles();
             app.UseStaticFiles();

            //Middleware for routing
            //When request comes to API wjich needs to route it to the appropriate controlle
            //This allows [Authorize] attribute to be used inside controllers so that endpoints are protected
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


            //Maps controtroller endpoints to API server which routes then appropriately
            app.UseEndpoints(endpoints =>
            {
                 //old 2.0 code
                // endpoints.MapControllers();

                //new 3.0 code route map configuration
                endpoints.MapControllers();

                //route map I added to show Authorization setup
                endpoints.MapGet("/secret", context =>
                {
                    return context.Response.WriteAsync("secret");
                }).RequireAuthorization(new AuthorizeAttribute() { Roles = "admin" });

                //There are nowwhere  routes to redirect SignalR, must add them, SR gonna act as endpoint
                endpoints.MapHub<ChatHub>("/chat");

                //We are serving index.html from API server that knows nothing about routes in the React app
                //For any routes it does not know about we create a 'fallback' controller
                endpoints.MapFallbackToController("Index", "Fallback");

            });
        }
    }
}
