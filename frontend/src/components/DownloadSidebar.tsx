import { useState } from "react";
import DownloadModal from "./DownloadModal";

interface Props {
  selectedItems: string[];
  data: any;
  onClear: () => void;
}

export default function DownloadSidebar({ selectedItems, data, onClear }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "downloading" | "success" | "error">("idle");

  const handleDownload = async () => {
    if (selectedItems.length === 0) return;
    
    setModalOpen(true);
    setStatus("downloading");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/scraper/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selectedItems }),
      });

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "scraped-media.zip";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  };

  return (
    <>
      <div className="glass-morphism p-6 sticky top-8">
        <h3 className="text-xl font-bold mb-4">Selection</h3>
        
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center text-sm">
            <span className="text-zinc-400">Items selected:</span>
            <span className="text-blue-400 font-bold">{selectedItems.length}</span>
          </div>
          <div className="h-2 w-full bg-zinc-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-blue-500 transition-all duration-500" 
              style={{ width: `${Math.min(100, (selectedItems.length / (data.images.length + data.videos.length || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>

        <div className="flex flex-col space-y-3">
          <button
            onClick={handleDownload}
            disabled={selectedItems.length === 0}
            className="premium-gradient text-white py-4 rounded-xl font-bold shadow-lg shadow-blue-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:hover:scale-100"
          >
            Download ({selectedItems.length})
          </button>
          <button
            onClick={onClear}
            disabled={selectedItems.length === 0}
            className="bg-zinc-800 text-zinc-400 py-3 rounded-xl font-semibold hover:bg-zinc-700 hover:text-white transition-all disabled:opacity-30"
          >
            Clear Selection
          </button>
        </div>

        <div className="mt-8 text-xs text-zinc-500 leading-relaxed">
          Select media from the grid to add them to your download queue. 
          Bulk downloads will be automatically compressed for convenience.
        </div>
      </div>

      <DownloadModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        status={status} 
        count={selectedItems.length} 
      />
    </>
  );
}
