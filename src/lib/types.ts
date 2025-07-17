type Book = {
    author: string;
    title: string;
    releaseYear: number;
    coverImg: string; // currently stored as a path to an image, with as root the public/covers/ directory
};

interface BookProps {
    title: string;
    author: string;
    year: string;
    imageSrc: string;
}