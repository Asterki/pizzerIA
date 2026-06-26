// src/features/whiteboard/components/Canvas.tsx
// Best-in-class whiteboard: floating vertical toolbar, dot-grid canvas,
// full tool palette, styled to the PizzerIA/design.md dark theme.
// Install: npm install react-sketch-canvas

import React, { useRef, useState, useCallback } from 'react'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import { ColorPicker, Slider, Tooltip, App } from 'antd'
import type { Color } from 'antd/es/color-picker'
import {
  EditOutlined,
  ClearOutlined,
  UndoOutlined,
  RedoOutlined,
  DownloadOutlined,
  HighlightOutlined,   // eraser
  MinusOutlined,
  PlusOutlined,
} from '@ant-design/icons'

// ─── Cursors ─────────────────────────────────────────────────────────────────
const PENCIL_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23c0392b' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'/%3E%3C/svg%3E") 0 20, crosshair`

const ERASER_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='none' stroke='%23969696' stroke-width='1.5'/%3E%3C/svg%3E") 12 12, cell`

// ─── Color palette from design.md philosophy ─────────────────────────────────
const QUICK_COLORS = [
  '#ffffff',  // ink on dark — primary stroke
  '#c0392b',  // Rosso Corsa — the brand voltage
  '#969696',  // body muted — soft grey
  '#1a1a1a',  // near-black — for light canvas use
  '#4c98b9',  // info blue
  '#03904a',  // success green
  '#f13a2c',  // warning red
  '#e8cfa0',  // warm cream — pizza dough
]

// ─── Stroke sizes ─────────────────────────────────────────────────────────────
const SIZE_PRESETS = [
  { label: 'XS', value: 2 },
  { label: 'S', value: 4 },
  { label: 'M', value: 8 },
  { label: 'L', value: 16 },
]

// ─── Dot-grid SVG background ──────────────────────────────────────────────────
const DOT_GRID_BG = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24'%3E%3Ccircle cx='1' cy='1' r='1' fill='%23303030'/%3E%3C/svg%3E")`

// ─── Tool button ─────────────────────────────────────────────────────────────
interface ToolBtnProps {
  icon: React.ReactNode
  label: string
  active?: boolean
  danger?: boolean
  onClick: () => void
  disabled?: boolean
}
const ToolBtn: React.FC<ToolBtnProps> = ({ icon, label, active, danger, onClick, disabled }) => (
  <Tooltip title={label} placement="right">
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 40,
        height: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: active ? 'rgba(192,57,43,0.18)' : 'transparent',
        border: active
          ? '1px solid rgba(192,57,43,0.5)'
          : danger
            ? '1px solid rgba(241,58,44,0.3)'
            : '1px solid transparent',
        borderRadius: 2,
        color: active ? '#c0392b' : danger ? '#f13a2c' : '#969696',
        fontSize: 16,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.35 : 1,
        transition: 'all 0.15s cubic-bezier(0.16,1,0.3,1)',
      }}
      onMouseEnter={e => {
        if (disabled || active) return
          ; (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.06)'
          ; (e.currentTarget as HTMLButtonElement).style.color = '#ffffff'
      }}
      onMouseLeave={e => {
        if (disabled || active) return
          ; (e.currentTarget as HTMLButtonElement).style.background = 'transparent'
          ; (e.currentTarget as HTMLButtonElement).style.color = danger ? '#f13a2c' : '#969696'
      }}
    >
      {icon}
    </button>
  </Tooltip>
)

// ─── Toolbar divider ──────────────────────────────────────────────────────────
const ToolDivider = () => (
  <div style={{ width: 24, height: 1, background: '#303030', margin: '4px 8px' }} />
)

