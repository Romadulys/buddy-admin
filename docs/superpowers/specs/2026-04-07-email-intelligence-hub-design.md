# Email Intelligence Hub — Design Spec

**Date:** 2026-04-07
**Auteur:** Romain + Claude
**Statut:** Approuve
**Repo:** buddy-admin (buddy-admin-xi.vercel.app)

---

## 1. Objectif

Transformer la section Support de l'admin Buddy en un hub de communication intelligent : reception des mails @teambuddy, analyse IA automatique (sentiment, urgence, categorie, mots-cles, priorite), suggestion de reponse, et routage automatique B2C/B2B.

### Probleme actuel

- Aucune integration email dans l'admin
- Les tickets sont en mock data (pas persistes en BDD)
- Le chatbot IA est scaffolde mais pas connecte
- Pas de visibilite sur le volume/sentiment des demandes
- Les mails B2B et B2C ne sont pas distingues

### Solution

Gmail API (lecture) + analyse IA (Claude Haiku/Sonnet) + inbox enrichie + ticketing reel + dashboard analytics. Tout fonctionne d'abord en mock, avec possibilite de brancher Gmail en read-only des la phase 1.

---

## 2. Architecture

```
COUCHE 1 — Ingestion
Gmail API poll toutes les 2 min (ou mock data)
Recupere les nouveaux mails @teambuddy
Stocke dans Supabase (table emails)
Routage par adresse : support@ → B2C, contact@ → B2B, info@ → triage IA

COUCHE 2 — Analyse IA (Haiku)
Pour chaque mail :
→ Sentiment (positif / neutre / negatif / en_colere)
→ Urgence (faible / normale / haute / critique)
→ Categorie (support_technique / commercial / facturation / partenariat / retour_produit / question_generale / interne)
→ Resume en 1 ligne
→ Mots-cles (tableau)
→ Score de priorite (0-100)
→ Routage (b2c / b2b / interne)

COUCHE 3 — Reponse IA (Sonnet)
Genere un brouillon de reponse base sur :
→ La FAQ existante (25+ questions)
→ L'historique des echanges avec ce contact
→ Le ton adapte au sentiment detecte
→ Statut : "Suggestion" (humain valide avant envoi)

COUCHE 4 — Interface Admin
→ Inbox enrichie (mails + analyse IA)
→ Tickets auto-crees par mail
→ Reponse en 1 clic (valider le draft IA)
→ Dashboard analytics (volume, sentiment, temps)
```

---

## 3. Structure de donnees

### Table `emails`

```typescript
interface Email {
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

  ai_sentiment: 'positif' | 'neutre' | 'negatif' | 'en_colere' | null
  ai_urgence: 'faible' | 'normale' | 'haute' | 'critique' | null
  ai_categorie: 'support_technique' | 'commercial' | 'facturation' | 'partenariat' | 'retour_produit' | 'question_generale' | 'interne' | null
  ai_resume: string | null
  ai_mots_cles: string[] | null
  ai_priorite: number | null
  ai_reponse_suggeree: string | null
  ai_routage: 'b2c' | 'b2b' | 'interne' | null

  statut: 'nouveau' | 'en_cours' | 'repondu' | 'archive'
  ticket_id: string | null
  assigne_a: string | null
  repondu_at: string | null
  repondu_par: string | null
}
```

### Table `tickets` (remplace le mock actuel)

```typescript
interface Ticket {
  id: string
  email_ids: string[]

  subject: string
  contact_email: string
  contact_name: string

  statut: 'ouvert' | 'en_cours' | 'en_attente' | 'resolu' | 'ferme'
  priorite: 'faible' | 'normale' | 'haute' | 'critique'
  categorie: string

  assigne_a: string | null
  ai_resume: string | null

  created_at: string
  updated_at: string
  resolved_at: string | null
}
```

### Logique de creation des tickets

- Nouveau mail d'un expediteur inconnu → nouveau ticket
- Nouveau mail dans un thread existant → rattache au ticket existant
- Reponse de l'equipe → statut passe a "en_attente"

### Routage par adresse email

