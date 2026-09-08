
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
    RefreshCw,
} from 'lucide-react';

import pos1TargetService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/pos1TargetService.js';
import Pos1TargetForm from './components/Pos1TargetForm';
import Pos1TargetTable from './components/Pos1TargetTable';
import Pos1TargetDetailModal from './components/Pos1TargetDetailModal';

export default function Pos1TargetPage({ onPrint }) {
    // Get current month in YYYY-MM format
    const getCurrentMonth = () => {
        const today = new Date();
        const year = today.getFullYear();
        const month = String(today.getMonth() + 1).padStart(2, '0');
        return `${year}-${month}`;
    };

    const currentMonth = getCurrentMonth();

    // State Filtering & Data
    const [selectedMonth, setSelectedMonth] = useState(currentMonth);
    const [searchQuery, setSearchQuery] = useState('');
    const [dataList, setDataList] = useState([]);
    const [loading, setLoading] = useState(false);

    // State Modal Form & Detail
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBatch, setEditingBatch] = useState(null);
    const [editingItem, setEditingItem] = useState(null);
    const [generatingBatch, setGeneratingBatch] = useState(false);

    // State Khusus Modal Detail
    const [detailItem, setDetailItem] = useState(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Get month range based on selected month (YYYY-MM)

const getMonthRange = useCallback(() => {
    const [year, month] = selectedMonth.split('-');
    
    // Format bulan dengan padding 0
    const monthPad = String(month).padStart(2, '0');
    
    // Buat date untuk cari hari terakhir bulan
    const lastDay = new Date(parseInt(year), parseInt(month), 0);
    const dayPad = String(lastDay.getDate()).padStart(2, '0');
    
    const startDate = `${year}-${monthPad}-01`;
    const endDate = `${year}-${monthPad}-${dayPad}`;
    

    
    return {
        startDate,
        endDate,
    };
}, [selectedMonth]);



    // Fetch Data
    
    // Tambahkan ini di Pos1TargetPage.js, di dalam fetchData():

    const fetchData = useCallback(async () => {
        setLoading(true);

        try {
            const range = getMonthRange();
            
          
            
            const response = await pos1TargetService.getAll({
                tanggal_dari: range.startDate,
                tanggal_sampai: range.endDate,
            });

            const items = response?.data || (Array.isArray(response) ? response : []);

          
            
            // Debug: cek tanggal masing-masing item
            const tanggalSet = new Set(items.map(item => item.tanggal));
          

            setDataList(items);
        } catch (error) {
            console.error('❌ Gagal mengambil data target:', error);
            setDataList([]);
        } finally {
            setLoading(false);
        }
    }, [getMonthRange]);


    // Trigger fetch saat selectedMonth berubah
    useEffect(() => {
        fetchData();
    }, [selectedMonth]);

    // GROUPING: dari data mentah (flat per-item) -> 1 baris ringkasan per kode_batch
    const groupedData = useMemo(() => {
        if (!Array.isArray(dataList)) return [];

        const map = new Map();

        for (const row of dataList) {
            const key = row.kode_batch;

            if (!map.has(key)) {
                map.set(key, {
                    id: row.kode_batch,
                    kode_batch: row.kode_batch,
                    tanggal: row.tanggal,
                    status: row.status,
                    created_at: row.created_at,
                    jumlah_bal: 0,
                    _nomorAturanSet: new Set(),
                    _jenisTbkSet: new Set(),
                    items: [],
                });
            }

            const group = map.get(key);

            group.jumlah_bal += Number(row.jumlah_bal || 0);
            group._nomorAturanSet.add(row.nomor_aturan);
            group._jenisTbkSet.add(row.jenis_tbk);
            group.items.push(row);
        }

        return Array.from(map.values()).map((group) => ({
            id: group.id,
            kode_batch: group.kode_batch,
            tanggal: group.tanggal,
            status: group.status,
            created_at: group.created_at,
            jumlah_bal: group.jumlah_bal,
            jumlah_aturan: group._nomorAturanSet.size,
            nomor_aturan_list: Array.from(group._nomorAturanSet).sort(),
            jumlah_jenis_tbk: group._jenisTbkSet.size,
            items: group.items,
        }));
    }, [dataList]);

    // Search Filtering
    const filteredData = useMemo(() => {
        const query = searchQuery.toLowerCase().trim();

        if (!query) return groupedData;

        return groupedData.filter((item) =>
            [item.kode_batch, item.status].some((value) =>
                String(value ?? '')
                    .toLowerCase()
                    .includes(query)
            )
        );
    }, [groupedData, searchQuery]);

    // Handler Buka Modal Create Batch Baru
    const handleOpenCreateModal = async () => {
        setGeneratingBatch(true);
        setEditingItem(null);
        setEditingBatch(null);

        const today = new Date().toISOString().split('T')[0];
        const defaultData = {
            tanggal: today,
            kode_batch: '',
        };

        try {
            const response = await pos1TargetService.generateBatchCode(today);
            const batchCode = response?.kode_batch || response?.data?.kode_batch || '';

            setEditingBatch({
                ...defaultData,
                kode_batch: batchCode,
            });
        } catch (error) {
            console.error("Gagal generate kode batch:", error);
            setEditingBatch(defaultData);
        } finally {
            setGeneratingBatch(false);
            setIsModalOpen(true);
        }
    };

    // Handler Edit Batch (dari table atau detail modal)
    const handleEditBatch = (batchData) => {
       
        
        // Transform grouped data ke format form
        const aturanMap = new Map();
        
        if (batchData.items && Array.isArray(batchData.items)) {
            batchData.items.forEach((item) => {
                const key = item.nomor_aturan;
                if (!aturanMap.has(key)) {
                    aturanMap.set(key, {
                        nomor_aturan: key,
                        items: [],
                    });
                }
                aturanMap.get(key).items.push({
                    jenis_tbk: item.jenis_tbk,
                    tahun: item.tahun,
                    grade: item.grade || '',
                    s_k: item.s_k || '',
                    type: item.type || 'krosok',
                    jumlah_bal: item.jumlah_bal,
                    tara: item.tara,
                });
            });
        }

        setEditingBatch({
            id: batchData.id,
            kode_batch: batchData.kode_batch,
            tanggal: batchData.tanggal,
            status: batchData.status,
            aturan_list: Array.from(aturanMap.values()),
        });
        setEditingItem(null);
        setIsModalOpen(true);
    };

    // Handler Buka Modal Detail
    const handleDetailClick = (groupRow) => {
        setDetailItem(groupRow);
        setIsDetailOpen(true);
    };

    // Handler Delete Seluruh Batch
    const handleDeleteBatch = async (kodeBatch) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus seluruh target pada batch ${kodeBatch}?`)) {
            return;
        }

        try {
            const rowsInBatch = dataList.filter(
                (row) => row.kode_batch === kodeBatch
            );

            await Promise.all(
                rowsInBatch.map((row) => pos1TargetService.delete(row.id))
            );

            fetchData();
        } catch (error) {
            console.error('Gagal menghapus data:', error);
        }
    };

    const handlePrintClick = (singleRow = null) => {
        if (onPrint) {
            onPrint(selectedMonth, singleRow ? [singleRow] : filteredData);
        } else {
            window.print();
        }
    };

    const handleMonthChange = (e) => {
        setSelectedMonth(e.target.value);
    };

    const formatMonthDisplay = (monthStr) => {
        const [year, month] = monthStr.split('-');
        const date = new Date(year, parseInt(month) - 1, 1);
        return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
    };

    return (
        <div className="space-y-6 p-4 md:p-6 bg-slate-50 min-h-screen">

            {/* CARD 1: CONTROL PANEL */}
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">

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

                    <div className="flex flex-wrap items-center gap-2.5">

                        <div className="relative flex-1 sm:flex-none">
                            <Calendar
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />

                            <input
                                type="month"
                                value={selectedMonth}
                                onChange={handleMonthChange}
                                className="w-full sm:w-auto pl-9 pr-3 py-2 text-xs font-semibold rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>

                        <div className="relative flex-1 sm:w-60">
                            <Search
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                size={16}
                            />

                            <input
                                type="text"
                                placeholder="Cari Kode Batch atau Status..."
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                }
                                className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:border-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-600"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={fetchData}
                            disabled={loading}
                            className="p-2 rounded-lg border border-slate-300 bg-white text-slate-600 hover:bg-slate-50 transition shadow-xs disabled:opacity-50 cursor-pointer"
                            title="Refresh Data"
                        >
                            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
                        </button>

                        <button
                            type="button"
                            onClick={() => handlePrintClick()}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-xs cursor-pointer"
                        >
                            <Printer
                                size={15}
                                className="text-slate-600"
                            />
                            Print Rekap
                        </button>

                        <button
                            type="button"
                            onClick={handleOpenCreateModal}
                            disabled={generatingBatch}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-900 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-950 transition shadow-xs disabled:opacity-50 cursor-pointer"
                        >
                            <Plus size={16} className={generatingBatch ? 'animate-spin' : ''} />
                            {generatingBatch ? 'Menyiapkan...' : 'Buat Target Kerja'}
                        </button>
                    </div>
                </div>
            </div>

            {/* CARD 2: TABEL RINGKASAN PER BATCH */}
            <Pos1TargetTable
                data={filteredData}
                loading={loading}
                selectedDate={formatMonthDisplay(selectedMonth)}
                onDetail={handleDetailClick}
                onDelete={handleDeleteBatch}
                onEditItem={handleEditBatch}
            />

            {/* MODAL FORM (Create Batch / Edit Batch) */}
            <Pos1TargetForm
                key={editingBatch?.kode_batch || (isModalOpen ? 'open' : 'closed')}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBatch(null);
                    setEditingItem(null);
                }}
                onSuccess={fetchData}
                initialData={editingBatch}
                selectedDate={new Date().toISOString().split('T')[0]}
                isEditItem={Boolean(editingBatch?.id)}
            />

            {/* MODAL DETAIL */}
            <Pos1TargetDetailModal
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                batchData={detailItem}
                onEditItem={handleEditBatch}
            />
        </div>
    );
}
