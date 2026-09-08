import React, { useEffect, useState } from 'react';

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
        if (data) {
            setForm({
                kode_batch: data.kode_batch ?? '',
                tanggal: data.tanggal ?? '',
                status: data.status ?? 'pending',
            });
        }
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
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1 block text-sm font-medium">
                    Kode Batch
                </label>

                <input
                    type="text"
                    name="kode_batch"
                    value={form.kode_batch}
                    onChange={handleChange}
                    className="w-full rounded border px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Tanggal
                </label>

                <input
                    type="date"
                    name="tanggal"
                    value={form.tanggal}
                    onChange={handleChange}
                    className="w-full rounded border px-3 py-2"
                    required
                />
            </div>

            <div>
                <label className="mb-1 block text-sm font-medium">
                    Status
                </label>

                <select
                    name="status"
                    value={form.status}
                    onChange={handleChange}
                    className="w-full rounded border px-3 py-2"
                >
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="finish">Finish</option>
                </select>
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading ? 'Menyimpan...' : 'Simpan'}
                </button>

                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded border px-4 py-2"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}