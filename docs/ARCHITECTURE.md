# SmartStay architecture

SmartStay is a bilingual marketplace deployed as a Next.js application on Cloudflare. The same codebase renders the public product and the customer, property-owner, and administrator portals.

## Request flow

```text
Browser
  -> Next.js pages and server components
  -> Route handlers under app/api
  -> authentication and business services under lib/server
  -> Cloudflare D1 (relational records) and R2 (property images)
```

## Main boundaries

- `app/`: product pages, dashboards, and API route handlers.
- `components/`: bilingual UI, navigation, dashboard shells, and reusable interactions.
- `lib/server/auth.ts`: password verification, session creation, current-user lookup, and role checks.
- `lib/server/db.ts`: D1 schema bootstrap and demo data.
- `db/schema.ts`: typed Drizzle representation of the relational model.
- `migrations-smartstay/`: versioned database migrations, including booking-slot constraints.

## Data model

```text
User 1---* Session
User 1---* Property (owner)
Property 1---* PropertyImage
Property 1---* Booking
Booking 1---* BookingSlot
User 1---* Booking (customer)
```

Booking availability is protected in two layers. The API checks for existing slots before insertion, while the unique database index on `(property_id, slot_key)` provides the final concurrency guard. If another request wins the same slot, the API rolls back the booking and returns a conflict response.

## Storage decisions

- D1 keeps accounts, sessions, properties, bookings, favorites, and indexed booking slots in one transactional relational store.
- R2 stores uploaded property images; D1 stores their public object URLs and ordering metadata.
- Drizzle documents the schema and produces migrations, while prepared D1 statements keep route handlers explicit.

## Deployment

The repository includes a GitHub Actions verification workflow and a Docker development image. Production bindings are declared in `.openai/hosting.json`; secrets are supplied by the hosting environment rather than committed to source control.
