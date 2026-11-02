import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import './index.css';

// Filtro defensivo para interceptar erros de extensões de navegador de terceiros (ex: MetaMask inpage.js)
if (typeof window !== 'undefined') {
  window.addEventListener(
    'error',
    (event) => {
      const filename = event.filename || '';
      const msg = event.message || '';
      if (
        filename.includes('chrome-extension://') ||
        filename.includes('moz-extension://') ||
        msg.includes('MetaMask') ||
        msg.includes('Failed to connect to MetaMask')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
        return true;
      }
    },
    true
  );

  window.addEventListener(
    'unhandledrejection',
    (event) => {
      const reason = event.reason;
      const msg = typeof reason === 'string' ? reason : reason?.message || '';
      const stack = reason?.stack || '';
      if (
        msg.includes('MetaMask') ||
        msg.includes('Failed to connect to MetaMask') ||
        stack.includes('chrome-extension://') ||
        stack.includes('moz-extension://')
      ) {
        event.stopImmediatePropagation();
        event.preventDefault();
      }
    },
    true
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);