// ─── Main component ───────────────────────────────────────────────────────────
export const WhiteboardCanvas: React.FC = () => {
  const canvasRef = useRef<any>(null)
  const { message } = App.useApp()

  const [strokeColor, setStrokeColor] = useState('#ffffff')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [isEraser, setIsEraser] = useState(false)

  // ── Color ────────────────────────────────────────────────────────────────
  const handleColorChange = useCallback((_: Color, hex: string) => {
    setStrokeColor(hex)
    setIsEraser(false)
    canvasRef.current?.eraseMode(false)
  }, [])

  // ── Tools ────────────────────────────────────────────────────────────────
  const activatePencil = useCallback(() => {
    setIsEraser(false)
    canvasRef.current?.eraseMode(false)
  }, [])

  const toggleEraser = useCallback(() => {
    const next = !isEraser
    setIsEraser(next)
    canvasRef.current?.eraseMode(next)
  }, [isEraser])

  const handleUndo = useCallback(() => canvasRef.current?.undo(), [])
  const handleRedo = useCallback(() => canvasRef.current?.redo(), [])

  const handleClear = useCallback(() => {
    canvasRef.current?.clearCanvas()
    setIsEraser(false)
    message.success({ content: 'Canvas cleared', duration: 1.5 })
  }, [message])

  const handleDownload = useCallback(async () => {
    try {
      const dataUrl = await canvasRef.current?.exportImage('png')
      if (!dataUrl) return
      const a = document.createElement('a')
      a.href = dataUrl
      a.download = `pizzeria-whiteboard-${Date.now()}.png`
      a.click()
      message.success({ content: 'Exported as PNG', duration: 1.5 })
    } catch {
      message.error('Export failed')
    }
  }, [message])

  const nudgeSize = useCallback((delta: number) => {
    setStrokeWidth(prev => Math.min(40, Math.max(1, prev + delta)))
  }, [])

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', background: '#181818' }}>

      {/* ── Dot-grid canvas area ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: DOT_GRID_BG,
          backgroundRepeat: 'repeat',
          cursor: isEraser ? ERASER_CURSOR : PENCIL_CURSOR,
        }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          style={{ width: '100%', height: '100%', border: 'none', borderRadius: 0 }}
          canvasColor="transparent"   // let the dot-grid show through
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          eraserWidth={strokeWidth * 4}
          withTimestamp
        />
      </div>

      {/* ── Floating vertical toolbar ── */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 16,
          transform: 'translateY(-50%)',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 4,
          padding: '12px 8px',
          background: '#1e1e1e',
          border: '1px solid #303030',
          borderRadius: 2,
          boxShadow: '0 4px 8px rgba(0,0,0,0.32)',
        }}
      >
        {/* Active color swatch */}
        <Tooltip title="Stroke color" placement="right">
          <div style={{ marginBottom: 4 }}>
            <ColorPicker
              value={strokeColor}
              onChange={handleColorChange}
              presets={[{ label: 'Palette', colors: QUICK_COLORS }]}
              trigger="click"
              styles={{
              }}
            >
              <button
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 2,
                  border: '2px solid #303030',
                  background: strokeColor,
                  cursor: 'pointer',
                  padding: 0,
                  display: 'block',
                }}
              />
            </ColorPicker>
          </div>
        </Tooltip>

        <ToolDivider />

        {/* Pencil */}
        <ToolBtn
          icon={<EditOutlined />}
          label="Pencil (P)"
          active={!isEraser}
          onClick={activatePencil}
        />

        {/* Eraser */}
        <ToolBtn
          icon={<HighlightOutlined />}
          label="Eraser (E)"
          active={isEraser}
          onClick={toggleEraser}
        />

        <ToolDivider />

        {/* Stroke size – nudge buttons + mini display */}
        <Tooltip title="Stroke size" placement="right">
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <button
              onClick={() => nudgeSize(2)}
              style={{ width: 28, height: 28, background: 'transparent', border: '1px solid #303030', borderRadius: 2, color: '#969696', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <PlusOutlined style={{ fontSize: 10 }} />
            </button>

            {/* Live size presets */}
            {SIZE_PRESETS.map(p => (
              <button
                key={p.value}
                onClick={() => setStrokeWidth(p.value)}
                style={{
                  width: 28,
                  height: 28,
                  background: strokeWidth === p.value ? 'rgba(192,57,43,0.18)' : 'transparent',
                  border: strokeWidth === p.value ? '1px solid rgba(192,57,43,0.5)' : '1px solid #303030',
                  borderRadius: 2,
                  color: strokeWidth === p.value ? '#c0392b' : '#969696',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  fontWeight: 600,
                  letterSpacing: '0.5px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {p.label}
              </button>
            ))}

            <button
              onClick={() => nudgeSize(-2)}
              style={{ width: 28, height: 28, background: 'transparent', border: '1px solid #303030', borderRadius: 2, color: '#969696', cursor: 'pointer', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MinusOutlined style={{ fontSize: 10 }} />
            </button>
          </div>
        </Tooltip>

        {/* Size fine-control — vertical slider */}
        <Tooltip title={`${strokeWidth}px`} placement="right">
          <div style={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingBlock: 4 }}>
            <Slider
              vertical
              min={1}
              max={40}
              value={strokeWidth}
              onChange={setStrokeWidth}
              style={{ height: 72 }}
              styles={{ track: { background: '#c0392b' }, rail: { background: '#303030' } }}
              tooltip={{ formatter: v => `${v}px` }}
            />
          </div>
        </Tooltip>

        <ToolDivider />

        {/* Undo */}
        <ToolBtn icon={<UndoOutlined />} label="Undo (⌘Z)" onClick={handleUndo} />

        {/* Redo */}
        <ToolBtn icon={<RedoOutlined />} label="Redo (⌘⇧Z)" onClick={handleRedo} />

        <ToolDivider />

        {/* Clear */}
        <ToolBtn icon={<ClearOutlined />} label="Clear canvas" danger onClick={handleClear} />

        {/* Export */}
        <ToolBtn icon={<DownloadOutlined />} label="Export PNG" onClick={handleDownload} />
      </div>

      {/* ── Stroke preview pill — bottom center ── */}
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 20,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '6px 16px',
          background: '#1e1e1e',
          border: '1px solid #303030',
          borderRadius: 9999,               // pill — badge geometry per design.md
          pointerEvents: 'none',
        }}
      >
        <div
          style={{
            width: Math.min(strokeWidth * 2, 32),
            height: Math.min(strokeWidth * 2, 32),
            borderRadius: '50%',
            background: isEraser ? '#303030' : strokeColor,
            border: isEraser ? '1px solid #969696' : 'none',
            transition: 'all 0.18s cubic-bezier(0.16,1,0.3,1)',
          }}
        />
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '1.1px',
            textTransform: 'uppercase',
            color: '#666666',
          }}
        >
          {isEraser ? 'Eraser' : 'Pencil'} · {strokeWidth}px
        </span>
      </div>
    </div>
  )
}