| Adresse | Destination | Categorie par defaut |
|---------|-------------|---------------------|
| support@teambuddy.fr | Support > Inbox (B2C) | support_technique |
| contact@teambuddy.fr | B2B > Pipeline (auto-prospect) | commercial |
| info@teambuddy.fr | Triage IA (B2C ou B2B) | question_generale |

Un mail B2B sur contact@ cree automatiquement un prospect dans le Pipeline si l'expediteur est inconnu, ou le rattache au prospect existant.

---

## 4. Ingestion Gmail

### API route `/api/emails/sync`

1. Se connecte a Gmail via Service Account Google
2. Recupere les mails non lus depuis le dernier sync
3. Extrait : sujet, corps texte/HTML, expediteur, destinataire, pieces jointes
4. Verifie anti-doublon (gmail_id unique dans Supabase)
5. Stocke dans table `emails` avec statut "nouveau"
6. Declenche l'analyse IA

### Modes de fonctionnement

| Variable env | Comportement |
|-------------|-------------|
| `GMAIL_MODE=mock` | Retourne les mails mock (defaut) |
| `GMAIL_MODE=live` | Appelle la vraie API Gmail (lecture seule) |

### Polling

- Phase dev : setInterval cote client (comme le chat existant)
- Phase prod : cron Vercel toutes les 2 minutes

### Mails internes

Les mails @teambuddy → @teambuddy sont tagges "interne" et ne sont pas analyses par l'IA.

---

## 5. Analyse IA

### Sortie attendue par mail

```json
{
  "sentiment": "negatif",
  "urgence": "haute",
  "categorie": "support_technique",
  "resume": "Parent signale que le GPS ne se met plus a jour depuis 3 jours",
  "mots_cles": ["GPS", "mise a jour", "bug", "3 jours"],
  "priorite": 82,
  "routage": "b2c",
  "reponse_suggeree": "Bonjour Marie, merci de nous avoir contactes..."
}
```

### Score de priorite (0-100)

Combine :
- Sentiment en_colere = +30, negatif = +15
- Mots d'urgence dans le texte = +20
- Client recurrent = +10
- Sujet sensible (SOS, securite enfant) = +20
- Base = 5

### Modeles utilises

| Tache | Modele | Cout estime |
|-------|--------|-------------|
| Analyse (sentiment, urgence, categorie, resume, mots-cles, priorite) | Haiku | ~$0.003/mail |
| Generation de reponse suggeree | Sonnet | ~$0.008/mail |

### Contexte fourni a l'IA

- Le mail complet (sujet + corps)
- La FAQ Buddy (pour matcher des reponses existantes)
- L'historique des echanges avec cet expediteur
- Les infos du prospect/client B2B si le mail match un contact connu

### Modes

| Variable env | Comportement |
|-------------|-------------|
| `AI_MODE=mock` | Retourne des analyses pre-calculees (defaut) |
| `AI_MODE=live` | Appelle Claude API (Haiku + Sonnet) |

---

## 6. Interface Admin

### Refonte de la page Support

```
Support (4 onglets)
├── Inbox          ← NOUVEAU
├── Tickets        ← REFONTE (BDD au lieu de mock)
├── Messagerie     ← existant (inchange)
└── SOS            ← existant (inchange)
```

### Onglet Inbox

**KPI cards :**
- Nouveaux aujourd'hui
- En attente de reponse (rouge si > 5)
- Temps de reponse moyen
- Sentiment moyen (emoji + tendance)

**Liste des mails :**
Chaque ligne affiche :
- Score de priorite (pastille couleur)
- Expediteur (nom + email)
- Resume IA (1 ligne)
- Categorie (badge)
- Mots-cles (tags)
- Sentiment (emoji)
- Assigne a (initiales)
- Temps ecoule depuis reception

**Filtres :** statut, sentiment, categorie, urgence, assigne, adresse destinataire
**Tri par defaut :** score de priorite decroissant

### Panneau lateral (clic sur un mail)

