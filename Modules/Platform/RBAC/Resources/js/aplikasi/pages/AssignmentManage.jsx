import React, { useEffect, useMemo, useState } from 'react';

import {
    Search,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    X,
    Save,
    UserRound,
    Building2,
    Layers3,
    Star,
    CalendarDays,
    CheckCircle2,
    Circle,
    UsersRound,
    ChevronDown,
    ChevronRight,
} from 'lucide-react';

import userService
    from '@Modules/Platform/Auth/Resources/js/aplikasi/services/UserService';

import organizationUnitService
    from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/organizationUnitService';

import organizationLevelService
    from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/organizationLevelService';

import userAssignmentService
    from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/userAssignmentService';


// =====================================================
// CONSTANT
// =====================================================

const TOP_NAVBAR_HEIGHT = 64;
const BOTTOM_NAVBAR_HEIGHT = 60;

const EMPTY_FORM = {
    user_id: '',
    organization_unit_id: '',
    organization_level_id: '',
    is_primary: false,
    starts_at: '',
    ends_at: '',
    is_active: true,
};


// =====================================================
// COMPONENT
// =====================================================

export default function AssignmentManage() {

    // ===================================================
    // DATA
    // ===================================================

    /*
     * Setiap item adalah USER dengan aggregate assignment:
     *
     * {
     *   user: {},
     *   primary: {},
     *   secondary: [],
     *   assignments: []
     * }
     */
    const [usersWithAssignments, setUsersWithAssignments] =
        useState([]);

    const [users, setUsers] = useState([]);
    const [organizationUnits, setOrganizationUnits] = useState([]);
    const [organizationLevels, setOrganizationLevels] = useState([]);

    // ===================================================
    // LOADING
    // ===================================================

    const [loading, setLoading] = useState(false);
    const [loadingMaster, setLoadingMaster] = useState(false);
    const [saving, setSaving] = useState(false);

    // ===================================================
    // MESSAGE
    // ===================================================

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // ===================================================
    // SEARCH
    // ===================================================

    const [search, setSearch] = useState('');

    // ===================================================
    // FILTER
    // ===================================================

    const [userFilter, setUserFilter] = useState('');
    const [unitFilter, setUnitFilter] = useState('');
    const [levelFilter, setLevelFilter] = useState('');
    const [activeFilter, setActiveFilter] = useState('');
    const [primaryFilter, setPrimaryFilter] = useState('');

    // ===================================================
    // PAGINATION
    // ===================================================

    const [total, setTotal] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [lastPage, setLastPage] = useState(1);

    const [perPage] = useState(15);

    // ===================================================
    // EXPANDED USER
    // ===================================================

    const [expandedUsers, setExpandedUsers] = useState({});

    // ===================================================
    // MODAL
    // ===================================================

    const [showModal, setShowModal] = useState(false);

    const [modalMode, setModalMode] = useState('create');

    const [selectedUser, setSelectedUser] = useState(null);

    const [selectedAssignment, setSelectedAssignment] =
        useState(null);

    // ===================================================
    // FORM
    // ===================================================

    const [form, setForm] = useState({
        ...EMPTY_FORM,
    });

    const [formErrors, setFormErrors] = useState({});


    // ===================================================
    // LOAD ASSIGNMENTS
    // ===================================================

    const loadAssignments = async (page = 1) => {

        setLoading(true);
        setError('');

        try {

            const params = {
                page,
                per_page: perPage,
            };

            if (search.trim()) {
                params.search = search.trim();
            }

            if (userFilter) {
                params.user_id = userFilter;
            }

            if (unitFilter) {
                params.organization_unit_id = unitFilter;
            }

            if (levelFilter) {
                params.organization_level_id = levelFilter;
            }

            if (activeFilter !== '') {
                params.is_active = activeFilter;
            }

            if (primaryFilter !== '') {
                params.is_primary = primaryFilter;
            }


            const response =
                await userAssignmentService.getAssignments(
                    params
                );


            const responseData =
                response?.data;


            const data =
                Array.isArray(responseData)
                    ? responseData
                    : [];


            setUsersWithAssignments(data);


            setTotal(
                Number(
                    response?.meta?.total ??
                    response?.pagination?.total ??
                    data.length
                )
            );


            setCurrentPage(
                Number(
                    response?.meta?.current_page ??
                    response?.pagination?.current_page ??
                    page
                )
            );


            setLastPage(
                Number(
                    response?.meta?.last_page ??
                    response?.pagination?.last_page ??
                    1
                )
            );

        } catch (err) {

            console.error(
                'Gagal mengambil data assignment:',
                err
            );

            setUsersWithAssignments([]);

            setTotal(0);

            setCurrentPage(1);

            setLastPage(1);

            setError(
                err?.response?.data?.message ||
                'Gagal mengambil data assignment.'
            );

        } finally {

            setLoading(false);
        }
    };


    // ===================================================
    // LOAD MASTER DATA
    // ===================================================

    const loadMasterData = async () => {

        setLoadingMaster(true);

        try {

            const [
                usersResponse,
                unitsResponse,
                levelsResponse,
            ] = await Promise.all([

                userService.getUsers({
                    page: 1,
                    per_page: 1000,
                    search: '',
                }),

                organizationUnitService
                    .getOrganizationUnits({
                        is_active: true,
                    }),

                organizationLevelService
                    .getOrganizationLevels({
                        is_active: true,
                    }),
            ]);


            const usersData =
                Array.isArray(usersResponse?.data)
                    ? usersResponse.data
                    : Array.isArray(usersResponse?.data?.data)
                        ? usersResponse.data.data
                        : Array.isArray(usersResponse)
                            ? usersResponse
                            : [];

            setUsers(usersData);


            const unitsData =
                Array.isArray(unitsResponse?.data)
                    ? unitsResponse.data
                    : [];


            setOrganizationUnits(unitsData);


            const levelsData =
                Array.isArray(levelsResponse?.data)
                    ? levelsResponse.data
                    : [];


            setOrganizationLevels(levelsData);

        } catch (err) {

            console.error(
                'Gagal mengambil master data assignment:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal mengambil master data assignment.'
            );

        } finally {

            setLoadingMaster(false);
        }
    };


    // ===================================================
    // INITIAL LOAD
    // ===================================================

    useEffect(() => {

        loadMasterData();

        loadAssignments(1);

    }, []);


    // ===================================================
    // SEARCH / FILTER
    // ===================================================

    useEffect(() => {

        const timer =
            setTimeout(() => {

                loadAssignments(1);

            }, 400);


        return () => {
            clearTimeout(timer);
        };

    }, [
        search,
        userFilter,
        unitFilter,
        levelFilter,
        activeFilter,
        primaryFilter,
    ]);


    // ===================================================
    // STATISTICS
    // ===================================================

    const statistics = useMemo(() => {

        let primaryCount = 0;
        let secondaryCount = 0;
        let activeCount = 0;

        usersWithAssignments.forEach((item) => {

            if (item?.primary) {
                primaryCount++;
            }

            secondaryCount +=
                Array.isArray(item?.secondary)
                    ? item.secondary.length
                    : 0;


            const assignments =
                Array.isArray(item?.assignments)
                    ? item.assignments
                    : [];


            if (
                assignments.some(
                    (assignment) =>
                        Boolean(assignment?.is_active)
                )
            ) {
                activeCount++;
            }
        });


        return {
            primaryCount,
            secondaryCount,
            activeCount,
        };

    }, [usersWithAssignments]);


    // ===================================================
    // REFRESH
    // ===================================================

    const handleRefresh = async () => {

        setError('');
        setSuccess('');

        await Promise.all([
            loadMasterData(),
            loadAssignments(currentPage),
        ]);
    };


    // ===================================================
    // RESET FILTER
    // ===================================================

    const resetFilters = () => {

        setSearch('');
        setUserFilter('');
        setUnitFilter('');
        setLevelFilter('');
        setActiveFilter('');
        setPrimaryFilter('');
    };


    // ===================================================
    // TOGGLE USER
    // ===================================================

    const toggleUser = (userId) => {

        setExpandedUsers((previous) => ({
            ...previous,
            [userId]: !previous[userId],
        }));
    };


    // ===================================================
    // CREATE MODAL
    // ===================================================

    const openCreateModal = () => {

        setModalMode('create');

        setSelectedUser(null);

        setSelectedAssignment(null);

        setForm({
            ...EMPTY_FORM,
        });

        setFormErrors({});

        setError('');

        setSuccess('');

        setShowModal(true);
    };


    // ===================================================
    // CREATE FROM USER
    // ===================================================

    const openCreateForUser = (userAggregate) => {

        setModalMode('create');

        setSelectedUser(
            userAggregate?.user || null
        );

        setSelectedAssignment(null);

        setForm({
            ...EMPTY_FORM,

            user_id:
                userAggregate?.user?.id || '',
        });

        setFormErrors({});

        setError('');

        setSuccess('');

        setShowModal(true);
    };


    // ===================================================
    // EDIT ASSIGNMENT
    // ===================================================

    const openEditModal = (
        assignment,
        userAggregate = null
    ) => {

        setModalMode('edit');

        setSelectedAssignment(assignment);

        setSelectedUser(
            userAggregate?.user ||
            assignment?.user ||
            null
        );


        setForm({

            user_id:
                assignment?.user?.id ??
                assignment?.user_id ??
                userAggregate?.user?.id ??
                '',

            organization_unit_id:
                assignment?.organization_unit?.id ??
                assignment?.organization_unit_id ??
                '',

            organization_level_id:
                assignment?.organization_level?.id ??
                assignment?.organization_level_id ??
                '',

            is_primary:
                Boolean(
                    assignment?.is_primary
                ),

            starts_at:
                formatDateForInput(
                    assignment?.starts_at
                ),

            ends_at:
                formatDateForInput(
                    assignment?.ends_at
                ),

            is_active:
                Boolean(
                    assignment?.is_active
                ),
        });


        setFormErrors({});

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

        setSelectedUser(null);

        setSelectedAssignment(null);

        setForm({
            ...EMPTY_FORM,
        });

        setFormErrors({});
    };


    // ===================================================
    // INPUT CHANGE
    // ===================================================

    const handleInputChange = (event) => {

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


        setFormErrors((previous) => ({
            ...previous,
            [name]: undefined,
        }));
    };


    // ===================================================
    // VALIDATE FORM
    // ===================================================

    const validateForm = () => {

        const errors = {};


        if (!form.user_id) {
            errors.user_id =
                'User wajib dipilih.';
        }


        if (!form.organization_unit_id) {
            errors.organization_unit_id =
                'Organization Unit wajib dipilih.';
        }


        if (!form.organization_level_id) {
            errors.organization_level_id =
                'Organization Level wajib dipilih.';
        }


        if (
            form.starts_at &&
            form.ends_at &&
            form.ends_at < form.starts_at
        ) {
            errors.ends_at =
                'Tanggal selesai tidak boleh lebih awal dari tanggal mulai.';
        }


        setFormErrors(errors);


        return Object.keys(errors).length === 0;
    };


    // ===================================================
    // SUBMIT
    // ===================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError('');

        setSuccess('');


        if (!validateForm()) {
            return;
        }


        setSaving(true);


        try {

            const payload = {

                user_id:
                    form.user_id,

                organization_unit_id:
                    form.organization_unit_id,

                organization_level_id:
                    form.organization_level_id,

                is_primary:
                    Boolean(form.is_primary),

                starts_at:
                    form.starts_at || null,

                ends_at:
                    form.ends_at || null,

                is_active:
                    Boolean(form.is_active),
            };


            if (modalMode === 'create') {

                await userAssignmentService
                    .createAssignment(payload);


                setSuccess(
                    'User assignment berhasil ditambahkan.'
                );

            } else {

                await userAssignmentService
                    .updateAssignment(
                        selectedAssignment.id,
                        payload
                    );


                setSuccess(
                    'User assignment berhasil diperbarui.'
                );
            }


            setShowModal(false);

            setSelectedUser(null);

            setSelectedAssignment(null);

            setForm({
                ...EMPTY_FORM,
            });

            setFormErrors({});


            await loadAssignments(
                modalMode === 'create'
                    ? 1
                    : currentPage
            );

        } catch (err) {

            console.error(
                'Gagal menyimpan assignment:',
                err
            );


            if (
                err?.response?.status === 422 &&
                err?.response?.data?.errors
            ) {

                setFormErrors(
                    err.response.data.errors
                );

            } else {

                setError(
                    err?.response?.data?.message ||
                    'Gagal menyimpan assignment.'
                );
            }

        } finally {

            setSaving(false);
        }
    };


    // ===================================================
    // DELETE ASSIGNMENT
    // ===================================================

    const handleDelete = async (
        assignment,
        userAggregate
    ) => {

        const userName =
            userAggregate?.user?.name ||
            assignment?.user?.name ||
            'user ini';


        const assignmentName =
            assignment?.organization_unit?.name ||
            'assignment ini';


        const confirmed =
            window.confirm(
                `Apakah Anda yakin ingin menghapus assignment "${assignmentName}" milik ${userName}?`
            );


        if (!confirmed) {
            return;
        }


        setLoading(true);

        setError('');

        setSuccess('');


        try {

            await userAssignmentService
                .deleteAssignment(
                    assignment.id
                );


            setSuccess(
                'User assignment berhasil dihapus.'
            );


            await loadAssignments(
                currentPage
            );

        } catch (err) {

            console.error(
                'Gagal menghapus assignment:',
                err
            );


            setError(
                err?.response?.data?.message ||
                'Gagal menghapus assignment.'
            );

        } finally {

            setLoading(false);
        }
    };


    // ===================================================
    // FIELD ERROR
    // ===================================================

    const getFieldError = (
        field
    ) => {

        const value =
            formErrors?.[field];


        return Array.isArray(value)
            ? value[0]
            : value;
    };


    // ===================================================
    // PAGINATION
    // ===================================================

    const goToPage = (page) => {

        if (
            page < 1 ||
            page > lastPage ||
            page === currentPage
        ) {
            return;
        }


        loadAssignments(page);
    };


    // ===================================================
    // RENDER
    // ===================================================

    return (
        <>
            <div className="space-y-5">

                {/* =================================================
                    HEADER
                ================================================== */}

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />

                    <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-4">

                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">

                                <UsersRound size={24} />

                            </div>


                            <div>

                                <h1 className="text-xl font-black tracking-tight text-slate-900">
                                    Manajemen Assignment
                                </h1>

                                <p className="text-sm text-slate-500">
                                    Kelola assignment user berdasarkan struktur organisasi.
                                </p>

                            </div>

                        </div>


                        <div className="flex items-center gap-2 self-end sm:self-auto">

                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={
                                    loading ||
                                    loadingMaster
                                }
                                title="Refresh Data"
                                className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <RefreshCw
                                    size={18}
                                    className={
                                        loading ||
                                        loadingMaster
                                            ? 'animate-spin'
                                            : ''
                                    }
                                />

                            </button>


                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="flex items-center gap-2 rounded-xl bg-blue-900 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-slate-800"
                            >

                                <Plus size={18} />

                                <span>
                                    Tambah Assignment
                                </span>

                            </button>

                        </div>

                    </div>

                </div>


                {/* =================================================
                    SUMMARY
                ================================================== */}

                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

                    <SummaryCard
                        icon={UsersRound}
                        label="User"
                        value={total}
                        iconClass="bg-blue-50 text-blue-600"
                    />

                    <SummaryCard
                        icon={Star}
                        label="Primary"
                        value={statistics.primaryCount}
                        iconClass="bg-amber-50 text-amber-600"
                    />

                    <SummaryCard
                        icon={Layers3}
                        label="Secondary"
                        value={statistics.secondaryCount}
                        iconClass="bg-indigo-50 text-indigo-600"
                    />

                    <SummaryCard
                        icon={CheckCircle2}
                        label="User Aktif"
                        value={statistics.activeCount}
                        iconClass="bg-emerald-50 text-emerald-600"
                    />

                </div>


                {/* =================================================
                    SUCCESS
                ================================================== */}

                {success && (

                    <Alert
                        type="success"
                        message={success}
                        onClose={() => setSuccess('')}
                    />

                )}


                {/* =================================================
                    ERROR
                ================================================== */}

                {error && (

                    <Alert
                        type="error"
                        message={error}
                        onClose={() => setError('')}
                    />

                )}


                {/* =================================================
                    MAIN CARD
                ================================================== */}

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    {/* =================================================
                        TOOLBAR
                    ================================================== */}

                    <div className="space-y-3 border-b border-slate-100 p-4">

                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                            <div className="relative w-full lg:max-w-md">

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
                                    placeholder="Cari user, unit, atau level..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                />

                            </div>


                            <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-slate-500">

                                <span>
                                    Total:
                                    <strong className="ml-1 font-black text-slate-800">
                                        {total}
                                    </strong>{' '}
                                    user
                                </span>


                                <span className="hidden text-slate-300 sm:inline">
                                    |
                                </span>


                                <button
                                    type="button"
                                    onClick={resetFilters}
                                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50"
                                >
                                    Reset Filter
                                </button>

                            </div>

                        </div>


                        {/* FILTER */}

                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-5">

                            <select
                                value={userFilter}
                                onChange={(event) =>
                                    setUserFilter(
                                        event.target.value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua User
                                </option>

                                {users.map((user) => (

                                    <option
                                        key={user.id}
                                        value={user.id}
                                    >
                                        {user.name}
                                    </option>

                                ))}

                            </select>


                            <select
                                value={unitFilter}
                                onChange={(event) =>
                                    setUnitFilter(
                                        event.target.value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua Unit
                                </option>

                                {organizationUnits.map((unit) => (

                                    <option
                                        key={unit.id}
                                        value={unit.id}
                                    >
                                        {unit.name || unit.code}
                                    </option>

                                ))}

                            </select>


                            <select
                                value={levelFilter}
                                onChange={(event) =>
                                    setLevelFilter(
                                        event.target.value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua Level
                                </option>

                                {organizationLevels.map((level) => (

                                    <option
                                        key={level.id}
                                        value={level.id}
                                    >
                                        {level.name || level.code}
                                    </option>

                                ))}

                            </select>


                            <select
                                value={activeFilter}
                                onChange={(event) =>
                                    setActiveFilter(
                                        event.target.value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua Status
                                </option>

                                <option value="1">
                                    Aktif
                                </option>

                                <option value="0">
                                    Nonaktif
                                </option>

                            </select>


                            <select
                                value={primaryFilter}
                                onChange={(event) =>
                                    setPrimaryFilter(
                                        event.target.value
                                    )
                                }
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600 outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua Assignment
                                </option>

                                <option value="1">
                                    Memiliki Primary
                                </option>

                                <option value="0">
                                    Secondary Saja
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

                                    <th className="w-[25%] px-5 py-3.5">
                                        User
                                    </th>

                                    <th className="w-[30%] px-5 py-3.5">
                                        Assignment Utama
                                    </th>

                                    <th className="w-[30%] px-5 py-3.5">
                                        Assignment Sampingan
                                    </th>

                                    <th className="w-[10%] px-5 py-3.5">
                                        Status
                                    </th>

                                    <th className="w-[5%] px-5 py-3.5 text-right">
                                        Aksi
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100 text-sm">

                                {loading && (

                                    <tr>

                                        <td
                                            colSpan="5"
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


                                {!loading &&
                                    usersWithAssignments.length === 0 && (

                                        <tr>

                                            <td
                                                colSpan="5"
                                                className="px-5 py-10 text-center text-sm font-semibold text-slate-400"
                                            >
                                                Tidak ada data assignment.
                                            </td>

                                        </tr>

                                    )}


                                {!loading &&
                                    usersWithAssignments.map(
                                        (item) => {

                                            const user =
                                                item?.user || {};

                                            const primary =
                                                item?.primary || null;

                                            const secondary =
                                                Array.isArray(
                                                    item?.secondary
                                                )
                                                    ? item.secondary
                                                    : [];

                                            const assignments =
                                                Array.isArray(
                                                    item?.assignments
                                                )
                                                    ? item.assignments
                                                    : [];

                                            const isExpanded =
                                                Boolean(
                                                    expandedUsers[
                                                        user.id
                                                    ]
                                                );

                                            const hasSecondary =
                                                secondary.length > 0;

                                            const isActive =
                                                assignments.some(
                                                    (assignment) =>
                                                        Boolean(
                                                            assignment?.is_active
                                                        )
                                                );


                                            return (
                                                <React.Fragment
                                                    key={user.id}
                                                >

                                                    <tr className="transition-colors hover:bg-slate-50">

                                                        {/* USER */}

                                                        <td className="px-5 py-4">

                                                            <div className="flex items-center gap-3">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        toggleUser(
                                                                            user.id
                                                                        )
                                                                    }
                                                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                                                                    title={
                                                                        isExpanded
                                                                            ? 'Tutup detail'
                                                                            : 'Lihat detail'
                                                                    }
                                                                >

                                                                    {isExpanded ? (
                                                                        <ChevronDown
                                                                            size={15}
                                                                        />
                                                                    ) : (
                                                                        <ChevronRight
                                                                            size={15}
                                                                        />
                                                                    )}

                                                                </button>


                                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                                                    <UserRound
                                                                        size={17}
                                                                    />

                                                                </div>


                                                                <div className="min-w-0">

                                                                    <p className="truncate font-black text-slate-800">
                                                                        {user.name || '-'}
                                                                    </p>

                                                                    <p className="truncate text-xs text-slate-400">
                                                                        {user.email || '-'}
                                                                    </p>

                                                                </div>

                                                            </div>

                                                        </td>


                                                        {/* PRIMARY */}

                                                        <td className="px-5 py-4">

                                                            {primary ? (

                                                                <AssignmentCard
                                                                    assignment={
                                                                        primary
                                                                    }
                                                                    primary
                                                                    compact
                                                                />

                                                            ) : (

                                                                <div className="flex items-center gap-2 text-xs text-slate-400">

                                                                    <Circle
                                                                        size={14}
                                                                    />

                                                                    Belum ada primary assignment

                                                                </div>

                                                            )}

                                                        </td>


                                                        {/* SECONDARY */}

                                                        <td className="px-5 py-4">

                                                            {hasSecondary ? (

                                                                <div className="space-y-2">

                                                                    {secondary
                                                                        .slice(
                                                                            0,
                                                                            2
                                                                        )
                                                                        .map(
                                                                            (
                                                                                assignment
                                                                            ) => (

                                                                                <AssignmentCard
                                                                                    key={
                                                                                        assignment.id
                                                                                    }
                                                                                    assignment={
                                                                                        assignment
                                                                                    }
                                                                                    compact
                                                                                />

                                                                            )
                                                                        )}


                                                                    {secondary.length >
                                                                        2 && (

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                toggleUser(
                                                                                    user.id
                                                                                )
                                                                            }
                                                                            className="text-xs font-bold text-blue-600 hover:text-blue-800"
                                                                        >
                                                                            +{' '}
                                                                            {secondary.length -
                                                                                2}{' '}
                                                                            secondary lainnya
                                                                        </button>

                                                                    )}

                                                                </div>

                                                            ) : (

                                                                <span className="text-xs text-slate-400">
                                                                    Tidak ada assignment sampingan
                                                                </span>

                                                            )}

                                                        </td>


                                                        {/* STATUS */}

                                                        <td className="px-5 py-4">

                                                            {isActive ? (

                                                                <span className="flex w-fit items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600">

                                                                    <CheckCircle2
                                                                        size={11}
                                                                    />

                                                                    AKTIF

                                                                </span>

                                                            ) : (

                                                                <span className="flex w-fit items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-600">

                                                                    <Circle
                                                                        size={11}
                                                                    />

                                                                    NONAKTIF

                                                                </span>

                                                            )}

                                                        </td>


                                                        {/* ACTION */}

                                                        <td className="px-5 py-4 text-right">

                                                            <div className="flex items-center justify-end gap-1.5">

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openCreateForUser(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 transition-all hover:bg-emerald-100"
                                                                    title="Tambah assignment"
                                                                >

                                                                    <Plus
                                                                        size={15}
                                                                    />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        primary
                                                                            ? openEditModal(
                                                                                primary,
                                                                                item
                                                                            )
                                                                            : openCreateForUser(
                                                                                item
                                                                            )
                                                                    }
                                                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 transition-all hover:bg-blue-100"
                                                                    title={
                                                                        primary
                                                                            ? 'Edit primary'
                                                                            : 'Tambah primary'
                                                                    }
                                                                >

                                                                    <Pencil
                                                                        size={15}
                                                                    />

                                                                </button>

                                                            </div>

                                                        </td>

                                                    </tr>


                                                    {/* EXPANDED */}

                                                    {isExpanded && (

                                                        <tr className="bg-slate-50/70">

                                                            <td
                                                                colSpan="5"
                                                                className="px-5 py-4"
                                                            >

                                                                <div className="rounded-xl border border-slate-200 bg-white p-4">

                                                                    <div className="mb-3 flex items-center justify-between">

                                                                        <div>

                                                                            <p className="text-xs font-black uppercase tracking-wider text-slate-500">
                                                                                Seluruh Assignment
                                                                            </p>

                                                                            <p className="mt-0.5 text-xs text-slate-400">
                                                                                {user.name}
                                                                            </p>

                                                                        </div>


                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openCreateForUser(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-600 hover:bg-blue-100"
                                                                        >

                                                                            <Plus
                                                                                size={13}
                                                                            />

                                                                            Tambah

                                                                        </button>

                                                                    </div>


                                                                    <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">

                                                                        {assignments.map(
                                                                            (
                                                                                assignment
                                                                            ) => (

                                                                                <div
                                                                                    key={
                                                                                        assignment.id
                                                                                    }
                                                                                    className="rounded-xl border border-slate-100 bg-slate-50 p-3"
                                                                                >

                                                                                    <div className="flex items-start justify-between gap-3">

                                                                                        <AssignmentCard
                                                                                            assignment={
                                                                                                assignment
                                                                                            }
                                                                                        />


                                                                                        <div className="flex shrink-0 items-center gap-1">

                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    openEditModal(
                                                                                                        assignment,
                                                                                                        item
                                                                                                    )
                                                                                                }
                                                                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100"
                                                                                                title="Edit"
                                                                                            >

                                                                                                <Pencil
                                                                                                    size={13}
                                                                                                />

                                                                                            </button>


                                                                                            <button
                                                                                                type="button"
                                                                                                onClick={() =>
                                                                                                    handleDelete(
                                                                                                        assignment,
                                                                                                        item
                                                                                                    )
                                                                                                }
                                                                                                className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100"
                                                                                                title="Hapus"
                                                                                            >

                                                                                                <Trash2
                                                                                                    size={13}
                                                                                                />

                                                                                            </button>

                                                                                        </div>

                                                                                    </div>

                                                                                </div>

                                                                            )
                                                                        )}

                                                                    </div>

                                                                </div>

                                                            </td>

                                                        </tr>

                                                    )}

                                                </React.Fragment>
                                            );
                                        }
                                    )}

                            </tbody>

                        </table>

                    </div>


                    {/* =================================================
                        MOBILE
                    ================================================== */}

                    <div className="divide-y divide-slate-100 md:hidden">

                        {loading && (

                            <div className="flex items-center justify-center gap-2 p-8 text-sm text-slate-400">

                                <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                />

                                Memuat data...

                            </div>

                        )}


                        {!loading &&
                            usersWithAssignments.length === 0 && (

                                <div className="p-8 text-center text-sm font-semibold text-slate-400">
                                    Tidak ada data assignment.
                                </div>

                            )}


                        {!loading &&
                            usersWithAssignments.map((item) => {

                                const user =
                                    item?.user || {};

                                const primary =
                                    item?.primary || null;

                                const secondary =
                                    Array.isArray(
                                        item?.secondary
                                    )
                                        ? item.secondary
                                        : [];

                                const assignments =
                                    Array.isArray(
                                        item?.assignments
                                    )
                                        ? item.assignments
                                        : [];

                                const isExpanded =
                                    Boolean(
                                        expandedUsers[
                                            user.id
                                        ]
                                    );

                                const isActive =
                                    assignments.some(
                                        (assignment) =>
                                            Boolean(
                                                assignment?.is_active
                                            )
                                    );


                                return (
                                    <div
                                        key={user.id}
                                        className="space-y-4 p-5"
                                    >

                                        {/* USER */}

                                        <div className="flex items-start gap-3">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    toggleUser(
                                                        user.id
                                                    )
                                                }
                                                className="mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400"
                                            >

                                                {isExpanded ? (
                                                    <ChevronDown
                                                        size={15}
                                                    />
                                                ) : (
                                                    <ChevronRight
                                                        size={15}
                                                    />
                                                )}

                                            </button>


                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">

                                                <UserRound
                                                    size={17}
                                                />

                                            </div>


                                            <div className="min-w-0 flex-1">

                                                <p className="font-black text-slate-800">
                                                    {user.name || '-'}
                                                </p>

                                                <p className="truncate text-xs text-slate-400">
                                                    {user.email || '-'}
                                                </p>

                                            </div>


                                            {isActive ? (

                                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-black text-emerald-600">

                                                    <CheckCircle2
                                                        size={10}
                                                    />

                                                    AKTIF

                                                </span>

                                            ) : (

                                                <span className="flex shrink-0 items-center gap-1 rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600">

                                                    <Circle
                                                        size={10}
                                                    />

                                                    NONAKTIF

                                                </span>

                                            )}

                                        </div>


                                        {/* PRIMARY */}

                                        <div className="rounded-xl border border-amber-100 bg-amber-50/40 p-3">

                                            <div className="mb-2 flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-amber-600">

                                                <Star
                                                    size={13}
                                                    fill="currentColor"
                                                />

                                                Primary Assignment

                                            </div>


                                            {primary ? (

                                                <AssignmentCard
                                                    assignment={
                                                        primary
                                                    }
                                                />

                                            ) : (

                                                <p className="text-xs text-slate-400">
                                                    Belum ada primary assignment.
                                                </p>

                                            )}

                                        </div>


                                        {/* SECONDARY */}

                                        <div className="rounded-xl border border-slate-100 bg-slate-50 p-3">

                                            <div className="mb-2 flex items-center justify-between">

                                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-wide text-slate-400">

                                                    <Layers3
                                                        size={13}
                                                    />

                                                    Assignment Sampingan

                                                </div>


                                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-black text-slate-400">

                                                    {secondary.length}

                                                </span>

                                            </div>


                                            {secondary.length > 0 ? (

                                                <div className="space-y-2">

                                                    {secondary.map(
                                                        (
                                                            assignment
                                                        ) => (

                                                            <AssignmentCard
                                                                key={
                                                                    assignment.id
                                                                }
                                                                assignment={
                                                                    assignment
                                                                }
                                                                compact
                                                            />

                                                        )
                                                    )}

                                                </div>

                                            ) : (

                                                <p className="text-xs text-slate-400">
                                                    Tidak ada assignment sampingan.
                                                </p>

                                            )}

                                        </div>


                                        {/* ACTION */}

                                        <div className="flex gap-2 border-t border-slate-100 pt-3">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openCreateForUser(
                                                        item
                                                    )
                                                }
                                                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-50 text-sm font-bold text-emerald-600 transition-all hover:bg-emerald-100"
                                            >

                                                <Plus
                                                    size={15}
                                                />

                                                Tambah

                                            </button>


                                            <button
                                                type="button"
                                                onClick={() =>
                                                    primary
                                                        ? openEditModal(
                                                            primary,
                                                            item
                                                        )
                                                        : openCreateForUser(
                                                            item
                                                        )
                                                }
                                                className="flex h-9 flex-1 items-center justify-center gap-2 rounded-lg bg-blue-50 text-sm font-bold text-blue-600 transition-all hover:bg-blue-100"
                                            >

                                                <Pencil
                                                    size={15}
                                                />

                                                {primary
                                                    ? 'Edit Primary'
                                                    : 'Tambah Primary'}

                                            </button>

                                        </div>


                                        {/* MOBILE EXPANDED */}

                                        {isExpanded && (

                                            <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">

                                                <div className="mb-2 text-[10px] font-black uppercase tracking-wide text-slate-400">
                                                    Seluruh Assignment
                                                </div>


                                                {assignments.map(
                                                    (
                                                        assignment
                                                    ) => (

                                                        <div
                                                            key={
                                                                assignment.id
                                                            }
                                                            className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                                                        >

                                                            <div className="flex items-start justify-between gap-3">

                                                                <AssignmentCard
                                                                    assignment={
                                                                        assignment
                                                                    }
                                                                    compact
                                                                />


                                                                <div className="flex shrink-0 gap-1">

                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            openEditModal(
                                                                                assignment,
                                                                                item
                                                                            )
                                                                        }
                                                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600"
                                                                    >

                                                                        <Pencil
                                                                            size={13}
                                                                        />

                                                                    </button>


                                                                    <button
                                                                        type="button"
                                                                        onClick={() =>
                                                                            handleDelete(
                                                                                assignment,
                                                                                item
                                                                            )
                                                                        }
                                                                        className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600"
                                                                    >

                                                                        <Trash2
                                                                            size={13}
                                                                        />

                                                                    </button>

                                                                </div>

                                                            </div>

                                                        </div>

                                                    )
                                                )}

                                            </div>

                                        )}

                                    </div>
                                );
                            })}

                    </div>


                    {/* =================================================
                        PAGINATION
                    ================================================== */}

                    {!loading &&
                        usersWithAssignments.length > 0 &&
                        lastPage > 1 && (

                            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">

                                <p className="text-xs text-slate-400">

                                    Halaman{' '}

                                    <strong className="text-slate-700">
                                        {currentPage}
                                    </strong>{' '}

                                    dari{' '}

                                    <strong className="text-slate-700">
                                        {lastPage}
                                    </strong>

                                </p>


                                <div className="flex items-center gap-1">

                                    <button
                                        type="button"
                                        disabled={
                                            currentPage === 1
                                        }
                                        onClick={() =>
                                            goToPage(
                                                currentPage - 1
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Sebelumnya
                                    </button>


                                    <button
                                        type="button"
                                        disabled={
                                            currentPage === lastPage
                                        }
                                        onClick={() =>
                                            goToPage(
                                                currentPage + 1
                                            )
                                        }
                                        className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                    >
                                        Berikutnya
                                    </button>

                                </div>

                            </div>

                        )}

                </div>

            </div>


            {/* =====================================================
                MODAL
            ====================================================== */}

            {showModal && (

                <div
                    className="fixed inset-x-0 z-[70] flex items-center justify-center bg-transparent p-4"
                    style={{
                        top:
                            `${TOP_NAVBAR_HEIGHT}px`,

                        bottom:
                            `${BOTTOM_NAVBAR_HEIGHT}px`,
                    }}
                >

                    {/* BACKDROP */}

                    <div
                        className="absolute inset-0 bg-blue-900/50 backdrop-blur-sm"
                        onClick={closeModal}
                    />


                    {/* MODAL */}

                    <div
                        className="relative z-[71] flex max-h-full w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="assignment-modal-title"
                    >

                        {/* HEADER */}

                        <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-6 py-5">

                            <div className="min-w-0">

                                <h2
                                    id="assignment-modal-title"
                                    className="text-xl font-black text-slate-900"
                                >

                                    {modalMode === 'create'
                                        ? 'Tambah Assignment'
                                        : 'Edit Assignment'}

                                </h2>


                                <p className="mt-1 text-sm text-slate-500">

                                    {modalMode === 'create'
                                        ? 'Tambahkan assignment organisasi untuk user.'
                                        : 'Perbarui assignment organisasi user.'}

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <X size={19} />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="flex min-h-0 flex-1 flex-col"
                        >

                            <div className="min-h-0 flex-1 overflow-y-auto">

                                <div className="space-y-5 p-6 text-sm">

                                    {/* USER */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            User
                                        </label>


                                        <select
                                            name="user_id"
                                            value={
                                                form.user_id
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            disabled={
                                                saving ||
                                                loadingMaster ||
                                                (
                                                    modalMode ===
                                                    'edit'
                                                )
                                            }
                                            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                                                getFieldError(
                                                    'user_id'
                                                )
                                                    ? 'border-rose-300 bg-rose-50'
                                                    : 'border-slate-200 bg-slate-50'
                                            } focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100`}
                                        >

                                            <option value="">
                                                Pilih User
                                            </option>


                                            {users.map(
                                                (user) => (

                                                    <option
                                                        key={
                                                            user.id
                                                        }
                                                        value={
                                                            user.id
                                                        }
                                                    >

                                                        {user.name}

                                                        {user.email
                                                            ? ` — ${user.email}`
                                                            : ''}

                                                    </option>

                                                )
                                            )}

                                        </select>


                                        {modalMode === 'edit' && (

                                            <p className="mt-1.5 text-xs text-slate-400">
                                                User tidak dapat diubah saat mengedit assignment.
                                            </p>

                                        )}


                                        {getFieldError(
                                            'user_id'
                                        ) && (

                                            <p className="mt-1.5 text-xs text-rose-600">
                                                {getFieldError(
                                                    'user_id'
                                                )}
                                            </p>

                                        )}

                                    </div>


                                    {/* UNIT */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Organization Unit
                                        </label>


                                        <select
                                            name="organization_unit_id"
                                            value={
                                                form.organization_unit_id
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            disabled={
                                                saving ||
                                                loadingMaster
                                            }
                                            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                                                getFieldError(
                                                    'organization_unit_id'
                                                )
                                                    ? 'border-rose-300 bg-rose-50'
                                                    : 'border-slate-200 bg-slate-50'
                                            } focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100`}
                                        >

                                            <option value="">
                                                Pilih Organization Unit
                                            </option>


                                            {organizationUnits.map(
                                                (unit) => (

                                                    <option
                                                        key={
                                                            unit.id
                                                        }
                                                        value={
                                                            unit.id
                                                        }
                                                    >
                                                        {unit.name ||
                                                            unit.code}
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        {getFieldError(
                                            'organization_unit_id'
                                        ) && (

                                            <p className="mt-1.5 text-xs text-rose-600">
                                                {getFieldError(
                                                    'organization_unit_id'
                                                )}
                                            </p>

                                        )}

                                    </div>


                                    {/* LEVEL */}

                                    <div>

                                        <label className="mb-2 block text-sm font-bold text-slate-700">
                                            Organization Level
                                        </label>


                                        <select
                                            name="organization_level_id"
                                            value={
                                                form.organization_level_id
                                            }
                                            onChange={
                                                handleInputChange
                                            }
                                            disabled={
                                                saving ||
                                                loadingMaster
                                            }
                                            className={`w-full rounded-xl border px-3.5 py-2.5 text-sm outline-none transition-all ${
                                                getFieldError(
                                                    'organization_level_id'
                                                )
                                                    ? 'border-rose-300 bg-rose-50'
                                                    : 'border-slate-200 bg-slate-50'
                                            } focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100`}
                                        >

                                            <option value="">
                                                Pilih Organization Level
                                            </option>


                                            {organizationLevels.map(
                                                (level) => (

                                                    <option
                                                        key={
                                                            level.id
                                                        }
                                                        value={
                                                            level.id
                                                        }
                                                    >
                                                        {level.name ||
                                                            level.code}
                                                    </option>

                                                )
                                            )}

                                        </select>


                                        {getFieldError(
                                            'organization_level_id'
                                        ) && (

                                            <p className="mt-1.5 text-xs text-rose-600">
                                                {getFieldError(
                                                    'organization_level_id'
                                                )}
                                            </p>

                                        )}

                                    </div>


                                    {/* DATE */}

                                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                        <div>

                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Mulai
                                            </label>


                                            <input
                                                type="date"
                                                name="starts_at"
                                                value={
                                                    form.starts_at
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
                                            />

                                        </div>


                                        <div>

                                            <label className="mb-2 block text-sm font-bold text-slate-700">
                                                Selesai
                                            </label>


                                            <input
                                                type="date"
                                                name="ends_at"
                                                value={
                                                    form.ends_at
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                                className={`w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-700 outline-none transition-all ${
                                                    getFieldError(
                                                        'ends_at'
                                                    )
                                                        ? 'border-rose-300 bg-rose-50'
                                                        : 'border-slate-200 bg-slate-50'
                                                } focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100`}
                                            />


                                            {getFieldError(
                                                'ends_at'
                                            ) && (

                                                <p className="mt-1.5 text-xs text-rose-600">
                                                    {getFieldError(
                                                        'ends_at'
                                                    )}
                                                </p>

                                            )}

                                        </div>

                                    </div>


                                    {/* OPTIONS */}

                                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-500">

                                                    <Star
                                                        size={16}
                                                    />

                                                </div>


                                                <div>

                                                    <p className="text-sm font-bold text-slate-700">
                                                        Primary Assignment
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Jadikan assignment utama
                                                    </p>

                                                </div>

                                            </div>


                                            <input
                                                type="checkbox"
                                                name="is_primary"
                                                checked={
                                                    form.is_primary
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />

                                        </label>


                                        <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:bg-white">

                                            <div className="flex items-center gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">

                                                    <CheckCircle2
                                                        size={16}
                                                    />

                                                </div>


                                                <div>

                                                    <p className="text-sm font-bold text-slate-700">
                                                        Status Aktif
                                                    </p>

                                                    <p className="text-xs text-slate-400">
                                                        Assignment dapat digunakan
                                                    </p>

                                                </div>

                                            </div>


                                            <input
                                                type="checkbox"
                                                name="is_active"
                                                checked={
                                                    form.is_active
                                                }
                                                onChange={
                                                    handleInputChange
                                                }
                                                disabled={
                                                    saving
                                                }
                                                className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                            />

                                        </label>

                                    </div>


                                    {/* PREVIEW */}

                                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">

                                        <div className="mb-3 flex items-center gap-2 text-xs font-bold text-slate-700">

                                            <Layers3
                                                size={15}
                                                className="text-blue-600"
                                            />

                                            Preview Assignment

                                        </div>


                                        <div className="rounded-lg border border-slate-200 bg-white p-4">

                                            <div className="flex items-start gap-3">

                                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">

                                                    <UserRound
                                                        size={16}
                                                    />

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="font-bold text-slate-800">

                                                        {selectedUser?.name ||
                                                            getSelectedUserName(
                                                                users,
                                                                form.user_id
                                                            ) ||
                                                            'User belum dipilih'}

                                                    </p>


                                                    <p className="mt-1 text-xs text-slate-500">

                                                        {getSelectedUnitName(
                                                            organizationUnits,
                                                            form.organization_unit_id
                                                        ) ||
                                                            'Organization Unit belum dipilih'}

                                                    </p>


                                                    <p className="text-xs text-slate-400">

                                                        {getSelectedLevelName(
                                                            organizationLevels,
                                                            form.organization_level_id
                                                        ) ||
                                                            'Organization Level belum dipilih'}

                                                    </p>

                                                </div>

                                            </div>


                                            <div className="mt-3 flex flex-wrap gap-2">

                                                {form.is_primary && (

                                                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-black text-amber-600">

                                                        <Star
                                                            size={10}
                                                            fill="currentColor"
                                                        />

                                                        PRIMARY

                                                    </span>

                                                )}


                                                {!form.is_primary && (

                                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-black text-slate-500">
                                                        SECONDARY
                                                    </span>

                                                )}


                                                <span
                                                    className={
                                                        form.is_active
                                                            ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-black text-emerald-600'
                                                            : 'rounded-full bg-rose-50 px-2.5 py-1 text-[10px] font-black text-rose-600'
                                                    }
                                                >

                                                    {form.is_active
                                                        ? 'AKTIF'
                                                        : 'NONAKTIF'}

                                                </span>

                                            </div>

                                        </div>

                                    </div>

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="flex shrink-0 justify-end gap-2 border-t border-slate-100 bg-white px-6 py-5">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    Batal
                                </button>


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

                                            {modalMode === 'create'
                                                ? 'Simpan Assignment'
                                                : 'Simpan Perubahan'}

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </>
    );
}


// =====================================================
// SUMMARY CARD
// =====================================================

function SummaryCard({
    icon: Icon,
    label,
    value,
    iconClass,
}) {

    return (

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">

            <div className="flex items-center gap-3">

                <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
                >
                    <Icon size={18} />
                </div>


                <div>

                    <p className="text-xs font-semibold text-slate-400">
                        {label}
                    </p>

                    <p className="text-xl font-black tracking-tight text-slate-800">
                        {value}
                    </p>

                </div>

            </div>

        </div>
    );
}


// =====================================================
// ALERT
// =====================================================

function Alert({
    type,
    message,
    onClose,
}) {

    const isSuccess =
        type === 'success';


    return (

        <div
            className={
                isSuccess
                    ? 'flex items-center justify-between gap-3 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700'
                    : 'flex items-center justify-between gap-3 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600'
            }
        >

            <span>
                {message}
            </span>


            <button
                type="button"
                onClick={onClose}
                className={
                    isSuccess
                        ? 'rounded-lg p-1 transition hover:bg-emerald-100'
                        : 'rounded-lg p-1 transition hover:bg-rose-100'
                }
            >

                <X size={15} />

            </button>

        </div>
    );
}


// =====================================================
// ASSIGNMENT CARD
// =====================================================

function AssignmentCard({
    assignment,
    primary = false,
    compact = false,
}) {

    if (!assignment) {
        return null;
    }


    const unit =
        assignment?.organization_unit;

    const level =
        assignment?.organization_level;


    return (

        <div className="min-w-0">

            <div className="flex items-start gap-2">

                <Building2
                    size={compact ? 14 : 15}
                    className="mt-0.5 shrink-0 text-slate-400"
                />


                <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-1.5">

                        <p
                            className={
                                compact
                                    ? 'font-semibold text-slate-700'
                                    : 'font-bold text-slate-700'
                            }
                        >
                            {unit?.name ||
                                unit?.code ||
                                '-'}
                        </p>


                        {primary && (

                            <span className="flex items-center gap-1 rounded-full bg-amber-50 px-1.5 py-0.5 text-[9px] font-black text-amber-600">

                                <Star
                                    size={9}
                                    fill="currentColor"
                                />

                                PRIMARY

                            </span>

                        )}

                    </div>


                    <p className="font-mono text-[10px] text-slate-400">
                        {unit?.code || '-'}
                    </p>


                    <div className="mt-1 flex items-center gap-1.5">

                        <Layers3
                            size={11}
                            className="text-slate-400"
                        />

                        <span className="text-xs text-slate-500">
                            {level?.name ||
                                level?.code ||
                                '-'}
                        </span>

                    </div>


                    <div className="mt-1.5 flex flex-wrap items-center gap-2">

                        {Boolean(
                            assignment?.is_active
                        ) ? (

                            <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-black text-emerald-600">

                                <CheckCircle2
                                    size={9}
                                />

                                AKTIF

                            </span>

                        ) : (

                            <span className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-[9px] font-black text-rose-600">

                                <Circle
                                    size={9}
                                />

                                NONAKTIF

                            </span>

                        )}


                        <span className="flex items-center gap-1 text-[10px] text-slate-400">

                            <CalendarDays
                                size={10}
                            />

                            {formatDisplayDate(
                                assignment?.starts_at
                            )}

                            {' — '}

                            {formatDisplayDate(
                                assignment?.ends_at
                            )}

                        </span>

                    </div>

                </div>

            </div>

        </div>
    );
}


// =====================================================
// HELPERS
// =====================================================

function formatDateForInput(value) {

    if (!value) {
        return '';
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return '';
    }


    const year =
        date.getFullYear();


    const month =
        String(
            date.getMonth() + 1
        ).padStart(2, '0');


    const day =
        String(
            date.getDate()
        ).padStart(2, '0');


    return `${year}-${month}-${day}`;
}


function formatDisplayDate(value) {

    if (!value) {
        return 'Tidak ditentukan';
    }


    const date =
        new Date(value);


    if (
        Number.isNaN(
            date.getTime()
        )
    ) {
        return 'Tidak ditentukan';
    }


    return date.toLocaleDateString(
        'id-ID',
        {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        }
    );
}


function getSelectedUserName(
    users,
    id
) {

    if (!id) {
        return '';
    }


    const user =
        users.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    return user?.name || '';
}


function getSelectedUnitName(
    units,
    id
) {

    if (!id) {
        return '';
    }


    const unit =
        units.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    return (
        unit?.name ||
        unit?.code ||
        ''
    );
}


function getSelectedLevelName(
    levels,
    id
) {

    if (!id) {
        return '';
    }


    const level =
        levels.find(
            (item) =>
                String(item.id) ===
                String(id)
        );


    return (
        level?.name ||
        level?.code ||
        ''
    );
}