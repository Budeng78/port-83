
import React, { useRef, useState, useEffect } from 'react';

export default function LaporanPenimbanganLegal({ 
    reportData = [], 
    tanggal = '12 Mei 2026',
    selectedMonth = '2026-09',
    onLoadData 
}) {
    const printRef = useRef();
    const [allData, setAllData] = useState([]);
    const [groupedData, setGroupedData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedBatches, setSelectedBatches] = useState([]);

    // Group data by kode_batch
    const groupByBatch = (rawData) => {
        const grouped = {};

        rawData.forEach(item => {
            if (!grouped[item.kode_batch]) {
                grouped[item.kode_batch] = {
                    kode_batch: item.kode_batch,
                    tanggal: item.tanggal,
                    status: item.status,
                    items: []
                };
            }
            grouped[item.kode_batch].items.push({
                nomor_aturan: item.nomor_aturan,
                jenis_tbk: item.jenis_tbk,
                tahun: item.tahun,
                grade: item.grade,
                s_k: item.s_k,
                type: item.type,
                jumlah_bal: item.jumlah_bal,
                tara: item.tara
            });
        });

        return Object.values(grouped);
    };

    useEffect(() => {
        if (onLoadData && typeof onLoadData === 'function') {
            setLoading(true);
            onLoadData(selectedMonth)
                .then(result => {
                    const raw = result || [];
                    const grouped = groupByBatch(raw);
                    setAllData(raw);
                    setGroupedData(grouped);
                    setFilteredData(grouped);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('Error loading data:', err);
                    setAllData([]);
                    setGroupedData([]);
                    setFilteredData([]);
                    setLoading(false);
                });
        } else if (reportData.length > 0) {
            const grouped = groupByBatch(reportData);
            setAllData(reportData);
            setGroupedData(grouped);
            setFilteredData(grouped);
        }
    }, [reportData, selectedMonth, onLoadData]);

    const handlePrint = () => {
        window.print();
    };

    const handleBatchChange = (e) => {
        const selected = Array.from(e.target.selectedOptions, option => option.value);
        setSelectedBatches(selected);

        if (selected.length === 0) {
            setFilteredData(groupedData);
        } else {
            setFilteredData(groupedData.filter(batch => selected.includes(batch.kode_batch)));
        }
    };

    const uniqueBatches = groupedData.sort((a, b) => 
        a.kode_batch.localeCompare(b.kode_batch)
    );

    const dataToRender = filteredData.length > 0 ? filteredData : groupedData;

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="max-w-[900px] mx-auto p-4 bg-gray-100 min-h-screen">
                <div className="bg-white p-8 rounded-xl shadow text-center">
                    <p className="text-gray-500">Loading data laporan...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[900px] mx-auto p-4 bg-gray-100 min-h-screen print:max-w-none print:p-0 print:bg-white print:m-0">
            
            {/* ACTION BAR */}
            <div className="no-print flex flex-col gap-4 mb-4 bg-white p-4 rounded-xl shadow">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-base font-bold text-gray-800">Preview Laporan Penimbangan (F4/Folio Portrait 2 Kolom)</h1>
                        <p className="text-xs text-gray-500 mt-1">Ukuran Kertas: 215.9 mm × 330 mm (Portrait)</p>
                    </div>
                    <button
                        type="button"
                        onClick={handlePrint}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center gap-2 shrink-0"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Cetak Laporan
                    </button>
                </div>

                {/* Batch Selection */}
                <div className="border-t pt-4">
                    <label className="block text-sm font-semibold text-gray-800 mb-2">
                        Pilih Batch Target Kerja
                    </label>
                    <select
                        multiple
                        value={selectedBatches}
                        onChange={handleBatchChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        size={Math.min(uniqueBatches.length, 8)}
                    >
                        {uniqueBatches.map((batch) => (
                            <option key={batch.kode_batch} value={batch.kode_batch}>
                                {batch.kode_batch} - {formatDate(batch.tanggal)} ({batch.items.length} item)
                            </option>
                        ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-2">
                        💡 Gunakan Ctrl+Click untuk pilih multiple batch. Total: {uniqueBatches.length} | Terpilih: {selectedBatches.length} | Ditampilkan: {dataToRender.length}
                    </p>
                </div>
            </div>

            {/* AREA LAPORAN */}
            <div 
                ref={printRef} 
                className="print-area bg-white p-4 rounded-xl shadow-lg print:shadow-none print:p-0 print:m-0 text-gray-900 font-sans"
            >
                {/* HEADER LAPORAN */}
                <div className="border-b-2 border-gray-800 pb-1.5 mb-3 text-center">
                    <h2 className="text-base font-extrabold uppercase tracking-wide">
                        LAPORAN PENIMBANGAN PER KARUNG / BAL
                    </h2>
                    <p className="text-[10px] font-semibold mt-0.5">
                        Tanggal : <span className="font-bold">{tanggal}</span>
                    </p>
                </div>

                {/* LAYOUT 2 KOLOM */}
                {dataToRender.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        <p>Tidak ada data untuk ditampilkan</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 print:block print:columns-2 print:gap-2">
                        {dataToRender.map((batch, batchIdx) => (
                            <div 
                                key={batch.kode_batch} 
                                className="block-target border border-gray-400 p-2 rounded print:border-gray-800 mb-3 print:mb-2"
                            >
                                {/* HEADER DETAIL TARGET */}
                                <div className="text-[9px] font-bold mb-1 flex justify-between bg-gray-50 px-1.5 py-0.5 border border-gray-800">
                                    <span>BATCH: {batch.kode_batch}</span>
                                    <span>TGL: {formatDate(batch.tanggal)}</span>
                                    <span>STATUS: {batch.status}</span>
                                </div>

                                {/* ITEMS DALAM BATCH */}
                                <div className="space-y-2 mb-2">
                                    {batch.items.map((item, itemIdx) => (
                                        <div key={itemIdx} className="border border-gray-300 p-1.5 bg-gray-50 text-[8px]">
                                            {/* TABEL SPESIFIKASI TEMBAKAU */}
                                            <table className="w-full text-[8px] text-center border-collapse border border-gray-700 font-semibold mb-1">
                                                <thead>
                                                    <tr className="bg-gray-100 uppercase border-b border-gray-700">
                                                        <th className="border border-gray-700 py-0.5 px-0.5">TBK</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">THN</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">S.K</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">Grade</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">Type</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">Bal</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">Tara</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr className="bg-white">
                                                        <td className="border border-gray-700 py-0.5 px-0.5">{item.jenis_tbk}</td>
                                                        <td className="border border-gray-700 py-0.5 px-0.5">{item.tahun}</td>
                                                        <td className="border border-gray-700 py-0.5 px-0.5">{item.s_k}</td>
                                                        <td className="border border-gray-700 py-0.5 px-0.5">{item.grade}</td>
                                                        <td className="border border-gray-700 py-0.5 px-0.5">{item.type}</td>
                                                        <td className="border border-gray-700 py-0.5 px-0.5 font-bold">{item.jumlah_bal}</td>
                                                        <td className="border border-gray-700 py-0.5 px-0.5">{Number(item.tara).toFixed(3)}</td>
                                                    </tr>
                                                </tbody>
                                            </table>

                                            <p className="text-[7px] font-bold text-gray-700 uppercase mb-0.5">
                                                Aturan: {item.nomor_aturan}
                                            </p>

                                            {/* TABEL RINCIAN TIMBANGAN PER BAL */}
                                            <table className="w-full text-[7px] text-center border-collapse border border-gray-700">
                                                <thead>
                                                    <tr className="bg-gray-100 uppercase border-b border-gray-700 font-bold">
                                                        <th className="border border-gray-700 py-0.5 px-0.5 w-5">No</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">Bruto</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">Tara</th>
                                                        <th className="border border-gray-700 py-0.5 px-0.5">Neto</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {Array.from({ length: item.jumlah_bal }, (_, idx) => (
                                                        <tr key={idx} className="border-b border-gray-300">
                                                            <td className="border border-gray-700 py-0.5 font-bold bg-gray-50">{idx + 1}</td>
                                                            <td className="border border-gray-700 py-0.5 text-right px-0.5 font-mono">-</td>
                                                            <td className="border border-gray-700 py-0.5 text-right px-0.5 font-mono">{Number(item.tara).toFixed(3)}</td>
                                                            <td className="border border-gray-700 py-0.5 text-right px-0.5 font-mono">-</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* TANDA TANGAN */}
                <div className="mt-4 hidden print:grid grid-cols-3 text-center text-[9px] font-semibold block-target">
                    <div>
                        <p>Petugas Timbang</p>
                        <div className="h-8"></div>
                        <p className="underline font-bold">( ............................ )</p>
                    </div>
                    <div>
                        <p>Mandor / Supervisor</p>
                        <div className="h-8"></div>
                        <p className="underline font-bold">( ............................ )</p>
                    </div>
                    <div>
                        <p>Petugas Administrasi</p>
                        <div className="h-8"></div>
                        <p className="underline font-bold">( ............................ )</p>
                    </div>
                </div>

            </div>

            {/* GLOBAL PRINT STYLES */}
            <style>{`
                @media print {
                    @page {
                        size: 215.9mm 330mm;
                        margin: 10mm 8mm;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    .print-area, .print-area * {
                        visibility: visible !important;
                    }

                    .print-area {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 100% !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        box-shadow: none !important;
                        background: transparent !important;
                    }

                    .no-print, .no-print * {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    .block-target {
                        break-inside: avoid !important;
                        page-break-inside: avoid !important;
                        -webkit-column-break-inside: avoid !important;
                    }

                    body {
                        background-color: white !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    table th, table td {
                        padding-top: 0.5px !important;
                        padding-bottom: 0.5px !important;
                    }
                }
            `}</style>

        </div>
    );
}
