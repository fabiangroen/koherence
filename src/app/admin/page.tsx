import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DeleteBooksCard } from "./components/delete-books-card";
import { QueryForm } from "./components/query-form";

export default async function AdminDashboard() {
  const session = await auth();
  if (session?.user?.role !== "admin") {
    return redirect("/");
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="mb-8">UserId: {session.user.id}</div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Delete All Books Section */}
        <DeleteBooksCard />

        {/* Query Section */}
        <QueryForm />
      </div>
    </div>
  );
}
