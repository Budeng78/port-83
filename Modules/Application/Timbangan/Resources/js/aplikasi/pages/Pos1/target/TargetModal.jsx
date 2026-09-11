import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import TargetPage from './TargetPage';

export default function TargetModal({
    open,
    onClose,
}) {
    useEffect(() => {
        if (!open) return;

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget) {
                    onClose();
                }
            }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" />

            {/* Modal */}
            <div className="relative z-10 flex max-h-[95vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl bg-slate-50 shadow-2xl">
                {/* Header Modal */}
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:px-5">
                    <div>
                        <h2 className="text-base font-semibold text-slate-900 md:text-lg">
                            Target Timbangan Pos 1
                        </h2>

                        <p className="text-xs text-slate-500">
                            Kelola target, aturan, dan detail target timbangan.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        title="Tutup"
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                    >
                        <X size={19} />
                    </button>
                </div>

                {/* Isi TargetPage */}
                <div className="overflow-y-auto">
                    <TargetPage />
                </div>
            </div>
        </div>
    );
}