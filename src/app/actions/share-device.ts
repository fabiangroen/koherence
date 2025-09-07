"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { devices, users, deviceAccess } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export type ShareDeviceResult =
  | {
      ok: true;
      added?: boolean;
      user?: {
        id: string;
        name: string | null;
        image: string | null;
        email: string;
      };
    }
  | { ok: false; error: string };

/**
 * Share a device with a user (by email). For enumeration safety this returns { ok: true }
 * even if the email doesn't exist or the user already has access. Only permission /
 * authorization errors surface as ok: false.
 */
export async function shareDevice(
  deviceId: string,
  email: string,
): Promise<ShareDeviceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };
  const cleanedEmail = email.trim().toLowerCase();
  if (!deviceId || !cleanedEmail) return { ok: false, error: "Invalid input" };

  try {
    // Ensure requester owns the device
    const dev = await db
      .select({ ownerId: devices.ownerId })
      .from(devices)
      .where(eq(devices.id, deviceId));
    if (dev.length === 0) return { ok: false, error: "Device not found" };
    if (dev[0].ownerId !== session.user.id) {
      return { ok: false, error: "Only the owner can share this device" };
    }

    // Lookup user by email
    const target = await db
      .select({
        id: users.id,
        name: users.name,
        image: users.image,
        email: users.email,
      })
      .from(users)
      .where(eq(users.email, cleanedEmail));

    if (target.length === 0) {
      // Silently succeed to avoid email enumeration
      return { ok: true };
    }

    const targetUser = target[0];
    const userId = targetUser.id;

    // Insert access record if not already present
    let added = false;
    try {
      await db.insert(deviceAccess).values({ deviceId, userId });
      added = true;
    } catch (e) {
      // Likely unique constraint -> user already had access
    }

    return { ok: true, added, user: targetUser };
  } catch (error) {
    console.error("shareDevice error", error);
    return { ok: false, error: "Failed to share device" };
  }
}
