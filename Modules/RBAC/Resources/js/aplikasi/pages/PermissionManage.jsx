import React, { useEffect, useMemo, useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Search,
    X,
    ChevronDown,
    ChevronRight,
    ShieldCheck,
    KeyRound,
    Layers3,
} from 'lucide-react';

import permissionService from '@Modules/RBAC/Resources/js/aplikasi/services/permissionService';

const DEFAULT_FORM = {
    name: '',
    guard_name: 'web',
};

export default function PermissionManage() {
    const [domains, setDomains] = useState([]);
    const [total, setTotal] = useState(0);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPermission, setCurrentPermission] = useState(null);

    const [formData, setFormData] = useState({
        ...DEFAULT_FORM,
    });

    const [search, setSearch] = useState('');
    const [expandedDomains, setExpandedDomains] = useState({});

    /*
    |--------------------------------------------------------------------------
    | Load Permission
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            setLoading(true);

            const response = await permissionService.getPermissions();

            /*
             * Controller mengembalikan:
             *
             * {
             *     success: true,
             *     message: "...",
             *     data: [...],
             *     total: 10
             * }
             */

            const data = Array.isArray(response?.data)
                ? response.data
                : [];

            setDomains(data);
            setTotal(
                Number.isFinite(response?.total)
                    ? response.total
                    : data.reduce(
                          (sum, domain) =>
                              sum + Number(domain?.total || 0),
                          0
                      )
            );
        } catch (error) {
            console.error('Gagal memuat permission:', error);

            setDomains([]);
            setTotal(0);
        } finally {
            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Flatten Permissions
    |--------------------------------------------------------------------------
    */

    const allPermissions = useMemo(() => {
        return domains.flatMap((domain) =>
            Array.isArray(domain?.permissions)
                ? domain.permissions
                : []
        );
    }, [domains]);

    /*
    |--------------------------------------------------------------------------
    | Search
    |--------------------------------------------------------------------------
    */

    const filteredDomains = useMemo(() => {
        const keyword = search.trim().toLowerCase();

        if (!keyword) {
            return domains;
        }

        return domains
            .map((domain) => {
                const domainMatched =
                    domain?.domain
                        ?.toLowerCase()
                        .includes(keyword) ||
                    domain?.name
                        ?.toLowerCase()
                        .includes(keyword);

                const permissions = Array.isArray(domain?.permissions)
                    ? domain.permissions
                    : [];

                const filteredPermissions = permissions.filter(
                    (permission) =>
                        permission?.name
                            ?.toLowerCase()
                            .includes(keyword) ||
                        permission?.guard_name
                            ?.toLowerCase()
                            .includes(keyword)
                );

                if (
                    domainMatched ||
                    filteredPermissions.length > 0
                ) {
                    return {
                        ...domain,
                        permissions: domainMatched
                            ? permissions
                            : filteredPermissions,
                        total: domainMatched
                            ? permissions.length
                            : filteredPermissions.length,
                    };
                }

                return null;
            })
            .filter(Boolean);
    }, [domains, search]);

    /*
    |--------------------------------------------------------------------------
    | Modal
    |--------------------------------------------------------------------------
    */

    const handleOpenModal = (permission = null) => {
        if (permission) {
            setCurrentPermission(permission);

            setFormData({
                name: permission.name || '',
                guard_name: permission.guard_name || 'web',
            });
        } else {
            setCurrentPermission(null);

            setFormData({
                ...DEFAULT_FORM,
            });
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (saving) return;

        setIsModalOpen(false);
        setCurrentPermission(null);

        setFormData({
            ...DEFAULT_FORM,
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Submit
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (e) => {
        e.preventDefault();

        const name = formData.name.trim();

        if (!name) {
            alert('Nama permission wajib diisi.');
            return;
        }

        try {
            setSaving(true);

            const payload = {
                name,
                guard_name: formData.guard_name || 'web',
            };

            if (currentPermission) {
                await permissionService.updatePermission(
                    currentPermission.id,
                    payload
                );
            } else {
                await permissionService.createPermission(
                    payload
                );
            }

            handleCloseModal();

            await fetchPermissions();
        } catch (error) {
            console.error(
                'Gagal menyimpan permission:',
                error
            );

            const message =
                error?.response?.data?.message ||
                error?.response?.data?.errors?.name?.[0] ||
                'Terjadi kesalahan saat menyimpan permission.';

            alert(message);
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Delete
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (permission) => {
        if (!permission?.id) return;

        const confirmed = window.confirm(
            `Apakah Anda yakin ingin menghapus permission "${permission.name}"?`
        );

        if (!confirmed) return;

        try {
            await permissionService.deletePermission(
                permission.id
            );

            await fetchPermissions();
        } catch (error) {
            console.error(
                'Gagal menghapus permission:',
                error
            );

            alert(
                error?.response?.data?.message ||
                    'Terjadi kesalahan saat menghapus permission.'
            );
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Domain Expand
    |--------------------------------------------------------------------------
    */

    const toggleDomain = (domain) => {
        setExpandedDomains((prev) => ({
            ...prev,
            [domain]: !prev[domain],
        }));
    };

    const expandAll = () => {
        const state = {};

        domains.forEach((domain) => {
            state[domain.domain] = true;
        });

        setExpandedDomains(state);
    };

    const collapseAll = () => {
        setExpandedDomains({});
    };

    /*
    |--------------------------------------------------------------------------
    | Domain Stats
    |--------------------------------------------------------------------------
    */

    const domainCount = domains.length;

    /*
    |--------------------------------------------------------------------------
    | Render Permission Card
    |--------------------------------------------------------------------------
    */

    const renderMobileDomain = (domain) => {
        const domainKey = domain.domain;
        const permissions = Array.isArray(domain.permissions)
            ? domain.permissions
            : [];

        const expanded =
            expandedDomains[domainKey] ?? true;

        return (
            <div
                key={domainKey}
                className="overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm"
            >
                {/* Domain Header */}
                <div className="border-b border-slate-100 bg-[#F8FAFD] p-4">
                    <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#243A70]">
                            <Layers3 size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <h3 className="truncate text-sm font-bold text-[#243A70]">
                                        {domain.name ||
                                            domain.domain}
                                    </h3>

                                    <p className="mt-0.5 font-mono text-[10px] text-slate-400">
                                        {domain.domain}
                                    </p>
                                </div>

                                <span className="shrink-0 rounded-full bg-[#E8F7F1] px-2.5 py-1 text-[10px] font-bold text-[#009B6A]">
                                    {permissions.length}{' '}
                                    Permission
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                        <span className="text-[11px] text-slate-400">
                            Domain Permission
                        </span>

                        <button
                            type="button"
                            onClick={() =>
                                toggleDomain(domainKey)
                            }
                            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#243A70] transition hover:bg-[#EAF1FF]"
                        >
                            {expanded ? (
                                <ChevronDown size={15} />
                            ) : (
                                <ChevronRight size={15} />
                            )}

                            {expanded
                                ? 'Tutup'
                                : 'Buka'}
                        </button>
                    </div>
                </div>

                {/* Permissions */}
                {expanded && (
                    <div className="divide-y divide-slate-100">
                        {permissions.length === 0 ? (
                            <div className="p-5 text-center text-xs text-slate-400">
                                Tidak ada permission.
                            </div>
                        ) : (
                            permissions.map(
                                (permission) => (
                                    <div
                                        key={
                                            permission.id
                                        }
                                        className="p-4 transition hover:bg-[#F8FAFD]"
                                    >
                                        <div className="flex items-start gap-3">
                                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                <KeyRound
                                                    size={
                                                        16
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-start justify-between gap-2">
                                                    <div className="min-w-0">
                                                        <div className="break-all font-mono text-xs font-semibold text-[#243A70]">
                                                            {
                                                                permission.name
                                                            }
                                                        </div>

                                                        <div className="mt-1 text-[10px] text-slate-400">
                                                            guard:{' '}
                                                            {
                                                                permission.guard_name
                                                            }
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="mt-3 flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleOpenModal(
                                                                permission
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 rounded-lg bg-[#EAF1FF] px-3 py-2 text-xs font-bold text-[#243A70] transition hover:bg-[#DCE9FF]"
                                                    >
                                                        <Edit
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Edit
                                                    </button>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                permission
                                                            )
                                                        }
                                                        className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100"
                                                    >
                                                        <Trash2
                                                            size={
                                                                14
                                                            }
                                                        />
                                                        Hapus
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            )
                        )}
                    </div>
                )}
            </div>
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Desktop Domain Rows
    |--------------------------------------------------------------------------
    */

    const renderDesktopDomains = () => {
        return filteredDomains.map((domain) => {
            const domainKey = domain.domain;

            const permissions = Array.isArray(
                domain.permissions
            )
                ? domain.permissions
                : [];

            const expanded =
                expandedDomains[domainKey] ?? true;

            return (
                <React.Fragment key={domainKey}>
                    {/* Domain */}
                    <tr className="border-b border-slate-100 bg-[#F8FAFD]">
                        <td
                            colSpan="4"
                            className="px-5 py-3"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleDomain(
                                                domainKey
                                            )
                                        }
                                        className="rounded-md p-1 text-slate-400 transition hover:bg-[#EAF1FF] hover:text-[#243A70]"
                                    >
                                        {expanded ? (
                                            <ChevronDown
                                                size={
                                                    16
                                                }
                                            />
                                        ) : (
                                            <ChevronRight
                                                size={
                                                    16
                                                }
                                            />
                                        )}
                                    </button>

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#243A70]">
                                        <Layers3
                                            size={16}
                                        />
                                    </div>

                                    <div>
                                        <div className="font-bold text-[#243A70]">
                                            {domain.name ||
                                                domain.domain}
                                        </div>

                                        <div className="font-mono text-[10px] text-slate-400">
                                            {
                                                domain.domain
                                            }
                                        </div>
                                    </div>

                                    <span className="rounded-full bg-[#E8F7F1] px-2.5 py-1 text-[10px] font-bold text-[#009B6A]">
                                        {
                                            permissions.length
                                        }{' '}
                                        permission
                                    </span>
                                </div>

                                <span className="text-[10px] font-medium text-slate-400">
                                    Domain
                                </span>
                            </div>
                        </td>
                    </tr>

                    {/* Permissions */}
                    {expanded &&
                        permissions.map(
                            (permission) => (
                                <tr
                                    key={
                                        permission.id
                                    }
                                    className="group border-b border-slate-100 transition hover:bg-[#F8FAFD]"
                                >
                                    <td className="px-5 py-3.5">
                                        <div className="flex items-center gap-2 pl-10">
                                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                                <KeyRound
                                                    size={
                                                        15
                                                    }
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="break-all font-mono text-xs font-semibold text-[#243A70]">
                                                    {
                                                        permission.name
                                                    }
                                                </div>

                                                <div className="mt-0.5 text-[10px] text-slate-400">
                                                    Permission
                                                </div>
                                            </div>
                                        </div>
                                    </td>

                                    <td className="px-5 py-3.5">
                                        <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600">
                                            {
                                                permission.guard_name
                                            }
                                        </span>
                                    </td>

                                    <td className="px-5 py-3.5">
                                        <span className="rounded-lg bg-[#EAF1FF] px-2 py-1 font-mono text-[10px] font-medium text-[#243A70]">
                                            {domain.domain}
                                        </span>
                                    </td>

                                    <td className="px-5 py-3.5">
                                        <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenModal(
                                                        permission
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-[#EAF1FF] hover:text-[#243A70]"
                                                title="Edit"
                                            >
                                                <Edit
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDelete(
                                                        permission
                                                    )
                                                }
                                                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                                                title="Hapus"
                                            >
                                                <Trash2
                                                    size={
                                                        16
                                                    }
                                                />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )
                        )}
                </React.Fragment>
            );
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    return (
        <div className="min-h-full bg-[#F3F4F6]">
            <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-5 sm:px-5 sm:py-6 lg:px-8">

                {/* =========================================================
                    HEADER
                ========================================================= */}

                <div className="overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm">
                    <div className="h-1 w-full bg-gradient-to-r from-[#243A70] via-[#4B8DF5] to-[#FF9D00]" />

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#243A70] text-white shadow-sm">
                                <ShieldCheck size={21} />
                            </div>

                            <div className="min-w-0">
                                <h1 className="text-lg font-bold tracking-tight text-[#243A70] sm:text-xl">
                                    Manajemen Permission
                                </h1>

                                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                    Kelola permission aplikasi berdasarkan domain.
                                </p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={() =>
                                handleOpenModal()
                            }
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#243A70] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1D315F] active:scale-[0.98] sm:w-auto"
                        >
                            <Plus size={18} />
                            Tambah Permission
                        </button>
                    </div>
                </div>

                {/* =========================================================
                    STATISTICS
                ========================================================= */}

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-[#D9DEE8] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#243A70]">
                                <KeyRound size={18} />
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Permission
                                </p>

                                <p className="text-xl font-bold text-[#243A70]">
                                    {total}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-2xl border border-[#D9DEE8] bg-white p-4 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E8F7F1] text-[#009B6A]">
                                <Layers3 size={18} />
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Domain
                                </p>

                                <p className="text-xl font-bold text-[#243A70]">
                                    {domainCount}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 rounded-2xl border border-[#D9DEE8] bg-white p-4 shadow-sm sm:col-span-1">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FFF4E5] text-[#D97706]">
                                <ShieldCheck size={18} />
                            </div>

                            <div>
                                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                                    Guard
                                </p>

                                <p className="text-xl font-bold text-[#243A70]">
                                    web
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    SEARCH & TOOLBAR
                ========================================================= */}

                <div className="rounded-2xl border border-[#D9DEE8] bg-white p-3 shadow-sm">
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <div className="relative flex-1">
                            <Search
                                size={17}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Cari permission atau domain..."
                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-10 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                            />

                            {search && (
                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch('')
                                    }
                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                >
                                    <X size={15} />
                                </button>
                            )}
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={expandAll}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D9DEE8] px-3 py-2.5 text-xs font-semibold text-[#243A70] transition hover:bg-[#EAF1FF] sm:flex-none"
                            >
                                <ChevronDown size={15} />
                                Buka Semua
                            </button>

                            <button
                                type="button"
                                onClick={collapseAll}
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D9DEE8] px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
                            >
                                <ChevronRight size={15} />
                                Tutup Semua
                            </button>
                        </div>
                    </div>
                </div>

                {/* =========================================================
                    CONTENT
                ========================================================= */}

                {loading ? (
                    <div className="rounded-2xl border border-[#D9DEE8] bg-white p-10 text-center shadow-sm">
                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#243A70]" />

                        <p className="text-sm text-slate-500">
                            Memuat data permission...
                        </p>
                    </div>
                ) : filteredDomains.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#D9DEE8] bg-white px-5 py-14 text-center">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#243A70]">
                            <Search size={22} />
                        </div>

                        <h3 className="mt-3 text-sm font-bold text-[#243A70]">
                            Tidak ada permission
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Tidak ditemukan permission yang sesuai.
                        </p>
                    </div>
                ) : (
                    <>
                        {/* MOBILE */}
                        <div className="space-y-3 md:hidden">
                            {filteredDomains.map(
                                (domain) =>
                                    renderMobileDomain(
                                        domain
                                    )
                            )}
                        </div>

                        {/* DESKTOP */}
                        <div className="hidden overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm md:block">
                            <div className="overflow-x-auto">
                                <table className="min-w-full">
                                    <thead>
                                        <tr className="border-b border-[#D9DEE8] bg-[#F8FAFD]">
                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Permission
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Guard
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Domain
                                            </th>

                                            <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {renderDesktopDomains()}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* =============================================================
                MODAL
            ============================================================= */}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/50 p-0 backdrop-blur-[2px] sm:items-center sm:p-4">
                    <div className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl">
                        <div className="h-1 w-full bg-gradient-to-r from-[#243A70] via-[#4B8DF5] to-[#FF9D00]" />

                        {/* Modal Header */}
                        <div className="flex items-center justify-between border-b border-[#D9DEE8] px-5 py-4">
                            <div>
                                <div className="flex items-center gap-2">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#243A70]">
                                        <ShieldCheck size={16} />
                                    </div>

                                    <h2 className="text-base font-bold text-[#243A70] sm:text-lg">
                                        {currentPermission
                                            ? 'Edit Permission'
                                            : 'Tambah Permission'}
                                    </h2>
                                </div>

                                <p className="mt-1 text-xs text-slate-400">
                                    Atur nama permission dan guard aplikasi.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={saving}
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <X size={19} />
                            </button>
                        </div>

                        {/* Form */}
                        <form
                            onSubmit={handleSubmit}
                            className="flex min-h-0 flex-1 flex-col"
                        >
                            <div className="space-y-6 overflow-y-auto px-5 py-5">
                                {/* Informasi */}
                                <section>
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="h-5 w-1 rounded-full bg-[#4B8DF5]" />

                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#243A70]">
                                            Informasi Permission
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                Permission Name
                                            </label>

                                            <div className="relative">
                                                <KeyRound
                                                    size={15}
                                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                />

                                                <input
                                                    type="text"
                                                    value={
                                                        formData.name
                                                    }
                                                    onChange={(
                                                        e
                                                    ) =>
                                                        setFormData(
                                                            {
                                                                ...formData,
                                                                name: e
                                                                    .target
                                                                    .value,
                                                            }
                                                        )
                                                    }
                                                    required
                                                    autoFocus
                                                    placeholder="Contoh: hrd.users.view"
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 font-mono text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                />
                                            </div>

                                            <p className="mt-1.5 text-[11px] text-slate-400">
                                                Gunakan format domain.action agar permission otomatis dikelompokkan.
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                {/* Guard */}
                                <section className="border-t border-slate-100 pt-5">
                                    <div className="mb-4 flex items-center gap-2">
                                        <div className="h-5 w-1 rounded-full bg-[#009B6A]" />

                                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#243A70]">
                                            Pengaturan Akses
                                        </h3>
                                    </div>

                                    <div>
                                        <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                            Guard Name
                                        </label>

                                        <select
                                            value={
                                                formData.guard_name
                                            }
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    guard_name:
                                                        e.target
                                                            .value,
                                                })
                                            }
                                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                        >
                                            <option value="web">
                                                web
                                            </option>

                                            <option value="api">
                                                api
                                            </option>
                                        </select>

                                        <p className="mt-1.5 text-[11px] text-slate-400">
                                            Guard harus sesuai dengan autentikasi yang digunakan aplikasi.
                                        </p>
                                    </div>
                                </section>

                                {/* Preview */}
                                <section className="rounded-xl border border-[#D9DEE8] bg-[#F8FAFD] p-4">
                                    <div className="mb-3 flex items-center gap-2">
                                        <ShieldCheck
                                            size={15}
                                            className="text-[#243A70]"
                                        />

                                        <span className="text-xs font-bold text-[#243A70]">
                                            Preview
                                        </span>
                                    </div>

                                    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                                        <div className="font-mono text-xs font-semibold text-[#243A70]">
                                            {formData.name ||
                                                'permission.name'}
                                        </div>

                                        <div className="mt-1 text-[10px] text-slate-400">
                                            guard:{' '}
                                            {
                                                formData.guard_name
                                            }
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t border-[#D9DEE8] bg-white px-5 py-3.5">
                                <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                                    <button
                                        type="button"
                                        onClick={
                                            handleCloseModal
                                        }
                                        disabled={saving}
                                        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                    >
                                        Batal
                                    </button>

                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#243A70] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1D315F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                                    >
                                        {saving && (
                                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                                        )}

                                        {saving
                                            ? 'Menyimpan...'
                                            : currentPermission
                                              ? 'Simpan Perubahan'
                                              : 'Simpan Permission'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}