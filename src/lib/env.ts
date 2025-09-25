import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.string().optional(),
  PORT: z.coerce.number().positive().int().optional().default(3000),
  CORS_ORIGINS: z.string().optional().default("*"),
  BETTER_AUTH_DB_SERVER: z.string(),
  BETTER_AUTH_DB_USER: z.string(),
  BETTER_AUTH_DB_PASSWORD: z.string(),
  BETTER_AUTH_DB_NAME: z.string(),
  BETTER_AUTH_SECRET: z.string(),
  BETTER_AUTH_DB_SSL: z.string().optional(),
  BETTER_AUTH_DB_PORT: z.coerce
    .number()
    .positive()
    .int()
    .optional()
    .default(5432),
  GOOGLE_SERVICE_ACCOUNT_JSON: z.string(),
});

export const env = envSchema.parse(process.env);
