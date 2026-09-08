import React, { useEffect, useState } from 'react';

export default function TargetAturanForm({
    data = null,
    targetId,
    loading = false,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState({
        target_id: targetId ?? '',
        nomor_aturan: '',
    });

    useEffect(() => {
        setForm({
            target_id: targetId ?? '',
            nomor_aturan: data?.nomor_aturan ?? '',
        });
    }, [data, targetId]);

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
            className="space-y-4 rounded-lg border bg-white p-4"
        >
            <div>
                <label className="mb-1 block text-sm font-medium">
                    Nomor Aturan
                </label>

                <input
                    type="text"
                    name="nomor_aturan"
                    value={form.nomor_aturan}
                    onChange={handleChange}
                    className="w-full rounded border px-3 py-2"
                    required
                />
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