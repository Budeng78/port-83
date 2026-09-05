import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import pos1TargetService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/pos1TargetService.js';

export default function Pos1TargetForm({ isOpen, onClose, onSuccess, initialData = null, selectedDate }) {
    // Helper untuk memotong tanggal ISO menjadi YYYY-MM-DD murni
    const formatToInputDate = (dateVal) => {
        if (!dateVal) return new Date().toISOString().split('T')[0];
        // Jika bertipe ISO String (contoh: 2026-09-04T00:00:00.000000Z), ambil 10 karakter awal
        return String(dateVal).substring(0, 10);
    };

    const today = formatToInputDate(new Date().toISOString());

    const [formData, setFormData] = useState({
        tanggal: formatToInputDate(selectedDate) || today,
        nomor_aturan: '',
        jenis_tbk: '',
        s_k: '',
        jumlah_bal: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formErrors, setFormErrors] = useState({});

    // Populate form data jika dalam mode EDIT, atau reset jika MODE CREATE
    useEffect(() => {
        if (initialData) {
            setFormData({
                tanggal: formatToInputDate(initialData.tanggal) || today,
                nomor_aturan: initialData.nomor_aturan || '',
                jenis_tbk: initialData.jenis_tbk || '',
                s_k: initialData.s_k || '',
                jumlah_bal: initialData.jumlah_bal || '',
            });
        } else {
            setFormData({
                tanggal: formatToInputDate(selectedDate) || today,
                nomor_aturan: '',
                jenis_tbk: '',
                s_k: '',
                jumlah_bal: '',
            });
        }
        setFormErrors({});
    }, [initialData, selectedDate, isOpen, today]);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setFormErrors({});

        try {
            if (initialData?.id) {
                await pos1TargetService.update(initialData.id, formData);
            } else {
                await pos1TargetService.create(formData);
            }
            onSuccess();
            onClose();
        } catch (error) {
            if (error.response && error.response.status === 422) {
                setFormErrors(error.response.data.errors || {});
            } else {
                console.error('Gagal menyimpan target:', error);
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs">
            <div className="w-full max-w-md rounded-xl bg-white shadow-xl overflow-hidden border border-slate-200">
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50">
                    <h3 className="text-sm font-bold text-slate-800">
                        {initialData?.id ? 'Edit Target Kerja R&D' : 'Tambah Target Kerja R&D Baru'}
                    </h3>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-5 space-y-4">
                    {/* Tanggal */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Tanggal Kerja</label>
                        <input
                            type="date"
                            value={formData.tanggal}
                            onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none"
                            required
                        />
                        {formErrors.tanggal && <p className="text-[11px] text-rose-600 mt-1">{formErrors.tanggal[0]}</p>}
                    </div>

                    {/* Nomor Aturan */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Nomor Aturan</label>
                        <input
                            type="text"
                            placeholder="Contoh: 01/spc13/2026"
                            value={formData.nomor_aturan}
                            onChange={(e) => setFormData({ ...formData, nomor_aturan: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none"
                            required
                        />
                        {formErrors.nomor_aturan && <p className="text-[11px] text-rose-600 mt-1">{formErrors.nomor_aturan[0]}</p>}
                    </div>

                    {/* Jenis TBK & S.K */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">Jenis TBK</label>
                            <input
                                type="text"
                                placeholder="Contoh: TUR"
                                value={formData.jenis_tbk}
                                onChange={(e) => setFormData({ ...formData, jenis_tbk: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none uppercase"
                                required
                            />
                            {formErrors.jenis_tbk && <p className="text-[11px] text-rose-600 mt-1">{formErrors.jenis_tbk[0]}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-1">S.K</label>
                            <input
                                type="text"
                                placeholder="Contoh: 29 PAS 25"
                                value={formData.s_k}
                                onChange={(e) => setFormData({ ...formData, s_k: e.target.value })}
                                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none"
                                required
                            />
                            {formErrors.s_k && <p className="text-[11px] text-rose-600 mt-1">{formErrors.s_k[0]}</p>}
                        </div>
                    </div>

                    {/* Jumlah Bal */}
                    <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Jumlah Bal (Target)</label>
                        <input
                            type="number"
                            min="1"
                            placeholder="Masukkan jumlah bal"
                            value={formData.jumlah_bal}
                            onChange={(e) => setFormData({ ...formData, jumlah_bal: e.target.value })}
                            className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:border-blue-600 focus:outline-none font-mono"
                            required
                        />
                        {formErrors.jumlah_bal && <p className="text-[11px] text-rose-600 mt-1">{formErrors.jumlah_bal[0]}</p>}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 rounded-lg border border-slate-300 hover:bg-slate-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-900 rounded-lg hover:bg-blue-950 transition disabled:opacity-50"
                        >
                            {isSubmitting && <Loader2 className="animate-spin" size={14} />}
                            {initialData?.id ? 'Simpan Perubahan' : 'Simpan Target'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}