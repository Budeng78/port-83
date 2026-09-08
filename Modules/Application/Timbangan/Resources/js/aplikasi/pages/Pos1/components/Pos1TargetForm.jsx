
import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Trash2, Save, Loader2 } from 'lucide-react';
import pos1TargetService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/pos1TargetService.js';

// Enum disesuaikan persis dengan skema migration database
export const TYPE_ENUM = {
    KROSOK: 'krosok',
    PRECUT: 'precut',
};

export const STATUS_ENUM = {
    PENDING: 'pending',
    ACTIVE: 'active',
    FINISH: 'finish',
};

export default function Pos1TargetForm({
    isOpen,
    onClose,
    onSuccess,
    initialData,
    selectedDate,
}) {
    if (!isOpen) return null;

    const isEdit = Boolean(initialData?.id);

    const [formData, setFormData] = useState({
        tanggal: selectedDate || new Date().toISOString().split('T')[0],
        kode_batch: '',
        status: STATUS_ENUM.PENDING,
    });

    const [aturanList, setAturanList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [generatingCode, setGeneratingCode] = useState(false);
    const [errorMsg, setErrorMsg] = useState(''); // untuk display error detail

    const abortControllerRef = useRef(null);

    const createEmptyItem = () => ({
        jenis_tbk: '', // String biasa (bukan Enum)
        tahun: new Date().getFullYear().toString(),
        grade: '',
        s_k: '',
        type: TYPE_ENUM.KROSOK, // Enum ['krosok', 'precut']
        jumlah_bal: 0,
        tara: 0.0,
    });

    useEffect(() => {
        let isMounted = true;

        const initForm = async () => {
            const targetDate = initialData?.tanggal || selectedDate || new Date().toISOString().split('T')[0];

            if (isEdit) {
                setFormData({
                    tanggal: initialData.tanggal,
                    kode_batch: initialData.kode_batch || '',
                    status: initialData.status || STATUS_ENUM.PENDING,
                });
                setAturanList(initialData.aturan_list || initialData.aturanList || []);
            } else {
                setFormData({
                    tanggal: targetDate,
                    kode_batch: '',
                    status: STATUS_ENUM.PENDING,
                });

                setAturanList([
                    {
                        nomor_aturan: '',
                        items: [createEmptyItem()],
                    },
                ]);

                if (abortControllerRef.current) abortControllerRef.current.abort();
                abortControllerRef.current = new AbortController();

                setGeneratingCode(true);
                try {
                    const res = await pos1TargetService.generateBatchCode(targetDate, {
                        signal: abortControllerRef.current.signal,
                    });
                    if (isMounted) {
                        const newCode = res?.kode_batch || res?.data?.kode_batch || '';
                        setFormData((prev) => ({ ...prev, kode_batch: newCode }));
                    }
                } catch (err) {
                    if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                        console.error('Gagal auto generate kode batch:', err);
                    }
                } finally {
                    if (isMounted) setGeneratingCode(false);
                }
            }
        };

        if (isOpen) {
            initForm();
        }

        return () => {
            isMounted = false;
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [isOpen, initialData, selectedDate]);

    const handleDateChange = async (e) => {
        const newDate = e.target.value;
        setFormData((prev) => ({ ...prev, tanggal: newDate }));

        if (!isEdit) {
            if (abortControllerRef.current) abortControllerRef.current.abort();
            abortControllerRef.current = new AbortController();

            setGeneratingCode(true);
            try {
                const res = await pos1TargetService.generateBatchCode(newDate, {
                    signal: abortControllerRef.current.signal,
                });
                const newCode = res?.kode_batch || res?.data?.kode_batch || '';
                setFormData((prev) => ({ ...prev, kode_batch: newCode }));
            } catch (err) {
                if (err.name !== 'CanceledError' && err.name !== 'AbortError') {
                    console.error('Gagal update kode batch:', err);
                }
            } finally {
                setGeneratingCode(false);
            }
        }
    };

    const addAturan = () => {
        setAturanList((prev) => [
            ...prev,
            {
                nomor_aturan: '',
                items: [createEmptyItem()],
            },
        ]);
    };

    const removeAturan = (aIndex) => {
        if (aturanList.length === 1) return;
        setAturanList((prev) => prev.filter((_, idx) => idx !== aIndex));
    };

    const handleAturanChange = (aIndex, field, value) => {
        setAturanList((prev) =>
            prev.map((aturan, idx) =>
                idx === aIndex ? { ...aturan, [field]: value } : aturan
            )
        );
    };

    const addItem = (aIndex) => {
        setAturanList((prev) =>
            prev.map((aturan, idx) => {
                if (idx !== aIndex) return aturan;
                return {
                    ...aturan,
                    items: [...aturan.items, createEmptyItem()],
                };
            })
        );
    };

    const removeItem = (aIndex, iIndex) => {
        setAturanList((prev) =>
            prev.map((aturan, idx) => {
                if (idx !== aIndex || aturan.items.length === 1) return aturan;
                return {
                    ...aturan,
                    items: aturan.items.filter((_, itemIdx) => itemIdx !== iIndex),
                };
            })
        );
    };

    const handleItemChange = (aIndex, iIndex, field, value) => {
        setAturanList((prev) =>
            prev.map((aturan, idx) => {
                if (idx !== aIndex) return aturan;
                return {
                    ...aturan,
                    items: aturan.items.map((item, itemIdx) =>
                        itemIdx === iIndex ? { ...item, [field]: value } : item
                    ),
                };
            })
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setLoading(true);

        // Transformasi dari Nested ke Flat Array
        const flatItems = aturanList.flatMap((aturan) =>
            aturan.items.map((item) => ({
                kode_batch: formData.kode_batch,
                tanggal: formData.tanggal,
                nomor_aturan: aturan.nomor_aturan,
                jenis_tbk: item.jenis_tbk,
                tahun: item.tahun,
                grade: item.grade || '',
                s_k: item.s_k || '',
                type: item.type, // 'krosok' | 'precut'
                jumlah_bal: parseInt(item.jumlah_bal, 10) || 0,
                tara: parseFloat(item.tara) || 0,
                status: formData.status,
            }))
        );

        console.log('📤 Payload yang dikirim:', JSON.stringify(flatItems, null, 2));

        try {
            if (isEdit) {
                await pos1TargetService.update(initialData.id, flatItems[0]);
            } else {
                // Kirim sebagai array atau single object tergantung backend
                const payload = flatItems.length === 1 ? flatItems[0] : { items: flatItems };
                console.log('📤 Final Payload:', JSON.stringify(payload, null, 2));
                await pos1TargetService.create(payload);
            }

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            console.error('❌ Error Response:', error.response);
            
            let errorDetail = 'Gagal menyimpan target kerja';
            
            if (error.response?.status === 422) {
                // Validation Error
                const errors = error.response.data.errors;
                console.error('📋 Validation Errors:', errors);
                errorDetail = `Validasi Error: ${Object.values(errors).flat().join(', ')}`;
            } else if (error.response?.data?.message) {
                errorDetail = error.response.data.message;
            } else if (error.response?.status === 500) {
                errorDetail = 'Server Error 500 - Cek log backend';
            }
            
            setErrorMsg(errorDetail);
            console.error('🔴 Full Error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs overflow-y-auto">
            <div className="relative w-full max-w-4xl rounded-xl bg-white shadow-2xl border border-slate-200 my-8">
                
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
                    <h2 className="text-lg font-bold text-slate-800">
                        {isEdit ? 'Edit Target Kerja Pos 1' : 'Buat Target Kerja Pos 1 Baru'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Error Alert */}
                {errorMsg && (
                    <div className="px-6 pt-4">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-xs">
                            <strong>❌ Error:</strong> {errorMsg}
                        </div>
                    </div>
                )}

                {/* Form Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    {/* Header Inputs */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                value={formData.tanggal}
                                onChange={handleDateChange}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Kode Batch (Otomatis)
                            </label>
                            <div className="relative">
                                <input
                                    type="text"
                                    value={formData.kode_batch}
                                    readOnly
                                    placeholder={generatingCode ? 'Generating...' : 'Kode Batch'}
                                    className="w-full rounded-md border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-bold text-blue-900 focus:outline-none cursor-not-allowed"
                                />
                                {generatingCode && (
                                    <Loader2 className="absolute right-3 top-2.5 animate-spin text-blue-600" size={14} />
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">
                                Status
                            </label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value }))}
                                className="w-full rounded-md border border-slate-300 px-3 py-2 text-xs focus:border-blue-600 focus:outline-none capitalize"
                            >
                                {Object.values(STATUS_ENUM).map((statusVal) => (
                                    <option key={statusVal} value={statusVal}>
                                        {statusVal}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Aturan & Item Section */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-bold text-slate-700">Daftar Aturan & Detail Bal Tembakau</h3>
                            <button
                                type="button"
                                onClick={addAturan}
                                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:text-blue-900"
                            >
                                <Plus size={14} /> Tambah Aturan
                            </button>
                        </div>

                        {aturanList.map((aturan, aIndex) => (
                            <div key={aIndex} className="border border-slate-200 rounded-lg p-4 bg-white space-y-3">
                                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
                                    <div className="flex-1 max-w-xs">
                                        <input
                                            type="text"
                                            placeholder="Nomor Aturan (Contoh: AT-001)"
                                            value={aturan.nomor_aturan}
                                            onChange={(e) => handleAturanChange(aIndex, 'nomor_aturan', e.target.value)}
                                            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold focus:border-blue-600 focus:outline-none"
                                            required
                                        />
                                    </div>
                                    {aturanList.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeAturan(aIndex)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                            title="Hapus Aturan"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>

                                {/* Items Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left text-xs">
                                        <thead>
                                            <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
                                                <th className="p-2">Jenis Tbk</th>
                                                <th className="p-2 w-20">Tahun</th>
                                                <th className="p-2">Grade</th>
                                                <th className="p-2 w-20">S/K</th>
                                                <th className="p-2 w-28">Type</th>
                                                <th className="p-2 w-24">Jumlah Bal</th>
                                                <th className="p-2 w-24">Tara (kg)</th>
                                                <th className="p-2 w-10 text-center">#</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {aturan.items.map((item, iIndex) => (
                                                <tr key={iIndex}>
                                                    <td className="p-1">
                                                        <input
                                                            type="text"
                                                            placeholder="Jenis Tbk"
                                                            value={item.jenis_tbk}
                                                            onChange={(e) => handleItemChange(aIndex, iIndex, 'jenis_tbk', e.target.value)}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <input
                                                            type="text"
                                                            value={item.tahun}
                                                            onChange={(e) => handleItemChange(aIndex, iIndex, 'tahun', e.target.value)}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <input
                                                            type="text"
                                                            value={item.grade}
                                                            onChange={(e) => handleItemChange(aIndex, iIndex, 'grade', e.target.value)}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <input
                                                            type="text"
                                                            value={item.s_k}
                                                            onChange={(e) => handleItemChange(aIndex, iIndex, 's_k', e.target.value)}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <select
                                                            value={item.type}
                                                            onChange={(e) => handleItemChange(aIndex, iIndex, 'type', e.target.value)}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none capitalize"
                                                        >
                                                            {Object.entries(TYPE_ENUM).map(([key, value]) => (
                                                                <option key={key} value={value}>
                                                                    {value}
                                                                </option>
                                                            ))}
                                                        </select>
                                                    </td>
                                                    <td className="p-1">
                                                        <input
                                                            type="number"
                                                            value={item.jumlah_bal}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                handleItemChange(aIndex, iIndex, 'jumlah_bal', val === '' ? '' : Math.max(0, parseInt(val, 10) || 0));
                                                            }}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                                            min="0"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-1">
                                                        <input
                                                            type="number"
                                                            step="0.001"
                                                            value={item.tara}
                                                            onChange={(e) => {
                                                                const val = e.target.value;
                                                                handleItemChange(aIndex, iIndex, 'tara', val === '' ? '' : Math.max(0, parseFloat(val) || 0));
                                                            }}
                                                            className="w-full rounded border border-slate-300 px-2 py-1 text-xs focus:border-blue-600 focus:outline-none"
                                                            min="0"
                                                            required
                                                        />
                                                    </td>
                                                    <td className="p-1 text-center">
                                                        {aturan.items.length > 1 && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeItem(aIndex, iIndex)}
                                                                className="text-red-400 hover:text-red-600"
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => addItem(aIndex)}
                                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium pt-1"
                                >
                                    <Plus size={12} /> Tambah Item Tembakau
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading || generatingCode}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition disabled:opacity-50"
                        >
                            {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                            {loading ? 'Menyimpan...' : 'Simpan Target'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
