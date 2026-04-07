// ============================================================
// Pipeline Prospection B2B — Mock Data
// Used while Supabase tables are being populated
// ============================================================

export { formatEur } from './b2b-mock'

// ============================================================
// Type aliases
// ============================================================

export type ProspectStatut = 'identifie' | 'contacte' | 'demo_rdv' | 'proposition' | 'gagne' | 'perdu'
export type ProspectSource = 'salon' | 'linkedin' | 'cold_email' | 'recommandation' | 'site_web' | 'autre'
export type ProspectType = 'distributeur' | 'ecole' | 'e-commerce' | 'collectivite' | 'autre'
export type ProspectStructure = 'centrale' | 'magasin' | 'groupement' | 'independant'

// ============================================================
// Interfaces
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
  type: ProspectType
  type_structure: ProspectStructure
  enseigne_parente: string | null
  ville: string
  region: string
  nb_points_de_vente: number | null
  contact_nom: string
  contact_email: string
  contact_telephone: string
  statut: ProspectStatut
  source: ProspectSource
  montant_estime: number
  prochaine_action: string
  date_relance: string
  raison_perte: string | null
  assigne_a: string
  notes: ProspectNote[]
  created_at: string
  updated_at: string
}

// ============================================================
// Constants
// ============================================================

export const PIPELINE_COLUMNS: { statut: ProspectStatut; label: string }[] = [
  { statut: 'identifie', label: 'Identifié' },
  { statut: 'contacte', label: 'Contacté' },
  { statut: 'demo_rdv', label: 'Démo / RDV' },
  { statut: 'proposition', label: 'Proposition' },
  { statut: 'gagne', label: 'Gagné' },
  { statut: 'perdu', label: 'Perdu' },
]

export const STATUT_LABELS: Record<ProspectStatut, string> = {
  identifie: 'Identifié',
  contacte: 'Contacté',
  demo_rdv: 'Démo / RDV',
  proposition: 'Proposition',
  gagne: 'Gagné',
  perdu: 'Perdu',
}

export const STATUT_COLORS: Record<ProspectStatut, string> = {
  identifie: 'bg-gray-100 text-gray-600',
  contacte: 'bg-blue-100 text-blue-700',
  demo_rdv: 'bg-purple-100 text-purple-700',
  proposition: 'bg-orange-100 text-orange-700',
  gagne: 'bg-green-100 text-green-700',
  perdu: 'bg-red-100 text-red-700',
}

export const SOURCE_LABELS: Record<ProspectSource, string> = {
  salon: 'Salon',
  linkedin: 'LinkedIn',
  cold_email: 'Cold Email',
  recommandation: 'Recommandation',
  site_web: 'Site Web',
  autre: 'Autre',
}

export const TYPE_LABELS: Record<ProspectType, string> = {
  distributeur: 'Distributeur',
  ecole: 'École',
  'e-commerce': 'E-commerce',
  collectivite: 'Collectivité',
  autre: 'Autre',
}

export const STRUCTURE_LABELS: Record<ProspectStructure, string> = {
  centrale: 'Centrale',
  magasin: 'Magasin',
  groupement: 'Groupement',
  independant: 'Indépendant',
}

export const STRUCTURE_COLORS: Record<ProspectStructure, string> = {
  centrale: 'bg-indigo-100 text-indigo-700',
  magasin: 'bg-teal-100 text-teal-700',
  groupement: 'bg-cyan-100 text-cyan-700',
  independant: 'bg-yellow-100 text-yellow-700',
}

export const RAISON_PERTE_OPTIONS: string[] = [
  'Prix trop élevé',
  'Concurrent choisi',
  'Projet abandonné',
  'Pas de budget',
  'Pas de réponse',
  'Produit inadapté',
  'Délai trop long',
  'Autre',
]

export const TEAM_MEMBERS: string[] = ['Romain', 'Adrien', 'Alex', 'Maxime']

// ============================================================
// Mock data
// ============================================================

