import { sqliteTable, text, int } from 'drizzle-orm/sqlite-core';

export const books = sqliteTable('books', {
  title: text('title').notNull(),
  creator: text('creator').notNull(),
  releasedate: text('releasedate').notNull(),
  language: text('language').notNull(),
  publisher: text('publisher').notNull(),
  subjects: text('subjects').notNull(),
  id: text('id').primaryKey(),
  imageFileExtension: text('image_file_extension').notNull(),
});

export const devices = sqliteTable('devices', {
  id: int('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  ownerId: int('owner_id').notNull(),
});

export const device_access = sqliteTable('device_access', {
  deviceId: int('device_id')
    .notNull()
    .references(() => devices.id),
  userId: int('user_id').notNull(),
});

export const bookDeviceSync = sqliteTable('book_device_sync', {
  bookId: int('book_id')
    .notNull()
    .references(() => books.id),
  deviceId: int('device_id')
    .notNull()
    .references(() => devices.id),
});
