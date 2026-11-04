import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(
  connectionString && connectionString.startsWith("postgres")
);

function createDbInstance() {
  if (!isDatabaseConfigured) {
    return null;
  }
  const client = neon(connectionString!);
  return drizzle(client, { schema });
}

export const db = createDbInstance();
export { schema };

