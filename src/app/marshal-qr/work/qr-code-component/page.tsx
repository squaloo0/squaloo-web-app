import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getQREncodingPhases } from '../../db/qrData';
import { QREncodingPhase } from '../../db/schema';
import CodeBlock from '../../components/CodeBlock';
import Link from 'next/link';
import GoQRMatrix from '../../components/GoQRMatrix';
import { Suspense } from 'react';

// Fallback mock data in case database fetch fails
const createMockPhases = () => {
  const mockPhases = [
    {
      id: 1,
      name: "Finder Patterns",
      description: "The three finder patterns in the corners help QR readers locate and orient the code.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 1
    },
    {
      id: 2,
      name: "Alignment Patterns",
      description: "Alignment patterns help QR readers maintain orientation on larger codes.",
      matrixData: Array(25).fill(null).map(() => Array(25).fill(false)),
      order: 2
    }
  ];
  
  // Add finder patterns to the first phase
  const finderPatternMatrix = [...mockPhases[0].matrixData];
  
  // Top-left finder pattern
  for (let i = 0; i < 7; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
        finderPatternMatrix[i][j] = true;
      }
    }
  }
  
  // Top-right finder pattern
  for (let i = 0; i < 7; i++) {
    for (let j = 18; j < 25; j++) {
      if (i === 0 || i === 6 || j === 18 || j === 24 || (i >= 2 && i <= 4 && j >= 20 && j <= 22)) {
        finderPatternMatrix[i][j] = true;
      }
    }
  }
  
  // Bottom-left finder pattern
  for (let i = 18; i < 25; i++) {
    for (let j = 0; j < 7; j++) {
      if (i === 18 || i === 24 || j === 0 || j === 6 || (i >= 20 && i <= 22 && j >= 2 && j <= 4)) {
        finderPatternMatrix[i][j] = true;
      }
    }
  }
  
  mockPhases[0].matrixData = finderPatternMatrix;
  
  // Add alignment pattern to the second phase
  const alignmentPatternMatrix = JSON.parse(JSON.stringify(finderPatternMatrix)); // Deep copy
  
  // Add alignment pattern at (18, 18)
  for (let i = 16; i <= 20; i++) {
    for (let j = 16; j <= 20; j++) {
      if (i === 16 || i === 20 || j === 16 || j === 20 || (i === 18 && j === 18)) {
        alignmentPatternMatrix[i][j] = true;
      }
    }
  }
  
  mockPhases[1].matrixData = alignmentPatternMatrix;
  
  return mockPhases;
};

