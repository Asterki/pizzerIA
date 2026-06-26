import React, { useState, useRef, useCallback } from 'react'
import { WhiteboardCanvas } from '#/features/whiteboard/components/Canvas'
import { PizzerIALayout } from '#/layouts/Main'
import { createFileRoute } from '@tanstack/react-router'
import { Input, Button, App, Avatar, Tooltip } from 'antd'
import {
  AudioOutlined,
  SendOutlined,
  RobotOutlined,
  UserOutlined,
  LoadingOutlined,
} from '@ant-design/icons'

export const Route = createFileRoute('/')({ component: Home })

// ─── Types ───────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

// ─── Chat message bubble ─────────────────────────────────────────────────────
const MessageBubble: React.FC<{ msg: ChatMessage }> = ({ msg }) => {
  const isUser = msg.role === 'user'
  const time = msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        gap: 10,
        alignItems: 'flex-end',
        marginBottom: 16,
      }}
    >
      <Avatar
        size={28}
        icon={isUser ? <UserOutlined /> : <RobotOutlined />}
        style={{
          flexShrink: 0,
          background: isUser ? '#7b241c' : '#1e1e1e',
          border: isUser ? 'none' : '1px solid #303030',
          color: isUser ? '#ffffff' : '#c0392b',
        }}
      />
      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isUser ? 'flex-end' : 'flex-start', gap: 4 }}>
        <div
          style={{
            padding: '10px 14px',
            background: isUser ? '#c0392b' : '#1e1e1e',
            border: isUser ? 'none' : '1px solid #303030',
            borderRadius: 2,                                 // sharp — design.md
            color: '#ffffff',
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 14,
            lineHeight: 1.5,
            fontWeight: 400,
            wordBreak: 'break-word',
          }}
        >
          {msg.content}
        </div>
        <span
          style={{
            fontSize: 11,
            color: '#444444',
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '0.3px',
          }}
        >
          {time}
        </span>
      </div>
    </div>
  )
}

