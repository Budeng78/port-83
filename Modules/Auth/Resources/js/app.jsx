import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './aplikasi/pages/Login';


function AuthApp() {
    return (
        <BrowserRouter basename="/app">
            <Routes>
                <Route path="/login" element={<LoginPage />} /> 
                {/* Fallback otomatis diarahkan ke /login */}
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
