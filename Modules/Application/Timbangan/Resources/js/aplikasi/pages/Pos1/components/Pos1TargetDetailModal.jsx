
import React from 'react';
import { X, Edit, Trash2 } from 'lucide-react';

export default function Pos1TargetDetailModal({
    isOpen,
    onClose,
    batchData,
    onEditItem,
}) {
    if (!isOpen || !batchData) return null;

    const handleDeleteItem = async (itemId) => {
        if (!confirm('Yakin ingin menghapus item ini?')) return;

        try {
            // Import service jika diperlukan
            const pos1TargetService = await import('@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/pos1TargetService.js').then(m => m.default);
            await pos1TargetService.delete(itemId);
            onClose(); // Close modal after delete
        } catch (error) {
            console.error('Gagal menghapus item:', error);
        }
    };

    const formatDateToDMY = (dateString) => {
        if (!dateString) return '-';
        const cleanDate = String(dateString).substring(0, 10);
        const parts = cleanDate.split('-');
        if (parts.length !== 3) return dateString;
        const [year, month, day] = parts;
        return `${day}/${month}/${year.slice(-2)}`;
    };

    const renderStatusBadge = (status) => {
        const colors = {
            pending: 'bg-yellow-100 text-yellow-700',
            active: 'bg-blue-100 text-blue-700',
            finish: 'bg-green-100 text-green-700',
        };
        
        return (
            <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded ${colors[status] || 'bg-slate-100 text-slate-700'}`}>
                {status || '-'}
            </span>
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
            <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-6xl my-8 overflow-hidden flex flex-col max-h-[90vh]">
                
                {/* Header Modal */}
                <div className="px-6 py-4 bg-gradient-to-r from-slate-800 to-slate-700 text-white flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold">Detail Rincian Target Batch</h3>
                        <p className="text-xs text-slate-300 mt-1">
                            Kode Batch: <span className="font-mono font-bold text-blue-300">{batchData.kode_batch}</span> 
                            {' '} | Tanggal: <span className="font-semibold">{formatDateToDMY(batchData.tanggal)}</span>
                            {' '} | Status: {renderStatusBadge(batchData.status)}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-slate-600 transition-colors"
                        title="Tutup"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Summary Stats */}
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="bg-white rounded-lg p-2 border border-slate-200">
                        <p className="text-slate-500 font-semibold">Jumlah Aturan</p>
                        <p className="text-lg font-bold text-slate-900">{batchData.jumlah_aturan || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-slate-200">
                        <p className="text-slate-500 font-semibold">Jenis TBK</p>
                        <p className="text-lg font-bold text-slate-900">{batchData.jumlah_jenis_tbk || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-slate-200">
                        <p className="text-slate-500 font-semibold">Total Item</p>
                        <p className="text-lg font-bold text-slate-900">{batchData.items?.length || 0}</p>
                    </div>
                    <div className="bg-white rounded-lg p-2 border border-slate-200">
                        <p className="text-slate-500 font-semibold">Total Bal</p>
                        <p className="text-lg font-bold text-emerald-600">{batchData.jumlah_bal || 0}</p>
                    </div>
                </div>

                {/* Body - Detail Table */}
                <div className="p-6 overflow-y-auto flex-1">
                    <div className="border border-slate-200 rounded-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-xs text-left text-slate-700">
                                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 sticky top-0">
                                    <tr>
                                        <th className="px-3 py-2.5 text-center w-12">No</th>
                                        <th className="px-3 py-2.5">Nomor Aturan</th>
                                        <th className="px-3 py-2.5">Jenis TBK</th>
                                        <th className="px-3 py-2.5 w-16">Tahun</th>
                                        <th className="px-3 py-2.5 w-16">Grade</th>
                                        <th className="px-3 py-2.5 w-12">S/K</th>
                                        <th className="px-3 py-2.5 w-20">Type</th>
                                        <th className="px-3 py-2.5 text-right w-20">Jumlah Bal</th>
                                        <th className="px-3 py-2.5 text-right w-20">Tara (kg)</th>
                                        <th className="px-3 py-2.5 text-center w-20">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-200">
                                    {batchData.items && batchData.items.length > 0 ? (
                                        batchData.items.map((item, idx) => (
                                            <tr key={item.id || idx} className="hover:bg-blue-50/50 transition-colors">
                                                <td className="px-3 py-2.5 text-center text-slate-500 font-semibold">
                                                    {idx + 1}
                                                </td>
                                                <td className="px-3 py-2.5 font-bold text-blue-900">
                                                    {item.nomor_aturan || '-'}
                                                </td>
                                                <td className="px-3 py-2.5">
                                                    {item.jenis_tbk || '-'}
                                                </td>
                                                <td className="px-3 py-2.5 text-center font-medium">
                                                    {item.tahun || '-'}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className="px-2 py-0.5 bg-slate-200 text-slate-800 rounded font-mono font-semibold">
                                                        {item.grade || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center font-medium">
                                                    {item.s_k || '-'}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <span className={`px-2 py-0.5 rounded font-semibold text-white capitalize ${
                                                        item.type === 'krosok' ? 'bg-purple-600' : 'bg-orange-600'
                                                    }`}>
                                                        {item.type || '-'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-bold text-slate-900">
                                                    {item.jumlah_bal || 0}
                                                </td>
                                                <td className="px-3 py-2.5 text-right font-mono text-slate-600">
                                                    {parseFloat(item.tara || 0).toFixed(3)}
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <button
                                                            type="button"
                                                            onClick={() => onEditItem?.(item)}
                                                            className="p-1.5 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded transition"
                                                            title="Edit Item"
                                                        >
                                                            <Edit size={14} />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeleteItem(item.id)}
                                                            className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded transition"
                                                            title="Hapus Item"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="10" className="px-3 py-6 text-center text-slate-400">
                                                Tidak ada rincian item pada batch ini.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Footer Modal */}
                <div className="px-6 py-3 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                        Tutup
                    </button>
                </div>
            </div>
        </div>
    );
}
