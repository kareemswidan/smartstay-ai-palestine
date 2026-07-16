# Authentication and authorization

## Authentication

- Passwords are derived with PBKDF2-SHA-256, a unique random salt, and 100,000 iterations.
- A successful login creates a random session token. Only its SHA-256 hash is stored in D1.
- The browser receives the raw token in an `HttpOnly`, `SameSite=Lax` cookie. Production cookies are also marked `Secure`.
- Sessions have an explicit expiry and logout deletes the server-side session record.

## Roles

| Role | Main access |
| --- | --- |
| Customer | Own bookings, trips, and saved stays |
| Owner | Own properties, images, availability, and bookings for owned properties |
| Admin | Platform overview, user directory, and property moderation |

Route handlers do not trust the interface to enforce access. They call `getCurrentUser` or `requireRole`, and ownership-sensitive queries include the authenticated user ID. Property updates reject owners who do not own the target record; admin-only moderation is checked again on the server.

## Abuse and data controls

- Registration only accepts supported public roles; administrator accounts are seeded outside public registration.
- Upload endpoints require an owner/admin session and store binary files separately from relational records.
- Booking creation validates dates and capacity, limits a single booking range, and returns HTTP 409 for a collision.
- Tests assert session-cookie flags, role-aware registration, R2 upload usage, and the database uniqueness protection.

## Demo accounts

Local/demo data seeds one account per role:

| Role | Email | Password |
| --- | --- | --- |
| Customer | `customer@smartstay.ps` | `Customer2026!` |
| Owner | `owner@smartstay.ps` | `Owner2026!` |
| Admin | `admin@smartstay.ps` | `Admin2026!` |

These credentials are for the public demonstration only and must not be reused for real services.
