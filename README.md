# One-Button Party

Local multiplayer one-button party game — up to 4 players on a single keyboard or with gamepads.

## Getting Started

### Install dependencies

```bash
npm ci
```

### Run development server

```bash
npm run dev
```

### Build for production

```bash
npm run build
```

Output goes to `dist/`.

## Controls

### Keyboard (Party Mode)

| Player | Keys |
|--------|------|
| P1 | `A` or `Space` |
| P2 | `L` or `Enter` |
| P3 | `Left Ctrl` or `Q` |
| P4 | `Right Ctrl` or `P` |

Press `Escape` to go back / exit.

### Gamepad

Any standard gamepad works — press the **A / Cross button** (button 0) to join and play.  
Up to 4 gamepads supported; each gamepad maps to a player slot (gamepad 0 → P1, etc.).

## Deployment

This project is configured for **Vercel**. Simply connect your repo and Vercel will auto-detect Vite and deploy from `dist/`.
