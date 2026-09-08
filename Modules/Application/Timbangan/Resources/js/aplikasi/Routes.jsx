// Modules/Application/Timbangan/Resources/js/aplikasi/Routes.jsx
import React, { lazy, Suspense } from 'react';

const TargetPage = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/target/TargetPage.jsx'));
//const Pos1TargetPage = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/Pos1TargetPage.jsx'));
const Pos1Timbang1Page = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/Pos1Timbang1Page.jsx'));
const LaporanTimbangan = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/LaporanPenimbanganPage.jsx'));

//const Pos1TargetIndex = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/target/Index.jsx'));
//const Pos1TargetCreate = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/target/Create.jsx'));
//const Pos1TargetShow = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/target/Show.jsx'));

const Loading = () => <div className="p-4">Loading...</div>;

export const Timbangan = [


     {
        path: 'pos1/targets',
        element: (
            <Suspense fallback={<Loading />}>
                <TargetPage />
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