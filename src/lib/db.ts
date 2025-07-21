import { addRxPlugin, createRxDatabase } from 'rxdb/plugins/core';
import { RxDBDevModePlugin } from 'rxdb/plugins/dev-mode';
import { getRxStorageLocalstorage } from 'rxdb/plugins/storage-localstorage';
import { wrappedValidateAjvStorage } from 'rxdb/plugins/validate-ajv';
import { BookDBEntrySchema, BookDBEntry } from './types';

// To quote the quickstart:  
// When you use RxDB in development, 
// you should always enable the dev-mode plugin, 
// which adds helpful checks and validations, 
// and tells you if you do something wrong.
// https://rxdb.info/quickstart.html step 3
addRxPlugin(RxDBDevModePlugin); 

// For testing we use the localstorage plugin so we store changes locally, 
// we can later just swap that out here
const BookDB = await createRxDatabase({
  name: 'mydatabase',
  storage: wrappedValidateAjvStorage({
    storage: getRxStorageLocalstorage()
  })
});

// A collection is like an sql table for rxdb, which we are declaring here
await BookDB.addCollections({
    // name of the collection
    kepubs: {
        // we use the JSON-schema standard
        schema: {
            version: 0,
            primaryKey: 'id',
            type: 'object',
            properties: {
                id: {
                    type: 'string',
                    maxLength: 100 // this is the primary key so it must have a max length
                },
                filename: {
                    type: 'string'
                },
                hash: {
                    type: 'string'
                },
                refCount: {
                    type: 'integer',
                    minimum: 0
                }
            },
            required: ['id', 'filename', 'hash', 'refCount']
        }
    }
});

async function addBook(book: BookDBEntry): Promise<BookDBEntry> {
    const res = BookDBEntrySchema.safeParse(book); // Validate the book against the schema
    if(!res.success) 
        return Promise.reject(new Error(`Invalid book entry: ${res.error.message}`)); 

    // If the book already exists we just return a reference to it and increment the refCount
    const existingBook = await BookDB.kepubs.findOne({
        selector: { id: book.id }
    }).exec();

    if (existingBook) {
        // If the book already exists, we just increment the refCount and return the existing book
        return  existingBook.update({
            $inc: { refCount: 1 }
        }).then(() => existingBook);
    }

    // If the book does not exist, we add it to the database
    const AddedBook = await BookDB.kepubs.insert(book);
    AddedBook.refCount = 1; // Set initial refCount to 1
    AddedBook.refCount$.subscribe(() => {
        // This runs whenever the refCount changes, as the $ operator returns an observable of the refCount
        if(AddedBook.refCount == 0){
            // If the refCount is 0, we can remove the book from the database
            AddedBook.remove();
        }
    });
    return Promise.resolve(AddedBook)
}