import React from 'react';

import {
    FileText,
    CalendarDays,
    Eye,
    Pencil,
    Trash2,
    Printer,
    RefreshCw,
    Truck,
} from 'lucide-react';


// =====================================================
// COMPONENT
// =====================================================

export default function TobaccoAturanTable({
    data = [],
    loading = false,
    deletingId = null,
    onDetail,
    onEdit,
    onDelete,
    onPrint,
    onKiriman,
}) {

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
    // DETAIL COUNT
    // ===================================================

    const getDetailCount = (item) => {

        return Array.isArray(item?.details)
            ? item.details.length
            : 0;
    };


    // ===================================================
    // RENDER
    // ===================================================

    return (
        <div className="overflow-hidden border border-slate-300 bg-white shadow-sm">

            {/* =================================================
                DESKTOP / TABLET
            ================================================== */}

            <div className="hidden overflow-x-auto md:block">

                <table className="w-full min-w-[800px] border-collapse text-sm">

                    <thead className="bg-slate-100">

                        <tr className="text-xs font-bold uppercase tracking-wide text-slate-600">

                            <th className="w-16 border border-slate-300 px-3 py-2.5 text-center">
                                No
                            </th>

                            <th className="border border-slate-300 px-3 py-2.5 text-left">
                                Kode Aturan
                            </th>

                            <th className="w-40 border border-slate-300 px-3 py-2.5 text-center">
                                Tanggal
                            </th>

                            <th className="w-28 border border-slate-300 px-3 py-2.5 text-center">
                                Detail
                            </th>

                            <th className="w-52 border border-slate-300 px-3 py-2.5 text-center">
                                Aksi
                            </th>

                        </tr>

                    </thead>


                    <tbody>

                        {/* LOADING */}

                        {loading && (
                            <tr>
                                <td
                                    colSpan="5"
                                    className="border border-slate-300 px-3 py-10 text-center text-sm text-slate-400"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <RefreshCw
                                            size={16}
                                            className="animate-spin"
                                        />
                                        Memuat data...
                                    </div>
                                </td>
                            </tr>
                        )}


                        {/* EMPTY */}

                        {!loading &&
                            data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan="5"
                                        className="border border-slate-300 px-3 py-10 text-center text-sm font-semibold text-slate-400"
                                    >
                                        Tidak ada data aturan tembakau.
                                    </td>
                                </tr>
                            )}


                        {/* DATA */}

                        {!loading &&
                            data.map((item, index) => {

                                const detailCount =
                                    getDetailCount(item);

                                const isDeleting =
                                    deletingId === item.id;

                                return (
                                    <tr
                                        key={item.id}
                                        className="text-slate-700 transition-colors hover:bg-slate-50"
                                    >

                                        {/* NO */}

                                        <td className="border border-slate-300 px-3 py-2 text-center">
                                            <span className="font-mono text-xs font-semibold text-slate-600">
                                                {index + 1}
                                            </span>
                                        </td>


                                        {/* KODE ATURAN */}

                                        <td className="border border-slate-300 px-3 py-2">
                                            <div className="flex items-center gap-2">

                                                <FileText
                                                    size={15}
                                                    className="shrink-0 text-blue-600"
                                                />

                                                <span className="truncate font-mono text-sm font-semibold text-slate-800">
                                                    {item.kode_aturan || '-'}
                                                </span>

                                            </div>
                                        </td>


                                        {/* TANGGAL */}

                                        <td className="border border-slate-300 px-3 py-2 text-center">

                                            <div className="inline-flex items-center gap-1.5 text-sm text-slate-600">

                                                <CalendarDays
                                                    size={14}
                                                    className="text-slate-400"
                                                />

                                                {formatDate(
                                                    item.tanggal_aturan
                                                )}

                                            </div>

                                        </td>


                                        {/* DETAIL */}

                                        <td className="border border-slate-300 px-3 py-2 text-center">

                                            <span className="font-mono text-sm font-semibold text-slate-700">
                                                {detailCount}
                                            </span>

                                        </td>


                                        {/* AKSI */}

                                        <td className="border border-slate-300 px-3 py-2">

                                            <div className="flex items-center justify-center gap-1">

                                                {/* DETAIL */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDetail?.(item)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center border border-slate-300 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-800"
                                                    title="Lihat Detail"
                                                >
                                                    <Eye size={15} />
                                                </button>


                                                {/* EDIT */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onEdit?.(item)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center border border-blue-200 bg-blue-50 text-blue-600 transition-colors hover:bg-blue-100"
                                                    title="Edit"
                                                >
                                                    <Pencil size={15} />
                                                </button>


                                                {/* KIRIMAN */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onKiriman?.(item)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center border border-violet-200 bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100"
                                                    title="Kiriman Tembakau"
                                                >
                                                    <Truck size={15} />
                                                </button>


                                                {/* PRINT */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onPrint?.(item)
                                                    }
                                                    className="flex h-8 w-8 items-center justify-center border border-emerald-200 bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                                                    title="Print"
                                                >
                                                    <Printer size={15} />
                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        onDelete?.(item)
                                                    }
                                                    disabled={isDeleting}
                                                    className="flex h-8 w-8 items-center justify-center border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                                    title="Hapus"
                                                >
                                                    {isDeleting ? (
                                                        <RefreshCw
                                                            size={15}
                                                            className="animate-spin"
                                                        />
                                                    ) : (
                                                        <Trash2 size={15} />
                                                    )}
                                                </button>

                                            </div>

                                        </td>

                                    </tr>
                                );
                            })}

                    </tbody>

                </table>

            </div>


            {/* =================================================
                MOBILE
            ================================================== */}

            <div className="divide-y divide-slate-200 md:hidden">

                {/* LOADING */}

                {loading && (
                    <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-400">
                        <RefreshCw
                            size={17}
                            className="animate-spin"
                        />
                        Memuat data...
                    </div>
                )}


                {/* EMPTY */}

                {!loading &&
                    data.length === 0 && (
                        <div className="p-8 text-center text-sm font-semibold text-slate-400">
                            Tidak ada data aturan tembakau.
                        </div>
                    )}


                {/* DATA */}

                {!loading &&
                    data.map((item, index) => {

                        const detailCount =
                            getDetailCount(item);

                        const isDeleting =
                            deletingId === item.id;

                        return (
                            <div
                                key={item.id}
                                className="p-4"
                            >

                                {/* HEADER */}

                                <div className="flex items-start gap-3">

                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                                        <FileText size={17} />
                                    </div>

                                    <div className="min-w-0 flex-1">

                                        <div className="flex items-center justify-between gap-2">

                                            <p className="truncate font-mono text-sm font-bold text-slate-800">
                                                {item.kode_aturan || '-'}
                                            </p>

                                            <span className="shrink-0 font-mono text-xs font-semibold text-slate-400">
                                                #{index + 1}
                                            </span>

                                        </div>

                                        <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-400">

                                            <CalendarDays size={13} />

                                            {formatDate(
                                                item.tanggal_aturan
                                            )}

                                        </div>

                                    </div>

                                </div>


                                {/* SUMMARY */}

                                <div className="mt-3 flex items-center justify-between border border-slate-200 bg-slate-50 px-3 py-2.5">

                                    <span className="text-xs font-semibold text-slate-500">
                                        Jumlah Detail
                                    </span>

                                    <span className="font-mono text-sm font-bold text-blue-600">
                                        {detailCount}
                                    </span>

                                </div>


                                {/* ACTION */}

                                <div className="mt-3 flex gap-2 border-t border-slate-200 pt-3">

                                    {/* DETAIL */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDetail?.(item)
                                        }
                                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-slate-100 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200"
                                    >
                                        <Eye size={15} />
                                        Detail
                                    </button>


                                    {/* EDIT */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEdit?.(item)
                                        }
                                        className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 text-sm font-bold text-blue-600 transition-colors hover:bg-blue-100"
                                    >
                                        <Pencil size={15} />
                                        Edit
                                    </button>


                                    {/* KIRIMAN */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onKiriman?.(item)
                                        }
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600 transition-colors hover:bg-violet-100"
                                        title="Kiriman Tembakau"
                                    >
                                        <Truck size={15} />
                                    </button>


                                    {/* PRINT */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onPrint?.(item)
                                        }
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-colors hover:bg-emerald-100"
                                        title="Print"
                                    >
                                        <Printer size={15} />
                                    </button>


                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDelete?.(item)
                                        }
                                        disabled={isDeleting}
                                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-50"
                                        title="Hapus"
                                    >
                                        {isDeleting ? (
                                            <RefreshCw
                                                size={15}
                                                className="animate-spin"
                                            />
                                        ) : (
                                            <Trash2 size={15} />
                                        )}
                                    </button>

                                </div>

                            </div>
                        );
                    })}

            </div>

        </div>
    );
}