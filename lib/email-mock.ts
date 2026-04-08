// ============================================================
// Email Intelligence Hub Mock Data — Buddy Admin
// Used while backend email service is being integrated
// ============================================================

// ============================================================
// Type definitions
// ============================================================

export type Sentiment = 'positif' | 'neutre' | 'negatif' | 'urgent'
export type Urgence = 'critique' | 'haute' | 'normale' | 'basse'
export type EmailCategorie = 'support_b2c' | 'commercial_b2b' | 'facturation' | 'question_generale' | 'retour_produit' | 'partenariat' | 'interne'
export type EmailStatut = 'nouveau' | 'lu' | 'en_cours' | 'en_attente' | 'resolu' | 'archive'
export type Routage = 'support' | 'commercial' | 'finance' | 'rh' | 'tech' | 'general'
export type TicketStatut = 'ouvert' | 'en_cours' | 'en_attente_client' | 'resolu' | 'ferme'

// ============================================================
// Interface definitions
// ============================================================

export interface Email {
  id: string
  gmail_id: string
  thread_id: string
  from_email: string
  from_name: string
  to_email: string
  subject: string
  body_text: string
  body_html?: string
  attachments: string[]
  received_at: string
  created_at: string
  ai_sentiment: Sentiment
  ai_urgence: Urgence
  ai_categorie: EmailCategorie
  ai_resume: string
  ai_mots_cles: string[]
  ai_priorite: number // 5-95 scale
  ai_reponse_suggeree: string
  ai_routage: Routage
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
  priorite: number
  categorie: EmailCategorie
  assigne_a: string | null
  ai_resume: string
  created_at: string
  updated_at: string
  resolved_at: string | null
}

// ============================================================
// Config maps
// ============================================================

export const SENTIMENT_CONFIG: Record<Sentiment, { emoji: string; label: string; color: string }> = {
  positif: {
    emoji: '😊',
    label: 'Positif',
    color: 'bg-green-100 text-green-700',
  },
  neutre: {
    emoji: '😐',
    label: 'Neutre',
    color: 'bg-gray-100 text-gray-700',
  },
  negatif: {
    emoji: '😠',
    label: 'Négatif',
    color: 'bg-red-100 text-red-700',
  },
  urgent: {
    emoji: '🚨',
    label: 'Urgent',
    color: 'bg-orange-100 text-orange-700',
  },
}

export const URGENCE_CONFIG: Record<Urgence, { emoji: string; label: string; color: string }> = {
  critique: {
    emoji: '🔴',
    label: 'Critique',
    color: 'bg-red-100 text-red-700',
  },
  haute: {
    emoji: '🟠',
    label: 'Haute',
    color: 'bg-orange-100 text-orange-700',
  },
  normale: {
    emoji: '🟡',
    label: 'Normale',
    color: 'bg-yellow-100 text-yellow-700',
  },
  basse: {
    emoji: '🟢',
    label: 'Basse',
    color: 'bg-green-100 text-green-700',
  },
}

export const CATEGORIE_LABELS: Record<EmailCategorie, string> = {
  support_b2c: 'Support B2C',
  commercial_b2b: 'Commercial B2B',
  facturation: 'Facturation',
  question_generale: 'Question générale',
  retour_produit: 'Retour produit',
  partenariat: 'Partenariat',
  interne: 'Interne',
}

export const CATEGORIE_COLORS: Record<EmailCategorie, string> = {
  support_b2c: 'bg-blue-100 text-blue-700',
  commercial_b2b: 'bg-purple-100 text-purple-700',
  facturation: 'bg-green-100 text-green-700',
  question_generale: 'bg-gray-100 text-gray-700',
  retour_produit: 'bg-red-100 text-red-700',
  partenariat: 'bg-indigo-100 text-indigo-700',
  interne: 'bg-cyan-100 text-cyan-700',
}

export const STATUT_LABELS: Record<EmailStatut, string> = {
  nouveau: 'Nouveau',
  lu: 'Lu',
  en_cours: 'En cours',
  en_attente: 'En attente',
  resolu: 'Résolu',
  archive: 'Archivé',
}

