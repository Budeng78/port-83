import React, { useEffect, useState } from 'react';
import {
    RefreshCw,
    Trash2,
    RotateCcw,
    X,
    AlertTriangle,
} from 'lucide-react';

import { trashService } from '@Modules/System/Resources/js/aplikasi/services/trashService.js';

export default function TrashManagement() {
    const [trashedItems, setTrashedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchTrashData = async () => {
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await trashService.getAllTrashedData();

            const items = response?.data ?? response ?? [];

            setTrashedItems(
                Array.isArray(items) ? items : []
            );
        } catch (err) {
            console.error('Gagal memuat Trash:', err);

            setError(
                err?.response?.data?.message ||
                'Gagal memuat data tempat sampah global.'
            );

            setTrashedItems([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashData();
    }, []);

    const handleRestore = async (item) => {
        const confirmed = window.confirm(
            `Apakah Anda yakin ingin memulihkan data "${item.display_title || '-'}" dari tabel "${item.table_name}"?`
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await trashService.restoreData(
                item.source_module,
                item.source_resource,
                item.id
            );

            setSuccess('Data berhasil dipulihkan.');

            await fetchTrashData();
        } catch (err) {
            console.error('Gagal memulihkan data:', err);

            setError(
                err?.response?.data?.message ||
                'Gagal memulihkan data.'
            );
        } finally {
            setLoading(false);
        }
    };

    const handleForceDelete = async (item) => {
        const confirmed = window.confirm(
            `PERINGATAN!\n\n` +
            `Data "${item.display_title || '-'}" dari tabel "${item.table_name}" ` +
            `akan dihapus secara permanen dan TIDAK dapat dikembalikan.\n\n` +
            `Lanjutkan?`
        );

        if (!confirmed) {
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await trashService.forceDeleteData(
                item.source_module,
                item.source_resource,
                item.id
            );

            setSuccess('Data berhasil dihapus permanen.');

            await fetchTrashData();
        } catch (err) {
            console.error('Gagal menghapus permanen:', err);

            setError(
                err?.response?.data?.message ||
                'Gagal menghapus permanen data.'
            );
        } finally {
            setLoading(false);
        }
    };

    const formatDeletedAt = (value) => {
        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return date.toLocaleString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-4">

            {/* HEADER */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-black tracking-tight text-slate-900">
                        Tempat Sampah
                    </h1>

                    <p className="text-xs text-slate-500">
                        Kelola data yang telah dihapus dari seluruh modul sistem.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={fetchTrashData}
                    disabled={loading}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    <RefreshCw
                        size={14}
                        className={loading ? 'animate-spin' : ''}
                    />

                    <span>
                        {loading ? 'Memuat...' : 'Refresh'}
                    </span>
                </button>
            </div>

            {/* ALERT SUCCESS */}
            {success && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-xs font-semibold text-emerald-700">
                    <span>{success}</span>

                    <button
                        type="button"
                        onClick={() => setSuccess('')}
                        className="shrink-0"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* ALERT ERROR */}
            {error && (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs font-semibold text-rose-600">
                    <span>{error}</span>

                    <button
                        type="button"
                        onClick={() => setError('')}
                        className="shrink-0"
                    >
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* MAIN CARD */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* CARD HEADER */}
                <div className="border-b border-slate-100 p-4 sm:p-5">
                    <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                            <Trash2 size={17} />
                        </div>

                        <div>
                            <h2 className="text-sm font-black text-slate-800">
                                Data Terhapus
                            </h2>

                            <p className="text-[11px] text-slate-400">
                                Data yang dapat dipulihkan atau dihapus permanen.
                            </p>
                        </div>

                        <div className="ml-auto text-xs font-medium text-slate-500">
                            Total:{' '}
                            <span className="font-black text-slate-800">
                                {trashedItems.length}
                            </span>
                        </div>
                    </div>
                </div>

                {/* LOADING */}
                {loading && trashedItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                        <RefreshCw
                            size={20}
                            className="mb-3 animate-spin text-slate-400"
                        />

                        <p className="text-xs font-medium text-slate-500">
                            Memindai data tempat sampah...
                        </p>
                    </div>
                ) : trashedItems.length === 0 ? (

                    /* EMPTY */
                    <div className="p-5 sm:p-6">
                        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center">

                            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-white text-slate-400 shadow-sm">
                                <Trash2 size={19} />
                            </div>

                            <p className="text-sm font-bold text-slate-500">
                                Tempat sampah kosong
                            </p>

                            <p className="mt-1 text-[11px] text-slate-400">
                                Tidak ada data terhapus dari seluruh modul.
                            </p>
                        </div>
                    </div>

                ) : (
                    <>
                        {/* =====================================================
                            MOBILE CARD
                        ====================================================== */}
                        <div className="divide-y divide-slate-100 md:hidden">

                            {trashedItems.map((item) => (
                                <div
                                    key={`${item.source_module}-${item.table_name}-${item.id}`}
                                    className="p-4 transition-colors hover:bg-slate-50"
                                >

                                    {/* TITLE */}
                                    <div className="flex items-start justify-between gap-3">

                                        <div className="min-w-0 flex-1">

                                            <span className="mb-2 inline-flex rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                                                {item.table_name}
                                            </span>

                                            <p className="truncate text-sm font-black text-slate-800">
                                                {item.display_title || '-'}
                                            </p>

                                            {item.display_subtitle && (
                                                <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                                                    {item.display_subtitle}
                                                </p>
                                            )}

                                        </div>

                                        <AlertTriangle
                                            size={15}
                                            className="shrink-0 text-amber-400"
                                        />

                                    </div>

                                    {/* INFO */}
                                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3">

                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Dihapus Oleh
                                            </span>

                                            <span className="text-right text-[11px] font-semibold text-slate-600">
                                                {item.deleted_by?.name ||
                                                    'Sistem / Tidak Diketahui'}
                                            </span>
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Waktu
                                            </span>

                                            <span className="text-right text-[11px] text-slate-500">
                                                {formatDeletedAt(item.deleted_at)}
                                            </span>
                                        </div>

                                    </div>

                                    {/* ACTION */}
                                    <div className="mt-3 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleRestore(item)}
                                            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-2 text-[11px] font-bold text-blue-600 transition-all hover:bg-blue-100 disabled:opacity-50"
                                        >
                                            <RotateCcw size={13} />
                                            Pulihkan
                                        </button>

                                        <button
                                            type="button"
                                            disabled={loading}
                                            onClick={() => handleForceDelete(item)}
                                            className="flex h-8 items-center justify-center gap-1.5 rounded-lg bg-rose-50 px-2 text-[11px] font-bold text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-50"
                                        >
                                            <Trash2 size={13} />
                                            Hapus Permanen
                                        </button>

                                    </div>
                                </div>
                            ))}

                        </div>

                        {/* =====================================================
                            DESKTOP TABLE
                        ====================================================== */}
                        <div className="hidden overflow-x-auto md:block">

                            <table className="w-full border-collapse text-left">

                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50 text-[11px] font-black uppercase tracking-wider text-slate-500">

                                        <th className="px-4 py-3">
                                            Nama Tabel
                                        </th>

                                        <th className="px-4 py-3">
                                            Nama Item
                                        </th>

                                        <th className="px-4 py-3">
                                            Dihapus Oleh
                                        </th>

                                        <th className="px-4 py-3">
                                            Waktu Dihapus
                                        </th>

                                        <th className="px-4 py-3 text-right">
                                            Aksi
                                        </th>

                                    </tr>
                                </thead>

                                <tbody className="divide-y divide-slate-100 text-xs">

                                    {trashedItems.map((item) => (
                                        <tr
                                            key={`${item.source_module}-${item.table_name}-${item.id}`}
                                            className="transition-colors hover:bg-slate-50"
                                        >

                                            {/* TABLE */}
                                            <td className="whitespace-nowrap px-4 py-3">

                                                <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-600 ring-1 ring-slate-200">
                                                    {item.table_name}
                                                </span>

                                            </td>

                                            {/* ITEM */}
                                            <td className="max-w-xs px-4 py-3">

                                                <p className="truncate font-black text-slate-800">
                                                    {item.display_title || '-'}
                                                </p>

                                                {item.display_subtitle && (
                                                    <p className="mt-0.5 truncate font-mono text-[10px] text-slate-400">
                                                        {item.display_subtitle}
                                                    </p>
                                                )}

                                            </td>

                                            {/* DELETED BY */}
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-600">

                                                <div className="font-medium">
                                                    {item.deleted_by?.name ||
                                                        'Sistem / Tidak Diketahui'}
                                                </div>

                                            </td>

                                            {/* DATE */}
                                            <td className="whitespace-nowrap px-4 py-3 text-slate-500">

                                                {formatDeletedAt(item.deleted_at)}

                                            </td>

                                            {/* ACTION */}
                                            <td className="whitespace-nowrap px-4 py-3 text-right">

                                                <div className="flex justify-end gap-1.5">

                                                    <button
                                                        type="button"
                                                        disabled={loading}
                                                        onClick={() =>
                                                            handleRestore(item)
                                                        }
                                                        className="flex h-7 items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 text-[10px] font-bold text-blue-600 transition-all hover:bg-blue-100 disabled:opacity-50"
                                                    >
                                                        <RotateCcw size={12} />
                                                        Pulihkan
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={loading}
                                                        onClick={() =>
                                                            handleForceDelete(item)
                                                        }
                                                        className="flex h-7 items-center gap-1.5 rounded-lg bg-rose-50 px-2.5 text-[10px] font-bold text-rose-600 transition-all hover:bg-rose-100 disabled:opacity-50"
                                                    >
                                                        <Trash2 size={12} />
                                                        Hapus Permanen
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>
                                    ))}

                                </tbody>

                            </table>

                        </div>
                    </>
                )}

            </div>
        </div>
    );
}