using System;

namespace Domain
{
    public class Comment
    {
//Existence of virtual keyword is related only to lazy loading.
//  virtual keyword allows entity framework runtime create dynamic
//   proxies for your entity classes and their properties, 
//   and by that support lazy loading. Without virtual, 
//   lazy loading will not be supported, and you get null 
//   on collection properties.

        public Guid Id { get; set; }
        public string Body { get; set; }
        public virtual AppUser  Author { get; set; }
        public virtual Activity  Activity { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}