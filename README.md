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

- username login
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

Device binding is now enforced in backend login logic.

Main file:
- [device-binding.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/device-binding.service.js)

### Usage limits and tracking

Daily and monthly AI token usage is now tracked per user.

Main files:
- [usage.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/usage.service.js)
- [usage.repository.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/repositories/usage.repository.js)
- [schema.sql](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/schema.sql)

### Manual admin control

Main files:
- [admin-user.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/admin-user.service.js)
- [manual_user_management.sql](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/admin/manual_user_management.sql)

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

## Preparing the 500 pre-created accounts

DarkGPT is now set up as invite-only.

That means:
- there is no public signup route
- users must be inserted by you into PostgreSQL
- only the accounts you create can log in

Main files for this step:
- [precreated_users_template.csv](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/seeds/precreated_users_template.csv)
- [precreated_users_template.sql](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/seeds/precreated_users_template.sql)
- [generate-password-hash.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/scripts/generate-password-hash.js)
- [generate-users-csv-template.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/scripts/generate-users-csv-template.js)
- [hash-users-from-csv.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/scripts/hash-users-from-csv.js)
- [csv-to-user-sql.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/scripts/csv-to-user-sql.js)

### Bulk workflow for 500 users

Use this workflow:

1. Fill the CSV template
2. Run the bulk hash script
3. Run the CSV-to-SQL script
4. Import the generated SQL into Render PostgreSQL

### CSV template

The generated CSV file is:
- [precreated_users_template.csv](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/seeds/precreated_users_template.csv)

It contains 500 rows with these columns:
- `account_number`
- `username`
- `email`
- `password_plain`
- `daily_limit`
- `monthly_limit`
- `account_status`

### Fields used in the account import template

The SQL template uses these input fields:
- `email`
- `password_hash`
- `monthly_limit`
- `daily_limit`
- `account_status`

They are inserted into the real `users` table fields automatically.

### How to generate a password hash

Run:

```bash
npm run hash:password -- YourStrongPassword123
```

This prints a bcrypt hash you can paste into `password_hash`.

### How to regenerate the 500-row CSV template

If you want to recreate the CSV automatically, run:

```bash
npm run users:template
```

### How to hash all 500 passwords in bulk

Run:

```bash
npm run users:hash-csv
```

This reads:
- [precreated_users_template.csv](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/seeds/precreated_users_template.csv)

And creates:
- `database/seeds/precreated_users_hashed.csv`

### How to convert the hashed CSV into SQL

Run:

```bash
npm run users:csv-to-sql
```

This reads:
- `database/seeds/precreated_users_hashed.csv`

And creates:
- `database/seeds/precreated_users_import.sql`

### How to import users into PostgreSQL on Render

1. Open [precreated_users_template.csv](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/seeds/precreated_users_template.csv)
2. Replace the placeholder emails, usernames, and passwords with real values
3. Run:

```bash
npm run users:hash-csv
```

4. Run:

```bash
npm run users:csv-to-sql
```

5. Open your Render PostgreSQL dashboard
6. Open the SQL query editor or connect using a PostgreSQL client
7. Run [schema.sql](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/schema.sql) first
8. Open the generated file:
   - `database/seeds/precreated_users_import.sql`
9. Execute that SQL
10. Confirm the users were inserted

### Recommended workflow for the 500 accounts

1. Prepare a spreadsheet with:
   - account number
   - username
   - email
   - plain password
   - daily limit
   - monthly limit
   - account status
2. Paste or export that data into:
   - [precreated_users_template.csv](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/database/seeds/precreated_users_template.csv)
3. Run the bulk hash script
4. Run the SQL generator script
5. Import the generated SQL into Render PostgreSQL

### Why invite-only is enforced

Invite-only is enforced in two ways:
- [auth.routes.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/routes/auth.routes.js) does not expose a public `/register` route
- [auth.service.js](C:/Users/khale/AndroidStudioProjects/DarkGPT14/backend/src/services/auth.service.js) rejects public signup internally

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
