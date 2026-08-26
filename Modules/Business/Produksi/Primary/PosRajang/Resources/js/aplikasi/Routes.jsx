import React, { lazy } from 'react';

const Dashboard = lazy(() =>
    import(
        '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/Dashboard.jsx'
    )
);

const Timbangawal = lazy(() =>
    import("@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/TimbangAwal.jsx")
);


const WoRajang = lazy(() =>
    import(
        '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/pages/operasional/terima/WoRajang.jsx'
    )
);

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
];