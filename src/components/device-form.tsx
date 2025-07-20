"use client"

import { Smartphone, Tablet, Monitor, Headphones } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const devices = [
    { id: "phone", name: "iPhone 15", icon: Smartphone },
    { id: "tablet", name: "iPad Pro", icon: Tablet },
    { id: "laptop", name: "MacBook Pro", icon: Monitor },
    { id: "kindle", name: "Kindle Oasis", icon: Tablet },
    { id: "audiobook", name: "AirPods Pro", icon: Headphones },
]

export default function DeviceForm() {
    const [selectedDevices, setSelectedDevices] = useState<string[]>(["phone", "kindle"])

    function handleDeviceToggle(deviceId: string) {
        setSelectedDevices((prev) =>
            prev.includes(deviceId)
                ? prev.filter((id) => id !== deviceId)
                : [...prev, deviceId]
        );
    }
    return (
        <div className="space-y-2">
            {devices.map((device) => {
                const Icon = device.icon
                return (
                    <div key={device.id} className="flex items-center space-x-2">
                        <Checkbox
                            id={device.id}
                            checked={selectedDevices.includes(device.id)}
                            onCheckedChange={() => handleDeviceToggle(device.id)}
                        />
                        <Label
                            htmlFor={device.id}
                            className="flex items-center space-x-2 cursor-pointer flex-1 text-sm"
                        >
                            <Icon className="h-3 w-3 text-muted-foreground" />
                            <span>{device.name}</span>
                        </Label>
                    </div>
                )
            })}
        </div>
    )
}