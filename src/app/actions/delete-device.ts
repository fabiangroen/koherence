"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and } from "drizzle-orm";
import { devices, deviceAccess, bookDeviceSync } from "@/db/schema";

export async function deleteDevice(deviceId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!deviceId) throw new Error("Device not found");
  const rows = await db
    .select({ ownerId: devices.ownerId })
    .from(devices)
    .where(eq(devices.id, deviceId));
  const device = rows[0];
  if (!device) throw new Error("Device not found");
  if (device.ownerId !== session.user.id) {
    try {
      await db
        .delete(deviceAccess)
        .where(
          and(
            eq(deviceAccess.deviceId, deviceId),
            eq(deviceAccess.userId, session.user.id ?? ""),
          ),
        );
    } catch (error) {
      console.error("Error removing device access:", error);
      throw new Error("Failed to remove device access");
    }
  } else
    try {
      await db.delete(deviceAccess).where(eq(deviceAccess.deviceId, deviceId));
      await db
        .delete(bookDeviceSync)
        .where(eq(bookDeviceSync.deviceId, deviceId));
      await db.delete(devices).where(eq(devices.id, deviceId));
    } catch (error) {
      console.error("Error deleting device:", error);
      throw new Error("Failed to delete device");
    }
}
