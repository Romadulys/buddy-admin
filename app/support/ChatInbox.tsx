'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

interface ChatSession {
  id: string
  created_at: string
  updated_at: string
  visitor_name: string | null
  visitor_email: string | null
  status: string
  buddy_skin: string
  last_message_at: string
}

interface ChatMessage {
  id: string
  session_id: string
  created_at: string
  content: string
  sender: 'visitor' | 'admin'
  read: boolean
}

const BUDDY_SKINS: Record<string, { name: string; emoji: string; color: string }> = {
  luna:    { name: 'Luna',    emoji: '🦄', color: '#EC4899' },
  pablo:   { name: 'Pablo',   emoji: '🐧', color: '#64748B' },
  bambou:  { name: 'Bambou',  emoji: '🐼', color: '#6366F1' },
  drago:   { name: 'Drago',   emoji: '🐉', color: '#22C55E' },
  fantome: { name: 'Fantôme', emoji: '👻', color: '#9333EA' },
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export default function ChatInbox() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [loadingSessions, setLoadingSessions] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSessions = useCallback(async () => {
    try {
      const res = await fetch('/api/chat/sessions')
      if (res.ok) {
        const data: ChatSession[] = await res.json()
        setSessions(data)
      }
    } catch {
      // ignore
    } finally {
      setLoadingSessions(false)
    }
  }, [])

  const fetchMessages = useCallback(async (sessionId: string) => {
    try {
      const res = await fetch(`/api/chat/messages/${sessionId}`)
      if (res.ok) {
        const data: ChatMessage[] = await res.json()
        setMessages(data)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    fetchSessions()
  }, [fetchSessions])

  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current)
    if (!selectedId) return

    fetchMessages(selectedId)

    pollRef.current = setInterval(() => {
      fetchMessages(selectedId)
      fetchSessions()
    }, 3000)

    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
    }
  }, [selectedId, fetchMessages, fetchSessions])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const selectedSession = sessions.find((s) => s.id === selectedId) ?? null

  const handleSend = async () => {
    if (!input.trim() || !selectedId || sending) return
    setSending(true)
    try {
      const res = await fetch(`/api/chat/messages/${selectedId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: input.trim() }),
      })
      if (res.ok) {
        setInput('')
        await fetchMessages(selectedId)
        await fetchSessions()
      }
    } catch {
      // ignore
    } finally {
      setSending(false)
    }
  }

  const handleClose = async () => {
    if (!selectedId) return
    try {
      await fetch(`/api/chat/sessions`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId, status: 'closed' }),
      })
      await fetchSessions()
    } catch {
      // ignore
    }
  }

  const unreadCount = (session: ChatSession) => {
    if (session.id !== selectedId) return 0
    return messages.filter((m) => m.sender === 'visitor' && !m.read).length
  }

  const skin = (key: string) => BUDDY_SKINS[key] ?? BUDDY_SKINS.luna

  return (
    <div className="flex h-[600px] bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Left panel — session list */}
      <div className="w-1/3 border-r border-gray-100 flex flex-col">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-semibold text-gray-700">Conversations</h3>
          {loadingSessions && (
            <p className="text-xs text-gray-400 mt-0.5">Chargement…</p>
          )}
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-50">
          {sessions.length === 0 && !loadingSessions && (
            <div className="p-6 text-center text-sm text-gray-400">
              Aucune conversation pour le moment
            </div>
          )}
          {sessions.map((session) => {
            const s = skin(session.buddy_skin)
            const isSelected = session.id === selectedId
            const isOpen = session.status === 'open'
            const unread = unreadCount(session)

            return (
              <button
                key={session.id}
                onClick={() => setSelectedId(session.id)}
                className={`w-full text-left px-4 py-3 transition-colors hover:bg-gray-50 ${
                  isSelected ? 'bg-indigo-50 border-l-2 border-indigo-500' : ''
                } ${isOpen && !isSelected ? 'border-l-2 border-green-300' : ''}`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl flex-shrink-0">{s.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-sm font-semibold text-gray-900 truncate">
                        {session.visitor_name ?? 'Visiteur anonyme'}
                      </span>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {unread > 0 && (
                          <span className="bg-red-500 text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                            {unread}
                          </span>
                        )}
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                            isOpen
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {isOpen ? 'ouvert' : 'fermé'}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5">
                      {s.name} · {formatDate(session.last_message_at)}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Right panel — conversation */}
      <div className="flex-1 flex flex-col">
        {!selectedSession ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">
            Sélectionne une conversation
          </div>
        ) : (
          <>
            {/* Header */}
            <div
              className="px-5 py-3 border-b border-gray-100 flex items-center justify-between"
              style={{ borderTopColor: skin(selectedSession.buddy_skin).color }}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{skin(selectedSession.buddy_skin).emoji}</span>
                <div>
                  <p className="text-sm font-bold text-gray-900">
                    {selectedSession.visitor_name ?? 'Visiteur anonyme'}
                  </p>
                  <p className="text-xs text-gray-500">
                    {selectedSession.visitor_email ?? 'Pas d\'email'} ·{' '}
                    {skin(selectedSession.buddy_skin).name}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-medium transition-colors"
              >
                Fermer la conversation
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 && (
                <p className="text-center text-sm text-gray-400">Aucun message</p>
              )}
              {messages.map((msg) => {
                const isAdmin = msg.sender === 'admin'
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-sm xl:max-w-md px-3 py-2 rounded-2xl text-sm ${
                        isAdmin
                          ? 'bg-indigo-600 text-white rounded-br-sm'
                          : 'bg-gray-100 text-gray-800 rounded-bl-sm'
                      }`}
                    >
                      <p className="leading-relaxed">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isAdmin ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {formatTime(msg.created_at)}
                      </p>
                    </div>
                  </div>
                )
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-gray-100 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                placeholder="Répondre…"
                className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || sending}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg transition-colors"
              >
                Envoyer
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
