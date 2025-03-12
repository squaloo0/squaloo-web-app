"use client";
import { useState } from 'react';

interface ImageGalleryProps {
  images: {
    src: string;
    alt: string;
    caption?: string;
  }[];
  placeholderText?: string;
}

export default function ImageGallery({ 
  images = [], 
  placeholderText = "Images will be added here soon" 
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === images.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  const goToImage = (index: number) => {
    setCurrentIndex(index);
  };

  // If no images are provided, show placeholder
  if (images.length === 0) {
    return (
      <div className="mt-6 rounded-lg overflow-hidden bg-gray-700">
        <div className="h-64 flex items-center justify-center">
          <p className="text-gray-400 italic">{placeholderText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 rounded-lg overflow-hidden bg-gray-700">
      <div className="relative">
        {/* Main image */}
        <div className="h-64 relative">
          <img 
            src={images[currentIndex].src} 
            alt={images[currentIndex].alt}
            className="w-full h-full object-contain"
          />
          
          {/* Navigation arrows */}
          {images.length > 1 && (
            <>
              <button 
                onClick={goToPrevious}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                aria-label="Previous image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button 
                onClick={goToNext}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition"
                aria-label="Next image"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
        
        {/* Caption */}
        {images[currentIndex].caption && (
          <div className="p-3 bg-gray-800">
            <p className="text-sm text-gray-300">{images[currentIndex].caption}</p>
          </div>
        )}
      </div>
      
      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex overflow-x-auto p-2 bg-gray-800 gap-2 timeline-scrollbar">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 h-16 w-16 rounded overflow-hidden transition ${
                currentIndex === index ? 'ring-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <img 
                src={image.src} 
                alt={`Thumbnail ${index + 1}`}
                className="h-full w-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
} 