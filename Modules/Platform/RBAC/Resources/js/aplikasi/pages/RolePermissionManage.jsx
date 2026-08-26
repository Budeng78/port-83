import React, { useEffect, useMemo, useState } from 'react';
import {
    ShieldCheck,
    Search,
    X,
    Save,
    Check,
    ChevronRight,
    Users,
    Lock,
    RefreshCw,
    AlertCircle,
} from 'lucide-react';

import roleService from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/roleService';


const PROTECTED_ROLES = ['Super Admin'];


const isProtectedRole = (role) => {
    return PROTECTED_ROLES.includes(role?.name);
};


export default function RolePermissionManage() {

    // =========================================================
    // STATE
    // =========================================================

    const [roles, setRoles] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [search, setSearch] = useState('');

    const [selectedRole, setSelectedRole] = useState(null);

    const [permissions, setPermissions] = useState([]);
    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const [permissionSearch, setPermissionSearch] = useState('');

    const [loadingPermissions, setLoadingPermissions] =
        useState(false);

    const [alert, setAlert] = useState(null);


    // =========================================================
    // LOAD ROLES
    // =========================================================

    useEffect(() => {
        fetchRoles();
    }, []);


    const fetchRoles = async () => {
        try {
            setLoading(true);
            setAlert(null);

            const response = await roleService.getRoles();

            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            setRoles(data);

        } catch (error) {
            console.error(
                'Gagal memuat role:',
                error
            );

            setAlert({
                type: 'error',
                message:
                    error?.response?.data?.message ||
                    'Gagal memuat daftar role.',
            });

        } finally {
            setLoading(false);
        }
    };


    // =========================================================
    // FILTER ROLE
    // =========================================================

    const filteredRoles = useMemo(() => {

        const keyword =
            search.trim().toLowerCase();

        if (!keyword) {
            return roles;
        }

        return roles.filter((role) =>
            role.name
                ?.toLowerCase()
                .includes(keyword)
            ||
            role.guard_name
                ?.toLowerCase()
                .includes(keyword)
        );

    }, [roles, search]);


    // =========================================================
    // OPEN PERMISSION MODAL
    // =========================================================

    const handleOpenPermission = async (role) => {

        try {

            setSelectedRole(role);

            setPermissions([]);
            setSelectedPermissions([]);

            setPermissionSearch('');

            setAlert(null);

            setLoadingPermissions(true);

            const response =
                await roleService.getAvailablePermissions(
                    role.id
                );

            const data = Array.isArray(response)
                ? response
                : response?.data || [];

            setPermissions(data);

            setSelectedPermissions(
                data
                    .filter(
                        (permission) =>
                            permission.assigned
                    )
                    .map(
                        (permission) =>
                            permission.id
                    )
            );

        } catch (error) {

            console.error(
                'Gagal memuat permission:',
                error
            );

            setAlert({
                type: 'error',
                message:
                    error?.response?.data?.message ||
                    'Gagal memuat permission role.',
            });

            setSelectedRole(null);

        } finally {

            setLoadingPermissions(false);

        }

    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const handleCloseModal = () => {

        if (saving) {
            return;
        }

        setSelectedRole(null);

        setPermissions([]);

        setSelectedPermissions([]);

        setPermissionSearch('');

    };


    // =========================================================
    // TOGGLE PERMISSION
    // =========================================================

    const togglePermission = (permissionId) => {

        if (
            selectedRole &&
            isProtectedRole(selectedRole)
        ) {
            return;
        }

        setSelectedPermissions((current) => {

            if (
                current.includes(permissionId)
            ) {

                return current.filter(
                    (id) =>
                        id !== permissionId
                );

            }

            return [
                ...current,
                permissionId,
            ];

        });

    };


    // =========================================================
    // SELECT ALL
    // =========================================================

    const handleSelectAll = () => {

        if (
            selectedRole &&
            isProtectedRole(selectedRole)
        ) {
            return;
        }

        const visibleIds =
            filteredPermissions.map(
                (permission) =>
                    permission.id
            );

        setSelectedPermissions(
            (current) => {

                const allSelected =
                    visibleIds.every(
                        (id) =>
                            current.includes(id)
                    );

                if (allSelected) {

                    return current.filter(
                        (id) =>
                            !visibleIds.includes(
                                id
                            )
                    );

                }

                return Array.from(
                    new Set([
                        ...current,
                        ...visibleIds,
                    ])
                );

            }
        );

    };


    // =========================================================
    // FILTER PERMISSION
    // =========================================================

    const filteredPermissions =
        useMemo(() => {

            const keyword =
                permissionSearch
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return permissions;
            }

            return permissions.filter(
                (permission) =>
                    permission.name
                        ?.toLowerCase()
                        .includes(keyword)
                    ||
                    permission.guard_name
                        ?.toLowerCase()
                        .includes(keyword)
            );

        }, [
            permissions,
            permissionSearch,
        ]);


    // =========================================================
    // SAVE PERMISSION
    // =========================================================

    const handleSave = async () => {

        if (!selectedRole) {
            return;
        }

        if (isProtectedRole(selectedRole)) {
            return;
        }

        try {

            setSaving(true);

            setAlert(null);

            await roleService.syncRolePermissions(
                selectedRole.id,
                selectedPermissions
            );

            // Update local data supaya jumlah
            // permission langsung berubah.
            setRoles((currentRoles) =>
                currentRoles.map((role) =>
                    role.id === selectedRole.id
                        ? {
                              ...role,
                              permissions_count:
                                  selectedPermissions.length,
                          }
                        : role
                )
            );

            setAlert({
                type: 'success',
                message:
                    `Permission untuk role "${selectedRole.name}" berhasil diperbarui.`,
            });

            handleCloseModal();

        } catch (error) {

            console.error(
                'Gagal menyimpan permission:',
                error
            );

            setAlert({
                type: 'error',
                message:
                    error?.response?.data?.message ||
                    'Gagal menyimpan permission role.',
            });

        } finally {

            setSaving(false);

        }

    };


    // =========================================================
    // COUNT
    // =========================================================

    const selectedCount =
        selectedPermissions.length;

    const totalPermissions =
        permissions.length;

    const visibleSelectedCount =
        filteredPermissions.filter(
            (permission) =>
                selectedPermissions.includes(
                    permission.id
                )
        ).length;


    // =========================================================
    // ALERT
    // =========================================================

    const renderAlert = () => {

        if (!alert) {
            return null;
        }

        const isSuccess =
            alert.type === 'success';

        return (
            <div
                className={`rounded-2xl border px-4 py-3 shadow-sm ${
                    isSuccess
                        ? 'border-emerald-200 bg-emerald-50'
                        : 'border-red-200 bg-red-50'
                }`}
            >
                <div className="flex items-start gap-3">

                    {isSuccess ? (
                        <Check
                            size={18}
                            className="mt-0.5 shrink-0 text-emerald-600"
                        />
                    ) : (
                        <AlertCircle
                            size={18}
                            className="mt-0.5 shrink-0 text-red-600"
                        />
                    )}

                    <p
                        className={`text-sm font-medium ${
                            isSuccess
                                ? 'text-emerald-700'
                                : 'text-red-700'
                        }`}
                    >
                        {alert.message}
                    </p>

                    <button
                        type="button"
                        onClick={() =>
                            setAlert(null)
                        }
                        className="ml-auto rounded-lg p-1 text-slate-400 hover:bg-white/60 hover:text-slate-600"
                    >
                        <X size={15} />
                    </button>

                </div>
            </div>
        );
    };


    // =========================================================
    // ROLE CARD - MOBILE
    // =========================================================

    const renderMobileCard = (role) => {

        const protectedRole =
            isProtectedRole(role);

        return (
            <div
                key={role.id}
                className="overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm transition hover:shadow-md"
            >

                <div className="p-4">

                    <div className="flex items-start gap-3">

                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#243A70]">
                            {protectedRole ? (
                                <Lock size={20} />
                            ) : (
                                <ShieldCheck
                                    size={20}
                                />
                            )}
                        </div>

                        <div className="min-w-0 flex-1">

                            <div className="flex items-start justify-between gap-2">

                                <div className="min-w-0">

                                    <h3 className="truncate text-sm font-bold text-[#243A70]">
                                        {role.name}
                                    </h3>

                                    <p className="mt-0.5 font-mono text-[11px] text-slate-400">
                                        Guard:{" "}
                                        {role.guard_name}
                                    </p>

                                </div>

                                {protectedRole && (
                                    <span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                        Protected
                                    </span>
                                )}

                            </div>

                            <div className="mt-3 flex flex-wrap gap-1.5">

                                <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-600">
                                    <ShieldCheck
                                        size={12}
                                    />

                                    {role.permissions_count ??
                                        role.permissions?.length ??
                                        0}{' '}
                                    Permission
                                </span>

                                <span className="flex items-center gap-1.5 rounded-lg bg-[#EAF1FF] px-2.5 py-1 text-[10px] font-medium text-[#243A70]">
                                    <Users
                                        size={12}
                                    />

                                    {role.guard_name ||
                                        'web'}
                                </span>

                            </div>

                        </div>

                    </div>

                    <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3">

                        <button
                            type="button"
                            onClick={() =>
                                handleOpenPermission(
                                    role
                                )
                            }
                            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                                protectedRole
                                    ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                    : 'bg-[#EAF1FF] text-[#243A70] hover:bg-[#DCE9FF]'
                            }`}
                        >
                            {protectedRole ? (
                                <Lock size={14} />
                            ) : (
                                <ShieldCheck
                                    size={14}
                                />
                            )}

                            Kelola Permission

                            <ChevronRight
                                size={14}
                            />
                        </button>

                    </div>

                </div>

            </div>
        );
    };


    // =========================================================
    // DESKTOP TABLE
    // =========================================================

    const renderDesktopRows = () => {

        return filteredRoles.map(
            (role) => {

                const protectedRole =
                    isProtectedRole(role);

                const permissionCount =
                    role.permissions_count ??
                    role.permissions?.length ??
                    0;

                return (
                    <tr
                        key={role.id}
                        className="group border-b border-slate-100 transition hover:bg-[#F8FAFD]"
                    >

                        {/* ROLE */}

                        <td className="px-5 py-4">

                            <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#243A70]">

                                    {protectedRole ? (
                                        <Lock size={17} />
                                    ) : (
                                        <ShieldCheck
                                            size={17}
                                        />
                                    )}

                                </div>

                                <div className="min-w-0">

                                    <div className="font-semibold text-[#243A70]">
                                        {role.name}
                                    </div>

                                    {protectedRole && (
                                        <div className="mt-0.5 text-[10px] font-medium text-amber-600">
                                            System Protected
                                        </div>
                                    )}

                                </div>

                            </div>

                        </td>

                        {/* GUARD */}

                        <td className="px-5 py-4">

                            <span className="rounded-lg bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-600">
                                {role.guard_name ||
                                    'web'}
                            </span>

                        </td>

                        {/* PERMISSION */}

                        <td className="px-5 py-4">

                            <div className="flex items-center gap-2">

                                <span className="flex h-8 min-w-8 items-center justify-center rounded-lg bg-[#EAF1FF] px-2 text-xs font-bold text-[#243A70]">
                                    {permissionCount}
                                </span>

                                <span className="text-xs text-slate-500">
                                    Permission
                                </span>

                            </div>

                        </td>

                        {/* STATUS */}

                        <td className="px-5 py-4">

                            {protectedRole ? (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">
                                    <Lock size={11} />
                                    Protected
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8F7F1] px-2.5 py-1 text-[10px] font-bold text-[#009B6A]">
                                    <Check size={11} />
                                    Dapat Dikelola
                                </span>
                            )}

                        </td>

                        {/* ACTION */}

                        <td className="px-5 py-4">

                            <div className="flex justify-end">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenPermission(
                                            role
                                        )
                                    }
                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                                        protectedRole
                                            ? 'text-amber-700 hover:bg-amber-50'
                                            : 'text-[#243A70] hover:bg-[#EAF1FF]'
                                    }`}
                                    title="Kelola Permission"
                                >

                                    {protectedRole ? (
                                        <Lock size={15} />
                                    ) : (
                                        <ShieldCheck
                                            size={15}
                                        />
                                    )}

                                    Kelola

                                </button>

                            </div>

                        </td>

                    </tr>
                );

            }
        );

    };


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div className="min-h-full bg-[#F3F4F6]">

            <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-5 sm:px-5 sm:py-6 lg:px-8">

                {/* =====================================================
                    HEADER
                ===================================================== */}

                <div className="overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm">

                    <div className="h-1 w-full bg-gradient-to-r from-[#243A70] via-[#4B8DF5] to-[#FF9D00]" />

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#243A70] text-white shadow-sm">
                                <ShieldCheck
                                    size={21}
                                />
                            </div>

                            <div className="min-w-0">

                                <h1 className="text-lg font-bold tracking-tight text-[#243A70] sm:text-xl">
                                    Role & Permission
                                </h1>

                                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">
                                    Kelola permission yang dimiliki setiap role.
                                </p>

                            </div>

                        </div>

                        <div className="flex items-center gap-2">

                            <div className="flex items-center gap-1.5 rounded-xl bg-[#EAF1FF] px-3 py-2 text-xs font-semibold text-[#243A70]">
                                <ShieldCheck
                                    size={15}
                                />

                                {roles.length} Role
                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    ALERT
                ===================================================== */}

                {alert && renderAlert()}


                {/* =====================================================
                    SEARCH
                ===================================================== */}

                <div className="rounded-2xl border border-[#D9DEE8] bg-white p-3 shadow-sm">

                    <div className="relative">

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
                            placeholder="Cari role atau guard..."
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

                </div>


                {/* =====================================================
                    CONTENT
                ===================================================== */}

                {loading ? (

                    <div className="rounded-2xl border border-[#D9DEE8] bg-white p-10 text-center shadow-sm">

                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#243A70]" />

                        <p className="text-sm text-slate-500">
                            Memuat data role...
                        </p>

                    </div>

                ) : filteredRoles.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-[#D9DEE8] bg-white px-5 py-14 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#243A70]">
                            <Search size={22} />
                        </div>

                        <h3 className="mt-3 text-sm font-bold text-[#243A70]">
                            Tidak ada role
                        </h3>

                        <p className="mt-1 text-xs text-slate-400">
                            Tidak ditemukan role yang sesuai dengan pencarian.
                        </p>

                    </div>

                ) : (

                    <>

                        {/* MOBILE */}

                        <div className="space-y-2.5 md:hidden">

                            {filteredRoles.map(
                                renderMobileCard
                            )}

                        </div>


                        {/* DESKTOP */}

                        <div className="hidden overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm md:block">

                            <div className="overflow-x-auto">

                                <table className="min-w-full">

                                    <thead>

                                        <tr className="border-b border-[#D9DEE8] bg-[#F8FAFD]">

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Role
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Guard
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Permission
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Status
                                            </th>

                                            <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Aksi
                                            </th>

                                        </tr>

                                    </thead>

                                    <tbody>
                                        {renderDesktopRows()}
                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </>

                )}

            </div>


            {/* =========================================================
                PERMISSION MODAL
            ========================================================= */}

            {selectedRole && (

                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-blue-900/50 p-3 pt-[calc(64px+12px)] pb-[calc(60px+12px)] backdrop-blur-sm sm:items-center sm:p-4 sm:pt-[76px] sm:pb-[76px]">

                    {/* OVERLAY */}

                    <div
                        className="absolute inset-0"
                        onClick={handleCloseModal}
                    />


                    {/* MODAL */}

                    <div
                        className="relative z-[101] flex max-h-[calc(100dvh-152px)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-2xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        {/* ACCENT */}

                        <div className="h-2 w-full shrink-0 bg-gradient-to-r from-[#243A70] via-[#4B8DF5] to-[#FF9D00]" />


                        {/* HEADER */}

                        <div className="flex shrink-0 items-center justify-between border-b border-[#D9DEE8] px-5 py-4">

                            <div className="min-w-0">

                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#243A70]">
                                        <ShieldCheck
                                            size={16}
                                        />
                                    </div>

                                    <h2 className="truncate text-base font-bold text-[#243A70] sm:text-lg">
                                        Role Permission
                                    </h2>

                                </div>

                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-400">

                                    <span>
                                        Role:
                                    </span>

                                    <span className="font-semibold text-[#243A70]">
                                        {selectedRole.name}
                                    </span>

                                    {isProtectedRole(
                                        selectedRole
                                    ) && (
                                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                                            Protected
                                        </span>
                                    )}

                                </div>

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


                        {/* BODY */}

                        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">

                            {loadingPermissions ? (

                                <div className="flex min-h-[300px] flex-col items-center justify-center">

                                    <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#243A70]" />

                                    <p className="text-sm text-slate-500">
                                        Memuat permission...
                                    </p>

                                </div>

                            ) : (

                                <div className="space-y-5">

                                    {/* SUMMARY */}

                                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">

                                        <div className="rounded-xl border border-[#D9DEE8] bg-[#F8FAFD] p-3">

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Total
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-[#243A70]">
                                                {totalPermissions}
                                            </p>

                                        </div>

                                        <div className="rounded-xl border border-[#D9DEE8] bg-[#F8FAFD] p-3">

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Terpilih
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-[#009B6A]">
                                                {selectedCount}
                                            </p>

                                        </div>

                                        <div className="col-span-2 rounded-xl border border-[#D9DEE8] bg-[#F8FAFD] p-3 sm:col-span-1">

                                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                                Ditampilkan
                                            </p>

                                            <p className="mt-1 text-lg font-bold text-[#243A70]">
                                                {visibleSelectedCount}
                                            </p>

                                        </div>

                                    </div>


                                    {/* PROTECTED NOTICE */}

                                    {isProtectedRole(
                                        selectedRole
                                    ) && (

                                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3">

                                            <div className="flex items-start gap-2.5">

                                                <Lock
                                                    size={17}
                                                    className="mt-0.5 shrink-0 text-amber-600"
                                                />

                                                <div>

                                                    <p className="text-xs font-bold text-amber-800">
                                                        Role terlindungi
                                                    </p>

                                                    <p className="mt-0.5 text-[11px] leading-relaxed text-amber-700">
                                                        Permission
                                                        untuk
                                                        role ini
                                                        tidak
                                                        dapat
                                                        diubah
                                                        melalui
                                                        halaman
                                                        ini.
                                                    </p>

                                                </div>

                                            </div>

                                        </div>

                                    )}


                                    {/* SEARCH PERMISSION */}

                                    <div>

                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                                            <div>

                                                <h3 className="text-xs font-bold uppercase tracking-wider text-[#243A70]">
                                                    Daftar Permission
                                                </h3>

                                                <p className="mt-1 text-[11px] text-slate-400">
                                                    Pilih permission yang diberikan kepada role.
                                                </p>

                                            </div>

                                            {!isProtectedRole(
                                                selectedRole
                                            ) && (
                                                <button
                                                    type="button"
                                                    onClick={
                                                        handleSelectAll
                                                    }
                                                    className="self-start rounded-lg px-2.5 py-1.5 text-[11px] font-bold text-[#243A70] transition hover:bg-[#EAF1FF]"
                                                >
                                                    {filteredPermissions.every(
                                                        (
                                                            permission
                                                        ) =>
                                                            selectedPermissions.includes(
                                                                permission.id
                                                            )
                                                    )
                                                        ? 'Batal Pilih Semua'
                                                        : 'Pilih Semua'}
                                                </button>
                                            )}

                                        </div>


                                        <div className="relative mt-3">

                                            <Search
                                                size={16}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            />

                                            <input
                                                type="search"
                                                value={
                                                    permissionSearch
                                                }
                                                onChange={(
                                                    e
                                                ) =>
                                                    setPermissionSearch(
                                                        e
                                                            .target
                                                            .value
                                                    )
                                                }
                                                placeholder="Cari permission..."
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-9 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                            />

                                            {permissionSearch && (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPermissionSearch(
                                                            ''
                                                        )
                                                    }
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100"
                                                >
                                                    <X
                                                        size={
                                                            14
                                                        }
                                                    />
                                                </button>
                                            )}

                                        </div>

                                    </div>


                                    {/* PERMISSION LIST */}

                                    {filteredPermissions.length ===
                                    0 ? (

                                        <div className="rounded-xl border border-dashed border-[#D9DEE8] bg-slate-50 px-5 py-10 text-center">

                                            <ShieldCheck
                                                size={24}
                                                className="mx-auto text-slate-300"
                                            />

                                            <p className="mt-2 text-xs font-semibold text-slate-500">
                                                Tidak ada permission
                                            </p>

                                        </div>

                                    ) : (

                                        <div className="space-y-2">

                                            {filteredPermissions.map(
                                                (
                                                    permission
                                                ) => {

                                                    const checked =
                                                        selectedPermissions.includes(
                                                            permission.id
                                                        );

                                                    return (
                                                        <label
                                                            key={
                                                                permission.id
                                                            }
                                                            className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                                                                checked
                                                                    ? 'border-[#4B8DF5] bg-[#EAF1FF]'
                                                                    : 'border-slate-200 bg-white hover:border-[#D9DEE8] hover:bg-[#F8FAFD]'
                                                            } ${
                                                                isProtectedRole(
                                                                    selectedRole
                                                                )
                                                                    ? 'cursor-default'
                                                                    : ''
                                                            }`}
                                                        >

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    checked
                                                                }
                                                                onChange={() =>
                                                                    togglePermission(
                                                                        permission.id
                                                                    )
                                                                }
                                                                disabled={isProtectedRole(
                                                                    selectedRole
                                                                )}
                                                                className="sr-only"
                                                            />

                                                            <div
                                                                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition ${
                                                                    checked
                                                                        ? 'border-[#243A70] bg-[#243A70] text-white'
                                                                        : 'border-slate-300 bg-white'
                                                                }`}
                                                            >
                                                                {checked && (
                                                                    <Check
                                                                        size={
                                                                            13
                                                                        }
                                                                        strokeWidth={
                                                                            3
                                                                        }
                                                                    />
                                                                )}
                                                            </div>

                                                            <div className="min-w-0 flex-1">

                                                                <div className="truncate font-mono text-xs font-semibold text-[#243A70]">
                                                                    {
                                                                        permission.name
                                                                    }
                                                                </div>

                                                                <div className="mt-0.5 text-[10px] text-slate-400">
                                                                    Guard:{' '}
                                                                    {permission.guard_name ||
                                                                        selectedRole.guard_name ||
                                                                        'web'}
                                                                </div>

                                                            </div>

                                                            {checked && (
                                                                <span className="shrink-0 rounded-full bg-[#E8F7F1] px-2 py-1 text-[9px] font-bold text-[#009B6A]">
                                                                    Assigned
                                                                </span>
                                                            )}

                                                        </label>
                                                    );

                                                }
                                            )}

                                        </div>

                                    )}

                                </div>

                            )}

                        </div>


                        {/* FOOTER */}

                        <div className="shrink-0 border-t border-[#D9DEE8] bg-white px-5 py-3">

                            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-between">

                                <button
                                    type="button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={saving}
                                    className="w-full rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >
                                    Batal
                                </button>


                                <button
                                    type="button"
                                    onClick={
                                        handleSave
                                    }
                                    disabled={
                                        saving ||
                                        loadingPermissions ||
                                        isProtectedRole(
                                            selectedRole
                                        )
                                    }
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#243A70] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1D315F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
                                >

                                    {saving ? (
                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="animate-spin"
                                            />

                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save
                                                size={16}
                                            />

                                            Simpan Permission
                                        </>
                                    )}

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}