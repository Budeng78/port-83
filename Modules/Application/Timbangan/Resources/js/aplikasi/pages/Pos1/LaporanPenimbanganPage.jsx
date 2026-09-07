import React, { useRef } from 'react';
import { DUMMY_REPORT_DATA } from './DUMMY_REPORT_DATA';

export default function LaporanPenimbanganLegal({ reportData = [], tanggal = '12 Mei 2026' }) {
    const printRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    const dataToRender = reportData.length > 0 ? reportData : DUMMY_REPORT_DATA;

    return (
        <div className="max-w-[900px] mx-auto p-4 bg-gray-100 min-h-screen print:max-w-none print:p-0 print:bg-white print:m-0">
            
            {/* ACTION BAR / NAVBAR KOMPONEN (Hanya muncul di webview) */}
            <div className="no-print flex justify-between items-center mb-4 bg-white p-4 rounded-xl shadow">
                <div>
                    <h1 className="text-base font-bold text-gray-800">Preview Laporan Penimbangan (F4/Folio Portrait 2 Kolom)</h1>
                    <p className="text-xs text-gray-500">Ukuran Kertas: 215.9 mm × 330 mm (Portrait)</p>
                </div>
                <button
                    type="button"
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow transition-colors flex items-center gap-2"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Cetak Laporan
                </button>
            </div>

            {/* AREA LAPORAN PRINT OUT */}
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
                <div className="grid grid-cols-2 gap-3 print:block print:columns-2 print:gap-2">
                    {dataToRender.map((target, targetIdx) => {
                        const taraValue = Number(target.tara) || 0;
                        const logs = target.details || [];

                        let totalBruto = 0;
                        let totalTara = 0;
                        let totalNeto = 0;

                        const processedDetails = Array.from({ length: target.target_bal }, (_, idx) => {
                            const noBal = idx + 1;
                            const item = logs.find((l) => Number(l.nomor_bal) === noBal);

                            const bruto = item ? Number(item.bruto) : 0;
                            const neto = item ? Math.max(0, bruto - taraValue) : 0;

                            if (bruto > 0) {
                                totalBruto += bruto;
                                totalTara += taraValue;
                                totalNeto += neto;
                            }

                            return {
                                nomor_bal: noBal,
                                bruto: item ? bruto : null,
                                tara: taraValue,
                                neto: item ? neto : null,
                                waktu: item?.waktu || '-'
                            };
                        });

                        return (
                            <div 
                                key={target.id || targetIdx} 
                                className={`block-target border border-gray-400 p-2 rounded print:border-gray-800 mb-3 print:mb-2 ${
                                    targetIdx === 0 ? 'no-print' : ''
                                }`}
                            >
                                {/* HEADER DETAIL TARGET */}
                                <div className="text-[9px] font-bold mb-1 flex justify-between bg-gray-50 px-1.5 py-0.5 border border-gray-800">
                                    <span>KODE: {target.kode}</span>
                                    <span>GDG: {target.gdg}</span>
                                    <span>TGL: {target.tgl}</span>
                                </div>

                                {/* TABEL SPESIFIKASI TEMBAKAU */}
                                <table className="w-full text-[9px] text-center border-collapse border border-gray-800 font-semibold mb-1.5">
                                    <thead>
                                        <tr className="bg-gray-100 uppercase border-b border-gray-800">
                                            <th className="border border-gray-800 py-0.5 px-0.5">TBK</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">THN</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">S.K</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">Grade</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">Bal</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">Tara</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr className="bg-white">
                                            <td className="border border-gray-800 py-0.5 px-0.5">{target.jenis_tbk}</td>
                                            <td className="border border-gray-800 py-0.5 px-0.5">{target.tahun}</td>
                                            <td className="border border-gray-800 py-0.5 px-0.5">{target.s_k}</td>
                                            <td className="border border-gray-800 py-0.5 px-0.5">{target.grade}</td>
                                            <td className="border border-gray-800 py-0.5 px-0.5 font-bold">{target.target_bal}</td>
                                            <td className="border border-gray-800 py-0.5 px-0.5">{taraValue.toFixed(2)}</td>
                                        </tr>
                                    </tbody>
                                </table>

                                <p className="text-[9px] font-bold text-gray-700 mb-0.5 uppercase">Hasil Timbangan</p>

                                {/* TABEL RINCIAN TIMBANGAN PER BAL */}
                                <table className="w-full text-[9px] text-center border-collapse border border-gray-800">
                                    <thead>
                                        <tr className="bg-gray-100 uppercase border-b border-gray-800 font-bold">
                                            <th className="border border-gray-800 py-0.5 px-0.5 w-6">No</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">Bruto</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">Tara</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5">Neto</th>
                                            <th className="border border-gray-800 py-0.5 px-0.5 w-12">Waktu</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedDetails.map((row) => (
                                            <tr key={row.nomor_bal} className="border-b border-gray-300">
                                                <td className="border border-gray-800 py-0.5 font-bold bg-gray-50">{row.nomor_bal}</td>
                                                <td className="border border-gray-800 py-0.5 text-right px-1 font-mono">
                                                    {row.bruto !== null ? row.bruto.toFixed(2) : '...'}
                                                </td>
                                                <td className="border border-gray-800 py-0.5 text-right px-1 font-mono">
                                                    {row.tara.toFixed(2)}
                                                </td>
                                                <td className="border border-gray-800 py-0.5 text-right px-1 font-mono font-bold">
                                                    {row.neto !== null ? row.neto.toFixed(2) : '...'}
                                                </td>
                                                <td className="border border-gray-800 py-0.5 font-mono text-gray-600 text-[8px]">
                                                    {row.waktu}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="bg-gray-100 font-extrabold border-t-2 border-gray-800">
                                            <td className="border border-gray-800 py-0.5 uppercase">TOT</td>
                                            <td className="border border-gray-800 py-0.5 text-right px-1 font-mono">
                                                {totalBruto > 0 ? totalBruto.toFixed(2) : '...'}
                                            </td>
                                            <td className="border border-gray-800 py-0.5 text-right px-1 font-mono">
                                                {totalTara > 0 ? totalTara.toFixed(2) : '...'}
                                            </td>
                                            <td className="border border-gray-800 py-0.5 text-right px-1 font-mono text-blue-900">
                                                {totalNeto > 0 ? totalNeto.toFixed(2) : '...'}
                                            </td>
                                            <td className="border border-gray-800 py-0.5"></td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        );
                    })}
                </div>

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

            {/* CSS LENGKAP UNTUK ISOLASI CETAK DAN PEMOTONGAN HALAMAN AUTOMATIS */}
            <style jsx>{`
                @media print {
                    @page {
                        size: 215.9mm 330mm; /* Ukuran Kertas F4/Folio Portrait */
                        margin: 10mm 8mm;
                    }

                    /* 1. Sembunyikan SELURUH isi dokumen terlebih dahulu (Sembunyikan Navbar, Layout Parent, dll) */
                    body * {
                        visibility: hidden !important;
                    }

                    /* 2. Hanya TAMPILKAN elemen .print-area dan seluruh turunannya */
                    .print-area, .print-area * {
                        visibility: visible !important;
                    }

                    /* 3. Atur posisi .print-area agar menempati paling atas halaman */
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

                    /* 4. Paksa sembunyikan elemen yang ber-class .no-print (termasuk Card 1 dan Navbar Komponen) */
                    .no-print, .no-print * {
                        display: none !important;
                        visibility: hidden !important;
                    }

                    /* 5. Pengaturan pemotongan halaman otomatis (Prevent break inside card) */
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