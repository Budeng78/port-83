import React, { useState, useEffect } from 'react';
import { trashService } from '@Modules/System/Resources/js/aplikasi/services/trashService.js';

export default function TrashManagement() {
    const [trashedItems, setTrashedItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchTrashData = async () => {
        setLoading(true);
        try {
            // Memanggil endpoint global untuk mengambil data dari seluruh tabel/modul
            const response = await trashService.getAllTrashedData();
            const items = response.data || response;
            setTrashedItems(items);
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memuat data tempat sampah global.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrashData();
    }, []);

    const handleRestore = async (item) => {
        if (!confirm(`Apakah Anda yakin ingin memulihkan data dari tabel "${item.table_name}" ini?`)) return;

        try {
            await trashService.restoreData(item.source_module, item.source_resource, item.id);
            setMessage({ type: 'success', text: 'Data berhasil dipulihkan.' });
            fetchTrashData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memulihkan data.' });
        }
    };

    const handleForceDelete = async (item) => {
        if (!confirm(`Peringatan! Data dari tabel "${item.table_name}" akan dihapus secara permanen dan tidak dapat dikembalikan. Lanjutkan?`)) return;

        try {
            await trashService.forceDeleteData(item.source_module, item.source_resource, item.id);
            setMessage({ type: 'success', text: 'Data berhasil dihapus permanen.' });
            fetchTrashData();
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menghapus permanen data.' });
        }
    };

    return (
        <div className="p-6 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-800">
                        Tempat Sampah Global
                    </h2>
                    <p className="text-xs text-gray-400 mt-1">
                        Menampilkan seluruh data terhapus dari semua modul dan tabel database secara otomatis.
                    </p>
                </div>
                <button
                    onClick={fetchTrashData}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded-md transition"
                >
                    Muat Ulang
                </button>
            </div>

            {message.text && (
                <div className={`mb-4 p-3 rounded-md text-sm ${message.type === 'error' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {message.text}
                </div>
            )}

            {loading ? (
                <div className="text-center py-8 text-gray-500">Memindai seluruh tabel database...</div>
            ) : trashedItems.length === 0 ? (
                <div className="text-center py-8 text-gray-400 bg-gray-50 rounded-md border border-dashed border-gray-200">
                    Tidak ada data di dalam tempat sampah dari seluruh tabel.
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                {/* 1. Nama Tabel (Paling Kiri) */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Tabel
                                </th>
                                {/* 2. Nama Item (Di sebelah kanannya) */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Nama Item
                                </th>
                                {/* 3. Dihapus Oleh */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Dihapus Oleh
                                </th>
                                {/* 4. Waktu Dihapus */}
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Waktu Dihapus
                                </th>
                                {/* 5. Aksi */}
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {trashedItems.map((item) => (
                                <tr key={`${item.table_name}-${item.id}`} className="hover:bg-gray-50">
                                    {/* 1. Kolom Nama Tabel (Paling Kiri) */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="px-2.5 py-1 text-xs font-mono font-semibold bg-gray-100 text-gray-700 rounded border border-gray-200">
                                            {item.table_name}
                                        </span>
                                    </td>

                                    {/* 2. Kolom Nama Item (Dinamis dari controller) */}
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-gray-900">
                                            {item.display_title}
                                        </div>
                                        {item.display_subtitle && (
                                            <div className="text-xs text-gray-500 font-mono">
                                                {item.display_subtitle}
                                            </div>
                                        )}
                                    </td>

                                    {/* 3. Kolom Dihapus Oleh */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.deleted_by?.name || 'Sistem / Tidak Diketahui'}
                                    </td>

                                    {/* 4. Kolom Waktu Dihapus */}
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {item.deleted_at ? new Date(item.deleted_at).toLocaleString() : '-'}
                                    </td>

                                    {/* 5. Kolom Aksi */}
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                                        <button
                                            onClick={() => handleRestore(item)}
                                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded transition"
                                        >
                                            Pulihkan
                                        </button>
                                        <button
                                            onClick={() => handleForceDelete(item)}
                                            className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded transition"
                                        >
                                            Hapus Permanen
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}