# DevCockpit 🚀

> **The Modern, Local-First Developer & AI Engineering Cockpit.**  
> Centralisez vos outils essentiels, sécurisez vos clés d'API, testez vos prompts et vos protocoles MCP en toute confidentialité.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Encryption-AES--GCM%20256--bit-emerald)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

---

## 🌟 Points Forts & Fonctionnalités

### 🔐 Coffre-fort de Clés & Mots de Passe (Local-First)
- Chiffrement côté client de bout en bout avec **AES-GCM 256 bits** via l'API Web Crypto native.
- Aucune donnée sensible n'est transmise à un serveur distant : vos secrets restent dans votre navigateur.
- Export et import sécurisés de sauvegardes chiffrées avec mot de passe maître.

### ⚡ Testeur de Clés API & Health Check
- Validation et test de connectivité en direct pour les principaux fournisseurs d'IA et de Cloud :
  - **OpenAI**, **Anthropic Claude**, **Google Gemini**, **Groq**, **Mistral AI**, **OpenRouter**, **GitHub Personal Tokens**, etc.
- Masquage automatique des secrets et détection de validité instantanée.

### 🔌 Gestionnaire de Serveurs MCP (Model Context Protocol)
- Catalogue et gestion de vos serveurs MCP pour les assistants d'ingénierie IA.
- Générateur automatique de fichiers de configuration pour **Claude Desktop**, **Cursor**, et **Windsurf**.
- Test de syntaxe et validation de format JSON-RPC.

### 🧠 Prompt Engineering Studio
- Laboratoire de conception, test et optimisation de prompts.
- Bibliothèque de templates prêts à l'emploi (Coding, Refactoring, Documentation, Architecture).
- Injection de variables dynamiques, estimation du nombre de tokens et calibrage des hyperparamètres (temperature, top_p).

### 🛠️ Boîte à Outils Développeur Hors-Ligne (Offline Toolbox)
Un ensemble complet d'utilitaires avec recherche instantanée et copie en un clic avec retours visuels :
- **JSON** : Formateur, validateur et minificateur avec détection d'erreurs.
- **JWT** : Décodeur et inspecteur de jetons (Header, Payload, expiration).
- **Base64** : Encodeur / Décodeur de chaînes de caractères et de données binaires.
- **Hash Generator** : SHA-256, SHA-512, MD5, SHA-1 en temps réel.
- **UUID & NanoID** : Générateur d'identifiants uniques v4 en masse.
- **URL & Slug** : Encodeur / Décodeur d'URLs et générateur de slugs SEO.
- **Regex Tester** : Test d'expressions régulières avec surlignage des correspondances.
- **Cron Parser** : Explication en langage clair et prévisualisation des prochaines exécutions.
- **Convertisseur de Couleurs & CSS** : HEX, RGB, HSL.

### 🎨 Expérience Utilisateur
- Thème **Dark Mode** & **Light Mode** avec synchronisation immédiate sans flash.
- Support multilingue : **Français**, **Anglais**, **Arabe** (avec adaptation RTL complète).
- Interface fluide, responsive et optimisée pour desktop et mobile.

---

## 🚀 Démarrage Rapide

### Prérequis
- [Node.js](https://nodejs.org/) version 18 ou supérieure
- `npm` ou `pnpm` / `yarn`

### Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/medtor/DevCockpit.git
cd DevCockpit

# 2. Installer les dépendances
npm install

# 3. Lancer en mode développement
npm run dev
```

L'application sera accessible sur `http://localhost:3000` (ou le port indiqué par Vite).

### Construction pour la production

```bash
# Vérifier et compiler le projet
npm run build

# Prévisualiser la version de production
npm run preview
```

---

## 🏗️ Architecture & Technologies

```
DevCockpit/
├── src/
│   ├── components/       # Composants modulaires (Vault, Toolbox, Prompts, MCP, etc.)
│   ├── context/          # Contextes globaux (Thème, Langue, Sécurité)
│   ├── utils/            # Utilitaires de chiffrement WebCrypto, parseurs & helpers
│   ├── types/            # Définitions TypeScript
│   ├── App.tsx           # Dashboard principal et navigation
│   └── main.tsx          # Point d'entrée de l'application
├── public/               # Ressources statiques
├── index.html            # Entry point HTML avec scripts anti-flash
├── tailwind.config.js    # Configuration des styles Tailwind
└── package.json          # Dépendances et scripts de build
```

- **Framework** : React 19 avec Hooks & Context API
- **Langage** : TypeScript en mode strict
- **Styles** : Tailwind CSS avec classes utilitaires fluides
- **Icônes** : Lucide React
- **Sécurité** : Web Crypto API standard (SubtleCrypto)

---

## 🔒 Confidentialité & Sécurité

1. **Zero-Knowledge Architecture** : Aucune donnée saisie dans le coffre-fort n'est envoyée vers un tiers.
2. **Chiffrement fort** : Les clés sont dérivées via PBKDF2 et chiffrées en AES-GCM avec vecteur d'initialisation aléatoire unique.
3. **Isolation navigateur** : Les clés API testées utilisent des requêtes sécurisées côté client ou proxy sécurisé sans conservation de logs.

---

## 📄 Licence

Ce projet est distribué sous licence MIT. Libre à vous de l'utiliser, l'adapter et l'enrichir !
