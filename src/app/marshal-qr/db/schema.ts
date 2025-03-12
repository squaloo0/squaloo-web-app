// Define the schema for the QR code encoding phases
import { pgTable, serial, text, json, varchar } from 'drizzle-orm/pg-core';

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