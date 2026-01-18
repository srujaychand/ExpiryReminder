import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Use absolute path for Service Worker
    navigator.serviceWorker.register('/sw.js')
      .then(reg => console.log('SW registered successfully with scope:', reg.scope))
      .catch((err) => {
        console.warn('PWA Service Worker registration skipped:', err.message);
      });
  });
}