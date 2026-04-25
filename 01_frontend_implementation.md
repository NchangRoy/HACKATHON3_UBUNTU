# Rapport d'implémentation — Frontend
## Plateforme de fact-checking collaboratif — Sujet 11

---

## 1. Vue d'ensemble

Le frontend est divisé en **deux interfaces distinctes** qui servent des audiences différentes avec des besoins radicalement opposés :

- **Interface Modérateur** — outil de travail journalistique, dense en information, orienté décision
- **Interface Publique** — transparente, accessible, orientée compréhension du désaccord

Les deux partagent le même design system mais aucun composant métier.

---

## 2. Stack technique

| Élément | Choix | Justification |
|---|---|---|
| Framework | **Next.js 14** (App Router) | SSR pour la page publique (SEO + vitesse), SPA pour le dashboard modérateur |
| UI | **Tailwind CSS + shadcn/ui** | Composants accessibles, personnalisables, dark mode natif |
| State management | **Zustand** | Léger, adapté aux stores de claim/verdict |
| Fetching | **TanStack Query (React Query)** | Cache, revalidation, gestion des états de chargement |
| Temps réel | **Socket.IO client** | Mises à jour live quand un nouveau signal arrive |
| Graphes | **Recharts + D3.js** | Graphe de propagation Twitter (D3) + charts ML (Recharts) |
| Formulaires | **React Hook Form + Zod** | Validation côté client des soumissions |
| Authentification | **NextAuth.js** | Gestion des rôles (citoyen, modérateur, admin) |

---

## 3. Architecture des pages

```
app/
├── (public)/
│   ├── page.tsx                    # Accueil — liste des rumeurs actives
│   ├── rumeur/[id]/page.tsx        # Fiche publique d'un claim
│   └── audit/[id]/page.tsx        # Rapport d'audit public
│
├── (moderateur)/
│   ├── dashboard/page.tsx          # File de travail modérateur
│   ├── claim/[id]/page.tsx         # Fiche de travail sur un claim
│   ├── verdict/new/page.tsx        # Saisie d'un nouveau verdict
│   └── sources/[claimId]/page.tsx  # Gestionnaire de preuves
│
└── api/
    └── [...nextauth]/route.ts      # Auth
```

---

## 4. Interface Publique

### 4.1 Page d'accueil — Liste des rumeurs

Affiche les claims en cours classés par **score ML** (les plus suspects en haut) et par **activité récente**.

```tsx
// Composant ClaimCard — carte publique d'un claim
interface ClaimCardProps {
  claim: {
    id: string
    texte: string
    statut: 'CONTESTE' | 'PROB_VRAI' | 'PROB_FAUX' | 'CONFIRME' | 'REFUTE'
    confiance: number          // 0.0 → 1.0
    score_ml: number           // score du modèle IA
    sources_pour: number
    sources_contre: number
    updated_at: string
  }
}

// Badge de statut — jamais binaire, toujours nuancé
const StatutBadge = ({ statut, confiance }) => {
  const config = {
    CONTESTE:  { label: 'Contesté',        color: 'yellow' },
    PROB_VRAI: { label: 'Probablement vrai', color: 'green' },
    PROB_FAUX: { label: 'Probablement faux', color: 'red'   },
    CONFIRME:  { label: 'Confirmé',          color: 'green' },
    REFUTE:    { label: 'Réfuté',            color: 'red'   },
  }
  // Affiche toujours le niveau de confiance à côté du statut
  return <Badge>{config[statut].label} — {Math.round(confiance * 100)}%</Badge>
}
```

**Règle d'affichage critique** : le mot "VRAI" ou "FAUX" seul n'apparaît **jamais**. Toujours accompagné du niveau de confiance et du nombre de sources pour/contre.

### 4.2 Fiche publique d'un claim

Structure de la page :

```
┌──────────────────────────────────────────┐
│  [Statut badge]  Texte du claim          │
│  Dernière mise à jour : il y a 3 min     │
├──────────────────────────────────────────┤
│  3 sources affirment X                   │
│  2 sources affirment Y                   │
│  → Règle active : "sans source sanitaire │
│    officielle → CONTESTÉ"                │
├──────────────────────────────────────────┤
│  Timeline des verdicts (ordre chrono)    │
│  V1 → V2 → V3 (actuel)                  │
├──────────────────────────────────────────┤
│  [Voir le rapport d'audit complet]       │
└──────────────────────────────────────────┘
```

### 4.3 Composant Timeline des verdicts

