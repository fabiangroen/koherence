import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { deviceAccess, devices, bookDeviceSync } from "@/db/schema";

export async function GetUserDevices(bookId: string) {
  const session = await auth();
  if (!session?.user) return { devices: null, error: "Unauthorized" };
  if (!bookId) return { devices: null, error: "BookId is required" };

  try {
    const userDevices = await db
      .select({
        device: devices,
        checked: sql<boolean>`(${bookDeviceSync.deviceId} IS NOT NULL)`,
      })
      .from(deviceAccess)
      .innerJoin(devices, eq(deviceAccess.deviceId, devices.id))
      .leftJoin(
        bookDeviceSync,
        and(
          eq(deviceAccess.deviceId, bookDeviceSync.deviceId),
          eq(bookDeviceSync.bookId, bookId)
        )
      )
      .where(eq(deviceAccess.userId, session.user.id ?? ""));
    const flatDevices = userDevices.map((d) => ({
      ...d.device,
      checked: d.checked,
    }));

    if (userDevices.length === 0) {
      return { devices: null, error: "You have no devices" };
    }

    return { devices: flatDevices, error: null };
  } catch (error) {
    console.error("Error fetching user devices:", error);
    return { devices: null, error: "Failed to fetch devices" };
  }
}
