# Notes API

A notes REST API built with Node.js and TypeScript for managing users, notes, and tags, with MySQL persistence and Knex migrations.

## Tech Stack

- **Node.js 20+**: Runtime JavaScript
- **TypeScript**: Static typing and code safety
- **Express**: API HTTP layer
- **Knex**: Query builder and migrations
- **MySQL 8**: Relational database
- **Docker and Docker Compose**: Containerized environment
- **Vitest**: Unit tests
- **Prettier**: Code formatting

## Prerequisites

- Docker
- Docker Compose

## Running with Docker

```bash
# Create and fill in your .env file
cp .env.example .env

# Run
docker compose -f docker/compose.yml up --build
```

The API will be available on port **3000** and MySQL on port **3306**.

## API

- **`GET /`**: Returns service metadata (name, version, and status)
- **`GET /health`**: Application status and uptime
- **`POST /users`**: Creates a user
- **`PUT /users/:id`**: Updates an existing user
- **`GET /users/:id`**: Fetches a user by ID
- **`DELETE /users/:id`**: Deletes a user
- **`GET /notes?user_id=1&title=foo&tags=work,study`**: Lists and filters a user's notes
- **`POST /notes/:user_id`**: Creates a note for a user
- **`GET /notes/:id`**: Fetches a note by ID (with tags and links)
- **`DELETE /notes/:id`**: Deletes a note
- **`GET /tags/:user_id`**: Lists a user's tags

## Running Tests

```bash
npm run test:run
```

## License

MIT
