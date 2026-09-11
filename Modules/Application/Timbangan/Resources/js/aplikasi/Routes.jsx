// Modules/Application/Timbangan/Resources/js/aplikasi/Routes.jsx
import React, { lazy, Suspense } from 'react';

const TargetPage = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/target/TargetPage.jsx'));
const Pos1Timbang1Page = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/Pos1Timbang1Page.jsx'));
const Pos1Timbang2Page = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/Pos1Timbang2Page.jsx'));
const TimbanganReportPage = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/TimbanganReportPage.jsx'));

const TimbanganReportPrint = lazy(() => import('@Modules/Application/Timbangan/Resources/js/aplikasi/pages/Pos1/components/TimbanganReportPrint.jsx'));

const Loading = () => <div className="p-4">Loading...</div>;

export const Timbangan = [


    {
        path: 'pos1/targets',element: (<Suspense fallback={<Loading />}><TargetPage /></Suspense> ),
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
        path: 'pos1/TimbanganReportPage',
        element: (
            <Suspense fallback={<Loading />}>
                <TimbanganReportPage />
            </Suspense>
        ),
    },
    {
        path: 'pos1/timbangan-report/print/:targetId',
        element: (
            <Suspense fallback={<Loading />}>
                <TimbanganReportPrint />
            </Suspense>
        ),
    },

    {
    path: 'pos1/timbang2/:targetId?',
        element: (
            <Suspense fallback={<Loading />}>
                <Pos1Timbang2Page />
            </Suspense>
        ),
   
    },
];