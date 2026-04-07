# Pipeline Prospection B2B — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Kanban-style B2B prospect pipeline to the Buddy Admin dashboard, with drag & drop, detail panel, and automatic conversion to existing B2B Clients.

**Architecture:** New page at `/b2b/pipeline` with a Kanban board built from 3 components (PipelineBoard, ProspectCard, ProspectPanel). Mock data in `lib/pipeline-mock.ts` following the same pattern as `b2b-mock.ts`. Sidebar updated to include the new link. Conversion flow creates entries in the existing `mockB2BClients` array.

**Tech Stack:** Next.js 16 App Router, React 19, TailwindCSS v4, HTML5 drag & drop (no external libs)

---

## File Structure

### New files
| File | Responsibility |
|------|---------------|
| `lib/pipeline-mock.ts` | TypeScript interfaces (Prospect, ProspectNote) + mock data + helper functions + status labels/colors |
| `components/PipelineBoard.tsx` | Kanban board: columns layout, drag & drop handlers, filtering |
| `components/ProspectCard.tsx` | Individual card in a Kanban column |
| `components/ProspectPanel.tsx` | Slide-over detail panel for viewing/editing a prospect |
| `app/b2b/pipeline/page.tsx` | Page: KPI cards + PipelineBoard + ProspectPanel + "Nouveau prospect" button |

### Modified files
| File | Change |
|------|--------|
| `components/Sidebar.tsx` | Add "Pipeline" link as first item in `b2bItems` array |

---

## Task 1: Mock data & types (`lib/pipeline-mock.ts`)

**Files:**
- Create: `lib/pipeline-mock.ts`

- [ ] **Step 1: Create the file with interfaces and constants**

```typescript
// lib/pipeline-mock.ts
// ============================================================
// Pipeline Prospection B2B — Mock Data
// ============================================================

export interface ProspectNote {
  id: string
  auteur: string
  contenu: string
  date: string
}

export interface Prospect {
  id: string
  entreprise: string
  type: 'distributeur' | 'ecole' | 'e-commerce' | 'collectivite' | 'autre'
  type_structure: 'centrale' | 'magasin' | 'groupement' | 'independant'
  enseigne_parente: string | null
  ville: string
  region: string
  nb_points_de_vente: number | null

  contact_nom: string
  contact_email: string
  contact_telephone: string

  statut: 'identifie' | 'contacte' | 'demo_rdv' | 'proposition' | 'gagne' | 'perdu'
  source: 'salon' | 'linkedin' | 'cold_email' | 'recommandation' | 'site_web' | 'autre'
  montant_estime: number
  prochaine_action: string
  date_relance: string
  raison_perte: string | null

  assigne_a: string
  notes: ProspectNote[]

  created_at: string
  updated_at: string
}

export type ProspectStatut = Prospect['statut']
export type ProspectSource = Prospect['source']
export type ProspectType = Prospect['type']
export type ProspectStructure = Prospect['type_structure']

export const PIPELINE_COLUMNS: { key: ProspectStatut; label: string; color: string }[] = [
  { key: 'identifie', label: 'Identifie', color: 'gray' },
  { key: 'contacte', label: 'Contacte', color: 'blue' },
  { key: 'demo_rdv', label: 'Demo / RDV', color: 'orange' },
  { key: 'proposition', label: 'Proposition', color: 'purple' },
  { key: 'gagne', label: 'Gagne', color: 'green' },
]

export const STATUT_LABELS: Record<ProspectStatut, string> = {
  identifie: 'Identifie',
  contacte: 'Contacte',
  demo_rdv: 'Demo / RDV',
  proposition: 'Proposition',
  gagne: 'Gagne',
  perdu: 'Perdu',
}

export const STATUT_COLORS: Record<ProspectStatut, string> = {
  identifie: 'bg-gray-100 text-gray-700',
  contacte: 'bg-blue-100 text-blue-700',
  demo_rdv: 'bg-orange-100 text-orange-700',
  proposition: 'bg-purple-100 text-purple-700',
  gagne: 'bg-green-100 text-green-700',
  perdu: 'bg-red-100 text-red-700',
}

export const SOURCE_LABELS: Record<ProspectSource, string> = {
  salon: 'Salon',
  linkedin: 'LinkedIn',
  cold_email: 'Cold email',
  recommandation: 'Recommandation',
  site_web: 'Site web',
  autre: 'Autre',
}

export const TYPE_LABELS: Record<ProspectType, string> = {
  distributeur: 'Distributeur',
  ecole: 'Ecole',
  'e-commerce': 'E-commerce',
  collectivite: 'Collectivite',
  autre: 'Autre',
}

export const STRUCTURE_LABELS: Record<ProspectStructure, string> = {
  centrale: 'Centrale',
  magasin: 'Magasin',
  groupement: 'Groupement',
  independant: 'Independant',
}

export const STRUCTURE_COLORS: Record<ProspectStructure, string> = {
  centrale: 'bg-indigo-100 text-indigo-700',
  magasin: 'bg-teal-100 text-teal-700',
  groupement: 'bg-amber-100 text-amber-700',
  independant: 'bg-slate-100 text-slate-700',
}

export const RAISON_PERTE_OPTIONS = [
  { value: 'prix', label: 'Prix trop eleve' },
  { value: 'timing', label: 'Pas le bon timing' },
  { value: 'concurrent', label: 'Choisi un concurrent' },
  { value: 'pas_interesse', label: 'Pas interesse' },
  { value: 'autre', label: 'Autre' },
]

export const TEAM_MEMBERS = ['Romain', 'Adrien', 'Alex', 'Maxime']
```

