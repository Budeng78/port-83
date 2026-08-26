import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Plus,
    Search,
    Pencil,
    Trash2,
    RefreshCw,
    X,
    ChevronRight,
    Layers3,
    CheckCircle2,
    XCircle,
    Save,
} from 'lucide-react';

import organizationLevelService from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/organizationLevelService';


// =====================================================
// CONSTANT
// =====================================================

const TOP_NAVBAR_HEIGHT = 64;
const BOTTOM_NAVBAR_HEIGHT = 60;


// =====================================================
// INITIAL FORM
// =====================================================

const initialForm = {
    parent_id: '',
    code: '',
    name: '',
    description: '',
    sort_order: 1,
    is_active: true,
};


// =====================================================
// COMPONENT
// =====================================================

const OrganizationLevelManage = () => {

    // ===================================================
    // STATE
    // ===================================================

    const [levels, setLevels] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [form, setForm] = useState(initialForm);

    const [deleteTarget, setDeleteTarget] = useState(null);


    // ===================================================
    // LOAD DATA
    // ===================================================

    const loadLevels = async () => {

        try {

            setLoading(true);
            setError('');

            const response =
                await organizationLevelService.getOrganizationLevels({
                    search,
                    is_active: statusFilter,
                });

            if (response?.success) {

                setLevels(
                    Array.isArray(response.data)
                        ? response.data
                        : []
                );

            } else {

                setLevels([]);

                setError(
                    response?.message ||
                    'Gagal mengambil data organization level.'
                );

            }

        } catch (err) {

            console.error(
                'Gagal mengambil organization levels:',
                err
            );

            setLevels([]);

            setError(
                err?.response?.data?.message ||
                'Gagal mengambil data organization level.'
            );

        } finally {

            setLoading(false);

        }
    };


    // ===================================================
    // INITIAL LOAD
    // ===================================================

    useEffect(() => {
        loadLevels();
    }, [search, statusFilter]);


    // ===================================================
    // AUTO CLEAR SUCCESS
    // ===================================================

    useEffect(() => {

        if (!success) {
            return;
        }

        const timer = setTimeout(() => {
            setSuccess('');
        }, 3000);

        return () => clearTimeout(timer);

    }, [success]);


    // ===================================================
    // SORT
    // ===================================================

    const sortedLevels = useMemo(() => {

        return [...levels].sort((a, b) => {

            const sortA = Number(
                a.sort_order ?? 0
            );

            const sortB = Number(
                b.sort_order ?? 0
            );

            if (sortA !== sortB) {
                return sortA - sortB;
            }

            return String(
                a.name ?? ''
            ).localeCompare(
                String(b.name ?? '')
            );

        });

    }, [levels]);


    // ===================================================
    // PARENT OPTIONS
    // ===================================================

    const parentOptions = useMemo(() => {

        return sortedLevels.filter(
            (level) => level.id !== editingId
        );

    }, [sortedLevels, editingId]);


    // ===================================================
    // HANDLE INPUT
    // ===================================================

    const handleChange = (event) => {

        const {
            name,
            value,
            type,
            checked,
        } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]:
                type === 'checkbox'
                    ? checked
                    : value,
        }));

    };


    // ===================================================
    // CREATE MODAL
    // ===================================================

    const openCreateModal = () => {

        setEditingId(null);

        setForm({
            ...initialForm,

            sort_order:
                sortedLevels.length > 0
                    ? Math.max(
                        ...sortedLevels.map(
                            (item) =>
                                Number(
                                    item.sort_order ?? 0
                                )
                        )
                    ) + 1
                    : 1,
        });

        setError('');
        setSuccess('');
        setShowModal(true);

    };


    // ===================================================
    // EDIT MODAL
    // ===================================================

    const openEditModal = (level) => {

        setEditingId(level.id);

        setForm({
            parent_id:
                level.parent_id ?? '',

            code:
                level.code ?? '',

            name:
                level.name ?? '',

            description:
                level.description ?? '',

            sort_order:
                level.sort_order ?? 1,

            is_active:
                Boolean(level.is_active),
        });

        setError('');
        setSuccess('');
        setShowModal(true);

    };


    // ===================================================
    // CLOSE MODAL
    // ===================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);
        setEditingId(null);
        setForm(initialForm);

    };


    // ===================================================
    // SUBMIT
    // ===================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        try {

            setSaving(true);
            setError('');
            setSuccess('');

            const payload = {

                parent_id:
                    form.parent_id === ''
                        ? null
                        : form.parent_id,

                code:
                    form.code
                        .trim()
                        .toUpperCase(),

                name:
                    form.name.trim(),

                description:
                    form.description.trim() || null,

                sort_order:
                    Number(form.sort_order) || 0,

                is_active:
                    Boolean(form.is_active),

            };


            // =================================================
            // CREATE
            // =================================================

            if (!editingId) {

                const response =
                    await organizationLevelService
                        .createOrganizationLevel(
                            payload
                        );

                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        'Gagal membuat organization level.'
                    );

                }

                setSuccess(
                    'Organization level berhasil dibuat.'
                );

            }


            // =================================================
            // UPDATE
            // =================================================

            else {

                const response =
                    await organizationLevelService
                        .updateOrganizationLevel(
                            editingId,
                            payload
                        );

                if (!response?.success) {

                    throw new Error(
                        response?.message ||
                        'Gagal memperbarui organization level.'
                    );

                }

                setSuccess(
                    'Organization level berhasil diperbarui.'
                );

            }


            // =================================================
            // CLOSE + REFRESH
            // =================================================

            setShowModal(false);
            setEditingId(null);
            setForm(initialForm);

            await loadLevels();

        } catch (err) {

            console.error(
                'Gagal menyimpan organization level:',
                err
            );

            const responseErrors =
                err?.response?.data?.errors;

            if (responseErrors) {

                const firstError =
                    Object.values(responseErrors)
                        ?.flat()?.[0];

                setError(
                    firstError ||
                    'Validasi gagal.'
                );

            } else {

                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    'Gagal menyimpan organization level.'
                );

            }

        } finally {

            setSaving(false);

        }
    };


    // ===================================================
    // DELETE CONFIRM
    // ===================================================

    const confirmDelete = (level) => {

        setDeleteTarget(level);
        setError('');

    };


    // ===================================================
    // DELETE
    // ===================================================

    const handleDelete = async () => {

        if (!deleteTarget) {
            return;
        }

        try {

            setDeleting(true);
            setError('');
            setSuccess('');

            const response =
                await organizationLevelService
                    .deleteOrganizationLevel(
                        deleteTarget.id
                    );

            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    'Gagal menghapus organization level.'
                );

            }

            setSuccess(
                'Organization level berhasil dihapus.'
            );

            setDeleteTarget(null);

            await loadLevels();

        } catch (err) {

            console.error(
                'Gagal menghapus organization level:',
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal menghapus organization level.'
            );

            setDeleteTarget(null);

        } finally {

            setDeleting(false);

        }
    };


    // ===================================================
    // PARENT NAME
    // ===================================================

    const getParentName = (level) => {

        if (!level?.parent) {
            return '—';
        }

        return level.parent.name;

    };


    // ===================================================
    // RENDER
    // ===================================================

    return (
        <>

            <div className="space-y-5">


                {/* =================================================
                    HEADER CARD
                ================================================== */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* Gradient Accent */}

                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />


                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">


                        {/* HEADER INFORMATION */}

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">

                                <Layers3 size={24} />

                            </div>


                            <div>

                                <h1 className="text-xl font-black tracking-tight text-slate-900">

                                    Organization Level

                                </h1>


                                <p className="text-sm text-slate-500">

                                    Kelola struktur dan hierarki level organisasi.

                                </p>

                            </div>

                        </div>


                        {/* HEADER ACTIONS */}

                        <div className="flex items-center gap-2 self-end sm:self-auto">


                            {/* REFRESH */}

                            <button
                                type="button"
                                onClick={loadLevels}
                                disabled={loading}
                                title="Refresh Data"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <RefreshCw
                                    size={18}
                                    className={
                                        loading
                                            ? 'animate-spin'
                                            : ''
                                    }
                                />

                            </button>


                            {/* ADD */}

                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
                            >

                                <Plus size={18} />

                                <span>
                                    Tambah Level
                                </span>

                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SUCCESS ALERT
                ================================================== */}

                {success && (

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">

                        <div className="flex items-center gap-2">

                            <CheckCircle2 size={17} />

                            <span>
                                {success}
                            </span>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setSuccess('')
                            }
                            className="rounded-lg p-1 transition hover:bg-emerald-100"
                        >

                            <X size={15} />

                        </button>

                    </div>

                )}


                {/* =================================================
                    ERROR ALERT
                ================================================== */}

                {error && (

                    <div className="flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">

                        <div className="flex items-center gap-2">

                            <XCircle size={17} />

                            <span>
                                {error}
                            </span>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                setError('')
                            }
                            className="rounded-lg p-1 transition hover:bg-rose-100"
                        >

                            <X size={15} />

                        </button>

                    </div>

                )}


                {/* =================================================
                    ORGANIZATION LEVEL CARD
                ================================================== */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                    {/* =================================================
                        TOOLBAR
                    ================================================== */}

                    <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">


                        {/* SEARCH */}

                        <div className="relative w-full sm:max-w-md">

                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="text"
                                value={search}
                                onChange={(event) =>
                                    setSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Cari code atau nama level..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            />

                        </div>


                        {/* SUMMARY / FILTER */}

                        <div className="flex flex-wrap items-center gap-2">


                            <span className="text-sm font-medium text-slate-500">

                                Total:

                                <strong className="ml-1 font-black text-slate-800">

                                    {sortedLevels.length}

                                </strong>

                                {' '}level

                            </span>


                            <span className="hidden text-slate-300 sm:inline">
                                |
                            </span>


                            {/* STATUS */}

                            <select
                                value={statusFilter}
                                onChange={(event) =>
                                    setStatusFilter(
                                        event.target.value
                                    )
                                }
                                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua Status
                                </option>

                                <option value="true">
                                    Aktif
                                </option>

                                <option value="false">
                                    Nonaktif
                                </option>

                            </select>

                        </div>

                    </div>


                    {/* =================================================
                        DESKTOP TABLE
                    ================================================== */}

                    <div className="hidden overflow-x-auto md:block">

                        <table className="w-full border-collapse text-left">

                            <thead>

                                <tr className="border-b border-slate-100 bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">

                                    <th className="px-5 py-3.5">
                                        #
                                    </th>

                                    <th className="px-5 py-3.5">
                                        Code
                                    </th>

                                    <th className="px-5 py-3.5">
                                        Level
                                    </th>

                                    <th className="px-5 py-3.5">
                                        Parent
                                    </th>

                                    <th className="px-5 py-3.5 text-center">
                                        Sort
                                    </th>

                                    <th className="px-5 py-3.5 text-center">
                                        Status
                                    </th>

                                    <th className="px-5 py-3.5 text-right">
                                        Aksi
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100 text-sm">


                                {/* LOADING */}

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="px-5 py-10 text-center text-sm text-slate-400"
                                        >

                                            <div className="flex items-center justify-center gap-2">

                                                <RefreshCw
                                                    size={17}
                                                    className="animate-spin"
                                                />

                                                Memuat data...

                                            </div>

                                        </td>

                                    </tr>

                                )}


                                {/* EMPTY */}

                                {!loading &&
                                    sortedLevels.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="7"
                                                className="px-5 py-10 text-center text-sm font-semibold text-slate-400"
                                            >

                                                <div className="flex flex-col items-center justify-center gap-2">

                                                    <Layers3
                                                        size={30}
                                                    />

                                                    Tidak ada data organization level.

                                                </div>

                                            </td>

                                        </tr>

                                    )}


                                {/* DATA */}

                                {!loading &&
                                    sortedLevels.map(
                                        (level, index) => (

                                            <tr
                                                key={level.id}
                                                className="transition-colors hover:bg-slate-50"
                                            >


                                                {/* NUMBER */}

                                                <td className="px-5 py-4">

                                                    <span className="text-xs font-semibold text-slate-400">

                                                        {index + 1}

                                                    </span>

                                                </td>


                                                {/* CODE */}

                                                <td className="px-5 py-4">

                                                    <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-xs font-bold text-slate-700">

                                                        {level.code}

                                                    </span>

                                                </td>


                                                {/* LEVEL */}

                                                <td className="px-5 py-4">

                                                    <div className="flex items-center gap-3">


                                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                                                            <Layers3
                                                                size={15}
                                                            />

                                                        </div>


                                                        <div className="min-w-0">

                                                            <p className="font-bold text-slate-800">

                                                                {level.name}

                                                            </p>


                                                            {level.description && (

                                                                <p className="mt-0.5 max-w-xs truncate text-xs text-slate-400">

                                                                    {level.description}

                                                                </p>

                                                            )}

                                                        </div>

                                                    </div>

                                                </td>


                                                {/* PARENT */}

                                                <td className="px-5 py-4">

                                                    {level.parent ? (

                                                        <div className="flex items-center gap-2">

                                                            <ChevronRight
                                                                size={15}
                                                                className="text-slate-400"
                                                            />

                                                            <div>

                                                                <span className="rounded-lg bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-600">

                                                                    {getParentName(
                                                                        level
                                                                    )}

                                                                </span>

                                                            </div>

                                                        </div>

                                                    ) : (

                                                        <span className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-500">

                                                            Root Level

                                                        </span>

                                                    )}

                                                </td>


                                                {/* SORT */}

                                                <td className="px-5 py-4 text-center">

                                                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-lg bg-slate-100 px-2 text-xs font-bold text-slate-600">

                                                        {level.sort_order}

                                                    </span>

                                                </td>


                                                {/* STATUS */}

                                                <td className="px-5 py-4 text-center">

                                                    {level.is_active ? (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                                                            Aktif

                                                        </span>

                                                    ) : (

                                                        <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">

                                                            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />

                                                            Nonaktif

                                                        </span>

                                                    )}

                                                </td>


                                                {/* ACTION */}

                                                <td className="px-5 py-4 text-right">

                                                    <div className="flex items-center justify-end gap-1.5">


                                                        {/* EDIT */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                openEditModal(
                                                                    level
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all hover:bg-blue-100"
                                                            title="Edit"
                                                        >

                                                            <Pencil
                                                                size={15}
                                                            />

                                                        </button>


                                                        {/* DELETE */}

                                                        <button
                                                            type="button"
                                                            onClick={() =>
                                                                confirmDelete(
                                                                    level
                                                                )
                                                            }
                                                            className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600 transition-all hover:bg-rose-100"
                                                            title="Hapus"
                                                        >

                                                            <Trash2
                                                                size={15}
                                                            />

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                            </tbody>

                        </table>

                    </div>


                    {/* =================================================
                        MOBILE
                    ================================================== */}

                    <div className="divide-y divide-slate-100 text-sm md:hidden">


                        {/* LOADING */}

                        {loading && (

                            <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-400">

                                <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                />

                                Memuat data...

                            </div>

                        )}


                        {/* EMPTY */}

                        {!loading &&
                            sortedLevels.length === 0 && (

                                <div className="flex flex-col items-center gap-2 p-8 text-center text-sm font-semibold text-slate-400">

                                    <Layers3
                                        size={30}
                                    />

                                    Tidak ada data organization level.

                                </div>

                            )}


                        {/* MOBILE DATA */}

                        {!loading &&
                            sortedLevels.map(
                                (level, index) => (

                                    <div
                                        key={level.id}
                                        className="space-y-4 p-5 transition-colors hover:bg-slate-50"
                                    >


                                        {/* HEADER */}

                                        <div className="flex items-start gap-3">


                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                                <Layers3
                                                    size={16}
                                                />

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <div className="flex items-center gap-2">

                                                    <p className="text-sm font-black text-slate-800">

                                                        {level.name}

                                                    </p>

                                                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">

                                                        #{index + 1}

                                                    </span>

                                                </div>


                                                <p className="mt-1 font-mono text-xs font-bold text-slate-500">

                                                    {level.code}

                                                </p>


                                                {level.description && (

                                                    <p className="mt-1 text-xs text-slate-400">

                                                        {level.description}

                                                    </p>

                                                )}

                                            </div>


                                            {/* STATUS */}

                                            {level.is_active ? (

                                                <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">

                                                    Aktif

                                                </span>

                                            ) : (

                                                <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-500">

                                                    Nonaktif

                                                </span>

                                            )}

                                        </div>


                                        {/* META */}

                                        <div className="grid grid-cols-2 gap-2">


                                            <div className="rounded-lg bg-slate-50 p-3">

                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">

                                                    Parent

                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-slate-700">

                                                    {level.parent
                                                        ? getParentName(
                                                            level
                                                        )
                                                        : 'Root Level'}

                                                </p>

                                            </div>


                                            <div className="rounded-lg bg-slate-50 p-3">

                                                <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">

                                                    Sort Order

                                                </p>

                                                <p className="mt-1 text-xs font-semibold text-slate-700">

                                                    {level.sort_order}

                                                </p>

                                            </div>

                                        </div>


                                        {/* ACTION */}

                                        <div className="flex gap-2 border-t border-slate-100 pt-3">


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openEditModal(
                                                        level
                                                    )
                                                }
                                                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
                                            >

                                                <Pencil
                                                    size={15}
                                                />

                                                Edit

                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    confirmDelete(
                                                        level
                                                    )
                                                }
                                                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-rose-50 text-sm font-bold text-rose-600 transition-all hover:bg-rose-100"
                                            >

                                                <Trash2
                                                    size={15}
                                                />

                                                Hapus

                                            </button>

                                        </div>

                                    </div>

                                )
                            )}

                    </div>

                </div>

            </div>


            {/* =====================================================
                CREATE / EDIT MODAL
            ====================================================== */}

            {showModal && (

                <div
                    className="fixed inset-x-0 z-[70] flex items-center justify-center bg-transparent p-4"
                    style={{
                        top: `${TOP_NAVBAR_HEIGHT}px`,
                        bottom: `${BOTTOM_NAVBAR_HEIGHT}px`,
                    }}
                >


                    {/* BACKDROP */}

                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={closeModal}
                    />


                    {/* MODAL */}

                    <div
                        className="relative z-[71] flex max-h-full w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="organization-level-modal-title"
                    >


                        {/* =================================================
                            HEADER
                        ================================================== */}

                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div className="min-w-0">

                                <h2
                                    id="organization-level-modal-title"
                                    className="text-xl font-black text-slate-900"
                                >

                                    {editingId
                                        ? 'Edit Organization Level'
                                        : 'Tambah Organization Level'}

                                </h2>


                                <p className="mt-1 text-sm text-slate-500">

                                    {editingId
                                        ? 'Perbarui informasi level organisasi.'
                                        : 'Buat level organisasi baru.'}

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Tutup"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        {/* =================================================
                            FORM
                        ================================================== */}

                        <form
                            onSubmit={handleSubmit}
                            className="flex min-h-0 flex-1 flex-col"
                        >


                            {/* BODY */}

                            <div className="min-h-0 flex-1 overflow-y-auto">

                                <div className="space-y-5 p-6 text-sm">


                                    {/* CODE */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">

                                            Code

                                            <span className="ml-1 text-rose-500">
                                                *
                                            </span>

                                        </label>


                                        <input
                                            type="text"
                                            name="code"
                                            value={form.code}
                                            onChange={handleChange}
                                            disabled={saving}
                                            required
                                            placeholder="MANAGER"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 font-mono text-sm uppercase text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        />

                                        <p className="mt-1.5 text-xs text-slate-400">

                                            Gunakan kode unik untuk level organisasi.

                                        </p>

                                    </div>


                                    {/* NAME */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">

                                            Nama

                                            <span className="ml-1 text-rose-500">
                                                *
                                            </span>

                                        </label>


                                        <input
                                            type="text"
                                            name="name"
                                            value={form.name}
                                            onChange={handleChange}
                                            disabled={saving}
                                            required
                                            placeholder="Manager"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        />

                                    </div>


                                    {/* PARENT */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">

                                            Parent Level

                                        </label>


                                        <select
                                            name="parent_id"
                                            value={form.parent_id}
                                            onChange={handleChange}
                                            disabled={saving}
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        >

                                            <option value="">
                                                — Root Level —
                                            </option>


                                            {parentOptions.map(
                                                (parent) => (

                                                    <option
                                                        key={parent.id}
                                                        value={parent.id}
                                                    >

                                                        {parent.name}
                                                        {' '}
                                                        ({parent.code})

                                                    </option>

                                                )
                                            )}

                                        </select>


                                        <p className="mt-1.5 text-xs text-slate-400">

                                            Kosongkan jika level ini merupakan root.

                                        </p>

                                    </div>


                                    {/* DESCRIPTION */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">

                                            Description

                                        </label>


                                        <textarea
                                            name="description"
                                            value={form.description}
                                            onChange={handleChange}
                                            disabled={saving}
                                            rows="3"
                                            placeholder="Deskripsi level organisasi..."
                                            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        />

                                    </div>


                                    {/* SORT ORDER */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">

                                            Sort Order

                                        </label>


                                        <input
                                            type="number"
                                            name="sort_order"
                                            value={form.sort_order}
                                            onChange={handleChange}
                                            disabled={saving}
                                            min="0"
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                                        />

                                    </div>


                                    {/* ACTIVE */}

                                    <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">

                                        <input
                                            type="checkbox"
                                            name="is_active"
                                            checked={form.is_active}
                                            onChange={handleChange}
                                            disabled={saving}
                                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                        />


                                        <div>

                                            <div className="text-sm font-bold text-slate-700">

                                                Aktif

                                            </div>


                                            <div className="text-xs text-slate-400">

                                                Level dapat digunakan dalam assignment.

                                            </div>

                                        </div>

                                    </label>


                                    {/* PREVIEW */}

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                        <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700">

                                            <Layers3
                                                size={15}
                                                className="text-blue-600"
                                            />

                                            Preview

                                        </div>


                                        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">

                                            <div className="flex items-center gap-2">

                                                <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] font-bold text-slate-600">

                                                    {form.code ||
                                                        'CODE'}

                                                </span>


                                                <span className="text-xs font-bold text-slate-800">

                                                    {form.name ||
                                                        'Organization Level'}

                                                </span>

                                            </div>


                                            <div className="mt-2 text-[10px] text-slate-400">

                                                Parent:{' '}

                                                {form.parent_id
                                                    ? parentOptions.find(
                                                        (item) =>
                                                            item.id ===
                                                            form.parent_id
                                                    )?.name ||
                                                    'Organization Level'
                                                    : 'Root Level'}

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* =================================================
                                FOOTER
                            ================================================== */}

                            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-white px-6 py-5">


                                {/* CANCEL */}

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    Batal

                                </button>


                                {/* SAVE */}

                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {saving ? (

                                        <>

                                            <RefreshCw
                                                size={15}
                                                className="animate-spin"
                                            />

                                            Menyimpan...

                                        </>

                                    ) : (

                                        <>

                                            <Save size={15} />

                                            {editingId
                                                ? 'Simpan Perubahan'
                                                : 'Simpan Level'}

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =====================================================
                DELETE CONFIRMATION
            ====================================================== */}

            {deleteTarget && (

                <div
                    className="fixed inset-x-0 z-[80] flex items-center justify-center bg-transparent p-4"
                    style={{
                        top: `${TOP_NAVBAR_HEIGHT}px`,
                        bottom: `${BOTTOM_NAVBAR_HEIGHT}px`,
                    }}
                >


                    {/* BACKDROP */}

                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() =>
                            !deleting &&
                            setDeleteTarget(null)
                        }
                    />


                    {/* DELETE MODAL */}

                    <div
                        className="relative z-[81] w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                    >


                        {/* HEADER */}

                        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div>

                                <h2 className="text-xl font-black text-slate-900">

                                    Hapus Organization Level?

                                </h2>


                                <p className="mt-1 text-sm text-slate-500">

                                    Tindakan ini perlu dikonfirmasi.

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={() =>
                                    !deleting &&
                                    setDeleteTarget(null)
                                }
                                disabled={deleting}
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        {/* BODY */}

                        <div className="p-6">


                            <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50 p-4">

                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-600 shadow-sm">

                                    <Trash2 size={18} />

                                </div>


                                <div className="min-w-0">

                                    <p className="text-sm font-bold text-slate-800">

                                        {deleteTarget.name}

                                    </p>


                                    <p className="mt-1 font-mono text-xs text-slate-500">

                                        {deleteTarget.code}

                                    </p>

                                </div>

                            </div>


                            <p className="mt-4 text-sm leading-6 text-slate-500">

                                Anda akan menghapus organization level ini.
                                Tindakan ini tidak dapat dibatalkan.

                            </p>

                        </div>


                        {/* FOOTER */}

                        <div className="flex justify-end gap-2 border-t border-slate-100 bg-white px-6 py-5">


                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteTarget(null)
                                }
                                disabled={deleting}
                                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                Batal

                            </button>


                            <button
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                {deleting ? (

                                    <>

                                        <RefreshCw
                                            size={15}
                                            className="animate-spin"
                                        />

                                        Menghapus...

                                    </>

                                ) : (

                                    <>

                                        <Trash2 size={15} />

                                        Hapus Level

                                    </>

                                )}

                            </button>

                        </div>

                    </div>

                </div>

            )}

        </>
    );

};


export default OrganizationLevelManage;