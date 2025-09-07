"use client";

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
import { Trash2, Forward, Loader2, Check, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteDevice } from "@/app/actions/delete-device";
import { toast } from "sonner";
import { useSWRConfig } from "swr";
import useSWR from "swr";
import { useState, useEffect, useCallback } from "react";
import { createDevice } from "@/app/actions/create-device";
import { shareDevice } from "@/app/actions/share-device";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const jsonFetcher = (url: string) => fetch(url).then((r) => r.json());

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
                  },
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

export function AddDeviceDialog() {
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    await toast.promise(
      createDevice(name, type).then((res) => {
        if (!res.ok) throw new Error(res.error);
        mutate("/api/devices/user");
        setOpen(false);
        setName("");
        setType("");
      }),
      {
        loading: "Creating device...",
        success: "Device created",
        error: (e) => e.message || "Failed to create device",
      },
    );
    setSubmitting(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Device</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New Device</DialogTitle>
          <DialogDescription>Add a new reading device.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="device-name">Name</Label>
            <Input
              id="device-name"
              placeholder="e.g. Kobo Clara"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={submitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="device-type">Type / Model</Label>
            <Input
              id="device-type"
              placeholder="e.g. Clara HD"
              value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={submitting}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={submitting}>
              Cancel
            </Button>
          </DialogClose>
          <Button onClick={onSubmit} disabled={submitting || !name || !type}>
            Create
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ShareDeviceDialog({ id }: { id: string }) {
  const { mutate } = useSWRConfig();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [lookup, setLookup] = useState<
    | { status: "idle" }
    | { status: "searching" }
    | { status: "notfound"; email: string }
    | {
        status: "found";
        user: {
          id: string;
          name: string | null;
          image: string | null;
          email: string;
        };
        added?: boolean;
      }
  >({ status: "idle" });
  const [submitting, setSubmitting] = useState(false);

  // Existing accessors list
  const {
    data: accessData,
    isLoading: accessLoading,
    mutate: mutateAccess,
  } = useSWR<
    | {
        users: Array<{
          id: string;
          email: string;
          name: string | null;
          image: string | null;
          owner: boolean;
        }>;
        error?: string;
      }
    | undefined
  >(open ? `/api/devices/${id}/access` : null, jsonFetcher);

  const reset = () => {
    setEmail("");
    setLookup({ status: "idle" });
  };

  const performLookup = useCallback(
    async (target: string) => {
      const trimmed = target.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) return;
      setLookup({ status: "searching" });
      try {
        // Use shareDevice with a dry-run style by not changing state if already shared.
        // We call shareDevice only after explicit Share click; here we will call a lightweight
        // lookup endpoint. Implement reuse via the same endpoint with query param.
        const res = await fetch(
          `/api/devices/${id}/lookup?email=` + encodeURIComponent(trimmed),
        );
        if (!res.ok) throw new Error("Lookup failed");
        const data = await res.json();
        if (data && data.user) {
          setLookup({ status: "found", user: data.user });
        } else {
          setLookup({ status: "notfound", email: trimmed });
        }
      } catch (e) {
        setLookup({ status: "notfound", email: trimmed });
      }
    },
    [id],
  );

  // Detect email completion (typing a space right after a valid email)
  useEffect(() => {
    const trimmed = email.trim();
    if (email.endsWith(" ") && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed)) {
      performLookup(trimmed);
    } else if (!email) {
      setLookup({ status: "idle" });
    }
  }, [email, performLookup]);

  const submit = async () => {
    if (submitting) return;
    const trimmed = email.trim();
    const valid = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(trimmed);
    if (!valid) return;
    setSubmitting(true);
    try {
      const res = await shareDevice(id, trimmed);
      if (!res.ok) throw new Error(res.error);
      if (!res.user) {
        setLookup({ status: "notfound", email: trimmed });
        toast.error("No user with that email");
      } else {
        mutate("/api/devices/user");
        mutateAccess();
        setLookup({ status: "found", user: res.user, added: res.added });
        if (res.added) toast.success(`${res.user.email} now has access`);
        else
          toast.message?.(`${res.user.email} already has access`) ||
            toast.success(`${res.user.email} already has access`);
        // Clear field for next invite, keep dialog open.
        setEmail("");
      }
    } catch (e: any) {
      toast.error(e.message || "Failed to share device");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o);
        if (!o) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" variant="outline">
          <Forward />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Device</DialogTitle>
          <DialogDescription>
            Current people with access to the device. Type an email and press
            share to invite new people.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-1">
          <div>
            <Label className="text-xs mb-1 block">People with access</Label>
            <div className="space-y-2">
              {accessLoading && (
                <div className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="animate-spin h-3 w-3" /> Loading...
                </div>
              )}
              {!accessLoading && accessData?.users?.length === 0 && (
                <div className="text-xs text-muted-foreground">Only you</div>
              )}
              {!accessLoading &&
                accessData?.users?.map((u) => (
                  <div key={u.id} className="flex items-center gap-3 text-sm">
                    <Avatar className="h-7 w-7">
                      {u.image && <AvatarImage src={u.image} alt={u.email} />}
                      <AvatarFallback>
                        {(u.name || u.email)[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col leading-tight">
                      <span className="font-medium text-xs">
                        {u.name || u.email}
                      </span>
                      <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                        {u.email}
                        {u.owner && (
                          <span className="rounded bg-primary/10 px-1 py-px text-primary text-[9px]">
                            Owner
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`share-email-${id}`}>Invite by email</Label>
            <Input
              id={`share-email-${id}`}
              type="email"
              placeholder="user@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={submitting}
              autoComplete="off"
            />
            {lookup.status === "searching" && (
              <div className="text-xs text-muted-foreground flex items-center gap-2">
                <Loader2 className="h-3 w-3 animate-spin" /> Looking up...
              </div>
            )}
            {lookup.status === "notfound" && (
              <div className="text-xs text-muted-foreground">
                No account matches <code>{lookup.email}</code>
              </div>
            )}
            {lookup.status === "found" && (
              <div className="text-xs flex items-center gap-2 text-green-600">
                <Check className="h-3 w-3" /> {lookup.user.email} found
                {lookup.added === false && " (already shared)"}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" disabled={submitting}>
              Close
            </Button>
          </DialogClose>
          <Button
            onClick={submit}
            variant="default"
            disabled={
              submitting || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())
            }
          >
            <UserPlus className="h-4 w-4 mr-1" /> Share
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
