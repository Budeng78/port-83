import React, { useEffect, useState } from 'react';

import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

export default function TargetForm({
    data = null,
    loading = false,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState({
        kode_batch: '',
        tanggal: '',
        status: 'pending',
    });

    useEffect(() => {
        const loadForm = async () => {
            if (data) {
                setForm({
                    kode_batch: data.kode_batch ?? '',
                    tanggal: data.tanggal ?? '',
                    status: data.status ?? 'pending',
                });

                return;
            }

            try {
                const response = await axios.get(
                    '/timbangan/pos1/target/next-code'
                );

                setForm({
                    kode_batch: response.data.kode_batch ?? '',
                    tanggal: '',
                    status: 'pending',
                });
            } catch (error) {
                console.error(
                    'Gagal mengambil kode batch berikutnya:',
                    error
                );
            }
        };

        loadForm();
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit?.(form);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
            {/* Header */}
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-4 sm:px-6">
                <h3 className="text-sm font-semibold text-slate-800 sm:text-base">
                    {data ? 'Edit Target' : 'Tambah Target'}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                    Lengkapi data target sebelum disimpan.
                </p>
            </div>

            {/* Form */}
            <div className="grid grid-cols-1 gap-4 p-4 sm:p-6 md:grid-cols-2">

                    {/* Kode Batch */}
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-slate-700">
                            Kode Batch
                        </label>

                        <input
                            type="text"
                            name="kode_batch"
                            value={form.kode_batch || 'Memuat...'}
                            readOnly
                            className="w-full cursor-not-allowed rounded-lg border border-slate-200 bg-slate-100 px-3 py-2.5 text-sm font-mono font-semibold text-slate-600 outline-none"
                        />
                    </div>



                {/* Tanggal */}
                <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Tanggal
                    </label>

                    <input
                        type="date"
                        name="tanggal"
                        value={form.tanggal}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                    />
                </div>

                {/* Status */}
                <div className="md:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                        Status
                    </label>

                    <select
                        name="status"
                        value={form.status}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    >
                        <option value="pending">Pending</option>
                        <option value="active">Active</option>
                        <option value="finish">Finish</option>
                    </select>
                </div>
            </div>

            {/* Footer */}
            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50 px-4 py-4 sm:flex-row sm:justify-end sm:px-6">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    Batal
                </button>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>
            </div>
        </form>
    );
}