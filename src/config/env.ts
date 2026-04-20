import { config } from "dotenv";

config();

type NodeEnvironment = "development" | "production" | "test";

const validEnvironments = new Set<NodeEnvironment>(["development", "production", "test"]);

function getRequiredEnv(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getNumberEnv(name: string, fallback: number): number {
  const rawValue = process.env[name];
  const value = Number(rawValue ?? fallback);

  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`Environment variable ${name} must be a positive integer.`);
  }

  return value;
}

const rawNodeEnv = process.env.NODE_ENV ?? "development";

export const env = {
  nodeEnv: (validEnvironments.has(rawNodeEnv as NodeEnvironment)
    ? rawNodeEnv
    : "development") as NodeEnvironment,
  port: getNumberEnv("PORT", 3000),
  database: {
    client: getRequiredEnv("DB_CLIENT", "mysql2"),
    host: getRequiredEnv("DB_HOST", "db"),
    port: getNumberEnv("DB_PORT", 3306),
    name: getRequiredEnv("DB_NAME", "notes_db"),
    user: getRequiredEnv("DB_USER", "mysql"),
    password: getRequiredEnv("DB_PASSWORD", "mysql"),
  },
} as const;
