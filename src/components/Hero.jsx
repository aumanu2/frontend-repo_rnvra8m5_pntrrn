import { motion } from 'framer-motion'
import Spline from '@splinetool/react-spline'

export default function Hero() {
  return (
    <section className="relative h-[70vh] md:h-[80vh] w-full overflow-hidden">
      <div className="absolute inset-0">
        <Spline scene="https://prod.spline.design/hGDm7Foxug7C6E8s/scene.splinecode" style={{ width: '100%', height: '100%' }} />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/80 pointer-events-none" />
      <div className="relative h-full z-10 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="text-center px-6"
        >
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white drop-shadow-[0_8px_40px_rgba(0,0,0,0.4)]">
            Planetary Population
          </h1>
          <p className="mt-4 md:mt-6 text-base md:text-lg text-white/80 max-w-2xl mx-auto">
            An immersive exploration of our world’s population through an interactive 3D globe and dynamic world map.
          </p>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.4 }}
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.15 } } }}
            className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 max-w-5xl mx-auto"
          >
            {[{
              label: 'World Population',
              value: 8045311447,
              format: 'compact'
            }, {
              label: 'Urban (%)',
              value: 57.0,
              suffix: '%'
            }, {
              label: 'Annual Growth',
              value: 0.9,
              suffix: '%'
            }, {
              label: 'Countries',
              value: 195
            }].map((s, i) => (
              <StatCard key={i} {...s} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

import { useEffect, useState } from 'react'

function StatCard({ label, value, suffix = '', format }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    const duration = 1400
    const start = performance.now()
    function tick(now) {
      const p = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(value * eased)
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  const formatted = format === 'compact'
    ? new Intl.NumberFormat(undefined, { notation: 'compact' }).format(display)
    : suffix === '%'
      ? display.toFixed(1)
      : Math.round(display).toLocaleString()
  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      className="backdrop-blur-md bg-white/10 ring-1 ring-white/15 rounded-2xl p-4 md:p-6 text-left"
    >
      <div className="text-white/70 text-xs md:text-sm">{label}</div>
      <div className="mt-1 md:mt-2 text-2xl md:text-3xl font-bold text-white">
        {formatted}{suffix}
      </div>
    </motion.div>
  )
}
