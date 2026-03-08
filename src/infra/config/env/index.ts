import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  //table with variable
  NODE_ENV: z.enum(["dev", "test", "production"]).default("dev"),
  PORT: z.coerce.number().default(3000),
  JWT_SECRET: z.string(),

  GOOGLE_CLIENT_ID: z.string(),

  DATABASE_URL: z.string(),

  REDIS_HOST: z.string().default("localhost"),
  REDIS_PORT: z.coerce.number().default(6379),
});

const _env = envSchema.safeParse(process.env); //validate variable

if (!_env.success == true) {
  throw new Error("Error in variables");
}

export const env = _env.data;
