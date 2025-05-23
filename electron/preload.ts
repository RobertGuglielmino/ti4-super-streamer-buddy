import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getAppInfo: () => ipcRenderer.invoke('get-app-info'),
  fetchApiData: () => ipcRenderer.invoke('fetch-api-data'),
});

window.addEventListener('DOMContentLoaded', () => {
    const versionElement = document.getElementById('version-info');
    if (versionElement) {
      versionElement.textContent = `v${require('./package.json').version}`;
    }
  });