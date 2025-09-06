import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDevice } from "@/app/actions/delete-device";
import { toast } from "sonner";
import { useSWRConfig } from "swr";

export function DeviceDeleteDialog({ id }: { id: string }) {
  const { mutate } = useSWRConfig();

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="text-destructive/80 hover:text-destructive ml-2"
        >
          <Trash2 />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove Device</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove this device? If you are the owner of
            the device, it will be permanently deleted. This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button
              variant="destructive"
              onClick={() =>
                toast.promise(
                  deleteDevice(id).then(() => {
                    mutate("/api/devices/user");
                  }),
                  {
                    loading: "Deleting device...",
                    success: "Device deleted",
                    error: "Failed to delete device",
                  }
                )
              }
            >
              Delete
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
