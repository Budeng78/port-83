import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@Modules/Auth/Resources/js/aplikasi/context/AuthContext';

// Import Layout Utama dari Modul Core
import DefaultLayout from '@Modules/Dashboard/Resources/js/aplikasi/templates/layouts/DefaultLayout';

// Import Kumpulan Rute Dashboard
import { dashboardRoutes } from './routes';

// Komponen Gembok Pengaman
const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    if (!token) {
        window.location.href = '/app/login';
        return null;
    }
    return children;
};

const router = createBrowserRouter([
    {
        path: '/',
        element: <Navigate to="/app/dashboard" replace />
    },
    {
        path: '/app',
        element: (
            <ProtectedRoute>
                <DefaultLayout />
            </ProtectedRoute>
        ),
        children: dashboardRoutes
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
    ReactDOM.createRoot(document.getElementById('app')).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}