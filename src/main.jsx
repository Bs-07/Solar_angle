import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import SheetPage from './SheetPage.jsx';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/Solar_angle">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sheet" element={<SheetPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
