"use client";

import { useState } from "react";
import MediaGrid from "./MediaGrid";
import LinksList from "./LinksList";

interface Props {
  data: {
    images: string[];
    videos: string[];
    links: { text: string; href: string }[];
    h1s: string[];
  };
  selectedItems: string[];
  toggleItemSelection: (item: string) => void;
}

export default function ResultsTabs({ data, selectedItems, toggleItemSelection }: Props) {
  const [activeTab, setActiveTab] = useState<"images" | "links" | "videos">("images");

  const tabs = [
    { id: "images", label: "Images", count: data.images.length },
    { id: "videos", label: "Videos", count: data.videos.length },
    { id: "links", label: "Links", count: data.links.length },
  ];

  return (
    <div className="glass-morphism overflow-hidden">
      <div className="flex border-b border-zinc-800 p-2 space-x-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
              activeTab === tab.id
                ? "bg-zinc-800 text-blue-400"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
            }`}
          >
            {tab.label}
            <span className="ml-2 text-xs opacity-50 px-2 py-0.5 rounded-full bg-zinc-900">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="p-6 h-[600px] overflow-y-auto">
        {activeTab === "images" && (
          <MediaGrid 
            items={data.images} 
            type="image" 
            selectedItems={selectedItems} 
            onToggle={toggleItemSelection} 
          />
        )}
        {activeTab === "videos" && (
          <MediaGrid 
            items={data.videos} 
            type="video" 
            selectedItems={selectedItems} 
            onToggle={toggleItemSelection} 
          />
        )}
        {activeTab === "links" && <LinksList links={data.links} />}
      </div>
    </div>
  );
}
