// src/components/WhiteboardCanvas.tsx
// Whiteboard component using react-sketch-canvas (pencil cursor, freehand drawing)
// Install: npm install react-sketch-canvas

import React, { useRef, useState } from 'react'
import { ReactSketchCanvas } from 'react-sketch-canvas'
import {
  Button,
  ColorPicker,
  Slider,
  Tooltip,
  Space,
  Divider,
  Popover,
} from 'antd'
import type { Color } from 'antd/es/color-picker'
import {
  EditOutlined,
  ClearOutlined,
  UndoOutlined,
  RedoOutlined,
  DownloadOutlined,
} from '@ant-design/icons'

const PENCIL_CURSOR = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23333' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z'/%3E%3C/svg%3E") 0 24, crosshair`

export const WhiteboardCanvas: React.FC = () => {
  const canvasRef = useRef<any>(null)
  const [strokeColor, setStrokeColor] = useState('#1a1a1a')
  const [strokeWidth, setStrokeWidth] = useState(4)
  const [isEraser, setIsEraser] = useState(false)

  const handleColorChange = (_: Color, hex: string) => {
    setStrokeColor(hex)
    setIsEraser(false)
    canvasRef.current?.eraseMode(false)
  }

  const handleEraserToggle = () => {
    const next = !isEraser
    setIsEraser(next)
    canvasRef.current?.eraseMode(next)
  }

  const handleUndo = () => canvasRef.current?.undo()
  const handleRedo = () => canvasRef.current?.redo()
  const handleClear = () => {
    canvasRef.current?.clearCanvas()
    setIsEraser(false)
  }

  const handleDownload = async () => {
    const dataUrl = await canvasRef.current?.exportImage('png')
    if (!dataUrl) return
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = 'whiteboard.png'
    a.click()
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: '#f5f5f5',
      }}
    >
      {/* Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '10px 20px',
          background: '#ffffff',
          borderBottom: '1px solid #e0e0e0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          flexWrap: 'wrap',
        }}
      >
        <Space split={<Divider type="vertical" />} wrap>
          {/* Color picker */}
          <Space>
            <span style={{ fontSize: 13, color: '#555' }}>Color</span>
            <ColorPicker
              value={strokeColor}
              onChange={handleColorChange}
              presets={[
                {
                  label: 'Quick',
                  colors: [
                    '#1a1a1a',
                    '#ffffff',
                    '#ef4444',
                    '#3b82f6',
                    '#22c55e',
                    '#f59e0b',
                    '#8b5cf6',
                    '#ec4899',
                  ],
                },
              ]}
            />
          </Space>

          {/* Stroke width */}
          <Space>
            <span style={{ fontSize: 13, color: '#555' }}>Size</span>
            <Slider
              min={1}
              max={40}
              value={strokeWidth}
              onChange={setStrokeWidth}
              style={{ width: 100 }}
              tooltip={{ formatter: (v) => `${v}px` }}
            />
          </Space>

          {/* Actions */}
          <Space>
            <Tooltip title="Pencil">
              <Button
                icon={<EditOutlined />}
                type={!isEraser ? 'primary' : 'default'}
                onClick={() => {
                  setIsEraser(false)
                  canvasRef.current?.eraseMode(false)
                }}
              />
            </Tooltip>

            <Tooltip title="Undo">
              <Button icon={<UndoOutlined />} onClick={handleUndo} />
            </Tooltip>
            <Tooltip title="Redo">
              <Button icon={<RedoOutlined />} onClick={handleRedo} />
            </Tooltip>
            <Tooltip title="Clear canvas">
              <Button icon={<ClearOutlined />} danger onClick={handleClear} />
            </Tooltip>
            <Tooltip title="Download as PNG">
              <Button icon={<DownloadOutlined />} onClick={handleDownload} />
            </Tooltip>
          </Space>
        </Space>
      </div>

      {/* Canvas */}
      <div
        style={{
          flex: 1,
          cursor: isEraser
            ? 'cell'
            : PENCIL_CURSOR,
          overflow: 'hidden',
        }}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            borderRadius: 0,
          }}
          canvasColor="#ffffff"
          strokeColor={strokeColor}
          strokeWidth={strokeWidth}
          eraserWidth={strokeWidth * 3}
          withTimestamp
        />
      </div>
    </div>
  )
}