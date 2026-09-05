import React, { lazy } from 'react';
import { Route } from 'react-router-dom';

const Dashboard = lazy(() =>import('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/Dashboard.jsx'));
const Timbangawal = lazy(() =>import("@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/TimbangAwal.jsx"));



// alamat menu ==>> path: '/app/produksi/primary'

export const PosRajang = [
    {
        path: 'Dashboard',
        element: <Dashboard />,
    },
    {
        path: 'Timbang-Masuk',
        element: <Timbangawal />,
    },
   
];