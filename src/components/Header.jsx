import { Rocket, Settings } from "lucide-react";

export default function Header() {
  return (
    <header className="w-full sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-gray-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-white flex items-center justify-center shadow">
            <Rocket size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Schema Studio</h1>
            <p className="text-xs text-gray-500 -mt-0.5">Design • Parse • Visualize</p>
          </div>
        </div>
        <a
          href="https://orm.drizzle.team/"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <Settings size={16} />
          Docs
        </a>
      </div>
    </header>
  );
}