export const mockProspects: Prospect[] = [
  {
    id: 'p1',
    entreprise: 'Cultura',
    type: 'distributeur',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Massy',
    region: 'Île-de-France',
    nb_points_de_vente: 74,
    contact_nom: 'Isabelle Fontaine',
    contact_email: 'i.fontaine@cultura.com',
    contact_telephone: '+33 1 60 11 22 33',
    statut: 'identifie',
    source: 'salon',
    montant_estime: 150000,
    prochaine_action: 'Envoyer email de présentation produit',
    date_relance: '2026-04-14',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      {
        id: 'n1-1',
        auteur: 'Romain',
        contenu: 'Rencontré au salon Kidexpo. Fort intérêt pour Buddy dans le rayon loisirs créatifs.',
        date: '2026-03-20',
      },
    ],
    created_at: '2026-03-20',
    updated_at: '2026-03-20',
  },
  {
    id: 'p2',
    entreprise: 'Oxybul',
    type: 'distributeur',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Paris',
    region: 'Île-de-France',
    nb_points_de_vente: 50,
    contact_nom: 'Thomas Renard',
    contact_email: 't.renard@oxybul.com',
    contact_telephone: '+33 1 44 55 66 77',
    statut: 'contacte',
    source: 'cold_email',
    montant_estime: 80000,
    prochaine_action: 'Relancer par téléphone après le premier email',
    date_relance: '2026-04-10',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      {
        id: 'n2-1',
        auteur: 'Romain',
        contenu: 'Email envoyé le 25 mars. Pas de réponse pour l\'instant — relancer dans 10 jours.',
        date: '2026-03-25',
      },
    ],
    created_at: '2026-03-25',
    updated_at: '2026-03-25',
  },
  {
    id: 'p3',
    entreprise: 'E.Leclerc',
    type: 'distributeur',
    type_structure: 'groupement',
    enseigne_parente: null,
    ville: 'Ivry-sur-Seine',
    region: 'Île-de-France',
    nb_points_de_vente: 700,
    contact_nom: 'Claire Marchand',
    contact_email: 'c.marchand@e-leclerc.com',
    contact_telephone: '+33 1 49 87 65 43',
    statut: 'demo_rdv',
    source: 'recommandation',
    montant_estime: 500000,
    prochaine_action: 'Préparer démo et deck personnalisé pour le RDV du 12 avril',
    date_relance: '2026-04-12',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      {
        id: 'n3-1',
        auteur: 'Romain',
        contenu: 'Recommandé par un contact King Jouet. Claire est responsable des achats jouets éducatifs.',
        date: '2026-03-10',
      },
      {
        id: 'n3-2',
        auteur: 'Romain',
        contenu: 'RDV confirmé le 12 avril à 14h en visio. Préparer cas d\'usage scolaire et retail.',
        date: '2026-03-28',
      },
    ],
    created_at: '2026-03-10',
    updated_at: '2026-03-28',
  },
  {
    id: 'p4',
    entreprise: 'Boulanger',
    type: 'distributeur',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Villeneuve-d\'Ascq',
    region: 'Hauts-de-France',
    nb_points_de_vente: 160,
    contact_nom: 'Sébastien Leroy',
    contact_email: 's.leroy@boulanger.com',
    contact_telephone: '+33 3 20 11 22 33',
    statut: 'identifie',
    source: 'linkedin',
    montant_estime: 200000,
    prochaine_action: 'Prendre contact via LinkedIn puis email',
    date_relance: '2026-04-15',
    raison_perte: null,
    assigne_a: 'Alex',
    notes: [
      {
        id: 'n4-1',
        auteur: 'Alex',
        contenu: 'Profil LinkedIn identifié. Responsable achats high-tech & éducatif. À contacter cette semaine.',
        date: '2026-04-01',
      },
    ],
    created_at: '2026-04-01',
    updated_at: '2026-04-01',
  },
  {
    id: 'p5',
    entreprise: 'Nature & Découvertes',
    type: 'distributeur',
    type_structure: 'centrale',
    enseigne_parente: null,
    ville: 'Versailles',
    region: 'Île-de-France',
    nb_points_de_vente: 90,
    contact_nom: 'Aurélie Dubois',
    contact_email: 'a.dubois@natureetdecouvertes.com',
    contact_telephone: '+33 1 39 50 12 34',
    statut: 'proposition',
    source: 'salon',
    montant_estime: 120000,
    prochaine_action: 'Suivre la validation interne et relancer si pas de retour avant le 15 avril',
    date_relance: '2026-04-15',
    raison_perte: null,
    assigne_a: 'Romain',
    notes: [
      {
        id: 'n5-1',
        auteur: 'Romain',
        contenu: 'Premier contact au salon Éduquer & Jouer. Très réceptifs à l\'aspect pédagogique.',
        date: '2026-02-15',
      },
      {
        id: 'n5-2',
        auteur: 'Romain',
        contenu: 'Proposition commerciale envoyée le 1er avril. Aurélie doit valider en comité achats.',
        date: '2026-04-01',
      },
    ],
    created_at: '2026-02-15',
    updated_at: '2026-04-01',
  },
  {
    id: 'p6',
    entreprise: 'JoueClub Toulouse',
    type: 'distributeur',
    type_structure: 'magasin',
    enseigne_parente: 'JoueClub',
    ville: 'Toulouse',
    region: 'Occitanie',
    nb_points_de_vente: 1,
    contact_nom: 'Franck Dupont',
    contact_email: 'franck@joueclub-toulouse.fr',
    contact_telephone: '+33 5 61 22 33 44',
    statut: 'contacte',
    source: 'site_web',
    montant_estime: 8000,
    prochaine_action: 'Envoyer catalogue tarifaire et conditions franchisé',
    date_relance: '2026-04-11',
    raison_perte: null,
    assigne_a: 'Maxime',
    notes: [
      {
        id: 'n6-1',
        auteur: 'Maxime',
        contenu: 'Demande entrante via formulaire site web. Gérant indépendant JoueClub, cherche à référencer Buddy Mini.',
        date: '2026-04-02',
      },
    ],
    created_at: '2026-04-02',
    updated_at: '2026-04-02',
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
    contact_nom: 'Nathalie Girard',
    contact_email: 'n.girard@mairie-bordeaux.fr',
    contact_telephone: '+33 5 56 10 20 30',
    statut: 'identifie',
    source: 'recommandation',
    montant_estime: 25000,
    prochaine_action: 'Contacter Nathalie Girard pour présenter le dispositif éducatif Buddy',
    date_relance: '2026-04-16',
    raison_perte: null,
    assigne_a: 'Adrien',
    notes: [
      {
        id: 'n7-1',
        auteur: 'Adrien',
        contenu: 'Recommandé par une association partenaire. La mairie cherche des outils numériques pédagogiques pour les écoles primaires.',
        date: '2026-04-03',
      },
    ],
    created_at: '2026-04-03',
    updated_at: '2026-04-03',
  },
]

