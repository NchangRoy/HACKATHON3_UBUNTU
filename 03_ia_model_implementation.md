# Rapport d'implémentation — Modèle IA
## Plateforme de fact-checking collaboratif — Sujet 11

---

## 1. Rôle du modèle dans l'architecture

Le modèle IA est un **assistant à la décision éditoriale**, pas un décideur autonome. Il produit trois outputs qui guident le modérateur humain sans le remplacer :

1. **Score de crédibilité** — probabilité qu'un claim soit vrai [0.0 → 1.0]
2. **Détection de doublons** — claims similaires déjà traités
3. **Flags de pattern suspect** — comportements anormaux dans la propagation Twitter

Le verdict reste toujours une décision humaine. Le score ML est affiché comme "indicateur d'alerte", avec sa version de modèle et son niveau de confiance.

---

## 2. Stack technique

| Élément | Choix | Justification |
|---|---|---|
| Runtime | **Python 3.11** | Écosystème ML dominant |
| Framework API | **FastAPI** | Async natif, docs auto, typage Pydantic |
| NLP | **sentence-transformers** (`paraphrase-multilingual-MiniLM-L12-v2`) | Multilingue, léger, bon pour similarité sémantique |
| Graphes | **PyTorch Geometric (PyG)** | GNN sur le graphe de propagation Twitter |
| Classifieur | **XGBoost** | Robuste, interprétable, rapide à entraîner |
| Données | **FakeNewsNet (PolitiFact subset) + données synthétiques** | Fourni par l'organisateur |
| Stockage modèle | **MLflow** | Versioning des modèles, tracking des métriques |
| Entraînement | **scikit-learn + PyTorch** | Pipeline sklearn pour features tabulaires, PyTorch pour GNN |

---

## 3. Architecture du pipeline ML

```
┌─────────────────────────────────────────────────────────┐
│                     INPUT                               │
│  claim_id → récupérer claim + evidences + tweets        │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼──────────────┐
         │             │              │
         ▼             ▼              ▼
┌──────────────┐ ┌───────────┐ ┌──────────────────┐
│  Branche     │ │  Branche  │ │  Branche         │
│  TEXTE       │ │  GRAPHE   │ │  UTILISATEUR     │
│              │ │  Twitter  │ │                  │
│ BERT embed.  │ │ GNN       │ │ Features profils │
│ du titre     │ │ propagat. │ │ des propagateurs │
└──────┬───────┘ └─────┬─────┘ └───────┬──────────┘
       │               │               │
       └───────────────┼───────────────┘
                       │
                       ▼
             ┌──────────────────┐
             │  Feature vector  │
             │  concatenation   │
             │  (64 + 32 + 16)  │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │  XGBoost final   │
             │  classifier      │
             └────────┬─────────┘
                      │
                      ▼
             ┌──────────────────┐
             │  OUTPUT          │
             │  score: 0.0-1.0  │
             │  features dict   │
             │  model_version   │
             └──────────────────┘
```

---

## 4. Features détaillées

### 4.1 Features textuelles (branche TEXTE)

```python
# src/features/text_features.py

from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
# Multilingue : gère français, anglais, et langues africaines partiellement

def extract_text_features(claim_text: str, article_title: str = None) -> np.ndarray:
    """
    Retourne un vecteur de 64 dimensions représentant le claim.
    """
    # Embedding du texte du claim
    claim_embedding = model.encode(claim_text)  # 384 dim

    features = []

    # Feature 1 : Présence de mots sensationnalistes
    SENSATIONAL_WORDS = [
        'urgent', 'choc', 'scandale', 'exclusif', 'confirmé', 'alerte',
        'breaking', 'officiel', 'secret', 'révélation', 'danger'
    ]
    sensational_score = sum(
        1 for w in SENSATIONAL_WORDS if w in claim_text.lower()
    ) / len(SENSATIONAL_WORDS)
    features.append(sensational_score)

    # Feature 2 : Longueur du texte (les fake news sont souvent très courtes ou très longues)
    features.append(min(len(claim_text) / 500, 1.0))

    # Feature 3 : Présence de chiffres (les fake news inventent souvent des chiffres précis)
    import re
    nb_numbers = len(re.findall(r'\d+', claim_text))
    features.append(min(nb_numbers / 10, 1.0))

    # Feature 4 : Cohérence titre/article (si on a les deux)
    if article_title:
        title_embedding = model.encode(article_title)
        from sklearn.metrics.pairwise import cosine_similarity
        coherence = cosine_similarity(
            claim_embedding.reshape(1, -1),
            title_embedding.reshape(1, -1)
        )[0][0]
        features.append(float(coherence))
    else:
        features.append(0.5)  # valeur neutre si pas d'article

    # Réduire les embeddings à 60 dim par PCA (entraîné à l'avance)
    reduced_embedding = pca_text.transform(claim_embedding.reshape(1, -1))[0]  # 60 dim

    return np.concatenate([reduced_embedding, features])  # 64 dim total
```

