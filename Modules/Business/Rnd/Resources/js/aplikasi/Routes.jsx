import { lazy, Suspense } from 'react';

// =========================================================
// LAZY LOAD
// =========================================================

const Dashboardrnd = lazy(() =>
    import(
        '@Modules/Business/Rnd/Resources/js/aplikasi/pages/Dashboard-rnd.jsx'
    )
);

const TobaccoAturan = lazy(() =>
    import(
        '@Modules/Business/Rnd/Resources/js/aplikasi/pages/aturan/TobaccoAturan.jsx'
    )
);

const TobaccoAturanDetail = lazy(() =>
    import(
        '@Modules/Business/Rnd/Resources/js/aplikasi/pages/aturan/components/print/TobaccoAturanDetail.jsx'
    )
);

const KirimanTbkPage = lazy(() =>
    import(
        '@Modules/Business/Rnd/Resources/js/aplikasi/pages/kirimantbk/KirimanTbkPage.jsx'
    )
);

const KirimanTbkCreatePage = lazy(() =>
    import(
        '@Modules/Business/Rnd/Resources/js/aplikasi/pages/kirimantbk/KirimanTbkCreatePage.jsx'
    )
);


// =========================================================
// LOADING
// =========================================================

const Loading = () => (
    <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-sm text-slate-500">
            Memuat halaman...
        </div>
    </div>
);


// =========================================================
// ROUTES
// =========================================================

export const rnd = [

    {
        path: 'Dashboardrnd',
        element: (
            <Suspense fallback={<Loading />}>
                <Dashboardrnd />
            </Suspense>
        ),
    },

    {
        path: 'tobacco-aturan',
        element: (
            <Suspense fallback={<Loading />}>
                <TobaccoAturan />
            </Suspense>
        ),
    },

    {
        path: 'tobacco-aturan-detail/:id',
        element: (
            <Suspense fallback={<Loading />}>
                <TobaccoAturanDetail />
            </Suspense>
        ),
    },

    {
        path: 'tobacco-aturan/:aturanId/kiriman',
        element: (
            <Suspense fallback={<Loading />}>
                <KirimanTbkPage />
            </Suspense>
        ),
    },

    {
        path: 'tobacco-aturan/:aturanId/kiriman/create',
        element: (
            <Suspense fallback={<Loading />}>
                <KirimanTbkCreatePage />
            </Suspense>
        ),
    },

];