- [ ] **Step 2: Add mock prospect data**

Append below the constants in the same file:

```typescript
export let mockProspects: Prospect[] = [
  {
    id: 'p1',
    entreprise: 'Cultura',
    type: 'distributeur',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Merignac',
    region: 'Nouvelle-Aquitaine',
    nb_points_de_vente: 95,
    contact_nom: 'Marie Dupont',
    contact_email: 'marie.dupont@cultura.fr',
    contact_telephone: '+33 5 56 12 34 56',
    statut: 'identifie',
    source: 'salon',
    montant_estime: 150000,
    prochaine_action: 'Envoyer catalogue et tarifs distributeur',
    date_relance: '2026-04-12',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      { id: 'n1', auteur: 'Romain', contenu: 'Rencontre au salon du jouet Paris. Tres interesse par Buddy Mini pour rayon jouets connectes.', date: '2026-04-02' },
    ],
    created_at: '2026-04-02',
    updated_at: '2026-04-02',
  },
  {
    id: 'p2',
    entreprise: 'Oxybul',
    type: 'e-commerce',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Paris',
    region: 'Ile-de-France',
    nb_points_de_vente: 60,
    contact_nom: 'Jean Moreau',
    contact_email: 'jmoreau@oxybul.com',
    contact_telephone: '+33 1 45 67 89 01',
    statut: 'contacte',
    source: 'cold_email',
    montant_estime: 80000,
    prochaine_action: 'Relancer pour caler un RDV demo',
    date_relance: '2026-04-10',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      { id: 'n2', auteur: 'Romain', contenu: 'Email envoye le 28/03, reponse positive. Interesse par une demo.', date: '2026-03-30' },
    ],
    created_at: '2026-03-28',
    updated_at: '2026-03-30',
  },
  {
    id: 'p3',
    entreprise: 'E.Leclerc',
    type: 'distributeur',
    type_structure: 'groupement',
    enseigne_parente: null,
    ville: 'Ivry-sur-Seine',
    region: 'Ile-de-France',
    nb_points_de_vente: 721,
    contact_nom: 'Sophie Bernard',
    contact_email: 's.bernard@leclerc.fr',
    contact_telephone: '+33 1 49 87 65 43',
    statut: 'demo_rdv',
    source: 'recommandation',
    montant_estime: 500000,
    prochaine_action: 'RDV demo au siege le 15 avril',
    date_relance: '2026-04-15',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      { id: 'n3', auteur: 'Romain', contenu: 'RDV confirme le 15/04 au siege Ivry. Presenter gamme complete + conditions volume.', date: '2026-04-05' },
      { id: 'n4', auteur: 'Adrien', contenu: 'Preparer une demo live du Buddy Mini + Big. Amener 2 echantillons.', date: '2026-04-03' },
    ],
    created_at: '2026-03-15',
    updated_at: '2026-04-05',
  },
  {
    id: 'p4',
    entreprise: 'Boulanger',
    type: 'distributeur',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Lesquin',
    region: 'Hauts-de-France',
    nb_points_de_vente: 200,
    contact_nom: 'Thomas Leroy',
    contact_email: 't.leroy@boulanger.com',
    contact_telephone: '+33 3 20 45 67 89',
    statut: 'identifie',
    source: 'linkedin',
    montant_estime: 200000,
    prochaine_action: 'Envoyer message LinkedIn au buyer jouets connectes',
    date_relance: '2026-04-08',
    raison_perte: null,
    assigne_a: 'Alex',
    notes: [],
    created_at: '2026-04-05',
    updated_at: '2026-04-05',
  },
  {
    id: 'p5',
    entreprise: 'Nature & Decouvertes',
    type: 'distributeur',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Versailles',
    region: 'Ile-de-France',
    nb_points_de_vente: 98,
    contact_nom: 'Claire Petit',
    contact_email: 'c.petit@natureetdecouvertes.com',
    contact_telephone: '+33 1 39 24 56 78',
    statut: 'proposition',
    source: 'salon',
    montant_estime: 120000,
    prochaine_action: 'Attendre retour sur proposition tarifaire',
    date_relance: '2026-04-18',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      { id: 'n5', auteur: 'Romain', contenu: 'Proposition tarifaire envoyee : 1500 Mini a 79e, 500 Big a 115e.', date: '2026-04-04' },
      { id: 'n6', auteur: 'Romain', contenu: 'Demo faite au salon, tres enthousiaste. Demande une proposition ecrite.', date: '2026-03-28' },
    ],
    created_at: '2026-03-20',
    updated_at: '2026-04-04',
  },
  {
    id: 'p6',
    entreprise: 'JoueCLub Toulouse',
    type: 'distributeur',
    type_structure: 'magasin',
    enseigne_parente: 'JoueClub',
    ville: 'Toulouse',
    region: 'Occitanie',
    nb_points_de_vente: null,
    contact_nom: 'Marc Fabre',
    contact_email: 'toulouse@joueclub.fr',
    contact_telephone: '+33 5 61 23 45 67',
    statut: 'contacte',
    source: 'site_web',
    montant_estime: 8000,
    prochaine_action: 'Envoyer conditions magasin individuel',
    date_relance: '2026-04-11',
    raison_perte: null,
    assigne_a: 'Maxime',
    notes: [
      { id: 'n7', auteur: 'Maxime', contenu: 'Contact via formulaire site. Gerant du magasin, veut tester 20 Buddy Mini.', date: '2026-04-01' },
    ],
    created_at: '2026-04-01',
    updated_at: '2026-04-01',
  },
  {
    id: 'p7',
    entreprise: 'Mairie de Bordeaux',
    type: 'collectivite',
    type_structure: 'independant',
    enseigne_parente: null,
    ville: 'Bordeaux',
    region: 'Nouvelle-Aquitaine',
    nb_points_de_vente: null,
    contact_nom: 'Anne Martin',
    contact_email: 'a.martin@mairie-bordeaux.fr',
    contact_telephone: '+33 5 56 10 20 30',
    statut: 'identifie',
    source: 'recommandation',
    montant_estime: 25000,
    prochaine_action: 'Contacter le service enfance/jeunesse',
    date_relance: '2026-04-14',
    raison_perte: null,
    assigne_a: 'Adrien',
    notes: [],
    created_at: '2026-04-06',
    updated_at: '2026-04-06',
  },
]
```

