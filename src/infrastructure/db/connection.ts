import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import "dotenv/config";

const client = postgres(process.env.DATABASE_URL!, {
  transform: postgres.camel,
  connection: {
    TimeZone: "UTC",
  },
});

export const db = drizzle(client);