export const STATUT_COLORS: Record<EmailStatut, string> = {
  nouveau: 'bg-blue-100 text-blue-700',
  lu: 'bg-gray-100 text-gray-700',
  en_cours: 'bg-yellow-100 text-yellow-700',
  en_attente: 'bg-orange-100 text-orange-700',
  resolu: 'bg-green-100 text-green-700',
  archive: 'bg-slate-100 text-slate-700',
}

export const TEAM_MEMBERS = ['Romain', 'Adrien', 'Alex', 'Maxime']

export function getPrioritieColor(score: number): string {
  if (score >= 80) return 'bg-red-100 text-red-700'
  if (score >= 60) return 'bg-orange-100 text-orange-700'
  if (score >= 40) return 'bg-yellow-100 text-yellow-700'
  return 'bg-green-100 text-green-700'
}

// ============================================================
// Mock data — 15 emails
// ============================================================

export const mockEmails: Email[] = [
  // B2C Support (5 emails)
  {
    id: 'email-1',
    gmail_id: 'msg-001',
    thread_id: 'thread-001',
    from_email: 'marie.dupont@example.com',
    from_name: 'Marie Dupont',
    to_email: 'support@teambuddy.fr',
    subject: 'Problème avec le jouet Buddy Mini — ne s\'allume plus',
    body_text:
      "Bonjour,\n\nJ'ai acheté un Buddy Mini il y a 3 mois et depuis hier, il ne s'allume plus. J'ai essayé de recharger pendant 30 minutes mais rien n'y fait. Pouvez-vous m'aider?\n\nCordialement,\nMarie",
    received_at: '2026-04-07T10:15:00Z',
    created_at: '2026-04-07T10:15:00Z',
    ai_sentiment: 'negatif',
    ai_urgence: 'haute',
    ai_categorie: 'support_b2c',
    ai_resume: 'Jouet Buddy Mini défaillant — ne s\'allume plus après 3 mois d\'utilisation',
    ai_mots_cles: ['défaut', 'batterie', 'ne_sallume_pas', 'retour_possible'],
    ai_priorite: 75,
    ai_reponse_suggeree:
      'Répondre avec procédure de réinitialisation + offrir retour/SAV sous garantie',
    ai_routage: 'support',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },
  {
    id: 'email-2',
    gmail_id: 'msg-002',
    thread_id: 'thread-002',
    from_email: 'jean.martin@example.com',
    from_name: 'Jean Martin',
    to_email: 'support@teambuddy.fr',
    subject: 'Merci pour l\'excellent service client!',
    body_text:
      "Bonjour l'équipe,\n\nJe tenais à vous remercier pour le service impeccable lors de mon achat. Le Buddy Big que j'ai reçu correspond parfaitement à mes attentes et votre équipe a été très réactive. Continuez comme ça!\n\nBonne journée,\nJean",
    received_at: '2026-04-06T14:22:00Z',
    created_at: '2026-04-06T14:22:00Z',
    ai_sentiment: 'positif',
    ai_urgence: 'basse',
    ai_categorie: 'support_b2c',
    ai_resume: 'Email de satisfaction client — compliments sur le service',
    ai_mots_cles: ['satisfaction', 'service_client', 'positif', 'retention'],
    ai_priorite: 15,
    ai_reponse_suggeree: 'Répondre avec message de remerciement personnalisé + proposition fidélité',
    ai_routage: 'general',
    statut: 'lu',
    ticket_id: null,
    assigne_a: 'Romain',
    repondu_at: '2026-04-07T09:00:00Z',
    repondu_par: 'Romain',
    attachments: [],
  },
  {
    id: 'email-3',
    gmail_id: 'msg-003',
    thread_id: 'thread-003',
    from_email: 'sophie.bernard@example.com',
    from_name: 'Sophie Bernard',
    to_email: 'support@teambuddy.fr',
    subject: 'Question sur la compatibilité avec iOS 15',
    body_text:
      "Bonjour,\n\nAvant d'acheter, j'aimerais savoir si l'application Buddy est compatible avec iOS 15. Mon enfant a un iPhone 8 et je veux m'assurer que ça fonctionnera.\n\nMerci,\nSophie",
    received_at: '2026-04-07T11:45:00Z',
    created_at: '2026-04-07T11:45:00Z',
    ai_sentiment: 'neutre',
    ai_urgence: 'normale',
    ai_categorie: 'support_b2c',
    ai_resume: 'Demande de clarification — compatibilité iOS 15 avant achat',
    ai_mots_cles: ['compatibilité', 'ios', 'avant_achat', 'question_technique'],
    ai_priorite: 45,
    ai_reponse_suggeree:
      'Clarifier les requirements système + fournir lien vers App Store avec infos',
    ai_routage: 'support',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },
  {
    id: 'email-4',
    gmail_id: 'msg-004',
    thread_id: 'thread-004',
    from_email: 'thomas.leroy@example.com',
    from_name: 'Thomas Leroy',
    to_email: 'support@teambuddy.fr',
    subject: 'URGENT: Accusation de fraude suite à ma commande',
    body_text:
      "Bonjour!\n\nJe viens de recevoir une alerte fraude de ma banque suite à ma commande de Buddy Mini sur votre site. Pouvez-vous m'aider immédiatement? Je suis très préoccupé.\n\nMerci,\nThomas",
    received_at: '2026-04-07T15:33:00Z',
    created_at: '2026-04-07T15:33:00Z',
    ai_sentiment: 'urgent',
    ai_urgence: 'critique',
    ai_categorie: 'support_b2c',
    ai_resume: 'Alerte fraude bancaire — transaction client bloquée',
    ai_mots_cles: ['fraude', 'banque', 'paiement', 'urgent', 'escalade'],
    ai_priorite: 95,
    ai_reponse_suggeree:
      'Escalader à Romain IMMÉDIATEMENT + proposer call téléphonique',
    ai_routage: 'support',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },
  {
    id: 'email-5',
    gmail_id: 'msg-005',
    thread_id: 'thread-005',
    from_email: 'isabelle.rousseau@example.com',
    from_name: 'Isabelle Rousseau',
    to_email: 'support@teambuddy.fr',
    subject: 'Retour produit après 2 semaines',
    body_text:
      "Bonjour,\n\nJ'aimerais retourner le Buddy Mini que j'ai acheté il y a 2 semaines. Mon fils n'en est pas content et je voudrais une autre couleur. Comment faire?\n\nMerci,\nIsabelle",
    received_at: '2026-04-05T09:10:00Z',
    created_at: '2026-04-05T09:10:00Z',
    ai_sentiment: 'neutre',
    ai_urgence: 'normale',
    ai_categorie: 'retour_produit',
    ai_resume: 'Demande de retour et remplacement — changement de couleur',
    ai_mots_cles: ['retour', 'remplacement', 'couleur', 'satisfait'],
    ai_priorite: 50,
    ai_reponse_suggeree: 'Envoyer lien process retour + étiquette préaffranchie',
    ai_routage: 'support',
    statut: 'en_cours',
    ticket_id: 'ticket-001',
    assigne_a: 'Adrien',
    repondu_at: '2026-04-06T10:30:00Z',
    repondu_par: 'Adrien',
    attachments: [],
  },

  // B2B Commercial (3 emails)
  {
    id: 'email-6',
    gmail_id: 'msg-006',
    thread_id: 'thread-006',
    from_email: 'marc.leblanc@toysrus.fr',
    from_name: 'Marc Leblanc',
    to_email: 'contact@teambuddy.fr',
    subject: 'Proposition partenariat Toy\'s R Us France — volume 2000 unités',
    body_text:
      "Bonjour,\n\nNous sommes intéressés par une collaboration pour ajouter Buddy à nos rayons. Nous cherchons une quantité initiale de 2000 unités sur 6 mois. Pouvez-vous me proposer les conditions commerciales et délais?\n\nCordialement,\nMarc Leblanc\nToy's R Us France",
    received_at: '2026-04-07T13:20:00Z',
    created_at: '2026-04-07T13:20:00Z',
    ai_sentiment: 'positif',
    ai_urgence: 'haute',
    ai_categorie: 'commercial_b2b',
    ai_resume: 'Opportunity B2B — demande partenariat Toy\'s R Us pour 2000 unités',
    ai_mots_cles: ['partenariat', 'volume', '2000_unites', 'conditions_commerciales', 'opportunite'],
    ai_priorite: 85,
    ai_reponse_suggeree:
      'Escalader à responsable commercial + préparer proposition + call de découverte',
    ai_routage: 'commercial',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: ['catalog_buddy.pdf'],
  },
  {
    id: 'email-7',
    gmail_id: 'msg-007',
    thread_id: 'thread-007',
    from_email: 'pierre.dubois@fnacdarty.com',
    from_name: 'Pierre Dubois',
    to_email: 'contact@teambuddy.fr',
    subject: 'RE: Buddy Big — Suivi commande CMD-2026-003',
    body_text:
      "Bonjour,\n\nJuste un message pour confirmer que nous avons bien reçu votre devis. Excellent! Nous validons l'ordre pour livraison fin avril. Merci pour la réactivité.\n\nPierre",
    received_at: '2026-04-07T08:45:00Z',
    created_at: '2026-04-07T08:45:00Z',
    ai_sentiment: 'positif',
    ai_urgence: 'basse',
    ai_categorie: 'commercial_b2b',
    ai_resume: 'Confirmation commande — Fnac Darty valide et approuve planning',
    ai_mots_cles: ['confirmation', 'commande', 'livraison', 'satisfait'],
    ai_priorite: 30,
    ai_reponse_suggeree:
      'Répondre avec confirmation planning + nommer account manager',
    ai_routage: 'commercial',
    statut: 'lu',
    ticket_id: null,
    assigne_a: 'Alex',
    repondu_at: '2026-04-07T14:00:00Z',
    repondu_par: 'Alex',
    attachments: [],
  },
  {
    id: 'email-8',
    gmail_id: 'msg-008',
    thread_id: 'thread-008',
    from_email: 'laura.chen@intersport.fr',
    from_name: 'Laura Chen',
    to_email: 'contact@teambuddy.fr',
    subject: 'Question sur les remises volume — appel prévu demain',
    body_text:
      "Bonjour,\n\nAvant notre call de demain à 14h, j'aimerais clarifier un point : pouvez-vous proposer une remise progressif si nous atteignons 5000 unités sur 12 mois?\n\nMerci,\nLaura",
    received_at: '2026-04-07T16:55:00Z',
    created_at: '2026-04-07T16:55:00Z',
    ai_sentiment: 'neutre',
    ai_urgence: 'haute',
    ai_categorie: 'commercial_b2b',
    ai_resume: 'Question pricing — demande clarification sur structure remises volume',
    ai_mots_cles: ['remise_volume', 'pricing', 'conditions', 'urgent'],
    ai_priorite: 70,
    ai_reponse_suggeree: 'Préparer scénarios de remise pour call demain + alert calendar',
    ai_routage: 'commercial',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },

  // Facturation (2 emails)
  {
    id: 'email-9',
    gmail_id: 'msg-009',
    thread_id: 'thread-009',
    from_email: 'comptable@kingjouet.fr',
    from_name: 'Service Comptable King Jouet',
    to_email: 'facturation@teambuddy.fr',
    subject: 'Demande facture FAC-2026-002 — paiement différé 30j',
    body_text:
      "Bonjour,\n\nPouvez-vous émettre la facture pour notre commande CMD-2026-002? Notre siège requiert une facture pour traiter le paiement.\n\nConditions : paiement différé 30 jours à réception facture.\n\nMerci,\nService Comptable",
    received_at: '2026-04-06T10:20:00Z',
    created_at: '2026-04-06T10:20:00Z',
    ai_sentiment: 'neutre',
    ai_urgence: 'normale',
    ai_categorie: 'facturation',
    ai_resume: 'Demande facture — CMD-2026-002, paiement 30j net',
    ai_mots_cles: ['facture', 'paiement', 'condition_payement', 'process'],
    ai_priorite: 55,
    ai_reponse_suggeree: 'Préparer facture + envoyer via email/système comptable',
    ai_routage: 'finance',
    statut: 'en_cours',
    ticket_id: 'ticket-002',
    assigne_a: 'Maxime',
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },
  {
    id: 'email-10',
    gmail_id: 'msg-010',
    thread_id: 'thread-010',
    from_email: 'finance@example.com',
    from_name: 'Client Finance - Status Check',
    to_email: 'facturation@teambuddy.fr',
    subject: 'Réclamation — facture FAC-2026-001 non reçue',
    body_text:
      "Bonjour,\n\nNous cherchons la facture FAC-2026-001 émise en janvier. Nous avons besoin de cette documentation pour notre audit. Pouvez-vous la renvoyer?\n\nMerci,\nFinance",
    received_at: '2026-04-04T15:10:00Z',
    created_at: '2026-04-04T15:10:00Z',
    ai_sentiment: 'negatif',
    ai_urgence: 'haute',
    ai_categorie: 'facturation',
    ai_resume: 'Réclamation facture manquante — impact audit client',
    ai_mots_cles: ['facture_manquante', 'audit', 'urgent', 'escalade'],
    ai_priorite: 80,
    ai_reponse_suggeree: 'URGENT: Vérifier archive + renvoyer facture + s\'excuser',
    ai_routage: 'finance',
    statut: 'en_attente',
    ticket_id: 'ticket-003',
    assigne_a: 'Maxime',
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },

  // Question générale (2 emails)
  {
    id: 'email-11',
    gmail_id: 'msg-011',
    thread_id: 'thread-011',
    from_email: 'journalist@news.fr',
    from_name: 'Journaliste - Le Monde',
    to_email: 'info@teambuddy.fr',
    subject: 'Demande interview — article jouets connectés 2026',
    body_text:
      "Bonjour,\n\nJe prépare un article sur les jouets connectés en 2026 pour Le Monde. Buddy semble une belle success story. Pourriez-vous organiser une brève interview avec un fondateur?\n\nCordialement,\nJournaliste",
    received_at: '2026-04-07T12:30:00Z',
    created_at: '2026-04-07T12:30:00Z',
    ai_sentiment: 'positif',
    ai_urgence: 'normale',
    ai_categorie: 'question_generale',
    ai_resume: 'Demande interview — article média Le Monde sur jouets connectés',
    ai_mots_cles: ['media', 'interview', 'pr', 'opportunite_marque'],
    ai_priorite: 65,
    ai_reponse_suggeree: 'Escalader à CEO/PR + évaluer intérêt média',
    ai_routage: 'general',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },
  {
    id: 'email-12',
    gmail_id: 'msg-012',
    thread_id: 'thread-012',
    from_email: 'startup@ventures.com',
    from_name: 'Startup Ventures Fund',
    to_email: 'info@teambuddy.fr',
    subject: 'Expression d\'intérêt — potentiel partenariat VC',
    body_text:
      "Bonjour l'équipe Buddy,\n\nNotre fonds suit votre croissance avec intérêt. Nous pourrions explorer ensemble une série d'investissement? Libres pour un call exploratoire?\n\nCordialement,\nStartup Ventures",
    received_at: '2026-04-06T11:00:00Z',
    created_at: '2026-04-06T11:00:00Z',
    ai_sentiment: 'positif',
    ai_urgence: 'normale',
    ai_categorie: 'partenariat',
    ai_resume: 'Opportunité investissement — VC intéressé par série',
    ai_mots_cles: ['investissement', 'vc', 'finance', 'opportunite', 'croissance'],
    ai_priorite: 72,
    ai_reponse_suggeree: 'Escalader à CEO immédiatement',
    ai_routage: 'general',
    statut: 'lu',
    ticket_id: null,
    assigne_a: 'Romain',
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },

  // Interne (1 email)
  {
    id: 'email-13',
    gmail_id: 'msg-013',
    thread_id: 'thread-013',
    from_email: 'adrien@teambuddy.fr',
    from_name: 'Adrien',
    to_email: 'team@teambuddy.fr',
    subject: '[INTERNE] Stock critique Buddy Mini — alert réappro',
    body_text:
      "Équipe,\n\nAlerte stock: nous avons seulement 150 unités Buddy Mini en stock à date. Nous en avons 500 en production mais délai 2 semaines. Besoin de coordination avec commercial pour éviter surcommande.\n\nAdrien",
    received_at: '2026-04-07T17:45:00Z',
    created_at: '2026-04-07T17:45:00Z',
    ai_sentiment: 'neutre',
    ai_urgence: 'critique',
    ai_categorie: 'interne',
    ai_resume: 'Alert stock critique — Buddy Mini à 150u, réappro en 2 semaines',
    ai_mots_cles: ['stock', 'supply_chain', 'urgence', 'coordination'],
    ai_priorite: 90,
    ai_reponse_suggeree:
      'Notifier commercial + supply chain + setup call coordination',
    ai_routage: 'tech',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },

  // Additional variety emails
  {
    id: 'email-14',
    gmail_id: 'msg-014',
    thread_id: 'thread-014',
    from_email: 'sylvain.moreau@company.fr',
    from_name: 'Sylvain Moreau',
    to_email: 'support@teambuddy.fr',
    subject: 'Batterie Buddy Big décharge très rapidement',
    body_text:
      "Bonjour,\n\nLe Buddy Big que j'ai acheté il y a 6 mois perd la batterie en 4-5 heures maintenant (avant c'était 12h). Que me conseillez-vous?\n\nMerci,\nSylvain",
    received_at: '2026-04-02T14:15:00Z',
    created_at: '2026-04-02T14:15:00Z',
    ai_sentiment: 'negatif',
    ai_urgence: 'haute',
    ai_categorie: 'support_b2c',
    ai_resume: 'Dégradation batterie Buddy Big — autonomie réduite',
    ai_mots_cles: ['batterie', 'autonomie', 'degradation', 'usure_normale'],
    ai_priorite: 62,
    ai_reponse_suggeree: 'Diagnostiquer + offrir batterie remplacement ou SAV',
    ai_routage: 'support',
    statut: 'en_attente',
    ticket_id: 'ticket-004',
    assigne_a: 'Adrien',
    repondu_at: '2026-04-03T10:00:00Z',
    repondu_par: 'Adrien',
    attachments: [],
  },
  {
    id: 'email-15',
    gmail_id: 'msg-015',
    thread_id: 'thread-015',
    from_email: 'olivier.schmidt@retailer.de',
    from_name: 'Olivier Schmidt',
    to_email: 'contact@teambuddy.fr',
    subject: 'Potential distributorship — Germany & Benelux',
    body_text:
      "Hello Buddy Team,\n\nWe are interested in becoming official distributors for Germany, Belgium, Netherlands. Can we discuss partnership structure and pricing?\n\nBest regards,\nOlivier",
    received_at: '2026-04-07T18:20:00Z',
    created_at: '2026-04-07T18:20:00Z',
    ai_sentiment: 'positif',
    ai_urgence: 'haute',
    ai_categorie: 'commercial_b2b',
    ai_resume: 'Opportunity distributor — Allemagne + Benelux',
    ai_mots_cles: ['distributeur', 'expansion', 'international', 'opportunite'],
    ai_priorite: 78,
    ai_reponse_suggeree:
      'Escalader à commercial + préparer info distributeur',
    ai_routage: 'commercial',
    statut: 'nouveau',
    ticket_id: null,
    assigne_a: null,
    repondu_at: null,
    repondu_par: null,
    attachments: [],
  },
]

