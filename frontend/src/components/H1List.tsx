"use client";

interface Props {
  h1s: string[];
}

export default function H1List({ h1s }: Props) {
  if (h1s.length === 0) return <p className="text-zinc-500">No H1 tags found.</p>;

  return (
    <div className="space-y-3">
      {h1s.map((h1, i) => (
        <div
          key={i}
          className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-white font-semibold text-lg"
        >
          {h1}
        </div>
      ))}
    </div>
  );
}
