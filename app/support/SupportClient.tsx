'use client'

import { useState } from 'react'

interface Ticket {
  id: string
  email: string
  subject: string
  status: string
  priority: string
  date: string
  message: string
}

const statusColors: Record<string, string> = {
  Ouvert: 'bg-orange-100 text-orange-700',
  'En cours': 'bg-blue-100 text-blue-700',
  Résolu: 'bg-green-100 text-green-700',
}

const priorityColors: Record<string, string> = {
  Urgent: 'bg-red-100 text-red-700',
  Normal: 'bg-gray-100 text-gray-600',
  Faible: 'bg-slate-100 text-slate-500',
}

const CHAT_MESSAGES = [
  { role: 'assistant', text: 'Bonjour ! Je suis l\'Assistant Buddy AI. Je peux vous aider à répondre aux tickets, analyser les problèmes courants ou rédiger des réponses types. Comment puis-je vous aider ?' },
]

export default function SupportClient({ tickets }: { tickets: Ticket[] }) {
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [messages, setMessages] = useState(CHAT_MESSAGES)
  const [sending, setSending] = useState(false)

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim()) return

    const userMessage = chatInput.trim()
    setChatInput('')
    setMessages((prev) => [...prev, { role: 'user', text: userMessage }])

    // Simulate AI response
    setSending(true)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `Je comprends votre question sur "${userMessage}". L\'intégration complète avec Claude API sera disponible prochainement. En attendant, je peux vous suggérer de vérifier la documentation technique ou d\'escalader le ticket à un expert.`,
        },
      ])
      setSending(false)
    }, 1200)
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
      {/* Tickets list */}
      <div className="xl:col-span-2 space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">Tickets récents</h3>
        <div className="space-y-2">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              onClick={() => setSelectedTicket(selectedTicket?.id === ticket.id ? null : ticket)}
              className={`bg-white rounded-xl border shadow-sm p-4 cursor-pointer transition-all hover:shadow-md ${
                selectedTicket?.id === ticket.id
                  ? 'border-indigo-300 ring-2 ring-indigo-100'
                  : 'border-gray-100 hover:border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-gray-400">{ticket.id}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${statusColors[ticket.status]}`}>
                      {ticket.status}
                    </span>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${priorityColors[ticket.priority]}`}>
                      {ticket.priority}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{ticket.subject}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{ticket.email}</p>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0">
                  {new Date(ticket.date).toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit'
                  })}
                </div>
              </div>

              {selectedTicket?.id === ticket.id && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 leading-relaxed">{ticket.message}</p>
                  <div className="flex gap-2 mt-3">
                    <button className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">
                      Répondre
                    </button>
                    <button className="px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 text-xs font-medium rounded-lg transition-colors">
                      Marquer résolu
                    </button>
                    <button className="px-3 py-1.5 bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium rounded-lg transition-colors">
                      Escalader
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Chatbot panel */}
      <div className="xl:col-span-1">
        <div className="bg-[#0f172a] rounded-xl shadow-lg overflow-hidden flex flex-col h-[500px]">
          {/* Chatbot header */}
          <div className="px-4 py-3 border-b border-white/10 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-sm">🤖</div>
            <div>
              <p className="text-sm font-semibold text-white">Assistant Buddy AI</p>
              <p className="text-[10px] text-slate-400">Propulsé par Claude — bientôt disponible</p>
            </div>
            <div className="ml-auto">
              <span className="flex items-center gap-1 text-[10px] text-amber-400">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Démo
              </span>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-sm'
                      : 'bg-white/10 text-slate-200 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {sending && (
              <div className="flex justify-start">
                <div className="bg-white/10 px-3 py-2 rounded-xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Posez une question..."
                className="flex-1 bg-white/10 text-white placeholder-slate-500 text-xs px-3 py-2 rounded-lg border border-white/10 focus:outline-none focus:border-indigo-500 transition-colors"
              />
              <button
                type="submit"
                disabled={!chatInput.trim() || sending}
                className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 disabled:opacity-50 text-white text-xs rounded-lg transition-colors"
              >
                →
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
