using Microsoft.AspNetCore.SignalR;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();

builder.Services.AddSignalR();

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder.AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials()
              .SetIsOriginAllowed(_ => true);
    });

});
var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseRouting();
app.UseCors();

app.MapHub<ConectSockt>("/api/conect");

app.Run();

public class ConectSockt : Hub
{
    public static Dictionary<int,(string, List<(string, DateTime)>)> db = new Dictionary<int, (string, List<(string, DateTime)>)>();
    public async Task SendMessage(int key, string user, string message)
    {
        int keyUser = db.Any() ? db.Keys.Max() + 1 : 1;
        if (db.ContainsKey(key) && key != 0)
        {
            keyUser = key;
            db[key].Item2.Add((message, DateTime.Now));
        }
        else
        {
            db.TryAdd(keyUser, (user, new List<(string, DateTime)>() { { (message, DateTime.Now) } }));
        }

        await Clients.Caller.SendAsync("SendMessage", new { key = keyUser, name = user, message = message });
        
        await ReceiveMessage();
    }
    public async Task ReceiveMessage()
    {
        await Clients.All.SendAsync(
            "ReceiveMessage", 
            db.SelectMany(entry => 
                entry.Value.Item2.Select(item => 
                new { message = $"{entry.Value.Item1}: {item.Item1} {item.Item2}", date= item.Item2 })
                ).OrderByDescending(e=> e.date).Select(e => e.message).ToList());
    }
}