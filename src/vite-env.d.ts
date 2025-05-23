/// <reference types="vite/client" />

interface ElectronAPI {
  getAppInfo: () => Promise<{
    appName: string;
    appVersion: string;
    electronVersion: string;
    nodeVersion: string;
    chromeVersion: string;
  }>;
  fetchApiData: () => Promise<any>;
}

interface Window {
  electronAPI: ElectronAPI;
}