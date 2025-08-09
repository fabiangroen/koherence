import MiniSearch, { SearchOptions, SearchResult } from "minisearch"
import { Book, bookCollection } from "./types"

// Client has to use this, but cannot import it from searchUtils because that file has database connections in it, so we have to define it in a separate file
export function makeSearchableCollection(initialBooks: Book[]): bookCollection {
  let books = initialBooks;

  const miniSearch = new MiniSearch({
    fields: ['author', 'title'],                                          // fields to index for search
    storeFields: ['author', 'title', 'releaseDate', 'coverImg', 'id']     // fields to return with search results
  })
  miniSearch.addAll(books)

  return {
    books: books,
    search: (query: string, searchOptions?: SearchOptions) => {
      const res: SearchResult[] = miniSearch.search(query, searchOptions || {
        boost: { title: 2 },
        fuzzy: 0.5  // Temporary very fuzzy settings because it is convenient for testing, TODO: alter this later
      })
      const books: Book[] = res.map((sr) => {
        return {
          author: sr.author,
          title: sr.title,
          releaseDate: sr.releaseDate,
          coverImg: sr.coverImg,
          id: sr.id
        }
      })
      return makeSearchableCollection(books);
    },
    collect: () => books
  }
}