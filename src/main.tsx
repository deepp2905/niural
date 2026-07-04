import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { TooltipProvider } from './components/ui/Tooltip';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TooltipProvider delayDuration={200} skipDelayDuration={300}>
      <RouterProvider router={router} />
    </TooltipProvider>
  </React.StrictMode>,
);
