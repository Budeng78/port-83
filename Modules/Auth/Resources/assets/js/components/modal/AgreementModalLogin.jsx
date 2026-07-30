import React from 'react';

export default function AgreementModalLogin({ isOpen, termData, userDetails, onSuccess, loading }) {
    if (!isOpen || !termData) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200">
                <div className="p-8">
                    {/* Menggunakan nama dari userDetails */}
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 italic lowercase">
                        halo pak {userDetails?.name || 'user parjos'},
                    </h3>
                    <p className="text-slate-500 text-sm mb-6 lowercase">
                        ada kebijakan baru yang perlu bapak setujui sebelum lanjut ke sistem.
                    </p>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 max-h-[300px] overflow-y-auto mb-6">
                        {/* PERBAIKAN: Gunakan nama kolom sesuai database Bapak */}
                        <div className="font-extrabold mb-2 text-blue-600 uppercase text-xs tracking-widest">
                            {termData.judul_kebijakan} 
                        </div>
                        <div className="whitespace-pre-line text-sm text-slate-600 leading-relaxed font-medium">
                            {termData.isi_kebijakan}
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
                            versi: {termData.versi_dokumen} | audit-id: {termData.id}
                        </div>
                    </div>

                    <button 
                        onClick={onSuccess} 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-slate-900 transition-all lowercase"
                    >
                        {loading ? 'memproses...' : 'saya setuju dengan kebijakan baru ini'}
                    </button>
                </div>
            </div>
        </div>
    );
}