import React from 'react';

export default function Dashboard() {
    return (
        <div className="space-y-6">
            {/* Header Sambutan */}
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Dashboard Utama</h1>
                    <p className="text-slate-500 text-sm mt-1">Sistem informasi operasional PT SWI berjalan normal.</p>
                </div>
                <div className="px-4 py-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-wider">
                    Node Active
                </div>
            </div>

            {/* Grid Statistik / Ringkasan */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status Modul</p>
                    <h3 className="text-2xl font-black text-slate-900 mt-2">Core & Dashboard Siap</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Koneksi Database</p>
                    <h3 className="text-2xl font-black text-emerald-600 mt-2">Terhubung</h3>
                </div>
                <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sesi Pengguna</p>
                    <h3 className="text-2xl font-black text-blue-600 mt-2">Aktif (Sanctum)</h3>
                </div>
            </div>
        </div>
    );
}