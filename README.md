# Real-Time Expert Session Booking System

A full-stack web application designed for booking expert sessions in real-time. Built with React, Node.js, Express, and MongoDB.

## Features

- **Expert Listing**: Browse experts with dynamic search and category filtering, complete with pagination.
- **Expert Details**: View comprehensive expert profiles and their available time slots.
- **Real-Time Booking**: Time slots are managed using Socket.io to instantly update availability across all connected clients, effectively preventing double bookings.
- **Manage Bookings**: Users can easily track and view their session bookings using their email address.

## Tech Stack

- **Frontend**: React (Vite), TypeScript, Tailwind CSS, React Router, Lucide Icons, Socket.io Client
- **Backend**: Node.js, Express, TypeScript, Socket.io
- **Database**: MongoDB (Mongoose). It includes `mongodb-memory-server` for seamless local testing without needing a MongoDB instance running locally.

## Development Setup

### 1. Install Dependencies
Make sure you have Node.js installed. Then, run:
```bash
npm install
```

### 2. Environment Variables
By default, the application will automatically spin up an **In-Memory MongoDB server** and seed it with dummy data if you don't provide a database URI.

If you wish to connect to a real MongoDB cluster (like MongoDB Atlas), create a `.env` file in the root directory based on `.env.example`:
```env
MONGODB_URI="mongodb+srv://<username>:<password>@cluster.mongodb.net/mydb"
```

### 3. Run the Development Server
Start the full-stack application (frontend + backend) simultaneously by running:
```bash
npm run dev
```

### 4. Open the App
The application will be accessible at `http://localhost:3000`.

## Project Structure

- `/src`: Contains the React frontend application (Pages, App Router, Tailwind CSS).
- `/server`: Contains the Express backend API, MongoDB schemas/models, Controllers, and Socket.io setup.
- `/server/database.ts`: Handles the database connection and seeds initial dummy experts if starting fresh.

## API Endpoints

- `GET /api/experts` - Fetch experts (Query params: `name`, `category`, `page`, `limit`)
- `GET /api/experts/:id` - Fetch details for a specific expert
- `POST /api/bookings` - Create a new booking session
- `PATCH /api/bookings/:id/status` - Update booking status (`Pending`, `Confirmed`, `Completed`)
- `GET /api/bookings?email={email}` - Fetch bookings filtering by user's email
