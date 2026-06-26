// src/routes/index.tsx

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input, Card, Skeleton, Empty, App, Tooltip } from 'antd'
import {
  SearchOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useWhiteboards } from '#/features/whiteboard/hooks/useWhiteboards'
import type { Whiteboard } from '#/features/whiteboard/types'

export const Route = createFileRoute('/')({ component: LandingPage })

// ─── Helpers ─────────────────────────────────────────────────────────────────
function formatRelative(ts: number): string {
  const diff = Date.now() - ts
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Hace un momento'
  if (mins < 60) return `Hace ${mins} min`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `Hace ${hrs}h`
  const days = Math.floor(hrs / 24)
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  return new Date(ts).toLocaleDateString('es-HN', { day: 'numeric', month: 'short' })
}

// ─── Chalk Board Shader ───────────────────────────────────────────────────────
// Dark board texture + animated chalk dust + faint ghost pizza geometry.
// Three layers:
//   1. Board grain   — high-freq noise, near-black, subtle warmth
//   2. Chalk dust    — slow drifting bright specks along horizontal streaks
//   3. Ghost sketch  — a faint pizza-slice triangle + arc drawn in shader space
const VERT_SRC = `
  attribute vec2 a_pos;
  void main() {
    gl_Position = vec4(a_pos, 0.0, 1.0);
  }
`

// Simplex noise + flowing ember field — all in GLSL ES 1.0 (maximum compat)
const FRAG_SRC = `
  precision mediump float;
  uniform float u_time;
  uniform vec2  u_res;

  // ── Simplex 2D noise (Stefan Gustavson, public domain) ──────────────────
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,0.366025403784439,
                       -0.577350269189626,0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute(permute(i.y + vec3(0.0,i1.y,1.0))
                            + i.x + vec3(0.0,i1.x,1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0),
                             dot(x12.xy,x12.xy),
                             dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 0.01*fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314*(a0*a0 + h*h);
    vec3 g;
    g.x  = a0.x * x0.x  + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // ── FBM — 4 octaves, slow drift ─────────────────────────────────────────
  float fbm(vec2 p) {
    float v = 0.0, a = 0.4;
    vec2  shift = vec2(100.0);
    mat2  rot   = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
      v += a * snoise(p);
      p  = rot * p * 0.1 + shift;
      a *= 0.05;
    }
    return v;
  }

  void main() {
    // Normalised UV, aspect-corrected
    vec2 uv = gl_FragCoord.xy / u_res;
    uv.x *= u_res.x / u_res.y;

    float t = u_time * 0.08;   // very slow — editorial calm

    // Two layers of FBM drifting in different directions for depth
    vec2 q = vec2(fbm(uv + t),
                  fbm(uv + vec2(1.7, 9.2) + t * 0.9));

    vec2 r = vec2(fbm(uv + 1.0 * q + vec2(1.7, 9.2) + t * 0.5),
                  fbm(uv + 1.0 * q + vec2(8.3, 2.8) + t * 0.4));

    float f = fbm(uv + r);

    // Remap to 0..1
    f = 0.5 + 0.5 * f;

    // Colour ramp: #141414 (canvas) → deep maroon → Rosso Corsa → faint amber tip
    // All kept at very low brightness — max ~12% luminance so content stays readable
    vec3 dark   = vec3(0.078, 0.078, 0.078);   // #141414 — canvas floor
    vec3 maroon = vec3(0.30,  0.04,  0.04);    // deep crimson ember
    vec3 rosso  = vec3(0.75,  0.22,  0.17);    // #c0392b Rosso Corsa
    vec3 amber  = vec3(0.85,  0.35,  0.15);    // warm ember tip (rare)

    vec3 col = mix(dark,   maroon, smoothstep(0.0,  0.45, f));
    col       = mix(col,   rosso,  smoothstep(0.45, 0.75, f));
    col       = mix(col,   amber,  smoothstep(0.75, 1.0,  f));

    // Keep overall brightness very low — atmospheric, not distracting
    col *= 0.18;

    // Vignette — darker at edges, brighter centre, focuses content
    vec2 vig = (gl_FragCoord.xy / u_res) - 0.5;
    float vignette = 1.0 - dot(vig, vig) * 2.6;
    col *= clamp(vignette, 0.0, 1.0);

    gl_FragColor = vec4(col, 1.0);
  }
`

