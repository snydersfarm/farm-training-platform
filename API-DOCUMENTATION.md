# Farm Training Platform API Documentation

This document outlines all available API endpoints in the Farm Training Platform.

## Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-production-domain.com/api`

## Authentication

Most endpoints require authentication using NextAuth.js. Authentication is handled via sessions and JWT tokens. Protected endpoints will return a 401 Unauthorized status if called without a valid session.

## API Endpoints

### Health Check

#### GET `/api/health`

Check the health status of the application and database connection.

**Response:**
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2023-05-15T10:30:45.123Z"
}
```

**Status Codes:**
- 200: System is healthy
- 503: Database is disconnected
- 500: Other errors

### Authentication

#### POST `/api/auth/signin`

NextAuth.js endpoint for signing in users. This endpoint is handled by the NextAuth.js library.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "callbackUrl": "/dashboard"
}
```

**Response:**
Redirects to the callbackUrl on success or to the error page on failure.

#### GET `/api/auth/signout`

NextAuth.js endpoint for signing out users. This endpoint is handled by the NextAuth.js library.

**Response:**
Redirects to the homepage or specified URL after signing out.

#### GET `/api/auth/session`

NextAuth.js endpoint for getting the current session. This endpoint is handled by the NextAuth.js library.

**Response:**
```json
{
  "user": {
    "id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "image": "https://example.com/image.jpg",
    "role": "USER",
    "emailVerified": true
  },
  "expires": "2023-06-15T10:30:45.123Z"
}
```

### Email Verification

#### POST `/api/auth/verify-email/send`

Send a verification email to the currently authenticated user.

**Request Body:**
```json
{
  "continueUrl": "/dashboard" // Optional
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Email sent successfully
- 401: Authentication required
- 500: Failed to send email

#### POST `/api/auth/verify-email/confirm`

Confirm email verification using the action code from the verification email.

**Request Body:**
```json
{
  "actionCode": "verification_code_from_email"
}
```

**Response:**
```json
{
  "success": true
}
```

**Status Codes:**
- 200: Email verified successfully
- 400: Invalid verification code
- 500: Verification failed

## Error Responses

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message describing what went wrong"
}
```

## API Usage Examples

### Sending a Verification Email

```javascript
const sendVerificationEmail = async () => {
  try {
    const response = await fetch('/api/auth/verify-email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        continueUrl: '/dashboard',
      }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Failed to send verification email');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

### Confirming Email Verification

```javascript
const confirmEmailVerification = async (actionCode) => {
  try {
    const response = await fetch('/api/auth/verify-email/confirm', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ actionCode }),
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'Email verification failed');
    }
    
    return data;
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};
```

## Rate Limiting

API endpoints may be subject to rate limiting to prevent abuse. Exceeding rate limits will result in a 429 Too Many Requests response. 