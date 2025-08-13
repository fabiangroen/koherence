import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and, ne } from "drizzle-orm";
import { alias } from "drizzle-orm/sqlite-core";
import { deviceAccess, devices } from "@/db/schema";

export async function GetUserDevices() {
  const session = await auth();
  if (!session?.user) return { devices: null, error: "Unauthorized" };

  try {
    const devicers = alias(deviceAccess, "devicers");
    const userDevices = await db
      .select({
        device: devices,
        accessors: devicers.userId,
      })
      .from(devices)
      .innerJoin(
        deviceAccess,
        and(
          eq(deviceAccess.deviceId, devices.id),
          eq(deviceAccess.userId, session.user.id ?? ""),
        ),
      )
      .leftJoin(
        devicers,
        and(
          eq(devices.id, devicers.deviceId),
          ne(devicers.userId, session.user.id ?? ""),
        ),
      );

    if (userDevices.length === 0) {
      return { devices: null, error: "You have no devices" };
    }

    return { devices: userDevices, error: null };
  } catch (error) {
    console.error("Error fetching user devices:", error);
    return { devices: null, error: "Failed to fetch devices" };
  }
}