### 4.2 Features de propagation Twitter — La vraie valeur ajoutée

```python
# src/features/propagation_features.py

import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict

def extract_propagation_features(tweets: List[Dict], retweets: List[Dict]) -> np.ndarray:
    """
    Extrait 32 features décrivant le pattern de propagation sur Twitter.
    C'est ici que se trouve la vraie signal de détection.
    """
    if not tweets:
        return np.zeros(32)

    features = {}

    # ── VITESSE DE PROPAGATION ──────────────────────────────────────
    # Les fake news se propagent souvent très vite dans la première heure

    timestamps = sorted([t['created_at'] for t in tweets])
    t0 = datetime.fromisoformat(timestamps[0])
    t1h = t0 + timedelta(hours=1)
    t24h = t0 + timedelta(hours=24)

    tweets_in_1h  = sum(1 for ts in timestamps if datetime.fromisoformat(ts) <= t1h)
    tweets_in_24h = sum(1 for ts in timestamps if datetime.fromisoformat(ts) <= t24h)

    features['ratio_1h_24h'] = tweets_in_1h / max(tweets_in_24h, 1)
    features['tweets_per_hour_peak'] = tweets_in_1h
    features['total_tweets'] = len(tweets)

    # ── PROFONDEUR DE L'ARBRE DE RETWEETS ────────────────────────────
    # Fake news → propagation large et peu profonde (beaucoup de retweets directs)
    # Vraie news → propagation plus organique avec débat (chaînes plus longues)

    if retweets:
        # Calculer la profondeur max de la chaîne de retweets
        depths = calculate_retweet_depths(retweets)
        features['max_depth'] = max(depths) if depths else 0
        features['avg_depth'] = np.mean(depths) if depths else 0
        features['depth_variance'] = np.var(depths) if depths else 0
    else:
        features['max_depth'] = 0
        features['avg_depth'] = 0
        features['depth_variance'] = 0

    # ── DIVERSITÉ DES UTILISATEURS ───────────────────────────────────
    user_ids = [t['user']['id'] for t in tweets]
    features['unique_users'] = len(set(user_ids))
    features['unique_ratio'] = len(set(user_ids)) / max(len(user_ids), 1)

    return np.array(list(features.values()))[:32]


def extract_user_features(user_profiles: List[Dict]) -> np.ndarray:
    """
    Extrait 16 features décrivant les utilisateurs qui propagent le claim.
    Les comptes récents et les bots sont de forts signaux de fake news.
    """
    if not user_profiles:
        return np.zeros(16)

    features = {}
    now = datetime.now()

    # Âge des comptes
    ages_days = []
    for u in user_profiles:
        if u.get('created_at'):
            created = datetime.fromisoformat(u['created_at'])
            ages_days.append((now - created).days)

    if ages_days:
        features['pct_accounts_under_7days']  = sum(1 for a in ages_days if a < 7)   / len(ages_days)
        features['pct_accounts_under_30days'] = sum(1 for a in ages_days if a < 30)  / len(ages_days)
        features['pct_accounts_under_365days']= sum(1 for a in ages_days if a < 365) / len(ages_days)
        features['mean_account_age_days']     = np.mean(ages_days)
    else:
        features['pct_accounts_under_7days']   = 0
        features['pct_accounts_under_30days']  = 0
        features['pct_accounts_under_365days'] = 0
        features['mean_account_age_days']      = 0

    # Ratio followers/following (les bots ont souvent un ratio anormal)
    ratios = []
    for u in user_profiles:
        followers = u.get('followers_count', 0)
        following = u.get('friends_count', 1)
        ratios.append(followers / max(following, 1))

    if ratios:
        features['mean_ff_ratio']   = np.mean(ratios)
        features['median_ff_ratio'] = np.median(ratios)
        # Un ratio très bas (beaucoup de following, peu de followers) = potentiel bot
        features['pct_low_ff_ratio'] = sum(1 for r in ratios if r < 0.1) / len(ratios)
    else:
        features['mean_ff_ratio']    = 1.0
        features['median_ff_ratio']  = 1.0
        features['pct_low_ff_ratio'] = 0

    # Comptes vérifiés
    verified = [u.get('verified', False) for u in user_profiles]
    features['pct_verified'] = sum(verified) / max(len(verified), 1)

    return np.array(list(features.values()))[:16]
```

