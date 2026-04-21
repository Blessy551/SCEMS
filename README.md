# SCEMS

Smart Campus Event Management System for VNRVJIET, built with React, Express, and MySQL.

## Tech Stack

- Frontend: React, Vite, React Router, Axios, React Big Calendar
- Backend: Node.js, Express, MySQL2, JWT, bcryptjs
- Database: MySQL

## Setup

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd frontend
npm install
```

## Database

Run these files in MySQL:

```bash
db/schema.sql
db/seed.sql
```

## Environment

Copy `backend/.env.example` to `backend/.env` and set your local MySQL password and email credentials.

## Run

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Demo Logins

All seeded accounts use password `admin123`.

- Principal: `principal@vnrvjiet.in`
- HOD: `hod.cse@vnrvjiet.in`
- Organiser: `blessy@vnrvjiet.in`
