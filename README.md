# PlanTogether

PlanTogether is a full-stack event management web application built with React, FastAPI, and MongoDB. It lets users register, log in with JWT auth, create and manage their own events, and explore upcoming events through a responsive dark UI.

## Stack

- Frontend: React, Vite, React Router, Axios, Context API, Tailwind CSS
- Backend: FastAPI, Motor, MongoDB, PyJWT, Bcrypt

## Features

- User registration and login
- JWT-based persistent authentication
- Create, edit, delete, and view events
- Search by title, description, or location
- Filter by Music, Tech, Sports, Art, Food, and Business
- Personal dashboard for events created by the logged-in user
- Responsive dark interface with empty states and live refresh after changes

## Project structure

```text
plantogether/
├── backend/
│   ├── app/
│   │   ├── models/
│   │   ├── routes/
│   │   └── utils/
│   ├── requirements.txt
│   └── server.py
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── context/
│   │   ├── data/
│   │   ├── pages/
│   │   └── utils/
│   └── package.json
└── README.md
```

## Backend setup

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

## Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend environment variables are defined in `frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:8001
```

## API endpoints

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

## Notes

- `GET /api/events` supports `search` and `category` query params.
- Event creation and updates only allow future date/time values.
- Edit and delete operations are restricted to the original event creator.
