// resources/js/aplikasi/components/modal/PendingRegister.jsx

import React from 'react';

export default function PendingRegister({ isOpen, onClose, message }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl text-center border-b-8 border-amber-500 animate-in zoom-in duration-200">
                {/* Icon Animasi Jam Pasir/Tunggu */}
                <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>

                {/* Judul Modal */}
                <h3 className="text-xl font-black text-slate-900 mb-2 lowercase italic">
                    sedang diverifikasi...
                </h3>

                {/* Pesan Dinamis dari Backend */}
                <p className="text-slate-500 text-sm mb-6 leading-relaxed lowercase font-medium">
                    {message || 'akun bapak masih menunggu persetujuan admin prototype. mohon bersabar ya pak!'}
                </p>

                {/* Tombol Tutup */}
                <button 
                    onClick={onClose}
                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-600 shadow-slate-200 transition-all lowercase active:scale-95"
                >
                    siap pak, saya tunggu
                </button>
                
                {/* Footer Kecil (Opsional) */}
                <p className="mt-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    project prototype system
                </p>
            </div>
        </div>
    );
}