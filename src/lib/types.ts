export type Book = {
  author: string;
  title: string;
  releaseDate: string;
  coverImg: string; // currently stored as a path to an image, with as root the public/covers/ directory
  id: string;
};
