# Shrawani Wakchaure - Interactive Retro Portfolio

An interactive, accessible web portfolio blending a cozy pixel-art narrative world, a classic console Memory Card BIOS interface, and a fully functional retro Windows OS desktop simulation.

[![Vercel Deployment](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![React](https://img.shields.io/badge/React-18-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6-purple?logo=vite)](https://vitejs.dev/)

---

## 🌟 Key Features

- **Cozy Pixel-Art Intro & Overworld**: Interactive top-down avatar world with keyboard/touch controls, retro CRT effects, and narrative dialogs.
- **Console Memory Card Interface**: Centered 3D memory card selector featuring client-side interactive playable games:
  - **Cyber Threat Defense**: Real-time board & snake cyber defense simulation.
  - **The Zero-Day Escape Room**: Interactive security escape room puzzle engine.
  - **Quiet Audit**: Stealth-based cyber audit mission game.
- **Windows Retro Desktop Environment**:
  - Window manager with drag, resize, maximize/minimize, and z-index ordering.
  - **Projects Folder (`Reader 1.0`)**: Detailed project documentation viewer including *Zero-Trust Continuous Behavioral Authentication (AegisTrust)*.
  - Fully functional desktop applications: Paint, Calculator, Messenger, Camera, Notepad, Internet Explorer.
- **Paper / Resume View**: Minimal, printable, ATS-friendly resume mode accessible instantly via skip navigation.
- **Accessibility First**: WCAG 2.1 AA/AAA compliant focus traps, roving tabindex, keyboard shortcuts, and screen-reader polite live regions.

---

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS & BEM Retro Pixel Styling
- **State & Logic**: React Context, Custom Hooks, XState state machine
- **Testing**: Vitest
- **PWA**: Offline-ready Progressive Web App with Workbox service worker
- **Hosting**: Configured for instant deployment on [Vercel](https://vercel.com) (`vercel.json`)

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Shrawani-wakchaure/portfolio.git

# Navigate to the project directory
cd portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Running Tests

```bash
npm test
```

---

## ☁️ Deployment on Vercel

This repository includes a pre-configured [`vercel.json`](./vercel.json) optimized for Vite single-page applications:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Deploy via GitHub Integration:
1. Log in to [Vercel](https://vercel.com).
2. Click **"Add New..."** -> **"Project"**.
3. Import the `Shrawani-wakchaure/portfolio` repository.
4. Leave all default settings (Vercel automatically detects Vite, `npm run build`, and `dist/`).
5. Click **"Deploy"**.

---

## 📬 Connect

- **LinkedIn**: [shrawani-wakchaure](https://www.linkedin.com/in/shrawani-wakchaure)
- **GitHub**: [Shrawani-wakchaure](https://github.com/Shrawani-wakchaure)