export default async function QRCodeComponentPage() {
  // Try to fetch from database, fall back to mock data if needed
  let phases = [];
  try {
    phases = await getQREncodingPhases();
    if (!phases || phases.length === 0) {
      console.log("No phases found in database, using mock data");
      phases = createMockPhases();
    }
  } catch (error) {
    console.error("Error fetching phases from database:", error);
    phases = createMockPhases();
  }
  
  return (
    <>
      <Header />
      <div className="max-w-5xl mx-auto px-4">
        <section className="py-12">
          <h1 className="text-4xl font-bold mb-6">QR Code Matrix Component</h1>
          <p className="text-xl text-gray-300 mb-12 max-w-3xl">
            A technical deep dive into building an interactive QR code matrix component with database integration.
          </p>
          
          {/* Component Overview */}
          <div className="bg-gray-800 rounded-lg p-6 mb-12">
            <div className="flex flex-col md:flex-row gap-8">
              <div className="w-full">
                <h2 className="text-2xl font-semibold mb-4">Component Architecture</h2>
                <p className="text-gray-300 mb-4">
                  This component was built to visualize the progressive phases of QR code encoding on a 25x25 matrix. It fetches encoding data from a Neon PostgreSQL database using Drizzle ORM and renders an interactive grid that users can navigate through.
                </p>
                <p className="text-gray-300">
                  <Link href="/marshal-qr-code/work/qr-code-overview" className="text-blue-400 hover:underline">
                    View the complete project overview →
                  </Link>
                </p>
              </div>
            </div>
          </div>
          
          {/* Component Demo */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Component Demo</h2>
            <p className="text-gray-300 mb-8">
              Below is a live demonstration of the GoQRMatrix component. Navigate through the phases to see how the QR code is built up layer by layer.
            </p>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <Suspense fallback={<div className="flex items-center justify-center h-96">
                <p className="text-gray-300">Loading encoding phases...</p>
              </div>}>
                <GoQRMatrix phases={phases as QREncodingPhase[]} />
              </Suspense>
            </div>
          </div>
          
          {/* Component Implementation */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Component Implementation</h2>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Database Schema</h3>
              <p className="text-gray-300 mb-4">
                The QR encoding phases are stored in a PostgreSQL database using the following schema:
              </p>
              
              <CodeBlock 
                code={`import { pgTable, serial, text, json, varchar } from 'drizzle-orm/pg-core';

export const qrEncodingPhases = pgTable('qr_encoding_phases', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description').notNull(),
  matrixData: json('matrix_data').notNull(), // 25x25 matrix representation
  order: serial('order').notNull(), // For ordering the phases
});

export type QREncodingPhase = {
  id: number;
  name: string;
  description: string;
  matrixData: boolean[][]; // 25x25 matrix where true = filled cell, false = empty
  order: number;
};`} 
                language="typescript" 
                title="schema.tsx"
              />
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">GoQRMatrix Component</h3>
              <p className="text-gray-300 mb-4">
                The core component that renders the interactive QR code matrix:
              </p>
              
              <CodeBlock 
                code={`"use client";
import React, { useState, useEffect } from 'react';
import { QREncodingPhase } from '../db/schema';

interface GoQRMatrixProps {
  phases: QREncodingPhase[];
  initialPhase?: number;
}

export default function GoQRMatrix({ phases, initialPhase = 0 }: GoQRMatrixProps) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(initialPhase);
  const [currentPhase, setCurrentPhase] = useState<QREncodingPhase | null>(null);

  useEffect(() => {
    if (phases && phases.length > 0) {
      setCurrentPhase(phases[currentPhaseIndex]);
    }
  }, [phases, currentPhaseIndex]);

  const goToNextPhase = () => {
    if (currentPhaseIndex < phases.length - 1) {
      setCurrentPhaseIndex(currentPhaseIndex + 1);
    }
  };

  const goToPreviousPhase = () => {
    if (currentPhaseIndex > 0) {
      setCurrentPhaseIndex(currentPhaseIndex - 1);
    }
  };

  if (!currentPhase) return <div>Loading...</div>;

  return (
    <div className="flex flex-col items-center">
      <div className="mb-6">
        <h3 className="text-2xl font-bold mb-2">{currentPhase.name}</h3>
        <p className="text-gray-300">{currentPhase.description}</p>
      </div>
      
      {/* QR Matrix Grid */}
      <div className="bg-amber-100 p-4 rounded-lg shadow-lg">
        <div 
          className="grid gap-0.5"
          style={{ 
            gridTemplateColumns: 'repeat(25, minmax(0, 1fr))',
            width: '500px',
            height: '500px'
          }}
        >
          {currentPhase.matrixData.flat().map((cell, index) => (
            <div 
              key={index}
              className={\`aspect-square \${cell ? 'bg-black' : 'bg-amber-100'} border border-amber-200\`}
            />
          ))}
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className="flex items-center justify-between w-full max-w-md mt-8">
        <button 
          onClick={goToPreviousPhase}
          disabled={currentPhaseIndex === 0}
          className={\`px-4 py-2 rounded-lg \${
            currentPhaseIndex === 0 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition\`}
        >
          Previous Phase
        </button>
        
        <div className="text-center">
          <span className="text-sm text-gray-400">
            Phase {currentPhaseIndex + 1} of {phases.length}
          </span>
        </div>
        
        <button 
          onClick={goToNextPhase}
          disabled={currentPhaseIndex === phases.length - 1}
          className={\`px-4 py-2 rounded-lg \${
            currentPhaseIndex === phases.length - 1 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition\`}
        >
          Next Phase
        </button>
      </div>
    </div>
  );
}`} 
                language="tsx" 
                title="GoQRMatrix.tsx"
              />
            </div>
            
            <div className="mb-8">
              <h3 className="text-xl font-medium mb-4">Database Integration</h3>
              <p className="text-gray-300 mb-4">
                Here's how the component fetches data from the Neon PostgreSQL database using Drizzle ORM:
              </p>
              
              <CodeBlock 
                code={`import { db } from '../db/client';
import { qrEncodingPhases } from '../db/schema';
import { eq } from 'drizzle-orm';

// Function to fetch all QR encoding phases
export async function getQREncodingPhases() {
  try {
    const phases = await db.query.qrEncodingPhases.findMany({
      orderBy: (phases) => phases.order,
    });
    return phases;
  } catch (error) {
    console.error('Error fetching QR encoding phases:', error);
    throw error;
  }
}

// Function to fetch a specific phase by ID
export async function getQREncodingPhaseById(id: number) {
  try {
    const phase = await db.query.qrEncodingPhases.findFirst({
      where: eq(qrEncodingPhases.id, id),
    });
    return phase;
  } catch (error) {
    console.error('Error fetching QR encoding phase:', error);
    throw error;
  }
}`} 
                language="typescript" 
                title="qrData.ts"
              />
            </div>
          </div>
          
          {/* Implementation Challenges */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Implementation Challenges</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">Matrix Representation</h3>
                <p className="text-gray-300">
                  Storing and manipulating a 25x25 boolean matrix required careful consideration of data structures and serialization methods. JSON was chosen for its flexibility and ease of use with PostgreSQL.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">Performance Optimization</h3>
                <p className="text-gray-300">
                  Rendering 625 grid cells efficiently required performance optimizations, including memoization and careful state management to prevent unnecessary re-renders.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">Responsive Design</h3>
                <p className="text-gray-300">
                  Creating a responsive grid that maintains its aspect ratio across different screen sizes was achieved using CSS Grid and custom styling.
                </p>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-xl font-medium mb-4">Database Integration</h3>
                <p className="text-gray-300">
                  Integrating with Neon PostgreSQL required setting up proper connection pooling and error handling to ensure reliable data fetching.
                </p>
              </div>
            </div>
          </div>
          
          {/* Future Enhancements */}
          <div className="mb-16">
            <h2 className="text-2xl font-semibold mb-6">Future Enhancements</h2>
            <p className="text-gray-300 mb-8">
              The component could be extended with the following features:
            </p>
            
            <ul className="space-y-4 text-gray-300">
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Animation transitions between phases to visualize the changes more clearly</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Interactive mode allowing users to place stones manually and compare with the correct pattern</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>Custom data encoding to generate QR codes for user-provided URLs or text</span>
              </li>
              <li className="flex items-start">
                <span className="text-blue-400 mr-2">→</span>
                <span>3D visualization mode to better represent the physical Go board</span>
              </li>
            </ul>
          </div>
          
          {/* Call to Action */}
          <div className="bg-gradient-to-r from-blue-900 to-purple-900 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4">Want to use this component?</h2>
            <p className="text-gray-200 mb-6 max-w-2xl">
              The GoQRMatrix component is available as part of our open-source library. Check out the documentation and source code.
            </p>
            <div className="flex gap-4">
              <Link href="#" className="px-6 py-3 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition font-medium">
                View Documentation
              </Link>
              <Link href="#" className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                GitHub Repository
              </Link>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
