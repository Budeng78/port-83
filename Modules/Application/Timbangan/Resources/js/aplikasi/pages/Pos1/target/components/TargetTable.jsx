import React from 'react';

import {
    Pencil,
    Trash2,
    Eye,
} from 'lucide-react';

export default function TargetTable({
    data = [],
    loading = false,
    onDetail,
    onEdit,
    onDelete,
}) {
    const formatTanggal = (tanggal) => {
        if (!tanggal) return '-';

        return new Date(tanggal).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
        });
    };

    const renderStatus = (status) => {
        if (status === 'finish') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                    Finish
                </span>
            );
        }

        if (status === 'active') {
            return (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Aktif
                </span>
            );
        }

        return (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-600">
                <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                Pending
            </span>
        );
    };

    if (loading) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm">
                Memuat data...
            </div>
        );
    }

    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-slate-200 bg-white px-5 py-10 text-center text-sm text-slate-500 shadow-sm">
                Belum ada data target.
            </div>
        );
    }

    return (
        <>
            {/* ================= DESKTOP ================= */}
            <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block">
                <table className="w-full text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50">
                        <tr className="text-xs uppercase tracking-wide text-slate-500">
                            <th className="w-16 px-5 py-4 text-left font-semibold">
                                #
                            </th>

                            <th className="px-5 py-4 text-left font-semibold">
                                Kode Batch
                            </th>

                            <th className="px-5 py-4 text-left font-semibold">
                                Tanggal
                            </th>

                            <th className="px-5 py-4 text-center font-semibold">
                                Aturan
                            </th>

                            <th className="px-5 py-4 text-left font-semibold">
                                Status
                            </th>

                            <th className="w-32 px-5 py-4 text-center font-semibold">
                                Aksi
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={item.id}
                                className="border-b border-slate-100 last:border-0 hover:bg-slate-50/70"
                            >
                                <td className="px-5 py-4 text-slate-500">
                                    {index + 1}
                                </td>

                                <td className="px-5 py-4">
                                    <span className="inline-flex rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs font-semibold text-slate-700">
                                        {item.kode_batch || '-'}
                                    </span>
                                </td>

                                <td className="px-5 py-4 text-slate-600">
                                    {formatTanggal(item.tanggal)}
                                </td>

                                <td className="px-5 py-4 text-center">
                                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-700">
                                        {item.aturan_count ?? 0}
                                    </span>
                                </td>

                                <td className="px-5 py-4">
                                    {renderStatus(item.status)}
                                </td>

                                <td className="px-5 py-4">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() => onDetail?.(item)}
                                            title="Detail"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-50 text-slate-500 transition hover:bg-blue-50 hover:text-blue-600"
                                        >
                                            <Eye size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onEdit?.(item)}
                                            title="Edit"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition hover:bg-blue-100"
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => onDelete?.(item)}
                                            title="Hapus"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50 text-red-500 transition hover:bg-red-100"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ================= MOBILE ================= */}
            <div className="space-y-3 md:hidden">
                {data.map((item, index) => (
                    <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-4 py-3">
                            <div className="flex items-center gap-3">
                                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-slate-200 text-xs font-semibold text-slate-600">
                                    {index + 1}
                                </span>

                                <span className="font-mono text-sm font-semibold text-slate-700">
                                    {item.kode_batch || '-'}
                                </span>
                            </div>

                            {renderStatus(item.status)}
                        </div>

                        {/* Content */}
                        <div className="grid grid-cols-2 gap-4 px-4 py-4">
                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Tanggal
                                </div>

                                <div className="mt-1 text-sm font-medium text-slate-700">
                                    {formatTanggal(item.tanggal)}
                                </div>
                            </div>

                            <div>
                                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                                    Aturan
                                </div>

                                <div className="mt-1">
                                    <span className="inline-flex min-w-8 items-center justify-center rounded-md bg-slate-100 px-2 py-1 text-sm font-semibold text-slate-700">
                                        {item.aturan_count ?? 0}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
                            <button
                                type="button"
                                onClick={() => onDetail?.(item)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-slate-50 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-blue-50 hover:text-blue-600"
                            >
                                <Eye size={16} />
                                Detail
                            </button>

                            <button
                                type="button"
                                onClick={() => onEdit?.(item)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 py-2.5 text-sm font-medium text-blue-600 transition hover:bg-blue-100"
                            >
                                <Pencil size={16} />
                                Edit
                            </button>

                            <button
                                type="button"
                                onClick={() => onDelete?.(item)}
                                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-50 py-2.5 text-sm font-medium text-red-500 transition hover:bg-red-100"
                            >
                                <Trash2 size={16} />
                                Hapus
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}
