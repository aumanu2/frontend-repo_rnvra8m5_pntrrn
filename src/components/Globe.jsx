import { useEffect, useRef, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import * as THREE from 'three'
import { TrackballControls } from 'three/examples/jsm/controls/TrackballControls.js'

// Lightweight globe with country density via points and color ramp
export default function Globe({ data, selected, onHover, onSelect }) {
  const mountRef = useRef(null)
  const [hoverCountry, setHoverCountry] = useState(null)

  const colorRamp = useMemo(() => {
    const grad = [
      { stop: 0, color: new THREE.Color('#0ea5e9') }, // sky
      { stop: 0.5, color: new THREE.Color('#22d3ee') }, // cyan
      { stop: 0.75, color: new THREE.Color('#a3e635') }, // lime
      { stop: 1, color: new THREE.Color('#ef4444') }, // red for dense
    ]
    return (t) => {
      const clamped = Math.max(0, Math.min(1, t))
      for (let i = 0; i < grad.length - 1; i++) {
        const a = grad[i], b = grad[i + 1]
        if (clamped >= a.stop && clamped <= b.stop) {
          const p = (clamped - a.stop) / (b.stop - a.stop)
          return a.color.clone().lerp(b.color, p)
        }
      }
      return grad[grad.length - 1].color
    }
  }, [])

  useEffect(() => {
    const mount = mountRef.current
    const width = mount.clientWidth
    const height = mount.clientHeight

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setSize(width, height)
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio))
    mount.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 1000)
    camera.position.set(0, 0, 3.2)

    const controls = new TrackballControls(camera, renderer.domElement)
    controls.rotateSpeed = 1
    controls.zoomSpeed = 0.6
    controls.panSpeed = 0.1

    const light = new THREE.AmbientLight(0xffffff, 0.9)
    scene.add(light)
    const dir = new THREE.DirectionalLight(0xffffff, 0.6)
    dir.position.set(5, 2, 3)
    scene.add(dir)

    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 })
    )
    scene.add(globe)

    // country points using lat/lng projected on sphere, colored by density
    const positions = []
    const colors = []
    const sizes = []

    const maxDensity = Math.max(...data.map((d) => d.population / d.area || 0))

    data.forEach((c) => {
      const density = (c.population / c.area) / maxDensity
      const col = colorRamp(density)
      const lat = c.lat
      const lng = c.lng
      const r = 1 + 0.02 * density
      const pos = latLngToVector3(lat, lng, r)
      positions.push(pos.x, pos.y, pos.z)
      colors.push(col.r, col.g, col.b)
      sizes.push(3 + density * 6)
    })

    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))

    const material = new THREE.PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, opacity: 0.95 })
    const points = new THREE.Points(geometry, material)
    scene.add(points)

    // Raycaster for hover/select
    const raycaster = new THREE.Raycaster()
    const mouse = new THREE.Vector2()

    function onMove(e) {
      const rect = renderer.domElement.getBoundingClientRect()
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1
    }
    renderer.domElement.addEventListener('mousemove', onMove)
    renderer.domElement.addEventListener('click', () => {
      if (hoverCountry && onSelect) onSelect(hoverCountry.code)
    })

    let raf
    const animate = () => {
      raf = requestAnimationFrame(animate)
      // gentle auto-rotate
      globe.rotation.y += 0.0008
      points.rotation.y += 0.0008
      controls.update()

      raycaster.setFromCamera(mouse, camera)
      const intersects = raycaster.intersectObject(points)
      if (intersects.length) {
        const idx = intersects[0].index
        const country = data[idx]
        setHoverCountry(country)
        onHover && onHover(country)
      } else {
        setHoverCountry(null)
        onHover && onHover(null)
      }

      renderer.render(scene, camera)
    }
    animate()

    const onResize = () => {
      const w = mount.clientWidth, h = mount.clientHeight
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.domElement.removeEventListener('mousemove', onMove)
      controls.dispose()
      renderer.dispose()
      mount.removeChild(renderer.domElement)
    }
  }, [data, colorRamp, onHover, onSelect])

  return (
    <div className="relative w-full h-[70vh] rounded-3xl overflow-hidden ring-1 ring-white/10 bg-gradient-to-b from-slate-900 to-slate-800">
      <div ref={mountRef} className="absolute inset-0" />
      {hoverCountry && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="absolute left-3 top-3 md:left-6 md:top-6 backdrop-blur-md bg-black/40 text-white px-3 py-2 md:px-4 md:py-3 rounded-xl text-xs md:text-sm">
          <div className="font-semibold">{hoverCountry.name}</div>
          <div className="opacity-80">Pop: {hoverCountry.population.toLocaleString()}</div>
          <div className="opacity-80">Density: {Math.round(hoverCountry.population / hoverCountry.area).toLocaleString()} /km²</div>
          <div className="opacity-70">Region: {hoverCountry.region}</div>
        </motion.div>
      )}
    </div>
  )
}

function latLngToVector3(lat, lng, radius) {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  const x = -radius * Math.sin(phi) * Math.cos(theta)
  const z = radius * Math.sin(phi) * Math.sin(theta)
  const y = radius * Math.cos(phi)
  return new THREE.Vector3(x, y, z)
}
