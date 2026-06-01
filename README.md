# PlanTogether

PlanTogether is a full-stack event management web application built for discovering, hosting, and managing upcoming events. Users can create accounts, publish events, browse future events, register for events, save events, comment on them, and manage their own hosted listings from a personal profile.

## Website Theme

The website uses a modern dark event-platform theme:

- dark charcoal background
- orange accent color palette
- glass-panel card styling
- rounded card-heavy UI
- responsive layout for desktop and mobile
- simple social interaction flow around each event

The overall design direction is meant to feel like a modern event discovery platform rather than a plain admin dashboard.

## Technologies Used

### Frontend

- React
- Vite
- React Router
- Axios
- Context API
- Tailwind CSS

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Token
- BcryptJS

## Main Features

### 1. Authentication

Users can register and log in securely.

Implemented with:

- JWT-based authentication
- hashed passwords using Bcrypt
- secure httpOnly cookie-based session storage
- backend token verification on app load
- logout endpoint that clears the auth cookie

Additional behavior:

- registration now asks for both `name` and `email`
- the user `name` is shown in profile, navbar, host information, and comments
- older users without a saved name are handled with a safe fallback derived from email

### 2. Role-Based Access

The backend supports two roles: `user` and `admin`.

Implemented with:

- `role` field on the user schema
- default role of `user` for normal registrations
- admin assignment through the `ADMIN_EMAILS` environment variable
- reusable `requireAdmin` middleware for admin-only APIs
- admin-only `GET /api/admin/users` endpoint
- admin moderation permissions for deleting inappropriate events and comments

Current behavior:

- normal users can use event features and manage only their own content
- admins can access protected admin routes
- admins can delete any event listing or comment for moderation
- users cannot choose their own role from the frontend request body

### 3. Create, Edit, and Delete Events

Authenticated users can:

- create events
- edit only their own events
- delete only their own events

Implemented with:

- protected frontend routes
- backend ownership checks before update and delete
- event forms with validation for title, description, category, date, time, location, and optional capacity

Important rule:

- events can only be created or updated with future date/time values

### 4. Upcoming Event Discovery

The `Home` and `Explore` pages are focused on future events.

Implemented with:

- backend filtering using `starts_at >= current time`
- sorted upcoming events
- shared event fetching through the React event context

### 5. Search and Category Filtering

Users can search and filter upcoming events.

Implemented with:

- backend text search on title, description, and location
- frontend debounce while typing
- category filter support for:
  Music, Tech, Sports, Art, Food, Business

### 6. Registration System

Users can register for events from the event details page.

Implemented with:

- dedicated backend register endpoint
- dedicated backend leave-registration endpoint
- attendee counts returned in event responses
- attendee list visible to the host on the event details page

Current behavior:

- if the event has capacity left, the user can register
- if the event is full, registration is blocked with a clear backend error
- users can also leave an event after registering

### 7. Capacity Tracking

Each event can optionally have a maximum number of attendees.

Implemented with:

- optional `capacity` field in the event form
- backend validation for the capacity value
- backend protection against reducing capacity below already registered attendees
- frontend display of remaining spots

### 8. Save / Bookmark Events

Users can save events for later.

Implemented with:

- save endpoint
- unsave endpoint
- saved count on event cards and event details
- dedicated `Saved events` section in the user profile

### 9. Comment System

Users can comment on event detail pages.

Implemented with:

- backend comment creation endpoint
- backend comment deletion endpoint
- comments embedded in the event response
- real-time UI update after comment actions

Comment permissions:

- the person who wrote the comment can delete it
- the event owner can also delete comments on their own event
- other users cannot delete comments written by someone else

This is one of the most important interaction features in the app because it allows users to ask questions and engage directly under the event.

### 10. Profile Page

Each logged-in user has a profile page that collects their event activity.

Implemented with:

- created events section
- registered events section
- saved events section
- quick profile stats
- next hosted event summary
- next attending event summary

### 11. Host Information

Event host details are shown using the user’s `name` instead of relying only on email.

Implemented with:

- storing `created_by_name` on events
- returning host information in event API responses
- displaying the host name on cards and detail pages

### 12. Event Detail Experience

The event details page now works as the main interaction hub.

It includes:

- event description
- host information
- going count
- saved count
- capacity info
- register / leave event actions
- save event action
- share event action
- comment section
- host-only manage tools
- host-only attendee visibility

### 13. Share Event

Users can share an event from the event details page.

Implemented with:

- Web Share API when available
- clipboard fallback when native share is not available

