"use client";

import { useState, useEffect } from 'react';
import { generateQRCode } from '../utils/qrCodeGenerator';

interface QRCodeProps {
  url?: string;
  size?: number;
  showControls?: boolean;
}

export default function ClientQRComponent({ url = 'https://marshal.squaloo.com', size = 300, showControls = true }: QRCodeProps) {
  const [qrData, setQrData] = useState<number[][]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState(url);
  const [currentSize, setCurrentSize] = useState(size);

  useEffect(() => {
    async function generateCode() {
      try {
        setIsLoading(true);
        const qrMatrix = await generateQRCode(currentUrl);
        setQrData(qrMatrix);
        setError(null);
      } catch (err) {
        setError('Failed to generate QR code');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    generateCode();
  }, [currentUrl]);

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentUrl(e.target.value);
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentSize(Number(e.target.value));
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading QR code...</div>;
  }

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  const cellSize = currentSize / qrData.length;

  return (
    <div className="flex flex-col items-center">
      <div 
        className="border border-gray-300 bg-white"
        style={{ 
          width: `${currentSize}px`, 
          height: `${currentSize}px`,
          display: 'grid',
          gridTemplateColumns: `repeat(${qrData.length}, 1fr)`
        }}
      >
        {qrData.flat().map((cell, index) => (
          <div 
            key={index}
            style={{ 
              width: `${cellSize}px`, 
              height: `${cellSize}px`,
              backgroundColor: cell === 1 ? 'black' : 'white'
            }}
          />
        ))}
      </div>

      {showControls && (
        <div className="mt-4 w-full max-w-md">
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">URL</label>
            <input
              type="text"
              value={currentUrl}
              onChange={handleUrlChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Size: {currentSize}px</label>
            <input
              type="range"
              min="100"
              max="500"
              value={currentSize}
              onChange={handleSizeChange}
              className="w-full"
            />
          </div>
        </div>
      )}
    </div>
  );
} 