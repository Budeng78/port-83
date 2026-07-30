import React from 'react';

const ErrorModal = ({ isOpen, onClose, title, message, errors }) => {
    if (!isOpen) return null;

    return (
        // Overlay (Background luar)
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            
            {/* Modal Card - Glassmorphic design disamakan dengan Workflow Node */}
            <div className="relative bg-white/70 backdrop-blur-xl border border-white/40 w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                
                {/* Header */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-start">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                            {title || 'ADA KENDALA, PAK!'}
                        </h2>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            Primary
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-900 p-2 rounded-full hover:bg-white/50 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>

                {/* Body Content */}
                <div className="px-8 pb-8">
                    {/* Pesan Error */}
                    <div className="flex items-center gap-4 mb-6 bg-white/50 p-4 rounded-2xl border border-white/50">
                        <span className="text-2xl">⚠️</span>
                        <p className="text-sm font-semibold text-slate-700">
                            {message || 'Mohon maaf, sistem tidak dapat memproses permintaan Bapak saat ini.'}
                        </p>
                    </div>

                    {/* Detail Error (Jika ada) */}
                    {errors && (
                        <div className="bg-white/40 border border-white/50 rounded-2xl p-4 mb-6 space-y-2 max-h-40 overflow-y-auto">
                            {Object.entries(errors).map(([key, value]) => (
                                <div key={key} className="flex gap-2 text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                    <span>•</span>
                                    <span>{Array.isArray(value) ? value[0] : value}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Button Action */}
                    <button
                        onClick={onClose}
                        className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-wider hover:bg-slate-800 transition-all active:scale-95 shadow-lg"
                    >
                        Mengerti
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ErrorModal;