import React from 'react';

export default function AgreementModalRegister({ isOpen, termData, onAgree, onCancel, loading }) {
    // Pastikan modal tidak muncul jika tidak terbuka atau data belum siap
    if (!isOpen || !termData) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl animate-in zoom-in duration-200 overflow-hidden">
                <div className="p-8">
                    <h3 className="text-2xl font-bold text-slate-900 mb-2 italic">syarat & ketentuan daftar</h3>
                    <p className="text-slate-500 text-[13px] mb-6 lowercase">mohon baca kebijakan layanan kami sebelum menyelesaikan pendaftaran pak.</p>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 max-h-[300px] overflow-y-auto mb-6">
                        {/* Mapping sesuai kolom database Bapak */}
                        <div className="font-extrabold mb-3 text-blue-600 uppercase text-xs tracking-widest">
                            {termData.judul_kebijakan || 'judul tidak ditemukan'}
                        </div>
                        
                        <div className="whitespace-pre-line text-sm text-slate-600 leading-relaxed font-medium">
                            {termData.isi_kebijakan || 'isi kebijakan kosong'}
                        </div>

                        {/* Menampilkan Versi Dokumen untuk Audit */}
                        <div className="mt-4 pt-4 border-t border-slate-200 text-[10px] text-slate-400 font-bold uppercase">
                            versi: {termData.versi_dokumen} | id: {termData.id}
                        </div>
                    </div>

                    <div className="flex gap-3">
                        <button 
                            onClick={onCancel} 
                            type="button"
                            className="flex-1 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors lowercase"
                        >
                            batal
                        </button>
                        <button 
                            onClick={onAgree} 
                            disabled={loading}
                            type="button"
                            className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:bg-slate-300 transition-all lowercase"
                        >
                            {loading ? 'memproses...' : 'setuju & daftar'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}