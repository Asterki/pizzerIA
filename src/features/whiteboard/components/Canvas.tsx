// src/features/whiteboard/components/Canvas.tsx

import React, { useState, useCallback, useImperativeHandle, forwardRef } from 'react'
import {
  Excalidraw,
  MainMenu,
  WelcomeScreen,
  convertToExcalidrawElements,
} from '@excalidraw/excalidraw'
import type {
  ExcalidrawImperativeAPI,
  AppState,
} from '@excalidraw/excalidraw/types'
import { CaptureUpdateAction } from '@excalidraw/excalidraw'
import '@excalidraw/excalidraw/index.css'
import "./Canvas.styles.css"

// ─── Public handle exposed to parent via ref ──────────────────────────────────
export interface WhiteboardCanvasHandle {
  /** Insert a plain-text element at the current viewport center */
  insertText: (text: string, opts?: { fontSize?: number; color?: string }) => void
  /** Insert an image element at the current viewport center via URL */
  insertImageUrl: (url: string, opts?: { width?: number; height?: number }) => void
  /** Direct access to the full Excalidraw API if ever needed */
  excalidrawAPI: ExcalidrawImperativeAPI | null
}

interface WhiteboardCanvasProps {
  /** Called once the Excalidraw instance is ready */
  onAPIReady?: (api: ExcalidrawImperativeAPI) => void
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Return the canvas-space center of the current viewport */
function viewportCenter(appState: AppState): { x: number; y: number } {
  return {
    x: -appState.scrollX + appState.width / 2 / appState.zoom.value,
    y: -appState.scrollY + appState.height / 2 / appState.zoom.value,
  }
}

/** Nano-id — avoids pulling uuid just for element IDs */
function nid(): string {
  return Math.random().toString(36).slice(2, 12)
}

// ─── Component ────────────────────────────────────────────────────────────────
export const WhiteboardCanvas = forwardRef<WhiteboardCanvasHandle, WhiteboardCanvasProps>(
  ({ onAPIReady }, ref) => {
    const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null)

    const handleAPIReady = useCallback((instance: ExcalidrawImperativeAPI) => {
      setApi(instance)
      onAPIReady?.(instance)
    }, [onAPIReady])

    // ── Insert text at viewport center ────────────────────────────────────
    const insertText = useCallback((
      text: string,
      { fontSize = 20, color = '#2d2820' }: { fontSize?: number; color?: string } = {}
    ) => {
      if (!api) return
      const appState = api.getAppState()
      const { x, y } = viewportCenter(appState)

      // convertToExcalidrawElements handles the internal field requirements
      const elements = convertToExcalidrawElements([{
        type: 'text',
        id: nid(),
        x,
        y,
        text,
        fontSize,
        strokeColor: color,
        textAlign: 'left',
        verticalAlign: 'top',
        roughness: 0,
        opacity: 100,
      }])

      api.updateScene({
        elements: [...api.getSceneElements(), ...elements],
        captureUpdate: CaptureUpdateAction.IMMEDIATELY,
      })
      // Briefly scroll to the new element so the user sees it
      api.scrollToContent(elements, { animate: true, duration: 300 })
    }, [api])

    // ── Insert image at viewport center via URL ───────────────────────────
    const insertImageUrl = useCallback(async (
      url: string,
      { width = 400, height = 300 }: { width?: number; height?: number } = {}
    ) => {
      if (!api) return
      const appState = api.getAppState()
      const { x, y } = viewportCenter(appState)

      // Fetch the image and convert to a BinaryFileData blob so Excalidraw
      // stores it internally (same as pasting an image from clipboard).
      try {
        const res = await fetch(url)
        const blob = await res.blob()
        const mimeType = (blob.type || 'image/png') as
          'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | 'image/svg+xml'
        const arrayBuffer = await blob.arrayBuffer()
        const base64 = btoa(
          new Uint8Array(arrayBuffer).reduce((s, b) => s + String.fromCharCode(b), '')
        )
        const dataURL = `data:${mimeType};base64,${base64}` as const

        const fileId = nid() as any  // BinaryFileData id type is branded

        api.addFiles([{
          id: fileId,
          mimeType,
          dataURL,
          created: Date.now(),
          lastRetrieved: Date.now(),
        }])

        const elements = convertToExcalidrawElements([{
          type: 'image',
          id: nid(),
          x: x - width / 2,
          y: y - height / 2,
          width,
          height,
          fileId,
          status: 'saved',
          roughness: 0,
          opacity: 100,
        }])

        api.updateScene({
          elements: [...api.getSceneElements(), ...elements],
          captureUpdate: CaptureUpdateAction.IMMEDIATELY,
        })
        api.scrollToContent(elements, { animate: true, duration: 300 })
      } catch (err) {
        console.error('[WhiteboardCanvas] insertImageUrl failed:', err)
        api.setToast({ message: 'No se pudo cargar la imagen. Verifica la URL.', duration: 3000 })
      }
    }, [api])

    // ── Expose handle ────────────────────────────────────────────────────
    useImperativeHandle(ref, () => ({
      insertText,
      insertImageUrl,
      excalidrawAPI: api,
    }), [insertText, insertImageUrl, api])

    return (
      <div className="pizzeria-canvas" style={{ width: '100%', height: '100%' }}>
        <button
          onClick={() => insertText('¡Hola, mundo!', { fontSize: 24, color: '#c0392b' })}
        >Insert Text</button>
        <button
          onClick={() => insertImageUrl('https://curc.unah.edu.hn/themes/portalunah-new/assets/images/logo-unah.png', { height: 200, width: 200 })}
        >Insert Image</button>


        <Excalidraw
          theme="light"
          langCode="es"
          excalidrawAPI={handleAPIReady}
          aiEnabled={false}
          detectScroll={false}
          zenModeEnabled
          gridModeEnabled
          initialData={{ appState: { viewBackgroundColor: '#f7f4ee' } }}
          UIOptions={{
            dockedSidebarBreakpoint: 0,
            canvasActions: {
              toggleTheme: false,
              saveToActiveFile: false,
              clearCanvas: false,
              changeViewBackgroundColor: false,
              saveAsImage: false,
              loadScene: false,
              export: { saveFileToDisk: true },
            },
            tools: { image: true },
          }}
        >

        </Excalidraw>
      </div>
    )
  }
)

WhiteboardCanvas.displayName = 'WhiteboardCanvas'