```tsx
// Affiche l'historique complet — rien n'est effacé
const VerdictTimeline = ({ verdicts }: { verdicts: Verdict[] }) => {
  return (
    <div className="relative border-l border-gray-200 pl-6">
      {verdicts.map((v, i) => (
        <div key={v.id} className="mb-6 relative">
          {/* Point sur la timeline */}
          <div className="absolute -left-8 w-4 h-4 rounded-full bg-white border-2 border-blue-500" />
          
          <time className="text-xs text-gray-500">{formatDateTime(v.cree_a)}</time>
          
          <div className={`mt-1 p-3 rounded-lg border ${i === 0 ? 'border-blue-200 bg-blue-50' : 'border-gray-100'}`}>
            <StatutBadge statut={v.statut} confiance={v.confiance} />
            <p className="mt-1 text-sm text-gray-600">{v.note_publique}</p>
            <p className="mt-1 text-xs text-gray-400">
              Règle appliquée : {v.regle_version}
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## 5. Interface Modérateur

### 5.1 Dashboard — File de travail

Le dashboard est le centre de contrôle du modérateur. Il agrège :

- **File prioritaire** : claims avec score ML < 0.3 (probablement faux, traiter en urgence)
- **En attente d'assignation** : nouveaux claims sans modérateur
- **Mes claims** : claims assignés à moi avec leur avancement
- **Alertes ML** : patterns suspects détectés (spike de retweets, comptes récents)

```tsx
// Store Zustand pour la file de travail
const useModeratorStore = create<ModeratorState>((set) => ({
  claims: [],
  filter: 'all',
  sortBy: 'ml_score_asc',  // les plus suspects d'abord

  fetchClaims: async () => {
    const data = await api.getClaims()
    set({ claims: data })
  },

  setFilter: (filter) => set({ filter }),
}))
```

### 5.2 Fiche de travail modérateur

C'est l'interface la plus complexe. Elle affiche en parallèle :

```
┌─────────────────────┬──────────────────────┐
│  CLAIM              │  SCORE ML             │
│  Texte atomique     │  0.28 — SUSPECT       │
│                     │  Vitesse : anormale   │
│                     │  Comptes < 7j : 60%   │
├─────────────────────┼──────────────────────┤
│  SOURCES            │  GRAPHE DE            │
│  [Ajouter preuve]   │  PROPAGATION          │
│                     │  (D3 tree)            │
│  ✓ Vidéo Mama C.   │                       │
│    Stance: SUPPORTE │                       │
│    Conf.: 0.85      │                       │
│                     │                       │
│  ✗ Tweet CDE        │                       │
│    Stance: CONTREDIT│                       │
│    Conf.: 0.4*      │                       │
│    *conflit intérêt │                       │
├─────────────────────┴──────────────────────┤
│  RENDRE UN VERDICT                          │
│  [Sélectionner règle ▼]                    │
│  → Prévisualisation du statut résultant     │
│  [Confirmer et publier]                     │
└─────────────────────────────────────────────┘
```

### 5.3 Composant de saisie de verdict

```tsx
const VerdictForm = ({ claimId }: { claimId: string }) => {
  const { register, watch, handleSubmit } = useForm<VerdictInput>()
  const regleSelectionnee = watch('regle_id')
  
  // Prévisualisation en temps réel du statut résultant
  const preview = useVerdictPreview(claimId, regleSelectionnee)

  const onSubmit = async (data: VerdictInput) => {
    // Ne fait jamais un UPDATE — crée toujours un nouveau verdict
    await api.createVerdict({
      claim_id: claimId,
      ...data,
      moderateur_id: session.user.id,
      cree_a: new Date().toISOString(),
      // Le backend lie automatiquement au verdict précédent
    })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Sélecteur de règle — le modérateur DOIT choisir explicitement */}
      <RegleSelector claimId={claimId} {...register('regle_id')} />
      
      {/* Prévisualisation — empêche les décisions non tracées */}
      {preview && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
          <p className="text-sm font-medium">Résultat si cette règle est appliquée :</p>
          <StatutBadge statut={preview.statut} confiance={preview.confiance} />
          <p className="text-xs text-gray-500 mt-1">
            Sources pour : {preview.sources_pour} | Contre : {preview.sources_contre}
          </p>
        </div>
      )}

      <textarea {...register('note_publique')} placeholder="Note explicative publique..." />
      <button type="submit">Confirmer et publier</button>
    </form>
  )
}
```

### 5.4 Visualisation du graphe Twitter (D3.js)

```tsx
const PropagationGraph = ({ claimId }: { claimId: string }) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const { data } = useQuery(['propagation', claimId], () => api.getPropagation(claimId))

  useEffect(() => {
    if (!data || !svgRef.current) return

    const svg = d3.select(svgRef.current)
    
    // Arbre de retweets : profondeur = vitesse de propagation
    const tree = d3.tree().size([400, 300])
    const root = d3.hierarchy(data.treeData)
    tree(root)

    // Couleur des noeuds selon l'âge du compte
    const nodeColor = (d) => {
      const ageDays = d.data.account_age_days
      if (ageDays < 7)   return '#ef4444'  // rouge — compte très récent, suspect
      if (ageDays < 30)  return '#f59e0b'  // amber — compte jeune
      return '#22c55e'                      // vert — compte établi
    }

    // Rendu de l'arbre
    svg.selectAll('circle')
      .data(root.descendants())
      .join('circle')
      .attr('cx', d => d.x)
      .attr('cy', d => d.y)
      .attr('r', 5)
      .attr('fill', nodeColor)
      .attr('title', d => `@${d.data.username} — ${d.data.account_age_days}j`)

  }, [data])

  return (
    <div>
      <div className="flex gap-4 text-xs mb-2">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"/>Compte &lt;7j</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-amber-400 inline-block"/>Compte &lt;30j</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"/>Compte établi</span>
      </div>
      <svg ref={svgRef} width="100%" height="300" />
    </div>
  )
}
```

---

## 6. Temps réel avec Socket.IO

```tsx
// Hook de souscription aux mises à jour live
const useClaimUpdates = (claimId: string) => {
  const queryClient = useQueryClient()

  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_WS_URL)

    // Écoute les nouveaux signaux sur ce claim
    socket.on(`claim:${claimId}:new_evidence`, () => {
      queryClient.invalidateQueries(['claim', claimId])
    })

    // Écoute les nouveaux verdicts
    socket.on(`claim:${claimId}:new_verdict`, () => {
      queryClient.invalidateQueries(['claim', claimId])
      queryClient.invalidateQueries(['verdicts', claimId])
    })

    // Alerte ML : rescore automatique
    socket.on(`claim:${claimId}:ml_rescore`, (data) => {
      queryClient.setQueryData(['ml_score', claimId], data.new_score)
    })

    return () => socket.disconnect()
  }, [claimId])
}
```

---

## 7. Rapport d'audit — composant clé de la démo

```tsx
// Génère le rapport d'audit complet — format imprimable
const AuditReport = ({ claimId }: { claimId: string }) => {
  const { data: report } = useQuery(
    ['audit', claimId],
    () => api.getAuditReport(claimId)
  )

  return (
    <div className="font-mono text-sm p-6 bg-gray-50 rounded-lg border">
      <h2 className="font-bold text-base mb-4">
        RAPPORT D'AUDIT — Claim #{claimId}
      </h2>

      {report?.timeline.map((entry) => (
        <div key={entry.id} className="mb-4 border-l-2 border-gray-300 pl-4">
          <p className="text-gray-500">{formatDateTime(entry.timestamp)}</p>
          <p className="font-medium">{entry.action}</p>
          <p className="text-gray-600">Acteur : {entry.acteur} ({entry.role})</p>
          {entry.regle && (
            <p className="text-gray-600">Règle : {entry.regle}</p>
          )}
          {entry.sources && (
            <p className="text-gray-600">
              Sources : {entry.sources.pour} pour / {entry.sources.contre} contre
            </p>
          )}
          {entry.hash && (
            <p className="text-xs text-gray-400">Hash : {entry.hash}</p>
          )}
        </div>
      ))}

      <div className="mt-6 pt-4 border-t">
        <button onClick={() => window.print()} className="text-blue-600 underline">
          Exporter en PDF
        </button>
      </div>
    </div>
  )
}
```

---

## 8. Gestion des rôles

| Rôle | Accès | Droits |
|---|---|---|
| `CITIZEN` | Interface publique seulement | Soumettre un signal, voir les verdicts |
| `JOURNALIST` | Interface publique + soumission enrichie | Ajouter des preuves avec sources |
| `MODERATOR` | Dashboard + fiche modérateur | Rendre des verdicts, assigner des claims |
| `ADMIN` | Tout + gestion des règles | Créer/archiver des règles de décision |

```tsx
// Middleware Next.js — protection des routes modérateur
export function middleware(request: NextRequest) {
  const token = getToken({ req: request })
  
  if (request.nextUrl.pathname.startsWith('/moderateur')) {
    if (!token || !['MODERATOR', 'ADMIN'].includes(token.role)) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
}
```

---

## 9. Structure des composants partagés

```
components/
├── ui/                          # shadcn/ui de base
│   ├── Badge.tsx
│   ├── Button.tsx
│   └── Card.tsx
│
├── claim/
│   ├── ClaimCard.tsx            # Carte publique
│   ├── StatutBadge.tsx          # Badge statut nuancé (jamais binaire)
│   └── VerdictTimeline.tsx      # Timeline des verdicts
│
├── evidence/
│   ├── EvidenceList.tsx         # Liste des preuves avec stance
│   ├── EvidenceUploader.tsx     # Upload avec métadonnées + 6 timestamps
│   └── SourceCredibility.tsx    # Indicateur de crédibilité de la source
│
├── ml/
│   ├── MLScoreBadge.tsx         # Score ML [0-1] avec couleur
│   ├── PropagationGraph.tsx     # Arbre D3 des retweets
│   └── MLAlertBanner.tsx        # Alerte pattern suspect
│
└── audit/
    └── AuditReport.tsx          # Rapport d'audit complet
```

---

## 10. Points critiques à ne pas rater

1. **Aucun verdict binaire "VRAI/FAUX"** — toujours accompagné du niveau de confiance
2. **Le modérateur doit choisir une règle explicitement** avant de publier — pas de décision sans trace
3. **La timeline des verdicts ne supprime jamais** — l'ancien verdict reste visible avec un lien de succession
4. **Le score ML est un indicateur**, pas une conclusion — affiché clairement comme "aide à la décision"
5. **Le rapport d'audit est la feature démo** — un bouton, un clic, une sortie complète et imprimable

---

*Document généré pour le Hackathon — Sujet 11 Social/Civic Tech*
