import type { Generator } from "../../utils/types";
import { addDependencies, addEnvVar, addScripts, writeProjectFile } from "../../utils/fs";

const prismaSchema = `generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
}
`;

const prismaClient = `import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
`;

export const prismaGenerator: Generator = {
  name: "prisma",
  async apply(dir) {
    await addDependencies(dir, {
      "@prisma/client": "^7.2.0",
    });

    await addDependencies(
      dir,
      {
        prisma: "^7.2.0",
      },
      true,
    );

    await addScripts(dir, {
      "db:generate": "prisma generate",
      "db:migrate": "prisma migrate dev",
      "db:studio": "prisma studio",
    });

    await addEnvVar(dir, "DATABASE_URL", "file:./dev.db");

    await writeProjectFile(dir, "prisma/schema.prisma", prismaSchema);
    await writeProjectFile(dir, "src/db/index.ts", prismaClient);
  },
};
