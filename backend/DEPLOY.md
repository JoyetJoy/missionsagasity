# Mission Sagacity API - Deployment Guide

## Live Backend

**API Base URL:** `https://clownfish-app-t2d2t.ondigitalocean.app/api`

**Health Check:** `https://clownfish-app-t2d2t.ondigitalocean.app/api/health`

## Local Development

```bash
cd backend
cp .env.example .env        # Edit with your local DB credentials
npm install
npm run db:init              # Run schema + seed against your local DB
npm run dev                  # Starts dev server on :8080
```

## Deploy to DigitalOcean App Platform

### Option A: Dashboard (Easiest)

1. Push `backend/` to a GitHub repo
2. Go to DigitalOcean > Apps > Create App
3. Connect your GitHub repo
4. DigitalOcean will auto-detect the Dockerfile
5. Add a **Dev Database** (PostgreSQL 16) under "Add Resource"
6. Set environment variables:
   - `JWT_SECRET` = a secure random string (use `openssl rand -hex 32`)
   - `JWT_EXPIRES_IN` = `7d`
   - `CORS_ORIGINS` = your frontend URL (e.g., `https://my-app.com`)
   - `DATABASE_URL` = auto-injected by DigitalOcean when you attach the DB
7. Deploy!
8. After first deploy, run the schema via the DB console:
   - Go to Databases > your DB > Console
   - Paste and run `schema-and-seed.sql`

### Option B: CLI

```bash
# Install doctl
brew install doctl   # or snap install doctl

# Authenticate
doctl auth init

# Edit .do/app.yaml with your GitHub repo details
# Then create the app:
doctl apps create --spec .do/app.yaml
```

### After Deployment: Initialize Database

Connect to your DigitalOcean managed database and run the SQL:

```bash
# Get your connection string from DigitalOcean dashboard
psql "your-connection-string" -f schema-and-seed.sql
```

## API Endpoints

### Auth
- `POST /api/auth/login` - Login (email, password)
- `POST /api/auth/signup` - Register (name, password, phone, pincode)
- `GET  /api/auth/me` - Get current user (requires token)

### Users (Admin)
- `GET    /api/users` - List all users
- `POST   /api/users` - Create user
- `PUT    /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user

### Flocks (Groups)
- `GET  /api/groups` - List groups
- `GET  /api/groups/:id` - Get group detail
- `POST /api/groups` - Create flock
- `PUT  /api/groups/:id` - Update flock
- `POST /api/groups/:id/approve` - Admin approve
- `POST /api/groups/:id/reject` - Admin reject
- `POST /api/groups/:id/join` - Join public flock
- `POST /api/groups/:id/leave` - Leave flock
- `POST /api/groups/:id/request-join` - Request to join private flock
- `POST /api/groups/:id/approve-join/:userId` - Approve join request
- `POST /api/groups/:id/reject-join/:userId` - Reject join request
- `POST /api/groups/:id/content-manager/:userId` - Add content manager
- `DELETE /api/groups/:id/content-manager/:userId` - Remove content manager

### Posts (Wisdom Feed)
- `GET  /api/posts/feed` - Wisdom Feed (public + user's groups)
- `GET  /api/posts/group/:groupId` - Posts by group
- `GET  /api/posts/:id` - Single post
- `POST /api/posts` - Create post
- `PUT  /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/posts/:id/like` - Toggle like
- `POST /api/posts/:id/react` - Toggle reaction
- `POST /api/posts/:id/comment` - Add comment

### Gatherings (Prayers)
- `GET  /api/prayers` - User's gatherings
- `GET  /api/prayers/all` - All gatherings
- `GET  /api/prayers/date/:date` - By date
- `GET  /api/prayers/upcoming` - Upcoming
- `POST /api/prayers` - Create gathering
- `PUT  /api/prayers/:id` - Update gathering
- `DELETE /api/prayers/:id` - Delete gathering

### Sages (Pastors)
- `GET  /api/pastors` - List all sages
- `GET  /api/pastors/:id` - Sage detail (with content + books)
- `GET  /api/pastors/by-user/:userId` - Sage by user ID
- `POST /api/pastors` - Create sage (admin)
- `PUT  /api/pastors/:id` - Update sage
- `DELETE /api/pastors/:id` - Delete sage (admin)
- `POST /api/pastors/:id/content` - Add content
- `POST /api/pastors/:pastorId/content/:contentId/approve` - Approve content
- `POST /api/pastors/:pastorId/content/:contentId/reject` - Reject content
- `POST /api/pastors/:id/books` - Add book
- `POST /api/pastors/:pastorId/books/:bookId/approve` - Approve book
- `POST /api/pastors/:pastorId/books/:bookId/reject` - Reject book
- `GET  /api/pastors/admin/pending` - All pending content/books

### Health
- `GET /api/health` - Health check

## Default Login Credentials (Seed Data)

| Role  | Email                      | Password      |
|-------|----------------------------|---------------|
| Admin | admin@sagacity.com         | password123   |
| User  | john@example.com           | password123   |
| User  | jane@example.com           | password123   |
| Sage  | pastor.john@church.org     | password123   |
| Sage  | pastor.jane@church.org     | password123   |
| Sage  | pastor.michael@church.org  | password123   |
| Sage  | pastor.sarah@church.org    | password123   |