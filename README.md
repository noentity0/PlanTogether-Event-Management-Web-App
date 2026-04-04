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

- FastAPI
- Motor
- MongoDB
- PyJWT
- Bcrypt

## Main Features

### 1. Authentication

Users can register and log in securely.

Implemented with:

- JWT-based authentication
- hashed passwords using Bcrypt
- persistent login using local storage
- backend token verification on app load

Additional behavior:

- registration now asks for both `name` and `email`
- the user `name` is shown in profile, navbar, host information, and comments
- older users without a saved name are handled with a safe fallback derived from email

### 2. Create, Edit, and Delete Events

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

### 3. Upcoming Event Discovery

The `Home` and `Explore` pages are focused on future events.

Implemented with:

- backend filtering using `starts_at >= current time`
- sorted upcoming events
- shared event fetching through the React event context

### 4. Search and Category Filtering

Users can search and filter upcoming events.

Implemented with:

- backend text search on title, description, and location
- frontend debounce while typing
- category filter support for:
  Music, Tech, Sports, Art, Food, Business

### 5. Registration System

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

### 6. Capacity Tracking

Each event can optionally have a maximum number of attendees.

Implemented with:

- optional `capacity` field in the event form
- backend validation for the capacity value
- backend protection against reducing capacity below already registered attendees
- frontend display of remaining spots

### 7. Save / Bookmark Events

Users can save events for later.

Implemented with:

- save endpoint
- unsave endpoint
- saved count on event cards and event details
- dedicated `Saved events` section in the user profile

### 8. Comment System

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

### 9. Profile Page

Each logged-in user has a profile page that collects their event activity.

Implemented with:

- created events section
- registered events section
- saved events section
- quick profile stats
- next hosted event summary
- next attending event summary

### 10. Host Information

Event host details are shown using the user’s `name` instead of relying only on email.

Implemented with:

- storing `created_by_name` on events
- returning host information in event API responses
- displaying the host name on cards and detail pages

### 11. Event Detail Experience

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

### 12. Share Event

Users can share an event from the event details page.

Implemented with:

- Web Share API when available
- clipboard fallback when native share is not available

## Feature Behavior Summary

Some features are important to explain clearly because the behavior is not obvious just by looking at the UI:

- Only the original creator can edit or delete an event.
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
|   |-- app/
|   |   |-- models/
|   |   |-- routes/
|   |   `-- utils/
|   |-- requirements.txt
|   `-- server.py
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
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

Backend environment variables are defined in `backend/.env`:

```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=plantogether_db
JWT_SECRET_KEY=change-me-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRE_MINUTES=1440
FRONTEND_URL=http://localhost:5173
```

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

## Notes

- `GET /api/events` supports `search`, `category`, and `include_past` query params.
- Home and Explore currently show future events by default.
- Existing older users and events are handled with serializer fallbacks where possible.

## Verification

- Backend Python modules were syntax-checked with `python -m compileall backend/app`
- Frontend production build could not be completed inside the current sandbox because Vite/esbuild failed with `spawn EPERM`
