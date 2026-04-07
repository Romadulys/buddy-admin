# Email Intelligence Hub — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an AI-enriched email inbox to the Buddy Admin support section, with sentiment/urgency/category analysis, suggested replies, real ticketing, B2C/B2B routing, and analytics dashboard.

**Architecture:** Mock data first (Phase 1a). Gmail API reads behind an env switch. Claude API analysis behind another env switch. New "Inbox" tab in Support page with enriched email list, detail panel with AI analysis, and analytics dashboard. Existing tickets refactored from mock to real data structure.

**Tech Stack:** Next.js 16 App Router, React 19, TailwindCSS v4, Recharts, Supabase (later phases)

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `lib/email-mock.ts` | Email/Ticket interfaces, mock emails (15), mock analyses, mock stats, helper functions |
| `lib/email-ai.ts` | AI analysis function (mock or Claude API based on env var) |
| `lib/gmail.ts` | Gmail client (mock or live based on env var) |
| `components/SentimentBadge.tsx` | Reusable sentiment emoji + color badge |
| `components/EmailCard.tsx` | Single email row in the inbox list |
| `app/support/EmailInbox.tsx` | Inbox tab: KPIs + email list + filters |
| `app/support/EmailPanel.tsx` | Slide-over detail panel: AI analysis + original mail + suggested reply |
| `app/support/EmailDashboard.tsx` | Analytics: charts + stats (volume, sentiment, categories) |

### Modified files
| File | Change |
|------|--------|
| `app/support/page.tsx` | Add "Inbox" tab, restructure tabs, use new email data for stats |

---

## Task 1: Email mock data & types (`lib/email-mock.ts`)

**Files:**
- Create: `lib/email-mock.ts`

- [ ] **Step 1: Create interfaces and constants**

```typescript
// lib/email-mock.ts
import { formatEur } from './b2b-mock'

export type Sentiment = 'positif' | 'neutre' | 'negatif' | 'en_colere'
export type Urgence = 'faible' | 'normale' | 'haute' | 'critique'
export type EmailCategorie = 'support_technique' | 'commercial' | 'facturation' | 'partenariat' | 'retour_produit' | 'question_generale' | 'interne'
export type EmailStatut = 'nouveau' | 'en_cours' | 'repondu' | 'archive'
export type Routage = 'b2c' | 'b2b' | 'interne'
export type TicketStatut = 'ouvert' | 'en_cours' | 'en_attente' | 'resolu' | 'ferme'

export interface Email {
  id: string
  gmail_id: string
  thread_id: string
  from_email: string
  from_name: string
  to_email: string
  subject: string
  body_text: string
  body_html: string | null
  attachments: number
  received_at: string
  created_at: string
  ai_sentiment: Sentiment | null
  ai_urgence: Urgence | null
  ai_categorie: EmailCategorie | null
  ai_resume: string | null
  ai_mots_cles: string[] | null
  ai_priorite: number | null
  ai_reponse_suggeree: string | null
  ai_routage: Routage | null
  statut: EmailStatut
  ticket_id: string | null
  assigne_a: string | null
  repondu_at: string | null
  repondu_par: string | null
}

export interface Ticket {
  id: string
  email_ids: string[]
  subject: string
  contact_email: string
  contact_name: string
  statut: TicketStatut
  priorite: Urgence
  categorie: string
  assigne_a: string | null
  ai_resume: string | null
  created_at: string
  updated_at: string
  resolved_at: string | null
}

export const SENTIMENT_CONFIG: Record<Sentiment, { emoji: string; label: string; color: string }> = {
  positif: { emoji: '😊', label: 'Positif', color: 'bg-green-100 text-green-700' },
  neutre: { emoji: '😐', label: 'Neutre', color: 'bg-gray-100 text-gray-600' },
  negatif: { emoji: '😟', label: 'Negatif', color: 'bg-orange-100 text-orange-700' },
  en_colere: { emoji: '😡', label: 'En colere', color: 'bg-red-100 text-red-700' },
}

export const URGENCE_CONFIG: Record<Urgence, { label: string; color: string; dot: string }> = {
  faible: { label: 'Faible', color: 'bg-slate-100 text-slate-600', dot: 'bg-slate-400' },
  normale: { label: 'Normale', color: 'bg-blue-100 text-blue-600', dot: 'bg-blue-400' },
  haute: { label: 'Haute', color: 'bg-orange-100 text-orange-600', dot: 'bg-orange-400' },
  critique: { label: 'Critique', color: 'bg-red-100 text-red-600', dot: 'bg-red-500' },
}

export const CATEGORIE_LABELS: Record<EmailCategorie, string> = {
  support_technique: 'Support technique',
  commercial: 'Commercial',
  facturation: 'Facturation',
  partenariat: 'Partenariat',
  retour_produit: 'Retour produit',
  question_generale: 'Question generale',
  interne: 'Interne',
}

export const CATEGORIE_COLORS: Record<EmailCategorie, string> = {
  support_technique: 'bg-purple-100 text-purple-700',
  commercial: 'bg-indigo-100 text-indigo-700',
  facturation: 'bg-amber-100 text-amber-700',
  partenariat: 'bg-teal-100 text-teal-700',
  retour_produit: 'bg-pink-100 text-pink-700',
  question_generale: 'bg-gray-100 text-gray-600',
  interne: 'bg-slate-100 text-slate-500',
}

export const STATUT_LABELS: Record<EmailStatut, string> = {
  nouveau: 'Nouveau',
  en_cours: 'En cours',
  repondu: 'Repondu',
  archive: 'Archive',
}

export const STATUT_COLORS: Record<EmailStatut, string> = {
  nouveau: 'bg-orange-100 text-orange-700',
  en_cours: 'bg-blue-100 text-blue-700',
  repondu: 'bg-green-100 text-green-700',
  archive: 'bg-gray-100 text-gray-500',
}

export const TEAM_MEMBERS = ['Romain', 'Adrien', 'Alex', 'Maxime']

export const PRIORITE_COLORS = (score: number): string => {
  if (score >= 75) return 'bg-red-500'
  if (score >= 50) return 'bg-orange-400'
  if (score >= 25) return 'bg-yellow-400'
  return 'bg-green-400'
}
```

