'use client';

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import Image from 'next/image';
import { useBookContext } from '@/components/book-morphing-dialog';
import { MorphingDialogTitle, MorphingDialogDescription } from '@/components/ui/morphing-dialog';

export function BookCard() {
    const { book } = useBookContext();

    if (!book) return null;

    const { title, author, releaseYear, coverImg } = book;

    return (
        <Card className="w-full h-full flex flex-col p-0 transition-all hover:scale-101 cursor-pointer">  {/* for the other look it was px-4 py-2*/}
            <CardHeader className="flex-1 flex flex-col items-center p-0"> {/* and here p-2 */}
                <Image
                    src={coverImg}
                    alt={title}
                    width={200}
                    height={300}
                    className="w-full h-full object-cover rounded-t-xl"
                />
                <MorphingDialogTitle className="text-base text-center">{title}</MorphingDialogTitle>
                <MorphingDialogDescription className="text-xs text-center -mt-1 mb-2 text-muted-foreground"> {/* These margins were also different for the other look */}
                    {author} &middot; {releaseYear}
                </MorphingDialogDescription>
            </CardHeader>
        </Card>
    );
}
