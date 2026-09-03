import React, {
    useEffect,
    useState,
} from 'react';

import {
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';

import {
    ArrowLeft,
    Printer,
} from 'lucide-react';

import { useAuth } from '@Modules/Platform/Auth/Resources/js/aplikasi/context/AuthContext.jsx';

import { tobaccoAturanService } from '@Modules/Business/Rnd/Resources/js/aplikasi/services/tobaccoAturanService.js';

export default function TobaccoAturanDetail() {
    const { id } = useParams();

    const navigate = useNavigate();

    const [searchParams] =
        useSearchParams();

    const { user } = useAuth();

    const [aturan, setAturan] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    // =========================================================
    // AUTO PRINT
    // =========================================================

    const shouldAutoPrint =
        searchParams.get('print') === '1';

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        if (!id) {
            setLoading(false);
            setError(
                'ID aturan tidak ditemukan.'
            );

            return;
        }

        const loadData = async () => {
            try {
                setLoading(true);
                setError('');

                const response =
                    await tobaccoAturanService.getById(
                        id
                    );

                setAturan(
                    response?.data ?? null
                );
            } catch (err) {
                console.error(
                    'Gagal mengambil detail aturan:',
                    err
                );

                setError(
                    err?.response?.data?.message ||
                    'Data aturan tembakau gagal diambil.'
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [id]);

    // =========================================================
    // AUTO PRINT SETELAH DATA SELESAI DIMUAT
    // =========================================================

    useEffect(() => {
        if (
            !loading &&
            aturan &&
            shouldAutoPrint
        ) {
            const timer =
                window.setTimeout(() => {
                    window.print();
                }, 500);

            return () => {
                window.clearTimeout(timer);
            };
        }
    }, [
        loading,
        aturan,
        shouldAutoPrint,
    ]);

    // =========================================================
    // FORMAT TANGGAL
    // =========================================================

    const formatTanggal = (
        tanggal
    ) => {
        if (!tanggal) {
            return '-';
        }

        return new Date(
            tanggal
        ).toLocaleDateString(
            'id-ID',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }
        );
    };

    // =========================================================
    // TANGGAL CETAK
    // =========================================================

    const formatTanggalCetak = () => {
        return new Date().toLocaleDateString(
            'id-ID',
            {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }
        );
    };

    // =========================================================
    // FORMAT ANGKA
    // =========================================================

    const formatNumber = (
        value
    ) => {
        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return '-';
        }

        return Number(value).toLocaleString(
            'id-ID',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="text-sm text-slate-500">
                    Memuat data aturan...
                </div>
            </div>
        );
    }

    // =========================================================
    // ERROR
    // =========================================================

    if (error) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                    {error}
                </div>
            </div>
        );
    }

    // =========================================================
    // DATA TIDAK ADA
    // =========================================================

    if (!aturan) {
        return (
            <div className="p-6">
                <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                    Data aturan tidak ditemukan.
                </div>
            </div>
        );
    }

    // =========================================================
    // DETAILS
    // =========================================================

    const details =
        aturan.details ?? [];

    // =========================================================
    // TOTAL RENCANA
    // =========================================================

    const totalRencana =
        details.reduce(
            (total, detail) =>
                total +
                Number(
                    detail.rencana || 0
                ),
            0
        );

    // =========================================================
    // UI
    // =========================================================

    return (
        <>
            {/* =================================================
                PRINT STYLE
            ================================================= */}

            <style>
                {`
                   @media print {

                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    /* SEMBUNYIKAN SEMUA ELEMEN */
                    body * {
                        visibility: hidden !important;
                    }

                    /* HANYA DOKUMEN YANG DICETAK */
                    .print-document,
                    .print-document * {
                        visibility: visible !important;
                    }

                    .print-document {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;

                        width: 100% !important;
                        max-width: none !important;

                        margin: 0 !important;
                        padding: 0 !important;

                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;

                        background: white !important;

                        overflow: visible !important;
                    }

                    .print-page {
                        min-height: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }

                    table {
                        width: 100% !important;
                        page-break-inside: auto;
                    }

                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    td, th {
                        page-break-inside: avoid;
                    }

                    .print-footer {
                        page-break-inside: avoid;
                    }

                    .print-toolbar {
                        display: none !important;
                    }
                }
                `}
            </style>

            <div className="print-page min-h-full bg-slate-100 p-4 md:p-6">

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="print-toolbar mx-auto mb-4 flex max-w-7xl items-center justify-between">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-slate-600
                            shadow-sm
                            transition
                            hover:bg-slate-50
                        "
                    >
                        <ArrowLeft
                            size={16}
                        />

                        Kembali
                    </button>

                    <button
                        type="button"
                        onClick={() =>
                            window.print()
                        }
                        className="
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-indigo-600
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            shadow-sm
                            transition
                            hover:bg-indigo-700
                        "
                    >
                        <Printer
                            size={16}
                        />

                        Print
                    </button>

                </div>

                {/* =================================================
                    DOKUMEN / CARD YANG DICETAK
                ================================================= */}

                <div className="print-document mx-auto max-w-7xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* =================================================
                        HEADER DOKUMEN
                    ================================================= */}

                    <div className="px-6 pb-5 pt-7 text-center">

                        <h1 className="text-xl font-bold uppercase tracking-wide text-slate-800">
                            Dokumen Pembuatan Aturan Tembakau
                        </h1>

                        <p className="mt-1 text-sm text-slate-600">
                            Sebagai dokumen persetujuan pemakaian Tembakau
                        </p>

                    </div>

                    {/* =================================================
                        IDENTITAS ATURAN
                    ================================================= */}

                    <div className="px-6 pb-6">

                        <div className="grid max-w-xl grid-cols-[110px_1fr] gap-y-2 text-sm">

                            <div className="font-semibold text-slate-600">
                                KODE :
                            </div>

                            <div className="font-medium text-slate-800">
                                {aturan.kode_aturan || '-'}
                            </div>

                            <div className="font-semibold text-slate-600">
                                Tgl Terbit :
                            </div>

                            <div className="font-medium text-slate-800">
                                {formatTanggal(
                                    aturan.tanggal_aturan
                                )}
                            </div>

                        </div>

                    </div>

                    {/* =================================================
                        DETAIL
                    ================================================= */}

                    <div className="px-4 pb-6 md:px-6">

                        <div className="overflow-x-auto rounded-lg border border-slate-300">

                            <table className="w-full border-collapse text-xs">

                                <thead>
                                    <tr className="border-b border-slate-300 bg-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-600">

                                        <th className="border-r border-slate-300 px-2 py-2 text-center">
                                            NO
                                        </th>

                                        <th className="border-r border-slate-300 px-2 py-2 text-left">
                                            GDG
                                        </th>

                                        <th className="border-r border-slate-300 px-2 py-2 text-left">
                                            JENIS TBK
                                        </th>

                                        <th className="border-r border-slate-300 px-2 py-2 text-center">
                                            TYPE
                                        </th>

                                        <th className="border-r border-slate-300 px-2 py-2 text-center">
                                            THN
                                        </th>

                                        <th className="border-r border-slate-300 px-2 py-2 text-center">
                                            S.K
                                        </th>

                                        <th className="border-r border-slate-300 px-2 py-2 text-center">
                                            GRADE
                                        </th>

                                        <th className="px-2 py-2 text-right">
                                            RENCANA
                                        </th>

                                    </tr>
                                </thead>

                                <tbody>

                                    {details.length > 0 ? (
                                        details.map((detail, index) => (
                                            <tr
                                                key={detail.id ?? index}
                                                className="border-b border-slate-200"
                                            >

                                                <td className="border-r border-slate-200 bg-slate-50 px-2 py-2 text-center font-medium text-slate-700">
                                                    {detail.no ?? index + 1}
                                                </td>

                                                <td className="border-r border-slate-200 px-2 py-2 text-left text-slate-700">
                                                    {detail.gdg || '-'}
                                                </td>

                                                <td className="border-r border-slate-200 px-2 py-2 text-left text-slate-700">
                                                    {detail.jenis_tembakau || '-'}
                                                </td>

                                                <td className="border-r border-slate-200 px-2 py-2 text-center text-slate-700">
                                                    {detail.type || '-'}
                                                </td>

                                                <td className="border-r border-slate-200 px-2 py-2 text-center text-slate-700">
                                                    {detail.tahun ?? '-'}
                                                </td>

                                                <td className="border-r border-slate-200 px-2 py-2 text-center text-slate-700">
                                                    {detail.s_k || '-'}
                                                </td>

                                                <td className="border-r border-slate-200 px-2 py-2 text-center text-slate-700">
                                                    {detail.grade || '-'}
                                                </td>

                                                <td className="px-2 py-2 text-right font-mono text-slate-700">
                                                    {formatNumber(detail.rencana)}
                                                </td>

                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td
                                                colSpan={8}
                                                className="px-4 py-8 text-center text-sm text-slate-400"
                                            >
                                                Belum ada detail aturan.
                                            </td>
                                        </tr>
                                    )}

                                </tbody>

                                <tfoot>
                                    <tr className="bg-slate-50">

                                        <td
                                            colSpan={7}
                                            className="border-r border-slate-300 px-2 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500"
                                        >
                                            Total Rencana
                                        </td>

                                        <td className="px-2 py-3 text-right font-mono text-sm font-bold text-indigo-600">
                                            {formatNumber(totalRencana)} Kg
                                        </td>

                                    </tr>
                                </tfoot>

                            </table>
                         


                        </div>

                    </div>

                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="print-footer px-6 pb-8 pt-4">

                        <div className="mb-8 text-right text-sm text-slate-700">
                            Kudus,{' '}
                            {formatTanggalCetak()}
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-center text-sm text-slate-700">

                            <div>
                                <div className="font-semibold">
                                    Approval
                                </div>

                                <div className="h-20" />
                            </div>

                            <div>
                                <div className="font-semibold">
                                    Kabag. RND
                                </div>

                                <div className="h-20" />
                            </div>

                            <div>
                                <div className="font-semibold">
                                    Petugas Laborat
                                </div>

                                <div className="h-20" />

                                <div className="font-medium text-slate-800">
                                    {user?.name || '-'}
                                </div>
                            </div>

                        </div>

                    </div>

                </div>

            </div>
        </>
    );
}
