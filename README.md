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




