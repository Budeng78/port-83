import React, {
    useEffect,
    useState,
} from 'react';

import {
    ArrowLeft,
    Save,
    RefreshCw,
} from 'lucide-react';

import {
    useNavigate,
    useParams,
} from 'react-router-dom';

import KirimanTbkService from '@Modules/Business/Rnd/Resources/js/aplikasi/services/kirimanTbkService.js';

export default function KirimanTbkCreatePage() {

    const navigate = useNavigate();

    const { aturanId } = useParams();

    const [aturan, setAturan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        no_surat_kiriman: '',
        nomor_kendaraan: '',
        nama_sopir: '',
        dari: '',
        details: [],
    });


    // =====================================================
    // LOAD ATURAN
    // =====================================================

    useEffect(() => {

        const loadAturan = async () => {

            if (!aturanId) {
                return;
            }

            try {

                setLoading(true);
                setError('');

                const response =
                    await KirimanTbkService.getAturan(
                        aturanId
                    );

                const data =
                    response?.data ?? response;

                setAturan(data);

                const details =
                    Array.isArray(data?.details)
                        ? data.details
                        : [];

                setForm((current) => ({
                    ...current,
                    details: details.map((detail) => ({
                        aturan_detail_id: detail.id,
                        type: '',
                        jumlah_pack: '',
                        tara: '',
                        aturan_detail: detail,
                    })),
                }));

            } catch (err) {

                console.error(
                    'Gagal mengambil aturan:',
                    err
                );

                setError(
                    err?.response?.data?.message
                    ?? 'Gagal mengambil data aturan.'
                );

            } finally {

                setLoading(false);

            }

        };

        loadAturan();

    }, [aturanId]);


    // =====================================================
    // CHANGE HEADER
    // =====================================================

    const handleChange = (field, value) => {

        setForm((current) => ({
            ...current,
            [field]: value,
        }));

    };


    // =====================================================
    // CHANGE DETAIL
    // =====================================================

    const handleDetailChange = (
        index,
        field,
        value
    ) => {

        setForm((current) => {

            const details = [...current.details];

            details[index] = {
                ...details[index],
                [field]: value,
            };

            return {
                ...current,
                details,
            };

        });

    };


    // =====================================================
    // SUBMIT
    // =====================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError('');

            const payload = {
                no_surat_kiriman:
                    form.no_surat_kiriman,

                nomor_kendaraan:
                    form.nomor_kendaraan,

                nama_sopir:
                    form.nama_sopir,

                dari:
                    form.dari,

                details: form.details.map(
                    (detail) => ({
                        aturan_detail_id:
                            detail.aturan_detail_id,

                        type:
                            detail.type,

                        jumlah_pack:
                            Number(
                                detail.jumlah_pack
                            ),

                        tara:
                            Number(
                                detail.tara
                            ),
                    })
                ),
            };

            await KirimanTbkService.create(
                aturanId,
                payload
            );

            navigate(
                `/app/rnd/tobacco-aturan/${aturanId}/kiriman`
            );

        } catch (err) {

            console.error(
                'Gagal menyimpan kiriman:',
                err
            );

            setError(
                err?.response?.data?.message
                ?? 'Gagal menyimpan kiriman.'
            );

        } finally {

            setSaving(false);

        }

    };


    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="flex items-center gap-2 text-sm text-slate-500">

                    <RefreshCw
                        size={17}
                        className="animate-spin"
                    />

                    Memuat aturan...

                </div>

            </div>
        );

    }


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="space-y-6">

            {/* HEADER */}

            <div className="flex items-start gap-3">

                <button
                    type="button"
                    onClick={() =>
                        navigate(-1)
                    }
                    className="mt-1 rounded-md p-2 text-gray-500 hover:bg-gray-100"
                    title="Kembali"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>

                    <h1 className="text-xl font-semibold text-gray-900">
                        Tambah Kiriman Tembakau
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        {aturan?.kode_aturan
                            ?? 'Aturan Tembakau'}
                    </p>

                </div>

            </div>


            {/* ERROR */}

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}


            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                {/* =================================================
                    INFORMASI KIRIMAN
                ================================================== */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-4">

                        <h2 className="font-semibold text-slate-800">
                            Informasi Kiriman
                        </h2>

                    </div>


                    <div className="grid gap-4 p-5 md:grid-cols-2">

                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                No. Surat Kiriman
                            </label>

                            <input
                                type="text"
                                value={
                                    form.no_surat_kiriman
                                }
                                onChange={(e) =>
                                    handleChange(
                                        'no_surat_kiriman',
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />

                        </div>


                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Nomor Kendaraan
                            </label>

                            <input
                                type="text"
                                value={
                                    form.nomor_kendaraan
                                }
                                onChange={(e) =>
                                    handleChange(
                                        'nomor_kendaraan',
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm uppercase focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />

                        </div>


                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Nama Sopir
                            </label>

                            <input
                                type="text"
                                value={
                                    form.nama_sopir
                                }
                                onChange={(e) =>
                                    handleChange(
                                        'nama_sopir',
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />

                        </div>


                        <div>

                            <label className="mb-1.5 block text-sm font-medium text-slate-700">
                                Dari
                            </label>

                            <input
                                type="text"
                                value={form.dari}
                                onChange={(e) =>
                                    handleChange(
                                        'dari',
                                        e.target.value
                                    )
                                }
                                required
                                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                            />

                        </div>

                    </div>

                </section>


                {/* =================================================
                    DETAIL ATURAN
                ================================================== */}

                <section className="rounded-xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-200 px-5 py-4">

                        <h2 className="font-semibold text-slate-800">
                            Detail Tembakau
                        </h2>

                        <p className="mt-1 text-sm text-slate-500">
                            Detail diambil dari aturan yang dipilih.
                        </p>

                    </div>


                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[900px] border-collapse text-sm">

                            <thead className="bg-slate-100">

                                <tr className="text-xs font-bold uppercase tracking-wide text-slate-600">

                                    <th className="border border-slate-300 px-3 py-2.5 text-center">
                                        No
                                    </th>

                                    <th className="border border-slate-300 px-3 py-2.5 text-left">
                                        Gudang
                                    </th>

                                    <th className="border border-slate-300 px-3 py-2.5 text-left">
                                        Jenis Tembakau
                                    </th>

                                    <th className="border border-slate-300 px-3 py-2.5 text-center">
                                        Tahun
                                    </th>

                                    <th className="border border-slate-300 px-3 py-2.5 text-center">
                                        S/K
                                    </th>

                                    <th className="border border-slate-300 px-3 py-2.5 text-center">
                                        Grade
                                    </th>

                                    <th className="border border-slate-300 px-3 py-2.5 text-center">
                                        Rencana
                                    </th>

                                    <th className="w-36 border border-slate-300 px-3 py-2.5 text-center">
                                        Type
                                    </th>

                                    <th className="w-32 border border-slate-300 px-3 py-2.5 text-center">
                                        Jumlah Pack
                                    </th>

                                    <th className="w-32 border border-slate-300 px-3 py-2.5 text-center">
                                        Tara
                                    </th>

                                </tr>

                            </thead>


                            <tbody>

                                {form.details.map(
                                    (detail, index) => {

                                        const aturanDetail =
                                            detail.aturan_detail;

                                        return (
                                            <tr
                                                key={
                                                    detail.aturan_detail_id
                                                }
                                                className="text-slate-700"
                                            >

                                                <td className="border border-slate-300 px-3 py-2 text-center">
                                                    {index + 1}
                                                </td>

                                                <td className="border border-slate-300 px-3 py-2">
                                                    {aturanDetail?.gudang
                                                        ?? '-'}
                                                </td>

                                                <td className="border border-slate-300 px-3 py-2">
                                                    {aturanDetail?.jenis_tembakau
                                                        ?? '-'}
                                                </td>

                                                <td className="border border-slate-300 px-3 py-2 text-center">
                                                    {aturanDetail?.tahun
                                                        ?? '-'}
                                                </td>

                                                <td className="border border-slate-300 px-3 py-2 text-center">
                                                    {aturanDetail?.s_k
                                                        ?? '-'}
                                                </td>

                                                <td className="border border-slate-300 px-3 py-2 text-center">
                                                    {aturanDetail?.grade
                                                        ?? '-'}
                                                </td>

                                                <td className="border border-slate-300 px-3 py-2 text-right font-semibold">
                                                    {aturanDetail?.rencana
                                                        ?? 0}
                                                </td>


                                                {/* TYPE */}

                                                <td className="border border-slate-300 px-2 py-2">

                                                    <select
                                                        value={
                                                            detail.type
                                                        }
                                                        onChange={(e) =>
                                                            handleDetailChange(
                                                                index,
                                                                'type',
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm focus:border-indigo-500 focus:outline-none"
                                                    >

                                                        <option value="">
                                                            Pilih
                                                        </option>

                                                        <option value="Krosok">
                                                            Krosok
                                                        </option>

                                                        <option value="Precut">
                                                            Precut
                                                        </option>

                                                    </select>

                                                </td>


                                                {/* JUMLAH PACK */}

                                                <td className="border border-slate-300 px-2 py-2">

                                                    <input
                                                        type="number"
                                                        min="1"
                                                        value={
                                                            detail.jumlah_pack
                                                        }
                                                        onChange={(e) =>
                                                            handleDetailChange(
                                                                index,
                                                                'jumlah_pack',
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-right text-sm focus:border-indigo-500 focus:outline-none"
                                                    />

                                                </td>


                                                {/* TARA */}

                                                <td className="border border-slate-300 px-2 py-2">

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        step="0.001"
                                                        value={
                                                            detail.tara
                                                        }
                                                        onChange={(e) =>
                                                            handleDetailChange(
                                                                index,
                                                                'tara',
                                                                e.target.value
                                                            )
                                                        }
                                                        required
                                                        className="w-full rounded-md border border-slate-300 px-2 py-2 text-right text-sm focus:border-indigo-500 focus:outline-none"
                                                    />

                                                </td>

                                            </tr>
                                        );

                                    }
                                )}

                            </tbody>

                        </table>

                    </div>

                </section>


                {/* =================================================
                    ACTION
                ================================================== */}

                <div className="flex justify-end gap-2">

                    <button
                        type="button"
                        onClick={() =>
                            navigate(-1)
                        }
                        disabled={saving}
                        className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        Batal
                    </button>


                    <button
                        type="submit"
                        disabled={
                            saving ||
                            form.details.length === 0
                        }
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        {saving ? (
                            <RefreshCw
                                size={16}
                                className="animate-spin"
                            />
                        ) : (
                            <Save size={16} />
                        )}

                        {saving
                            ? 'Menyimpan...'
                            : 'Simpan Kiriman'}

                    </button>

                </div>

            </form>

        </div>
    );
}