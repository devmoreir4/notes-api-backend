# Notes API

Simple notes API with TypeScript, Express, Knex, MySQL, separated services/controllers, and unit tests with Vitest.

## Tech Stack

- Node.js 20+
- TypeScript
- Express
- Knex (Query Builder)
- MySQL
- Docker & Docker Compose
- Prettier
- Vitest (unit tests)

## API Endpoints

| Method   | Route                                        | Description                                       |
| -------- | -------------------------------------------- | ------------------------------------------------- |
| `GET`    | `/`                                          | Returns service metadata                          |
| `GET`    | `/health`                                    | Health check route (status and uptime)            |
| `POST`   | `/users`                                     | Creates a new user                                |
| `PUT`    | `/users/:id`                                 | Updates an existing user                          |
| `GET`    | `/users/:id`                                 | Fetches a user by ID                              |
| `DELETE` | `/users/:id`                                 | Deletes a user                                    |
| `GET`    | `/notes?user_id=1&title=foo&tags=work,study` | Lists/filters a user's notes                      |
| `POST`   | `/notes/:user_id`                            | Creates a note for a user                         |
| `GET`    | `/notes/:id`                                 | Fetches a note (includes attached tags and links) |
| `DELETE` | `/notes/:id`                                 | Deletes a note                                    |
| `GET`    | `/tags/:user_id`                             | Lists a user's tags                               |

## Environment Variables

Create a `.env` file at the root of the project. If you run with Docker, keep `DB_HOST=db`, because that is the database service name inside Docker Compose:

```env
NODE_ENV=development
PORT=3000
DB_CLIENT=mysql2
DB_HOST=db
DB_PORT=3306
DB_NAME=notes_db
DB_USER=mysql
DB_PASSWORD=mysql
DB_ROOT_PASSWORD=root
```

## How to run with Docker

1. If you wish to run local commands such as tests or build, install the dependencies:

   ```bash
   npm install
   ```

2. Start the API and MySQL with Docker Compose:

   ```bash
   docker compose -f docker/compose.yml up --build
   ```

The API runs database migrations automatically on startup (`api-entrypoint.sh`) and waits for MySQL to become healthy before proceeding.

## Available Scripts

If you prefer to inspect or run locally (outside or in parallel with Docker), `package.json` has the following commands:

- `npm run dev`: runs the API in development mode with watch
- `npm run build`: compiles the TypeScript code to the `dist/` folder
- `npm run start`: runs the compiled server for the production environment
- `npm run typecheck`: validates TS type checking without generating output
- `npm run format`: automatically formats the codebase with Prettier
- `npm run format:check`: only checks for formatting issues
- `npm run test`: runs automated tests in watch mode (Vitest)
- `npm run test:run`: runs the tests once with coverage reports
- `npm run check`: checks formatting, tests, and finally attempts to build
- `npm run migrate:latest`: runs the migrations locally from the source code
- `npm run migrate:rollback`: undoes the last run migration

## Project Direction

- Database: MySQL
- Tests: unit tests only
- Lint: not included

## License

MIT
