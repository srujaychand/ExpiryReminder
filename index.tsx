
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

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
// Improved for environment compatibility
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Using a relative path to SW script
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('SW registered'))
      .catch((err) => {
        // Log but don't crash; often fails in sandboxed preview environments
        console.warn('PWA Service Worker registration skipped (expected in some dev environments):', err.message);
      });
  });
}
