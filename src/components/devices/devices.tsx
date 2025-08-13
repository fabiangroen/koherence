import { auth } from "@/auth";
import DevicesTable from "./devices-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { TabletSmartphone } from "lucide-react";

export default async function Devices() {
  const session = await auth();
  if (!session?.user)
    return (
      <main className="flex flex-1 justify-center">
        <p className="mt-8 text-muted-foreground">Log in to view devices</p>
      </main>
    );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost">
          <TabletSmartphone />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl md:max-w-4xl lg:max-w-5xl">
        <DialogTitle>Devices</DialogTitle>
        <DialogDescription>Manage your devices</DialogDescription>
        <DevicesTable />
      </DialogContent>
    </Dialog>
  );
}
