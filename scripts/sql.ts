import { db } from "../src/db";

async function main() {
  const query = process.argv.slice(2).join(" ");
  if (!query) {
    console.error('Usage: tsx scripts/sql.ts "SELECT * FROM users;"');
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
