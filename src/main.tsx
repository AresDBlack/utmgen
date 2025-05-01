// Polyfill for process
if (typeof process === 'undefined') {
  (window as any).process = {
    env: {},
    platform: 'browser',
    version: 'v16.0.0',
    stdout: {
      isTTY: false,
      write: () => {},
    },
    stderr: {
      isTTY: false,
      write: () => {},
    },
  };
}

import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.tsx'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
