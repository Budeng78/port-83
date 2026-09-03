import React, { useEffect, useState } from 'react';
import {
    Search,
    Plus,
    RefreshCw,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { tobaccoAturanService } from '../../services/tobaccoAturanService.js';

import TobaccoAturanModal from './components/modal/TobaccoAturanModal';
import TobaccoAturanTable from './components/modal/TobaccoAturanTable.jsx';
import TobaccoAturanTrashModal from './components/modal/TobaccoAturanTrashModal.jsx';

const TOP_NAVBAR_HEIGHT = 0;
const BOTTOM_NAVBAR_HEIGHT = 60;

const DEFAULT_PER_PAGE = 20;

export default function TobaccoAturan() {
    const navigate = useNavigate();

    const [aturan, setAturan] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedAturan, setSelectedAturan] = useState(null);

    const [showTrashModal, setShowTrashModal] = useState(false);

    const [deletingId, setDeletingId] = useState(null);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: DEFAULT_PER_PAGE,
        total: 0,
        from: 0,
        to: 0,
    });

    // =========================================================
    // LOAD DATA
    // =========================================================

    const loadAturan = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await tobaccoAturanService.getAll({
                page: pagination.current_page,
                per_page: pagination.per_page,
                search: search.trim() || undefined,
            });

            const paginator = response?.data;

            setAturan(paginator?.data || []);

            setPagination((prev) => ({
                ...prev,
                current_page: paginator?.current_page || 1,
                last_page: paginator?.last_page || 1,
                per_page:
                    paginator?.per_page || DEFAULT_PER_PAGE,
                total: paginator?.total || 0,
                from: paginator?.from || 0,
                to: paginator?.to || 0,
            }));
        } catch (err) {
            console.error(
                'Gagal mengambil aturan tembakau:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal mengambil data aturan tembakau.'
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadAturan();
    }, [
        pagination.current_page,
        pagination.per_page,
        search,
    ]);

    // =========================================================
    // SEARCH
    // =========================================================

    const handleSearchChange = (value) => {
        setSearch(value);

        setPagination((prev) => ({
            ...prev,
            current_page: 1,
        }));
    };

    // =========================================================
    // PAGINATION
    // =========================================================

    const goToPage = (page) => {
        if (
            page < 1 ||
            page > pagination.last_page ||
            page === pagination.current_page
        ) {
            return;
        }

        setPagination((prev) => ({
            ...prev,
            current_page: page,
        }));
    };

    const goToPreviousPage = () => {
        if (pagination.current_page <= 1) {
            return;
        }

        setPagination((prev) => ({
            ...prev,
            current_page: prev.current_page - 1,
        }));
    };

    const goToNextPage = () => {
        if (
            pagination.current_page >=
            pagination.last_page
        ) {
            return;
        }

        setPagination((prev) => ({
            ...prev,
            current_page: prev.current_page + 1,
        }));
    };

    const getPageNumbers = () => {
        const current = pagination.current_page;
        const last = pagination.last_page;

        if (last <= 7) {
            return Array.from(
                { length: last },
                (_, index) => index + 1
            );
        }

        const pages = [];

        pages.push(1);

        if (current > 4) {
            pages.push('...');
        }

        const start = Math.max(2, current - 1);
        const end = Math.min(last - 1, current + 1);

        for (let page = start; page <= end; page++) {
            pages.push(page);
        }

        if (current < last - 3) {
            pages.push('...');
        }

        pages.push(last);

        return pages;
    };

    // =========================================================
    // PER PAGE
    // =========================================================

    const handlePerPageChange = (value) => {
        setPagination((prev) => ({
            ...prev,
            per_page: Number(value),
            current_page: 1,
        }));
    };

    // =========================================================
    // MODAL
    // =========================================================

    const openCreateModal = () => {
        setSelectedAturan(null);
        setModalMode('create');
        setShowModal(true);
    };

    const openEditModal = (item) => {
        setSelectedAturan(item);
        setModalMode('edit');
        setShowModal(true);
    };

    const openDetail = async (item) => {
        try {
            setError('');

            const response =
                await tobaccoAturanService.getById(item.id);

            setSelectedAturan(
                response?.data || response
            );

            setModalMode('view');
            setShowModal(true);
        } catch (err) {
            console.error(
                'Gagal mengambil detail aturan:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal mengambil detail aturan tembakau.'
            );
        }
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedAturan(null);
    };

    // =========================================================
    // PRINT
    // =========================================================

    const handlePrint = (item) => {
        if (!item?.id) {
            setError('ID aturan tidak ditemukan.');
            return;
        }

       navigate(`/app/rnd/tobacco-aturan-detail/${item.id}`);
    };
    
    // =========================================================
    // KIRIMAN TBK
    // =========================================================

    const handleKiriman = (item) => {
        if (!item?.id) {
            setError('ID aturan tidak ditemukan.');
            return;
        }

        navigate(
            `/app/rnd/tobacco-aturan/${item.id}/kiriman`
        );
    };
    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (item) => {
        const confirmed = window.confirm(
            `Apakah aturan "${item.kode_aturan}" ingin dipindahkan ke trash?`
        );

        if (!confirmed) {
            return;
        }

        try {
            setDeletingId(item.id);
            setError('');
            setSuccess('');

            await tobaccoAturanService.delete(item.id);

            setSuccess(
                `Aturan "${item.kode_aturan}" berhasil dipindahkan ke trash.`
            );

            await loadAturan();
        } catch (err) {
            console.error(
                'Gagal menghapus aturan:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal menghapus aturan tembakau.'
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =========================================================
    // SUCCESS DARI MODAL
    // =========================================================

    const handleModalSuccess = async (message) => {
        closeModal();

        setError('');
        setSuccess(
            message || 'Data berhasil disimpan.'
        );

        await loadAturan();
    };

    // =========================================================
    // REFRESH
    // =========================================================

    const handleRefresh = async () => {
        setSuccess('');
        setError('');

        await loadAturan();
    };

    // =========================================================
    // UI
    // =========================================================

    return (
        <div
            className="min-h-screen bg-slate-50"
            style={{
                paddingTop: `${TOP_NAVBAR_HEIGHT}px`,
                paddingBottom: `${BOTTOM_NAVBAR_HEIGHT}px`,
            }}
        >
            <main className="mx-auto w-full max-w-7xl px-2 pt-2 sm:px-6 sm:py-6 lg:px-8">

                {/* =================================================
                    PAGE HEADER + TOOLBAR
                ================================================= */}

                <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    {/* HEADER */}

                    <div className="px-5 py-5 sm:px-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

                            <div className="min-w-0">
                                <div className="flex items-center gap-3">

                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                                        <span className="text-lg font-bold">
                                            R
                                        </span>
                                    </div>

                                    <div className="min-w-0">
                                        <h1 className="truncate text-lg font-semibold text-slate-800 sm:text-xl">
                                            Aturan Tembakau
                                        </h1>

                                        <p className="mt-0.5 text-sm text-slate-500">
                                            RnD · Master aturan dan rencana tembakau
                                        </p>
                                    </div>

                                </div>
                            </div>

                            {/* ACTIONS */}

                            <div className="flex flex-wrap items-center gap-2">

                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    className="
                                        inline-flex items-center gap-2
                                        rounded-lg
                                        border border-slate-300
                                        bg-white
                                        px-3 py-2
                                        text-sm font-medium
                                        text-slate-700
                                        transition
                                        hover:bg-slate-50
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-indigo-500
                                        focus:ring-offset-1
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    <RefreshCw
                                        size={16}
                                        className={
                                            loading
                                                ? 'animate-spin'
                                                : ''
                                        }
                                    />

                                    <span className="hidden sm:inline">
                                        Refresh
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() =>
                                        setShowTrashModal(true)
                                    }
                                    className="
                                        inline-flex items-center gap-2
                                        rounded-lg
                                        border border-slate-300
                                        bg-white
                                        px-3 py-2
                                        text-sm font-medium
                                        text-slate-700
                                        transition
                                        hover:bg-slate-50
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-indigo-500
                                        focus:ring-offset-1
                                    "
                                >
                                    <Trash2 size={16} />

                                    <span className="hidden sm:inline">
                                        Trash
                                    </span>
                                </button>

                                <button
                                    type="button"
                                    onClick={openCreateModal}
                                    className="
                                        inline-flex items-center gap-2
                                        rounded-lg
                                        bg-indigo-600
                                        px-4 py-2
                                        text-sm font-medium
                                        text-white
                                        shadow-sm
                                        transition
                                        hover:bg-indigo-700
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-indigo-500
                                        focus:ring-offset-1
                                    "
                                >
                                    <Plus size={17} />

                                    <span>
                                        Tambah Aturan
                                    </span>
                                </button>

                            </div>
                        </div>
                    </div>

                    <div className="border-t border-slate-100" />

                    {/* SEARCH TOOLBAR */}

                    <div className="px-5 py-4 sm:px-6">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                            <div className="relative w-full md:max-w-lg">

                                <Search
                                    size={17}
                                    className="
                                        pointer-events-none
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        handleSearchChange(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Cari kode aturan atau tanggal..."
                                    className="
                                        w-full
                                        rounded-lg
                                        border border-slate-300
                                        bg-slate-50
                                        py-2.5
                                        pl-10
                                        pr-4
                                        text-sm
                                        text-slate-700
                                        placeholder:text-slate-400
                                        transition
                                        focus:border-indigo-500
                                        focus:bg-white
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-indigo-500/20
                                    "
                                />

                            </div>

                            {/* TOTAL DATA */}

                            <div className="flex items-center gap-3 text-sm text-slate-500">

                                <span>
                                    Menampilkan{' '}
                                    <span className="font-semibold text-slate-700">
                                        {pagination.from}
                                    </span>
                                    {' '}–{' '}
                                    <span className="font-semibold text-slate-700">
                                        {pagination.to}
                                    </span>
                                    {' '}dari{' '}
                                    <span className="font-semibold text-slate-700">
                                        {pagination.total}
                                    </span>
                                    {' '}aturan
                                </span>

                                <select
                                    value={pagination.per_page}
                                    onChange={(e) =>
                                        handlePerPageChange(
                                            e.target.value
                                        )
                                    }
                                    className="
                                        rounded-lg
                                        border border-slate-300
                                        bg-white
                                        px-2.5
                                        py-2
                                        text-sm
                                        text-slate-700
                                        focus:border-indigo-500
                                        focus:outline-none
                                        focus:ring-2
                                        focus:ring-indigo-500/20
                                    "
                                >
                                    <option value="10">
                                        10
                                    </option>

                                    <option value="20">
                                        20
                                    </option>

                                    <option value="50">
                                        50
                                    </option>

                                    <option value="100">
                                        100
                                    </option>
                                </select>

                            </div>

                        </div>
                    </div>

                </section>

                {/* =================================================
                    ALERT
                ================================================= */}

                {error && (
                    <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">

                            <p className="text-sm text-red-700">
                                {error}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setError('')
                                }
                                className="
                                    shrink-0
                                    text-lg
                                    leading-none
                                    text-red-500
                                    transition
                                    hover:text-red-700
                                "
                            >
                                ×
                            </button>

                        </div>
                    </div>
                )}

                {success && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3">
                        <div className="flex items-start justify-between gap-3">

                            <p className="text-sm text-emerald-700">
                                {success}
                            </p>

                            <button
                                type="button"
                                onClick={() =>
                                    setSuccess('')
                                }
                                className="
                                    shrink-0
                                    text-lg
                                    leading-none
                                    text-emerald-500
                                    transition
                                    hover:text-emerald-700
                                "
                            >
                                ×
                            </button>

                        </div>
                    </div>
                )}

                {/* =================================================
                    TABLE
                ================================================= */}

                <section className="mt-5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">

                    <TobaccoAturanTable
                        data={aturan}
                        loading={loading}
                        deletingId={deletingId}
                        onDetail={openDetail}
                        onEdit={openEditModal}
                        onDelete={handleDelete}
                        onPrint={handlePrint}
                        onKiriman={handleKiriman}
                    />

                    {/* =================================================
                        PAGINATION
                    ================================================= */}

                    {pagination.last_page > 1 && (
                        <div className="
                            flex flex-col gap-3
                            border-t border-slate-200
                            px-4 py-3
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        ">

                            <div className="text-sm text-slate-500">
                                Halaman{' '}
                                <span className="font-semibold text-slate-700">
                                    {pagination.current_page}
                                </span>
                                {' '}dari{' '}
                                <span className="font-semibold text-slate-700">
                                    {pagination.last_page}
                                </span>
                            </div>

                            <div className="flex items-center gap-1">

                                <button
                                    type="button"
                                    disabled={
                                        pagination.current_page ===
                                        1
                                    }
                                    onClick={
                                        goToPreviousPage
                                    }
                                    title="Halaman sebelumnya"
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        rounded-lg
                                        border border-slate-300
                                        px-3 py-2
                                        text-sm font-medium
                                        text-slate-700
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <ChevronLeft
                                        size={16}
                                    />

                                    <span className="hidden sm:inline">
                                        Sebelumnya
                                    </span>
                                </button>

                                <div className="flex items-center gap-1">

                                    {getPageNumbers().map(
                                        (page, index) => {
                                            if (
                                                page ===
                                                '...'
                                            ) {
                                                return (
                                                    <span
                                                        key={`ellipsis-${index}`}
                                                        className="
                                                            flex
                                                            min-w-9
                                                            items-center
                                                            justify-center
                                                            px-2
                                                            text-sm
                                                            text-slate-400
                                                        "
                                                    >
                                                        …
                                                    </span>
                                                );
                                            }

                                            return (
                                                <button
                                                    key={page}
                                                    type="button"
                                                    onClick={() =>
                                                        goToPage(
                                                            page
                                                        )
                                                    }
                                                    aria-current={
                                                        page ===
                                                        pagination.current_page
                                                            ? 'page'
                                                            : undefined
                                                    }
                                                    className={`
                                                        min-w-9
                                                        rounded-lg
                                                        px-3 py-2
                                                        text-sm
                                                        font-medium
                                                        transition
                                                        ${
                                                            page ===
                                                            pagination.current_page
                                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                                : 'border border-slate-300 text-slate-700 hover:bg-slate-50'
                                                        }
                                                    `}
                                                >
                                                    {page}
                                                </button>
                                            );
                                        }
                                    )}

                                </div>

                                <button
                                    type="button"
                                    disabled={
                                        pagination.current_page ===
                                        pagination.last_page
                                    }
                                    onClick={
                                        goToNextPage
                                    }
                                    title="Halaman berikutnya"
                                    className="
                                        inline-flex
                                        items-center
                                        gap-1
                                        rounded-lg
                                        border border-slate-300
                                        px-3 py-2
                                        text-sm font-medium
                                        text-slate-700
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >
                                    <span className="hidden sm:inline">
                                        Berikutnya
                                    </span>

                                    <ChevronRight
                                        size={16}
                                    />
                                </button>

                            </div>

                        </div>
                    )}

                </section>

            </main>

            {/* =====================================================
                CREATE / EDIT / VIEW MODAL
            ===================================================== */}

            {showModal && (
                <TobaccoAturanModal
                    mode={modalMode}
                    aturan={selectedAturan}
                    onClose={closeModal}
                    onSuccess={handleModalSuccess}
                    topNavbarHeight={TOP_NAVBAR_HEIGHT}
                    bottomNavbarHeight={BOTTOM_NAVBAR_HEIGHT}
                />
            )}

            {/* =====================================================
                TRASH MODAL
            ===================================================== */}

            {showTrashModal && (
                <TobaccoAturanTrashModal
                    open={showTrashModal}
                    onClose={() =>
                        setShowTrashModal(false)
                    }
                    onSuccess={handleRefresh}
                />
            )}

        </div>
    );
}
