import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import halaman dari folder pages
import LoginPage from './aplikasi/pages/Login';

function AuthApp() {
    return (
        <BrowserRouter basename="/app">
            <Routes>
                {/* Mengarahkan ke halaman login.jsx */}
                <Route path="/login" element={<LoginPage />} />
                
                {/* Fallback jika akses root /app */}
                <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

const container = document.getElementById('auth-root');
if (container) {
    const root = createRoot(container);
    root.render(<AuthApp />);
}