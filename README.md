# NGO Volunteer Management Portal

A beginner-friendly MERN mini project for registering volunteers and managing NGO events.

## Features
- Responsive React dashboard
- Register and list volunteers
- Create and list community events
- Register a volunteer for an event
- Express REST API with MongoDB persistence
- Demo mode: if MongoDB is not configured, the API uses in-memory sample data (data resets when the server restarts)

## Tech stack
- MongoDB + Mongoose
- Express + Node.js
- React + Vite
- Plain CSS

## Requirements
Install Node.js 20+ and npm. MongoDB Atlas is recommended for online deployment.

## Run locally

### 1. Start the backend
```bash
cd server
npm install
```
Copy `.env.example` to `.env` and set `MONGODB_URI` if you have MongoDB. For local demo mode, leave it blank.
```bash
npm run dev
```
The API runs at http://localhost:5000

### 2. Start the frontend
Open a second terminal:
```bash
cd client
npm install
```
Create `client/.env` containing:
```env
VITE_API_URL=http://localhost:5000/api
```
Then run:
```bash
npm run dev
```
Open the URL printed by Vite, usually http://localhost:5173.

## API endpoints
- `GET /api/health` — API health check
- `GET /api/volunteers` — list volunteers
- `POST /api/volunteers` — add volunteer
- `GET /api/events` — list events
- `POST /api/events` — add event
- `POST /api/events/:id/register` — register a volunteer for an event

## Deploy

### MongoDB Atlas
1. Create a free cluster at https://www.mongodb.com/atlas.
2. Create a database user and allow network access for your deployment (Atlas docs explain IP access rules).
3. Copy the connection string and replace `<password>` with your database user's password.
4. Do not commit `.env` or expose your database connection string publicly.

### Backend on Render
1. Push this project to a public GitHub repository.
2. In Render, create **New > Web Service** and connect the repository.
3. Set **Root Directory** to `server`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variable `MONGODB_URI` with your Atlas connection string.
7. Add `CLIENT_URL` with your deployed Vercel frontend URL after frontend deployment (for example `https://your-project.vercel.app`).
8. Deploy. Test `https://YOUR-API.onrender.com/api/health`.

### Frontend on Vercel
1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `client`.
3. Add environment variable `VITE_API_URL` with `https://YOUR-API.onrender.com/api`.
4. Deploy and open the generated `.vercel.app` URL.
5. If you change environment variables, redeploy.

## Before submission
- Test volunteer registration and event registration on the live site.
- Ensure GitHub repository visibility is **Public**.
- Keep README, GitHub link, and live URL ready for your instructor's Google Form.
- Free hosting plans may sleep or have usage limits.

## Important limitations
This is a student demonstration, not a production-ready system. Admin routes are not protected by authentication/authorization. Do not use real sensitive volunteer information until authentication, validation, rate limiting, and privacy controls are added.
