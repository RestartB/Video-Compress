# Video Compress Server

Basic video compressor powered by FFmpeg with target file size and Discord authentication.

## Setup

> [!CAUTION]
> This service has no authentication built in. Authentication should be handled by the reverse proxy.

1. Copy the .env.example file, rename to .env. Change values as appropriate.
2. Run `docker compose up -d` - containers will be built and start automatically.
3. Navigate to port `3000` or the selected port in your web browser - the login page should appear.