- [ ] **Step 3: Add helper functions**

Append below the mock data:

```typescript
import { formatEur } from './b2b-mock'

export { formatEur }

export function getProspectsByStatut(statut: ProspectStatut): Prospect[] {
  return mockProspects.filter((p) => p.statut === statut)
}

export function getProspectById(id: string): Prospect | undefined {
  return mockProspects.find((p) => p.id === id)
}

export function updateProspectStatut(id: string, statut: ProspectStatut): void {
  const prospect = mockProspects.find((p) => p.id === id)
  if (prospect) {
    prospect.statut = statut
    prospect.updated_at = new Date().toISOString().split('T')[0]
  }
}

export function getPipelineStats() {
  const active = mockProspects.filter((p) => !['gagne', 'perdu'].includes(p.statut))
  const gagne = mockProspects.filter((p) => p.statut === 'gagne')
  const perdu = mockProspects.filter((p) => p.statut === 'perdu')
  const today = new Date().toISOString().split('T')[0]
  const relancesToday = active.filter((p) => p.date_relance <= today)

  return {
    totalActive: active.length,
    valeurPipeline: active.reduce((sum, p) => sum + p.montant_estime, 0),
    tauxConversion: gagne.length + perdu.length > 0
      ? Math.round((gagne.length / (gagne.length + perdu.length)) * 100)
      : 0,
    relancesAujourdhui: relancesToday.length,
  }
}
```

Note: move the `import { formatEur }` to the top of the file during implementation.

- [ ] **Step 4: Verify the file compiles**

Run: `cd /c/Users/rdura/buddy-admin && npx tsc --noEmit lib/pipeline-mock.ts 2>&1 || echo "Check manually"`

