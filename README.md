# Document Request System

A full-stack document request system with role-based access control (RBAC), built with:

- **Backend:** Node.js, Express, TypeScript, Firebase Admin, JWT auth
- **Frontend:** Angular 17, Tailwind-style UI, RxJS, HTTP interceptor auth
- **Database/Auth:** Firebase Firestore and service account credentials

## Features

- User registration and login
- Role-based access control for `user` and `admin`
- Users can create document requests and upload supporting files
- Admins can view all requests, update status, and delete requests
- Document type management for admin users
- Dashboard and request listing with pagination and filters
- Firebase-backed data persistence

## Repository structure

```
backend/          # Express API server with Firebase integration
frontend/         # Angular frontend app
```

## Getting started

### 1. Backend setup

1. Install dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Configure environment variables in `backend/.env`:
   ```env
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=your-service-account-email
   ADMIN_REGISTRATION_SECRET=your-admin-secret
   ```

3. Provide Firebase credentials

- Option A: Use Firebase env vars shown above.
- Option B: Place a service account JSON file at `backend/service-account-key.json` or `backend/serviceAccountKey.json`.

4. Seed initial document types:
   ```bash
   npm run setup
   ```

5. Build and run the backend:
   ```bash
   npm run build
   npm start
   ```

6. For development with live reload:
   ```bash
   npm run dev
   ```

### 2. Frontend setup

1. Install dependencies:
   ```bash
   cd frontend/frontend-app
   npm install
   ```

2. Start the Angular development server:
   ```bash
   npm start
   ```

3. Open the app in your browser:
   ```text
   http://localhost:4200
   ```

## Authentication and RBAC

- Regular users can register and submit document requests.
- Admins register using the `Admin Registration Secret`.
- Admins have access to `admin/requests` and document type management.
- The backend uses JWT tokens and `authorize` middleware to enforce role permissions.

## API endpoints

### Auth

- `POST /api/auth/register` - Register a new user or admin
- `POST /api/auth/login` - Login and receive a JWT token
- `GET /api/auth/profile` - Get authenticated user profile
- `PUT /api/auth/profile` - Update user profile

### Documents

- `GET /api/documents/types` - List document types
- `GET /api/documents/types/:id` - Get one document type
- `POST /api/documents/types` - Create a document type (admin only)
- `PUT /api/documents/types/:id` - Update a document type (admin only)
- `DELETE /api/documents/types/:id` - Delete a document type (admin only)
- `POST /api/documents/requests` - Submit a document request
- `GET /api/documents/requests` - List requests (user sees own, admin sees all)
- `GET /api/documents/requests/:id` - Get request details
- `POST /api/documents/requests/:id/upload` - Upload supporting file
- `PATCH /api/documents/requests/:id/status` - Update request status (admin only)
- `DELETE /api/documents/requests/:id` - Delete request (admin only)

## Notes

- The backend includes Firebase initialization and a route-based auth guard.
- Make sure the Firebase private key in `.env` is correctly escaped, with `\n` for newline markers.
- If the app reports credential parsing issues, prefer using a `service-account-key.json` file.

## Troubleshooting

- If the backend fails to start, verify `backend/.env` and Firebase credentials.
- If the frontend does not authenticate, check that the backend is running and the token is stored in `localStorage`.

## License

This project is provided as-is for development and testing.
