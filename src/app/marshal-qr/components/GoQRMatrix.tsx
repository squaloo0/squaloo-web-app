"use client";
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
      
      {/* QR Matrix Grid - Responsive but not too small on desktop */}
      <div className="bg-white p-4 sm:p-6 md:p-8 rounded-lg shadow-lg">
        <div 
          className="grid grid-cols-25 gap-0"
          style={{ 
            gridTemplateColumns: 'repeat(25, minmax(0, 1fr))',
            width: '100%',
            maxWidth: '300px',
            minWidth: '250px',
            height: 'auto',
            aspectRatio: '1/1',
            backgroundColor: 'white',
            padding: '8px',
            '@media (min-width: 640px)': {
              maxWidth: '400px'
            },
            '@media (min-width: 768px)': {
              maxWidth: '500px'
            }
          }}
        >
          {currentPhase.matrixData.map((row, rowIndex) => 
            row.map((cell, colIndex) => (
              <div 
                key={`${rowIndex}-${colIndex}`}
                className={`aspect-square ${cell ? 'bg-black' : 'bg-white'}`}
                style={{ 
                  gridRow: rowIndex + 1, 
                  gridColumn: colIndex + 1,
                  border: '1px solid rgba(0,0,0,0.05)'
                }}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Navigation Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between w-full max-w-md mt-8 gap-4 sm:gap-0">
        <button 
          onClick={goToPreviousPhase}
          disabled={currentPhaseIndex === 0}
          className={`px-4 py-2 rounded-lg w-full sm:w-auto ${
            currentPhaseIndex === 0 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          Previous Phase
        </button>
        
        <div className="text-center my-2 sm:my-0">
          <span className="text-sm text-gray-400">
            Phase {currentPhaseIndex + 1} of {phases.length}
          </span>
        </div>
        
        <button 
          onClick={goToNextPhase}
          disabled={currentPhaseIndex === phases.length - 1}
          className={`px-4 py-2 rounded-lg w-full sm:w-auto ${
            currentPhaseIndex === phases.length - 1 
              ? 'bg-gray-600 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700'
          } transition`}
        >
          Next Phase
        </button>
      </div>
    </div>
  );
}
