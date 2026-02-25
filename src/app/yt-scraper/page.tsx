"use client";

import { useState } from "react";

interface VideoData {
  title: string;
  description: string;
  thumbnail: string;
}

export default function ScraperPage() {
  const [url, setUrl] = useState("");
  const [videoData, setVideoData] = useState<VideoData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setVideoData(null);
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      if (!response.ok) {
        throw new Error('Failed to scrape video data');
      }

      const data = await response.json();
      setVideoData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">YouTube Scraper</h1>
      <form onSubmit={handleSubmit}>
        <div className="flex">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter YouTube URL"
            className="flex-grow p-2 border rounded-l"
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded-r" disabled={loading}>
            {loading ? 'Scraping...' : 'Scrape'}
          </button>
        </div>
      </form>

      {loading && <p className="mt-4">Loading...</p>}
      {error && <p className="mt-4 text-red-500">{error}</p>}

      {videoData && (
        <div className="mt-4 border rounded p-4">
          <h2 className="text-xl font-bold">{videoData.title}</h2>
          <p className="mt-2">{videoData.description}</p>
          <img src={videoData.thumbnail} alt="Video thumbnail" className="mt-2" />
        </div>
      )}
    </div>
  );
}
