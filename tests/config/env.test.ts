import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

const originalEnv = process.env;

describe("env config", () => {
  beforeEach(() => {
    vi.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it("loads default values when env vars are not provided", async () => {
    delete process.env.NODE_ENV;
    delete process.env.PORT;
    delete process.env.DB_CLIENT;
    delete process.env.DB_HOST;
    delete process.env.DB_PORT;
    delete process.env.DB_NAME;
    delete process.env.DB_USER;
    delete process.env.DB_PASSWORD;

    const module = (await import("../../src/config/env.js")) as { env: unknown };

    expect(module.env).toEqual({
      nodeEnv: "development",
      port: 3000,
      database: {
        client: "mysql2",
        host: "db",
        port: 3306,
        name: "notes_db",
        user: "mysql",
        password: "mysql",
      },
    });
  });

  it("falls back to development for unknown NODE_ENV", async () => {
    process.env.NODE_ENV = "staging";

    const module = (await import("../../src/config/env.js")) as {
      env: { nodeEnv: string };
    };

    expect(module.env.nodeEnv).toBe("development");
  });

  it("throws when PORT is invalid", async () => {
    process.env.PORT = "invalid";

    await expect(import("../../src/config/env.js")).rejects.toThrow(
      "Environment variable PORT must be a positive integer.",
    );
  });

  it("throws when DB_PORT is invalid", async () => {
    process.env.DB_PORT = "0";

    await expect(import("../../src/config/env.js")).rejects.toThrow(
      "Environment variable DB_PORT must be a positive integer.",
    );
  });
});
