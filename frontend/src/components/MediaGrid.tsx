"use client";

interface Props {
  items: string[];
  type: "image" | "video";
  selectedItems: string[];
  onToggle: (item: string) => void;
}

export default function MediaGrid({ items, type, selectedItems, onToggle }: Props) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <p>No {type}s found on this page.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {items.map((item, index) => (
        <div
          key={index}
          onClick={() => onToggle(item)}
          className={`relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${selectedItems.includes(item)
            ? "border-blue-500 shadow-lg shadow-blue-900/40"
            : "border-zinc-800 hover:border-zinc-600"
            }`}
        >
          {type === "image" ? (
            <img
              src={item}
              alt={`Scraped ${index}`}
              className="w-full h-40 object-cover bg-zinc-800 transition-transform duration-500 group-hover:scale-110"
              onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Error")}
            />
          ) : (
            <div className="w-full h-40 bg-zinc-900 relative group/vid overflow-hidden">
              {item.includes(".mp4") || item.includes(".webm") || item.includes(".ogg") ? (
                <video
                  src={item}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  muted
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-zinc-500 break-all line-clamp-2">{item}</p>
                </div>
              )}
            </div>
          )}

          {/* Hover Overlay with Name */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
            <p className="text-[10px] text-zinc-300 truncate mb-1">
              {item.split('/').pop()?.split('?')[0] || "unnamed file"}
            </p>
            <span className="text-white text-xs font-bold bg-blue-600/80 backdrop-blur-md px-3 py-1.5 rounded-lg w-fit">
              Click to select
            </span>
          </div>

          <div className={`absolute top-2 right-2 flex flex-col space-y-2 transition-all`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedItems.includes(item) ? "bg-blue-500 scale-110" : "bg-black/50 opacity-0 group-hover:opacity-100"
              }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                const link = document.createElement("a");
                link.href = item;
                link.download = `media-${index}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
              className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-blue-500 transition-all shadow-lg"
              title="Download this item"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
