import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@modules/Auth/Resources/js/aplikasi/context/AuthContext';

// Menggunakan alias @modules agar konsisten dan bersih
import DefaultLayout from '@modules/Core/Resources/js/aplikasi/templates/layouts/DefaultLayout';

// Mengambil Halaman Dashboard dari folder aplikasi
import Dashboard from './aplikasi/pages/Dashboard';

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

export default function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

if (document.getElementById('app')) {
    ReactDOM.createRoot(document.getElementById('app')).render(<App />);
}