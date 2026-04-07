# Pipeline Prospection B2B — Design Spec

**Date:** 2026-04-07
**Auteur:** Romain + Claude
**Statut:** Approuvé
**Repo:** buddy-admin (buddy-admin-xi.vercel.app)

---

## 1. Objectif

Ajouter un module **Pipeline de Prospection B2B** dans l'admin Buddy existant, sous forme de **board Kanban drag & drop**. Le but est de centraliser le suivi des prospects (distributeurs, ecoles, e-commerce, collectivites) depuis l'identification jusqu'a la conversion en client.

### Probleme actuel

- La section "Clients B2B" ne gere que les clients **deja actifs**
- Aucun suivi des prospects avant qu'ils deviennent clients
- Les contacts B2B sont disperses (tetes, mails, WhatsApp)
- Pas de visibilite sur le pipeline commercial

### Solution

Un board Kanban integre dans la section B2B avec 5 colonnes + conversion automatique vers Clients B2B.

---

## 2. Structure de donnees

### Prospect

```typescript
interface Prospect {
  id: string;

  // Entreprise
  entreprise: string;
  type: 'distributeur' | 'ecole' | 'e-commerce' | 'collectivite' | 'autre';
  type_structure: 'centrale' | 'magasin' | 'groupement' | 'independant';
  enseigne_parente: string | null;     // si magasin -> lien vers centrale
  ville: string;
  region: string;
  nb_points_de_vente: number | null;   // si centrale/groupement

  // Contact principal
  contact_nom: string;
  contact_email: string;
  contact_telephone: string;

  // Pipeline
  statut: 'identifie' | 'contacte' | 'demo_rdv' | 'proposition' | 'gagne' | 'perdu';
  source: 'salon' | 'linkedin' | 'cold_email' | 'recommandation' | 'site_web' | 'autre';
  montant_estime: number;              // en euros
  prochaine_action: string;            // texte libre
  date_relance: string;                // ISO date
  raison_perte: string | null;         // rempli si statut = perdu

  // Suivi
  assigne_a: string;                   // membre de l'equipe
  notes: ProspectNote[];

  created_at: string;
  updated_at: string;
}

interface ProspectNote {
  id: string;
  auteur: string;
  contenu: string;
  date: string;
}
```

---

## 3. Interface — Board Kanban

### Position dans la sidebar

```
B2B & DISTRIBUTION
├── Pipeline          <- NOUVEAU
├── Clients B2B       <- existant
├── Commandes
├── Livraisons
├── Stock & Arrivages
└── Simulateur
```

### KPI Cards (en haut)

4 cartes de stats (composant `StatsCard` existant) :

| Card | Valeur | Description |
|------|--------|-------------|
| Total prospects | Nombre | Tous les prospects actifs (hors gagnes/perdus) |
| Valeur pipeline | Euro | Somme des montants estimes |
| Taux de conversion | % | Gagnes / (Gagnes + Perdus) |
| Relances aujourd'hui | Nombre | Prospects avec date_relance = aujourd'hui |

### Colonnes du board

| Colonne | Statut | Couleur |
|---------|--------|---------|
| Identifie | `identifie` | Gris |
| Contacte | `contacte` | Bleu |
| Demo/RDV | `demo_rdv` | Orange |
| Proposition | `proposition` | Violet |
| Gagne | `gagne` | Vert |

La colonne **"Perdu"** est cachee par defaut, accessible via un toggle.

### Carte prospect (dans le board)

Chaque carte affiche :
- **Nom entreprise** (gras)
- **Badge type_structure** (centrale / magasin / groupement / independant)
- **Ville** (visible si magasin/independant) ou **X magasins** (si centrale/groupement)
- **Montant estime**
- **Date de relance** (en rouge si depassee)
- **Pastille assigne** (initiales du membre)

### Interactions

- **Drag & drop** entre colonnes pour changer le statut
- **Clic sur carte** -> ouvre le panneau lateral
- **Bouton "+ Nouveau prospect"** en haut a droite
- **Filtres** : par type, source, assigne, enseigne parente, type_structure

---

## 4. Interface — Panneau lateral (detail prospect)

Un slide-over a droite qui s'ouvre au clic sur une carte.

### Sections du panneau

**Header :**
- Nom entreprise (titre)
- Select pour changer le statut

**Infos entreprise :**
- Type (distributeur, ecole...)
- Type structure (centrale, magasin...)
- Enseigne parente (si magasin)
- Ville, Region
- Nb points de vente (si applicable)
- Source du lead
- Montant estime