### 4.3 Graph Neural Network sur l'arbre de propagation

```python
# src/models/propagation_gnn.py

import torch
import torch.nn.functional as F
from torch_geometric.nn import GCNConv, global_mean_pool
from torch_geometric.data import Data

class PropagationGNN(torch.nn.Module):
    """
    GNN qui encode l'arbre de retweets.

    L'intuition : la forme du graphe de propagation encode l'authenticité.
    - Fake news : graphe large et plat (vague de retweets directs)
    - Vraie news : graphe plus profond et diversifié (discussion organique)
    """
    def __init__(self, node_feature_dim: int = 8, hidden_dim: int = 32, output_dim: int = 32):
        super().__init__()
        self.conv1 = GCNConv(node_feature_dim, hidden_dim)
        self.conv2 = GCNConv(hidden_dim, hidden_dim)
        self.linear = torch.nn.Linear(hidden_dim, output_dim)

    def forward(self, data: Data) -> torch.Tensor:
        x, edge_index, batch = data.x, data.edge_index, data.batch

        # Deux couches de convolution graph
        x = F.relu(self.conv1(x, edge_index))
        x = F.dropout(x, p=0.3, training=self.training)
        x = F.relu(self.conv2(x, edge_index))

        # Pooling global : résume tout le graphe en un vecteur
        x = global_mean_pool(x, batch)

        return self.linear(x)  # 32 dim


def build_graph_from_tweets(tweets: List[Dict], retweets: List[Dict]) -> Data:
    """
    Construit un graphe PyG à partir des tweets et retweets.
    Chaque noeud = un tweet. Chaque arête = une relation de retweet.
    """
    nodes = {}
    edges_src, edges_dst = [], []

    # Features par noeud (8 dimensions)
    node_features = []

    for tweet in tweets:
        node_id = tweet['id']
        nodes[node_id] = len(nodes)

        user = tweet.get('user', {})
        now = datetime.now()
        account_age = 0
        if user.get('created_at'):
            account_age = (now - datetime.fromisoformat(user['created_at'])).days

        # 8 features par noeud
        node_features.append([
            min(account_age / 365, 1.0),                                    # âge normalisé
            min(user.get('followers_count', 0) / 10000, 1.0),               # followers normalisé
            min(user.get('friends_count', 0) / 10000, 1.0),                 # following normalisé
            1.0 if user.get('verified', False) else 0.0,                    # vérifié
            min(user.get('statuses_count', 0) / 10000, 1.0),               # activité
            1.0 if tweet.get('retweeted_status') else 0.0,                 # est un retweet
            min(tweet.get('retweet_count', 0) / 1000, 1.0),                # nb retweets
            min(tweet.get('favorite_count', 0) / 1000, 1.0),               # nb likes
        ])

    # Construire les arêtes de retweet
    for rt_group in retweets:
        original_id = rt_group.get('original_tweet_id')
        if original_id not in nodes:
            continue
        for rt in rt_group.get('retweets', []):
            rt_id = rt.get('id')
            if rt_id not in nodes:
                nodes[rt_id] = len(nodes)
                node_features.append([0.5] * 8)  # features neutres

            edges_src.append(nodes[original_id])
            edges_dst.append(nodes[rt_id])

    x = torch.tensor(node_features, dtype=torch.float)
    edge_index = torch.tensor([edges_src, edges_dst], dtype=torch.long)

    return Data(x=x, edge_index=edge_index)
```

---

## 5. Classifieur final — Assemblage des features

