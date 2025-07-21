

import { z } from "zod";

export const BookDBEntrySchema = z.object({
    id: z.string().max(99),
    fileName: z.string(),
    fileHash: z.string(),
    refCount: z.number().int().min(0),
});

// This is now a type we can validate against the schema defined above, using something like:
// const res = BookDBEntrySchema.safeParse(bookDBEntry);
export type BookDBEntry = z.infer<typeof BookDBEntrySchema>;



export type Book = {
    author: string;
    title: string;
    releaseYear: number;
    coverImg: string; // currently stored as a path to an image, with as root the public/covers/ directory
};

export interface BookProps {
    title: string;
    author: string;
    year: string;
    imageSrc: string;
}