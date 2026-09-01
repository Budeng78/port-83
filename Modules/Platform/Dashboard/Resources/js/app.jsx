import React, { Suspense, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { AuthProvider } from '@Modules/Platform/Auth/Resources/js/aplikasi/context/AuthContext';

// import router modules
import { PosRajang } from '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/Routes.jsx';
import { rnd } from '@Modules/Business/rnd/Resources/js/aplikasi/Routes.jsx';


// Import komponen menggunakan Lazy Loading untuk memecah chunk size
const Login = lazy(() => import('@Modules/Platform/Auth/Resources/js/aplikasi/pages/Login'));
const Dashboard = lazy(() => import('@Modules/Platform/Dashboard/Resources/js/aplikasi/pages/Dashboard'));
const DefaultLayout = lazy(() => import('@Modules/Platform/Dashboard/Resources/js/aplikasi/templates/layouts/DefaultLayout'));
const RoleManage = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/RoleManage'));
const PermissionManage = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/PermissionManage'));
const RolePermissionManage = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/RolePermissionManage'));
const UserMatrix = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/UserMatrix'));
const Assignment = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/AssignmentManage'));
const UserMenu = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/UserMenu'));
const OrganizationLevelManage = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/OrganizationLevelManage'));
const OrganizationUnitManage = lazy(() => import('@Modules/Platform/RBAC/Resources/js/aplikasi/pages/OrganizationUnitManage'));
const UserManage = lazy(() => import('@Modules/Platform/Auth/Resources/js/aplikasi/pages/users/UserManagement'));
const MenuManagement = lazy(() => import('@Modules/Platform/System/Resources/js/aplikasi/pages/MenuManagement'));
const ModuleManage = lazy(() => import('@Modules/Platform/System/Resources/js/aplikasi/pages/ModuleManager'));
const TrashManagement = lazy(() => import('@Modules/Platform/System/Resources/js/aplikasi/pages/TrashManagement'));


const ProtectedRoute = ({ children }) => {
    const token = localStorage.getItem('access_token');
    return token ? children : <Navigate to="/app/platform/auth/login" replace />;
};

// Bungkus dengan Suspense agar tidak error saat loading chunk
const Loading = () => <div className="p-4">Loading...</div>;

const router = createBrowserRouter([
    { path: '/', element: <Navigate to="/app/platform/dashboard" replace /> },
    { path: '/app/platform/auth/login', element: <Suspense fallback={<Loading />}><Login /></Suspense> },
    {
        path: '/app/platform',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loading />}><DefaultLayout /></Suspense>
            </ProtectedRoute>
        ),
        children: [
            { index: true, element: <Navigate to="dashboard" replace /> }, //
            { path: 'dashboard', element: <Dashboard /> }, // dasboard 
            { path: 'modules', element: <ModuleManage /> }, // bisnis
            { path: 'menus', element: <MenuManagement /> },
            { path: 'users', element: <UserManage /> }, // bisnis
            { path: 'usermenu', element: <UserMenu /> }, // bisnis
            { path: 'roles', element: <RoleManage /> }, // bisnis RolePermissionManage            
            { path: 'permissions', element: <PermissionManage /> },
            { path: 'RolePermission', element: <RolePermissionManage /> },
            { path: 'usermatrix', element: <UserMatrix />}, // bisnis
            { path: 'assignments', element: <Assignment />}, // bisnis
            { path: 'organization-levels', element: <OrganizationLevelManage />,}, // bisnis
            { path: 'organization-unit', element: <OrganizationUnitManage />,}, // bisnis// bisnis
            { path: 'trashmanagement', element: <TrashManagement />,},
            
        ],
    },
        {
        path: '/app/produksi/primary',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                    <DefaultLayout />
                </Suspense>
            </ProtectedRoute>
        ),
        children: [
            ...PosRajang,
        ],
    },
    {
        path: '/app/rnd',
        element: (
            <ProtectedRoute>
                <Suspense fallback={<Loading />}>
                    <DefaultLayout />
                </Suspense>
            </ProtectedRoute>
        ),
        children: [
            ...rnd,
        ],
    },




]);

function App() {
    return (
        <AuthProvider>
            <RouterProvider router={router} />
        </AuthProvider>
    );
}

const el = document.getElementById('app');
if (el) {
    if (!el._reactRoot) {
        el._reactRoot = createRoot(el);
    }
    el._reactRoot.render(<App />);
}