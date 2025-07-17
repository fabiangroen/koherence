import {
    Drawer,
    DrawerClose,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer"
import { Button } from "@/components/ui/button";
import DeviceForm from "@/components/device-form";
import { Separator } from "@/components/ui/separator"
import { Trash2 } from "lucide-react";

export default function BookDrawer({ title, author, year, imageSrc }: BookProps) {
    const handleDelete = () => {
        // Handle delete functionality
        console.log("Delete book")
    }
    return (
        < div className="mx-auto w-full max-w-2xl" >
            <DrawerHeader>
                <DrawerTitle>Book Details</DrawerTitle>
                <DrawerDescription>Manage your book and sync settings</DrawerDescription>
            </DrawerHeader>

            <div className="p-4 pb-0">
                {/* Expanded Book Display */}
                <div className="flex gap-6 mb-4">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                        <div className="max-w-32 max-h-44 relative">
                            <img
                                src={imageSrc}
                                alt={title}
                                className="rounded-xl max-h-44 w-auto"
                            />
                        </div>
                    </div>

                    {/* Book Details and Device Sync Side by Side */}
                    <div className="flex-1 flex gap-6">
                        {/* Book Information */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <h3 className="text-lg font-semibold leading-tight">{title}</h3>
                                <p className="text-sm text-muted-foreground -mt-1">{author} &middot; {year}</p>
                            </div>

                            <div className="space-y-2">
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Fiction</span>
                                    <span>&middot;</span>
                                    <span>288 pages</span>
                                </div>
                            </div>
                        </div>
                        <Separator orientation="vertical" />
                        {/* Device Sync Options */}
                        <div className="flex-1 space-y-3">
                            <h4 className="font-medium text-sm">Sync to devices</h4>
                            <DeviceForm />
                        </div>
                    </div>
                </div>
            </div>

            <DrawerFooter>
                <div className="flex gap-2">
                    <Button variant="destructive" className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Book
                    </Button>
                    <DrawerClose asChild>
                        <Button variant="outline" className="flex-1 bg-transparent">
                            Close
                        </Button>
                    </DrawerClose>
                </div>
            </DrawerFooter>
        </div >
    );
}