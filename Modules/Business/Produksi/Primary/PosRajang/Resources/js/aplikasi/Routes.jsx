import React, { lazy } from 'react';

const Dashboard = lazy(() =>import('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/Dashboard.jsx'));
const Timbangawal = lazy(() =>import("@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/TimbangAwal.jsx"));
const WoRajang = lazy(() =>import('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/WoRajang.jsx'));
const hasilTimbangan = lazy(() =>import('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/HasilTimbangan.jsx'));
const HasilTimbangan = lazy(() => import('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/HasilTimbangan.jsx'));
const TimbangAwalPrint = lazy(() => import('@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/components/print/TimbangAwalPrint'));




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
    {
        path: 'WoRajang',
        element: <WoRajang />,
    },
    {
        path: 'hasilTimbangan',
        element: <HasilTimbangan />,
    },
    {
        path: 'print/:id',
        element: <TimbangAwalPrint />,
    },
];