import React, { useEffect, useState } from 'react';

export default function TargetAturanDetailForm({
    data = null,
    targetAturanId,
    loading = false,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState({
        type: 'krosok',
        jenis_tbk: '',
        tahun: '',
        grade: '',
        s_k: '',
        jumlah_bal: '',
        berat_bruto: '',
        tara: '',
    });

    useEffect(() => {
        setForm({
            type: data?.type ?? 'krosok',
            jenis_tbk: data?.jenis_tbk ?? '',
            tahun: data?.tahun ?? '',
            grade: data?.grade ?? '',
            s_k: data?.s_k ?? '',
            jumlah_bal: data?.jumlah_bal ?? '',
            berat_bruto: data?.berat_bruto ?? '',
            tara: data?.tara ?? '',
        });
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

        onSubmit?.({
            ...form,
            target_aturan_id: targetAturanId,
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-lg border bg-white p-4"
        >
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Type
                    </label>

                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2"
                        required
                    >
                        <option value="krosok">
                            Krosok
                        </option>

                        <option value="precut">
                            Precut
                        </option>
                    </select>
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Jenis TBK
                    </label>

                    <input
                        type="text"
                        name="jenis_tbk"
                        value={form.jenis_tbk}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Tahun
                    </label>

                    <input
                        type="text"
                        name="tahun"
                        value={form.tahun}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Grade
                    </label>

                    <input
                        type="text"
                        name="grade"
                        value={form.grade}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        S/K
                    </label>

                    <input
                        type="text"
                        name="s_k"
                        value={form.s_k}
                        onChange={handleChange}
                        className="w-full rounded border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Jumlah Bal
                    </label>

                    <input
                        type="number"
                        name="jumlah_bal"
                        value={form.jumlah_bal}
                        onChange={handleChange}
                        min="0"
                        className="w-full rounded border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Berat Bruto
                    </label>

                    <input
                        type="number"
                        name="berat_bruto"
                        value={form.berat_bruto}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className="w-full rounded border px-3 py-2"
                        required
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Tara
                    </label>

                    <input
                        type="number"
                        name="tara"
                        value={form.tara}
                        onChange={handleChange}
                        step="0.001"
                        min="0"
                        className="w-full rounded border px-3 py-2"
                        required
                    />
                </div>
            </div>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={loading}
                    className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading
                        ? 'Menyimpan...'
                        : 'Simpan'}
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