**Contact :**
- Nom, Email, Telephone
- Liens cliquables (mailto, tel)

**Suivi :**
- Assigne a (select avec membres equipe)
- Prochaine action (texte)
- Date de relance (date picker)

**Notes (fil d'activite) :**
- Bouton "+ Ajouter une note"
- Chaque note : date, auteur, contenu
- Ordre antichronologique (plus recent en haut)

**Actions :**
- Bouton "Marquer Gagne" -> declenche conversion
- Bouton "Marquer Perdu" -> demande raison de perte
- Bouton "Supprimer"

Tous les champs sont editables inline.

---

## 5. Flux de conversion — Gagne -> Client B2B

### Etape 1 — Modal de confirmation

Quand un prospect passe en "Gagne" (drag & drop ou bouton) :

```
Modal :
- Titre : "Convertir en client B2B ?"
- Message : "[Entreprise] va etre ajoute dans Clients B2B"
- Option : "Creer une premiere commande ?" (Oui / Non)
- Boutons : Annuler | Convertir
```

### Etape 2 — Creation dans Clients B2B

Le prospect est transforme en `B2BClient` :
- `company_name` = entreprise
- `contact_name` = contact_nom
- `contact_email` = contact_email
- `contact_phone` = contact_telephone
- `city` = ville
- `notes` = "Converti depuis Pipeline le [date]. Source: [source]."
- `siret` = "" (a remplir)

### Etape 3 — Nettoyage

- La carte disparait du Kanban
- Si "Oui, creer commande" -> redirection vers `/b2b/orders/new` pre-rempli avec le client

### Prospects perdus

- Champ `raison_perte` obligatoire : prix | timing | concurrent | pas_interesse | autre
- La carte reste dans la colonne "Perdu" (cachee par defaut)
- Possibilite de reactiver (remettre en "Identifie")

---

## 6. Implementation technique

### Stack

Meme stack que le reste de l'admin :
- **Next.js 16** App Router
- **React 19** avec `'use client'` pour les composants interactifs
- **TailwindCSS v4** pour le style
- **Pas de dependance ajoutee**

### Fichiers a creer

```
app/b2b/pipeline/
└── page.tsx                 # Page principale (KPIs + Board)

components/
├── PipelineBoard.tsx        # Board Kanban (colonnes + drag & drop)
├── ProspectCard.tsx         # Carte prospect dans le board
└── ProspectPanel.tsx        # Panneau lateral (detail + edition)

lib/
└── pipeline-mock.ts         # Donnees mock prospects + types TypeScript
```

### Fichiers a modifier

```
components/Sidebar.tsx       # Ajouter lien "Pipeline" dans section B2B
lib/b2b-mock.ts              # Ajouter fonction de conversion prospect -> client
```

### Drag & drop

Implementation HTML5 native :
- `onDragStart` sur `ProspectCard`
- `onDragOver` + `onDrop` sur chaque colonne
- Pas de librairie externe (pas de react-dnd, pas de dnd-kit)

### Donnees

**Phase 1 (maintenant)** : Mock data dans `lib/pipeline-mock.ts`
- Coherent avec le pattern existant (`b2b-mock.ts`, `stock-mock.ts`)
- Donnees d'exemple avec des prospects realistes

**Phase 2 (plus tard)** : Migration vers Supabase
- Table `prospects` dans PostgreSQL
- RLS policies pour acces equipe
- Meme migration que pour le reste du B2B

### Composants reutilises

| Composant | Usage |
|-----------|-------|
| `StatsCard` | 4 KPI cards en haut du board |
| `Sidebar` | Navigation (modification) |
| Pattern TailwindCSS | Memes couleurs, espacements, typographies |

---

## 7. Hors scope (pour plus tard)

- Integration email (envoi de mails depuis le pipeline)
- Scoring automatique des leads
- Rappels/notifications de relance
- Import CSV de prospects
- Dashboard analytics du pipeline (graphes de conversion)
- Connexion Supabase (Phase 2)

---

## 8. Criteres de succes

- [ ] La page Pipeline est accessible depuis la sidebar
- [ ] Le board Kanban affiche les 5 colonnes avec des prospects
- [ ] Le drag & drop fonctionne pour deplacer les prospects
- [ ] Le panneau lateral s'ouvre au clic et permet l'edition
- [ ] La conversion "Gagne" cree un client dans Clients B2B
- [ ] Les KPI cards affichent les bonnes valeurs
- [ ] Les filtres fonctionnent (type, source, assigne)
- [ ] Le style est coherent avec le reste de l'admin
