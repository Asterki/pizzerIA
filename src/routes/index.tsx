// src/routes/index.tsx

import React, { useMemo, useCallback, useState, useRef, useEffect } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Input, Card, Skeleton, Empty, App, Tooltip, Tag, Avatar } from 'antd'
import {
  SearchOutlined,
  ArrowRightOutlined,
  PlusOutlined,
  ClockCircleOutlined,
  DeleteOutlined,
  EditOutlined,
  BookOutlined,
  BulbOutlined,
  FormOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  MessageOutlined,
  CloseOutlined,
} from '@ant-design/icons'
import { useWhiteboards } from '#/features/whiteboard/hooks/useWhiteboards'
import type { Whiteboard } from '#/features/whiteboard/types'

export const Route = createFileRoute('/')({ component: LandingPage })

// ─── Helpers ──────────────────────────────────────────────────────────────────
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

const RULED_LINES_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='32'%3E%3Cline x1='0' y1='31' x2='100%25' y2='31' stroke='%23ebe6df' stroke-width='1'/%3E%3C/svg%3E")`

// ─── Chat types ────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  ts: number
}

// ─── Whiteboard preview ───────────────────────────────────────────────────────
const WhiteboardPreview: React.FC<{ wb: Whiteboard }> = ({ wb }) => (
  <div
    style={{
      width: '100%',
      aspectRatio: '16 / 9',
      background: '#faf8f4',
      position: 'relative',
      overflow: 'hidden',
      borderBottom: '1px solid #ebe6df',
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
          width: '100%', height: '100%',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28'%3E%3Ccircle cx='1' cy='1' r='0.9' fill='%23ddd8d0'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <FormOutlined style={{ fontSize: 24, color: '#c8bfb0', opacity: 0.5 }} />
      </div>
    )}
  </div>
)

// ─── Whiteboard card ──────────────────────────────────────────────────────────
const WhiteboardCard: React.FC<{
  wb: Whiteboard
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}> = ({ wb, onOpen, onDelete }) => {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      style={{
        background: '#ffffff',
        border: `1px solid ${hovered ? 'rgba(192,57,43,0.28)' : '#ebe6df'}`,
        borderRadius: 4,
        cursor: 'pointer',
        transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
        position: 'relative',
        boxShadow: hovered
          ? '0 6px 20px rgba(0,0,0,0.08), 0 1px 4px rgba(0,0,0,0.04)'
          : '0 1px 4px rgba(0,0,0,0.04)',
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onOpen(wb.id)}
      role="button" tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && onOpen(wb.id)}
      aria-label={`Abrir pizarra: ${wb.title ?? 'Sin título'}`}
    >
      <WhiteboardPreview wb={wb} />
      <div style={{ padding: '12px 14px 12px' }}>
        <div style={{
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13, fontWeight: 600, color: '#2d2820',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
          marginBottom: 7,
        }}>
          {wb.title ?? 'Sin título'}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            display: 'flex', alignItems: 'center', gap: 5,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11, color: '#b0a898', letterSpacing: '0.2px',
          }}>
            <ClockCircleOutlined style={{ fontSize: 10 }} />
            {formatRelative(wb.updatedAt)}
          </span>
          {wb.tags && wb.tags.length > 0 && (
            <Tag style={{
              borderRadius: 9999, background: '#f5f1ea',
              border: '1px solid #e5ddd0', fontSize: 10, fontWeight: 600,
              letterSpacing: '0.6px', textTransform: 'uppercase',
              color: '#9a8d78', margin: 0, padding: '1px 8px', lineHeight: '18px',
            }}>
              {wb.tags[0]}
            </Tag>
          )}
        </div>
      </div>
      {hovered && (
        <Tooltip title="Eliminar pizarra" placement="top">
          <button
            onClick={e => { e.stopPropagation(); onDelete(wb.id) }}
            style={{
              position: 'absolute', top: 8, right: 8,
              width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(255,255,255,0.94)',
              border: '1px solid rgba(192,57,43,0.3)', borderRadius: 4,
              color: '#c0392b', cursor: 'pointer', fontSize: 12,
              backdropFilter: 'blur(4px)',
              transition: 'all 0.15s ease',
            }}
          >
            <DeleteOutlined />
          </button>
        </Tooltip>
      )}
    </div>
  )
}

// ─── Feature pill ─────────────────────────────────────────────────────────────
const FeaturePill: React.FC<{ icon: React.ReactNode; label: string }> = ({ icon, label }) => (
  <div style={{
    display: 'inline-flex', alignItems: 'center', gap: 7,
    padding: '5px 13px',
    background: 'rgba(255,255,255,0.7)',
    border: '1px solid #e5ddd0', borderRadius: 9999,
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 12, fontWeight: 500, color: '#7a6e5e', letterSpacing: '0.2px',
    backdropFilter: 'blur(4px)',
  }}>
    {icon}{label}
  </div>
)

