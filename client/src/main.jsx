import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Chart as ChartJS } from 'chart.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';
import App from './App.jsx';
import AuthProvider from './context/AuthProvider.jsx';
import ToastProvider from './context/ToastProvider.jsx';

// Page load thatani sathe saved theme lagavo (login page par pan, flash vagar)
try {
  document.documentElement.setAttribute(
    'data-bs-theme',
    localStorage.getItem('ssms-theme') === 'dark' ? 'dark' : 'light'
  );
} catch {
  // ignore
}

// Chart na akshar light ane dark banne ma vanchay tevo neutral rang
ChartJS.defaults.color = '#8b97ab';
ChartJS.defaults.borderColor = 'rgba(148, 163, 184, 0.25)';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <App />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);