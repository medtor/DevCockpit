# DevCockpit 🚀

> **The Modern, Local-First Developer & AI Engineering Cockpit.**  
> Centralisez vos outils essentiels, sécurisez vos clés d'API, testez vos prompts et vos protocoles MCP en toute confidentialité.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Security](https://img.shields.io/badge/Encryption-AES--GCM%20256--bit-emerald)](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto)

---

## 📸 Aperçu & Screenshots de l'Application

### 🖥️ Tableau de Bord Principal (Cockpit Développeur)
Vue unifiée affichant vos métriques en temps réel, l'état de vos clés d'API, vos raccourcis favoris et vos actions récentes.

<p align="center">
  <img src="https://raw.githubusercontent.com/medtor/DevCockpit/main/docs/screenshots/dashboard.png" alt="Tableau de Bord DevCockpit" width="100%" />
</p>

---

### 🛠️ Boîte à Outils Développeur Hors-Ligne (JSON, JWT, Hash, Base64...)
Interface avec filtrage de recherche instantané, éditeur double-volet avec coloration syntaxique, validation en direct et confirmation de copie par notification toast.

<p align="center">
  <img src="https://raw.githubusercontent.com/medtor/DevCockpit/main/docs/screenshots/toolbox.png" alt="Boîte à Outils Développeur DevCockpit" width="100%" />
</p>

---

### 🔐 Coffre-fort de Secrets & Gestionnaire de Clés d'API
Sécurisation de vos jetons (OpenAI, Claude, Gemini, GitHub...) chiffrés localement via AES-GCM 256 bits avec masquage automatique et test de santé en un clic.

<p align="center">
  <img src="https://raw.githubusercontent.com/medtor/DevCockpit/main/docs/screenshots/vault.png" alt="Coffre-fort de Clés et Secrets DevCockpit" width="100%" />
</p>

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
- **JWT Decoder** : décode localement le header et le payload d’un JWT; affiche la signature brute ou son absence. Le décodage ne vérifie pas la signature et ne valide ni l’émetteur, ni l’audience, ni l’expiration : ne faites jamais confiance aux claims sur cette base.
- **Base64** : Encodeur / Décodeur de chaînes de caractères et de données binaires.
- **Hash Generator** : SHA-256, SHA-512, MD5, SHA-1 en temps réel.
- **UUID & NanoID** : Générateur d'identifiants uniques v4 en masse.
- **URL & Slug** : Encodeur / Décodeur d'URLs et générateur de slugs SEO.
- **Regex Tester** : Test d'expressions régulières avec surlignage des correspondances.
- **Cron Parser** : analyse hors ligne les expressions Unix numériques à cinq champs (`*`, listes, plages et pas), explique le calendrier et prévisualise jusqu’à cinq occurrences dans un fuseau IANA modifiable (celui du navigateur par défaut), sur un horizon de 25 ans. DOM/DOW suit la sémantique standard : OU si les deux champs sont restreints, sinon `*` laisse l’autre déterminer le jour; 0 et 7 signifient dimanche. Pas de secondes, noms, alias spéciaux ni année. Une expression valide peut ne produire aucune occurrence dans l’horizon. La prévisualisation saute les heures locales inexistantes et peut afficher deux fois une heure ambiguë; les planificateurs peuvent différer.
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

- **Chiffrement local** : Le contenu du workspace est chiffré dans le navigateur avec AES-GCM 256 bits. Une clé est dérivée du mot de passe maître avec PBKDF2-HMAC-SHA-256 (600 000 itérations), sel et IV aléatoires.
- **Verrouillage** : Le workspace demande un mot de passe maître à chaque ouverture. Les données locales existantes sont migrées vers le format chiffré après validation de la sauvegarde ; l’ancienne copie en clair est supprimée seulement après vérification du chiffrement.
- **Sauvegardes** : Les exports sont chiffrés avec le mot de passe maître. Conservez ce mot de passe : il n’existe pas de récupération côté serveur et une sauvegarde chiffrée ne peut pas être ouverte sans lui.
- **Requêtes externes** : Les clés API restent locales au repos, mais un test de clé envoie cette clé au fournisseur/API choisi par l’utilisateur.
- **Limite de sécurité** : Le chiffrement au repos protège les données stockées, pas une application compromise, une extension malveillante ou un appareil déjà déverrouillé.

---

## 📄 Licence

Ce projet est distribué sous licence MIT. Libre à vous de l'utiliser, l'adapter et l'enrichir !
