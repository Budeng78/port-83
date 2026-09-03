import React from 'react';

import {
    Pencil,
    Trash2,
    Scale,
} from 'lucide-react';

export default function Pos1TargetTable({
    data = [],
    loading = false,
    onEdit,
    onDelete,
    onTimbang,
}) {
    if (loading) {
        return (
            <div className="py-10 text-center text-gray-500">
                Memuat data target...
            </div>
        );
    }

    if (!data.length) {
        return (
            <div className="py-10 text-center text-gray-500">
                Belum ada target.
            </div>
        );
    }

    return (
        <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-4 py-3 text-left">No</th>
                        <th className="px-4 py-3 text-left">Tanggal</th>
                        <th className="px-4 py-3 text-left">
                            Nomor Aturan
                        </th>
                        <th className="px-4 py-3 text-left">
                            Jenis Tembakau
                        </th>
                        <th className="px-4 py-3 text-left">S/K</th>
                        <th className="px-4 py-3 text-right">
                            Jumlah Bal
                        </th>
                        <th className="px-4 py-3 text-center">
                            Aksi
                        </th>
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 bg-white">
                    {data.map((item, index) => (
                        <tr key={item.id}>
                            <td className="px-4 py-3">
                                {index + 1}
                            </td>

                            <td className="px-4 py-3">
                                {item.tanggal
                                    ? new Date(
                                          item.tanggal
                                      ).toLocaleDateString('id-ID')
                                    : '-'}
                            </td>

                            <td className="px-4 py-3 font-medium">
                                {item.nomor_aturan}
                            </td>

                            <td className="px-4 py-3">
                                {item.jenis_tbk}
                            </td>

                            <td className="px-4 py-3">
                                {item.s_k}
                            </td>

                            <td className="px-4 py-3 text-right">
                                {item.jumlah_bal}
                            </td>

                            <td className="px-4 py-3">
                                <div className="flex justify-center gap-2">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            onTimbang?.(item)
                                        }
                                        className="rounded-md p-2 text-green-600 hover:bg-green-50"
                                        title="Mulai Timbang"
                                    >
                                        <Scale size={17} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onEdit?.(item)
                                        }
                                        className="rounded-md p-2 text-blue-600 hover:bg-blue-50"
                                        title="Edit"
                                    >
                                        <Pencil size={17} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            onDelete?.(item)
                                        }
                                        className="rounded-md p-2 text-red-600 hover:bg-red-50"
                                        title="Hapus"
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
    );
}
