import React, { useState, useEffect } from 'react';

export default function UserManagement() {
    const [loading, setLoading] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manajemen Pengguna</h1>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 font-bold text-slate-700">Daftar Akun Pengguna / Karyawan</div>
                <div className="p-8 text-slate-400 text-sm font-medium">
                    Modul tabel data pengguna siap dihubungkan ke API *backend*.
                </div>
            </div>
        </div>
    );
}