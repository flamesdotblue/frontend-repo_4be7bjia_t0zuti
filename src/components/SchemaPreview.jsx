import { Copy } from "lucide-react";
import { useState } from "react";

export default function SchemaPreview({ code }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(code || "");
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {}
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">Drizzle Schema</h2>
        <button onClick={copy} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border hover:bg-gray-50">
          <Copy size={16}/> {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="w-full h-64 overflow-auto font-mono text-xs p-3 border rounded-md bg-gray-50"><code>{code || '// Generate a schema to see it here'}</code></pre>
    </section>
  );
}
