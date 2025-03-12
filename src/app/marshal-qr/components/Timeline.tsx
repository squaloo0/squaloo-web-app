"use client";
import { useState, ReactNode, useEffect } from 'react';
import Link from 'next/link';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-sql';

export type TimelineEvent = {
  title: string;
  description: string;
  links?: Array<{
    text: string;
    url: string;
    isExternal?: boolean;
  }>;
  mediaType?: 'image' | 'video' | 'code' | 'link' | 'embed' | 'gallery';
  mediaContent?: string | Array<{src: string, alt: string, caption?: string}>;
  mediaCaption?: string;
  mediaLanguage?: string;
  mediaLink?: string;
  codeTitle?: string;
};

interface TimelineProps {
  events: TimelineEvent[];
}

export default function Timeline({ events }: TimelineProps) {
  const [activeEvent, setActiveEvent] = useState(0);
  const [activeGalleryImage, setActiveGalleryImage] = useState(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    // Highlight code when component mounts or active event changes
    Prism.highlightAll();
  }, [activeEvent]);

  const copyToClipboard = () => {
    if (events[activeEvent].mediaType === 'code' && events[activeEvent].mediaContent) {
      navigator.clipboard.writeText(events[activeEvent].mediaContent as string);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Function to render description with links
  const renderDescription = (description: string, links?: Array<{text: string, url: string, isExternal?: boolean}>): ReactNode => {
    if (!links || links.length === 0) return description;

    const parts: ReactNode[] = [];
    let lastIndex = 0;

    // Sort links by the position of their text in the description
    const sortedLinks = [...(links || [])].sort((a, b) => {
      return description.indexOf(a.text) - description.indexOf(b.text);
    });

    // Replace each link text with a Link component
    sortedLinks.forEach((link, i) => {
      const index = description.indexOf(link.text, lastIndex);
      if (index === -1) return;

      // Add text before the link
      if (index > lastIndex) {
        parts.push(description.substring(lastIndex, index));
      }

      // Add the link
      if (link.isExternal) {
        parts.push(
          <a 
            key={i} 
            href={link.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300"
          >
            {link.text}
          </a>
        );
      } else {
        parts.push(
          <Link 
            key={i} 
            href={link.url}
            className="text-blue-400 hover:text-blue-300"
          >
            {link.text}
          </Link>
        );
      }

      lastIndex = index + link.text.length;
    });

    // Add any remaining text
    if (lastIndex < description.length) {
      parts.push(description.substring(lastIndex));
    }

    return parts;
  };

  return (
    <div className="my-8">
      {/* Timeline navigation */}
      <div className="flex mb-6 overflow-x-auto pb-2 timeline-scrollbar">
        {events.map((event, index) => (
          <button
            key={index}
            onClick={() => {
              setActiveEvent(index);
              setActiveGalleryImage(0); // Reset gallery image when changing events
            }}
            className={`flex-shrink-0 px-4 py-2 rounded-full mr-3 transition-all ${
              activeEvent === index
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {index + 1}. {event.title}
          </button>
        ))}
      </div>

      {/* Timeline content */}
      <div className="bg-gray-700 rounded-lg p-6 animate-fadeIn">
        <h3 className="text-xl font-semibold mb-3">{events[activeEvent].title}</h3>
        <p className="text-gray-300 mb-6">
          {renderDescription(events[activeEvent].description, events[activeEvent].links)}
        </p>
        
        {events[activeEvent].mediaType && (
          <div className="mt-4 border border-gray-600 rounded-lg overflow-hidden">
            {events[activeEvent].mediaType === 'image' && (
              <div className="bg-gray-800 h-64 flex items-center justify-center">
                {events[activeEvent].mediaContent ? (
                  <img 
                    src={events[activeEvent].mediaContent as string} 
                    alt={events[activeEvent].mediaCaption || events[activeEvent].title} 
                    className="max-h-full max-w-full object-contain"
                  />
                ) : (
                  <div className="text-gray-500 italic">Image placeholder - content will be added later</div>
                )}
              </div>
            )}
            
            {events[activeEvent].mediaType === 'video' && (
              <div className="bg-gray-800 h-64 flex items-center justify-center">
                {events[activeEvent].mediaContent ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={events[activeEvent].mediaContent as string}
                    title={events[activeEvent].title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="text-gray-500 italic">Video placeholder - content will be added later</div>
                )}
              </div>
            )}
            
            {/* Gallery type for multiple images */}
            {events[activeEvent].mediaType === 'gallery' && (
              <div className="bg-gray-800">
                {Array.isArray(events[activeEvent].mediaContent) && events[activeEvent].mediaContent.length > 0 ? (
                  <div>
                    <div className="h-64 flex items-center justify-center">
                      <img 
                        src={(events[activeEvent].mediaContent[activeGalleryImage] as {src: string}).src} 
                        alt={(events[activeEvent].mediaContent[activeGalleryImage] as {alt: string}).alt} 
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    {(events[activeEvent].mediaContent[activeGalleryImage] as {caption?: string}).caption && (
                      <div className="p-3 bg-gray-800 border-t border-gray-700">
                        <p className="text-sm text-gray-400">
                          {(events[activeEvent].mediaContent[activeGalleryImage] as {caption?: string}).caption}
                        </p>
                      </div>
                    )}
                    {events[activeEvent].mediaContent.length > 1 && (
                      <div className="flex justify-center p-3 bg-gray-800 border-t border-gray-700">
                        {events[activeEvent].mediaContent.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setActiveGalleryImage(index)}
                            className={`w-3 h-3 mx-1 rounded-full ${
                              activeGalleryImage === index ? 'bg-blue-500' : 'bg-gray-500'
                            }`}
                            aria-label={`View image ${index + 1}`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-500 italic flex items-center justify-center h-64">
                    Gallery placeholder - images will be added later
                  </div>
                )}
              </div>
            )}
            
            {/* New embed type for YouTube videos */}
            {events[activeEvent].mediaType === 'embed' && (
              <div className="bg-gray-800 aspect-w-16 aspect-h-9">
                {events[activeEvent].mediaContent ? (
                  <iframe
                    src={events[activeEvent].mediaContent as string}
                    title={events[activeEvent].title}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                ) : (
                  <div className="text-gray-500 italic flex items-center justify-center h-full">Video embed placeholder - content will be added later</div>
                )}
              </div>
            )}
            
            {events[activeEvent].mediaType === 'code' && (
              <div className="rounded-lg overflow-hidden bg-gray-900 border border-gray-800 shadow-lg">
                {events[activeEvent].codeTitle && (
                  <div className="bg-gray-800 px-4 py-2 flex justify-between items-center">
                    <div className="flex items-center">
                      <span className="h-3 w-3 rounded-full bg-red-500 mr-2"></span>
                      <span className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></span>
                      <span className="h-3 w-3 rounded-full bg-green-500 mr-2"></span>
                      <span className="text-gray-300 text-sm font-mono ml-2">{events[activeEvent].codeTitle}</span>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="text-gray-400 hover:text-white text-sm flex items-center transition"
                      aria-label={copied ? "Copied to clipboard" : "Copy to clipboard"}
                    >
                      {copied ? (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div 
                  className="p-4 overflow-auto code-scrollbar" 
                  style={{ maxHeight: "400px" }}
                >
                  <pre className={`language-${events[activeEvent].mediaLanguage || 'javascript'}`} style={{ margin: 0 }}>
                    <code className={`language-${events[activeEvent].mediaLanguage || 'javascript'}`}>
                      {events[activeEvent].mediaContent as string}
                    </code>
                  </pre>
                </div>
              </div>
            )}
            
            {events[activeEvent].mediaType === 'link' && (
              <div className="bg-gray-800 p-4 flex justify-center">
                {events[activeEvent].mediaContent ? (
                  <a 
                    href={events[activeEvent].mediaLink || events[activeEvent].mediaContent as string}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    {events[activeEvent].mediaCaption || "View Resource"}
                  </a>
                ) : (
                  <div className="text-gray-500 italic">Link placeholder - content will be added later</div>
                )}
              </div>
            )}
            
            {events[activeEvent].mediaCaption && events[activeEvent].mediaType !== 'gallery' && events[activeEvent].mediaType !== 'code' && (
              <div className="p-3 bg-gray-800 border-t border-gray-700">
                <p className="text-sm text-gray-400">{events[activeEvent].mediaCaption}</p>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Timeline progress */}
      <div className="mt-6 bg-gray-700 h-1 rounded-full overflow-hidden">
        <div 
          className="bg-blue-600 h-full transition-all duration-300"
          style={{ width: `${((activeEvent + 1) / events.length) * 100}%` }}
        ></div>
      </div>
    </div>
  );
} 