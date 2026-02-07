# Budget Tracker (MERN-Stack)

A full‑stack budget tracker I built to push myself beyond frontend‑only React. I started knowing basic React with `useState` and `useEffect`, then learned Express and middleware, connected a database, and wired everything together end‑to‑end.

## What I Learned 
- How to build an API with Express instead of just a UI.
- How middleware works by writing an auth middleware that protects routes.
- How to connect MongoDB with Mongoose and keep data scoped per user.
- How to connect a React frontend to a real backend and handle tokens.
- The basics of authentication: hashing passwords and validating JWTs.

## Structure
- The frontend is React (Vite + React Router) and renders auth pages and a dashboard.
- The backend is Express with MongoDB/Mongoose models for users and transactions.
- When a user registers or logs in, the backend creates a JWT and sends it back.
- The frontend stores that token in localStorage and sends it in every request:
  `Authorization: Bearer <token>`.
- An auth middleware verifies the token on protected routes, attaches `req.user`,
  and blocks requests if the token is missing or invalid.
- Every transaction query is filtered by `userId`, so users only see their own data.

## Core Features
- Register/login with bcrypt + JWT
- Protected dashboard and transactions
- Create/update/delete transactions
- Dashboard totals (income, expenses, balance)
- Filters by month/type/category
- Charts: pie (category expenses) + bar (monthly income vs expense)
- Responsive UI with modal forms

## API Overview
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Transactions (JWT required)
- `POST /api/transactions`
- `GET /api/transactions?month=YYYY-MM&type=income|expense&category=...`
- `PUT /api/transactions/:id`
- `DELETE /api/transactions/:id`

### Dashboard (JWT required)
- `GET /api/dashboard/summary`
- `GET /api/dashboard/pie-chart`
- `GET /api/dashboard/bar-chart?year=YYYY`

## Project Structure
```
Backend/
  src/
    controllers/
    models/
    routes/
    Middleware/
    config/
Frontend/
  src/
    components/
    pages/
    services/
    styles/
```

## How to Run Locally
### Backend
```
cd Backend
npm install
npm run dev
```

Create a `.env` file in `Backend/`:
```
MONGODB_URI=your_mongo_uri
JWT_SECRET=your_secret
PORT=8000
```

### Frontend
```
cd Frontend
npm install
npm run dev
```

The frontend uses a Vite proxy to call `/api` → `http://localhost:8000`.

## How Authentication Works (Quick Summary)
1. User logs in → backend checks the password with bcrypt.
2. Backend signs a JWT and returns it.
3. Frontend stores the token and includes it in API requests.
4. Middleware validates the token and attaches the user to the request.

## Future Improvements
- Add tests (unit + integration)
- Add API‑level pagination
- Improve empty states and error UI
- Deploy (Render + Netlify)

---
If you’re a recruiter or mentor, feel free to ask about the architecture — I can walk through the API, auth flow, and data model decisions in detail.