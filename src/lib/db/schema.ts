import {
    pgTable,
    text,
    serial,
    pgEnum,
    timestamp,
    varchar,
    integer
  } from "drizzle-orm/pg-core";
  
  // Define enum
  export const userSystemEnum = pgEnum("user_system", ['user', 'system']);
  
  // Chats table
  export const chats = pgTable("chats", {
    id: serial("id").primaryKey(),
    pdfName: text("pdf_name").notNull(),
    pdfUrl: text("pdf_url").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    userId: varchar("user_id", { length: 256 }).notNull(),
    fileKey: text("file_key").notNull()
  });
  
  // Messages table
  export const messages = pgTable("messages", {
    id: serial("id").primaryKey(),
    chatId: integer("chat_id").references(() => chats.id).notNull(),
    content: text("content").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    role: userSystemEnum("role").notNull()
  });
  