// ─── Chat bubble ──────────────────────────────────────────────────────────────
const ChatBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-end',
      gap: 8,
      marginBottom: 12,
    }}>
      <Avatar
        size={28}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          background: isUser ? '#c0392b' : '#f2ede6',
          color: isUser ? '#fff' : '#7a6e5e',
          flexShrink: 0,
        }}
      />
      <div style={{
        maxWidth: '75%',
        padding: '9px 13px',
        background: isUser ? '#c0392b' : '#ffffff',
        border: isUser ? 'none' : '1px solid #ebe6df',
        borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}>
        <p style={{
          margin: 0,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 13, lineHeight: 1.55,
          color: isUser ? '#fff' : '#2d2820',
          whiteSpace: 'pre-wrap',
        }}>
          {msg.content}
        </p>
        <span style={{
          display: 'block', marginTop: 4,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontSize: 10, color: isUser ? 'rgba(255,255,255,0.6)' : '#b0a898',
          textAlign: isUser ? 'left' : 'right',
        }}>
          {new Date(msg.ts).toLocaleTimeString('es-HN', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  )
}

// ─── Chat panel ───────────────────────────────────────────────────────────────
const ChatPanel: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: '¡Hola! Soy tu asistente de PizzerIA. ¿Sobre qué quieres aprender hoy?',
      ts: Date.now(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = useCallback(async () => {
    const text = input.trim()
    if (!text || loading) return
    setInput('')
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, role: 'user', content: text, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)
    // Placeholder — replace with actual AI call
    await new Promise(r => setTimeout(r, 900))
    setMessages(prev => [...prev, {
      id: `a-${Date.now()}`, role: 'assistant',
      content: 'Eso es un tema interesante. Puedo ayudarte a crear una pizarra sobre ello. ¡Escribe un tema en el buscador de arriba y presiona Enter!',
      ts: Date.now(),
    }])
    setLoading(false)
  }, [input, loading])

  return (
    <div style={{
      position: 'fixed', bottom: 88, right: 28, zIndex: 200,
      width: 340, height: 460,
      background: '#ffffff',
      border: '1px solid #e0d8cd',
      borderRadius: 8,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
      animation: 'chatSlideUp 0.22s cubic-bezier(0.16,1,0.3,1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: '#c0392b',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <div style={{
            width: 28, height: 28, borderRadius: '50%',
            background: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <RobotOutlined style={{ fontSize: 14, color: '#fff' }} />
          </div>
          <div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 13, fontWeight: 600, color: '#fff' }}>
              Asistente PizzerIA
            </div>
            <div style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 10, color: 'rgba(255,255,255,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#6ee7a0', display: 'inline-block' }} />
              En línea
            </div>
          </div>
        </div>
        <button onClick={onClose} style={{
          width: 28, height: 28, background: 'rgba(255,255,255,0.15)',
          border: 'none', borderRadius: 4, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
        }}>
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '14px 14px 4px',
        background: '#faf8f4',
      }}>
        {messages.map(m => <ChatBubble key={m.id} msg={m} />)}
        {loading && (
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 12 }}>
            <Avatar size={28} icon={<RobotOutlined />} style={{ background: '#f2ede6', color: '#7a6e5e', flexShrink: 0 }} />
            <div style={{
              padding: '10px 14px',
              background: '#ffffff', border: '1px solid #ebe6df',
              borderRadius: '12px 12px 12px 2px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{ display: 'flex', gap: 4, alignItems: 'center', height: 16 }}>
                {[0, 1, 2].map(i => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: '50%', background: '#c0392b',
                    opacity: 0.4,
                    animation: `typingDot 1.2s ${i * 0.2}s ease-in-out infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 12px',
        borderTop: '1px solid #ebe6df',
        background: '#ffffff',
        display: 'flex', gap: 8, alignItems: 'flex-end',
        flexShrink: 0,
      }}>
        <Input.TextArea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Pregunta algo…"
          autoSize={{ minRows: 1, maxRows: 4 }}
          style={{
            flex: 1, resize: 'none', borderRadius: 6,
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13, border: '1px solid #e0d8cd',
            background: '#faf8f4', color: '#2d2820',
          }}
          styles={{ textarea: { background: '#faf8f4' } }}
        />
        <button
          onClick={send}
          disabled={!input.trim() || loading}
          style={{
            width: 34, height: 34, flexShrink: 0,
            background: input.trim() && !loading ? '#c0392b' : '#f0ece6',
            border: 'none', borderRadius: 6,
            color: input.trim() && !loading ? '#fff' : '#c8bfb0',
            cursor: input.trim() && !loading ? 'pointer' : 'not-allowed',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'all 0.15s ease',
          }}
        >
          <SendOutlined style={{ fontSize: 14 }} />
        </button>
      </div>
    </div>
  )
}

// ─── Chat FAB ─────────────────────────────────────────────────────────────────
const ChatFAB: React.FC<{ open: boolean; onClick: () => void }> = ({ open, onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 200,
      width: 52, height: 52, borderRadius: '50%',
      background: open ? '#9d2211' : '#c0392b',
      border: 'none', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 16px rgba(192,57,43,0.35), 0 2px 6px rgba(0,0,0,0.1)',
      transition: 'all 0.2s cubic-bezier(0.16,1,0.3,1)',
      transform: open ? 'rotate(90deg) scale(0.92)' : 'rotate(0deg) scale(1)',
    }}
    aria-label={open ? 'Cerrar chat' : 'Abrir asistente'}
  >
    {open
      ? <CloseOutlined style={{ fontSize: 18, color: '#fff' }} />
      : <MessageOutlined style={{ fontSize: 18, color: '#fff' }} />
    }
  </button>
)

// ─── Landing page ─────────────────────────────────────────────────────────────
function LandingPage() {
  const navigate = useNavigate()
  const { message } = App.useApp()
  const [query, setQuery] = useState('')
  const [chatOpen, setChatOpen] = useState(false)
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

  const handleOpen = useCallback((id: string) => navigate({ to: '/whiteboard/$id', params: { id } }), [navigate])
  const handleNew = useCallback(async () => {
    const id = `wb-${Date.now()}`
    await save({ id, title: 'Nueva pizarra', createdAt: Date.now(), updatedAt: Date.now(), chat: [] as any, nodes: [] })
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
    <>
      {/* Keyframe animations (injected once) */}
      <style>{`
        @keyframes chatSlideUp {
          from { opacity: 0; transform: translateY(12px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes typingDot {
          0%, 60%, 100% { transform: translateY(0);    opacity: 0.4; }
          30%            { transform: translateY(-5px); opacity: 1;   }
        }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#f7f4ee',
        backgroundImage: RULED_LINES_BG,
        backgroundRepeat: 'repeat-y',
        backgroundSize: '100% 32px',
      }}>
        {/* Notebook margin line */}
        <div style={{
          position: 'fixed', left: 72, top: 0, bottom: 0, width: 1,
          background: 'rgba(192,57,43,0.10)', zIndex: 0, pointerEvents: 'none',
        }} />

        <div style={{ position: 'relative', zIndex: 1, maxWidth: 860, margin: '0 auto', padding: '72px 40px 80px' }}>

          {/* ── Hero ── */}
          <div style={{ marginBottom: 56, textAlign: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 22 }}>
              <EditOutlined style={{ fontSize: 20, color: '#c0392b', opacity: 0.55 }} />
              <div style={{
                width: 52, height: 52, borderRadius: '50%', background: '#c0392b',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(192,57,43,0.3)',
              }}>
                <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-label="PizzerIA logo">
                  <circle cx="16" cy="16" r="13" fill="rgba(255,255,255,0.15)" />
                  <path d="M16 5 L28 25 L4 25 Z" fill="#f5deb3" />
                  <path d="M16 5 L28 25 L4 25 Z" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <circle cx="16" cy="18" r="2" fill="#922b21" />
                  <circle cx="12" cy="21" r="1.5" fill="#922b21" />
                  <circle cx="20" cy="21" r="1.5" fill="#922b21" />
                  <path d="M4 25 Q16 29 28 25" stroke="#b5651d" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                </svg>
              </div>
              <BookOutlined style={{ fontSize: 20, color: '#c0392b', opacity: 0.55 }} />
            </div>

            <span style={{
              display: 'inline-block', marginBottom: 10,
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 11, fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', color: '#c0392b',
            }}>
              Tu espacio de aprendizaje
            </span>

            <h1 style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 'clamp(34px, 5vw, 54px)', fontWeight: 700,
              letterSpacing: '-1px', lineHeight: 1.08, color: '#1a1510', margin: '0 0 16px',
            }}>
              PizzerIA
            </h1>

            <p style={{
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 16, fontWeight: 400, color: '#7a6e5e',
              lineHeight: 1.65, maxWidth: 400, margin: '0 auto 28px',
            }}>
              La pizarra digital con inteligencia artificial. Aprende, colabora y crea sin límites.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              <FeaturePill icon={<FormOutlined style={{ fontSize: 12 }} />} label="Pizarras digitales" />
              <FeaturePill icon={<BulbOutlined style={{ fontSize: 12 }} />} label="IA integrada" />
              <FeaturePill icon={<BookOutlined style={{ fontSize: 12 }} />} label="Organiza tus ideas" />
            </div>
          </div>

          {/* ── Search + New ── */}
          <div style={{ maxWidth: 580, margin: '0 auto 60px', display: 'flex', gap: 0, boxShadow: '0 2px 16px rgba(0,0,0,0.08)' }}>
            <Input
              size="large"
              placeholder="Escribe un tema y presiona Enter para empezar…"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleStart}
              prefix={<SearchOutlined style={{ color: '#c0bbb0' }} />}
              style={{
                flex: 1, height: 50,
                background: '#ffffff', border: '1px solid #e5ddd0', borderRight: 'none',
                borderRadius: '4px 0 0 4px', color: '#2d2820',
                fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14,
              }}
              styles={{ input: { background: '#ffffff', color: '#2d2820' } }}
            />
            <button
              onClick={handleNew}
              style={{
                height: 50, padding: '0 26px',
                background: '#c0392b', border: 'none',
                borderRadius: '0 4px 4px 0',
                color: '#ffffff',
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 12, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0,
                transition: 'background 0.18s cubic-bezier(0.16,1,0.3,1)',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#9d2211')}
              onMouseLeave={e => (e.currentTarget.style.background = '#c0392b')}
            >
              <PlusOutlined style={{ fontSize: 13 }} />
              Nueva
            </button>
          </div>

          {/* ── Recientes ── */}
          <section>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 20, paddingBottom: 14,
              borderBottom: '1px solid #e5ddd0',
            }}>
              <span style={{
                fontFamily: "'Inter', system-ui, sans-serif",
                fontSize: 11, fontWeight: 700, letterSpacing: '1.4px', textTransform: 'uppercase',
                color: '#b0a898', display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <ClockCircleOutlined style={{ fontSize: 11 }} />
                Pizarras recientes
              </span>
              <button
                onClick={() => navigate({ to: '/whiteboards' })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  background: 'transparent', border: 'none', cursor: 'pointer',
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontSize: 12, fontWeight: 600, letterSpacing: '0.65px', textTransform: 'uppercase',
                  color: '#c0392b', padding: 0,
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#9d2211')}
                onMouseLeave={e => (e.currentTarget.style.color = '#c0392b')}
              >
                Ver todas <ArrowRightOutlined style={{ fontSize: 10 }} />
              </button>
            </div>

            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} style={{ background: '#ffffff', border: '1px solid #ebe6df', borderRadius: 4 }} styles={{ body: { padding: 0 } }}>
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
                  <span style={{ fontFamily: "'Inter', system-ui, sans-serif", fontSize: 14, color: '#b0a898' }}>
                    {query ? 'Sin resultados para esa búsqueda' : 'Aún no tienes pizarras. ¡Crea la primera!'}
                  </span>
                }
                style={{ padding: '52px 0', color: '#b0a898' }}
              >
                {!query && (
                  <button
                    onClick={handleNew}
                    style={{
                      height: 44, padding: '0 28px',
                      background: '#c0392b', border: 'none', borderRadius: 4,
                      color: '#ffffff', fontFamily: "'Inter', system-ui, sans-serif",
                      fontSize: 13, fontWeight: 700, letterSpacing: '1.2px', textTransform: 'uppercase',
                      cursor: 'pointer',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#9d2211')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#c0392b')}
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
                      background: 'transparent', border: '1.5px dashed #ddd8d0', borderRadius: 4,
                      cursor: 'pointer', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center', gap: 8,
                      minHeight: 160, color: '#c0bbb0',
                      transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
                      fontFamily: "'Inter', system-ui, sans-serif",
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = 'rgba(192,57,43,0.35)'
                      e.currentTarget.style.color = '#c0392b'
                      e.currentTarget.style.background = 'rgba(192,57,43,0.03)'
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = '#ddd8d0'
                      e.currentTarget.style.color = '#c0bbb0'
                      e.currentTarget.style.background = 'transparent'
                    }}
                  >
                    <ArrowRightOutlined style={{ fontSize: 18 }} />
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

      {/* ── Floating chat ── */}
      {chatOpen && <ChatPanel onClose={() => setChatOpen(false)} />}
      <ChatFAB open={chatOpen} onClick={() => setChatOpen(v => !v)} />
    </>
  )
}