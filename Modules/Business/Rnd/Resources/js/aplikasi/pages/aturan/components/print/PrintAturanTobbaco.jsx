import React, { useEffect, useState } from 'react';
import { tobaccoAturanService } from '../../../../services/tobaccoAturanService.js';

const formatNumber = (value) => {
    if (value === undefined || value === null || value === '') {
        return '-';
    }

    const num = Number(value);

    if (Number.isNaN(num)) {
        return value;
    }

    return num.toLocaleString('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

const formatDate = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(date);
};

const formatDateLong = (value) => {
    if (!value) return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return '-';
    }

    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(date);
};

export default function AturanTobbaco() {
    const [aturan, setAturan] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const id = window.location.pathname
                    .split('/')
                    .filter(Boolean)
                    .pop();

                const response =
                    await tobaccoAturanService.getById(id);

                setAturan(response?.data?.data ?? null);
            } catch (error) {
                console.error(
                    'Gagal mengambil data aturan:',
                    error
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    useEffect(() => {
        if (!loading && aturan) {
            const timer = setTimeout(() => {
                window.print();
            }, 500);

            return () => clearTimeout(timer);
        }
    }, [loading, aturan]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Menyiapkan dokumen...
            </div>
        );
    }

    if (!aturan) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                Data aturan tidak ditemukan.
            </div>
        );
    }

    const details = Array.isArray(aturan.details)
        ? aturan.details
        : [];

    return (
        <div className="aturan-tobacco-print">
            <style>{`
                @page {
                    size: A4 landscape;
                    margin: 12mm;
                }

                * {
                    box-sizing: border-box;
                }

                html,
                body {
                    margin: 0;
                    padding: 0;
                    background: #ffffff;
                }

                .aturan-tobacco-print {
                    width: 100%;
                    min-height: 100vh;
                    background: #ffffff;
                    color: #000000;
                    font-family: Arial, Helvetica, sans-serif;
                    font-size: 11px;
                    line-height: 1.3;
                }

                .print-header {
                    margin-bottom: 20px;
                    text-align: center;
                }

                .print-header h1 {
                    margin: 0;
                    font-size: 15px;
                    font-weight: bold;
                }

                .print-header p {
                    margin: 4px 0 0;
                    font-size: 13px;
                }

                .print-master {
                    margin-bottom: 12px;
                }

                .print-master-table {
                    border-collapse: collapse;
                }

                .print-master-table td {
                    padding: 2px 4px;
                    border: none;
                    vertical-align: top;
                }

                .print-master-label {
                    width: 70px;
                }

                .print-detail-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 40px;
                }

                .print-detail-table th,
                .print-detail-table td {
                    border: 1px solid #000;
                    padding: 4px 6px;
                    font-size: 10px;
                }

                .print-detail-table th {
                    font-weight: bold;
                    text-align: center;
                    background: #fff;
                }

                .print-center {
                    text-align: center;
                }

                .print-right {
                    text-align: right;
                }

                .print-left {
                    text-align: left;
                }

                .print-signatures {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-end;
                    margin-top: 30px;
                    padding: 0 40px;
                }

                .sig-box {
                    min-width: 150px;
                    text-align: center;
                }

                .sig-space {
                    height: 60px;
                }

                @media print {
                    html,
                    body {
                        width: 100%;
                        margin: 0 !important;
                        padding: 0 !important;
                    }

                    .aturan-tobacco-print {
                        display: block;
                        width: 100%;
                    }

                    .print-detail-table {
                        page-break-inside: auto;
                    }

                    .print-detail-table tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    .print-detail-table thead {
                        display: table-header-group;
                    }
                }
            `}</style>

            {/* HEADER */}
            <div className="print-header">
                <h1>
                    Dokumen Pembuatan Aturan Tembakau
                </h1>

                <p>
                    Dan sebagai dokumen persetujuan
                    pemakaian Tembakau
                </p>
            </div>

            {/* MASTER */}
            <div className="print-master">
                <table className="print-master-table">
                    <tbody>
                        <tr>
                            <td className="print-master-label">
                                Kode
                            </td>

                            <td>
                                {aturan.kode_aturan || '-'}
                            </td>
                        </tr>

                        <tr>
                            <td className="print-master-label">
                                tgl order
                            </td>

                            <td>
                                {formatDate(
                                    aturan.tanggal_aturan
                                )}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* DETAIL */}
            <table className="print-detail-table">
                <thead>
                    <tr>
                        <th style={{ width: '4%' }}>NO</th>
                        <th style={{ width: '6%' }}>GDG</th>
                        <th style={{ width: '12%' }}>
                            JENIS TBK
                        </th>
                        <th style={{ width: '6%' }}>THN</th>
                        <th style={{ width: '10%' }}>S.K</th>
                        <th style={{ width: '8%' }}>
                            GRADE
                        </th>
                        <th style={{ width: '6%' }}>
                            Ball
                        </th>
                        <th style={{ width: '6%' }}>
                            tara
                        </th>
                        <th style={{ width: '8%' }}>
                            bruto
                        </th>
                        <th style={{ width: '8%' }}>
                            netto
                        </th>
                        <th style={{ width: '14%' }}>
                            status
                        </th>
                        <th style={{ width: '12%' }}>
                            Action
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {details.length === 0 ? (
                        <tr>
                            <td
                                colSpan={12}
                                className="print-center"
                            >
                                Tidak ada detail data.
                            </td>
                        </tr>
                    ) : (
                        details.map((detail, index) => (
                            <tr
                                key={
                                    detail.id ?? index
                                }
                            >
                                <td className="print-center">
                                    {index + 1}
                                </td>

                                <td className="print-center">
                                    {detail.gdg || '-'}
                                </td>

                                <td className="print-left">
                                    {detail.jenis_tembakau ||
                                        '-'}
                                </td>

                                <td className="print-center">
                                    {detail.tahun || '-'}
                                </td>

                                <td className="print-center">
                                    {detail.s_k || '-'}
                                </td>

                                <td className="print-left">
                                    {detail.grade || '-'}
                                </td>

                                <td className="print-right">
                                    {detail.ball ?? '-'}
                                </td>

                                <td className="print-right">
                                    {formatNumber(
                                        detail.tara
                                    )}
                                </td>

                                <td className="print-right">
                                    {formatNumber(
                                        detail.bruto
                                    )}
                                </td>

                                <td className="print-right">
                                    {formatNumber(
                                        detail.netto
                                    )}
                                </td>

                                <td className="print-center">
                                    {detail.status || '-'}
                                </td>

                                <td className="print-center">
                                    {detail.action || '-'}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* SIGNATURE */}
            <div className="print-signatures">
                <div className="sig-box">
                    <div>Approval</div>
                    <div className="sig-space"></div>
                </div>

                <div className="sig-box">
                    <div>Kabag. RND</div>
                    <div className="sig-space"></div>
                </div>

                <div className="sig-box">
                    <div>
                        Kudus{' '}
                        {formatDateLong(
                            aturan.tanggal_aturan
                        )}
                    </div>

                    <div className="sig-space"></div>

                    <div>
                        {aturan.user || '-'}
                    </div>
                </div>
            </div>
        </div>
    );
}
