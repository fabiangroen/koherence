import { sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const books = sqliteTable("books", {
  title: text("title").notNull(),
  creator: text("creator").notNull(),
  releasedate: text("releasedate").notNull(),
  language: text("language").notNull(),
  publisher: text("publisher").notNull(),
  subjects: text("subjects").notNull(),
  id: text("id").primaryKey(),
  imageFileExtension: text("image_file_extension").notNull(),
});

export const devices = sqliteTable("devices", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(),
  ownerId: text("owner_id").notNull(),
});

export const deviceAccess = sqliteTable(
  "device_access",
  {
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id),
    userId: text("user_id").notNull(),
  },
  (table) => [uniqueIndex("deviceid_userid").on(table.deviceId, table.userId)],
);

export const bookDeviceSync = sqliteTable(
  "book_device_sync",
  {
    bookId: text("book_id")
      .notNull()
      .references(() => books.id),
    deviceId: text("device_id")
      .notNull()
      .references(() => devices.id),
  },
  (table) => [uniqueIndex("bookid_deviceid").on(table.deviceId, table.bookId)],
);
