import React, { lazy } from 'react';

const Dashboard = lazy(() => import ('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/Dashboard.jsx'));
const Timbanganmentah = lazy(() => import ('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/TimbangTerima.jsx'));

// alamat menu ==>> path: '/app/produksi/primary',

export const PosRajang = [
    {
        path: 'Dashboard',element: <Dashboard />,
        path: 'Timbang-Masuk',element: <Timbanganmentah />,
        
    },
];