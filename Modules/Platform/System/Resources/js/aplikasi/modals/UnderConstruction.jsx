import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function UnderConstruction() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6">
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm max-w-md w-full text-center">
                {/* Ilustrasi atau Icon Sederhana */}
                <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
                    🚧
                </div>
                
                <h2 className="text-xl font-bold text-slate-800 mb-2">Halaman Dalam Tahap Pengembangan</h2>
                <p className="text-sm text-slate-500 mb-6">
                    Maaf, fitur atau halaman yang Anda akses belum tersedia atau sedang dalam proses pembuatan.
                </p>

                <button
                    onClick={() => navigate('app/Dashboard')}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl transition-all shadow-sm"
                >
                    OK, Kembali ke Dashboard
                </button>
            </div>
        </div>
    );
}