const EmberShader: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false })
    if (!gl) return   // silent fallback — canvas stays #141414

    // ── Compile shaders ──────────────────────────────────────────────────
    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      return s
    }

    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT_SRC))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG_SRC))
    gl.linkProgram(prog)
    gl.useProgram(prog)

    // ── Full-screen quad ─────────────────────────────────────────────────
    const buf = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW
    )

    const posLoc = gl.getAttribLocation(prog, 'a_pos')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const uTime = gl.getUniformLocation(prog, 'u_time')
    const uRes = gl.getUniformLocation(prog, 'u_res')

    // ── Resize ───────────────────────────────────────────────────────────
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 1.5)  // cap DPR for perf
      canvas!.width = canvas!.offsetWidth * dpr
      canvas!.height = canvas!.offsetHeight * dpr
      gl!.viewport(0, 0, canvas!.width, canvas!.height)
    }

    // ── Render loop ──────────────────────────────────────────────────────
    let raf: number
    let start = performance.now()

    function render() {
      const t = (performance.now() - start) / 1000
      gl!.uniform1f(uTime, t)
      gl!.uniform2f(uRes, canvas!.width, canvas!.height)
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4)
      raf = requestAnimationFrame(render)
    }

    resize()
    render()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      gl.deleteProgram(prog)
      gl.deleteBuffer(buf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        display: 'block',
      }}
    />
  )
}

// ─── Whiteboard preview ───────────────────────────────────────────────────────
const WhiteboardPreview: React.FC<{ wb: Whiteboard }> = ({ wb }) => (
  <div
    style={{
      width: '100%',
      aspectRatio: '16 / 9',
      background: '#181818',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid #303030',
    }}
  >
    {wb.thumbnail ? (
      <img
        src={wb.thumbnail}
        alt={`Vista previa de ${wb.title ?? 'pizarra'}`}
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    ) : (
      <div
        style={{
          width: '100%',
          height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Ccircle cx='1' cy='1' r='0.8' fill='%23303030'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{ fontSize: 28, opacity: 0.3 }}>🍕</span>
      </div>
    )}
  </div>
)

// ─── Single whiteboard card ───────────────────────────────────────────────────
const WhiteboardCard: React.FC<{
  wb: Whiteboard
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}> = ({ wb, onOpen, onDelete }) => {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      style={{
        background: hovered ? '#252525' : '#1e1e1e',
        border: `1px solid ${hovered ? 'rgba(192,57,43,0.35)' : '#303030'}`,
        borderRadius: 2,
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        position: 'relative',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(wb.id)}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(wb.id)}
      aria-label={`Abrir pizarra: ${wb.title ?? 'Sin título'}`}
    >
      <WhiteboardPreview wb={wb} />

      <div style={{ padding: '12px 14px 10px' }}>
        <div
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            fontWeight: 500,
            color: '#ffffff',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 6,
          }}
        >
          {wb.title ?? 'Sin título'}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              color: '#666666',
              letterSpacing: '0.3px',
            }}
          >
            <ClockCircleOutlined style={{ fontSize: 10 }} />
            {formatRelative(wb.updatedAt)}
          </span>

          {wb.tags && wb.tags.length > 0 && (
            <span
              style={{
                padding: '2px 10px',
                borderRadius: 9999,
                background: '#252525',
                border: '1px solid #303030',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.8px',
                textTransform: 'uppercase',
                color: '#969696',
              }}
            >
              {wb.tags[0]}
            </span>
          )}
        </div>
      </div>

      {hovered && (
        <Tooltip title="Eliminar pizarra" placement="top">
          <button
            onClick={e => { e.stopPropagation(); onDelete(wb.id) }}
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 28,
              height: 28,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(20,20,20,0.85)',
              border: '1px solid rgba(241,58,44,0.4)',
              borderRadius: 2,
              color: '#f13a2c',
              cursor: 'pointer',
              fontSize: 12,
              backdropFilter: 'blur(4px)',
            }}
          >
            <DeleteOutlined />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

