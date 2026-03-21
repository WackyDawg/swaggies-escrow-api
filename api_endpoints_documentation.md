# Swaggies API Documentation

This document outlines the exposed API endpoints through the **API Gateway** (`http://localhost:3000`), breaking down the required path parameters, headers, and request body structures.

## Authentication Endpoints (`/api/v1/auth`)

### 1. Register User

- **URL:** `/api/v1/auth/auth-register`
- **Method:** `POST`
- **Required Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "Jane Doe",
    "swag_id": "jane123",
    "bvn": "12345678901",
    "dateOfBirth": "1990-01-01"
  }
  ```

### 2. Verify Account

- **URL:** `/api/v1/auth/auth-verify`
- **Method:** `POST`
- **Required Body:**
  ```json
  {
    "code": "123456"
  }
  ```

### 3. Login

- **URL:** `/api/v1/auth/auth-login`
- **Method:** `POST`
- **Required Body:**
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```

### 4. Logout

- **URL:** `/api/v1/auth/auth-logout`
- **Method:** `POST`
- **Required Body:**
  ```json
  {
    "id": "USER_ID"
  }
  ```

### 5. Forgot Password

- **URL:** `/api/v1/auth/auth-forgot-pasword` _(Note the spelling in the route)_
- **Method:** `POST`
- **Required Body:**
  ```json
  {
    "email": "user@example.com"
  }
  ```

### 6. Reset Password

- **URL:** `/api/v1/auth/auth-reset-password`
- **Method:** `POST`
- **Required Body:**
  ```json
  {
    "resetToken": "your-reset-token-here",
    "password": "newsecurepassword"
  }
  ```

---

## User Endpoints (`/api/v1/users`)

All User endpoints require an **Authorization Header** (`Bearer <token>`).

### 1. Get Account Profile

- **URL:** `/api/v1/users/auth-account`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`

### 2. Update Profile

- **URL:** `/api/v1/users/auth-update-profile`
- **Method:** `PATCH`
- **Headers:** `Authorization: Bearer <token>`
- **Required Body:**
  Contains the profile fields that need to be updated (e.g., `phone`, `address`, etc.)
  ```json
  {
    "name": "Jane Updated"
  }
  ```

### 3. Set/Change PIN

- **URL:** `/api/v1/users/auth-set-pin`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Required Body:**
  Contains the PIN data logic (such as new PIN assignment).
  ```json
  {
    "pin": "1234"
  }
  ```

---

## User Wallet Endpoints (`/api/v1/user-wallet`)

All Wallet endpoints require an **Authorization Header** (`Bearer <token>`).

### 1. Get Wallet Balance

- **URL:** `/api/v1/user-wallet/wallet-balance/:accountNumber`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`
- **Path Parameters:**
  - `accountNumber` (The wallet's account string)

### 2. Get Wallet Transactions

- **URL:** `/api/v1/user-wallet/wallet-transactions`
- **Method:** `GET`
- **Headers:** `Authorization: Bearer <token>`

### 3. Initiate Transfer

- **URL:** `/api/v1/user-wallet/wallet-transfer`
- **Method:** `POST`
- **Headers:** `Authorization: Bearer <token>`
- **Required Body:**
  ```json
  {
    "amount": 5000,
    "reference": "txn-unique-ref",
    "narration": "Payment for services",
    "destinationBankCode": "044",
    "destinationAccountNumber": "0123456789",
    "currency": "NGN",
    "sourceAccountNumber": "9876543210",
    "senderInfo": "Jane Doe",
    "transfer_type": "external"
  }
  ```

---

## System / Health Endpoints

These endpoints are exposed for basic monitoring / container checks.

- **GET `/`**: Returns an API Greeting `{"message": "Swaggies API v1"}`
- **GET `/health`**: Returns the health status of the services and databases `{"status":"ok", "database":"available", ...}`
- **GET `/ping`**: Returns simple pong response `{"status":"OK", "service":"api-gateway"}`
- **GET `/metrics`**: Returns Prometheus instrumentation metrics.
