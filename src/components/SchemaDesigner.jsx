import { useState } from "react";
import { Sparkles, Wand2 } from "lucide-react";

const exampleSpec = `{
  "entities": [
    {
      "name": "User",
      "columns": [
        { "name": "id", "type": "serial", "primary": true },
        { "name": "name", "type": "varchar(255)" },
        { "name": "email", "type": "varchar(255)", "unique": true },
        { "name": "createdAt", "type": "timestamp", "default": "now()" }
      ]
    },
    {
      "name": "Post",
      "columns": [
        { "name": "id", "type": "serial", "primary": true },
        { "name": "userId", "type": "integer", "references": "User.id" },
        { "name": "title", "type": "varchar(255)" },
        { "name": "content", "type": "text" }
      ]
    }
  ]
}`;

function toSnakeCase(str) {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function drizzleTypeFor(t) {
  // Map a few common types
  const base = t.toLowerCase();
  if (base.startsWith("varchar")) return `varchar${t.slice("varchar".length)}`;
  if (base === "serial") return "serial";
  if (base === "integer" || base === "int") return "integer";
  if (base === "text") return "text";
  if (base === "timestamp") return "timestamp";
  if (base === "boolean") return "boolean";
  return "text";
}

function generateDrizzle(schemaSpec) {
  const { entities } = schemaSpec;
  const lines = [];
  lines.push("import { pgTable, serial, varchar, integer, timestamp, text, boolean } from 'drizzle-orm/pg-core';\n");
  entities.forEach((e) => {
    const tableVar = toSnakeCase(e.name);
    lines.push(`export const ${tableVar} = pgTable('${tableVar}', {`);
    e.columns.forEach((c) => {
      const t = drizzleTypeFor(c.type);
      const parts = [ `${t}('${c.name}')` ];
      if (c.primary) parts.push(".primaryKey()");
      if (c.notNull) parts.push(".notNull()");
      if (c.unique) parts.push(".unique()");
      if (c.default) parts.push(`.default(${c.default})`);
      lines.push(`  ${c.name}: ${parts.join("")},${c.references ? ` // references: ${c.references}` : ""}`);
    });
    lines.push("});\n");
  });
  return lines.join("\n");
}

export default function SchemaDesigner({ onGenerate }) {
  const [spec, setSpec] = useState(exampleSpec);

  const handleGenerate = () => {
    try {
      const json = JSON.parse(spec);
      const code = generateDrizzle(json);
      onGenerate({ code, spec: json });
    } catch (e) {
      alert("Invalid JSON spec. Please fix and try again.\n\n" + e.message);
    }
  };

  const quickIdea = () => {
    // lightweight "AI" helper — expands single line comma separated entities into a starter JSON
    const idea = prompt("Describe entities (e.g. User(id,name,email), Post(id,userId,title))");
    if (!idea) return;
    const entities = [];
    idea.split(/\s*,\s*/).forEach((chunk) => {
      const m = chunk.match(/(\w+)\(([^)]*)\)/);
      if (m) {
        const name = m[1];
        const fields = m[2].split(/\s*,\s*/).filter(Boolean);
        const columns = fields.map((f, idx) => {
          const lower = f.toLowerCase();
          const isId = lower === "id" || lower.endsWith("id");
          return {
            name: f,
            type: isId ? (lower === "id" ? "serial" : "integer") : "varchar(255)",
            primary: f === "id",
          };
        });
        entities.push({ name, columns });
      }
    });
    setSpec(JSON.stringify({ entities }, null, 2));
  };

  return (
    <section className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2"><Sparkles size={18}/> AI Schema Designer</h2>
        <button onClick={quickIdea} className="inline-flex items-center gap-2 text-sm px-3 py-1.5 rounded-md bg-gradient-to-r from-violet-500 to-blue-500 text-white shadow hover:opacity-90">
          <Wand2 size={16}/> Quick Idea
        </button>
      </div>
      <p className="text-sm text-gray-600 mb-3">Describe your data model and generate a Drizzle schema for a PGlite-friendly Postgres setup.</p>
      <textarea
        value={spec}
        onChange={(e) => setSpec(e.target.value)}
        className="w-full h-56 font-mono text-sm p-3 border rounded-md bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
        spellCheck={false}
      />
      <div className="mt-3 flex items-center gap-3">
        <button onClick={handleGenerate} className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800">Generate Drizzle Schema</button>
        <button onClick={() => setSpec(exampleSpec)} className="px-3 py-2 rounded-md text-sm border">Use Example</button>
      </div>
    </section>
  );
}
