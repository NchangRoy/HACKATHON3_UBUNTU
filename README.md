# Plateforme Collaborative de Fact-Checking

## 📖 Présentation Générale
Cette plateforme est une solution de fact-checking collaborative, transparente et auditable conçue spécifiquement pour les contextes de crise (accidents, crises politiques, urgences sanitaires). 

Contrairement aux plateformes classiques de fact-checking qui se limitent souvent à un verdict binaire (vrai/faux), notre système documente le désaccord, justifie chaque décision éditoriale, et maintient un **état défendable** public, même lorsque les faits et les définitions évoluent.

## 🎯 Contexte et Phrase Fondatrice (Hackathon Sujet 11)
Dans des situations d’urgence, des informations partielles et contradictoires se propagent rapidement. 

> *“Nous construisons un système qui permet à des acteurs en désaccord de produire ensemble un état public sur une rumeur, de façon à ce que chaque décision prise reste traçable, justifiable et compréhensible par quelqu’un qui n’était pas présent, même si les définitions et les faits ont évolué entre-temps.”*

## ✨ Fonctionnalités Clés
- **Atomisation des Signaux :** Découpage des rumeurs et signaux complexes en affirmations testables atomiques (`Claims`).
- **Collecte de Preuves Horodatée :** Rattachement de preuves (`Evidence`) aux affirmations avec 6 horodatages distincts et une pondération selon la fiabilité de la source.
- **Workflow Éditorial Transparent :** Processus allant de la soumission de signaux à la délibération, incluant la publication de verdicts structurés et non binaires.
- **Gestion de la Surcharge (TWIST 01) :** Triage intelligent et mode "dégradé" (verdicts préliminaires) pour garantir la continuité du service en cas d'afflux massif de signaux.
- **Génération de Rapports d'Audit :** Capacité à générer des rapports prouvant la diligence raisonnable de la plateforme à tout instant.
- **IA sous Contrôle Humain :** Des agents IA peuvent assister l'atomisation, le triage, et la délibération, mais leurs actions sont strictement tracées (comme un humain) et nécessitent une validation finale.

## 🛠 Principes Techniques Architecturaux
- **Immutabilité Absolue :** Aucune suppression ni modification destructive (`UPDATE` / `DELETE`) sur les données critiques. Toute évolution passe par des insertions (`INSERT`) liées aux versions précédentes.
- **Versionnement Systématique :** Toutes les règles de décision et de triage appliquées sont versionnées pour garantir que l'on sait *pourquoi* et *comment* une décision a été prise à l'instant T.
- **Séparation des Responsabilités :** Modèle de données strict articulé autour des entités `Users`, `Claim`, `Evidence`, `Verdict` et `Rule`.

## 💻 Stack Technique Envisagée
- **Backend :** Node.js (Express) ou Python (FastAPI)
- **Base de données :** PostgreSQL (utilisation intensive de JSONB, UUID et Enums)
- **Frontend :** NextJs
- **Stockage de Fichiers :** Service compatible S3 avec hachage (SHA256) côté serveur
- **Intelligence Artificielle :** APIs LLMs (Modèles propriétaires ou Open Source)

## 🚀 Prochaines Étapes
1. Modélisation de la base de données.
2. Implémentation de l'API de gestion des `Claims` et de la récolte d'`Evidence`.
3. Mise en place du moteur de Triage et du mode dégradé (Twist 01).
4. Création de l'interface modérateur et de la page publique de consultation.

---

