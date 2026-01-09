# Power Abo Backend Server

This is the backend server for the Power Abo application, built with Node.js and Express.

## Requirements

- Node.js (v14 or higher)
- npm

## Installation

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file (optional, defaults provided):
   ```
   PORT=3000
   NODE_ENV=development
   ```

## Available Scripts

- `npm start`: Runs the server in production mode
- `npm run dev`: Runs the server in development mode with nodemon (auto-restart on changes)

## API Endpoints

Base URL: `http://localhost:3000/api/v1`

- `GET /health`: Check server status
- `GET /test`: Test endpoint

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port number for the server | 3000 |
| NODE_ENV | Environment mode (development/production) | development |

## Structure

- `src/server.js`: Entry point
- `src/app.js`: Express app configuration
- `src/routes`: API route definitions
- `src/controllers`: Request handlers
- `src/middleware`: Express middleware (logging, error handling, etc.)
