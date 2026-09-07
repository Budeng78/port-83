import React from 'react';
import { X, Layers, Calendar, Clock, FileText, Tag, CheckCircle2 } from 'lucide-react';

export default function Pos1TargetDetailModal({ isOpen, onClose, data }) {
    if (!isOpen || !data) return null;

    const formatDateToDMY = (dateString) => {
        if (!dateString) return '-';
        const cleanDate = String(dateString).substring(0, 10);
        const parts = cleanDate.split('-');
        if (parts.length !== 3) return dateString;
        const [year, month, day] = parts;
        return `${day}/${month}/${year}`;
    };

    const formatCreatedDateTime = (dateTimeString) => {
        if (!dateTimeString) return '-';
        const dateObj = new Date(dateTimeString);
        if (isNaN(dateObj.getTime())) return dateTimeString;

        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');

        return `${day}/${month}/${year} pukul ${hours}:${minutes}`;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
                
                {/* Modal Header */}
                <div className="bg-slate-50 px-5 py-4 border-b border-slate-200 flex items-center justify-between">
                    <div>
                        <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            DETAIL TARGET R&D
                        </span>
                        <h3 className="text-base font-mono font-bold text-blue-900">
                            {data.kode_batch || '-'}
                        </h3>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
                    
                    {/* Ringkasan Status & Batch Info */}
                    <div className="grid grid-cols-2 gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100/80">
                        <div>
                            <span className="text-[10px] font-medium text-slate-500 uppercase block">
                                Tanggal Dibuat
                            </span>
                            <span className="text-xs font-semibold text-slate-700">
                                {formatCreatedDateTime(data.created_at || data.tanggal_dibuat)}
                            </span>
                        </div>
                        <div>
                            <span className="text-[10px] font-medium text-slate-500 uppercase block">
                                Status Target
                            </span>
                            <span className="inline-block mt-0.5 text-[11px] font-bold uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                                {data.status || 'Pending'}
                            </span>
                        </div>
                    </div>

                    {/* Rincian Spesifikasi Tembakau */}
                    <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide border-b border-slate-100 pb-1">
                            Spesifikasi & Formula
                        </h4>

                        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                            <div>
                                <span className="text-slate-400 block text-[11px]">Nomor Aturan</span>
                                <span className="font-semibold text-slate-800">{data.nomor_aturan || '-'}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">Tgl Target Kerja</span>
                                <span className="font-semibold text-slate-800">{formatDateToDMY(data.tanggal)}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">Jenis TBK</span>
                                <span className="font-bold uppercase text-slate-800">{data.jenis_tbk || '-'}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">Tahun Panen/Produksi</span>
                                <span className="font-semibold text-slate-800">{data.tahun || '-'}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">Grade</span>
                                <span className="font-bold text-slate-800">{data.grade || '-'}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">S.K</span>
                                <span className="font-semibold text-slate-800">{data.s_k || '-'}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">Type</span>
                                <span className="font-bold uppercase text-slate-800">{data.type || '-'}</span>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[11px]">Jumlah Bal</span>
                                <span className="font-mono font-bold text-slate-900">{data.jumlah_bal ?? 0} Bal</span>
                            </div>

                            <div className="col-span-2 bg-slate-50 p-2.5 rounded border border-slate-100">
                                <span className="text-slate-400 block text-[11px]">Nilai Tara (Kg)</span>
                                <span className="font-mono font-bold text-slate-800 text-sm">
                                    {Number(data.tara ?? 0).toFixed(3)} Kg
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Modal Footer */}
                <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs rounded-lg transition"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}