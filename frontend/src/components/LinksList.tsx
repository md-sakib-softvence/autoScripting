"use client";

interface Props {
  links: { text: string; href: string }[];
}

export default function LinksList({ links }: Props) {
  if (links.length === 0) return <p className="text-zinc-500">No links found.</p>;

  return (
    <div className="space-y-3">
      {links.map((link, i) => (
        <a
          key={i}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-blue-500/50 transition-all group"
        >
          <div className="font-medium text-blue-400 group-hover:text-blue-300 truncate">
            {link.text || "Untitled Link"}
          </div>
          <div className="text-xs text-zinc-500 truncate">{link.href}</div>
        </a>
      ))}
    </div>
  );
}
