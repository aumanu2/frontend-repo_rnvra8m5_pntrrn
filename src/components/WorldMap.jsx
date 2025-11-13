import { useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import world from '../data/world-geo.json'

export default function WorldMap({ data, filter, onFilter }) {
  const [hover, setHover] = useState(null)

  const regions = useMemo(() => {
    return Array.from(new Set(data.map(d => d.region))).sort()
  }, [data])

  const countriesByCode = useMemo(() => {
    const m = new Map()
    data.forEach(d => m.set(d.code, d))
    return m
  }, [data])

  const filteredCodes = useMemo(() => {
    if (!filter) return null
    if (regions.includes(filter)) return new Set(data.filter(d => d.region === filter).map(d => d.code))
    return new Set([filter])
  }, [filter, regions, data])

  return (
    <div className="w-full">
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <button onClick={() => onFilter(null)} className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition ${!filter ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}>All</button>
        {regions.map(r => (
          <button key={r} onClick={() => onFilter(r)} className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition ${filter===r ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}>{r}</button>
        ))}
      </div>
      <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-gradient-to-b from-slate-900 to-slate-800 p-4">
        <svg viewBox="0 0 1000 520" className="w-full h-auto">
          <g>
            {world.features.map((f) => {
              const code = f.id
              const meta = countriesByCode.get(code)
              const isDim = filteredCodes && !filteredCodes.has(code)
              const density = meta ? (meta.population / meta.area) : 0
              const color = rampColor(density)
              return (
                <motion.path
                  key={code}
                  d={f.d}
                  fill={color}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: isDim ? 0.2 : 0.95 }}
                  transition={{ duration: 0.5 }}
                  stroke="rgba(255,255,255,0.2)"
                  strokeWidth={0.5}
                  onMouseEnter={() => setHover(meta)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => meta && onFilter(meta.code)}
                  className="cursor-pointer"
                />
              )
            })}
          </g>
        </svg>
        <AnimatePresence>
          {hover && (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 4 }} className="absolute left-4 bottom-4 backdrop-blur-md bg-black/40 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm">
              <div className="font-semibold">{hover.name}</div>
              <div className="opacity-80">Pop: {hover.population.toLocaleString()}</div>
              <div className="opacity-80">Density: {Math.round(hover.population / hover.area).toLocaleString()} /km²</div>
              <div className="opacity-70">Region: {hover.region}</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function rampColor(value) {
  // input approx density; apply soft normalization
  const v = Math.min(1, Math.log(1 + value) / Math.log(1 + 800))
  const start = [14, 165, 233] // sky-500
  const mid = [34, 211, 238] // cyan-400
  const end = [239, 68, 68] // red-500
  let r, g, b
  if (v < 0.5) {
    const t = v / 0.5
    r = start[0] + (mid[0] - start[0]) * t
    g = start[1] + (mid[1] - start[1]) * t
    b = start[2] + (mid[2] - start[2]) * t
  } else {
    const t = (v - 0.5) / 0.5
    r = mid[0] + (end[0] - mid[0]) * t
    g = mid[1] + (end[1] - mid[1]) * t
    b = mid[2] + (end[2] - mid[2]) * t
  }
  return `rgba(${r|0}, ${g|0}, ${b|0}, 0.9)`
}
