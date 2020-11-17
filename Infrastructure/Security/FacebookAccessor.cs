using System.Net.Http;
using Microsoft.Extensions.Options;
using System.Net.Http.Headers;
using Application.Interfaces;
using Application.User;
using System.Threading.Tasks;
using Newtonsoft.Json;

 //Goto FB and verify the token; also de-serialize info and return to handler
namespace Infrastructure.Security
{
    public class FacebookAccessor : IFacebookAccessor
    {

        private readonly HttpClient _httpClient;
        private readonly IOptions<FacebookAppSettings> _config;
    
        //Constructor
        public FacebookAccessor(IOptions<FacebookAppSettings> config)
        {
                _config = config;
                //Create http client
                _httpClient = new HttpClient
                {
                    BaseAddress = new System.Uri("https://graph.facebook.com/")
                };
                _httpClient.DefaultRequestHeaders
                    .Accept
                    .Add(new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public async Task<FacebookUserInfo> FacebookLogin(string accessToken)
        {
            //Verify token is valid
            var verifyToken = await _httpClient.GetAsync($"debug_token?input_token={accessToken}&access_token={_config.Value.AppId}|{_config.Value.AppSecret}");
            
            if(!verifyToken.IsSuccessStatusCode)
              return null;

           //Go back FB and present token to get user info
           var result = await GetAsync<FacebookUserInfo>(accessToken,"me", "fields=name, email, picture.width(100).height(100)");

           return result;
        }

        private async Task<T> GetAsync<T>(string accessToken, string endpoint, string args)     
        {
            var response = await _httpClient.GetAsync($"{endpoint}?access_token={accessToken}&{args}");
            
            if(!response.IsSuccessStatusCode) 
                          return default(T);

            var result = await response.Content.ReadAsStringAsync();

            //For the moment need to use Newtonsoft
            return JsonConvert.DeserializeObject<T>(result);

        }   
    }
}