"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { devices, deviceAccess } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

type CreateDeviceResult =
  | { ok: true; deviceId: string }
  | { ok: false; error: string };

export async function createDevice(
  name: string,
  type: string,
): Promise<CreateDeviceResult> {
  const session = await auth();
  if (!session?.user) return { ok: false, error: "Unauthorized" };

  const trimmedName = name?.trim();
  const trimmedType = type?.trim();
  if (!trimmedName) return { ok: false, error: "Name is required" };
  if (!trimmedType) return { ok: false, error: "Type is required" };

  const id = uuidv4();

  try {
    await db.insert(devices).values({
      id,
      name: trimmedName,
      type: trimmedType.toLowerCase(),
      ownerId: session.user.id!,
    });
    // Ensure owner has access (owner must always appear in device_access for queries to work)
    await db.insert(deviceAccess).values({
      deviceId: id,
      userId: session.user.id!,
    });
    return { ok: true, deviceId: id };
  } catch (e) {
    console.error("Error creating device", e);
    return { ok: false, error: "Failed to create device" };
  }
}