```python
# src/models/classifier.py

import numpy as np
import xgboost as xgb
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

class FakeNewsClassifier:
    """
    Classifieur final qui combine les 3 branches de features.
    Utilise XGBoost pour sa robustesse et son interprétabilité.
    """

    def __init__(self):
        self.pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('xgb', xgb.XGBClassifier(
                n_estimators=200,
                max_depth=6,
                learning_rate=0.05,
                subsample=0.8,
                colsample_bytree=0.8,
                use_label_encoder=False,
                eval_metric='logloss',
                random_state=42
            ))
        ])
        self.gnn_model = PropagationGNN()

    def extract_all_features(self, claim_data: dict) -> np.ndarray:
        # Branche 1 : texte (64 dim)
        text_feats = extract_text_features(
            claim_data['texte'],
            claim_data.get('article_title')
        )

        # Branche 2 : graphe de propagation GNN (32 dim)
        if claim_data.get('tweets'):
            graph = build_graph_from_tweets(
                claim_data['tweets'],
                claim_data.get('retweets', [])
            )
            with torch.no_grad():
                gnn_feats = self.gnn_model(graph).numpy().flatten()
        else:
            gnn_feats = np.zeros(32)

        # Branche 3 : features utilisateurs (16 dim)
        user_feats = extract_user_features(claim_data.get('user_profiles', []))

        # Branche 4 : features de propagation tabulaires (32 dim)
        prop_feats = extract_propagation_features(
            claim_data.get('tweets', []),
            claim_data.get('retweets', [])
        )

        # Concaténation : 64 + 32 + 16 + 32 = 144 features
        return np.concatenate([text_feats, gnn_feats, user_feats, prop_feats])

    def predict_score(self, claim_data: dict) -> dict:
        features = self.extract_all_features(claim_data)
        features_2d = features.reshape(1, -1)

        # Probabilité que le claim soit VRAI
        score = float(self.pipeline.predict_proba(features_2d)[0][1])

        # Features importances pour l'interprétabilité
        feature_importance = self.get_feature_importance(features)

        return {
            'score': round(score, 3),
            'interpretation': self.interpret_score(score),
            'top_features': feature_importance,
            'model_version': MODEL_VERSION,
        }

    def interpret_score(self, score: float) -> str:
        if score < 0.2:   return 'TRES_SUSPECT'
        if score < 0.35:  return 'SUSPECT'
        if score < 0.55:  return 'INCERTAIN'
        if score < 0.75:  return 'PROBABLEMENT_VRAI'
        return 'TRES_PROBABLEMENT_VRAI'

    def get_feature_importance(self, features: np.ndarray) -> list:
        """Retourne les 5 features les plus influentes pour ce claim."""
        importances = self.pipeline['xgb'].feature_importances_
        top_indices = np.argsort(importances)[-5:][::-1]

        feature_names = FEATURE_NAMES  # liste des 144 noms de features
        return [
            {'feature': feature_names[i], 'importance': float(importances[i])}
            for i in top_indices
        ]
```

---

## 6. Détection de doublons (similarité sémantique)

```python
# src/services/dedup.service.py

from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')

SIMILARITY_THRESHOLD = 0.85  # au-delà de 0.85 → doublon probable

async def find_similar_claims(new_claim_text: str, existing_claims: list) -> list:
    """
    Détecte si un nouveau claim est similaire à un claim déjà traité.
    Empêche le modérateur de traiter deux fois la même rumeur.
    """
    if not existing_claims:
        return []

    # Encoder le nouveau claim
    new_embedding = model.encode(new_claim_text)

    # Encoder tous les claims existants (en batch pour la performance)
    existing_texts = [c['texte'] for c in existing_claims]
    existing_embeddings = model.encode(existing_texts, batch_size=32)

    # Calculer la similarité cosine
    similarities = cosine_similarity(
        new_embedding.reshape(1, -1),
        existing_embeddings
    )[0]

    # Retourner les claims similaires avec leur score
    similar = []
    for i, sim in enumerate(similarities):
        if sim >= SIMILARITY_THRESHOLD:
            similar.append({
                'claim_id':   existing_claims[i]['id'],
                'texte':      existing_claims[i]['texte'],
                'similarite': round(float(sim), 3),
                'statut':     existing_claims[i]['statut'],
            })

    return sorted(similar, key=lambda x: x['similarite'], reverse=True)
```

---

## 7. Détection de patterns suspects

