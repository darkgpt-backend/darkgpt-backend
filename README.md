# DarkGPT Backend

This backend is now organized as a hosted online service first, not a laptop-only server plan.

It is designed for:
- Node.js
- Express
- PostgreSQL
- Render or similar hosting platforms
- future Android app connection
- future OpenAI integration
- future one-account-per-device enforcement

## Main idea

The Android app should talk to an online API such as:

- `https://api.yourdomain.com`

This backend is the service that will live there.

## Deployment-ready folder structure

- `src/server.js`
  - Starts the Node server.
- `src/app.js`
  - Builds the Express app.
- `src/config/`
  - Environment and deployment settings.
- `src/routes/`
  - API route definitions.
- `src/controllers/`
  - Request/response handling.
- `src/services/`
  - Business logic.
- `src/repositories/`
  - PostgreSQL queries.
- `src/middleware/`
  - Auth guard, error handling, route safety.
- `src/db/`
  - Database connection pool.
- `src/utils/`
  - Small helpers like API errors.
- `database/schema.sql`
  - PostgreSQL tables and indexes.
- `render.yaml`
  - Render deployment configuration.

## Hosted deployment files

These files are especially meant for online deployment:

- [render.yaml](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/render.yaml)
- [.env.example](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/.env.example)
- [src/config/env.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/config/env.js)
- [src/db/pool.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/db/pool.js)
- [database/schema.sql](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/schema.sql)

## Production environment variables

Important env variables for hosted deployment:

- `PORT`
  - The hosting platform usually sets this for you.
- `NODE_ENV`
  - Use `production` online.
- `APP_BASE_URL`
  - Your real backend domain, for example `https://api.yourdomain.com`
- `CORS_ORIGIN`
  - Allowed client origins, comma separated.
- `TRUST_PROXY`
  - Use `true` behind Nginx, Render, or a reverse proxy.
- `DATABASE_URL`
  - Your hosted PostgreSQL connection string.
- `JWT_ACCESS_SECRET`
  - Strong secret for access tokens.
- `JWT_REFRESH_SECRET`
  - Strong secret for refresh tokens.
- `OPENAI_API_KEY`
  - Added later when OpenAI is connected.
- `DAILY_AI_MESSAGE_LIMIT`
  - Daily AI usage limit per user.
- `MONTHLY_AI_MESSAGE_LIMIT`
  - Monthly AI usage limit per user.
- `DEVICE_BINDING_ENABLED`
  - Future one-device enforcement switch.
- `PLAY_INTEGRITY_ENABLED`
  - Future integrity verification switch.

## Current backend systems already prepared

### Authentication

- register
- login
- refresh token
- logout
- protected route middleware

Main files:
- [auth.routes.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/routes/auth.routes.js)
- [auth.controller.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/controllers/auth.controller.js)
- [auth.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/auth.service.js)

### Session handling

Sessions are stored in PostgreSQL and linked to a user and device.

Main files:
- [session.repository.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/repositories/session.repository.js)
- [require-auth.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/middleware/require-auth.js)

### Device binding preparation

This is prepared as a service placeholder, not real enforcement yet.

Main file:
- [device-binding.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/device-binding.service.js)

### Usage limits and tracking

Daily and monthly AI usage architecture is now prepared.

Main files:
- [usage.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/usage.service.js)
- [usage.repository.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/repositories/usage.repository.js)
- [schema.sql](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/schema.sql)

### Chat endpoint structure

Main files:
- [chat.routes.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/routes/chat.routes.js)
- [chat.controller.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/controllers/chat.controller.js)
- [chat.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/chat.service.js)

### OpenAI integration point

Android should call this backend, and the backend will later call OpenAI.

Main file:
- [openai.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/openai.service.js)

## Health endpoints

- `/health`
  - Basic hosting uptime check.
  - Good for Render or a load balancer.
- `/api/health`
  - Deeper backend check including database connection.

## What changed compared to the old localhost-first direction

Before:
- the README focused on local terminal testing first
- the wording centered on `localhost`
- the flow treated laptop testing like the main goal

Now:
- the backend is described as an online hosted service first
- environment variables are written for real domains and hosted databases
- Render health check uses `/health`
- CORS is prepared for real origins
- proxy support is prepared with `TRUST_PROXY`
- usage tracking architecture is added for future billing/limits

## What is still missing before real deployment

This backend is structured well, but it is not fully production complete yet.

Still needed:
- install npm dependencies
- create the hosted PostgreSQL database
- run the SQL schema
- set real production secrets
- connect a real OpenAI SDK call
- add input validation
- add rate limiting
- add token hashing improvements for stored session tokens
- add real device lock enforcement
- add real Play Integrity verification
- add logging/monitoring

## What we do next for real hosting

1. Choose the hosting platform
   - Render is the easiest beginner option
2. Create the online PostgreSQL database
3. Add real environment variables in the host dashboard
4. Push this backend to GitHub
5. Connect the GitHub repo to Render
6. Deploy the web service
7. Run `database/schema.sql` on the hosted database
8. Test `/health` and `/api/health`
9. Connect the Android app to the hosted API base URL

## Honest note

This project is prepared for secure backend architecture, but it is not "secure just because the folders exist."

The value of this step is:
- clean deployment-ready structure
- clear extension points
- safer long-term direction
- easier future integration with Android, PostgreSQL, OpenAI, and device rules