- [ ] **Step 2: Add 15 mock emails**

Add to the same file, 15 realistic French emails covering:
- 5 B2C support (GPS bug, battery, geofence, subscription, app update)
- 3 B2B commercial (catalogue request, partnership, pricing)
- 2 facturation (double charge, invoice request)
- 2 question generale (how does it work, shipping times)
- 1 retour produit (broken device)
- 1 partenariat (school wanting to pilot)
- 1 interne (team coordination)

Each email must have all `ai_*` fields pre-filled (mock analysis). Vary sentiments, urgencies, categories, priorities (5-95 range), and assignees across TEAM_MEMBERS.

Use realistic French names, Gmail/Outlook addresses, received_at dates within last 7 days.

to_email should vary: `support@teambuddy.fr` for B2C, `contact@teambuddy.fr` for B2B, `info@teambuddy.fr` for ambiguous.

- [ ] **Step 3: Add helper functions**

```typescript
export function getEmailById(id: string): Email | undefined {
  return mockEmails.find((e) => e.id === id)
}

export function getEmailsByStatut(statut: EmailStatut): Email[] {
  return mockEmails.filter((e) => e.statut === statut)
}

export function getInboxStats() {
  const today = new Date().toISOString().split('T')[0]
  const thisWeek = new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0]
  const nouveau = mockEmails.filter((e) => e.statut === 'nouveau')
  const enAttente = mockEmails.filter((e) => e.statut === 'nouveau' || e.statut === 'en_cours')
  const repondu = mockEmails.filter((e) => e.statut === 'repondu')
  const sentiments = mockEmails.filter((e) => e.ai_sentiment).reduce((acc, e) => {
    acc[e.ai_sentiment!] = (acc[e.ai_sentiment!] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return {
    nouveauxAujourdhui: nouveau.filter((e) => e.received_at >= today).length,
    enAttente: enAttente.length,
    tempsReponseMoyen: '2.4h',
    sentimentMoyen: 'neutre' as Sentiment,
    totalSemaine: mockEmails.filter((e) => e.received_at >= thisWeek).length,
    totalMois: mockEmails.length,
    tauxResolution: repondu.length > 0 ? Math.round((repondu.length / mockEmails.length) * 100) : 0,
    sentiments,
  }
}

export function getMockDashboardData() {
  // 30 days of mock volume data for charts
  const volumeParJour = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(Date.now() - (29 - i) * 86400000)
    return {
      date: date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      volume: Math.floor(Math.random() * 12) + 2,
    }
  })

  const categorieDistribution = [
    { name: 'Support technique', value: 35 },
    { name: 'Commercial', value: 20 },
    { name: 'Facturation', value: 15 },
    { name: 'Question generale', value: 15 },
    { name: 'Retour produit', value: 8 },
    { name: 'Partenariat', value: 5 },
    { name: 'Interne', value: 2 },
  ]

  const sentimentDistribution = [
    { name: 'Positif', value: 25, fill: '#22c55e' },
    { name: 'Neutre', value: 40, fill: '#9ca3af' },
    { name: 'Negatif', value: 25, fill: '#f97316' },
    { name: 'En colere', value: 10, fill: '#ef4444' },
  ]

  const topMotsCles = [
    { mot: 'GPS', count: 18 },
    { mot: 'batterie', count: 14 },
    { mot: 'abonnement', count: 11 },
    { mot: 'livraison', count: 9 },
    { mot: 'application', count: 7 },
  ]

  return { volumeParJour, categorieDistribution, sentimentDistribution, topMotsCles }
}
```

