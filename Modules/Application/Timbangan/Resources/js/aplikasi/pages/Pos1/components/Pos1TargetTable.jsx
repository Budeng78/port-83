import React, { useState, useMemo } from 'react';
import {
    Eye,
    Trash2,
    Loader2,
    ArrowUpDown,
    ArrowUp,
    ArrowDown,
} from 'lucide-react';

export default function Pos1TargetTable({
    data,
    loading,
    selectedDate,
    onDetail,
    onDelete,
}) {
    const [sortConfig, setSortConfig] = useState({
        key: 'kode_batch',
        direction: 'asc',
    });

    const formatDateToDMY = (dateString) => {
        if (!dateString) return '-';

        const cleanDate = String(dateString).substring(0, 10);
        const parts = cleanDate.split('-');

        if (parts.length !== 3) return dateString;

        const [year, month, day] = parts;

        return `${day}/${month}/${year.slice(-2)}`;
    };

    const handleSort = (key) => {
        let direction = 'asc';

        if (
            sortConfig.key === key &&
            sortConfig.direction === 'asc'
        ) {
            direction = 'desc';
        }

        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return [];
        if (!sortConfig.key) return data;

        return [...data].sort((a, b) => {
            const valA = a[sortConfig.key] ?? '';
            const valB = b[sortConfig.key] ?? '';

            const comparison = String(valA).localeCompare(
                String(valB),
                undefined,
                {
                    numeric: true,
                    sensitivity: 'base',
                }
            );

            return sortConfig.direction === 'asc'
                ? comparison
                : -comparison;
        });
    }, [data, sortConfig]);

    const renderSortIcon = (key) => {
        if (sortConfig.key !== key) {
            return (
                <ArrowUpDown
                    size={13}
                    className="text-slate-400 group-hover:text-slate-600 transition"
                />
            );
        }

        return sortConfig.direction === 'asc' ? (
            <ArrowUp size={13} className="text-blue-600" />
        ) : (
            <ArrowDown size={13} className="text-blue-600" />
        );
    };

    const renderStatus = (status) => {
        const labels = {
            pending: 'Pending',
            active: 'Active',
            finish: 'Finish',
        };

        return (
            <span className="text-[10px] font-bold uppercase">
                {labels[status] || status || '-'}
            </span>
        );
    };

    const renderNomorAturanBadges = (list) => {
        if (!list || list.length === 0) {
            return <span className="text-slate-400">-</span>;
        }

        return (
            <div className="flex flex-wrap gap-1">
                {list.map((aturan) => (
                    <span
                        key={aturan}
                        className="px-1.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-mono font-semibold whitespace-nowrap"
                    >
                        {aturan}
                    </span>
                ))}
            </div>
        );
    };

    return (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">

            {/* Header */}
            <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <span className="text-xs font-bold text-slate-700 tracking-wide uppercase">
                    TARGET KERJA TANGGAL :{' '}
                    <span className="text-blue-900 font-extrabold">
                        {formatDateToDMY(selectedDate)}
                    </span>
                </span>

                <span className="text-xs text-slate-500">
                    Total Target:{' '}
                    <strong>{data?.length || 0}</strong> Batch
                </span>
            </div>

            {/* DESKTOP */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                    <thead>
                        <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 select-none">

                            <th className="p-3 text-center w-12 border-r border-slate-200">
                                NO
                            </th>

                            <th
                                className="p-3 border-r border-slate-200 cursor-pointer hover:bg-slate-200/70 transition group"
                                onClick={() => handleSort('kode_batch')}
                            >
                                <div className="flex items-center justify-between gap-1">
                                    <span>KODE BATCH</span>
                                    {renderSortIcon('kode_batch')}
                                </div>
                            </th>

                            <th className="p-3 w-32 border-r border-slate-200">
                                TGL TARGET
                            </th>

                            <th className="p-3 border-r border-slate-200">
                                NOMOR ATURAN
                            </th>

                            <th
                                className="p-3 text-right w-32 border-r border-slate-200 cursor-pointer hover:bg-slate-200/70 transition group"
                                onClick={() => handleSort('jumlah_bal')}
                            >
                                <div className="flex items-center justify-end gap-1">
                                    <span>JUMLAH BAL</span>
                                    {renderSortIcon('jumlah_bal')}
                                </div>
                            </th>

                            <th className="p-3 text-center w-28 border-r border-slate-200">
                                STATUS
                            </th>

                            <th className="p-3 text-center w-24">
                                AKSI
                            </th>
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-200">
                        {loading ? (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="p-8 text-center text-slate-400"
                                >
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2
                                            className="animate-spin"
                                            size={18}
                                        />
                                        <span>
                                            Memuat data target R&D...
                                        </span>
                                    </div>
                                </td>
                            </tr>
                        ) : sortedData.length > 0 ? (
                            sortedData.map((row, idx) => (
                                <tr
                                    key={row.id || idx}
                                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    onClick={() => onDetail(row)}
                                >
                                    <td className="p-3 text-center font-semibold text-slate-500 border-r border-slate-100">
                                        {idx + 1}
                                    </td>

                                    <td className="p-3 border-r border-slate-100 font-mono font-bold text-blue-900">
                                        {row.kode_batch || '-'}
                                    </td>

                                    <td className="p-3 border-r border-slate-100 font-medium text-slate-600">
                                        {formatDateToDMY(row.tanggal)}
                                    </td>

                                    <td className="p-3 border-r border-slate-100">
                                        {renderNomorAturanBadges(row.nomor_aturan_list)}
                                    </td>

                                    <td className="p-3 text-right font-mono font-bold text-slate-800 border-r border-slate-100">
                                        {row.jumlah_bal ?? 0} Bal
                                    </td>

                                    <td className="p-3 text-center border-r border-slate-100">
                                        {renderStatus(row.status)}
                                    </td>

                                    <td
                                        className="p-3 text-center"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                type="button"
                                                onClick={() => onDetail(row)}
                                                className="p-1 text-slate-500 hover:text-indigo-600 rounded hover:bg-slate-100 transition"
                                                title="Detail Target"
                                            >
                                                <Eye size={14} />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => onDelete(row.kode_batch)}
                                                className="p-1 text-slate-500 hover:text-rose-600 rounded hover:bg-slate-100 transition"
                                                title="Hapus Target"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="7"
                                    className="p-8 text-center text-slate-400"
                                >
                                    Belum ada target kerja R&D yang diinput
                                    untuk tanggal ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* MOBILE */}
            <div className="block md:hidden p-4 space-y-3 bg-slate-50">

                <div className="flex justify-end mb-1">
                    <button
                        type="button"
                        onClick={() => handleSort('kode_batch')}
                        className="text-[11px] flex items-center gap-1 text-slate-600 font-semibold bg-white px-2.5 py-1 rounded border border-slate-200"
                    >
                        <span>Urutkan Kode Batch</span>
                        {renderSortIcon('kode_batch')}
                    </button>
                </div>

                {loading ? (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200 flex items-center justify-center gap-2">
                        <Loader2
                            className="animate-spin"
                            size={16}
                        />
                        Memuat data...
                    </div>
                ) : sortedData.length > 0 ? (
                    sortedData.map((row, idx) => (
                        <div
                            key={row.id || idx}
                            className="bg-white rounded-lg border border-slate-200 p-3.5 space-y-2 shadow-2xs"
                            onClick={() => onDetail(row)}
                        >
                            <div className="flex justify-between items-start border-b border-slate-100 pb-2">
                                <div>
                                    <div className="font-mono font-bold text-xs text-blue-900">
                                        {row.kode_batch || '-'}
                                    </div>
                                    <div className="text-[11px] text-slate-600 font-medium mt-1">
                                        Tgl Target: {formatDateToDMY(row.tanggal)}
                                    </div>
                                </div>

                                <div
                                    className="flex items-center gap-2"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onDetail(row)}
                                        className="text-slate-400 hover:text-indigo-600"
                                    >
                                        <Eye size={14} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => onDelete(row.kode_batch)}
                                        className="text-slate-400 hover:text-rose-600"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <div>
                                <span className="text-slate-400 block text-[10px]">
                                    NOMOR ATURAN
                                </span>
                                <div className="mt-0.5">
                                    {renderNomorAturanBadges(row.nomor_aturan_list)}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                                <div>
                                    <span className="text-slate-400 block text-[10px]">
                                        JUMLAH BAL
                                    </span>
                                    <span className="font-mono font-bold text-slate-800">
                                        {row.jumlah_bal ?? 0} Bal
                                    </span>
                                </div>

                                <div>
                                    <span className="text-slate-400 block text-[10px]">
                                        STATUS
                                    </span>
                                    <span className="font-bold uppercase text-slate-700">
                                        {row.status || '-'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-lg border border-slate-200">
                        Belum ada target kerja R&D yang diinput.
                    </div>
                )}
            </div>
        </div>
    );
}