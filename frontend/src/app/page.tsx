"use client";

import { useState } from "react";
import ScraperInput from "@/components/ScraperInput";
import ResultsTabs from "@/components/ResultsTabs";
import DownloadSidebar from "@/components/DownloadSidebar";

export default function Home() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleScrape = async (url: string) => {
    setLoading(true);
    setData(null);
    setSelectedItems([]);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scraper/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Scrape failed", error);
      alert("Failed to fetch data. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (item: string) => {
    setSelectedItems((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  return (
    <main className="min-h-screen p-8 max-w-7xl mx-auto flex flex-col items-center">
      <div className="w-full text-center mt-12 mb-16 animate-fade-in">
        <h1 className="text-6xl font-bold mb-4 tracking-tight">
          Dynamic <span className="text-gradient">Scraper</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto">
          Extract images, videos, links, and content from any URL with precision.
          Powerful Puppeteer-based analysis at your fingertips.
        </p>
      </div>

      <div className="w-full max-w-3xl mb-12 animate-fade-in">
        <ScraperInput onScrape={handleScrape} loading={loading} />
      </div>

      {data && (
        <div className="w-full grid grid-cols-1 lg:grid-cols-4 gap-8 animate-fade-in">
          <div className="lg:col-span-3">
            <ResultsTabs
              data={data}
              selectedItems={selectedItems}
              toggleItemSelection={toggleItemSelection}
            />
          </div>
          <div className="lg:col-span-1">
            <DownloadSidebar selectedItems={selectedItems} data={data} onClear={() => setSelectedItems([])} />
          </div>
        </div>
      )}

      {loading && (
        <div className="mt-20 flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-blue-400 animate-pulse">Analyzing website content...</p>
        </div>
      )}
    </main>
  );
}
