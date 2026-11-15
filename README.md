# Apple Notes — Windows 10 Edition 🍏📝

An exceptionally polished, visually stunning, macOS-inspired note-taking desktop application built specifically for Windows 10.

---

## ✨ Key Features & Aesthetic Design

- **Authentic macOS Aesthetics**:
  - Frosted translucent glass sidebar (`backdrop-blur`) with subtle shadows and depth.
  - macOS Traffic Light window controls (close, minimize, maximize).
  - Apple San Francisco typography hierarchy and warm, clean off-white / dark mode color palettes.
- **Customizable Accent Colors**:
  - Switch instantly between **Gold**, **San Francisco Blue**, **Emerald Green**, and **Purple** themes.
- **Rich Note Organization**:
  - iCloud folder management (All Notes, Quick Notes, Personal, Work, Trash).
  - Custom folder creation modal.
  - Pinned notes section with golden pin indicators.
  - Real-time search across titles and content.
- **Interactive Checklists & Rich Formatting**:
  - Interactive round checklists (click checkboxes to strike-through items instantly!).
  - Markdown-style headings, bold, italic, and bullet lists via the formatting menu (`Aa`).
  - Auto-hashtag extraction (`#work`, `#ideas`) that automatically populate the sidebar tag filters.
- **Attachments & Export**:
  - Image attachment support (persistently saved locally).
  - Export notes as Markdown (`.md`) or Plain Text (`.txt`).
  - Copy to clipboard with toast notification.
- **Data Persistence**:
  - All notes and folders persist locally in `localStorage` so your notes never disappear.

---

## 🚀 Getting Started

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your Windows 10 machine.

### 1. Install Dependencies
Open your terminal inside the project folder and run:
\`\`\`bash
npm install
\`\`\`

### 2. Run in Development Mode (Web Preview)
\`\`\`bash
npm run dev
\`\`\`
Open the URL shown in your terminal (usually `http://localhost:5173`) in your browser.

### 3. Run as Native Desktop App (Electron)
To launch the native desktop window:
\`\`\`bash
npx electron .
\`\`\`

### 4. Build for Production
\`\`\`bash
npm run build
\`\`\`
The compiled web assets will be generated in the `dist/` directory.

---

## 🎨 Art Direction & Visual Polish Pass
Designed with meticulous attention to detail:
- Generous whitespace and visual hierarchy.
- Smooth CSS transitions and hover states.
- Clean scrollbars and subtle border separators.
- Dual-mode support (Light & Dark theme).