```python
# src/services/anomaly.service.py

def detect_suspicious_patterns(tweets: list, user_profiles: list) -> dict:
    """
    Détecte des patterns anormaux qui suggèrent une manipulation.
    Ne bloque rien — génère des flags visibles pour le modérateur.
    """
    flags = []

    # Flag 1 : Spike de propagation anormal
    # (>50 tweets en 5 min = suspicion de bot coordonné)
    if tweets:
        timestamps = sorted([t['created_at'] for t in tweets])
        for i in range(len(timestamps) - 1):
            t1 = datetime.fromisoformat(timestamps[i])
            t2 = datetime.fromisoformat(timestamps[i+1])
            window_tweets = sum(
                1 for ts in timestamps
                if t1 <= datetime.fromisoformat(ts) <= t1 + timedelta(minutes=5)
            )
            if window_tweets > 50:
                flags.append({
                    'type': 'SPIKE_PROPAGATION',
                    'severity': 'HIGH',
                    'detail': f'{window_tweets} tweets en 5 minutes à {t1.isoformat()}',
                })
                break

    # Flag 2 : Majorité de comptes récents
    if user_profiles:
        now = datetime.now()
        ages = [(now - datetime.fromisoformat(u['created_at'])).days
                for u in user_profiles if u.get('created_at')]
        if ages:
            pct_young = sum(1 for a in ages if a < 30) / len(ages)
            if pct_young > 0.6:
                flags.append({
                    'type': 'COMPTES_RECENTS',
                    'severity': 'MEDIUM',
                    'detail': f'{round(pct_young*100)}% des comptes créés il y a moins de 30 jours',
                })

    # Flag 3 : Ratio followers/following anormal (bots typiques)
    suspicious_accounts = 0
    for u in user_profiles:
        followers = u.get('followers_count', 0)
        following = u.get('friends_count', 1)
        if following > 0 and (followers / following) < 0.05:
            suspicious_accounts += 1

    if user_profiles and suspicious_accounts / len(user_profiles) > 0.4:
        flags.append({
            'type': 'RATIO_FF_ANORMAL',
            'severity': 'MEDIUM',
            'detail': f'{suspicious_accounts} comptes avec ratio followers/following < 5%',
        })

    return {
        'is_suspicious': len(flags) > 0,
        'flags': flags,
        'risk_level': 'HIGH' if any(f['severity'] == 'HIGH' for f in flags) else
                      'MEDIUM' if flags else 'LOW',
    }
```

---

## 8. API FastAPI — Service ML

```python
# src/main.py

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI(title="FactCheck ML Service", version="1.0.0")

class ScoreRequest(BaseModel):
    claim_id: str
    claim_text: str
    article_title: str | None = None
    tweet_ids: list[str] = []

class ScoreResponse(BaseModel):
    claim_id: str
    score: float
    interpretation: str
    top_features: list[dict]
    similar_claims: list[dict]
    suspicious_patterns: dict
    model_version: str
    computed_at: str

@app.post("/score", response_model=ScoreResponse)
async def score_claim(request: ScoreRequest):
    """
    Endpoint principal — scoré à chaque nouveau signal ou verdict humain.
    Le backend Node.js appelle cet endpoint via BullMQ.
    """
    try:
        # 1. Récupérer les données Twitter
        claim_data = await fetch_claim_data(request.claim_id, request.tweet_ids)

        # 2. Score de crédibilité
        score_result = classifier.predict_score(claim_data)

        # 3. Détection de doublons
        existing_claims = await db.get_all_claims_texts()
        similar = await find_similar_claims(request.claim_text, existing_claims)

        # 4. Détection de patterns suspects
        patterns = detect_suspicious_patterns(
            claim_data.get('tweets', []),
            claim_data.get('user_profiles', [])
        )

        return ScoreResponse(
            claim_id=request.claim_id,
            score=score_result['score'],
            interpretation=score_result['interpretation'],
            top_features=score_result['top_features'],
            similar_claims=similar,
            suspicious_patterns=patterns,
            model_version=MODEL_VERSION,
            computed_at=datetime.now().isoformat(),
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/health")
async def health():
    return {"status": "ok", "model_version": MODEL_VERSION}
```

---

## 9. Entraînement du modèle

