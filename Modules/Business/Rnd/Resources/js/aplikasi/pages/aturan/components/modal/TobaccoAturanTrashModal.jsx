import React, { useEffect, useState } from 'react';

import { X, RefreshCw, RotateCcw, Trash2, FileText, CalendarDays, AlertTriangle } from 'lucide-react';

import { tobaccoAturanService } from '../../../../services/tobaccoAturanService.js';

// =====================================================
// COMPONENT
// =====================================================

export default function TobaccoAturanTrashModal({
    open,
    onClose,
    onSuccess,
}) {

    // ===================================================
    // STATE
    // ===================================================

    const [dataList, setDataList] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [restoringId, setRestoringId] = useState(null);

    const [forceDeletingId, setForceDeletingId] = useState(null);


    // ===================================================
    // LOAD TRASH
    // ===================================================

    const loadTrash = async () => {

        setLoading(true);
        setError('');

        try {

            const response =
                await tobaccoAturanService.getTrash();

            const data = Array.isArray(response?.data)
                ? response.data
                : [];

            setDataList(data);

        } catch (err) {

            console.error(
                'Gagal mengambil data trash aturan tembakau:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal mengambil data trash aturan tembakau.'
            );

            setDataList([]);

        } finally {

            setLoading(false);

        }
    };


    // ===================================================
    // LOAD SAAT MODAL DIBUKA
    // ===================================================

    useEffect(() => {

        if (!open) {
            return;
        }

        loadTrash();

    }, [open]);


    // ===================================================
    // RESTORE
    // ===================================================

    const handleRestore = async (item) => {

        const confirmed = window.confirm(
            `Pulihkan aturan "${item?.kode_aturan}"?`
        );

        if (!confirmed) {
            return;
        }

        setRestoringId(item.id);
        setError('');

        try {

            await tobaccoAturanService.restore(
                item.id
            );

            if (onSuccess) {
                onSuccess(
                    'Aturan tembakau berhasil dipulihkan.'
                );
            }

            await loadTrash();

        } catch (err) {

            console.error(
                'Gagal memulihkan aturan tembakau:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal memulihkan aturan tembakau.'
            );

        } finally {

            setRestoringId(null);

        }
    };


    // ===================================================
    // FORCE DELETE
    // ===================================================

    const handleForceDelete = async (item) => {

        const confirmed = window.confirm(
            `PERINGATAN!\n\n` +
            `Aturan "${item?.kode_aturan}" akan dihapus PERMANEN ` +
            `beserta seluruh detailnya.\n\n` +
            `Data tidak dapat dipulihkan lagi.\n\n` +
            `Lanjutkan?`
        );

        if (!confirmed) {
            return;
        }

        setForceDeletingId(item.id);
        setError('');

        try {

            await tobaccoAturanService.forceDelete(
                item.id
            );

            if (onSuccess) {
                onSuccess(
                    'Aturan tembakau berhasil dihapus permanen.'
                );
            }

            await loadTrash();

        } catch (err) {

            console.error(
                'Gagal menghapus permanen aturan tembakau:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal menghapus permanen aturan tembakau.'
            );

        } finally {

            setForceDeletingId(null);

        }
    };


    // ===================================================
    // FORMAT DATE
    // ===================================================

    const formatDate = (value) => {

        if (!value) {
            return '-';
        }

        const date = new Date(value);

        if (Number.isNaN(date.getTime())) {
            return value;
        }

        return new Intl.DateTimeFormat(
            'id-ID',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }
        ).format(date);
    };


    // ===================================================
    // CLOSE
    // ===================================================

    const handleClose = () => {

        if (loading ||
            restoringId ||
            forceDeletingId
        ) {
            return;
        }

        onClose?.();

    };


    // ===================================================
    // RENDER
    // ===================================================

    if (!open) {
        return null;
    }


    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

            <div className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">

                    <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Trash2 size={19} />
                        </div>

                        <div>

                            <h2 className="text-lg font-black text-slate-900">
                                Trash Aturan Tembakau
                            </h2>

                            <p className="mt-0.5 text-xs text-slate-500">
                                Data yang telah dihapus sementara.
                            </p>

                        </div>

                    </div>


                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={loadTrash}
                            disabled={
                                loading ||
                                restoringId ||
                                forceDeletingId
                            }
                            title="Refresh"
                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={16}
                                className={
                                    loading
                                        ? 'animate-spin'
                                        : ''
                                }
                            />
                        </button>


                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={
                                loading ||
                                restoringId ||
                                forceDeletingId
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <X size={18} />
                        </button>

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (
                    <div className="mx-5 mt-4 flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3">

                        <AlertTriangle
                            size={17}
                            className="mt-0.5 shrink-0 text-rose-500"
                        />

                        <div className="flex-1">

                            <p className="text-sm font-semibold text-rose-700">
                                {error}
                            </p>

                        </div>

                        <button
                            type="button"
                            onClick={() => setError('')}
                            className="text-rose-400 hover:text-rose-600"
                        >
                            <X size={15} />
                        </button>

                    </div>
                )}


                {/* =================================================
                    CONTENT
                ================================================== */}

                <div className="min-h-0 flex-1 overflow-y-auto p-5">

                    {/* LOADING */}

                    {loading && (
                        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">

                            <RefreshCw
                                size={17}
                                className="animate-spin"
                            />

                            Memuat data trash...

                        </div>
                    )}


                    {/* EMPTY */}

                    {!loading &&
                        dataList.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-14 text-center">

                                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                                    <Trash2 size={24} />
                                </div>

                                <p className="text-sm font-bold text-slate-600">
                                    Trash kosong
                                </p>

                                <p className="mt-1 text-xs text-slate-400">
                                    Tidak ada aturan tembakau yang
                                    berada di trash.
                                </p>

                            </div>
                        )}


                    {/* DESKTOP */}

                    {!loading &&
                        dataList.length > 0 && (

                            <div className="hidden overflow-x-auto md:block">

                                <table className="w-full border-collapse text-left">

                                    <thead>

                                        <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">

                                            <th className="px-4 py-3">
                                                No
                                            </th>

                                            <th className="px-4 py-3">
                                                Kode Aturan
                                            </th>

                                            <th className="px-4 py-3">
                                                Tanggal
                                            </th>

                                            <th className="px-4 py-3">
                                                Detail
                                            </th>

                                            <th className="px-4 py-3">
                                                Dihapus
                                            </th>

                                            <th className="px-4 py-3 text-right">
                                                Aksi
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody className="divide-y divide-slate-100 text-sm">

                                        {dataList.map(
                                            (item, index) => {

                                                const details =
                                                    Array.isArray(
                                                        item?.details
                                                    )
                                                        ? item.details
                                                        : [];

                                                const restoring =
                                                    restoringId ===
                                                    item.id;

                                                const forceDeleting =
                                                    forceDeletingId ===
                                                    item.id;

                                                const busy =
                                                    restoring ||
                                                    forceDeleting;

                                                return (
                                                    <tr
                                                        key={item.id}
                                                        className="transition-colors hover:bg-slate-50"
                                                    >

                                                        <td className="px-4 py-4">

                                                            <span className="font-mono text-xs font-bold text-slate-400">
                                                                {index + 1}
                                                            </span>

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                                    <FileText size={16} />
                                                                </div>

                                                                <div>

                                                                    <p className="font-mono text-sm font-black text-slate-700">
                                                                        {item.kode_aturan}
                                                                    </p>

                                                                    <p className="text-xs text-slate-400">
                                                                        ID: {item.id}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <div className="flex items-center gap-2 text-xs text-slate-600">

                                                                <CalendarDays
                                                                    size={14}
                                                                    className="text-slate-400"
                                                                />

                                                                {formatDate(
                                                                    item.tanggal_aturan
                                                                )}

                                                            </div>

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                                                                {details.length}
                                                                {' '}detail
                                                            </span>

                                                        </td>


                                                        <td className="px-4 py-4 text-xs text-slate-500">

                                                            {formatDate(
                                                                item.deleted_at
                                                            )}

                                                        </td>


                                                        <td className="px-4 py-4">

                                                            <div className="flex justify-end gap-2">

                                                                {/* RESTORE */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleRestore(
                                                                            item
                                                                        )
                                                                    }
                                                                    disabled={busy}
                                                                    className="flex h-8 items-center gap-1.5 rounded-lg bg-emerald-50 px-3 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >

                                                                    {restoring ? (
                                                                        <RefreshCw
                                                                            size={14}
                                                                            className="animate-spin"
                                                                        />
                                                                    ) : (
                                                                        <RotateCcw
                                                                            size={14}
                                                                        />
                                                                    )}

                                                                    Restore

                                                                </button>


                                                                {/* FORCE DELETE */}

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleForceDelete(
                                                                            item
                                                                        )
                                                                    }
                                                                    disabled={busy}
                                                                    className="flex h-8 items-center gap-1.5 rounded-lg bg-rose-50 px-3 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                                >

                                                                    {forceDeleting ? (
                                                                        <RefreshCw
                                                                            size={14}
                                                                            className="animate-spin"
                                                                        />
                                                                    ) : (
                                                                        <Trash2
                                                                            size={14}
                                                                        />
                                                                    )}

                                                                    Hapus Permanen

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>
                                                );
                                            }
                                        )}

                                    </tbody>

                                </table>

                            </div>
                        )}


                    {/* =================================================
                        MOBILE
                    ================================================== */}

                    {!loading &&
                        dataList.length > 0 && (

                            <div className="space-y-3 md:hidden">

                                {dataList.map(
                                    (item, index) => {

                                        const details =
                                            Array.isArray(
                                                item?.details
                                            )
                                                ? item.details
                                                : [];

                                        const restoring =
                                            restoringId ===
                                            item.id;

                                        const forceDeleting =
                                            forceDeletingId ===
                                            item.id;

                                        const busy =
                                            restoring ||
                                            forceDeleting;

                                        return (
                                            <div
                                                key={item.id}
                                                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
                                            >

                                                <div className="flex items-start gap-3">

                                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                                                        <FileText size={18} />
                                                    </div>

                                                    <div className="min-w-0 flex-1">

                                                        <div className="flex items-start justify-between gap-3">

                                                            <p className="font-mono text-sm font-black text-slate-700">
                                                                {item.kode_aturan}
                                                            </p>

                                                            <span className="text-xs font-bold text-slate-400">
                                                                #{index + 1}
                                                            </span>

                                                        </div>

                                                        <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">

                                                            <CalendarDays size={13} />

                                                            {formatDate(
                                                                item.tanggal_aturan
                                                            )}

                                                        </div>

                                                    </div>

                                                </div>


                                                <div className="mt-4 grid grid-cols-2 gap-2">

                                                    <div className="rounded-lg bg-slate-50 px-3 py-2">

                                                        <p className="text-[10px] font-bold uppercase text-slate-400">
                                                            Detail
                                                        </p>

                                                        <p className="mt-0.5 text-sm font-black text-slate-700">
                                                            {details.length}
                                                        </p>

                                                    </div>


                                                    <div className="rounded-lg bg-slate-50 px-3 py-2">

                                                        <p className="text-[10px] font-bold uppercase text-slate-400">
                                                            Dihapus
                                                        </p>

                                                        <p className="mt-0.5 text-xs font-bold text-slate-600">
                                                            {formatDate(
                                                                item.deleted_at
                                                            )}
                                                        </p>

                                                    </div>

                                                </div>


                                                <div className="mt-4 flex gap-2 border-t border-slate-100 pt-3">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleRestore(
                                                                item
                                                            )
                                                        }
                                                        disabled={busy}
                                                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-50 text-xs font-bold text-emerald-600 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >

                                                        {restoring ? (
                                                            <RefreshCw
                                                                size={14}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <RotateCcw
                                                                size={14}
                                                            />
                                                        )}

                                                        Restore

                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleForceDelete(
                                                                item
                                                            )
                                                        }
                                                        disabled={busy}
                                                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-50 text-xs font-bold text-rose-600 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >

                                                        {forceDeleting ? (
                                                            <RefreshCw
                                                                size={14}
                                                                className="animate-spin"
                                                            />
                                                        ) : (
                                                            <Trash2
                                                                size={14}
                                                            />
                                                        )}

                                                        Hapus Permanen

                                                    </button>

                                                </div>

                                            </div>
                                        );
                                    }
                                )}

                            </div>
                        )}

                </div>


                {/* =================================================
                    FOOTER
                ================================================== */}

                <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-5 py-3">

                    <span className="text-xs font-medium text-slate-500">

                        {dataList.length}{' '}
                        aturan di trash

                    </span>


                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={
                            loading ||
                            restoringId ||
                            forceDeletingId
                        }
                        className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Tutup
                    </button>

                </div>

            </div>

        </div>
    );
}