// ─── Main landing page ────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [query, setQuery] = useState('')
  const { whiteboards, isLoading, sortByDate, remove, save } = useWhiteboards()

  const recent = useMemo(() => sortByDate('desc').slice(0, 5), [sortByDate])

  const filtered = useMemo(() => {
    if (!query.trim()) return recent
    const q = query.toLowerCase()
    return recent.filter(wb =>
      (wb.title ?? '').toLowerCase().includes(q) ||
      (wb.tags ?? []).some(t => t.toLowerCase().includes(q))
    )
  }, [recent, query])

  const handleOpen = useCallback((id: string) => {
    navigate({ to: '/whiteboard/$id', params: { id } })
  }, [navigate])

  const handleNew = useCallback(async () => {
    const id = `wb-${Date.now()}`
    await save({
      id,
      title: 'Nueva pizarra',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      chat: [] as any,
      nodes: [],
    })
    navigate({ to: '/whiteboard/$id', params: { id } })
  }, [save, navigate])

  const handleDelete = useCallback(async (id: string) => {
    await remove(id)
    message.success({ content: 'Pizarra eliminada', duration: 1.5 })
  }, [remove, message])

  const handleStart = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const q = (e.target as HTMLInputElement).value.trim()
      if (!q) return
      const id = `wb-${Date.now()}`
      save({ id, title: q, createdAt: Date.now(), updatedAt: Date.now(), paths: [] })
        .then(() => navigate({ to: '/whiteboard/$id', params: { id } }))
    }
  }, [save, navigate])

  return (
    <div style={{ position: 'relative', minHeight: '100vh', background: '#141414', overflow: 'hidden' }}>

      {/* ── WebGL ember shader — fills behind all content ── */}
      <EmberShader />

      {/* ── Content layer ── */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          maxWidth: 860,
          margin: '0 auto',
          padding: '80px 32px 64px',
        }}
      >
        {/* Hero */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span
            style={{
              display: 'inline-block',
              marginBottom: 16,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              color: '#c0392b',
            }}
          >
            Tu espacio de ideas
          </span>
          <h1
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(32px, 5vw, 56px)',
              fontWeight: 500,
              letterSpacing: '-0.8px',
              lineHeight: 1.1,
              color: '#ffffff',
              margin: '0 0 16px',
            }}
          >
            PizzerIA
          </h1>
          <p
            style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 16,
              fontWeight: 400,
              color: '#969696',
              lineHeight: 1.6,
              maxWidth: 420,
              margin: '0 auto',
            }}
          >
            La pizarra digital con inteligencia artificial. Aprende, colabora y crea sin límites.
          </p>
        </div>

        {/* Input + Nueva CTA */}
        <div style={{ maxWidth: 560, margin: '0 auto 56px', display: 'flex', gap: 0 }}>
          <Input
            size="large"
            placeholder="Iniciar a aprender… escribe un tema y presiona Enter"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={handleStart}
            prefix={<SearchOutlined style={{ color: '#444444' }} />}
            style={{
              flex: 1,
              height: 48,
              background: '#1e1e1e',
              border: '1px solid #303030',
              borderRight: 'none',
              borderRadius: 0,
              color: '#ffffff',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
            }}
            styles={{ input: { background: '#1e1e1e', color: '#ffffff' } }}
          />
          <button
            onClick={handleNew}
            style={{
              height: 48,
              padding: '0 24px',
              background: '#c0392b',
              border: 'none',
              borderRadius: 0,
              color: '#ffffff',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              flexShrink: 0,
              transition: 'background 0.18s cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = '#9d2211')}
            onMouseLeave={e => (e.currentTarget.style.background = '#c0392b')}
          >
            <PlusOutlined style={{ fontSize: 14 }} />
            Nueva
          </button>
        </div>

        {/* Recientes */}
        <section>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
              paddingBottom: 12,
              borderBottom: '1px solid #303030',
            }}
          >
            <span
              style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '1.1px',
                textTransform: 'uppercase',
                color: '#969696',
              }}
            >
              Pizarras recientes
            </span>
            <button
              onClick={() => navigate({ to: '/whiteboards' })}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: '0.65px',
                textTransform: 'uppercase',
                color: '#c0392b',
                padding: 0,
              }}
              onMouseEnter={e => (e.currentTarget.style.color = '#9d2211')}
              onMouseLeave={e => (e.currentTarget.style.color = '#c0392b')}
            >
              Ver todas
              <ArrowRightOutlined style={{ fontSize: 10 }} />
            </button>
          </div>

          {isLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {Array.from({ length: 3 }).map((_, i) => (
                <Card
                  key={i}
                  style={{ background: '#1e1e1e', border: '1px solid #303030', borderRadius: 2 }}
                  styles={{ body: { padding: 0 } }}
                >
                  <Skeleton.Image active style={{ width: '100%', height: 112, borderRadius: 0 }} />
                  <div style={{ padding: '12px 14px' }}>
                    <Skeleton active paragraph={{ rows: 1 }} title={{ width: '60%' }} />
                  </div>
                </Card>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: '#666666' }}>
                  {query ? 'Sin resultados para esa búsqueda' : 'Aún no tienes pizarras. ¡Crea la primera!'}
                </span>
              }
              style={{ padding: '40px 0', color: '#666666' }}
            >
              {!query && (
                <button
                  onClick={handleNew}
                  style={{
                    height: 48,
                    padding: '0 32px',
                    background: '#c0392b',
                    border: 'none',
                    borderRadius: 0,
                    color: '#ffffff',
                    fontFamily: "'Inter', system-ui, sans-serif",
                    fontSize: 14,
                    fontWeight: 700,
                    letterSpacing: '1.4px',
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                  }}
                >
                  Crear pizarra
                </button>
              )}
            </Empty>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
              {filtered.map(wb => (
                <WhiteboardCard key={wb.id} wb={wb} onOpen={handleOpen} onDelete={handleDelete} />
              ))}

              {whiteboards.length > 5 && (
                <button
                  onClick={() => navigate({ to: '/whiteboards' })}
                  style={{
                    background: 'transparent',
                    border: '1px dashed #303030',
                    borderRadius: 2,
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                    minHeight: 160,
                    color: '#666666',
                    transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                    fontFamily: "'Inter', system-ui, sans-serif",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = 'rgba(192,57,43,0.4)'
                    e.currentTarget.style.color = '#c0392b'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = '#303030'
                    e.currentTarget.style.color = '#666666'
                  }}
                >
                  <ArrowRightOutlined style={{ fontSize: 20 }} />
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '1.1px', textTransform: 'uppercase' }}>
                    {whiteboards.length - 5} más
                  </span>
                </button>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}