export const mockTickets: Ticket[] = [
  {
    id: 'ticket-001',
    email_ids: ['email-5'],
    subject: 'Retour produit Isabelle Rousseau — changement couleur',
    contact_email: 'isabelle.rousseau@example.com',
    contact_name: 'Isabelle Rousseau',
    statut: 'en_cours',
    priorite: 50,
    categorie: 'retour_produit',
    assigne_a: 'Adrien',
    ai_resume: 'Demande retour Buddy Mini pour remplacement couleur',
    created_at: '2026-04-05T09:10:00Z',
    updated_at: '2026-04-06T10:30:00Z',
    resolved_at: null,
  },
  {
    id: 'ticket-002',
    email_ids: ['email-9'],
    subject: 'Demande facture FAC-2026-002 King Jouet',
    contact_email: 'comptable@kingjouet.fr',
    contact_name: 'Service Comptable King Jouet',
    statut: 'en_cours',
    priorite: 55,
    categorie: 'facturation',
    assigne_a: 'Maxime',
    ai_resume: 'Émettre facture pour commande CMD-2026-002, paiement 30j net',
    created_at: '2026-04-06T10:20:00Z',
    updated_at: '2026-04-06T10:20:00Z',
    resolved_at: null,
  },
  {
    id: 'ticket-003',
    email_ids: ['email-10'],
    subject: 'Facture FAC-2026-001 non reçue — impact audit',
    contact_email: 'finance@example.com',
    contact_name: 'Client Finance',
    statut: 'en_attente_client',
    priorite: 80,
    categorie: 'facturation',
    assigne_a: 'Maxime',
    ai_resume: 'Rechercher et renvoyer facture manquante pour audit client',
    created_at: '2026-04-04T15:10:00Z',
    updated_at: '2026-04-04T15:10:00Z',
    resolved_at: null,
  },
  {
    id: 'ticket-004',
    email_ids: ['email-14'],
    subject: 'Buddy Big batterie dégradée — Sylvain Moreau',
    contact_email: 'sylvain.moreau@company.fr',
    contact_name: 'Sylvain Moreau',
    statut: 'en_attente_client',
    priorite: 62,
    categorie: 'support_b2c',
    assigne_a: 'Adrien',
    ai_resume: 'Diagnostic batterie dégradée, proposer remplacement ou SAV',
    created_at: '2026-04-02T14:15:00Z',
    updated_at: '2026-04-03T10:00:00Z',
    resolved_at: null,
  },
]

