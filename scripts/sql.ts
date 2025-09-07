import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { db } from "../src/db";

async function main() {
  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error('Usage: tsx scripts/sql.ts "SELECT * FROM users;"');
    process.exit(1);
  }

  // Safety opt-in so this can't accidentally run on CI or on a machine without explicit permission
  if (process.env.ALLOW_LOCAL_SQL !== "1") {
    console.error(
      "Refusing to run. Set ALLOW_LOCAL_SQL=1 in environment to allow running ad-hoc SQL.",
    );
    process.exit(1);
  }

  try {
    const res = await (db as any).run(query); // drizzle client exposes .run for raw SQL
    // If result has toJSON (libsql) print it prettily
    if (res?.toJSON) {
      console.log(JSON.stringify(res.toJSON(), null, 2));
    } else {
      console.log(res);
    }
  } catch (err) {
    console.error(
      "Query error:",
      err instanceof Error ? err.message : String(err),
    );
    process.exit(2);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(3);
});
