import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { MotionConfig } from 'framer-motion';
import { router } from './router';
import { TooltipProvider } from './components/ui/Tooltip';
import './styles/index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* reducedMotion="user" makes every Framer animation honor the OS setting
        (§8e) — CSS transitions are already handled in index.css. */}
    <MotionConfig reducedMotion="user">
      <TooltipProvider delayDuration={200} skipDelayDuration={300}>
        <RouterProvider router={router} />
      </TooltipProvider>
    </MotionConfig>
  </React.StrictMode>,
);
