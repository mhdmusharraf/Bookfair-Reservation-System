# Bookfair Reservation System

This repository contains the Spring Boot backend and two Vite/React front-end portals (employee and vendor) for managing reservations for a book fair.

## Project structure
- `book_fair_backend/` – Spring Boot REST API and persistence layer.
- `bookfair-employee/` – Employee-facing React application.
- `bookfair-vendor/` – Vendor-facing React application.

## Prerequisites
Make sure the following tools are installed locally:
- **Java 21** and **Maven** (the project ships with the Maven wrapper so a global Maven install is optional).
- **Node.js 18+** and **npm** for the React front-ends.
- **PostgreSQL** running locally with a database that matches your configuration.

## Backend setup (`book_fair_backend`)
1. Copy `book_fair_backend/src/main/resources/application.yml` and update the database connection, mail, and other environment-specific properties as needed (defaults point at a local PostgreSQL database named `book_fair`).
2. Ensure the configured PostgreSQL database is running and accessible.
3. From the `book_fair_backend` directory, start the API:
   ```bash
   cd book_fair_backend
   ./mvnw spring-boot:run
   ```
   On Windows, use `mvnw.cmd spring-boot:run`.
4. The backend will listen on `http://localhost:8080` by default.

## Front-end setup
Both front-ends are Vite applications that expect the API base URL to be provided through the `VITE_API_BASE_URL` environment variable.

### Employee portal (`bookfair-employee`)
1. Install dependencies (only required the first time):
   ```bash
   cd bookfair-employee
   npm install
   ```
2. Provide the API base URL, e.g. create a `.env.local` file containing `VITE_API_BASE_URL=http://localhost:8080`.
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Vite will print the local URL (typically `http://localhost:5173`) where you can access the employee portal.

### Vendor portal (`bookfair-vendor`)
1. Install dependencies:
   ```bash
   cd bookfair-vendor
   npm install
   ```
2. Provide the API base URL (for example via `.env.local` with `VITE_API_BASE_URL=http://localhost:8080`).
3. Launch the development server:
   ```bash
   npm run dev
   ```
4. Access the vendor portal at the Vite URL shown in the terminal (defaults to `http://localhost:5173`, or another free port if already in use).

## Production builds
To produce optimized assets run `npm run build` inside each front-end directory. The backend can be packaged with `./mvnw clean package` which generates a runnable JAR in `book_fair_backend/target`.