- [ ] **Step 4: Verify compilation**

Run: `cd /c/Users/rdura/buddy-admin && npx tsc --noEmit 2>&1 | head -20`

- [ ] **Step 5: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add lib/email-mock.ts
git commit -m "feat(email-hub): add email types, 15 mock emails, and helpers"
```

---

## Task 2: SentimentBadge component

**Files:**
- Create: `components/SentimentBadge.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { Sentiment, SENTIMENT_CONFIG } from '@/lib/email-mock'

interface SentimentBadgeProps {
  sentiment: Sentiment | null
  size?: 'sm' | 'md'
}

export default function SentimentBadge({ sentiment, size = 'sm' }: SentimentBadgeProps) {
  if (!sentiment) return <span className="text-gray-300 text-xs">—</span>

  const config = SENTIMENT_CONFIG[sentiment]
  const sizeClasses = size === 'sm' ? 'text-xs px-1.5 py-0.5' : 'text-sm px-2 py-1'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${config.color} ${sizeClasses}`}>
      <span>{config.emoji}</span>
      {size === 'md' && config.label}
    </span>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add components/SentimentBadge.tsx
git commit -m "feat(email-hub): add SentimentBadge component"
```

---

## Task 3: EmailCard component

**Files:**
- Create: `components/EmailCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import {
  Email,
  CATEGORIE_LABELS,
  CATEGORIE_COLORS,
  URGENCE_CONFIG,
  PRIORITE_COLORS,
  STATUT_LABELS,
  STATUT_COLORS,
} from '@/lib/email-mock'
import SentimentBadge from './SentimentBadge'

interface EmailCardProps {
  email: Email
  onClick: (email: Email) => void
  isSelected: boolean
}

export default function EmailCard({ email, onClick, isSelected }: EmailCardProps) {
  const elapsed = getElapsedTime(email.received_at)
  const prioriteColor = email.ai_priorite ? PRIORITE_COLORS(email.ai_priorite) : 'bg-gray-300'

  return (
    <div
      onClick={() => onClick(email)}
      className={`bg-white rounded-lg border p-3 cursor-pointer transition-all duration-150 hover:shadow-md ${
        isSelected
          ? 'border-indigo-300 ring-2 ring-indigo-100'
          : email.statut === 'nouveau'
          ? 'border-orange-200 bg-orange-50/30'
          : 'border-gray-100 hover:border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Priority score */}
        <div className="flex flex-col items-center gap-1 flex-shrink-0 pt-0.5">
          <div className={`w-8 h-8 rounded-lg ${prioriteColor} flex items-center justify-center text-white text-xs font-bold`}>
            {email.ai_priorite ?? '—'}
          </div>
          {email.ai_urgence && (
            <span className={`text-[9px] font-semibold uppercase tracking-wide ${URGENCE_CONFIG[email.ai_urgence].color} px-1.5 py-0.5 rounded`}>
              {URGENCE_CONFIG[email.ai_urgence].label}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <p className="font-semibold text-sm text-gray-900 truncate">{email.from_name}</p>
            <SentimentBadge sentiment={email.ai_sentiment} />
          </div>
          <p className="text-sm text-gray-700 truncate mb-1">{email.ai_resume || email.subject}</p>
          <div className="flex items-center gap-2 flex-wrap">
            {email.ai_categorie && (
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${CATEGORIE_COLORS[email.ai_categorie]}`}>
                {CATEGORIE_LABELS[email.ai_categorie]}
              </span>
            )}
            {email.ai_mots_cles?.slice(0, 3).map((mot) => (
              <span key={mot} className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                {mot}
              </span>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="flex flex-col items-end gap-1 flex-shrink-0 text-right">
          <span className="text-[10px] text-gray-400">{elapsed}</span>
          <span className="text-[10px] text-gray-400">{email.to_email.split('@')[0]}@</span>
          {email.assigne_a ? (
            <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] font-bold text-indigo-600" title={email.assigne_a}>
              {email.assigne_a.charAt(0)}
            </div>
          ) : (
            <span className="text-[10px] text-gray-300">—</span>
          )}
        </div>
      </div>
    </div>
  )
}

function getElapsedTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `${mins}min`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  return `${days}j`
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add components/EmailCard.tsx
git commit -m "feat(email-hub): add EmailCard component with priority, sentiment, and category"
```

---

## Task 4: EmailPanel component (slide-over)

**Files:**
- Create: `app/support/EmailPanel.tsx`

- [ ] **Step 1: Create the component**

A slide-over panel (same pattern as ProspectPanel from the Pipeline feature) with:
- Header: subject + close button
- AI Analysis section: sentiment (md badge), urgence, categorie, priorite score, resume, mots-cles
- Mail original section: from, to, date, body_text
- Reponse suggeree section: editable textarea pre-filled with ai_reponse_suggeree
- Actions footer: "Envoyer la reponse" (green), "Creer un ticket" (indigo), "Archiver" (gray), "Creer prospect B2B" (purple, only if ai_routage === 'b2b')
- Assigner select (TEAM_MEMBERS)
- Statut select

**Props:**
```typescript
interface EmailPanelProps {
  email: Email
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Email>) => void
  onArchive: (id: string) => void
}
```

Import from `@/lib/email-mock`: `Email, EmailStatut, SENTIMENT_CONFIG, URGENCE_CONFIG, CATEGORIE_LABELS, CATEGORIE_COLORS, STATUT_LABELS, TEAM_MEMBERS`
Import `SentimentBadge` from `@/components/SentimentBadge`

Use `useState` for editableReply (initialized from ai_reponse_suggeree).

"Envoyer la reponse" button updates email statut to 'repondu', sets repondu_at and repondu_par, then closes panel.

"Creer un ticket" shows an alert("Ticket cree !") for now (Phase 2 will create real tickets).

"Creer prospect B2B" links to `/b2b/pipeline` (Phase 2 will pre-fill).

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add app/support/EmailPanel.tsx
git commit -m "feat(email-hub): add EmailPanel slide-over with AI analysis and reply"
```

---

## Task 5: EmailInbox component

**Files:**
- Create: `app/support/EmailInbox.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState, useMemo } from 'react'
import StatsCard from '@/components/StatsCard'
import EmailCard from '@/components/EmailCard'
import EmailPanel from './EmailPanel'
import {
  Email,
  EmailStatut,
  Sentiment,
  Urgence,
  EmailCategorie,
  mockEmails,
  getInboxStats,
  TEAM_MEMBERS,
  SENTIMENT_CONFIG,
  URGENCE_CONFIG,
  CATEGORIE_LABELS,
  STATUT_LABELS,
} from '@/lib/email-mock'

export default function EmailInbox() {
  const [emails, setEmails] = useState<Email[]>([...mockEmails])
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null)
  const [filterStatut, setFilterStatut] = useState('')
  const [filterSentiment, setFilterSentiment] = useState('')
  const [filterCategorie, setFilterCategorie] = useState('')
  const [filterUrgence, setFilterUrgence] = useState('')
  const [filterAssigne, setFilterAssigne] = useState('')
  const [filterDestinataire, setFilterDestinataire] = useState('')

  const filteredEmails = useMemo(() => {
    return emails
      .filter((e) => {
        if (filterStatut && e.statut !== filterStatut) return false
        if (filterSentiment && e.ai_sentiment !== filterSentiment) return false
        if (filterCategorie && e.ai_categorie !== filterCategorie) return false
        if (filterUrgence && e.ai_urgence !== filterUrgence) return false
        if (filterAssigne && e.assigne_a !== filterAssigne) return false
        if (filterDestinataire && !e.to_email.startsWith(filterDestinataire)) return false
        return true
      })
      .sort((a, b) => (b.ai_priorite ?? 0) - (a.ai_priorite ?? 0))
  }, [emails, filterStatut, filterSentiment, filterCategorie, filterUrgence, filterAssigne, filterDestinataire])

  const stats = getInboxStats()

  const handleUpdate = (id: string, updates: Partial<Email>) => {
    setEmails((prev) => prev.map((e) => e.id === id ? { ...e, ...updates } : e))
    if (selectedEmail?.id === id) {
      setSelectedEmail((prev) => prev ? { ...prev, ...updates } : null)
    }
  }

  const handleArchive = (id: string) => {
    handleUpdate(id, { statut: 'archive' })
    setSelectedEmail(null)
  }

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <StatsCard title="Nouveaux aujourd'hui" value={stats.nouveauxAujourdhui} subtitle="Mails recus" icon="📩" color="orange" />
        <StatsCard title="En attente" value={stats.enAttente} subtitle="A traiter" icon="⏳" color={stats.enAttente > 5 ? 'red' : 'blue'} />
        <StatsCard title="Temps de reponse" value={stats.tempsReponseMoyen} subtitle="Moyenne" icon="⚡" color="green" />
        <StatsCard title="Sentiment moyen" value={SENTIMENT_CONFIG[stats.sentimentMoyen].emoji + ' ' + SENTIMENT_CONFIG[stats.sentimentMoyen].label} subtitle="Sur les 7 derniers jours" icon="📊" color="purple" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="">Tous statuts</option>
          {Object.entries(STATUT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterSentiment} onChange={(e) => setFilterSentiment(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="">Tous sentiments</option>
          {Object.entries(SENTIMENT_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.emoji} {v.label}</option>)}
        </select>
        <select value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="">Toutes categories</option>
          {Object.entries(CATEGORIE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterUrgence} onChange={(e) => setFilterUrgence(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="">Toutes urgences</option>
          {Object.entries(URGENCE_CONFIG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterAssigne} onChange={(e) => setFilterAssigne(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="">Tous membres</option>
          {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterDestinataire} onChange={(e) => setFilterDestinataire(e.target.value)} className="text-xs border border-gray-200 rounded-lg px-2 py-1.5">
          <option value="">Toutes adresses</option>
          <option value="support">support@</option>
          <option value="contact">contact@</option>
          <option value="info">info@</option>
        </select>
      </div>

      {/* Email list */}
      <div className="space-y-2">
        {filteredEmails.map((email) => (
          <EmailCard
            key={email.id}
            email={email}
            onClick={setSelectedEmail}
            isSelected={selectedEmail?.id === email.id}
          />
        ))}
        {filteredEmails.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">📭</p>
            <p className="font-medium">Aucun mail</p>
            <p className="text-sm mt-1">Modifiez les filtres ou attendez de nouveaux messages.</p>
          </div>
        )}
      </div>

      {/* Panel */}
      {selectedEmail && (
        <EmailPanel
          email={selectedEmail}
          onClose={() => setSelectedEmail(null)}
          onUpdate={handleUpdate}
          onArchive={handleArchive}
        />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add app/support/EmailInbox.tsx
git commit -m "feat(email-hub): add EmailInbox with KPIs, filters, and email list"
```

---

## Task 6: EmailDashboard component

**Files:**
- Create: `app/support/EmailDashboard.tsx`

- [ ] **Step 1: Create the component**

Uses Recharts (already installed in the project). Import `LineChart, Line, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, ResponsiveContainer` from `recharts`.

Import `getMockDashboardData, getInboxStats` from `@/lib/email-mock`.

Layout:
- Row 1: 4 StatsCards (volume today, volume week, resolution rate, avg response time)
- Row 2: LineChart (volume per day, 30 days) + PieChart (category distribution)
- Row 3: BarChart (sentiment distribution) + Top 5 keywords list

Each chart wrapped in a white card with title, using `ResponsiveContainer` with `width="100%"` and `height={250}`.

Colors: indigo for volume line, use `fill` from sentimentDistribution data for bar colors.

Keywords displayed as a ranked list with horizontal bars (div with percentage width).

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add app/support/EmailDashboard.tsx
git commit -m "feat(email-hub): add EmailDashboard with charts and analytics"
```

---

## Task 7: Update Support page (add Inbox tab)

**Files:**
- Modify: `app/support/page.tsx`

- [ ] **Step 1: Add Inbox tab and dashboard toggle**

Changes to `app/support/page.tsx`:

1. Add imports:
```typescript
import EmailInbox from './EmailInbox'
import EmailDashboard from './EmailDashboard'
```

2. Change Tab type to include 'inbox':
```typescript
type Tab = 'inbox' | 'messagerie' | 'tickets' | 'sos'
```

3. Add state for dashboard toggle:
```typescript
const [showDashboard, setShowDashboard] = useState(false)
```

4. Set default tab to 'inbox':
```typescript
const [activeTab, setActiveTab] = useState<Tab>('inbox')
```

5. Update tabs array to include Inbox first:
```typescript
const tabs: { key: Tab; label: string; icon: string }[] = [
  { key: 'inbox',       label: 'Inbox',       icon: '📧' },
  { key: 'messagerie',  label: 'Messagerie',  icon: '💬' },
  { key: 'tickets',     label: 'Tickets',     icon: '🎫' },
  { key: 'sos',         label: 'SOS',         icon: '⚠️' },
]
```

6. Add Inbox tab content and dashboard toggle:
```tsx
{activeTab === 'inbox' && (
  <section>
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-gray-800">
        {showDashboard ? 'Dashboard Analytics' : 'Inbox'}
      </h2>
      <button
        onClick={() => setShowDashboard(!showDashboard)}
        className="text-xs font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors"
      >
        {showDashboard ? '← Retour a l\'inbox' : '📊 Dashboard'}
      </button>
    </div>
    {showDashboard ? <EmailDashboard /> : <EmailInbox />}
  </section>
)}
```

7. Update the header stats to use email data instead of only ticket data (add inbox count to subtitle).

- [ ] **Step 2: Build and verify**

Run: `cd /c/Users/rdura/buddy-admin && npm run build 2>&1 | tail -10`

- [ ] **Step 3: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add app/support/page.tsx
git commit -m "feat(email-hub): add Inbox tab with dashboard toggle to Support page"
```

---

## Task 8: AI & Gmail stubs (`lib/email-ai.ts` + `lib/gmail.ts`)

**Files:**
- Create: `lib/email-ai.ts`
- Create: `lib/gmail.ts`

- [ ] **Step 1: Create email-ai.ts**

```typescript
// lib/email-ai.ts
// AI analysis stub — returns mock data for now
// Set AI_MODE=live in env to use real Claude API (Phase 2)

import { Email, Sentiment, Urgence, EmailCategorie, Routage } from './email-mock'

export interface AIAnalysis {
  sentiment: Sentiment
  urgence: Urgence
  categorie: EmailCategorie
  resume: string
  mots_cles: string[]
  priorite: number
  routage: Routage
  reponse_suggeree: string
}

export async function analyzeEmail(email: Email): Promise<AIAnalysis> {
  const mode = process.env.AI_MODE || 'mock'

  if (mode === 'live') {
    // Phase 2: Call Claude API here
    // const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    // const response = await anthropic.messages.create({ ... })
    throw new Error('AI_MODE=live not yet implemented. Set AI_MODE=mock.')
  }

  // Mock: return the pre-filled analysis from the email itself
  return {
    sentiment: email.ai_sentiment || 'neutre',
    urgence: email.ai_urgence || 'normale',
    categorie: email.ai_categorie || 'question_generale',
    resume: email.ai_resume || email.subject,
    mots_cles: email.ai_mots_cles || [],
    priorite: email.ai_priorite || 30,
    routage: email.ai_routage || 'b2c',
    reponse_suggeree: email.ai_reponse_suggeree || 'Merci pour votre message. Nous reviendrons vers vous rapidement.',
  }
}
```

- [ ] **Step 2: Create gmail.ts**

```typescript
// lib/gmail.ts
// Gmail client stub — returns mock data for now
// Set GMAIL_MODE=live in env to use real Gmail API (Phase 1b)

import { Email, mockEmails } from './email-mock'

export interface GmailSyncResult {
  newEmails: Email[]
  totalFetched: number
}

export async function syncGmail(): Promise<GmailSyncResult> {
  const mode = process.env.GMAIL_MODE || 'mock'

  if (mode === 'live') {
    // Phase 1b: Use googleapis here
    // const gmail = google.gmail({ version: 'v1', auth })
    // const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread' })
    throw new Error('GMAIL_MODE=live not yet implemented. Set GMAIL_MODE=mock.')
  }

  // Mock: return all mock emails
  return {
    newEmails: mockEmails,
    totalFetched: mockEmails.length,
  }
}
```

- [ ] **Step 3: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add lib/email-ai.ts lib/gmail.ts
git commit -m "feat(email-hub): add AI analysis and Gmail client stubs (mock mode)"
```

---

## Task 9: API routes

**Files:**
- Create: `app/api/emails/sync/route.ts`
- Create: `app/api/emails/[id]/route.ts`

- [ ] **Step 1: Create sync route**

```typescript
// app/api/emails/sync/route.ts
import { NextResponse } from 'next/server'
import { syncGmail } from '@/lib/gmail'

export async function POST() {
  try {
    const result = await syncGmail()
    return NextResponse.json({
      success: true,
      newEmails: result.newEmails.length,
      totalFetched: result.totalFetched,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
```

- [ ] **Step 2: Create email detail route**

```typescript
// app/api/emails/[id]/route.ts
import { NextResponse } from 'next/server'
import { getEmailById } from '@/lib/email-mock'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const email = getEmailById(id)
  if (!email) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(email)
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const updates = await request.json()
  // In Phase 2, this will update Supabase
  return NextResponse.json({ success: true, id, updates })
}
```

- [ ] **Step 3: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add app/api/emails/
git commit -m "feat(email-hub): add email sync and detail API routes"
```

---

## Task 10: Visual verification & deploy

- [ ] **Step 1: Build**

Run: `cd /c/Users/rdura/buddy-admin && npm run build 2>&1 | tail -15`
Expected: Build succeeds (ignore pre-existing supabase errors)

- [ ] **Step 2: Visual check**

Run dev server and verify at `http://localhost:3000/support`:
- "Inbox" tab appears first and is active by default
- 4 KPI cards display at top
- 15 mock emails listed, sorted by priority (highest first)
- All 6 filters work
- Click on email opens slide-over panel with AI analysis
- "Dashboard" button toggles analytics view with charts
- Messagerie, Tickets, SOS tabs still work

- [ ] **Step 3: Final commit**

```bash
cd /c/Users/rdura/buddy-admin
git add -A
git commit -m "feat(email-hub): complete Email Intelligence Hub (Phase 1a mock)

- Inbox with AI-enriched email list (sentiment, urgency, category, priority)
- Email detail panel with suggested AI reply
- 6 filters (status, sentiment, category, urgency, member, address)
- Analytics dashboard with volume, sentiment, category charts
- Gmail and Claude API stubs ready for Phase 1b/2
- 15 realistic mock emails
- Priority-sorted inbox (most urgent first)"
```

- [ ] **Step 4: Push to deploy**

```bash
cd /c/Users/rdura/buddy-admin
git push origin main
```

Vercel auto-deploys. Check `buddy-admin-xi.vercel.app/support` after ~1 min.
