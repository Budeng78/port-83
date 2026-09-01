import React, { useState, useEffect } from 'react';
import { tobaccoAturanService } from '../../services/tobaccoAturanService.js';

export default function TobaccoAturan() {
    const [dataList, setDataList] = useState([]);
    const [totalRencana, setTotalRencana] = useState(0);
    const [loading, setLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [isEdit, setIsEdit] = useState(false);
    
    const initialFormState = {
        id: null,
        code: '',
        type: 'krosok',
        form_number: '',
        document_date: '',
        item_no: '',
        gdg: '',
        jenis_tembakau: '',
        tahun: new Date().getFullYear(),
        s_k: '',
        grade: '',
        rencana: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await tobaccoAturanService.getAll();
            setDataList(response.data || response);
            setTotalRencana(response.total_rencana || 0);
        } catch (error) {
            console.error('Gagal mengambil data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleOpenAdd = () => {
        setIsEdit(false);
        setFormData(initialFormState);
        setModalOpen(true);
    };

    const handleOpenEdit = (item) => {
        setIsEdit(true);
        setFormData(item);
        setModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (isEdit) {
                await tobaccoAturanService.update(formData.id, formData);
            } else {
                await tobaccoAturanService.create(formData);
            }
            setModalOpen(false);
            fetchData();
        } catch (error) {
            console.error('Gagal menyimpan data:', error);
            alert(error.response?.data?.message || 'Terjadi kesalahan saat menyimpan data.');
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data ini?')) {
            try {
                await tobaccoAturanService.delete(id);
                fetchData();
            } catch (error) {
                console.error('Gagal menghapus data:', error);
            }
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Aturan Tembakau (RnD)</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Total Rencana: <span className="font-semibold text-indigo-600">{Number(totalRencana).toLocaleString()}</span>
                    </p>
                </div>
                <button
                    onClick={handleOpenAdd}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow-sm text-sm font-medium transition duration-150 ease-in-out"
                >
                    + Tambah Aturan
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white shadow-sm rounded-xl overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Kode</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tipe</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Jenis Tembakau</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Grade</th>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Rencana</th>
                                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">Memuat data...</td>
                                </tr>
                            ) : dataList.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-8 text-gray-500 text-sm">Belum ada data tersedia.</td>
                                </tr>
                            ) : (
                                dataList.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 uppercase">{item.type}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.jenis_tembakau}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{item.grade}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{Number(item.rencana).toLocaleString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => handleOpenEdit(item)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                                            <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">Hapus</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Form */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center pb-3 border-b mb-4">
                            <h2 className="text-lg font-bold text-gray-800">
                                {isEdit ? 'Edit Aturan Tembakau' : 'Tambah Aturan Tembakau'}
                            </h2>
                            <button 
                                onClick={() => setModalOpen(false)}
                                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Kode</label>
                                <input
                                    type="text"
                                    value={formData.code}
                                    onChange={(e) => setFormData({...formData, code: e.target.value})}
                                    required
                                    className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tipe</label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                                    className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="krosok">Krosok</option>
                                    <option value="precut">Precut</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Nomor Form</label>
                                    <input
                                        type="text"
                                        value={formData.form_number}
                                        onChange={(e) => setFormData({...formData, form_number: e.target.value})}
                                        required
                                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Item No</label>
                                    <input
                                        type="number"
                                        value={formData.item_no}
                                        onChange={(e) => setFormData({...formData, item_no: e.target.value})}
                                        required
                                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Gudang (GDG)</label>
                                    <input
                                        type="text"
                                        value={formData.gdg}
                                        onChange={(e) => setFormData({...formData, gdg: e.target.value})}
                                        required
                                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Jenis Tembakau</label>
                                    <input
                                        type="text"
                                        value={formData.jenis_tembakau}
                                        onChange={(e) => setFormData({...formData, jenis_tembakau: e.target.value})}
                                        required
                                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Tahun</label>
                                    <input
                                        type="number"
                                        value={formData.tahun}
                                        onChange={(e) => setFormData({...formData, tahun: e.target.value})}
                                        required
                                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">S-K</label>
                                    <input
                                        type="text"
                                        value={formData.s_k}
                                        onChange={(e) => setFormData({...formData, s_k: e.target.value})}
                                        required
                                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Grade</label>
                                    <input
                                        type="text"
                                        value={formData.grade}
                                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                                        required
                                        className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Rencana</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.rencana}
                                    onChange={(e) => setFormData({...formData, rencana: e.target.value})}
                                    required
                                    className="w-full border border-gray-300 rounded-lg shadow-sm p-2.5 text-sm"
                                />
                            </div>

                            <div className="flex justify-end space-x-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
                                >
                                    Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}