## Feature Behavior Summary

Some features are important to explain clearly because the behavior is not obvious just by looking at the UI:

- Only the original creator can edit or delete an event.
- Users have a `user` or `admin` role.
- Admin-only routes require authentication plus the `admin` role.
- Admin users can delete any event or comment for moderation.
- The event owner sees management controls and attendee lists.
- Other users do not see owner-only management controls.
- Comments can be deleted only by:
  the comment author or the event owner.
- Capacity is optional.
- If capacity is set and the event is already full, registration is blocked.
- Home and Explore are meant for future events, not past events.
- Saved events are personal to each user and shown in profile.

## Project Structure

```text
EventWeb/
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- middleware/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- utils/
|   `-- package.json
|-- frontend/
|   |-- src/
|   |   |-- api/
|   |   |-- components/
|   |   |-- context/
|   |   |-- data/
|   |   |-- pages/
|   |   `-- utils/
|   `-- package.json
`-- README.md
```

## Backend Setup

```bash
cd backend
copy .env.example .env
npm install
npm run dev
```

Backend environment variables are defined in `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=plantogether_db
JWT_SECRET_KEY=change-me-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
PORT=8001
COOKIE_SECURE=false
COOKIE_SAMESITE=lax
ADMIN_EMAILS=admin@example.com
```

`ADMIN_EMAILS` is a comma-separated allowlist. Users who register with one of those emails receive the `admin` role; all other users receive the default `user` role.

JWTs are stored in an httpOnly cookie named `plantogether_access_token`. Use `COOKIE_SECURE=true` and `COOKIE_SAMESITE=none` for a cross-site HTTPS deployment such as Vercel frontend plus Render backend.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend environment variables are defined in `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:8001
```

## API Endpoints

### Authentication

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/verify`

### Events

- `POST /api/events`
- `GET /api/events`
- `GET /api/events/{event_id}`
- `PUT /api/events/{event_id}`
- `DELETE /api/events/{event_id}`
- `GET /api/events/my/created`
- `GET /api/events/my/registered`
- `GET /api/events/my/bookmarked`
- `POST /api/events/{event_id}/register`
- `DELETE /api/events/{event_id}/register`
- `POST /api/events/{event_id}/bookmark`
- `DELETE /api/events/{event_id}/bookmark`
- `POST /api/events/{event_id}/comments`
- `DELETE /api/events/{event_id}/comments/{comment_id}`

### Admin

- `GET /api/admin/users` - admin-only list of registered users

## Notes

- `GET /api/events` supports `search`, `category`, and `include_past` query params.
- Home and Explore currently show future events by default.
- Existing older users and events are handled with serializer fallbacks where possible.

## Security Notes

- Passwords are hashed with Bcrypt before storing them in MongoDB.
- JWTs are sent through the `plantogether_access_token` httpOnly cookie instead of frontend `localStorage`.
- The frontend uses `withCredentials: true` so the browser sends the cookie with API requests.
- CORS is restricted to the configured `FRONTEND_URL` and local Vite development URL.
- Admin access is controlled server-side through the stored user `role`; the frontend cannot grant admin privileges.

## Scalability Notes

The project uses a modular Express structure so new modules can be added under `routes`, `models`, `middleware`, and `utils` without changing unrelated features.

For scaling beyond a small deployment:

- use MongoDB Atlas as the production database instead of running MongoDB locally
- deploy the Express backend on Render using the existing `npm start` command
- host the React frontend on Vercel, Netlify, or any static hosting provider
- keep deployment settings in environment variables for MongoDB, JWT, cookies, CORS, and admin emails
- add Cloudinary later for event listing images and store the image URLs in MongoDB
- add API rate limiting later to reduce login abuse and repeated heavy requests
- use a load balancer if the backend needs to run on more than one server instance
- keep backend code modular so features such as payments, notifications, or image uploads can be added without rewriting the whole app

## Future Improvements

These are planned extension points that fit the current architecture but are not required for the current version:

- use MongoDB Atlas as the production database instead of a local MongoDB container
- deploy the backend API on Render using the existing `npm start` command
- add Cloudinary for event listing images, with image URLs stored on each event document
- extend the event create/edit form so hosts can upload photos for each listing
- add image validation for file type, file size, and allowed upload count before saving listing media
- serve optimized image variants from Cloudinary for faster event cards and detail pages

## Verification

- Backend files can be syntax-checked with `node --check` on the `backend/src` entry points
- Frontend production build may still depend on local Node/Vite permissions in your environment
