import { useEffect, useMemo, useRef } from "react";

// Simple ERD visualization without external libs.
export default function ErdVisualizer({ model }) {
  const containerRef = useRef(null);

  const layout = useMemo(() => {
    const nodes = model.tables.map((t, idx) => ({
      id: t.name,
      x: (idx % 3) * 280,
      y: Math.floor(idx / 3) * 240,
      table: t,
    }));
    const nodeMap = Object.fromEntries(nodes.map((n) => [n.id.toLowerCase(), n]));
    const edges = model.relations
      .map((r) => ({ from: nodeMap[r.from.toLowerCase()], to: nodeMap[r.to.toLowerCase()], label: r.label }))
      .filter((e) => e.from && e.to);
    return { nodes, edges };
  }, [model]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Optionally, could add pan/zoom here
  }, [layout]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900">ERD</h2>
        <p className="text-sm text-gray-500">Drag to scroll</p>
      </div>
      <div ref={containerRef} className="relative w-full h-[440px] overflow-auto rounded border bg-[conic-gradient(at_20%_20%,#f9fafb,white)]">
        <div className="relative min-w-[900px] min-h-[400px]">
          {/* Edges */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
            {layout.edges.map((e, i) => {
              const x1 = e.from.x + 130;
              const y1 = e.from.y + 24;
              const x2 = e.to.x + 130;
              const y2 = e.to.y + 24;
              const dx = Math.abs(x2 - x1) / 2;
              const path = `M ${x1} ${y1} C ${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`;
              return (
                <g key={i}>
                  <path d={path} className="stroke-violet-400" strokeWidth="2" fill="none" />
                </g>
              );
            })}
          </svg>

          {/* Nodes */}
          {layout.nodes.map((n) => (
            <div key={n.id} style={{ left: n.x, top: n.y }} className="absolute w-[260px]">
              <div className="rounded-lg border shadow-sm bg-white">
                <div className="px-3 py-2 bg-gradient-to-r from-violet-500/10 to-blue-500/10 border-b">
                  <div className="text-sm font-semibold text-gray-800">{n.table.name}</div>
                </div>
                <div className="p-3">
                  <ul className="text-xs text-gray-700 space-y-1">
                    {n.table.columns.map((c) => (
                      <li key={c.name} className="flex items-start gap-2">
                        <span className="font-mono w-24">{c.name}</span>
                        <span className="font-mono text-gray-900">{c.type}</span>
                        {c.constraints?.includes('PK') && (
                          <span className="ml-auto text-[10px] px-1.5 py-0.5 rounded bg-gray-900 text-white">PK</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
