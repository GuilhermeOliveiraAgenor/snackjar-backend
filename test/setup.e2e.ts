import "dotenv/config";

import { randomUUID } from "crypto";
import { afterAll, beforeAll } from "vitest";
import { execSync } from "node:child_process";
import { PrismaClient } from "@prisma/client";
import { env } from "../src/infra/config/env";

const prisma = new PrismaClient();
const schemaId = randomUUID();

function generateUniqueDatabaseURL(schemaId: string) {
  if (!env.DATABASE_URL) {
    throw new Error("Provide a DATABASEURL environment variable");
  }
  const url = new URL(env.DATABASE_URL);

  // create schema name with UUID
  url.searchParams.set("schema", schemaId);
  return url.toString();
}

beforeAll(async () => {
  // set database url with schema UUID
  env.DATABASE_URL = generateUniqueDatabaseURL(schemaId);

  // run migration
  execSync("npx prisma migrate deploy");
});

afterAll(async () => {
  // drop schema after tests
  await prisma.$executeRawUnsafe(`DROP SCHEMA IF EXISTS "${schemaId}" CASCADE`);
  await prisma.$disconnect();
});
