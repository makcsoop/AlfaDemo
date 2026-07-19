import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { initCrossTabSync } from './lib/crossTabSync';
import './index.css';

// Держим прогресс/активацию консистентными между вкладками браузера.
initCrossTabSync();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
);
