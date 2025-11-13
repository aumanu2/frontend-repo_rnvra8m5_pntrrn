import { motion } from 'framer-motion'
import { Globe2, Map, Filter, Github } from 'lucide-react'

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top_left,rgba(15,23,42,1),rgba(2,6,23,1))] text-white">
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <motion.div initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-cyan-300" />
            <span className="font-bold tracking-tight">Planetary Population</span>
          </div>
          <nav className="flex items-center gap-4 text-sm opacity-80">
            <div className="hidden md:flex items-center gap-2"><Globe2 size={16}/> Globe</div>
            <div className="hidden md:flex items-center gap-2"><Map size={16}/> Map</div>
            <a href="#" className="flex items-center gap-2 hover:opacity-100 opacity-80"><Github size={16}/> Source</a>
          </nav>
        </div>
      </header>
      <main>{children}</main>
      <footer className="py-10 text-center text-white/60 text-xs">Built for immersive data exploration</footer>
    </div>
  )
}
