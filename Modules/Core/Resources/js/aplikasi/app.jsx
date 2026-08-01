import './bootstrap';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@modules/Auth/Resources/js/aplikasi/context/AuthContext';

// Import Layout dan Halaman (sesuaikan path relatifnya dari folder Core/Resources/js)
import DefaultLayout from '@modules/Core/Resources/js/aplikasi/templates/layouts/DefaultLayout';
import Dashboard from '@modules/Dashboard/Resources/js/aplikasi/pages/Dashboard';

// Definisikan Router Utama Core
const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/app/dashboard" replace />
    },
    {
        path: '/app',
        element: <DefaultLayout />,
        children: [
            {
                path: 'dashboard',
                element: <Dashboard />
            }
        ]
    }
]);

export default function App() { // Ubah menjadi huruf kapital (App)
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

// Mount ke elemen ID 'app' yang ada di Blade Core
const container = document.getElementById('app');
if (container) {
    const root = createRoot(container);
    root.render(
        <React.StrictMode>
            <App /> {/* Panggil komponen dengan huruf kapital */}
        </React.StrictMode>
    );
}