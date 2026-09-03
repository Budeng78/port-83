import React, { useEffect, useState } from 'react';

const initialForm = {
    tanggal: '',
    nomor_aturan: '',
    jenis_tbk: '',
    s_k: '',
    jumlah_bal: '',
};

export default function Pos1TargetForm({
    data = null,
    loading = false,
    onSubmit,
    onCancel,
}) {
    const [form, setForm] = useState(initialForm);

    useEffect(() => {
        if (data) {
            setForm({
                tanggal: data.tanggal
                    ? data.tanggal.substring(0, 10)
                    : '',
                nomor_aturan: data.nomor_aturan ?? '',
                jenis_tbk: data.jenis_tbk ?? '',
                s_k: data.s_k ?? '',
                jumlah_bal: data.jumlah_bal ?? '',
            });
        } else {
            setForm(initialForm);
        }
    }, [data]);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        onSubmit?.({
            ...form,
            jumlah_bal: Number(form.jumlah_bal),
        });
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="rounded-lg border border-gray-200 bg-white p-5"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Tanggal
                    </label>

                    <input
                        type="date"
                        name="tanggal"
                        value={form.tanggal}
                        onChange={handleChange}
                        required
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Nomor Aturan
                    </label>

                    <input
                        type="text"
                        name="nomor_aturan"
                        value={form.nomor_aturan}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                </div>

                <div>
                    <label className="mb-1 block text-sm font-medium">
                        Jenis Tembakau
                    </label>

                    <input
                        type="text"
                        name="jenis_tbk"
                        value={form.jenis_tbk}
                        onChange={handleChange}
                        required
                        maxLength={100}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
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
                        required
                        maxLength={10}
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
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
                        required
                        min="1"
                        className="w-full rounded-md border border-gray-300 px-3 py-2"
                    />
                </div>
            </div>

            <div className="mt-5 flex justify-end gap-2">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={loading}
                        className="rounded-md border border-gray-300 px-4 py-2"
                    >
                        Batal
                    </button>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="rounded-md bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
                >
                    {loading
                        ? 'Menyimpan...'
                        : data
                          ? 'Perbarui Target'
                          : 'Simpan Target'}
                </button>
            </div>
        </form>
    );
}

