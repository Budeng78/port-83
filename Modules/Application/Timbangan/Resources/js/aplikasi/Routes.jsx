// Modules/Application/Timbangan/Resources/js/aplikasi/Routes.jsx
import React, { lazy, Suspense } from 'react';

const Pos1TargetPage = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/Pos1TargetPage.jsx'));
const Pos1Timbang1Page = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/Pos1Timbang1Page.jsx'));
const LaporanTimbangan = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/LaporanPenimbanganPage.jsx'));

const Loading = () => <div className="p-4">Loading...</div>;

export const Timbangan = [
    {
        path: 'pos1/target',
        element: (
            <Suspense fallback={<Loading />}>
                <Pos1TargetPage />
            </Suspense>
        ),
    },
    {
        path: 'pos1/timbang1/:targetId?',
        element: (
            <Suspense fallback={<Loading />}>
                <Pos1Timbang1Page />
            </Suspense>
        ),
    },
     {
        path: 'pos1/laportimbang',
        element: (
            <Suspense fallback={<Loading />}>
                <LaporanTimbangan />
            </Suspense>
        ),
    },
];