- [ ] **Step 5: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add lib/pipeline-mock.ts
git commit -m "feat(pipeline): add prospect types, mock data, and helpers"
```

---

## Task 2: Sidebar link

**Files:**
- Modify: `components/Sidebar.tsx:20-26`

- [ ] **Step 1: Add Pipeline as first item in b2bItems**

In `components/Sidebar.tsx`, change the `b2bItems` array (line 20-26) from:

```typescript
const b2bItems = [
  { href: '/b2b/clients', label: 'Clients B2B', icon: '🏢' },
  { href: '/b2b/orders', label: 'Commandes', icon: '📦' },
  { href: '/b2b/deliveries', label: 'Livraisons', icon: '🚚' },
  { href: '/b2b/stock', label: 'Stock & Arrivages', icon: '📊' },
  { href: '/b2b/simulator', label: 'Simulateur', icon: '🧮' },
]
```

to:

```typescript
const b2bItems = [
  { href: '/b2b/pipeline', label: 'Pipeline', icon: '🎯' },
  { href: '/b2b/clients', label: 'Clients B2B', icon: '🏢' },
  { href: '/b2b/orders', label: 'Commandes', icon: '📦' },
  { href: '/b2b/deliveries', label: 'Livraisons', icon: '🚚' },
  { href: '/b2b/stock', label: 'Stock & Arrivages', icon: '📊' },
  { href: '/b2b/simulator', label: 'Simulateur', icon: '🧮' },
]
```

- [ ] **Step 2: Verify sidebar renders**

Run: `cd /c/Users/rdura/buddy-admin && npm run build 2>&1 | tail -5`
Expected: Build succeeds (or at least no error in Sidebar.tsx)

- [ ] **Step 3: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add components/Sidebar.tsx
git commit -m "feat(pipeline): add Pipeline link to B2B sidebar section"
```

---

## Task 3: ProspectCard component

