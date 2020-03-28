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
using System.Net;
using Microsoft.AspNetCore.Mvc.Authorization;

namespace API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

         //SERVICES CONTAINER
        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddDbContext<DataContext>(opt => 
            {
              opt.UseSqlite(Configuration.GetConnectionString("DefaultConnection"));
            });

            //Service for Cross-Origin Resource Sharing
            services.AddCors(opt => 
            {
                opt.AddPolicy("CorsPolicy", policy =>
                {
                    policy.AllowAnyHeader().AllowAnyMethod().WithOrigins(
                        "http://localhost:3000"
                    );
                });
                            
            });
            
            //--MediatR is message hub; gives a reference where our handlers are located
            services.AddMediatR(typeof(List.Handler).Assembly);
            
            //services.AddMvc was replaced by AddControllers 
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
                        
                        //Token generator
                        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(Configuration["TokenKey"]));
                        services.AddScoped<IJwtGenerator, JwtGenerator>();

                        //Service for retrieving username from token
                        services.AddScoped<IUserAccessor, UserAccessor>();

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
                          });
                    });
        }

         // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {

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
            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
