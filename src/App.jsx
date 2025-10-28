import { useState } from 'react'
import Header from './components/Header'
import SchemaDesigner from './components/SchemaDesigner'
import SchemaPreview from './components/SchemaPreview'
import AstInsights from './components/AstInsights'
import ErdVisualizer from './components/ErdVisualizer'

function App() {
  const [code, setCode] = useState('')
  const [model, setModel] = useState({ tables: [], relations: [] })

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-sky-50 to-blue-50">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-6 md:py-10 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SchemaDesigner onGenerate={({ code }) => setCode(code)} />
          <SchemaPreview code={code} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AstInsights code={code} onModel={setModel} />
          <ErdVisualizer model={model} />
        </div>
      </main>
      <footer className="text-center text-xs text-gray-500 py-6">
        Built with love. This demo generates Drizzle schema code, parses it, and visualizes the ERD.
      </footer>
    </div>
  )
}

export default App
