import { useEffect, useMemo, useState } from "react";
import { Braces } from "lucide-react";

// Lightweight parser tailored to the generated Drizzle format in this app.
function parseSchema(code) {
  if (!code) return { tables: [], relations: [] };
  const tables = [];
  const relations = [];

  // Match: export const table_name = pgTable('table_name', { ... });
  const tableBlocks = [...code.matchAll(/export\s+const\s+(\w+)\s*=\s*pgTable\('\1'\s*,\s*\{([\s\S]*?)\}\);/g)];
  tableBlocks.forEach((m) => {
    const varName = m[1];
    const body = m[2];
    const cols = [];
    // Match lines like: name: varchar('name').notNull().default(now()), // references: User.id
    const colRegex = /\s*(\w+)\s*:\s*([a-zA-Z]+)\('([\w_]+)'\)([^,]*),(?:\s*\/\/\s*references:\s*([\w\.]+))?/g;
    let colMatch;
    while ((colMatch = colRegex.exec(body)) !== null) {
      const [, colVar, type, name, chains, ref] = colMatch;
      const constraints = [];
      if (chains.includes("primaryKey()")) constraints.push("PK");
      if (chains.includes("notNull()")) constraints.push("NOT NULL");
      if (chains.includes("unique()")) constraints.push("UNIQUE");
      const defMatch = chains.match(/\.default\(([^)]+)\)/);
      if (defMatch) constraints.push(`DEFAULT ${defMatch[1]}`);
      cols.push({ name, type, constraints });
      if (ref) {
        const [refTable, refCol] = ref.split(".");
        relations.push({ from: varName, to: refTable.toLowerCase(), label: `${name} → ${ref}` });
      }
    }
    tables.push({ name: varName, columns: cols });
  });

  return { tables, relations };
}

export default function AstInsights({ code, onModel }) {
  const model = useMemo(() => parseSchema(code), [code]);
  const [open, setOpen] = useState(true);

  useEffect(() => {
    onModel?.(model);
  }, [model, onModel]);

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Braces size={18}/> AST Insights</h2>
        <button onClick={() => setOpen((o) => !o)} className="text-sm underline">
          {open ? 'Hide' : 'Show'}
        </button>
      </div>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Tables</h3>
            <ul className="space-y-2">
              {model.tables.map((t) => (
                <li key={t.name} className="border rounded p-3">
                  <div className="font-medium mb-1">{t.name}</div>
                  <ul className="text-xs text-gray-700 space-y-1">
                    {t.columns.map((c) => (
                      <li key={c.name}>
                        <span className="font-mono">{c.name}</span>
                        <span className="mx-1">:</span>
                        <span className="font-mono text-gray-900">{c.type}</span>
                        {c.constraints.length > 0 && (
                          <span className="ml-2 text-gray-500">[{c.constraints.join(', ')}]</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Relations</h3>
            {model.relations.length === 0 ? (
              <p className="text-sm text-gray-600">No relations detected.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {model.relations.map((r, i) => (
                  <li key={i} className="border rounded p-2">
                    {r.from} → {r.to} <span className="text-gray-500">({r.label})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
