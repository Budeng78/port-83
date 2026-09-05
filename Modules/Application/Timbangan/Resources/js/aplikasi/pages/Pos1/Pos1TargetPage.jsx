import React, {
    useState,
    useEffect,
    useMemo,
    useCallback,
} from 'react';

import {
    Search,
    Calendar,
    Plus,
    Printer,
    FileText,
} from 'lucide-react';

import pos1TargetService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/pos1TargetService.js';
import Pos1TargetForm from './components/Pos1TargetForm';
import Pos1TargetTable from './components/Pos1TargetTable';

export default function Pos1TargetPage({ onPrint }) {
    const today = new Date().toISOString().split('T')[0];

    // State Filtering & Data
    const [selectedDate, setSelectedDate] = useState(today);
    const [searchQuery, setSearchQuery] = useState('');
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);

    // State Modal & Form
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Fetch Data
    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await pos1TargetService.getAll({
                tanggal: selectedDate,
            });

            const items =
                response?.data ||
                (Array.isArray(response) ? response : []);

            setDataList(items);
        } catch (error) {
            console.error('Gagal mengambil data target:', error);
            setDataList([]);
        } finally {
            setLoading(false);
        }
    }, [selectedDate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Search Filtering
    const filteredData = useMemo(() => {
        if (!Array.isArray(dataList)) return [];

        const query = searchQuery.toLowerCase().trim();

        if (!query) return dataList;

        return dataList.filter((item) =>
            [
                item.nomor_aturan,
                item.jenis_tbk,
                item.tahun,
                item.grade,
                item.s_k,
                item.type,
                item.status,
            ].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(query)
            )
        );
    }, [dataList, searchQuery]);

    // Handlers Modal
    const handleOpenCreateModal = () => {
        setEditingItem(null);
        setIsModalOpen(true);
    };

    const handleOpenEditModal = (item) => {
        setEditingItem(item);
        setIsModalOpen(true);
    };

    const handleDeleteClick = async (id) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data target ini?')) {
            return;
        }

        try {
            await pos1TargetService.delete(id);
            fetchData();
        } catch (error) {
            console.error('Gagal menghapus data:', error);
        }
    };

    const handlePrintClick = () => {
        if (onPrint) {
            onPrint(selectedDate, filteredData);
        } else {
            window.print();
        }
    };

    return (
        <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">

            {/* CARD 1: CONTROL PANEL */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                    {/* Judul & Info */}
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                            <FileText
                                className="text-blue-900"
                                size={22}
                            />
                            Target Kerja Timbangan Pos 1 (R&D)
                        </h1>

                        <p className="text-xs text-slate-500 mt-0.5">
                            Input target acuan bal tembakau harian untuk
                            dilakukan penimbangan di Pos 1
                        </p>
                    </div>

                    {/* Controls & Filters */}
                    <div className="flex flex-wrap items-center gap-2.5">

                        {/* Filter Tanggal */}
                        <div className="relative flex-1 sm:flex-none">
                            <Calendar
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />

                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) =>
                                    setSelectedDate(e.target.value)
                                }
                                className="w-full sm:w-auto pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>

                        {/* Search Input */}
                        <div className="relative flex-1 sm:w-60">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />

                            <input
                                type="text"
                                placeholder="Cari No Aturan, Jenis, Tahun, Grade..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>

                        {/* Print */}
                        <button
                            type="button"
                            onClick={handlePrintClick}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-2xs"
                        >
                            <Printer
                                size={15}
                                className="text-slate-600"
                            />
                            Print
                        </button>

                        {/* Tambah Target */}
                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition shadow-2xs"
                        >
                            <Plus size={16} />
                            Buat Target Kerja
                        </button>
                    </div>
                </div>
            </div>

            {/* CARD 2: TABEL & DATA LIST */}
            <Pos1TargetTable
                data={filteredData}
                loading={loading}
                selectedDate={selectedDate}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteClick}
            />

            {/* MODAL FORM */}
            <Pos1TargetForm
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchData}
                initialData={editingItem}
                selectedDate={selectedDate}
            />
        </div>
    );
}