// ============================================================
// Helper utilities
// ============================================================

export function getEmailById(id: string): Email | undefined {
  return mockEmails.find((e) => e.id === id)
}

export function getEmailsByStatut(statut: EmailStatut): Email[] {
  return mockEmails.filter((e) => e.statut === statut)
}

export function getInboxStats() {
  const stats = {
    total: mockEmails.length,
    nouveau: mockEmails.filter((e) => e.statut === 'nouveau').length,
    en_cours: mockEmails.filter((e) => e.statut === 'en_cours').length,
    resolu: mockEmails.filter((e) => e.statut === 'resolu').length,
    archive: mockEmails.filter((e) => e.statut === 'archive').length,
    critique: mockEmails.filter((e) => e.ai_urgence === 'critique').length,
    haute: mockEmails.filter((e) => e.ai_urgence === 'haute').length,
  }
  return stats
}

export interface DashboardChartData {
  date: string
  nouveau: number
  resolu: number
  moyen_priorite: number
}

export function getMockDashboardData(): DashboardChartData[] {
  // Generate 30-day chart data
  const data: DashboardChartData[] = []
  const baseDate = new Date('2026-03-09')

  for (let i = 0; i < 30; i++) {
    const date = new Date(baseDate)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    data.push({
      date: dateStr,
      nouveau: Math.floor(Math.random() * 8) + 2,
      resolu: Math.floor(Math.random() * 6) + 1,
      moyen_priorite: Math.floor(Math.random() * 40) + 45,
    })
  }

  return data
}
