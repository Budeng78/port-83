import React, {
    useEffect,
    useState,
} from 'react';

import {
    Printer,
} from 'lucide-react';

import {
    useParams,
} from 'react-router-dom';

import timbanganReportService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/timbanganReportService';

import {
    useAuth,
} from '@Modules/Platform/Auth/Resources/js/aplikasi/context/AuthContext';

import './TimbanganReportPrint.css';
import './TimbanganReportPrintPrint.css';


export default function TimbanganReportPrint() {

    const {
        targetId,
    } = useParams();


    const {
        user,
    } = useAuth();


    const [
        data,
        setData,
    ] = useState(null);


    const [
        loading,
        setLoading,
    ] = useState(true);


    const [
        error,
        setError,
    ] = useState(null);


    // =====================================================
    // LOAD REPORT
    // =====================================================

    useEffect(() => {

        if (!targetId) {

            setError(
                'Target ID tidak ditemukan.'
            );

            setLoading(false);

            return;

        }


        const loadReport = async () => {

            try {

                setLoading(true);

                setError(null);


                const response =
                    await timbanganReportService
                        .getByTarget(targetId);


                setData(
                    response.data?.data || null
                );

            } catch (error) {

                console.error(
                    'Gagal memuat laporan:',
                    error
                );

                setError(
                    'Gagal memuat data laporan.'
                );

            } finally {

                setLoading(false);

            }

        };


        loadReport();

    }, [targetId]);


    // =====================================================
    // FORMAT NUMBER
    // =====================================================

    const formatNumber = (
        value
    ) => {

        return new Intl.NumberFormat(
            'id-ID',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        ).format(
            Number(value) || 0
        );

    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (
        value
    ) => {

        if (!value) {

            return '-';

        }


        return new Date(value)
            .toLocaleDateString(
                'id-ID',
                {
                    day: '2-digit',
                    month: 'long',
                    year: 'numeric',
                }
            );

    };


    // =====================================================
    // RINGKASAN DETAIL
    // =====================================================

    const getDetailSummary = (
        detail
    ) => {

        const timbangan =
            (
                data?.timbangan ||
                []
            ).filter(
                (item) =>
                    item.target_aturan_detail_id ===
                    detail.id
            );


        const totalBruto =
            timbangan.reduce(
                (
                    total,
                    item
                ) =>
                    total +
                    (
                        Number(
                            item.berat_kotor
                        ) || 0
                    ),
                0
            );


        const jumlahBal =
            Number(
                detail.jumlah_bal
            ) || 0;


        const tara =
            Number(
                detail.tara
            ) || 0;


        const totalTara =
            jumlahBal *
            tara;


        const totalNetto =
            totalBruto -
            totalTara;


        return {
            totalBruto,
            totalTara,
            totalNetto,
        };

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (

            <div className="report-print-loading">

                Memuat laporan...

            </div>

        );

    }


    // =====================================================
    // ERROR
    // =====================================================

    if (error) {

        return (

            <div className="report-print-loading">

                {error}

            </div>

        );

    }


    // =====================================================
    // DATA
    // =====================================================

    if (!data) {

        return (

            <div className="report-print-loading">

                Data laporan tidak tersedia.

            </div>

        );

    }


    const target =
        data.target || {};


    const aturan =
        target.aturan || [];


    // =====================================================
    // JUMLAH HALAMAN
    //
    // 1 ATURAN = 1 SHEET
    // =====================================================

    const totalPages =
        Math.max(
            aturan.length,
            1
        );


    // =====================================================
    // REKAP KESELURUHAN
    // =====================================================

    let totalBal = 0;
    let totalBruto = 0;
    let totalTara = 0;
    let totalNetto = 0;


    aturan.forEach(
        (item) => {

            (
                item.detail ||
                []
            ).forEach(
                (detail) => {

                    const summary =
                        getDetailSummary(
                            detail
                        );


                    totalBal +=
                        Number(
                            detail.jumlah_bal
                        ) || 0;


                    totalBruto +=
                        summary.totalBruto;


                    totalTara +=
                        summary.totalTara;


                    totalNetto +=
                        summary.totalNetto;

                }
            );

        }
    );


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <>

            {/* =================================================
                TOMBOL
            ================================================= */}

            <div className="report-print-actions">

                <button
                    type="button"
                    onClick={() => window.print()}
                    className="
                        inline-flex
                        items-center
                        gap-2
                        rounded-lg
                        bg-blue-700
                        px-4
                        py-2
                        text-sm
                        font-medium
                        text-white
                        shadow-sm
                        transition
                        hover:bg-blue-800
                    "
                >

                    <Printer size={16} />

                    Print

                </button>

            </div>


            {/* =================================================
                REPORT CONTAINER
            ================================================= */}

            <div className="report-print-container">


                {/* =================================================
                    TIDAK ADA ATURAN
                ================================================= */}

                {aturan.length === 0 && (

                    <div className="report-print-sheet">

                        <div className="report-print-page-number">

                            Halaman 1/1

                        </div>


                        <ReportHeader
                            target={target}
                            formatDate={formatDate}
                        />

                    </div>

                )}


                {/* =================================================
                    SETIAP ATURAN = 1 SHEET
                ================================================= */}

                {aturan.map(
                    (
                        item,
                        pageIndex
                    ) => {

                        let aturanBal = 0;
                        let aturanBruto = 0;
                        let aturanTara = 0;
                        let aturanNetto = 0;


                        const isLastPage =
                            pageIndex ===
                            totalPages - 1;


                        return (

                            <div
                                key={item.id}
                                className="report-print-sheet"
                            >

                                {/* =================================
                                    NOMOR HALAMAN
                                ================================= */}

                                <div className="report-print-page-number">

                                    Halaman{' '}

                                    {pageIndex + 1}

                                    /

                                    {totalPages}

                                </div>


                                {/* =================================
                                    HEADER
                                ================================= */}

                                <ReportHeader
                                    target={target}
                                    formatDate={formatDate}
                                />


                                {/* =================================
                                    ATURAN
                                ================================= */}

                                <section className="report-print-aturan">

                                    <div className="report-print-aturan-header">

                                        <strong>

                                            ATURAN:{' '}

                                            {item.nomor_aturan}

                                        </strong>

                                    </div>


                                    <table className="report-print-table">

                                        <thead>

                                            <tr>

                                                <th>
                                                    No
                                                </th>

                                                <th>
                                                    Type
                                                </th>

                                                <th>
                                                    Jenis TBK
                                                </th>

                                                <th>
                                                    Tahun
                                                </th>

                                                <th>
                                                    S/K
                                                </th>

                                                <th>
                                                    Grade
                                                </th>

                                                <th>
                                                    Jumlah Bal
                                                </th>

                                                <th>
                                                    Tara
                                                </th>

                                                <th>
                                                    Total Bruto
                                                </th>

                                                <th>
                                                    Total Netto
                                                </th>

                                            </tr>

                                        </thead>


                                        <tbody>

                                            {(item.detail || []).map(
                                                (
                                                    detail,
                                                    index
                                                ) => {

                                                    const summary =
                                                        getDetailSummary(
                                                            detail
                                                        );


                                                    aturanBal +=
                                                        Number(
                                                            detail.jumlah_bal
                                                        ) || 0;


                                                    aturanBruto +=
                                                        summary.totalBruto;


                                                    aturanTara +=
                                                        summary.totalTara;


                                                    aturanNetto +=
                                                        summary.totalNetto;


                                                    return (

                                                        <tr
                                                            key={
                                                                detail.id
                                                            }
                                                        >

                                                            <td>
                                                                {index + 1}
                                                            </td>


                                                            <td>
                                                                {detail.type}
                                                            </td>


                                                            <td>
                                                                {detail.jenis_tbk}
                                                            </td>


                                                            <td>
                                                                {detail.tahun}
                                                            </td>


                                                            <td>
                                                                {detail.s_k}
                                                            </td>


                                                            <td>
                                                                {detail.grade}
                                                            </td>


                                                            <td className="text-right">

                                                                {
                                                                    detail.jumlah_bal
                                                                }

                                                            </td>


                                                            <td className="text-right">

                                                                {formatNumber(
                                                                    detail.tara
                                                                )}

                                                            </td>


                                                            <td className="text-right">

                                                                {formatNumber(
                                                                    summary.totalBruto
                                                                )}

                                                            </td>


                                                            <td className="text-right">

                                                                {formatNumber(
                                                                    summary.totalNetto
                                                                )}

                                                            </td>

                                                        </tr>

                                                    );

                                                }
                                            )}


                                            {/* =================================
                                                SUBTOTAL ATURAN
                                            ================================= */}

                                            <tr className="report-print-subtotal">

                                                <td
                                                    colSpan="6"
                                                    className="text-right"
                                                >

                                                    SUBTOTAL

                                                </td>


                                                <td className="text-right">

                                                    {aturanBal}

                                                </td>


                                                <td className="text-right">

                                                    {formatNumber(
                                                        aturanTara
                                                    )}

                                                </td>


                                                <td className="text-right">

                                                    {formatNumber(
                                                        aturanBruto
                                                    )}

                                                </td>


                                                <td className="text-right">

                                                    {formatNumber(
                                                        aturanNetto
                                                    )}

                                                </td>

                                            </tr>

                                        </tbody>

                                    </table>

                                </section>


                                {/* =================================
                                    REKAP KESELURUHAN
                                    HANYA HALAMAN TERAKHIR
                                ================================= */}

                                {isLastPage && (

                                    <section className="report-print-total">

                                        <div className="report-print-total-title">

                                            REKAPITULASI HASIL PENIMBANGAN

                                        </div>


                                        <table className="report-print-total-table">

                                            <tbody>

                                                <tr>

                                                    <td>
                                                        Jumlah Aturan
                                                    </td>

                                                    <td className="text-right">

                                                        {aturan.length}

                                                    </td>

                                                </tr>


                                                <tr>

                                                    <td>
                                                        Jumlah Bal
                                                    </td>

                                                    <td className="text-right">

                                                        {totalBal}

                                                    </td>

                                                </tr>


                                                <tr>

                                                    <td>
                                                        Total Bruto
                                                    </td>

                                                    <td className="text-right">

                                                        {formatNumber(
                                                            totalBruto
                                                        )}

                                                    </td>

                                                </tr>


                                                <tr>

                                                    <td>
                                                        Total Tara
                                                    </td>

                                                    <td className="text-right">

                                                        {formatNumber(
                                                            totalTara
                                                        )}

                                                    </td>

                                                </tr>


                                                <tr className="report-print-total-netto">

                                                    <td>
                                                        TOTAL NETTO
                                                    </td>

                                                    <td className="text-right">

                                                        {formatNumber(
                                                            totalNetto
                                                        )}

                                                    </td>

                                                </tr>

                                            </tbody>

                                        </table>

                                    </section>

                                )}


                                {/* =================================
                                    TANDA TANGAN
                                    HANYA HALAMAN TERAKHIR
                                ================================= */}

                                {isLastPage && (

                                    <section className="report-print-signature">

                                        <div className="report-print-signature-date">

                                            Kudus,{' '}

                                            {formatDate(
                                                new Date()
                                            )}

                                        </div>


                                        <div className="report-print-signature-grid">

                                            <div className="report-print-signature-box">

                                                <div>
                                                    Mengetahui,
                                                </div>


                                                <div className="signature-space">
                                                </div>


                                                <div>
                                                    (________________________)
                                                </div>

                                            </div>


                                            <div className="report-print-signature-box">

                                                <div>
                                                    Penimbang,
                                                </div>


                                                <div className="signature-space">
                                                </div>


                                                <div>

                                                    (
                                                    {
                                                        user?.name ||
                                                        '________________________'
                                                    }
                                                    )

                                                </div>

                                            </div>

                                        </div>

                                    </section>

                                )}


                                {/* =================================
                                    FOOTER
                                ================================= */}

                                <footer className="report-print-footer">
                                    Dicetak pada:{' '}
                                    {new Date().toLocaleString('id-ID')}
                                    {' — '}
                                    {import.meta.env.VITE_APP_NAME}
                                </footer>

                            </div>

                        );

                    }
                )}

            </div>

        </>

    );

}


// =========================================================
// REPORT HEADER
// =========================================================

function ReportHeader({
    target,
    formatDate,
}) {

    return (

        <>

            <header className="report-print-header">

                <div className="report-print-title">

                    LAPORAN PENIMBANGAN POS 1

                </div>


                <div className="report-print-subtitle">

                    HASIL PENIMBANGAN TEMBAKAU

                </div>

            </header>


            <section className="report-print-info">

                <div className="report-print-info-row">

                    <span>
                        Kode Batch
                    </span>

                    <strong>
                        {target.kode_batch || '-'}
                    </strong>

                </div>


                <div className="report-print-info-row">

                    <span>
                        Tanggal
                    </span>

                    <strong>

                        {formatDate(
                            target.tanggal
                        )}

                    </strong>

                </div>

            </section>

        </>

    );

}