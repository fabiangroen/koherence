"use client";

import { Tablet, LoaderCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { use, useState, useTransition } from "react";
import { setUserDevice } from "@/app/actions/set-user-device";

interface Device {
  id: string; // change to number if your schema uses number
  name: string;
  type: string;
  ownerId: string;
  checked: boolean;
}

interface DeviceFormProps {
  bookId: string;
  promise: Promise<{ devices: Device[] | null; error: string | null }>;
}

export default function DeviceForm({ promise, bookId }: DeviceFormProps) {
  const { devices, error } = use(promise);
  const [list, setList] = useState<Device[]>(() =>
    (devices ?? []).map((d) => ({ ...d, checked: !!d.checked }))
  );
  const [isPending, startTransition] = useTransition();

  function handleToggle(deviceId: string, checked: boolean) {
    setList((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, checked: checked } : { ...d }
      )
    );
    startTransition(async () => {
      try {
        await setUserDevice({ bookId, deviceId, enable: checked });
      } catch (e) {
        setList((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, checked: !checked } : d))
        );
        console.error(e);
      }
    });
  }
  if (error) {
    return <div className="text-xs text-muted-foreground">{error}</div>;
  }
  return (
    <div className="space-y-2">
      {list?.map((d) => (
        <div key={d.id} className="flex items-center space-x-2">
          <Checkbox
            id={String(d.id)}
            disabled={isPending}
            checked={!!d.checked}
            onCheckedChange={(val) => handleToggle(d.id, val === true)}
          />
          <Label
            htmlFor={String(d.id)}
            className="flex items-center cursor-pointer flex-1 text-sm"
          >
            <div className="flex items-center space-x-1">
              <Tablet className="h-4 w-4 text-muted-foreground" />
              <span>{d.name}</span>
            </div>
          </Label>
        </div>
      ))}
      <LoaderCircle
        className={`${
          isPending ? "opacity-100" : "scale-75 opacity-0"
        } text-[10px] text-muted-foreground transition-all animate-spin`}
      />
    </div>
  );
}
