import type { Generator } from "../utils/types";
import { addDependencies, addEnvVar, addScripts, writeProjectFile } from "../utils/fs";

const drizzleConfig = `import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL || "",
  },
});
`;

const schemaFile = `import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
`;

const dbFile = `import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/postgres";

const client = postgres(connectionString, { max: 1 });

export const db = drizzle(client, { schema });
`;

export const drizzleGenerator: Generator = {
  name: "drizzle",
  async apply(dir) {
    await addDependencies(dir, {
      "drizzle-orm": "^0.45.1",
      postgres: "^3.4.7",
    });

    await addDependencies(
      dir,
      {
        "drizzle-kit": "^0.31.8",
        dotenv: "^17.2.3",
      },
      true,
    );

    await addScripts(dir, {
      "db:generate": "drizzle-kit generate",
      "db:migrate": "drizzle-kit migrate",
      "db:studio": "drizzle-kit studio",
    });

    await addEnvVar(dir, "DATABASE_URL", "postgres://postgres:postgres@localhost:5432/postgres");

    await writeProjectFile(dir, "drizzle.config.ts", drizzleConfig);
    await writeProjectFile(dir, "src/db/schema.ts", schemaFile);
    await writeProjectFile(dir, "src/db/index.ts", dbFile);
  },
};