**Files:**
- Create: `components/ProspectCard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { Prospect, STRUCTURE_COLORS, STRUCTURE_LABELS, formatEur } from '@/lib/pipeline-mock'

interface ProspectCardProps {
  prospect: Prospect
  onClick: (prospect: Prospect) => void
}

export default function ProspectCard({ prospect, onClick }: ProspectCardProps) {
  const today = new Date().toISOString().split('T')[0]
  const isOverdue = prospect.date_relance <= today

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('prospectId', prospect.id)
        e.dataTransfer.effectAllowed = 'move'
      }}
      onClick={() => onClick(prospect)}
      className="bg-white rounded-lg border border-gray-200 p-3 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all duration-150 select-none"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="font-semibold text-sm text-gray-900 leading-tight">{prospect.entreprise}</p>
        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full whitespace-nowrap ${STRUCTURE_COLORS[prospect.type_structure]}`}>
          {STRUCTURE_LABELS[prospect.type_structure]}
        </span>
      </div>

      {prospect.type_structure === 'magasin' || prospect.type_structure === 'independant' ? (
        <p className="text-xs text-gray-500 mb-1">{prospect.ville}</p>
      ) : prospect.nb_points_de_vente ? (
        <p className="text-xs text-gray-500 mb-1">{prospect.nb_points_de_vente} magasins</p>
      ) : null}

      <p className="text-sm font-medium text-indigo-600 mb-2">
        ~{formatEur(prospect.montant_estime)}
      </p>

      <div className="flex items-center justify-between">
        <p className={`text-xs ${isOverdue ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
          {isOverdue ? 'Relance !' : `Relance: ${new Date(prospect.date_relance).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
        </p>
        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-[10px] font-bold text-indigo-600" title={prospect.assigne_a}>
          {prospect.assigne_a.charAt(0)}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add components/ProspectCard.tsx
git commit -m "feat(pipeline): add ProspectCard component with drag support"
```

---

## Task 4: ProspectPanel component (slide-over detail)

**Files:**
- Create: `components/ProspectPanel.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'
import {
  Prospect,
  ProspectNote,
  ProspectStatut,
  STATUT_LABELS,
  STATUT_COLORS,
  TYPE_LABELS,
  STRUCTURE_LABELS,
  SOURCE_LABELS,
  RAISON_PERTE_OPTIONS,
  TEAM_MEMBERS,
  formatEur,
} from '@/lib/pipeline-mock'

interface ProspectPanelProps {
  prospect: Prospect
  onClose: () => void
  onUpdate: (id: string, updates: Partial<Prospect>) => void
  onConvert: (prospect: Prospect) => void
  onDelete: (id: string) => void
}

export default function ProspectPanel({ prospect, onClose, onUpdate, onConvert, onDelete }: ProspectPanelProps) {
  const [newNote, setNewNote] = useState('')
  const [showLostModal, setShowLostModal] = useState(false)
  const [raisonPerte, setRaisonPerte] = useState('')

  const handleAddNote = () => {
    if (!newNote.trim()) return
    const note: ProspectNote = {
      id: `n-${Date.now()}`,
      auteur: 'Romain',
      contenu: newNote.trim(),
      date: new Date().toISOString().split('T')[0],
    }
    onUpdate(prospect.id, { notes: [note, ...prospect.notes] })
    setNewNote('')
  }

  const handleMarkLost = () => {
    if (!raisonPerte) return
    onUpdate(prospect.id, { statut: 'perdu', raison_perte: raisonPerte })
    setShowLostModal(false)
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={onClose} />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 w-[480px] bg-white shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{prospect.entreprise}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">&times;</button>
        </div>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
          {/* Statut */}
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Statut</label>
            <select
              value={prospect.statut}
              onChange={(e) => {
                const val = e.target.value as ProspectStatut
                if (val === 'gagne') { onConvert(prospect); return }
                if (val === 'perdu') { setShowLostModal(true); return }
                onUpdate(prospect.id, { statut: val })
              }}
              className={`text-sm font-medium px-3 py-1.5 rounded-lg border-0 ${STATUT_COLORS[prospect.statut]}`}
            >
              {Object.entries(STATUT_LABELS).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          {/* Infos entreprise */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Infos entreprise</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-gray-400">Type</span><p className="font-medium text-gray-700">{TYPE_LABELS[prospect.type]}</p></div>
              <div><span className="text-gray-400">Structure</span><p className="font-medium text-gray-700">{STRUCTURE_LABELS[prospect.type_structure]}</p></div>
              {prospect.enseigne_parente && (
                <div><span className="text-gray-400">Enseigne</span><p className="font-medium text-gray-700">{prospect.enseigne_parente}</p></div>
              )}
              <div><span className="text-gray-400">Ville</span><p className="font-medium text-gray-700">{prospect.ville}</p></div>
              <div><span className="text-gray-400">Region</span><p className="font-medium text-gray-700">{prospect.region}</p></div>
              {prospect.nb_points_de_vente && (
                <div><span className="text-gray-400">Points de vente</span><p className="font-medium text-gray-700">{prospect.nb_points_de_vente}</p></div>
              )}
              <div><span className="text-gray-400">Source</span><p className="font-medium text-gray-700">{SOURCE_LABELS[prospect.source]}</p></div>
              <div><span className="text-gray-400">Montant estime</span><p className="font-medium text-indigo-600">{formatEur(prospect.montant_estime)}</p></div>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Contact</h3>
            <div className="space-y-2 text-sm">
              <p className="font-medium text-gray-900">{prospect.contact_nom}</p>
              <a href={`mailto:${prospect.contact_email}`} className="text-indigo-600 hover:underline block">{prospect.contact_email}</a>
              <a href={`tel:${prospect.contact_telephone}`} className="text-indigo-600 hover:underline block">{prospect.contact_telephone}</a>
            </div>
          </div>

          {/* Suivi */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Suivi</h3>
            <div className="space-y-3 text-sm">
              <div>
                <label className="text-gray-400 block mb-1">Assigne a</label>
                <select
                  value={prospect.assigne_a}
                  onChange={(e) => onUpdate(prospect.id, { assigne_a: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full"
                >
                  {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Prochaine action</label>
                <input
                  type="text"
                  value={prospect.prochaine_action}
                  onChange={(e) => onUpdate(prospect.id, { prochaine_action: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full"
                />
              </div>
              <div>
                <label className="text-gray-400 block mb-1">Date de relance</label>
                <input
                  type="date"
                  value={prospect.date_relance}
                  onChange={(e) => onUpdate(prospect.id, { date_relance: e.target.value })}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Notes</h3>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Ajouter une note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm"
              />
              <button
                onClick={handleAddNote}
                className="bg-indigo-600 text-white text-sm px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                +
              </button>
            </div>
            <div className="space-y-3">
              {prospect.notes.map((note) => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">
                      {new Date(note.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                    </span>
                    <span className="text-xs text-gray-400">—</span>
                    <span className="text-xs font-medium text-indigo-600">{note.auteur}</span>
                  </div>
                  <p className="text-sm text-gray-700">{note.contenu}</p>
                </div>
              ))}
              {prospect.notes.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Aucune note</p>
              )}
            </div>
          </div>
        </div>

        {/* Actions footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex gap-2">
          <button
            onClick={() => onConvert(prospect)}
            className="flex-1 bg-green-600 text-white text-sm font-medium py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            Marquer Gagne
          </button>
          <button
            onClick={() => setShowLostModal(true)}
            className="flex-1 bg-red-50 text-red-600 text-sm font-medium py-2 rounded-lg hover:bg-red-100 transition-colors"
          >
            Marquer Perdu
          </button>
          <button
            onClick={() => { if (confirm('Supprimer ce prospect ?')) { onDelete(prospect.id); onClose() } }}
            className="px-3 py-2 text-gray-400 hover:text-red-500 text-sm transition-colors"
          >
            🗑
          </button>
        </div>
      </div>

      {/* Lost modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[400px]">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Raison de la perte</h3>
            <div className="space-y-2 mb-4">
              {RAISON_PERTE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    name="raison"
                    value={opt.value}
                    checked={raisonPerte === opt.value}
                    onChange={(e) => setRaisonPerte(e.target.value)}
                    className="accent-red-500"
                  />
                  <span className="text-sm text-gray-700">{opt.label}</span>
                </label>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowLostModal(false)} className="flex-1 text-sm py-2 rounded-lg border border-gray-200 hover:bg-gray-50">Annuler</button>
              <button onClick={handleMarkLost} disabled={!raisonPerte} className="flex-1 text-sm py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 disabled:opacity-50">Confirmer</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add components/ProspectPanel.tsx
git commit -m "feat(pipeline): add ProspectPanel slide-over with notes and actions"
```

---

## Task 5: PipelineBoard component (Kanban)

**Files:**
- Create: `components/PipelineBoard.tsx`

- [ ] **Step 1: Create the component**

```tsx
'use client'

import { useState } from 'react'
import { Prospect, ProspectStatut, PIPELINE_COLUMNS } from '@/lib/pipeline-mock'
import ProspectCard from './ProspectCard'

interface PipelineBoardProps {
  prospects: Prospect[]
  showLost: boolean
  onCardClick: (prospect: Prospect) => void
  onStatutChange: (id: string, newStatut: ProspectStatut) => void
}

const COLUMN_HEADER_COLORS: Record<string, string> = {
  gray: 'bg-gray-200',
  blue: 'bg-blue-400',
  orange: 'bg-orange-400',
  purple: 'bg-purple-400',
  green: 'bg-green-400',
  red: 'bg-red-400',
}

export default function PipelineBoard({ prospects, showLost, onCardClick, onStatutChange }: PipelineBoardProps) {
  const [dragOverCol, setDragOverCol] = useState<string | null>(null)

  const columns = showLost
    ? [...PIPELINE_COLUMNS, { key: 'perdu' as ProspectStatut, label: 'Perdu', color: 'red' }]
    : PIPELINE_COLUMNS

  const handleDrop = (e: React.DragEvent, targetStatut: ProspectStatut) => {
    e.preventDefault()
    setDragOverCol(null)
    const prospectId = e.dataTransfer.getData('prospectId')
    if (prospectId) {
      onStatutChange(prospectId, targetStatut)
    }
  }

  return (
    <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: 'calc(100vh - 280px)' }}>
      {columns.map((col) => {
        const colProspects = prospects.filter((p) => p.statut === col.key)
        const isOver = dragOverCol === col.key

        return (
          <div
            key={col.key}
            className={`flex-shrink-0 w-[280px] rounded-xl transition-colors duration-150 ${
              isOver ? 'bg-indigo-50 ring-2 ring-indigo-300' : 'bg-gray-50'
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.key) }}
            onDragLeave={() => setDragOverCol(null)}
            onDrop={(e) => handleDrop(e, col.key)}
          >
            {/* Column header */}
            <div className="flex items-center gap-2 px-3 py-3">
              <div className={`w-2.5 h-2.5 rounded-full ${COLUMN_HEADER_COLORS[col.color]}`} />
              <h3 className="text-sm font-semibold text-gray-700">{col.label}</h3>
              <span className="ml-auto text-xs font-medium text-gray-400 bg-white px-2 py-0.5 rounded-full">
                {colProspects.length}
              </span>
            </div>

            {/* Cards */}
            <div className="px-2 pb-3 space-y-2 min-h-[100px]">
              {colProspects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  onClick={onCardClick}
                />
              ))}
              {colProspects.length === 0 && (
                <div className="text-center py-8 text-gray-300 text-xs">
                  Glisser un prospect ici
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add components/PipelineBoard.tsx
git commit -m "feat(pipeline): add PipelineBoard Kanban with drag & drop"
```

---

## Task 6: Pipeline page (`app/b2b/pipeline/page.tsx`)

**Files:**
- Create: `app/b2b/pipeline/page.tsx`

- [ ] **Step 1: Create the page**

```tsx
'use client'

import { useState, useCallback } from 'react'
import StatsCard from '@/components/StatsCard'
import PipelineBoard from '@/components/PipelineBoard'
import ProspectPanel from '@/components/ProspectPanel'
import {
  Prospect,
  ProspectStatut,
  mockProspects,
  getPipelineStats,
  formatEur,
  TEAM_MEMBERS,
  SOURCE_LABELS,
  TYPE_LABELS,
  STRUCTURE_LABELS,
} from '@/lib/pipeline-mock'
import { mockB2BClients, B2BClient } from '@/lib/b2b-mock'

export default function PipelinePage() {
  const [prospects, setProspects] = useState<Prospect[]>([...mockProspects])
  const [selectedProspect, setSelectedProspect] = useState<Prospect | null>(null)
  const [showLost, setShowLost] = useState(false)
  const [showConvertModal, setShowConvertModal] = useState<Prospect | null>(null)
  const [filterAssigne, setFilterAssigne] = useState('')
  const [filterSource, setFilterSource] = useState('')
  const [filterType, setFilterType] = useState('')

  // Apply filters
  const filteredProspects = prospects.filter((p) => {
    if (filterAssigne && p.assigne_a !== filterAssigne) return false
    if (filterSource && p.source !== filterSource) return false
    if (filterType && p.type !== filterType) return false
    return true
  })

  // Stats (from all prospects, not filtered)
  const active = prospects.filter((p) => !['gagne', 'perdu'].includes(p.statut))
  const gagne = prospects.filter((p) => p.statut === 'gagne')
  const perdu = prospects.filter((p) => p.statut === 'perdu')
  const today = new Date().toISOString().split('T')[0]

  const stats = {
    totalActive: active.length,
    valeurPipeline: active.reduce((sum, p) => sum + p.montant_estime, 0),
    tauxConversion: gagne.length + perdu.length > 0
      ? Math.round((gagne.length / (gagne.length + perdu.length)) * 100)
      : 0,
    relancesAujourdhui: active.filter((p) => p.date_relance <= today).length,
  }

  const handleStatutChange = useCallback((id: string, newStatut: ProspectStatut) => {
    if (newStatut === 'gagne') {
      const prospect = prospects.find((p) => p.id === id)
      if (prospect) setShowConvertModal(prospect)
      return
    }
    setProspects((prev) =>
      prev.map((p) => p.id === id ? { ...p, statut: newStatut, updated_at: new Date().toISOString().split('T')[0] } : p)
    )
  }, [prospects])

  const handleUpdate = useCallback((id: string, updates: Partial<Prospect>) => {
    setProspects((prev) =>
      prev.map((p) => p.id === id ? { ...p, ...updates, updated_at: new Date().toISOString().split('T')[0] } : p)
    )
    if (selectedProspect?.id === id) {
      setSelectedProspect((prev) => prev ? { ...prev, ...updates } : null)
    }
  }, [selectedProspect])

  const handleDelete = useCallback((id: string) => {
    setProspects((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const handleConvert = (prospect: Prospect, createOrder: boolean) => {
    // Add to B2B clients
    const newClient: B2BClient = {
      id: `from-pipeline-${prospect.id}`,
      company_name: prospect.entreprise,
      contact_name: prospect.contact_nom,
      contact_email: prospect.contact_email,
      contact_phone: prospect.contact_telephone,
      city: prospect.ville,
      country: 'France',
      siret: '',
      notes: `Converti depuis Pipeline le ${new Date().toLocaleDateString('fr-FR')}. Source: ${SOURCE_LABELS[prospect.source]}.`,
      created_at: new Date().toISOString().split('T')[0],
    }
    mockB2BClients.push(newClient)

    // Remove from pipeline
    setProspects((prev) => prev.filter((p) => p.id !== prospect.id))
    setShowConvertModal(null)
    setSelectedProspect(null)

    if (createOrder) {
      window.location.href = `/b2b/orders/new?client=${newClient.id}`
    }
  }

  const handleNewProspect = () => {
    const newProspect: Prospect = {
      id: `p-${Date.now()}`,
      entreprise: 'Nouveau prospect',
      type: 'distributeur',
      type_structure: 'independant',
      enseigne_parente: null,
      ville: '',
      region: '',
      nb_points_de_vente: null,
      contact_nom: '',
      contact_email: '',
      contact_telephone: '',
      statut: 'identifie',
      source: 'autre',
      montant_estime: 0,
      prochaine_action: '',
      date_relance: new Date().toISOString().split('T')[0],
      raison_perte: null,
      assigne_a: 'Romain',
      notes: [],
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
    }
    setProspects((prev) => [newProspect, ...prev])
    setSelectedProspect(newProspect)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pipeline</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {stats.totalActive} prospects actifs — {formatEur(stats.valeurPipeline)} en pipeline
          </p>
        </div>
        <button
          onClick={handleNewProspect}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors shadow-sm"
        >
          <span>+</span>
          Nouveau prospect
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatsCard title="Total prospects" value={stats.totalActive} subtitle="Actifs dans le pipeline" icon="🎯" color="indigo" />
        <StatsCard title="Valeur pipeline" value={formatEur(stats.valeurPipeline)} subtitle="Montant estime total" icon="💰" color="green" />
        <StatsCard title="Taux de conversion" value={`${stats.tauxConversion}%`} subtitle="Gagnes / (Gagnes + Perdus)" icon="📈" color="blue" />
        <StatsCard title="Relances aujourd'hui" value={stats.relancesAujourdhui} subtitle="A relancer maintenant" icon="🔔" color={stats.relancesAujourdhui > 0 ? 'red' : 'orange'} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <select value={filterAssigne} onChange={(e) => setFilterAssigne(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
          <option value="">Tous les membres</option>
          {TEAM_MEMBERS.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
          <option value="">Toutes les sources</option>
          {Object.entries(SOURCE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="text-sm border border-gray-200 rounded-lg px-3 py-1.5">
          <option value="">Tous les types</option>
          {Object.entries(TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-500 ml-auto cursor-pointer">
          <input type="checkbox" checked={showLost} onChange={(e) => setShowLost(e.target.checked)} className="accent-red-500" />
          Afficher les perdus
        </label>
      </div>

      {/* Kanban Board */}
      <PipelineBoard
        prospects={filteredProspects}
        showLost={showLost}
        onCardClick={setSelectedProspect}
        onStatutChange={handleStatutChange}
      />

      {/* Detail Panel */}
      {selectedProspect && (
        <ProspectPanel
          prospect={selectedProspect}
          onClose={() => setSelectedProspect(null)}
          onUpdate={handleUpdate}
          onConvert={(p) => setShowConvertModal(p)}
          onDelete={handleDelete}
        />
      )}

      {/* Convert Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/40 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-[440px]">
            <p className="text-3xl text-center mb-3">🎉</p>
            <h3 className="text-lg font-bold text-gray-900 text-center mb-2">Convertir en client B2B ?</h3>
            <p className="text-sm text-gray-500 text-center mb-6">
              <strong>{showConvertModal.entreprise}</strong> va etre ajoute dans &quot;Clients B2B&quot; avec ses infos pre-remplies.
            </p>
            <div className="space-y-2 mb-6">
              <button
                onClick={() => handleConvert(showConvertModal, true)}
                className="w-full text-sm py-2.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 font-medium transition-colors"
              >
                Oui, creer une commande
              </button>
              <button
                onClick={() => handleConvert(showConvertModal, false)}
                className="w-full text-sm py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 font-medium transition-colors"
              >
                Non, juste convertir
              </button>
            </div>
            <button
              onClick={() => setShowConvertModal(null)}
              className="w-full text-sm py-2 text-gray-400 hover:text-gray-600"
            >
              Annuler
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Build and verify**

Run: `cd /c/Users/rdura/buddy-admin && npm run build 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
cd /c/Users/rdura/buddy-admin
git add app/b2b/pipeline/page.tsx
git commit -m "feat(pipeline): add Pipeline page with KPIs, filters, board, and conversion"
```

---

## Task 7: Visual verification & final commit

- [ ] **Step 1: Start dev server and check**

Run: `cd /c/Users/rdura/buddy-admin && npm run dev`

Open `http://localhost:3000/b2b/pipeline` and verify:
- Pipeline link appears in sidebar (first in B2B section)
- 4 KPI cards display at top
- Kanban board shows 5 columns with 7 mock prospects
- Cards are draggable between columns
- Clicking a card opens the slide-over panel
- Notes can be added
- Filters work (by member, source, type)
- "Marquer Gagne" shows conversion modal
- "Marquer Perdu" asks for reason
- "Nouveau prospect" creates a card in Identifie column

- [ ] **Step 2: Final commit with all files**

```bash
cd /c/Users/rdura/buddy-admin
git add -A
git commit -m "feat(pipeline): complete B2B prospect pipeline with Kanban board

- Kanban drag & drop board with 5 columns
- Prospect detail slide-over panel with notes
- KPI cards (total, valeur, conversion, relances)
- Filters by member, source, type
- Conversion flow: Gagne -> Client B2B
- Lost tracking with reason
- 7 realistic mock prospects"
```

- [ ] **Step 3: Push to deploy**

```bash
cd /c/Users/rdura/buddy-admin
git push origin main
```

Vercel auto-deploys. Check `buddy-admin-xi.vercel.app/b2b/pipeline` after ~1 min.
