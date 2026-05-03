"use client";

import { useState } from "react";

interface Props {
  onScrape: (url: string) => void;
  loading: boolean;
}

export default function ScraperInput({ onScrape, loading }: Props) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url) onScrape(url);
  };

  return (
    <form onSubmit={handleSubmit} className="relative group">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
      <div className="relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden p-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL (e.g. https://example.com)"
          className="flex-1 bg-transparent border-none outline-none text-white px-6 py-4 placeholder-zinc-500 text-lg"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-8 py-4 rounded-xl font-semibold transition-all flex items-center shadow-lg shadow-blue-900/20"
        >
          {loading ? "Analyzing..." : "Scrape Now"}
          {!loading && (
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
