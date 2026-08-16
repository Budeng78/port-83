import React from 'react';
import { Navigate } from 'react-router-dom';

// Impor Halaman
import Dashboard from './aplikasi/pages/Dashboard';
import UserManagement from '@Modules/Auth/Resources/js/aplikasi/pages/users/UserManagement';
import MenuManagement from '@Modules/System/Resources/js/aplikasi/pages/MenuManagement';
import TrashManagement from '@Modules/System/Resources/js/aplikasi/pages/TrashManagement';
import UnderConstruction from '@Modules/System/Resources/js/aplikasi/modals/UnderConstruction';
import ModuleManager from '@Modules/System/Resources/js/aplikasi/pages/ModuleManager';
import RoleManage from '@Modules/RBAC/Resources/js/aplikasi/pages/RoleManage';
import PermissionManage from '@Modules/RBAC/Resources/js/aplikasi/pages/PermissionManage';

export const dashboardRoutes = [
    {
        index: true,
        element: <Navigate to="dashboard" replace />
    },
    {
        path: 'dashboard',
        element: <Dashboard />
    },
    {
        path: 'menus',
        element: <MenuManagement />
    },
    {
        path: 'users',
        element: <UserManagement />
    },
    {
        path: 'roles',
        element: <RoleManage/>
    },
    {
        path: 'permissions',
        element: <PermissionManage/>
    },
    {
        path: 'trash/:module/:resource',
        element: <TrashManagement />
    },
    {
        path: 'payroll',
        element: <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm"><h1 className="text-xl font-bold">Modul Payroll</h1></div>
    },
    {
        path: 'roles',
        element: <div className="p-6 bg-white rounded-[2rem] border border-slate-200 shadow-sm"><h1 className="text-xl font-bold">Modul Peran & Hak Akses</h1></div>
    },
    {
        path: 'modules', // <-- Jalur URL baru: /app/modules
        element: <ModuleManager />
    },
    {
        path: '*',
        element: <UnderConstruction />
    }
];