```python
# src/training/train.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
import mlflow

def train():
    """
    Entraîne le modèle sur FakeNewsNet (politifact) + données synthétiques africaines.
    """
    mlflow.start_run(run_name=f"fakecheckai-v{MODEL_VERSION}")

    # ── Charger les données ─────────────────────────────────────────
    fake = pd.read_csv('data/politifact_fake.csv')
    real = pd.read_csv('data/politifact_real.csv')
    synthetic = pd.read_csv('data/synthetic_african.csv')  # fourni par l'organisateur

    fake['label'] = 0
    real['label'] = 1
    synthetic_fake = synthetic[synthetic['label'] == 0]
    synthetic_real = synthetic[synthetic['label'] == 1]

    df = pd.concat([fake, real, synthetic_fake, synthetic_real], ignore_index=True)
    print(f"Dataset total : {len(df)} samples ({df['label'].sum()} vrais, {(1-df['label']).sum()} faux)")

    # ── Extraire les features ────────────────────────────────────────
    X, y = [], []
    for _, row in df.iterrows():
        claim_data = {
            'texte':         row['title'],
            'tweets':        load_tweets(row['id']),         # depuis les fichiers JSON
            'retweets':      load_retweets(row['id']),
            'user_profiles': load_user_profiles(row['id']),
        }
        features = classifier.extract_all_features(claim_data)
        X.append(features)
        y.append(row['label'])

    X = np.array(X)
    y = np.array(y)

    # ── Split train/test ─────────────────────────────────────────────
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # ── Entraînement ────────────────────────────────────────────────
    classifier.pipeline.fit(X_train, y_train)

    # ── Évaluation ──────────────────────────────────────────────────
    y_pred = classifier.pipeline.predict(X_test)
    y_proba = classifier.pipeline.predict_proba(X_test)[:, 1]

    report = classification_report(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)

    print(report)
    print(f"AUC-ROC : {auc:.4f}")

    # ── Logger dans MLflow ───────────────────────────────────────────
    mlflow.log_metric("auc_roc", auc)
    mlflow.log_text(report, "classification_report.txt")
    mlflow.sklearn.log_model(classifier.pipeline, "model")

    mlflow.end_run()

if __name__ == "__main__":
    train()
```

---

## 10. Feedback loop — Comment les verdicts humains améliorent le modèle

```
Verdict humain rendu
       │
       ▼
Backend Node.js → audit_log INSERT (action = VERDICT_EMIS)
       │
       ▼
BullMQ job : { claim_id, verdict, label_humain }
       │
       ▼
ML Service → stocke dans training_feedback.csv
       │
       ▼
[Toutes les 24h, ou à chaque N verdicts]
Ré-entraînement du modèle sur le dataset enrichi
       │
       ▼
Nouveau model_version déployé (MLflow)
       │
       ▼
Tous les claims EN_ATTENTE sont re-scorés avec le nouveau modèle
```

```python
# src/training/feedback_collector.py

async def collect_human_verdict(claim_id: str, verdict: dict):
    """
    Chaque verdict humain devient un exemple d'entraînement futur.
    Label : 1 si CONFIRME/PROB_VRAI, 0 si REFUTE/PROB_FAUX
    """
    label = 1 if verdict['statut'] in ['CONFIRME', 'PROB_VRAI'] else \
            0 if verdict['statut'] in ['REFUTE', 'PROB_FAUX'] else \
            None  # CONTESTE → pas utilisé pour l'entraînement

    if label is not None:
        await db.insert_feedback({
            'claim_id':   claim_id,
            'label':      label,
            'verdict_id': verdict['id'],
            'created_at': datetime.now().isoformat(),
        })
```

---

## 11. Variables d'environnement

```bash
# Service ML
ML_SERVICE_PORT=8000
MODEL_VERSION=v1.0.0
MODEL_PATH=./models/fakecheckai_v1.pkl

# Données
DATA_DIR=./data
FAKENEWSNET_PATH=./data/politifact_fake.csv
SYNTHETIC_DATA_PATH=./data/synthetic_african.csv

# MLflow
MLFLOW_TRACKING_URI=http://localhost:5000

# Backend Node.js (pour callbacks)
BACKEND_URL=http://localhost:3001
```

---

## 12. Points critiques à ne pas rater

1. **Les features Twitter sont prioritaires sur le texte** — un claim court et vague avec une propagation anormalement rapide par des comptes récents est très probablement faux, même si le texte semble neutre. L'indice "Twitter" de l'organisateur confirme que c'est là que se trouve le signal.

2. **Le score ML n'est pas affiché seul** — toujours accompagné de son `interpretation` (SUSPECT, INCERTAIN, etc.), de sa `model_version`, et des `top_features` qui l'ont influencé. Le modérateur doit comprendre *pourquoi* le modèle dit ce qu'il dit.

3. **Le modèle est re-scoré à chaque nouveau signal** — un claim qui arrive sans tweets peut avoir un score neutre (0.5). Dès que les premiers retweets arrivent, le score est recalculé automatiquement via BullMQ.

4. **Les données synthétiques africaines** permettent d'adapter le modèle au contexte local : patterns WhatsApp, langues mélangées (français/langues locales), références culturelles que FakeNewsNet ne contient pas.

5. **La feedback loop est la feature long terme** — après le hackathon, chaque verdict humain améliore le modèle. C'est ce qui rend la solution progressive et adaptative.

---

*Document généré pour le Hackathon — Sujet 11 Social/Civic Tech*
