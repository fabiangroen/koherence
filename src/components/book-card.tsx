'use client';

import React from 'react';
import { Card, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import {
    MorphingDialog,
    MorphingDialogTrigger,
    MorphingDialogContent,
    MorphingDialogTitle,
    MorphingDialogDescription,
    MorphingDialogContainer,
    MorphingDialogClose
} from '@/components/ui/morphing-dialog';
import BookDetails from '@/components/book-details';
import type { Book } from '@/lib/types';

export function BookCard({ book }: { book: Book }) {
    const { title, author, releaseYear, coverImg } = book;

    return (
        <MorphingDialog>
            <MorphingDialogTrigger>
                <Card className="w-full h-full flex flex-col p-0 transition-all hover:scale-101 cursor-pointer">
                    <CardHeader className="flex-1 flex flex-col items-center p-0">
                        <Image
                            src={coverImg}
                            alt={title}
                            width={200}
                            height={300}
                            className="w-full h-full object-cover rounded-t-xl"
                        />
                        <MorphingDialogTitle className="text-base text-center">{title}</MorphingDialogTitle>
                        <MorphingDialogDescription className="text-xs text-center -mt-1 mb-2 text-muted-foreground">
                            {author} &middot; {releaseYear}
                        </MorphingDialogDescription>
                    </CardHeader>
                </Card>
            </MorphingDialogTrigger>
            <MorphingDialogContainer>
                <MorphingDialogContent className="overflow-hidden bg-card text-card-foreground rounded-xl border p-2">
                    <BookDetails book={book} />
                    <MorphingDialogClose className="opacity-0" />
                </MorphingDialogContent>
            </MorphingDialogContainer>
        </MorphingDialog>
    );
}