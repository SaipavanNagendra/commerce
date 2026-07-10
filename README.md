# CommerceEdge Frontend (Auth Module)

React + TypeScript + React Query + Tailwind CSS frontend for the CommerceEdge
auth flow, wired to match the backend API spec exactly (cookie-based auth,
same field names, same error handling you already tested in Postman).

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

`VITE_API_BASE_URL` defaults to your Render backend, but you can point it at
`http://localhost:3000/api/v1` (or whatever your friend's local port is) for
local dev against his machine.

## How auth works here

The backend sets **HttpOnly cookies** (`access_token`, `refresh_token`) — the
frontend never touches them directly. Two things make this work:

1. `src/lib/axios.ts` sets `withCredentials: true` on every request, so the
   browser sends/receives those cookies automatically.
2. The backend's CORS config must allow your exact frontend origin
   (e.g. `https://commercefrontend.vercel.app`) with `credentials: true` —
   `origin: '*'` will NOT work with cookies. If auth calls succeed in Postman
   but fail with CORS errors in the browser console, this is the first thing
   to check with your friend.

## Folder structure

```
src/
  types/auth.types.ts     # All request/response shapes, matches API docs exactly
  lib/axios.ts             # Axios instance + refresh interceptor + error helpers
  lib/queryClient.ts        # React Query client config
  api/auth.api.ts            # Thin wrappers: register, login, verify-email, etc.
  api/users.api.ts             # Profile, avatar upload, sessions
  hooks/useAuth.ts               # React Query mutations for auth endpoints
  hooks/useUser.ts                 # React Query queries/mutations for /users
  context/AuthContext.tsx            # Exposes { user, isAuthenticated, isLoading }
  components/ProtectedRoute.tsx        # Redirects to /login if not authenticated
  components/FormInput.tsx               # Shared input with label + error text
  components/Button.tsx                    # Shared button with loading state
  components/ErrorAlert.tsx                  # Shared error banner
  pages/Register.tsx                           # Full registration form
  pages/VerifyEmail.tsx                          # OTP entry + 60s resend cooldown
  pages/Login.tsx                                  # Login form
  pages/ForgotPassword.tsx                           # Request reset OTP
  pages/ResetPassword.tsx                              # OTP + new password
  pages/Dashboard.tsx                                    # Profile, avatar, sessions, logout
```

## Endpoint coverage

| Endpoint | Where it's used |
|---|---|
| `POST /auth/register` | `Register.tsx` |
| `POST /auth/verify-email` | `VerifyEmail.tsx` |
| `POST /auth/login` | `Login.tsx` |
| `POST /auth/resend-otp` | `VerifyEmail.tsx`, `ResetPassword.tsx` |
| `POST /auth/forgot-password` | `ForgotPassword.tsx` |
| `POST /auth/reset-password` | `ResetPassword.tsx` |
| `POST /auth/logout` | `Dashboard.tsx` |
| `POST /auth/refresh` | automatic, via axios interceptor on any 401 |
| `GET /users/me` | `AuthContext` (drives `isAuthenticated`), `Dashboard.tsx` |
| `PATCH /users/me` | `useUpdateProfile` hook (ready to wire into an edit-profile form) |
| `POST /users/me/avatar` | `Dashboard.tsx` (click avatar to change photo) |
| `GET /users/me/sessions` | `Dashboard.tsx` |
| `DELETE /users/me/sessions/:id` | `Dashboard.tsx` (Revoke button) |

## Error handling

Every mutation catches errors and calls `getApiErrorMessage(err)` from
`lib/axios.ts`, which handles the backend's error shape — `message` can be
either a single string or an array of validation strings (like the
`resend-otp` 400 you saw earlier), and this always returns something
displayable.

`isApiErrorStatus(err, 429)` etc. lets pages branch on specific status codes
— used in `VerifyEmail.tsx` and `ResetPassword.tsx` to handle the OTP
lockout/cooldown responses specifically.

## Note on the avatar 404 you hit

The endpoint is `/users/me/avatar`, not `/users/avatar` — `usersApi.uploadAvatar`
already targets the correct path with `avatarPath` as the form-data key name.
