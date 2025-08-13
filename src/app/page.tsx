import CardGrid from "@/components/book/card-grid";
import FileUpload from "@/components/file-upload";
import { auth } from "@/auth";

export default async function Home() {
  const session = await auth();
  return (
    <div className="relative">
      <CardGrid />
      <div className="absolute top-4 right-4">
        {session?.user && <FileUpload />}
      </div>
    </div>
  );
}
