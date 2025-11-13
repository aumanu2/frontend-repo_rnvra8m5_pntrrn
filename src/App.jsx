import { useMemo, useState } from 'react'
import Hero from './components/Hero'
import Layout from './components/Layout'
import Globe from './components/Globe'
import WorldMap from './components/WorldMap'
import population from './data/population.json'
import { motion } from 'framer-motion'

export default function App() {
  const [filter, setFilter] = useState(null)
  const [hover, setHover] = useState(null)

  const data = useMemo(() => population, [])

  const worldPop = useMemo(() => data.reduce((s, c) => s + c.population, 0), [data])
  const regions = useMemo(() => Array.from(new Set(data.map(d => d.region))).sort(), [data])

  return (
    <Layout>
      <Hero />

      <section className="max-w-7xl mx-auto px-4 md:px-6 -mt-24 md:-mt-28 relative z-10">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.8 }}>
          <Globe data={data} selected={filter} onHover={setHover} onSelect={setFilter} />
        </motion.div>
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }} className="backdrop-blur-md bg-white/5 ring-1 ring-white/10 rounded-2xl p-5">
            <div className="text-white/70 text-sm">Total Population (sample)</div>
            <div className="text-3xl font-semibold">{worldPop.toLocaleString()}</div>
            <div className="mt-2 text-xs text-white/60">Subset of countries for demo; can be expanded to full dataset.</div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="backdrop-blur-md bg-white/5 ring-1 ring-white/10 rounded-2xl p-5">
            <div className="text-white/70 text-sm">Top Density</div>
            <TopDensity data={data} />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="backdrop-blur-md bg-white/5 ring-1 ring-white/10 rounded-2xl p-5">
            <div className="text-white/70 text-sm">Filters</div>
            <div className="flex flex-wrap gap-2 mt-2">
              <button onClick={() => setFilter(null)} className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition ${!filter ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}>All</button>
              {regions.map(r => (
                <button key={r} onClick={() => setFilter(r)} className={`px-3 py-1.5 rounded-full text-xs md:text-sm transition ${filter===r ? 'bg-white/20 text-white' : 'bg-white/10 text-white/70 hover:bg-white/15'}`}>{r}</button>
              ))}
            </div>
            {hover && (
              <div className="mt-4 text-xs text-white/80">
                <div className="font-semibold">{hover.name}</div>
                <div>Pop: {hover.population.toLocaleString()}</div>
                <div>Density: {Math.round(hover.population / hover.area).toLocaleString()} /km²</div>
                <div className="opacity-70">Region: {hover.region}</div>
              </div>
            )}
          </motion.div>
        </div>

        <div className="mt-10 md:mt-14">
          <motion.h2 initial={{ opacity: 0, y: 6 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-xl md:text-2xl font-semibold mb-4">World Map</motion.h2>
          <WorldMap data={data} filter={filter} onFilter={setFilter} />
        </div>
      </section>
    </Layout>
  )
}

function TopDensity({ data }) {
  const sorted = [...data].sort((a, b) => b.population / b.area - a.population / a.area).slice(0, 5)
  return (
    <ul className="mt-2 space-y-2">
      {sorted.map(c => (
        <li key={c.code} className="flex items-center justify-between text-sm">
          <span className="text-white/80">{c.name}</span>
          <span className="text-white font-semibold">{Math.round(c.population / c.area).toLocaleString()} /km²</span>
        </li>
      ))}
    </ul>
  )
}