// ─── Chat panel ─────────────────────────────────────────────────────────────
const ChatPanel: React.FC = () => {
  const { message: antdMessage } = App.useApp()
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Ciao! Describe your pizza order or sketch on the whiteboard. I\'ll help you refine it 🍕',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isTranscribing, setIsTranscribing] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 50)
  }, [])

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [
      ...prev,
      { id: `${Date.now()}-${role}`, role, content, timestamp: new Date() },
    ])
    scrollToBottom()
  }, [scrollToBottom])

  const handleSend = useCallback(() => {
    const text = inputValue.trim()
    if (!text) return
    addMessage('user', text)
    setInputValue('')
    // Stub assistant reply
    setTimeout(() => {
      addMessage('assistant', `Got it! You said: "${text}". I'm working on your order 🍕`)
    }, 800)
  }, [inputValue, addMessage])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // ── Transcription (stub — console logs + adds to chat) ────────────────────
  const handleTranscribe = useCallback(async () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      antdMessage.warning('Speech recognition not supported in this browser.')
      return
    }

    setIsTranscribing(true)
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognition.lang = 'en-US'
    recognition.interimResults = false
    recognition.maxAlternatives = 1

    recognition.onresult = (event: any) => {
      const transcript: string = event.results[0][0].transcript
      console.log('[PizzerIA Transcription]', transcript)      // ← console log as requested
      addMessage('user', transcript)
      setIsTranscribing(false)
      antdMessage.success({ content: 'Transcribed!', duration: 1.5 })
    }

    recognition.onerror = () => {
      setIsTranscribing(false)
      antdMessage.error('Transcription failed. Try again.')
    }

    recognition.onend = () => setIsTranscribing(false)

    recognition.start()
  }, [addMessage, antdMessage])

  return (
    <div
      style={{
        width: 360,
        minWidth: 320,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#141414',
        borderLeft: '1px solid #303030',
        height: '100%',
      }}
    >
      {/* ── Header ── */}
      <div
        style={{
          padding: '14px 20px',
          borderBottom: '1px solid #303030',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <RobotOutlined style={{ color: '#c0392b', fontSize: 16 }} />
        <span
          style={{
            fontFamily: "'Inter', system-ui, sans-serif",
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '0.65px',
            textTransform: 'uppercase',
            color: '#ffffff',
          }}
        >
          AI Assistant
        </span>
        {/* Subtle online indicator — badge pill per design.md */}
        <span
          style={{
            marginLeft: 'auto',
            padding: '2px 10px',
            borderRadius: 9999,
            background: 'rgba(3,144,74,0.15)',
            border: '1px solid rgba(3,144,74,0.3)',
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '1.1px',
            textTransform: 'uppercase',
            color: '#03904a',
            fontFamily: "'Inter', system-ui, sans-serif",
          }}
        >
          Online
        </span>
      </div>

      {/* ── Messages ── */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 16px 8px',
          display: 'flex',
          flexDirection: 'column',
          scrollbarWidth: 'thin',
          scrollbarColor: '#303030 transparent',
        }}
      >
        {messages.map(msg => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Input area ── */}
      <div
        style={{
          padding: '12px 16px',
          borderTop: '1px solid #303030',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          background: '#1e1e1e',
        }}
      >
        {/* Transcribe CTA — Rosso Corsa, sharp, uppercase tracked */}
        <Tooltip title="Click and speak to transcribe your order">
          <button
            onClick={handleTranscribe}
            disabled={isTranscribing}
            style={{
              width: '100%',
              height: 48,                                     // design.md button height
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              background: isTranscribing ? '#9d2211' : '#c0392b',
              border: 'none',
              borderRadius: 0,                                // sharp — brand CTA
              color: '#ffffff',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              fontWeight: 700,
              letterSpacing: '1.4px',
              textTransform: 'uppercase',
              cursor: isTranscribing ? 'not-allowed' : 'pointer',
              transition: 'background 0.18s cubic-bezier(0.16,1,0.3,1)',
            }}
            onMouseEnter={e => {
              if (!isTranscribing)
                (e.currentTarget as HTMLButtonElement).style.background = '#9d2211'
            }}
            onMouseLeave={e => {
              if (!isTranscribing)
                (e.currentTarget as HTMLButtonElement).style.background = '#c0392b'
            }}
          >
            {isTranscribing
              ? <><LoadingOutlined style={{ fontSize: 16 }} /> Listening…</>
              : <><AudioOutlined style={{ fontSize: 16 }} /> Transcribe</>
            }
          </button>
        </Tooltip>

        {/* Text input row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <Input.TextArea
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your order…"
            autoSize={{ minRows: 1, maxRows: 4 }}
            style={{
              flex: 1,
              background: '#141414',
              border: '1px solid #303030',
              borderRadius: 0,
              color: '#ffffff',
              fontFamily: "'Inter', system-ui, sans-serif",
              fontSize: 14,
              resize: 'none',
            }}
            styles={{ textarea: { color: '#ffffff' } }}
          />
          <Tooltip title="Send (Enter)">
            <button
              onClick={handleSend}
              disabled={!inputValue.trim()}
              style={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: inputValue.trim() ? '#c0392b' : '#1e1e1e',
                border: '1px solid #303030',
                borderRadius: 0,
                color: '#ffffff',
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed',
                opacity: inputValue.trim() ? 1 : 0.4,
                transition: 'all 0.15s cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              <SendOutlined style={{ fontSize: 14 }} />
            </button>
          </Tooltip>
        </div>
        <span
          style={{
            fontSize: 11,
            color: '#444444',
            fontFamily: "'Inter', system-ui, sans-serif",
            letterSpacing: '0.5px',
            textAlign: 'center',
          }}
        >
          Enter to send · Shift+Enter for new line
        </span>
      </div>
    </div>
  )
}

// ─── Home page ───────────────────────────────────────────────────────────────
function Home() {
  return (
    <PizzerIALayout activeKey="/">
      {/* Two-panel layout: whiteboard (flex-1) + chat (fixed-width) */}
      <div
        style={{
          display: 'flex',
          height: 'calc(100vh - 64px - 48px)',   // account for header + footer
          overflow: 'hidden',
        }}
      >
        {/* Left — whiteboard, fills all remaining width */}
        <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <WhiteboardCanvas />
        </div>

        {/* Right — chat panel, fixed 360px */}
        <ChatPanel />
      </div>
    </PizzerIALayout>
  )
}