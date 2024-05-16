using Microsoft.AspNetCore.SignalR;
using RedisPublicChannelApp.Hubs;
using RedisPublicChannelApp.Services;
using StackExchange.Redis;

namespace RedisPublicChannelApp
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllersWithViews();
            builder.Services.AddSignalR();
            builder.Services.AddSingleton<IConnectionMultiplexer>(ConnectionMultiplexer.Connect("redis-10121.c56.east-us.azure.redns.redis-cloud.com:10121,password=46z2FCmoW9FRGfHVW9S2GXHRCySWS81h"));
            builder.Services.AddScoped<IMessageListener,RedisMessageListener>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler("/Home/Error");
                // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseAuthorization();

            app.MapControllerRoute(
                name: "default",
                pattern: "{controller=Home}/{action=Index}/{id?}");

            app.MapHub<ChatHub>("/chathub");

            app.Run();
        }
    }
}