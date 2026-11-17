# DevConnect

A developer community web app: sign up, build a profile, post to a feed, and follow other developers.

**A project by Sandeep Sagar**

## Tech stack
- **Frontend:** React 18 + Vite, React Router
- **Backend:** Node.js + Express (REST API)
- **Database:** SQLite (better-sqlite3), no setup needed
- **Auth:** JWT tokens + bcrypt password hashing

## Features
- Signup / login with hashed passwords and JWT
- Developer profiles (name, headline, bio, skills, GitHub, website), editable
- Post feed: create and delete your own posts, "Everyone" and "Following" tabs
- Follow / unfollow developers, follower counts
- Search developers by name, skill or headline
- Hand-written CSS design (no UI framework): landing hero, live stats from `/api/stats`, sidebar layout, who-to-follow rail
- Seeded demo data

## Run it
Needs Node.js 18+.

```bash
# Terminal 1 - API on :5000
cd server
cp .env.example .env
npm install
npm start          # auto-seeds demo data on first run

# Terminal 2 - UI on :5173
cd client
npm install
npm run dev
```
Open http://localhost:5173. Demo login: `aarav@demo.dev` / `password123`.

Run API checks (server must be running): `cd server && npm test`

## Structure
```
server/src/db.js          tables + SQLite connection
server/src/auth.js        JWT sign / verify middleware
server/src/app.js         all REST routes
server/src/seed.js        demo data
server/src/smoke-test.js  end-to-end API test
client/src/auth.jsx       login state (React context)
client/src/api.js         fetch wrapper that attaches the JWT
client/src/pages/         Feed, Login, Developers, Profile, EditProfile
```

## API
| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/signup | no | create account, returns token |
| POST | /api/auth/login | no | returns token |
| GET | /api/auth/me | yes | current user |
| GET | /api/users?q= | optional | list/search developers |
| GET | /api/users/:id | optional | profile, counts, posts |
| PUT | /api/users/me | yes | update own profile |
| POST/DELETE | /api/users/:id/follow | yes | follow / unfollow |
| GET | /api/posts?scope=following | optional | feed |
| GET | /api/stats | no | developer/post/connection counts |
| POST | /api/posts | yes | create post (max 500 chars) |
| DELETE | /api/posts/:id | yes | delete own post |

## Ideas for next
Likes and comments, image avatars, pagination, tests with Jest, deployment (Render / Vercel).

## Deploy (Render, free)
The repo has a `render.yaml`. On render.com choose New > Blueprint, pick this repo, and deploy. Express serves the built React app, so it is one service. SQLite lives in /tmp on the free plan, so data resets on restart (demo data is re-seeded on boot).
