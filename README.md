# FencingMS

FencingMS is a fencing company management app with customer pages, admin and staff login, stock tracking, order tracking, staff activity updates, fence billing calculation, and OTP verification.

## Project Structure

- `src/` and the root `package.json`: React frontend
- `backend/`: Express and MongoDB backend API
- `build/`: production frontend build output

## Tech Stack

- React
- React Router
- Express
- MongoDB with Mongoose
- Nodemailer

## Prerequisites

Install these before running the project:

- Node.js 18 or later
- npm
- MongoDB local server or MongoDB Atlas

## Environment Setup

### Frontend

1. Copy `.env.example` to `.env`.
2. Set the backend URL:

```env
REACT_APP_API_URL=http://localhost:5000
```

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Update the values for your environment:

```env
PORT=5000
CORS_ORIGIN=http://localhost:3000
MONGO_URI=mongodb://127.0.0.1:27017/fencingms
SMTP_USER=
SMTP_PASS=
```

Notes:

- `SMTP_USER` and `SMTP_PASS` are optional. If they are empty, OTP is generated in local mode and not sent by email.
- If you deploy the frontend and backend to different domains, update `CORS_ORIGIN` and `REACT_APP_API_URL` to the deployed URLs.

## Run The Project

### Backend

Open a terminal in `backend/` and run:

```bash
npm install
npm start
```

The backend runs on `http://localhost:5000` by default.

### Frontend

Open another terminal in the project root and run:

```bash
npm install
npm start
```

The frontend runs on `http://localhost:3000` by default.

## Production Build

To create the frontend production build:

```bash
npm run build
```

This creates the static frontend in `build/`.

## Deploy On Render

This project is now prepared for a single-service Render deployment where the Express backend also serves the built React frontend.

Files added for deployment:

- `render.yaml`
- `src/services/apiBaseUrl.js`

### Render Steps

1. Push this project to GitHub.
2. In Render, create a new Blueprint or Web Service from the repository.
3. Render can use the settings from `render.yaml`.
4. Add these environment variables in Render:

```env
MONGO_URI=your-mongodb-connection-string
SMTP_USER=your-email@example.com
SMTP_PASS=your-email-app-password
```

Notes:

- `SMTP_USER` and `SMTP_PASS` are optional.
- `REACT_APP_API_URL` is not required for same-domain Render deployment.
- The health check path is `/health`.

### Build And Start Commands

If you enter settings manually in Render, use:

```bash
Build Command: npm install && npm --prefix backend install && npm run build
Start Command: node backend/server.js
```

After deployment, Render will give you one public website link for the full app.

## Customer Handoff

If you want to give this project to the customer, share:

- the full project source code
- `.env.example`
- `backend/.env.example`
- this `README.md`

Do not share:

- `node_modules/`
- real `.env` files with passwords or database credentials
- temporary local files

Recommended handoff steps:

1. Zip the project folder without `node_modules/`.
2. Include this README.
3. Tell the customer to run backend first, then frontend.
4. Share any real production credentials separately and securely.

## Useful Commands

From the project root:

```bash
npm start
npm run build
npm test
```

From `backend/`:

```bash
npm start
```
