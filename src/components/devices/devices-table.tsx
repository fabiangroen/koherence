"use client";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DeviceDeleteDialog,
  AddDeviceDialog,
  ShareDeviceDialog,
} from "./device-components";
import useSWR from "swr";

const fetcher = (url: string) => fetch(url).then((r) => r.json());

export default function DevicesTable() {
  type DeviceRecord = {
    device: {
      id: string;
      name: string;
      type: string;
      ownerId: string;
    };
    accessors: string | null;
  };

  type ApiResponse = {
    devices: DeviceRecord[] | null;
    error: string | null;
  };

  const { data, error, isLoading } = useSWR<ApiResponse>(
    `/api/devices/user`,
    fetcher,
  );

  // Group by device id to aggregate accessors for the "Access" column
  const rows = (() => {
    const result: Array<{
      id: string;
      name: string;
      type: string;
      ownerId: string;
      accessCount: number;
    }> = [];
    if (!data?.devices) return result;
    const map = new Map<
      string,
      {
        id: string;
        name: string;
        type: string;
        ownerId: string;
        accessors: Set<string>;
      }
    >();
    for (const { device, accessors } of data.devices) {
      const key = device.id;
      const existing = map.get(key) ?? {
        id: device.id,
        name: device.name,
        type: device.type,
        ownerId: device.ownerId,
        accessors: new Set<string>(),
      };
      if (accessors) existing.accessors.add(accessors);
      map.set(key, existing);
    }
    for (const entry of map.values()) {
      result.push({
        id: entry.id,
        name: entry.name,
        type: entry.type,
        ownerId: entry.ownerId,
        accessCount: entry.accessors.size,
      });
    }
    return result;
  })();

  return (
    <div className="w-full overflow-x-auto space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-muted-foreground">
          Your devices
        </div>
        <AddDeviceDialog />
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Model</TableHead>
            <TableHead>Id</TableHead>
            <TableHead>Access</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                Loading devices...
              </TableCell>
            </TableRow>
          )}
          {!isLoading && data?.devices === null && (
            <TableRow>
              <TableCell colSpan={5} className="text-muted-foreground">
                No devices found
              </TableCell>
            </TableRow>
          )}
          {!isLoading && !error && data && data.devices && data.error && (
            <TableRow>
              <TableCell colSpan={5} className="text-red-500">
                {data.error}
              </TableCell>
            </TableRow>
          )}
          {!isLoading &&
            !error &&
            rows.map((d) => (
              <TableRow key={d.id}>
                <TableCell className="font-medium">{d.name}</TableCell>
                <TableCell className="uppercase tracking-wide text-xs text-muted-foreground">
                  {d.type}
                </TableCell>
                <TableCell>
                  <code className="text-xs text-muted-foreground">{d.id}</code>
                </TableCell>
                <TableCell>
                  {d.accessCount > 0
                    ? `Shared with ${d.accessCount}`
                    : "Private"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground text-xs">
                  <ShareDeviceDialog id={d.id} />
                  <DeviceDeleteDialog id={d.id} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
        {!isLoading && !error && rows.length > 0 && (
          <TableCaption>
            {rows.length} device{rows.length === 1 ? "" : "s"}
          </TableCaption>
        )}
      </Table>
    </div>
  );
}
