# Explain DevConnect in interviews (crib sheet)

Be honest about it: "I built DevConnect with AI assistance, then went through the code to understand every part." Learn the parts below until you can explain them without looking.

## 30-second pitch
"DevConnect is a full-stack social app for developers. You sign up, create a profile with your skills, post updates in a feed and follow other developers. The frontend is React with Vite, the backend is Node and Express with a REST API, data is in SQLite, and login uses JWT with bcrypt-hashed passwords."

## Architecture
Browser (React) -> `/api/...` calls -> Express server -> SQLite file.
In dev, Vite proxies `/api` to port 5000 (`client/vite.config.js`), so no CORS trouble.

## Database (server/src/db.js)
- `users`, `posts`, `follows`.
- `follows` is many-to-many on users: (follower_id, following_id) is the primary key, so you can't follow twice.
- Foreign keys with `ON DELETE CASCADE`: delete a user and their posts/follows go too.

## How auth works (be able to draw this)
1. Signup: password is hashed with bcrypt (`bcryptjs`, 10 salt rounds) and only the hash is stored.
2. Login: bcrypt compares the typed password to the hash. If OK the server signs a JWT containing the user id (`server/src/auth.js`), valid 7 days.
3. The client saves the token in localStorage (`client/src/auth.jsx`) and `api.js` sends it as `Authorization: Bearer <token>`.
4. `requireAuth` middleware verifies the token and sets `req.userId`. No valid token = 401.
5. Authorization: delete-post query includes `AND user_id = ?`, so you can only delete your own posts.
Trade-off to mention: localStorage is simple but exposed to XSS; httpOnly cookies are safer.

## Key files
- `server/src/app.js`: every route. Uses prepared statements (`?` placeholders) so SQL injection is prevented.
- `client/src/App.jsx`: routes + `Protected` wrapper for pages that need login.
- `client/src/pages/Feed.jsx`: `useState` for posts, `useEffect` refetch when tab/user changes.
- `client/src/components/FollowButton.jsx`: toggles POST/DELETE on the follow endpoint.

## Likely questions
- **Why SQLite?** Zero setup for a demo. For production I'd move to PostgreSQL; only db.js and the SQL syntax change.
- **How would you scale the feed?** Pagination (LIMIT/offset or cursor), indexes on posts.user_id and created_at.
- **What is a JWT?** Signed token (header.payload.signature); server verifies signature with its secret, no session store needed.
- **What does useEffect do in Feed?** Fetches posts after render, and again when `scope` or `user` changes.
- **What would you improve?** Likes/comments, avatar upload, pagination, rate limiting, input validation library, Jest tests, deploy with Docker.

## Honest limits
No tests beyond the API smoke test, no pagination, tokens in localStorage, SQLite is single-file. Say these yourself - interviewers like it.

## Practice
Change something small yourself (for example add a `location` field to profiles, end to end: table column, PUT route, edit form). Then you truly own the project.
