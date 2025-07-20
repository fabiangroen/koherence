"use client";

import {
    MorphingDialogTitle,
    MorphingDialogDescription,
} from '@/components/ui/morphing-dialog'
import { useBookContext } from '@/components/book-morphing-dialog';
import { Button } from "@/components/ui/button";
import DeviceForm from "@/components/device-form";
import { Separator } from "@/components/ui/separator"
import { Trash2, X } from "lucide-react";
import Image from "next/image";

export default function BookDrawer() {
    const { book } = useBookContext();

    if (!book) return null;

    const { title, author, releaseYear, coverImg } = book;

    return (
        <div className="mx-auto w-full max-w-2xl relative">


            <div className="p-4 pb-0">
                {/* Expanded Book Display */}
                <div className="flex gap-6 mb-4">
                    {/* Book Cover */}
                    <div className="flex-shrink-0">
                        <Image
                            src={coverImg}
                            alt={title}
                            width={128}
                            height={176}
                            className="rounded-xl object-cover"
                        />
                    </div>

                    {/* Book Details and Device Sync Side by Side */}
                    <div className="flex-1 flex gap-6">
                        {/* Book Information */}
                        <div className="flex-1 space-y-3">
                            <div>
                                <MorphingDialogTitle className="text-lg font-semibold leading-tight">{title}</MorphingDialogTitle>
                                <MorphingDialogDescription className="text-sm text-muted-foreground">{author} &middot; {releaseYear}</MorphingDialogDescription>
                            </div>
                            <Separator />
                            <div className="flex-1 space-y-3">
                                <h4 className="font-medium text-sm">Sync to devices</h4>
                                <DeviceForm />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-0 right-0"
                onClick={() => (document.querySelector('button[aria-label="Close dialog"]') as HTMLButtonElement)?.click()}
            >
                <X />
            </Button>
        </div >
    );
}
