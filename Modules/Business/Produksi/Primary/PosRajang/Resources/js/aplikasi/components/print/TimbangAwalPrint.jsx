import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Timbangawal } from '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/services/Timbangawal';

export default function TimbangAwalPrint() {

    const { id } = useParams();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [dokumen, setDokumen] = useState(null);
    const [details, setDetails] = useState([]);
    const [ringkasan, setRingkasan] = useState(null);

    // =====================================================
    // FETCH DATA
    // =====================================================

    useEffect(() => {

        const fetchData = async () => {

            try {

                const data = await Timbangawal.getDetail(id);

                if (!data.success) {
                    setError(data.message || 'Gagal memuat data.');
                    setLoading(false);
                    return;
                }

                setDokumen(data.data?.dokumen_timbang_awal || null);
                setDetails(data.data?.details || []);
                setRingkasan(data.data?.ringkasan || null);
                setLoading(false);

            } catch (err) {
                setError(
                    err.response?.data?.message ||
                    err.message ||
                    'Gagal memuat data.'
                );
                setLoading(false);
            }
        };

        fetchData();

    }, [id]);

    // =====================================================
    // AUTO PRINT SETELAH DATA SIAP
    // =====================================================

    useEffect(() => {

        if (!loading && dokumen) {

            const timer = setTimeout(() => {
                window.print();
            }, 400);

            return () => clearTimeout(timer);
        }

    }, [loading, dokumen]);

    // =====================================================
    // LOADING / ERROR
    // =====================================================

    if (loading) {
        return <div className="p-8 text-center">Memuat data...</div>;
    }

    if (error || !dokumen) {
        return (
            <div className="p-8 text-center text-red-600">
                {error || 'Dokumen tidak ditemukan.'}
            </div>
        );
    }

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="print-page">

            <style>{`
                @media print {
                    @page {
                        size: legal;
                        margin: 4cm 2cm 5cm 2cm;
                    }

                    body * {
                        visibility: hidden;
                    }

                    .print-page,
                    .print-page * {
                        visibility: visible;
                    }

                    .print-page {
                        position: absolute;
                        top: 0;
                        left: 0;
                        width: 100%;
                    }

                    .no-print {
                        display: none !important;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                }

                @media screen {
                    .print-page {
                        background: #e5e7eb;
                        min-height: 100vh;
                        padding: 24px;
                    }
                    .print-sheet {
                        background: white;
                        max-width: 21cm;
                        min-height: 29.7cm;
                        margin: 0 auto;
                        padding: 1.5cm;
                        box-shadow: 0 0 8px rgba(0,0,0,0.15);
                    }
                }

                .print-sheet {
                    font-family: Arial, Helvetica, sans-serif;
                    color: #111;
                    font-size: 12px;
                }

                .print-header {
                    text-align: center;
                    border-bottom: 2px solid #111;
                    padding-bottom: 8px;
                    margin-bottom: 16px;
                }

                .print-header h1 {
                    font-size: 16px;
                    font-weight: bold;
                    margin: 0;
                }

                .print-header p {
                    font-size: 11px;
                    color: #555;
                    margin: 2px 0 0;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 4px 24px;
                    margin-bottom: 16px;
                }

                .info-row {
                    display: flex;
                    font-size: 12px;
                }

                .info-label {
                    width: 90px;
                    color: #555;
                }

                .info-value {
                    font-weight: bold;
                }

                table.tally-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 16px;
                }

                table.tally-table th,
                table.tally-table td {
                    border: 1px solid #999;
                    padding: 4px 8px;
                    font-size: 11px;
                }

                table.tally-table th {
                    background: #f3f4f6;
                    text-align: left;
                }

                table.tally-table td.num {
                    text-align: right;
                }

                .total-row td {
                    font-weight: bold;
                    background: #f9fafb;
                }

                .signature-section {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 16px;
                    margin-top: 48px;
                    text-align: center;
                    font-size: 11px;
                }

                .signature-box {
                    display: flex;
                    flex-direction: column;
                }

                .signature-space {
                    height: 64px;
                }

                .signature-line {
                    border-top: 1px solid #111;
                    margin-top: 4px;
                    padding-top: 4px;
                }
            `}</style>

            <div className="print-sheet">

                {/* HEADER */}
                <div className="print-header">
                    <h1>Laporan Timbang Awal</h1>
                    <p>Pos Rajang - Produksi</p>
                </div>

                {/* INFO DOKUMEN */}
                <div className="info-grid">

                    <div className="info-row">
                        <span className="info-label">No</span>
                        <span>: <span className="info-value">{dokumen.no}</span></span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">No. WO</span>
                        <span>: <span className="info-value">{dokumen.no_wo}</span></span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">Jenis</span>
                        <span>: <span className="info-value">{dokumen.jenis}</span></span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">S/K</span>
                        <span>: <span className="info-value">{dokumen.s_k}</span></span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">Tara</span>
                        <span>: <span className="info-value">{dokumen.tara}</span></span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">Jumlah Bal</span>
                        <span>: <span className="info-value">{dokumen.jumlah_bal}</span></span>
                    </div>

                    <div className="info-row">
                        <span className="info-label">Status</span>
                        <span>: <span className="info-value">{dokumen.status}</span></span>
                    </div>

                </div>

                {/* TABEL TALLY */}
                <table className="tally-table">
                    <thead>
                        <tr>
                            <th style={{ width: '40px' }}>No</th>
                            <th>Waktu Timbang</th>
                            <th className="num">Berat Bruto (Kg)</th>
                            <th className="num">Tara (Kg)</th>
                            <th className="num">Berat Netto (Kg)</th>
                        </tr>
                    </thead>
                    <tbody>
                        {details.map(item => (
                            <tr key={item.nomor_tally}>
                                <td>{item.nomor_tally}</td>
                                <td>{item.waktu_timbang}</td>
                                <td className="num">{Number(item.berat_bruto).toFixed(2)}</td>
                                <td className="num">{Number(item.tara).toFixed(2)}</td>
                                <td className="num">{Number(item.berat_netto).toFixed(2)}</td>
                            </tr>
                        ))}

                        <tr className="total-row">
                            <td colSpan={2}>
                                Total ({ringkasan?.jumlah_tally ?? details.length} tally)
                            </td>
                            <td className="num">
                                {Number(ringkasan?.total_bruto || 0).toFixed(2)}
                            </td>
                            <td className="num">
                                {Number(ringkasan?.total_tara || 0).toFixed(2)}
                            </td>
                            <td className="num">
                                {Number(ringkasan?.total_netto || 0).toFixed(2)}
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* TANDA TANGAN */}
                <div className="signature-section">

                    <div className="signature-box">
                        <span>Ditimbang oleh,</span>
                        <div className="signature-space" />
                        <div className="signature-line">( .......................... )</div>
                    </div>

                    <div className="signature-box">
                        <span>Diperiksa oleh,</span>
                        <div className="signature-space" />
                        <div className="signature-line">( .......................... )</div>
                    </div>

                    <div className="signature-box">
                        <span>Disetujui oleh,</span>
                        <div className="signature-space" />
                        <div className="signature-line">( .......................... )</div>
                    </div>

                </div>

                {/* TOMBOL PRINT (TIDAK IKUT TERCETAK) */}
                <div className="no-print" style={{ marginTop: 24, textAlign: 'center' }}>
                    <button
                        onClick={() => window.print()}
                        style={{
                            padding: '8px 24px',
                            background: '#2563eb',
                            color: 'white',
                            border: 'none',
                            borderRadius: 8,
                            fontWeight: 'bold',
                            cursor: 'pointer'
                        }}
                    >
                        🖨 Cetak Ulang
                    </button>
                </div>

            </div>

        </div>
    );
}