import { remote } from 'electron';

if (remote.getGlobal('DEV_MODE')) {
  window.addEventListener('load', () => {
    const webview = document.querySelector('webview');
    if (!webview) {
      return;
    }
    window.openGPMDevTools = () => {
      webview.openDevTools();
    };
  });
}
