import React from 'react';

import {
    FileText,
    Eye,
    Pencil,
    Trash2,
    Printer,
} from 'lucide-react';


// =====================================================
// COMPONENT
// =====================================================

export default function KirimanTbkTable({
    data = [],
    loading = false,
    deletingId = null,
    onDetail,
    onEdit,
    onDelete,
    onPrint,
}) {

    // =====================================================
    // LOADING
    // =====================================================

    if (loading) {
        return (
            <div className="py-10 text-center text-gray-500">
                Memuat data kiriman...
            </div>
        );
    }


    // =====================================================
    // EMPTY
    // =====================================================

    if (!data.length) {
        return (
            <div className="py-10 text-center text-gray-500">
                Belum ada data kiriman.
            </div>
        );
    }


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">

            <table className="min-w-full divide-y divide-gray-200">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <thead className="bg-gray-50">

                    <tr>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            No
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Surat Kiriman
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Kendaraan
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Sopir
                        </th>

                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Dari
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Item
                        </th>

                        <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-gray-600">
                            Aksi
                        </th>

                    </tr>

                </thead>


                {/* =====================================================
                    BODY
                ===================================================== */}

                <tbody className="divide-y divide-gray-200 bg-white">

                    {data.map((kiriman, index) => (

                        <tr
                            key={kiriman.id}
                            className="hover:bg-gray-50"
                        >

                            {/* No */}

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                {index + 1}
                            </td>


                            {/* Surat */}

                            <td className="px-4 py-3">

                                <div className="flex items-center gap-2">

                                    <FileText
                                        size={18}
                                        className="text-gray-500"
                                    />

                                    <span className="text-sm font-medium text-gray-800">
                                        {kiriman.no_surat_kiriman}
                                    </span>

                                </div>

                            </td>


                            {/* Kendaraan */}

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                {kiriman.nomor_kendaraan}
                            </td>


                            {/* Sopir */}

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                {kiriman.nama_sopir}
                            </td>


                            {/* Dari */}

                            <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700">
                                {kiriman.dari}
                            </td>


                            {/* Jumlah item */}

                            <td className="px-4 py-3 text-center">

                                <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700">
                                    {kiriman.details?.length ?? 0}
                                </span>

                            </td>


                            {/* Action */}

                            <td className="px-4 py-3">

                                <div className="flex items-center justify-center gap-1">


                                    {/* Detail */}

                                    <button
                                        type="button"
                                        onClick={() => onDetail?.(kiriman)}
                                        title="Detail"
                                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <Eye size={17} />
                                    </button>


                                    {/* Edit */}

                                    <button
                                        type="button"
                                        onClick={() => onEdit?.(kiriman)}
                                        title="Edit"
                                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                    >
                                        <Pencil size={17} />
                                    </button>


                                    {/* Print */}

                                    {onPrint && (
                                        <button
                                            type="button"
                                            onClick={() => onPrint(kiriman)}
                                            title="Print"
                                            className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                                        >
                                            <Printer size={17} />
                                        </button>
                                    )}


                                    {/* Delete */}

                                    <button
                                        type="button"
                                        disabled={deletingId === kiriman.id}
                                        onClick={() => onDelete?.(kiriman)}
                                        title="Hapus"
                                        className="rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        {deletingId === kiriman.id ? (
                                            <span className="text-xs">
                                                ...
                                            </span>
                                        ) : (
                                            <Trash2 size={17} />
                                        )}

                                    </button>

                                </div>

                            </td>

                        </tr>

                    ))}

                </tbody>

            </table>

        </div>
    );
}