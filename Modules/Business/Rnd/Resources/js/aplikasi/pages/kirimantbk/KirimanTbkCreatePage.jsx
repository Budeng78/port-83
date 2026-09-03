import React, {
    useEffect,
    useState,
} from 'react';

import {
    ArrowLeft,
    Save,
} from 'lucide-react';

import {
    useNavigate,
    useParams,
} from 'react-router-dom';

import KirimanTbkService from '@Modules/Business/Rnd/Resources/js/aplikasi/services/kirimanTbkService.js';


// =====================================================
// COMPONENT
// =====================================================

export default function KirimanTbkCreatePage() {

    const navigate = useNavigate();

    const { aturanId } = useParams();

    const [aturan, setAturan] = useState(null);

    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState(null);

    const [form, setForm] = useState({
        no_surat_kiriman: '',
        nomor_kendaraan: '',
        nama_sopir: '',
        dari: '',
        details: [],
    });


    // =================================================
    // LOAD ATURAN
    // =================================================

    useEffect(() => {

        if (!aturanId) {
            setError('ID aturan tidak ditemukan.');
            return;
        }

        const loadAturan = async () => {

            try {

                setLoading(true);
                setError(null);

                const response =
                    await KirimanTbkService.getAturan(
                        aturanId
                    );

                const data = response?.data;

                setAturan(data);

                setForm({
                    no_surat_kiriman: '',
                    nomor_kendaraan: '',
                    nama_sopir: '',
                    dari: '',

                    details: (data?.details ?? []).map(
                        (detail) => ({
                            aturan_detail_id: detail.id,

                            type: 'Krosok',

                            jumlah_pack: '',

                            tara: '',

                            aturan_detail: detail,
                        })
                    ),
                });

            } catch (error) {

                console.error(
                    'Gagal mengambil aturan:',
                    error
                );

                setError(
                    error?.response?.data?.message
                    ?? 'Gagal mengambil data aturan.'
                );

            } finally {

                setLoading(false);

            }

        };

        loadAturan();

    }, [aturanId]);


    // =================================================
    // HEADER CHANGE
    // =================================================

    const handleChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((current) => ({
            ...current,
            [name]: value,
        }));

    };


    // =================================================
    // DETAIL CHANGE
    // =================================================

    const handleDetailChange = (
        index,
        field,
        value
    ) => {

        setForm((current) => {

            const details = [
                ...current.details,
            ];

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


    // =================================================
    // SUBMIT
    // =================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError(null);

            const payload = {
                no_surat_kiriman:
                    form.no_surat_kiriman,

                nomor_kendaraan:
                    form.nomor_kendaraan,

                nama_sopir:
                    form.nama_sopir,

                dari:
                    form.dari,

                details:
                    form.details.map(
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

        } catch (error) {

            console.error(
                'Gagal menyimpan kiriman:',
                error
            );

            setError(
                error?.response?.data?.message
                ?? 'Gagal menyimpan kiriman.'
            );

        } finally {

            setSaving(false);

        }

    };


    // =================================================
    // BACK
    // =================================================

    const handleBack = () => {

        navigate(
            `/app/rnd/tobacco-aturan/${aturanId}/kiriman`
        );

    };


    // =================================================
    // LOADING
    // =================================================

    if (loading) {

        return (
            <div className="flex min-h-[400px] items-center justify-center">

                <div className="text-sm text-gray-500">
                    Memuat data aturan...
                </div>

            </div>
        );

    }


    // =================================================
    // RENDER
    // =================================================

    return (
        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="flex items-start gap-3">

                <button
                    type="button"
                    onClick={handleBack}
                    title="Kembali"
                    className="mt-1 rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>

                    <h1 className="text-xl font-semibold text-gray-900">
                        Tambah Kiriman Tembakau
                    </h1>

                    <p className="mt-1 text-sm text-gray-500">
                        Input kiriman berdasarkan aturan tembakau
                    </p>

                </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

                <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>

            )}


            {/* =================================================
                INFORMASI ATURAN
            ================================================= */}

            {aturan && (

                <div className="rounded-lg border border-gray-200 bg-white p-5">

                    <div className="mb-4">

                        <h2 className="text-sm font-semibold text-gray-900">
                            Informasi Aturan
                        </h2>

                    </div>

                    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">

                        <div>
                            <div className="text-xs text-gray-500">
                                Kode Aturan
                            </div>

                            <div className="mt-1 text-sm font-medium text-gray-900">
                                {aturan.kode_aturan ?? '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">
                                Tanggal Aturan
                            </div>

                            <div className="mt-1 text-sm font-medium text-gray-900">
                                {aturan.tanggal_aturan ?? '-'}
                            </div>
                        </div>

                        <div>
                            <div className="text-xs text-gray-500">
                                Jumlah Detail
                            </div>

                            <div className="mt-1 text-sm font-medium text-gray-900">
                                {aturan.details?.length ?? 0}
                            </div>
                        </div>

                    </div>

                </div>

            )}


            {/* =================================================
                FORM
            ================================================= */}

            <form
                onSubmit={handleSubmit}
                className="space-y-6"
            >

                {/* =================================================
                    DATA KIRIMAN
                ================================================= */}

                <div className="rounded-lg border border-gray-200 bg-white p-5">

                    <div className="mb-5">

                        <h2 className="text-sm font-semibold text-gray-900">
                            Data Kiriman
                        </h2>

                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                        {/* NO SURAT */}

                        <div>

                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                No Surat Kiriman
                            </label>

                            <input
                                type="text"
                                name="no_surat_kiriman"
                                value={
                                    form.no_surat_kiriman
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                            />

                        </div>


                        {/* NOMOR KENDARAAN */}

                        <div>

                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Nomor Kendaraan
                            </label>

                            <input
                                type="text"
                                name="nomor_kendaraan"
                                value={
                                    form.nomor_kendaraan
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm uppercase outline-none focus:border-gray-500"
                            />

                        </div>


                        {/* SOPIR */}

                        <div>

                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Nama Sopir
                            </label>

                            <input
                                type="text"
                                name="nama_sopir"
                                value={
                                    form.nama_sopir
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                            />

                        </div>


                        {/* DARI */}

                        <div>

                            <label className="mb-1 block text-sm font-medium text-gray-700">
                                Dari
                            </label>

                            <input
                                type="text"
                                name="dari"
                                value={
                                    form.dari
                                }
                                onChange={
                                    handleChange
                                }
                                required
                                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none focus:border-gray-500"
                            />

                        </div>

                    </div>

                </div>


                {/* =================================================
                    DETAIL KIRIMAN
                ================================================= */}

                <div className="rounded-lg border border-gray-200 bg-white">

                    <div className="border-b border-gray-200 px-5 py-4">

                        <h2 className="text-sm font-semibold text-gray-900">
                            Detail Kiriman
                        </h2>

                    </div>


                    <div className="overflow-x-auto">

                        <table className="w-full min-w-[1100px] text-sm">

                            <thead className="bg-gray-50">

                                <tr className="border-b border-gray-200">

                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        No
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Gudang
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Jenis Tembakau
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Tahun
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        S/K
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Grade
                                    </th>

                                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                                        Rencana
                                    </th>

                                    <th className="px-4 py-3 text-left font-medium text-gray-600">
                                        Type
                                    </th>

                                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                                        Jumlah Pack
                                    </th>

                                    <th className="px-4 py-3 text-right font-medium text-gray-600">
                                        Tara
                                    </th>

                                </tr>

                            </thead>
                                <tbody>

                                    {form.details.length === 0 ? (

                                        <tr>
                                            <td
                                                colSpan="10"
                                                className="px-4 py-8 text-center text-sm text-gray-500"
                                            >
                                                Tidak ada detail aturan.
                                            </td>
                                        </tr>

                                    ) : (

                                        form.details.map(
                                            (item, index) => {

                                                const detail = item.aturan_detail;
                                                

                                                return (
                                                    <tr
                                                        key={item.aturan_detail_id}
                                                        className="border-b border-gray-100 last:border-0"
                                                    >

                                                        {/* NO */}
                                                        <td className="px-4 py-3 text-gray-500">
                                                            {index + 1}
                                                        </td>

                                                        {/* GUDANG */}
                                                        <td className="px-4 py-3 font-medium text-gray-900">
                                                            {detail?.gdg ?? '-'}
                                                        </td>

                                                        {/* JENIS TEMBAKAU */}
                                                        <td className="px-4 py-3">
                                                            {detail?.jenis_tembakau ?? '-'}
                                                        </td>

                                                        {/* TAHUN */}
                                                        <td className="px-4 py-3">
                                                            {detail?.tahun ?? '-'}
                                                        </td>

                                                        {/* S/K */}
                                                        <td className="px-4 py-3">
                                                            {detail?.s_k ?? '-'}
                                                        </td>

                                                        {/* GRADE */}
                                                        <td className="px-4 py-3">
                                                            {detail?.grade ?? '-'}
                                                        </td>

                                                        {/* RENCANA */}
                                                        <td className="px-4 py-3 text-right font-medium">
                                                            {detail?.rencana ?? '-'}
                                                        </td>

                                                        {/* TYPE */}
                                                        <td className="px-4 py-3">

                                                            <select
                                                                value={item.type}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'type',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                className="rounded-md border border-gray-300 px-2 py-2 text-sm outline-none focus:border-gray-500"
                                                            >
                                                                <option value="Krosok">
                                                                    Krosok
                                                                </option>

                                                                <option value="Precut">
                                                                    Precut
                                                                </option>
                                                            </select>

                                                        </td>

                                                        {/* JUMLAH PACK */}
                                                        <td className="px-4 py-3">

                                                            <input
                                                                type="number"
                                                                min="1"
                                                                value={item.jumlah_pack}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'jumlah_pack',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                required
                                                                className="w-28 rounded-md border border-gray-300 px-2 py-2 text-right text-sm outline-none focus:border-gray-500"
                                                            />

                                                        </td>

                                                        {/* TARA */}
                                                        <td className="px-4 py-3">

                                                            <input
                                                                type="number"
                                                                min="0"
                                                                step="0.001"
                                                                value={item.tara}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'tara',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                required
                                                                className="w-28 rounded-md border border-gray-300 px-2 py-2 text-right text-sm outline-none focus:border-gray-500"
                                                            />

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )

                                    )}

                                </tbody>

                        </table>

                    </div>

                </div>


                {/* =================================================
                    ACTION
                ================================================= */}

                <div className="flex justify-end gap-2">

                    <button
                        type="button"
                        onClick={handleBack}
                        disabled={saving}
                        className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={
                            saving ||
                            form.details.length === 0
                        }
                        className="inline-flex items-center gap-2 rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
                    >

                        <Save size={16} />

                        {saving
                            ? 'Menyimpan...'
                            : 'Simpan Kiriman'}

                    </button>

                </div>

            </form>

        </div>
    );
}