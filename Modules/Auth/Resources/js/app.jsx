import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from '@modules/Dashboard/Resources/js/aplikasi/pages/Dashboard';
import LoginPage from './aplikasi/pages/Login';
import PermissionMatrix from '@modules/Auth/Resources/js/aplikasi/pages/usermanage/PermissionMatrix.jsx';

function AuthApp() {
    return (
        <BrowserRouter basename="/app">
            <Routes>
                {/* Karena ada basename="/app", path ditulis tanpa /app */}
                <Route path="/login" element={<LoginPage />} />
                
                <Route path="/settings/permission-matrix" element={<PermissionMatrix />} />
                
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