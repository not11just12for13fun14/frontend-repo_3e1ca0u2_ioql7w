import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Plus, FileText, Laptop, Monitor, Globe, Image as ImageIcon } from 'lucide-react'

const BACKEND = import.meta.env.VITE_BACKEND_URL || ''

function CategoryBadge({ category }) {
  const map = {
    linux: { label: 'Linux', icon: Laptop, color: 'bg-emerald-100 text-emerald-700' },
    windows: { label: 'Windows', icon: Monitor, color: 'bg-blue-100 text-blue-700' },
    web: { label: 'Web', icon: Globe, color: 'bg-purple-100 text-purple-700' },
  }
  const conf = map[category] || { label: category, icon: FileText, color: 'bg-gray-100 text-gray-700' }
  const Icon = conf.icon
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${conf.color}`}>
      <Icon size={14} /> {conf.label}
    </span>
  )
}

function Header({ onNew }) {
  return (
    <header className="sticky top-0 z-10 backdrop-blur bg-white/60 border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-fuchsia-500" />
          <h1 className="text-xl font-semibold text-gray-800">Docs Hub</h1>
        </div>
        <button onClick={onNew} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg transition">
          <Plus size={18} /> Nuevo documento
        </button>
      </div>
    </header>
  )
}

function SearchBar({ q, setQ, category, setCategory }) {
  return (
    <div className="max-w-6xl mx-auto px-4 pt-8 pb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="md:col-span-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar documentación..."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-white px-3 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500">
          <option value="">Todas las categorías</option>
          <option value="linux">Linux</option>
          <option value="windows">Windows</option>
          <option value="web">Web</option>
        </select>
      </div>
    </div>
  )
}

function DocCard({ doc, onOpen }) {
  return (
    <motion.button
      onClick={() => onOpen(doc)}
      whileHover={{ y: -2 }}
      className="text-left w-full bg-white rounded-2xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition"
    >
      <div className="flex items-start gap-3">
        {doc.cover_image ? (
          <img src={doc.cover_image} alt="cover" className="w-16 h-16 rounded-lg object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center">
            <FileText className="text-gray-400" />
          </div>
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-800">{doc.title}</h3>
            <CategoryBadge category={doc.category} />
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {doc.tags?.slice(0,4).map((t) => (
              <span key={t} className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">#{t}</span>
            ))}
          </div>
        </div>
      </div>
    </motion.button>
  )
}

function Modal({ open, onClose, children, title }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 40, opacity: 0 }}
        className="w-full max-w-3xl bg-white rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Cerrar</button>
        </div>
        <div className="p-4">{children}</div>
      </motion.div>
    </div>
  )
}

function Editor({ onSaved }) {
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('linux')
  const [tags, setTags] = useState('')
  const [content, setContent] = useState('')
  const [cover, setCover] = useState(null)
  const [saving, setSaving] = useState(false)

  const onUpload = async (file) => {
    const form = new FormData()
    form.append('file', file)
    const res = await fetch(`${BACKEND}/api/upload`, { method: 'POST', body: form })
    const data = await res.json()
    setCover(data.data_url)
  }

  const submit = async () => {
    setSaving(true)
    try {
      const payload = {
        title,
        category,
        content,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        cover_image: cover || null,
      }
      const res = await fetch(`${BACKEND}/api/docs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      if (!res.ok) throw new Error('Error al guardar')
      onSaved()
    } catch (e) {
      alert(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-600">Título</label>
          <input value={title} onChange={(e)=>setTitle(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" />
        </div>
        <div>
          <label className="text-sm text-gray-600">Categoría</label>
          <select value={category} onChange={(e)=>setCategory(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500">
            <option value="linux">Linux</option>
            <option value="windows">Windows</option>
            <option value="web">Web</option>
          </select>
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-600">Tags (separados por coma)</label>
        <input value={tags} onChange={(e)=>setTags(e.target.value)} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" />
      </div>
      <div>
        <label className="text-sm text-gray-600 flex items-center gap-2">Portada <ImageIcon size={16} /></label>
        <div className="mt-2 flex items-center gap-3">
          <input type="file" accept="image/*" onChange={(e)=> e.target.files?.[0] && onUpload(e.target.files[0])} />
          {cover && <img src={cover} alt="cover" className="h-16 rounded" />}
        </div>
      </div>
      <div>
        <label className="text-sm text-gray-600">Contenido (Markdown o texto)</label>
        <textarea value={content} onChange={(e)=>setContent(e.target.value)} rows={10} className="w-full mt-1 px-3 py-2 rounded-lg border border-gray-200 focus:ring-2 focus:ring-indigo-500" placeholder="# Título\nContenido aquí..." />
      </div>
      <div className="flex justify-end">
        <button disabled={saving} onClick={submit} className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg">
          {saving ? 'Guardando...' : 'Guardar documento'}
        </button>
      </div>
    </div>
  )
}

function Viewer({ doc }) {
  if (!doc) return null
  return (
    <div className="prose max-w-none">
      <h1 className="text-2xl font-bold text-gray-800">{doc.title}</h1>
      <div className="mt-2"><CategoryBadge category={doc.category} /></div>
      {doc.cover_image && <img src={doc.cover_image} alt="cover" className="mt-4 rounded-xl" />}
      <pre className="mt-4 whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded-xl border border-gray-100">{doc.content}</pre>
    </div>
  )
}

function App() {
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('')
  const [docs, setDocs] = useState([])
  const [openEditor, setOpenEditor] = useState(false)
  const [active, setActive] = useState(null)
  const [loading, setLoading] = useState(true)

  const load = async () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    const res = await fetch(`${BACKEND}/api/docs?${params.toString()}`)
    const data = await res.json()
    setDocs(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => {
    const t = setTimeout(load, 300)
    return () => clearTimeout(t)
  }, [q, category])

  const openDoc = async (doc) => {
    const res = await fetch(`${BACKEND}/api/docs/${doc.slug}`)
    const data = await res.json()
    setActive(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <Header onNew={() => setOpenEditor(true)} />
      <SearchBar q={q} setQ={setQ} category={category} setCategory={setCategory} />

      <main className="max-w-6xl mx-auto px-4 pb-20">
        {loading ? (
          <div className="text-center text-gray-500 py-20">Cargando...</div>
        ) : (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {docs.map((d) => (
                <motion.div key={d.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}>
                  <DocCard doc={d} onOpen={openDoc} />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </main>

      <Modal open={openEditor} onClose={() => setOpenEditor(false)} title="Nuevo documento">
        <Editor onSaved={() => { setOpenEditor(false); load(); }} />
      </Modal>

      <Modal open={!!active} onClose={() => setActive(null)} title="Documento">
        <Viewer doc={active} />
      </Modal>
    </div>
  )
}

export default App
