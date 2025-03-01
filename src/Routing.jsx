import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Sheet from './SheetPage';

export default function Routing() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/sheet" element={<Sheet />} />
      </Routes>
    </Router>
  );
}
