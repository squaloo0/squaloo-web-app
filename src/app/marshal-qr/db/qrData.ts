import { db } from './client';
import { qrEncodingPhases } from './schema';
import { eq } from 'drizzle-orm';

// Function to fetch all QR encoding phases
export async function getQREncodingPhases() {
  try {
    const phases = await db.select().from(qrEncodingPhases).orderBy(qrEncodingPhases.order);
    return phases;
  } catch (error) {
    console.error('Error fetching QR encoding phases:', error);
    throw error;
  }
}

// Function to fetch a specific phase by ID
export async function getQREncodingPhaseById(id: number) {
  try {
    const phase = await db.select().from(qrEncodingPhases).where(eq(qrEncodingPhases.id, id)).limit(1);
    return phase[0];
  } catch (error) {
    console.error('Error fetching QR encoding phase:', error);
    throw error;
  }
} 