# Electron React Express Boilerplate

A modern boilerplate for building cross-platform desktop applications with Electron, React, Express, TypeScript, Tailwind CSS, and Vite.

## Features

- 🚀 **Electron**: Cross-platform desktop application framework
- ⚛️ **React**: Frontend UI library with TypeScript support
- 🌐 **Express**: Backend server for REST API endpoints
- 📊 **TypeScript**: Type safety throughout the entire application
- 🎨 **Tailwind CSS**: Utility-first CSS framework
- ⚡ **Vite**: Fast development and building tool
- 🔄 **IPC Communication**: Secure communication between processes

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

## Where to Add New Code

### 1. Adding React Components

Create new components in the `src/components/` directory:

```tsx
// src/components/MyNewComponent.tsx
import React from 'react';

interface MyNewComponentProps {
  // Define your props here
}

function MyNewComponent(props: MyNewComponentProps) {
  // Component implementation
  return (
    <div className="p-4 bg-white rounded shadow">
      {/* Your component content */}
    </div>
  );
}

export default MyNewComponent;
```

Then import and use them in your application:

```tsx
import MyNewComponent from './components/MyNewComponent';

// Inside your render method
<MyNewComponent />
```

### 2. Adding REST Endpoints

Add new routes in `electron/server/routes/` directory:

```typescript
// electron/server/routes/users.ts
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  // Handle GET request
  res.json({ users: [] });
});

router.post('/', (req, res) => {
  // Handle POST request
  const { name, email } = req.body;
  // Add new user logic
  res.status(201).json({ id: 1, name, email });
});

export const userRoutes = router;
```

Then register the routes in `electron/server/index.ts`:

```typescript
// electron/server/index.ts
import { userRoutes } from './routes/users';

// ...

// API routes
app.use('/api', apiRoutes);
app.use('/api/users', userRoutes);
```

### 3. Adding IPC Communication

1. Add a handler in `electron/main.ts`:

```typescript
// In the setupIPC function
ipcMain.handle('my-new-action', async (event, arg) => {
  // Handle the action
  return { result: 'success', data: arg };
});
```

2. Expose it in `electron/preload.ts`:

```typescript
// Add to the exposed methods
myNewAction: (arg: any) => ipcRenderer.invoke('my-new-action', arg),
```

3. Update type definitions in `src/vite-env.d.ts`:

```typescript
interface ElectronAPI {
  // Existing methods
  myNewAction: (arg: any) => Promise<any>;
}
```

4. Use it in your React components:

```typescript
// In a React component
const handleAction = async () => {
  const result = await window.electronAPI.myNewAction({ some: 'data' });
  console.log(result);
};
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