import { auth } from "@/auth";
import { db } from "@/db";
import { devices, deviceAccess, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const deviceId = params.id;
  if (!deviceId)
    return Response.json({ error: "Device not found" }, { status: 404 });

  try {
    // Ensure requester has access (is in deviceAccess)
    const access = await db
      .select({ userId: deviceAccess.userId })
      .from(deviceAccess)
      .where(
        and(
          eq(deviceAccess.deviceId, deviceId),
          eq(deviceAccess.userId, session.user.id!),
        ),
      );
    if (access.length === 0) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    const list = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
        ownerId: devices.ownerId,
      })
      .from(deviceAccess)
      .innerJoin(users, eq(users.id, deviceAccess.userId))
      .innerJoin(devices, eq(devices.id, deviceAccess.deviceId))
      .where(eq(deviceAccess.deviceId, deviceId));

    const usersWithOwner = list.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      image: u.image,
      owner: u.ownerId === u.id,
    }));

    return Response.json({ users: usersWithOwner });
  } catch (e) {
    console.error("device access list error", e);
    return Response.json({ error: "Failed" }, { status: 500 });
  }
}
