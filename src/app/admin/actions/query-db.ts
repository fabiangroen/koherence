"use server";

import { auth } from "@/auth";
import { db } from "@/db";

export async function queryDB(query: string) {
  const session = await auth();

  if (session?.user?.role != "admin") {
    return { success: false, message: "Unauthorized" };
  }

  try {
    if (!query) {
      return { success: false, message: "Query parameter is required" };
    }

    try {
      const result = (await db.run(query)).toJSON();
      return { success: true, result };
    } catch (error: any) {
      console.error("Database query error:", error);

      // Extract the actual SQL error from the cause property
      let errorMessage = error.message;
      if (error.cause?.cause?.message) {
        errorMessage = error.cause.cause.message;
      } else if (error.cause?.message) {
        errorMessage = error.cause.message;
      }

      return { success: false, message: errorMessage };
    }
  } catch (error: any) {
    console.error("Request parsing error:", error);
    return { success: false, message: "Invalid request format" };
  }
}
