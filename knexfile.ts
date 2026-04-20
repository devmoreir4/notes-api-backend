import path from "node:path";
import type { Knex } from "knex";
import { env } from "./src/config/env";

type AppEnvironment = "development" | "production" | "test";

const sharedConfig: Knex.Config = {
  client: env.database.client,
  connection: {
    host: env.database.host,
    port: env.database.port,
    user: env.database.user,
    password: env.database.password,
    database: env.database.name,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    directory: path.resolve(__dirname, "src", "database", "migrations"),
    tableName: "knex_migrations",
    loadExtensions: [".js", ".ts"],
  },
  asyncStackTraces: env.nodeEnv !== "production",
};

const config: Record<AppEnvironment, Knex.Config> = {
  development: sharedConfig,
  production: sharedConfig,
  test: sharedConfig,
};

export = config;
