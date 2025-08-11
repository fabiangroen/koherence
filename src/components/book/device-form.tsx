"use client";

import { Tablet, LoaderCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState, useTransition, useEffect } from "react";
import { setUserDevice } from "@/app/actions/set-user-device";
import useSWR from "swr";

interface Device {
  id: string; // change to number if your schema uses number
  name: string;
  type: string;
  ownerId: string;
  checked: boolean;
}

interface DeviceFormProps {
  bookId: string;
}

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DeviceForm({ bookId }: DeviceFormProps) {
  const { data, mutate, isLoading } = useSWR<{
    devices: Device[] | null;
    error: string | null;
  }>(`/api/devices?bookId=${bookId}`, fetcher);
  const [list, setList] = useState<Device[]>([]);
  const [isPending, startTransition] = useTransition();

  // Sync local list when remote data changes (and we are not in the middle of a pending optimistic revert)
  useEffect(() => {
    if (data?.devices) {
      setList(data.devices.map((d) => ({ ...d, checked: !!d.checked })));
    }
  }, [data?.devices]);

  function handleToggle(deviceId: string, checked: boolean) {
    setList((prev) =>
      prev.map((d) =>
        d.id === deviceId ? { ...d, checked: checked } : { ...d }
      )
    );
    startTransition(async () => {
      try {
        await setUserDevice({ bookId, deviceId, enable: checked });
        mutate();
      } catch (e) {
        setList((prev) =>
          prev.map((d) => (d.id === deviceId ? { ...d, checked: !checked } : d))
        );
        console.error(e);
      }
    });
  }
  if (data?.error) {
    return <div className="text-xs text-muted-foreground">{data.error}</div>;
  }
  return (
    <div className="space-y-2">
      {list?.map((d) => (
        <div key={d.id} className="flex items-center space-x-2">
          <Checkbox
            id={String(d.id)}
            disabled={isPending || isLoading}
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
          isPending || isLoading ? "opacity-100" : "scale-75 opacity-0"
        } text-[10px] text-muted-foreground transition-all animate-spin`}
      />
    </div>
  );
}
