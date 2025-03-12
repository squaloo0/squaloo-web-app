// Load environment variables first, before any other imports
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Load environment variables from .env.local when running as a script
const envLocalPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envLocalPath)) {
  console.log(`Loading environment variables from ${envLocalPath}`);
  const envConfig = dotenv.parse(fs.readFileSync(envLocalPath));
  for (const key in envConfig) {
    process.env[key] = envConfig[key];
  }
  console.log('Loaded environment variables from .env.local');
  
  // Debug: Check if the database URL is loaded
  if (process.env.NEON_DATABASE_URL) {
    console.log('NEON_DATABASE_URL is defined (value hidden for security)');
  } else {
    console.error('NEON_DATABASE_URL is still not defined after loading .env.local');
  }
} else {
  console.warn('.env.local file not found');
  dotenv.config(); // Try regular .env as fallback
}

// Now import the database client and other dependencies
import { db } from "./client"; // Use the local client.ts file
import { qrEncodingPhases } from "./schema";
import { generateQRCodePhases } from "../utils/qrCodeGenerator";

// Define the QR code phases with updated descriptions
const phases = [
  {
    name: "Finder Patterns",
    description: "The three finder patterns in the corners help QR readers locate and orient the code.",
    order: 1
  },
  {
    name: "Separators",
    description: "White separators around the finder patterns help distinguish them from the data.",
    order: 2
  },
  {
    name: "Alignment Pattern",
    description: "The alignment pattern helps QR readers maintain orientation on larger codes.",
    order: 3
  },
  {
    name: "Timing Patterns",
    description: "Alternating black and white modules that help determine the size of modules in the code.",
    order: 4
  },
  {
    name: "Dark Module",
    description: "A single black module that is always present at a specific position (18,7) [zero-indexed] in the QR code specification.",
    order: 5
  },
  {
    name: "Mode & Character Count",
    description: "Mode indicator (0100 for byte mode) and character count (00010111 for 23 characters).",
    order: 6
  },
  {
    name: "Data Encoding",
    description: "The byte encoding of the URL 'www.squaloo.com/marshal-qr' with padding.",
    order: 7
  },
  {
    name: "Error Correction",
    description: "Reed-Solomon error correction codewords that allow the QR code to be read even if partially damaged.",
    order: 8
  },
  {
    name: "Remainder Padding",
    description: "Padding bits added to fill the remaining data capacity of the QR code.",
    order: 9
  },
  {
    name: "Masked QR Code",
    description: "Mask pattern 3 applied to ensure optimal scanning by creating a balanced distribution of black and white modules.",
    order: 10
  },
  {
    name: "Final QR Code",
    description: "The complete QR code with format information added, ready to be scanned.",
    order: 11
  }
];

// Generate the QR code matrices with lowercase URL
// Make the seed function async to handle the Promise
async function seed() {
  try {
    // Generate matrices asynchronously
    const matrices = await generateQRCodePhases("www.squaloo.com/marshal-qr");
    
    // Clear existing data
    await db.delete(qrEncodingPhases);
    console.log("Cleared existing QR encoding phases");

    // Insert new phases with matrices
    for (let i = 0; i < phases.length; i++) {
      const phase = phases[i];
      const matrix = matrices[i] || matrices[matrices.length - 1]; // Use the last matrix if we run out
      
      await db.insert(qrEncodingPhases).values({
        name: phase.name,
        description: phase.description,
        order: phase.order,
        matrixData: JSON.stringify(matrix)
      });
      
      console.log(`Inserted phase: ${phase.name}`);
    }

    console.log("Seed completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

// Call the async seed function
seed();
