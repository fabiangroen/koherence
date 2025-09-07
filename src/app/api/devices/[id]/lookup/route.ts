import { auth } from "@/auth";
import { db } from "@/db";
import { devices, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  req: Request,
  { params }: { params: { id: string } },
) {
  const session = await auth();
  if (!session?.user)
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  const deviceId = params.id;
  if (!deviceId)
    return Response.json({ error: "Device not found" }, { status: 404 });
  const url = new URL(req.url);
  const email = url.searchParams.get("email")?.trim().toLowerCase();
  if (!email) return Response.json({});

  try {
    // Ensure user owns the device (only owners can lookup to prevent fishing for who has access)
    const device = await db
      .select({ ownerId: devices.ownerId })
      .from(devices)
      .where(eq(devices.id, deviceId));
    if (device.length === 0)
      return Response.json({ error: "Not found" }, { status: 404 });
    if (device[0].ownerId !== session.user.id) return Response.json({});

    const match = await db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        image: users.image,
      })
      .from(users)
      .where(eq(users.email, email));
    if (match.length === 0) return Response.json({});
    return Response.json({ user: match[0] });
  } catch (e) {
    console.error("lookup email error", e);
    return Response.json({});
  }
}
