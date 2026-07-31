import './bootstrap';
import '../../../../resources/css/app.css'; 
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@modules/Auth/Resources/js/aplikasi/context/AuthContext';

// Import komponen layout utama atau router aplikasi Anda di sini
// Contoh: import AppRoutes from './routes/AppRoutes';

export default function MainApp() {
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col">
            {/* Tempatkan router atau layout utama aplikasi */}
        </div>
    );
}

const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <BrowserRouter basename="/app">
                <AuthProvider>
                    <MainApp />
                </AuthProvider>
            </BrowserRouter>
        </React.StrictMode>
    );
}