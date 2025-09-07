"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Delete a user entirely
export async function deleteUserAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin");
}

// Set an explicit role (e.g., user, admin)
export async function setUserRoleAction(formData: FormData) {
  const id = formData.get("id");
  const role = formData.get("role");
  if (typeof id !== "string" || typeof role !== "string" || id.length === 0)
    return;
  await db.update(users).set({ role }).where(eq(users.id, id));
  revalidatePath("/admin");
}

// Approve a pending user -> assign default role 'user'
export async function approveUserAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;
  await db.update(users).set({ role: "user" }).where(eq(users.id, id));
  revalidatePath("/admin");
}

// Deny a pending user -> delete the record
export async function denyUserAction(formData: FormData) {
  const id = formData.get("id");
  if (typeof id !== "string" || id.length === 0) return;
  await db.delete(users).where(eq(users.id, id));
  revalidatePath("/admin");
}
