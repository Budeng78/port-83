import React from 'react';

export default function HomeOverview() {
    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Selamat Datang di Dashboard Utama</h1>
                <p className="text-slate-500 mt-1 font-medium">Sistem manajemen operasional terintegrasi berbasis Laravel 12 dan React.</p>
            </div>
        </div>
    );
}