# TI4 Super Streamer Buddy

A local server for transferring data between TTPG and Twitch's event endpoint.

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone this repository or create a new project based on this template.
2. Install dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm run dev
```

This will start:
- Vite dev server for React
- Electron app that loads the development URL
- Express server on port 3000

## Project Structure

```
electron-react-express/
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
├── vite.config.ts        # Vite configuration
├── electron/             # Electron main process code
│   ├── main.ts           # Main Electron entry point
│   ├── preload.ts        # Preload script for secure IPC
│   └── server/           # Express server
│       ├── index.ts      # Server setup
│       └── routes/       # API endpoints
│           └── api.ts    # Example API routes
├── src/                  # React frontend (renderer process)
│   ├── App.tsx           # Main React component
│   ├── main.tsx          # React entry point
│   ├── vite-env.d.ts     # Vite type declarations
│   ├── styles/
│   │   └── index.css     # Global styles with Tailwind
│   └── components/       # React components
│       └── Example.tsx   # Example component
└── index.html            # HTML template for Vite
```

## Building for Production

To build the application for production:

```bash
npm run build
```

This will:
1. Compile TypeScript
2. Build the React frontend with Vite
3. Create distributables with electron-builder

## License

MIT