Slide-over a droite avec :
- Analyse IA complete (sentiment, urgence, categorie, priorite, resume, mots-cles)
- Mail original (de, a, date, corps)
- Reponse suggeree par l'IA (texte editable)
- Actions : Envoyer la reponse, Modifier, Creer un ticket, Archiver, Assigner
- Bouton "Creer un prospect B2B" si routage = b2b

### Onglet Tickets (refonte)

Meme UI que l'actuel mais connecte a la table `tickets` Supabase au lieu de MOCK_TICKETS.
Chaque ticket est lie a un ou plusieurs mails.

---

## 7. Dashboard Analytics

Toggle "Dashboard" en haut de la page Support.

**KPIs temps reel :**
- Volume aujourd'hui / cette semaine / ce mois
- Temps de reponse moyen
- Taux de resolution
- Score satisfaction moyen

**Graphiques (Recharts) :**
- Courbe volume de mails par jour (30 derniers jours)
- Camembert repartition par categorie
- Barres sentiment
- Top 5 mots-cles recurrents

**En mode mock :** donnees simulees sur 30 jours.

---

## 8. Implementation technique

### Stack

Meme stack que le reste de l'admin :
- Next.js 16 App Router
- React 19
- TailwindCSS v4
- Recharts (deja installe)
- Supabase

### Fichiers a creer

```
app/support/EmailInbox.tsx         — liste mails enrichie
app/support/EmailPanel.tsx         — panneau detail + reponse
app/support/EmailDashboard.tsx     — analytics
app/support/TicketsClient.tsx      — refonte tickets BDD

app/api/emails/sync/route.ts      — poll Gmail ou mock
app/api/emails/analyze/route.ts   — analyse IA ou mock
app/api/emails/reply/route.ts     — envoyer reponse
app/api/emails/[id]/route.ts      — GET/PATCH un mail

components/EmailCard.tsx           — ligne dans l'inbox
components/SentimentBadge.tsx      — emoji + couleur sentiment

lib/email-mock.ts                  — mails mock + analyses mock + stats mock
lib/email-ai.ts                    — appel Claude API ou mock
lib/gmail.ts                       — client Gmail API (mock ou live)
```

### Fichiers a modifier

```
app/support/page.tsx               — ajouter onglet Inbox
app/support/SupportClient.tsx      — refonte tickets
```

### Phases de deploiement

| Phase | Gmail | IA | Fonctionnel |
|-------|-------|----|-------------|
| 1a — Mock complet | mock | mock | Interface complete avec fausses donnees |
| 1b — Gmail read-only | live | mock | Vrais mails, analyse simulee |
| 2 — Gmail + Claude | live | live | Vrais mails, vraie analyse IA |
| 3 — Reponse auto | live | live | Envoi de reponses via Gmail API |

Switch par variables d'environnement :
- `GMAIL_MODE=mock|live`
- `AI_MODE=mock|live`

### Pas de nouvelles dependances en Phase 1

Tout faisable avec le projet actuel. Les dependances arrivent en phase 2+ :
- Phase 1b : `googleapis` (Gmail API)
- Phase 2 : `@anthropic-ai/sdk` (Claude API)

---

## 9. Hors scope (pour plus tard)

- Reponse IA full automatique (sans validation humaine)
- Webhooks temps reel (Google Pub/Sub)
- Multi-langue (detection + reponse dans la langue du mail)
- Pieces jointes (telechargement et stockage)
- Templates de reponse personnalisables
- SLA tracking (temps de reponse garanti)
- Integration Slack (notification quand mail critique)

---

## 10. Criteres de succes

- [ ] L'onglet Inbox affiche les mails avec l'analyse IA
- [ ] Chaque mail a un score de priorite, sentiment, urgence, categorie
- [ ] Le panneau lateral montre le detail complet + reponse suggeree
- [ ] Les filtres fonctionnent (statut, sentiment, categorie, urgence)
- [ ] Le tri par priorite met les urgents en haut
- [ ] Les mails B2B sont identifies et proposent la creation de prospect
- [ ] Les tickets sont persistes en BDD Supabase
- [ ] Le dashboard analytics affiche les metriques et graphiques
- [ ] Le switch mock/live fonctionne via env vars
- [ ] Le style est coherent avec le reste de l'admin
