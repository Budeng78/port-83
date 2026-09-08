import React from 'react';

import {
    Pencil,
    Trash2,
    Eye,
} from 'lucide-react';

export default function TargetAturanTable({
    data = [],
    loading = false,
    onDetail,
    onEdit,
    onDelete,
}) {
    return (
        <div className="overflow-hidden rounded-lg border bg-white">
            <table className="w-full text-sm">
                <thead className="border-b bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left">
                            No
                        </th>

                        <th className="px-4 py-3 text-left">
                            Nomor Aturan
                        </th>

                        <th className="px-4 py-3 text-center">
                            Detail
                        </th>

                        <th className="px-4 py-3 text-center">
                            Aksi
                        </th>
                    </tr>
                </thead>

                <tbody>
                    {loading ? (
                        <tr>
                            <td
                                colSpan="4"
                                className="px-4 py-6 text-center"
                            >
                                Memuat data...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan="4"
                                className="px-4 py-6 text-center text-gray-500"
                            >
                                Belum ada aturan.
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr
                                key={item.id}
                                className="border-b last:border-0"
                            >
                                <td className="px-4 py-3">
                                    {index + 1}
                                </td>

                                <td className="px-4 py-3 font-medium">
                                    {item.nomor_aturan}
                                </td>

                                <td className="px-4 py-3 text-center">
                                    {item.detail_count ?? 0}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDetail?.(item)
                                            }
                                            title="Detail"
                                        >
                                            <Eye size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onEdit?.(item)
                                            }
                                            title="Edit"
                                        >
                                            <Pencil size={17} />
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                onDelete?.(item)
                                            }
                                            title="Hapus"
                                        >
                                            <Trash2 size={17} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
}