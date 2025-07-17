import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface BookCardProps {
    title: string;
    author: string;
    year: string;
    imageSrc: string;
}

export function BookCard({ title, author, year, imageSrc }: BookCardProps) {
    return (
        <Card className="w-full h-full flex flex-col p-0 transition-all hover:scale-101 cursor-pointer">  {/* for the other look it was px-4 py-2*/}
            <CardHeader className="flex-1 flex flex-col items-center p-0"> {/* and here p-2 */}
                <img
                    src={imageSrc}
                    alt={title}
                    className="w-full h-full object-cover rounded-t-xl"
                />
                <CardTitle className="text-base text-center">{title}</CardTitle>
                <CardDescription className="text-xs text-center -mt-1 mb-2 text-muted-foreground"> {/* These margins were also different for the other look */}
                    {author} &middot; {year}
                </CardDescription>
            </CardHeader>
        </Card>
    );
}