// ============================================================
// Helper functions
// ============================================================

export function getProspectsByStatut(statut: ProspectStatut): Prospect[] {
  return mockProspects.filter((p) => p.statut === statut)
}

export function getProspectById(id: string): Prospect | undefined {
  return mockProspects.find((p) => p.id === id)
}

export function updateProspectStatut(id: string, statut: ProspectStatut): Prospect | undefined {
  const prospect = mockProspects.find((p) => p.id === id)
  if (!prospect) return undefined
  prospect.statut = statut
  prospect.updated_at = new Date().toISOString().split('T')[0]
  return prospect
}

export interface PipelineStats {
  total: number
  montantTotal: number
  parStatut: Record<ProspectStatut, { count: number; montant: number }>
  tauxConversion: number
}

export function getPipelineStats(): PipelineStats {
  const total = mockProspects.length
  const montantTotal = mockProspects.reduce((sum, p) => sum + p.montant_estime, 0)

  const statuts: ProspectStatut[] = ['identifie', 'contacte', 'demo_rdv', 'proposition', 'gagne', 'perdu']
  const parStatut = statuts.reduce(
    (acc, statut) => {
      const prospects = mockProspects.filter((p) => p.statut === statut)
      acc[statut] = {
        count: prospects.length,
        montant: prospects.reduce((sum, p) => sum + p.montant_estime, 0),
      }
      return acc
    },
    {} as Record<ProspectStatut, { count: number; montant: number }>
  )

  const gagnes = parStatut['gagne'].count
  const perdus = parStatut['perdu'].count
  const closes = gagnes + perdus
  const tauxConversion = closes > 0 ? Math.round((gagnes / closes) * 100) : 0

  return { total, montantTotal, parStatut, tauxConversion }
}
