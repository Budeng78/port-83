import React from 'react';

import {
    Pencil,
    Trash2,
} from 'lucide-react';

export default function TargetAturanDetailTable({
    data = [],
    loading = false,
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
                            Type
                        </th>

                        <th className="px-4 py-3 text-left">
                            Jenis TBK
                        </th>

                        <th className="px-4 py-3 text-left">
                            Tahun
                        </th>

                        <th className="px-4 py-3 text-left">
                            Grade
                        </th>

                        <th className="px-4 py-3 text-left">
                            S/K
                        </th>

                        <th className="px-4 py-3 text-right">
                            Jumlah Bal
                        </th>

                        <th className="px-4 py-3 text-right">
                            Berat Bruto
                        </th>

                        <th className="px-4 py-3 text-right">
                            Tara
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
                                colSpan="10"
                                className="px-4 py-6 text-center"
                            >
                                Memuat data...
                            </td>
                        </tr>
                    ) : data.length === 0 ? (
                        <tr>
                            <td
                                colSpan="10"
                                className="px-4 py-6 text-center text-gray-500"
                            >
                                Belum ada detail.
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

                                <td className="px-4 py-3">
                                    {item.type}
                                </td>

                                <td className="px-4 py-3">
                                    {item.jenis_tbk}
                                </td>

                                <td className="px-4 py-3">
                                    {item.tahun}
                                </td>

                                <td className="px-4 py-3">
                                    {item.grade}
                                </td>

                                <td className="px-4 py-3">
                                    {item.s_k}
                                </td>

                                <td className="px-4 py-3 text-right">
                                    {item.jumlah_bal}
                                </td>

                                <td className="px-4 py-3 text-right">
                                    {item.berat_bruto}
                                </td>

                                <td className="px-4 py-3 text-right">
                                    {item.tara}
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex justify-center gap-2">
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