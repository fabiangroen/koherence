import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
const client = createClient({ url: process.env.DATABASE! });
export const db = drizzle({ client });
