import { SearchOptions } from "minisearch";

export type Book = {
  author: string;
  title: string;
  releaseDate: string;
  coverImg: string; 
  id: string;
};

export type bookCollection = {
  books: Book[],
  search: (query: string, searchOptions?: SearchOptions) => bookCollection,
  collect: () => Book[] // Later we might want to change this to like also include metadata about searcher or filters done before collecting, so we create this now even though it's equivalent to the books field
  // can also add stuff later on, like a filter or sort method
  //filter: (/* arguments here */) => Promise<bookCollection>,
  //sort: (/* arguments here */) => Promise<bookCollection>,

}