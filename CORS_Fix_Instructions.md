# Fix CORS Issue in .NET API

## Step 1: Update Program.cs

Add this code to your .NET API's `Program.cs`:

```csharp
var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

// ✅ ADD CORS CONFIGURATION HERE
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// Add other services...
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// ✅ USE CORS MIDDLEWARE (Must be BEFORE UseAuthorization)
app.UseCors("AllowReactApp");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

## Step 2: Restart Your API Server

After making changes, restart your .NET API:
```bash
# Stop the current server (Ctrl+C)
# Then restart
dotnet run
```

## Step 3: Trust SSL Certificate (if needed)

If you see SSL certificate errors, run this in your terminal:

```bash
dotnet dev-certs https --trust
```

Then restart your browser.

## Alternative: Test with Postman First

To verify your API is working:
1. Open Postman
2. Create a POST request to: `https://localhost:7291/api/Auth/LoginUser`
3. Set Headers:
   - Content-Type: application/json
4. Set Body (raw JSON):
   ```json
   {
     "loginId": "your-test-username",
     "password": "your-test-password"
   }
   ```
5. Send the request

If Postman works but the browser doesn't, it's definitely a CORS issue.

