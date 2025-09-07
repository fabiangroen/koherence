import { auth } from "@/auth";
import { db } from "@/db";
import { users as usersTable } from "@/db/schema";
import UsersTableClient from "./users-table-client";

export default async function UsersTable() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">Authentication required</p>
      </div>
    );
  }

  const users = await db.select().from(usersTable);

  return <UsersTableClient users={users} />;
}
