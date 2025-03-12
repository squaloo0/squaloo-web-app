"use client";
import { useState } from 'react';
import GoQRMatrix from './GoQRMatrix';
import CodeBlock from './CodeBlock';
import Link from 'next/link';

// Define the QREncodingPhase type
type QREncodingPhase = {
  id: number;
  name: string;
  description: string;
  matrix_data: boolean[][];
  order: number;
};

export default function ClientQRComponent({ initialPhases }: { initialPhases: QREncodingPhase[] }) {
  const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
  const phases = initialPhases;

  // Handle phase navigation
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

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6">Interactive QR Encoding Process</h2>
      <p className="text-gray-300 mb-8">
        Navigate through the different phases of QR code encoding to see how the matrix is built up layer by layer. Each phase represents a specific step in the encoding process.
      </p>
      
      {phases.length > 0 ? (
        <>
          <div className="flex justify-between items-center mb-6">
            <button 
              onClick={goToPreviousPhase}
              disabled={currentPhaseIndex === 0}
              className={`px-4 py-2 rounded ${currentPhaseIndex === 0 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Previous Phase
            </button>
            <div className="text-lg font-medium text-white">
              Phase {currentPhaseIndex + 1}: {phases[currentPhaseIndex].name}
            </div>
            <button 
              onClick={goToNextPhase}
              disabled={currentPhaseIndex === phases.length - 1}
              className={`px-4 py-2 rounded ${currentPhaseIndex === phases.length - 1 ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
            >
              Next Phase
            </button>
          </div>
          
          <div className="mb-6">
            <p className="text-gray-300">{phases[currentPhaseIndex].description}</p>
          </div>
          
          <div className="flex justify-center mb-8 bg-gray-700 p-6 rounded-lg">
            <GoQRMatrix matrix={phases[currentPhaseIndex].matrix_data} />
          </div>
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-300">No QR code data available.</p>
        </div>
      )}
    </div>
  );
} 