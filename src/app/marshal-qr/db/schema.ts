// Define the schema for the QR code encoding phases
import { pgTable, serial, text, json, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';

export const qrEncodingPhases = pgTable('qr_encoding_phases', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  matrixData: json('matrix_data').notNull(), // 25x25 matrix representation
  order: serial('order').notNull(), // For ordering the phases
});

// Types for TypeScript
export type QREncodingPhase = {
  id: number;
  name: string;
  description: string;
  matrixData: boolean[][]; // 25x25 matrix where true = filled cell, false = empty
  order: number;
};

// SQU-427: the Meridian newsletter. Created by migrations/0002_subscribers.sql
// (run by the founder); the action writes it with plain SQL, this is the type.
export const subscribers = pgTable('subscribers', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 254 }).notNull().unique(),
  name: varchar('name', { length: 120 }),
  source: varchar('source', { length: 16 }).notNull().default('board'),
  consent: boolean('consent').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
