"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { eq, and, sql } from "drizzle-orm";
import { bookDeviceSync } from "@/db/schema";

export async function setUserDevice({
  bookId,
  deviceId,
  enable,
}: {
  bookId: string;
  deviceId: string;
  enable: boolean;
}) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");
  if (!bookId) throw new Error("Book not found");
  if (!deviceId) throw new Error("Device not found");

  if (enable) {
    try {
      await db.insert(bookDeviceSync).values({ bookId, deviceId });
    } catch (error) {
      console.error("Error setting device sync", error);
      throw new Error(`Failed to sync: ${error}`);
    }
  } else {
    try {
      await db
        .delete(bookDeviceSync)
        .where(
          and(
            eq(bookDeviceSync.bookId, bookId),
            eq(bookDeviceSync.deviceId, deviceId)
          )
        );
    } catch (error) {
      console.error("Error removing device sync", error);
      throw new Error(`Failed to sync: ${error}`);
    }
  }
}
