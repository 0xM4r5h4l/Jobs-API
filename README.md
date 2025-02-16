# Jobs API

A robust and secure RESTful API for managing job postings, applications, and user authentication. Built with Node.js, Express, and MongoDB.

## Table of Contents
- [Features](#features)
- [Technologies Used](#technologies-used)
- [API Endpoints](#api-endpoints)
- [Installation](#installation)
- [Security Features](#security-features)

## Features

- **Authentication**: User registration and login with JWT (JSON Web Token).
- **Account Locking**: Dynamic account locking after a specified number of failed login attempts (configurable via `.env`).
- **Security Logging**: Detailed logs for:
  - Successful logins
  - Successful registrations
  - Account lock events
  - Locked account access attempts
- **Password Hashing**: User passwords are securely hashed using `bcrypt`.
- **Job Management**: Create, read, update, and delete job postings.
- **Security**: Protected routes, rate limiting, and sanitization against XSS attacks.
- **Logging**: Detailed logging for client and server errors.
- **Documentation**: API documentation using Swagger UI.
- **Database**: MongoDB for data storage with Mongoose for schema modeling.
- **Error Handling**: Custom error handling middleware with dedicated error classes.

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB (with Mongoose)
- **Authentication**: JSON Web Tokens (JWT)
- **Security**: Helmet, CORS, XSS protection, Express Rate Limit, Bcrypt for password hashing
- **Logging**: Custom logger for client/server errors and security events
- **Documentation**: Swagger UI

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register a new user.
- `POST /api/v1/auth/login` - Log in a user and return a JWT.

### Jobs
- `GET /api/v1/jobs` - Get all job postings (requires authentication).
- `GET /api/v1/jobs/{id}` - Get a specific job posting by ID (requires authentication).
- `POST /api/v1/jobs` - Create a new job posting (requires authentication).
- `PUT /api/v1/jobs/{id}` - Update a job posting by ID (requires authentication).
- `DELETE /api/v1/jobs/{id}` - Delete a job posting by ID (requires authentication).

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/jobs-api.git
   cd jobs-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   - Create a `.env` file in the root directory and add the following:
   ```bash
    MONGO_URI=your_mongodb_connection_string
    PORT=3000
    JWT_SECRET=your_jwt_secret_key
    JWT_LIFETIME=1d # JWT expiration time (e.g., 1d, 1h)
    # Max request per IP within 15 minutes before restiction
    RATE_LIMIT_MAX_REQUESTS=100
    LOGIN_ATTEMPT_THRESHOLD=5 # Max requests per IP in 15 minutes
    ACCOUNT_LOCK_DURATION_MINUTES=30 # Account lock duration in minutes
    LOG_CLIENT_ERRORS=1 # Enable client error logging (1 = true, 0 = false)
   ```
4. Configure CSP (Content Security Policy):
    - Open the `app.js` file.
    - Locate the following block of code:
    ```javascript
    /* helmet csp settings replace 127.0.0.1:3000 -> with ur server domain/ip
        app.use(
            helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", 'http://127.0.0.1:3000'],
                scriptSrc: ["'self'", "cdn.jsdelivr.net"], // if you load scripts from a cdn.
            }
            }))
    */
    ```
    - Replace `http://127.0.0.1:3000` with your server's domain or IP address and port.
    - Example:
    ```javascript
    app.use(
        helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", 'https://your-domain.com'], // Replace with your domain
            scriptSrc: ["'self'", "cdn.jsdelivr.net"], // If you load scripts from a CDN
        }
        }));
    ```
5. Run the server:
    ```bash
    npm start <dev/production>
    ```
6. Access the API:
    - Base URL: `http://localhost:3000`
    - Swagger UI: `http://localhost:3000/api-docs`

## Security Features

- **Account Locking**: Accounts are locked for `ACCOUNT_LOCK_DURATION_MINUTES` minutes after `LOGIN_ATTEMPT_THRESHOLD` failed login attempts.
- **Password Hashing**: Passwords are hashed with `bcrypt` before storage.
- **Rate Limiting**: Restrict requests to RATE_LIMIT_MAX_REQUESTS per IP within 15 minutes.
- **CSP**: Configured via Helmet to restrict resources to trusted domains.
- **Security Logging**: Track critical security events (logins, registrations, lockouts).
