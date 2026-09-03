import React, { useEffect, useState } from 'react';
import { X, Plus, Trash2 } from 'lucide-react';

import { tobaccoAturanService } from '../../../../services/tobaccoAturanService.js';

const createEmptyDetail = () => ({
    type: 'krosok',
    gdg: '',
    jenis_tembakau: '',
    tahun: new Date().getFullYear(),
    s_k: '',
    grade: '',
    rencana: '',
});

const initialFormState = {
    id: null,
    kode_aturan: '',
    tanggal_aturan: '',
    details: [createEmptyDetail()],
};

export default function TobaccoAturanModal({
    mode = 'create',
    aturan = null,
    onClose,
    onSuccess,
    topNavbarHeight = 64,
    bottomNavbarHeight = 60,
}) {
    const [formData, setFormData] = useState(initialFormState);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isView = mode === 'view';
    const isEdit = mode === 'edit';

    // =========================================================
    // LOAD DATA
    // =========================================================

    useEffect(() => {
        if (aturan) {
            setFormData({
                id: aturan.id ?? null,

                kode_aturan:
                    aturan.kode_aturan ?? '',

                tanggal_aturan:
                    aturan.tanggal_aturan
                        ? String(aturan.tanggal_aturan).substring(0, 10)
                        : '',

                details:
                    Array.isArray(aturan.details) &&
                    aturan.details.length > 0
                        ? aturan.details.map((detail) => ({
                            id: detail.id ?? null,

                            type: detail.type ?? 'krosok',

                            gdg: detail.gdg ?? '',

                            jenis_tembakau:
                                detail.jenis_tembakau ?? '',

                            tahun:
                                detail.tahun ??
                                new Date().getFullYear(),

                            s_k: detail.s_k ?? '',

                            grade: detail.grade ?? '',

                            rencana: detail.rencana ?? '',
                        }))
                        : [createEmptyDetail()],
            });

            return;
        }

        setFormData({
            ...initialFormState,
            tanggal_aturan:
                new Date().toISOString().substring(0, 10),
            details: [createEmptyDetail()],
        });

        setError('');
    }, [aturan, mode]);

    // =========================================================
    // HEADER CHANGE
    // =========================================================

    const handleHeaderChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value,
        }));
    };

    // =========================================================
    // DETAIL CHANGE
    // =========================================================

    const handleDetailChange = (
        index,
        field,
        value
    ) => {
        setFormData((prev) => ({
            ...prev,
            details: prev.details.map(
                (detail, detailIndex) =>
                    detailIndex === index
                        ? {
                            ...detail,
                            [field]: value,
                        }
                        : detail
            ),
        }));
    };

    // =========================================================
    // ADD DETAIL
    // =========================================================

    const handleAddDetail = () => {
        setFormData((prev) => ({
            ...prev,
            details: [
                ...prev.details,
                createEmptyDetail(),
            ],
        }));
    };

    // =========================================================
    // REMOVE DETAIL
    // =========================================================

    const handleRemoveDetail = (index) => {
        setFormData((prev) => {
            if (prev.details.length <= 1) {
                return prev;
            }

            return {
                ...prev,
                details: prev.details.filter(
                    (_, detailIndex) =>
                        detailIndex !== index
                ),
            };
        });
    };

    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (isView) {
            return;
        }

        try {
            setLoading(true);
            setError('');

            let response;

            if (isEdit) {
                response =
                    await tobaccoAturanService.update(
                        formData.id,
                        formData
                    );
            } else {
                response =
                    await tobaccoAturanService.create(
                        formData
                    );
            }

            onSuccess?.(
                response?.message ||
                (
                    isEdit
                        ? 'Aturan tembakau berhasil diperbarui.'
                        : 'Aturan tembakau berhasil ditambahkan.'
                )
            );

        } catch (err) {
            console.error(
                'Gagal menyimpan aturan tembakau:',
                err
            );

            setError(
                err.response?.data?.message ||
                'Terjadi kesalahan saat menyimpan aturan tembakau.'
            );

        } finally {
            setLoading(false);
        }
    };

    // =========================================================
    // TOTAL RENCANA
    // =========================================================

    const totalRencana =
        formData.details.reduce(
            (total, detail) =>
                total +
                (Number(detail.rencana) || 0),
            0
        );

    // =========================================================
    // FORMAT NUMBER
    // =========================================================

    const formatNumber = (value) => {
        return Number(value || 0).toLocaleString(
            'id-ID',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };

    // =========================================================
    // TITLE
    // =========================================================

    const title = isView
        ? 'Detail Aturan Tembakau'
        : isEdit
            ? 'Edit Aturan Tembakau'
            : 'Tambah Aturan Tembakau';

    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="aturan-tobacco-modal fixed inset-x-0 bottom-20 top-16 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4">

            <div className="flex max-h-full w-full max-w-7xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl">

                {/* HEADER */}

                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6 sm:py-4">

                    <div className="min-w-0">

                        <h2 className="truncate text-lg font-bold text-slate-800">
                            {title}
                        </h2>

                        <p className="mt-1 text-xs text-slate-500">
                            Pengaturan aturan bahan baku tembakau
                        </p>

                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="ml-3 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>

                </div>

                {/* FORM */}

                <form
                    onSubmit={handleSubmit}
                    className="flex min-h-0 flex-1 flex-col"
                >

                    {/* CONTENT */}

                    <div className="min-h-0 flex-1 overflow-y-auto bg-slate-50 px-3 py-4 sm:px-5 lg:px-6">

                        {/* ERROR */}

                        {error && (
                            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">

                                <div className="flex items-start justify-between gap-3">

                                    <p className="text-sm text-red-700">
                                        {error}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => setError('')}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        ×
                                    </button>

                                </div>

                            </div>
                        )}

                        {/* MASTER */}

                        <div className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">

                                <h3 className="text-sm font-bold text-slate-800">
                                    Informasi Aturan
                                </h3>

                                <p className="mt-0.5 text-xs text-slate-500">
                                    Data utama dokumen aturan tembakau.
                                </p>

                            </div>

                            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">

                                {/* KODE */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Kode Aturan
                                    </label>

                                    <input
                                        type="text"
                                        value={formData.kode_aturan}
                                        onChange={(event) =>
                                            handleHeaderChange(
                                                'kode_aturan',
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            isView ||
                                            loading
                                        }
                                        required
                                        placeholder="Contoh: ATB-001"
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-mono outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
                                    />

                                </div>

                                {/* TANGGAL */}

                                <div>

                                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-600">
                                        Tanggal Aturan
                                    </label>

                                    <input
                                        type="date"
                                        value={formData.tanggal_aturan}
                                        onChange={(event) =>
                                            handleHeaderChange(
                                                'tanggal_aturan',
                                                event.target.value
                                            )
                                        }
                                        disabled={
                                            isView ||
                                            loading
                                        }
                                        required
                                        className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-100"
                                    />

                                </div>

                            </div>

                        </div>

                        {/* DETAIL */}

                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                            {/* DETAIL HEADER */}

                            <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">

                                <div>

                                    <div className="flex items-center gap-2">

                                        <h3 className="text-sm font-bold text-slate-800">
                                            Detail Aturan
                                        </h3>

                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-bold text-indigo-700">
                                            {formData.details.length} detail
                                        </span>

                                    </div>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Komposisi bahan baku dan rencana kebutuhan.
                                    </p>

                                </div>

                                {!isView && (
                                    <button
                                        type="button"
                                        onClick={handleAddDetail}
                                        disabled={loading}
                                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-3 text-xs font-bold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <Plus size={15} />
                                        Tambah Detail
                                    </button>
                                )}

                            </div>

                            {/* DESKTOP EXCEL TABLE */}

                            <div className="hidden md:block">

                                <div className="overflow-x-auto">

                                    <table className="w-full min-w-[1000px] border-collapse text-xs">

                                        <thead>

                                            <tr className="border-b border-slate-300 bg-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-600">

                                                <th className="w-14 border-r border-slate-300 px-2 py-2.5 text-center">
                                                    No
                                                </th>

                                                <th className="w-28 border-r border-slate-300 px-2 py-2.5 text-left">
                                                    Type
                                                </th>

                                                <th className="w-24 border-r border-slate-300 px-2 py-2.5 text-left">
                                                    GDG
                                                </th>

                                                <th className="min-w-[210px] border-r border-slate-300 px-2 py-2.5 text-left">
                                                    Jenis Tembakau
                                                </th>

                                                <th className="w-24 border-r border-slate-300 px-2 py-2.5 text-center">
                                                    Tahun
                                                </th>

                                                <th className="w-20 border-r border-slate-300 px-2 py-2.5 text-center">
                                                    S/K
                                                </th>

                                                <th className="w-24 border-r border-slate-300 px-2 py-2.5 text-center">
                                                    Grade
                                                </th>

                                                <th className="w-36 border-r border-slate-300 px-2 py-2.5 text-right">
                                                    Rencana (Kg)
                                                </th>

                                                {!isView && (
                                                    <th className="w-14 px-2 py-2.5 text-center">
                                                        Aksi
                                                    </th>
                                                )}

                                            </tr>

                                        </thead>

                                        <tbody>

                                            {formData.details.map(
                                                (detail, index) => (
                                                    <tr
                                                        key={index}
                                                        className="border-b border-slate-200 transition-colors hover:bg-indigo-50/40"
                                                    >

                                                        <td className="border-r border-slate-200 bg-slate-50 px-2 py-1.5 text-center">

                                                            <span className="font-mono font-bold text-slate-500">
                                                                {index + 1}
                                                            </span>

                                                        </td>

                                                        {/* TYPE */}

                                                        <td className="border-r border-slate-200 p-1">

                                                            {isView ? (
                                                                <div className="px-2 py-1.5 capitalize text-slate-700">
                                                                    {detail.type || '-'}
                                                                </div>
                                                            ) : (
                                                                <select
                                                                    value={detail.type}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            'type',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    required
                                                                    className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-xs outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                                                                >
                                                                    <option value="krosok">
                                                                        Krosok
                                                                    </option>

                                                                    <option value="precut">
                                                                        Precut
                                                                    </option>
                                                                </select>
                                                            )}

                                                        </td>

                                                        {/* GDG */}

                                                        <td className="border-r border-slate-200 p-1">

                                                            {isView ? (
                                                                <div className="px-2 py-1.5 text-slate-700">
                                                                    {detail.gdg || '-'}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={detail.gdg}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            'gdg',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    placeholder="GDG"
                                                                    className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-xs outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                                                                />
                                                            )}

                                                        </td>

                                                        {/* JENIS TEMBAKAU */}

                                                        <td className="border-r border-slate-200 p-1">

                                                            {isView ? (
                                                                <div className="px-2 py-1.5 text-slate-700">
                                                                    {detail.jenis_tembakau || '-'}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={detail.jenis_tembakau}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            'jenis_tembakau',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    required
                                                                    placeholder="Jenis tembakau"
                                                                    className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-xs outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                                                                />
                                                            )}

                                                        </td>

                                                        {/* TAHUN */}

                                                        <td className="border-r border-slate-200 p-1">

                                                            {isView ? (
                                                                <div className="px-2 py-1.5 text-center text-slate-700">
                                                                    {detail.tahun || '-'}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="number"
                                                                    value={detail.tahun}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            'tahun',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    required
                                                                    className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-center text-xs outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                                                                />
                                                            )}

                                                        </td>

                                                        {/* S/K */}

                                                        <td className="border-r border-slate-200 p-1">

                                                            {isView ? (
                                                                <div className="px-2 py-1.5 text-center uppercase text-slate-700">
                                                                    {detail.s_k || '-'}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={detail.s_k}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            's_k',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    placeholder="S/K"
                                                                    className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-center text-xs uppercase outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                                                                />
                                                            )}

                                                        </td>

                                                        {/* GRADE */}

                                                        <td className="border-r border-slate-200 p-1">

                                                            {isView ? (
                                                                <div className="px-2 py-1.5 text-center text-slate-700">
                                                                    {detail.grade || '-'}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="text"
                                                                    value={detail.grade}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            'grade',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    placeholder="Grade"
                                                                    className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-xs text-center outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                                                                />
                                                            )}

                                                        </td>

                                                        {/* RENCANA */}

                                                        <td className="border-r border-slate-200 p-1">

                                                            {isView ? (
                                                                <div className="px-2 py-1.5 text-right font-mono text-slate-700">
                                                                    {formatNumber(detail.rencana)}
                                                                </div>
                                                            ) : (
                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={detail.rencana}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            'rencana',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    required
                                                                    placeholder="0.00"
                                                                    className="w-full rounded border border-transparent bg-transparent px-2 py-1.5 text-right text-xs font-mono outline-none transition hover:border-slate-300 focus:border-indigo-500 focus:bg-white"
                                                                />
                                                            )}

                                                        </td>

                                                        {/* AKSI */}

                                                        {!isView && (
                                                            <td className="p-1 text-center">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRemoveDetail(
                                                                            index
                                                                        )
                                                                    }
                                                                    disabled={
                                                                        loading ||
                                                                        formData.details.length <= 1
                                                                    }
                                                                    className="inline-flex h-7 w-7 items-center justify-center rounded-md text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-30"
                                                                    title="Hapus detail"
                                                                >
                                                                    <Trash2 size={14} />
                                                                </button>

                                                            </td>
                                                        )}

                                                    </tr>
                                                )
                                            )}

                                        </tbody>

                                        {/* TOTAL DESKTOP */}

                                        <tfoot>

                                            <tr className="bg-slate-50">

                                                <td
                                                    colSpan={7}
                                                    className="border-r border-slate-300 px-3 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500"
                                                >
                                                    Total Rencana
                                                </td>

                                                <td className="border-r border-slate-300 px-3 py-3 text-right">

                                                    <span className="font-mono text-sm font-bold text-indigo-600">
                                                        {formatNumber(totalRencana)}
                                                    </span>

                                                    <span className="ml-1 text-xs font-semibold text-slate-500">
                                                        Kg
                                                    </span>

                                                </td>

                                                {!isView && (
                                                    <td />
                                                )}

                                            </tr>

                                        </tfoot>

                                    </table>

                                </div>

                            </div>

                            {/* MOBILE DETAIL */}

                            <div className="md:hidden">

                                <div className="space-y-2 p-2">

                                    {formData.details.map(
                                        (detail, index) => (
                                            <div
                                                key={index}
                                                className="overflow-hidden rounded-lg border border-slate-200 bg-white"
                                            >

                                                {/* MOBILE ROW HEADER */}

                                                <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-3 py-2">

                                                    <div className="flex items-center gap-2">

                                                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700">
                                                            {index + 1}
                                                        </span>

                                                        <span className="text-xs font-bold text-slate-700">
                                                            Detail #{index + 1}
                                                        </span>

                                                    </div>

                                                    {!isView && (
                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                handleRemoveDetail(
                                                                    index
                                                                )
                                                            }
                                                            disabled={
                                                                loading ||
                                                                formData.details.length <= 1
                                                            }
                                                            className="flex h-7 w-7 items-center justify-center rounded-md text-rose-500 hover:bg-rose-50 disabled:opacity-30"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}

                                                </div>

                                                {/* MOBILE FIELDS */}

                                                <div className="divide-y divide-slate-100">

                                                    {/* TYPE */}

                                                    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-3 py-2">

                                                        <span className="text-xs font-semibold text-slate-500">
                                                            Type
                                                        </span>

                                                        {isView ? (
                                                            <span className="text-right text-xs font-medium capitalize text-slate-700">
                                                                {detail.type || '-'}
                                                            </span>
                                                        ) : (
                                                            <select
                                                                value={detail.type}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'type',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                disabled={loading}
                                                                required
                                                                className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right text-xs outline-none focus:border-indigo-500"
                                                            >
                                                                <option value="krosok">
                                                                    Krosok
                                                                </option>

                                                                <option value="precut">
                                                                    Precut
                                                                </option>
                                                            </select>
                                                        )}

                                                    </div>

                                                    {/* GDG */}

                                                    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-3 py-2">

                                                        <span className="text-xs font-semibold text-slate-500">
                                                            GDG
                                                        </span>

                                                        {isView ? (
                                                            <span className="text-right text-xs font-medium text-slate-700">
                                                                {detail.gdg || '-'}
                                                            </span>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={detail.gdg}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'gdg',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                disabled={loading}
                                                                placeholder="Gudang"
                                                                className="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-xs outline-none focus:border-indigo-500"
                                                            />
                                                        )}

                                                    </div>

                                                    {/* JENIS TEMBAKAU */}

                                                    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-3 py-2">

                                                        <span className="text-xs font-semibold text-slate-500">
                                                            Jenis Tembakau
                                                        </span>

                                                        {isView ? (
                                                            <span className="text-right text-xs font-medium text-slate-700">
                                                                {detail.jenis_tembakau || '-'}
                                                            </span>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={detail.jenis_tembakau}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'jenis_tembakau',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                disabled={loading}
                                                                required
                                                                placeholder="Jenis tembakau"
                                                                className="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-xs outline-none focus:border-indigo-500"
                                                            />
                                                        )}

                                                    </div>

                                                    {/* TAHUN */}

                                                    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-3 py-2">

                                                        <span className="text-xs font-semibold text-slate-500">
                                                            Tahun
                                                        </span>

                                                        {isView ? (
                                                            <span className="text-right text-xs font-medium text-slate-700">
                                                                {detail.tahun || '-'}
                                                            </span>
                                                        ) : (
                                                            <input
                                                                type="number"
                                                                value={detail.tahun}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'tahun',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                disabled={loading}
                                                                required
                                                                className="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-xs outline-none focus:border-indigo-500"
                                                            />
                                                        )}

                                                    </div>

                                                    {/* S/K */}

                                                    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-3 py-2">

                                                        <span className="text-xs font-semibold text-slate-500">
                                                            S/K
                                                        </span>

                                                        {isView ? (
                                                            <span className="text-right text-xs font-medium uppercase text-slate-700">
                                                                {detail.s_k || '-'}
                                                            </span>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={detail.s_k}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        's_k',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                disabled={loading}
                                                                placeholder="S/K"
                                                                className="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-xs uppercase outline-none focus:border-indigo-500"
                                                            />
                                                        )}

                                                    </div>

                                                    {/* GRADE */}

                                                    <div className="grid grid-cols-[110px_1fr] items-center gap-2 px-3 py-2">

                                                        <span className="text-xs font-semibold text-slate-500">
                                                            Grade
                                                        </span>

                                                        {isView ? (
                                                            <span className="text-right text-xs font-medium text-slate-700">
                                                                {detail.grade || '-'}
                                                            </span>
                                                        ) : (
                                                            <input
                                                                type="text"
                                                                value={detail.grade}
                                                                onChange={(event) =>
                                                                    handleDetailChange(
                                                                        index,
                                                                        'grade',
                                                                        event.target.value
                                                                    )
                                                                }
                                                                disabled={loading}
                                                                placeholder="Grade"
                                                                className="w-full rounded border border-slate-200 px-2 py-1.5 text-right text-xs outline-none focus:border-indigo-500"
                                                            />
                                                        )}

                                                    </div>

                                                    {/* RENCANA */}

                                                    <div className="grid grid-cols-[110px_1fr] items-center gap-2 bg-slate-50 px-3 py-2">

                                                        <span className="text-xs font-semibold text-slate-500">
                                                            Rencana
                                                        </span>

                                                        {isView ? (
                                                            <span className="text-right font-mono text-xs font-bold text-indigo-600">
                                                                {formatNumber(detail.rencana)} Kg
                                                            </span>
                                                        ) : (
                                                            <div className="flex items-center gap-1">

                                                                <input
                                                                    type="number"
                                                                    step="0.01"
                                                                    min="0"
                                                                    value={detail.rencana}
                                                                    onChange={(event) =>
                                                                        handleDetailChange(
                                                                            index,
                                                                            'rencana',
                                                                            event.target.value
                                                                        )
                                                                    }
                                                                    disabled={loading}
                                                                    required
                                                                    placeholder="0.00"
                                                                    className="w-full rounded border border-slate-200 bg-white px-2 py-1.5 text-right text-xs font-mono outline-none focus:border-indigo-500"
                                                                />

                                                                <span className="text-[11px] font-semibold text-slate-400">
                                                                    Kg
                                                                </span>

                                                            </div>
                                                        )}

                                                    </div>

                                                </div>

                                            </div>
                                        )
                                    )}

                                </div>

                                {/* MOBILE TOTAL */}

                                <div className="border-t border-slate-200 bg-slate-50 px-4 py-3">

                                    <div className="flex items-center justify-between">

                                        <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                                            Total Rencana
                                        </span>

                                        <span className="font-mono text-sm font-bold text-indigo-600">
                                            {formatNumber(totalRencana)} Kg
                                        </span>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                    {/* FOOTER */}

                    <div className="flex shrink-0 items-center justify-end gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:gap-3 sm:px-6">

                        {/* TUTUP / BATAL */}

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {isView ? 'Tutup' : 'Batal'}
                        </button>

                        {/* SIMPAN */}

                        {!isView && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {loading
                                    ? 'Menyimpan...'
                                    : isEdit
                                        ? 'Simpan Perubahan'
                                        : 'Simpan'}
                            </button>
                        )}

                    </div>

                </form>

            </div>

        </div>
    );
}