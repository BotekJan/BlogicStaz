# ---- Build stage ----
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY . .
RUN echo "Hello World from the build stage!" 
RUN dotnet publish -c Release -o /app/publish

# ---- Runtime stage ----
FROM mcr.microsoft.com/dotnet/aspnet:8.0

WORKDIR /app/publish

RUN ls

# Optionally install debugging tools for testing (uncomment if needed)
RUN apt-get update && apt-get install -y iputils-ping net-tools telnet && rm -rf /var/lib/apt/lists/*

COPY --from=build /app/publish .


# Set environment variables for database (adjust names as needed)
ENV DB_SERVER=db
ENV DB_PORT=

#ENTRYPOINT [ "sleep", "infinity" ]

ENTRYPOINT ["dotnet", "server.dll"]