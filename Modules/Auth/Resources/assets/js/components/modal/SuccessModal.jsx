import React from 'react';

const SuccessModal = ({ isOpen, onClose, title, message }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-emerald-50 overflow-hidden transform animate-in zoom-in-95 duration-200">
                <div className="p-8 text-center">
                    {/* Icon Success dengan Animasi Ping */}
                    <div className="relative w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-6 mx-auto">
                        <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-100 opacity-75 animate-ping"></span>
                        <span className="text-4xl relative">✅</span>
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-900 mb-2 lowercase italic">
                        {title || 'berhasil, pak!'}
                    </h3>
                    
                    <p className="text-slate-500 font-medium mb-8 lowercase">
                        {message || 'data bapak sudah kami proses dengan aman.'}
                    </p>

                    <div className="flex flex-col gap-3">
                    <button 
                        onClick={onClose} // Ini nanti kita hubungkan ke fungsi "Setuju"
                        className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 transition-all active:scale-95 lowercase"
                    >
                        saya setuju & lanjutkan
                    </button>
                    
                    <button 
                        onClick={() => window.location.reload()} // Jika tidak setuju, refresh halaman
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-2xl font-bold transition-all lowercase"
                    >
                        saya tidak setuju
                    </button>
                </div>
                </div>
            </div>
        </div>
    );
};

export default SuccessModal;