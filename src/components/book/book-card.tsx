import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import DeviceForm from "@/components/book/device-form";
import { Separator } from "@/components/ui/separator"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import type { Book } from '@/lib/types';

export function BookCard({ book }: { book: Book }) {
    const { title, author, releaseDate, coverImg } = book;

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Card className="w-full h-full flex flex-col p-0 transition-all hover:scale-101 cursor-pointer">
                    <CardHeader className="flex-1 flex flex-col items-center p-0">
                        <Image
                            src={coverImg}
                            alt={title}
                            width={200}
                            height={300}
                            className="w-full h-full object-cover rounded-t-xl"
                        />
                        <div className="text-base text-center">{title}</div>
                        <div className="text-xs text-center -mt-1 mb-2 text-muted-foreground">
                            {author} &middot; {releaseDate}
                        </div>
                    </CardHeader>
                </Card>
            </DialogTrigger>
            <DialogContent className="overflow-hidden bg-card text-card-foreground rounded-xl border p-2">
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
                                        <DialogTitle className="text-lg font-semibold leading-tight">{title}</DialogTitle>
                                        <DialogDescription className="text-sm text-muted-foreground">{author} &middot; {releaseDate}</DialogDescription>
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
                </div >
            </DialogContent>
        </Dialog>
    );
}