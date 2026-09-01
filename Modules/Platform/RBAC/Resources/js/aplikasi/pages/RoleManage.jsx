import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ShieldCheck,
    Users,
    RefreshCw,
    Loader2,
    AlertCircle,
    Plus,
    Pencil,
    Trash2,
    X,
    Search,
} from "lucide-react";

import roleService from "@Modules/Platform/RBAC/Resources/js/aplikasi/services/roleService";


/*
|--------------------------------------------------------------------------
| NORMALIZE API RESPONSE
|--------------------------------------------------------------------------
*/

const extractData = (response) => {

    if (response?.success === false) {
        throw new Error(
            response.message ||
                "Request gagal."
        );
    }

    if (response?.data !== undefined) {
        return response.data;
    }

    return response || [];
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function RoleManagement() {

    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    const [roles, setRoles] = useState([]);


    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState("");


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    const [loading, setLoading] =
        useState(true);

    const [roleSaving, setRoleSaving] =
        useState(false);

    const [deletingRoleId, setDeletingRoleId] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | MESSAGE
    |--------------------------------------------------------------------------
    */

    const [error, setError] =
        useState("");

    const [success, setSuccess] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | ROLE MODAL
    |--------------------------------------------------------------------------
    */

    const [roleModalOpen, setRoleModalOpen] =
        useState(false);

    const [roleModalMode, setRoleModalMode] =
        useState("create");

    const [roleFormName, setRoleFormName] =
        useState("");

    const [editingRoleId, setEditingRoleId] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | LOAD ROLES
    |--------------------------------------------------------------------------
    */

    const loadRoles = async () => {

        try {

            setLoading(true);
            setError("");
            setSuccess("");

            const response =
                await roleService.getRoles();

            const loadedRoles =
                extractData(response);

            setRoles(
                Array.isArray(loadedRoles)
                    ? loadedRoles
                    : []
            );

        } catch (err) {

            console.error(
                "Role Management Load Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Gagal mengambil data Role."
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadRoles();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | FILTERED ROLES
    |--------------------------------------------------------------------------
    */

    const filteredRoles = useMemo(() => {

        const keyword =
            search
                .trim()
                .toLowerCase();

        if (!keyword) {
            return roles;
        }

        return roles.filter(
            (role) =>
                role?.name
                    ?.toLowerCase()
                    .includes(keyword)
        );

    }, [
        roles,
        search,
    ]);


    /*
    |--------------------------------------------------------------------------
    | OPEN CREATE MODAL
    |--------------------------------------------------------------------------
    */

    const openCreateRole = () => {

        setRoleModalMode("create");
        setRoleFormName("");
        setEditingRoleId(null);

        setError("");
        setSuccess("");

        setRoleModalOpen(true);
    };


    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT MODAL
    |--------------------------------------------------------------------------
    */

    const openEditRole = (role) => {

        if (
            role?.name ===
            "Super Admin"
        ) {
            return;
        }

        setRoleModalMode("edit");

        setRoleFormName(
            role?.name || ""
        );

        setEditingRoleId(
            role?.id ?? null
        );

        setError("");
        setSuccess("");

        setRoleModalOpen(true);
    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE ROLE MODAL
    |--------------------------------------------------------------------------
    */

    const closeRoleModal = () => {

        if (roleSaving) {
            return;
        }

        setRoleModalOpen(false);
        setRoleFormName("");
        setEditingRoleId(null);
    };


    /*
    |--------------------------------------------------------------------------
    | CREATE / UPDATE ROLE
    |--------------------------------------------------------------------------
    */

    const handleRoleSubmit = async (
        event
    ) => {

        event.preventDefault();

        const name =
            roleFormName.trim();

        if (!name) {

            setError(
                "Nama Role wajib diisi."
            );

            return;
        }

        try {

            setRoleSaving(true);
            setError("");
            setSuccess("");


            /*
            |--------------------------------------------------------------------------
            | CREATE
            |--------------------------------------------------------------------------
            */

            if (
                roleModalMode ===
                "create"
            ) {

                const response =
                    await roleService.createRole({
                        name,
                    });

                const newRole =
                    extractData(response);

                setRoles(
                    (currentRoles) => [
                        ...currentRoles,
                        newRole,
                    ]
                );

                setSuccess(
                    `Role "${newRole.name}" berhasil dibuat.`
                );

            }


            /*
            |--------------------------------------------------------------------------
            | UPDATE
            |--------------------------------------------------------------------------
            */

            else {

                if (!editingRoleId) {

                    throw new Error(
                        "Role yang akan diubah tidak ditemukan."
                    );
                }

                const response =
                    await roleService.updateRole(
                        editingRoleId,
                        {
                            name,
                        }
                    );

                const updatedRole =
                    extractData(response);

                setRoles(
                    (currentRoles) =>
                        currentRoles.map(
                            (role) =>
                                String(role.id) ===
                                String(
                                    updatedRole.id
                                )
                                    ? updatedRole
                                    : role
                        )
                );

                setSuccess(
                    `Role "${updatedRole.name}" berhasil diperbarui.`
                );
            }


            /*
            |--------------------------------------------------------------------------
            | CLOSE
            |--------------------------------------------------------------------------
            */

            setRoleModalOpen(false);
            setRoleFormName("");
            setEditingRoleId(null);

        } catch (err) {

            console.error(
                "Role CRUD Error:",
                err
            );

            const validationErrors =
                err?.response?.data
                    ?.errors;

            if (
                validationErrors
            ) {

                setError(
                    Object.values(
                        validationErrors
                    )
                        .flat()
                        .join(" ")
                );

            } else {

                setError(
                    err?.response?.data
                        ?.message ||
                    err?.message ||
                    "Gagal menyimpan Role."
                );
            }

        } finally {

            setRoleSaving(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | DELETE ROLE
    |--------------------------------------------------------------------------
    */

    const handleDeleteRole =
        async (role) => {

            if (
                role?.name ===
                "Super Admin"
            ) {
                return;
            }

            const confirmed =
                window.confirm(
                    `Hapus role "${role.name}"?\n\nRole yang dihapus tidak dapat dikembalikan.`
                );

            if (!confirmed) {
                return;
            }

            try {

                setDeletingRoleId(
                    role.id
                );

                setError("");
                setSuccess("");

                await roleService.deleteRole(
                    role.id
                );

                setRoles(
                    (currentRoles) =>
                        currentRoles.filter(
                            (item) =>
                                String(
                                    item.id
                                ) !==
                                String(
                                    role.id
                                )
                        )
                );

                setSuccess(
                    `Role "${role.name}" berhasil dihapus.`
                );

            } catch (err) {

                console.error(
                    "Delete Role Error:",
                    err
                );

                setError(
                    err?.response?.data
                        ?.message ||
                    err?.message ||
                    "Gagal menghapus Role."
                );

            } finally {

                setDeletingRoleId(
                    null
                );

            }
        };


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (
            <div className="w-full">

                <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />

                    <div className="flex items-center justify-center p-10">

                        <div className="flex items-center gap-3 text-slate-500">

                            <Loader2
                                className="h-5 w-5 animate-spin"
                            />

                            <span className="text-sm font-medium">
                                Memuat Role...
                            </span>

                        </div>

                    </div>

                </div>

            </div>
        );
    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="w-full space-y-5">


            {/* =========================================================
                HEADER CARD
            ========================================================== */}

            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                {/* Gradient Accent */}

                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />


                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">


                    {/* Header Information */}

                    <div className="flex items-center gap-4">

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md">

                            <ShieldCheck size={24} />

                        </div>


                        <div>

                            <h1 className="text-xl font-black tracking-tight text-slate-900">

                                Role Management

                            </h1>

                            <p className="text-sm text-slate-500">

                                Kelola Role yang tersedia dalam sistem.

                            </p>

                        </div>

                    </div>


                    {/* Header Actions */}

                    <div className="flex items-center gap-2 self-end sm:self-auto">


                        {/* Refresh */}

                        <button
                            type="button"
                            onClick={loadRoles}
                            disabled={
                                loading ||
                                roleSaving
                            }
                            title="Refresh Data"
                            className="
                                flex h-11 w-11
                                items-center justify-center
                                rounded-xl
                                border border-slate-200
                                bg-white
                                text-slate-600
                                shadow-sm
                                transition-all
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <RefreshCw
                                size={18}
                                className={
                                    loading
                                        ? "animate-spin"
                                        : ""
                                }
                            />

                        </button>


                        {/* Add */}

                        <button
                            type="button"
                            onClick={
                                openCreateRole
                            }
                            disabled={
                                roleSaving ||
                                deletingRoleId !==
                                    null
                            }
                            className="
                                flex items-center gap-2
                                rounded-xl
                                bg-blue-900
                                px-4 py-2.5
                                text-sm font-bold
                                text-white
                                shadow-sm
                                transition-all
                                hover:bg-slate-800
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            "
                        >

                            <Plus size={18} />

                            <span>
                                Tambah Role
                            </span>

                        </button>

                    </div>

                </div>

            </div>


            {/* =========================================================
                ERROR
            ========================================================== */}

            {error && (

                <div
                    className="
                        flex items-start gap-3
                        rounded-xl
                        border border-rose-200
                        bg-rose-50
                        px-4 py-3
                        text-sm text-rose-700
                    "
                >

                    <AlertCircle
                        className="mt-0.5 h-4 w-4 shrink-0"
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        className="
                            ml-auto
                            text-rose-400
                            hover:text-rose-600
                        "
                    >

                        <X className="h-4 w-4" />

                    </button>

                </div>

            )}


            {/* =========================================================
                SUCCESS
            ========================================================== */}

            {success && (

                <div
                    className="
                        flex items-center gap-3
                        rounded-xl
                        border border-emerald-200
                        bg-emerald-50
                        px-4 py-3
                        text-sm
                        font-medium
                        text-emerald-700
                    "
                >

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                        className="
                            ml-auto
                            text-emerald-400
                            hover:text-emerald-600
                        "
                    >

                        <X className="h-4 w-4" />

                    </button>

                </div>

            )}


            {/* =========================================================
                ROLE CARD
            ========================================================== */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">


                {/* =====================================================
                    ROLE CARD HEADER
                ====================================================== */}

                <div className="border-b border-slate-100 px-5 py-4">

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">


                        {/* Title */}

                        <div>

                            <h2 className="text-base font-black text-slate-800">

                                Daftar Role

                            </h2>

                            <p className="mt-1 text-xs text-slate-400">

                                Role merupakan master identitas akses pengguna.

                            </p>

                        </div>


                        {/* Search + Counter */}

                        <div className="flex items-center gap-3">


                            {/* Search */}

                            <div className="relative">

                                <Search
                                    className="
                                        absolute
                                        left-3
                                        top-1/2
                                        h-4 w-4
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Cari Role..."
                                    className="
                                        h-10
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        pl-9
                                        pr-3
                                        text-sm
                                        text-slate-700
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                        sm:w-64
                                    "
                                />

                            </div>


                            {/* Counter */}

                            <div
                                className="
                                    hidden
                                    whitespace-nowrap
                                    rounded-xl
                                    bg-slate-100
                                    px-3
                                    py-2.5
                                    text-xs
                                    font-bold
                                    text-slate-500
                                    sm:block
                                "
                            >

                                {filteredRoles.length} Role

                            </div>

                        </div>

                    </div>

                </div>


                {/* =====================================================
                    ROLE LIST
                ====================================================== */}

                <div className="p-4">


                    {filteredRoles.length === 0 ? (

                        <div className="py-14 text-center">

                            <div
                                className="
                                    mx-auto
                                    flex h-12 w-12
                                    items-center justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-400
                                "
                            >

                                {search ? (
                                    <Search
                                        className="h-5 w-5"
                                    />
                                ) : (
                                    <Users
                                        className="h-5 w-5"
                                    />
                                )}

                            </div>


                            <p className="mt-4 text-sm font-bold text-slate-500">

                                {search
                                    ? "Role tidak ditemukan."
                                    : "Belum ada Role."
                                }

                            </p>


                            <p className="mt-1 text-xs text-slate-400">

                                {search
                                    ? "Coba gunakan kata pencarian lain."
                                    : "Silakan buat Role baru."
                                }

                            </p>

                        </div>

                    ) : (

                        <div className="overflow-x-auto">

                            <table className="w-full min-w-[650px]">

                                <thead>

                                    <tr className="border-b border-slate-200">

                                        <th
                                            className="
                                                px-4 py-3
                                                text-left
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            "
                                        >
                                            Role
                                        </th>


                                        <th
                                            className="
                                                px-4 py-3
                                                text-left
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            "
                                        >
                                            Guard
                                        </th>


                                        <th
                                            className="
                                                px-4 py-3
                                                text-left
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            "
                                        >
                                            Dibuat
                                        </th>


                                        <th
                                            className="
                                                px-4 py-3
                                                text-right
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            "
                                        >
                                            Aksi
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {filteredRoles.map(
                                        (role) => {

                                            const isProtected =
                                                role.name ===
                                                "Super Admin";

                                            const isDeleting =
                                                String(
                                                    deletingRoleId
                                                ) ===
                                                String(
                                                    role.id
                                                );

                                            return (

                                                <tr
                                                    key={
                                                        role.id
                                                    }
                                                    className="
                                                        border-b
                                                        border-slate-100
                                                        last:border-b-0
                                                        transition
                                                        hover:bg-slate-50
                                                    "
                                                >


                                                    {/* ROLE */}

                                                    <td className="px-4 py-4">

                                                        <div className="flex items-center gap-3">

                                                            <div
                                                                className={`
                                                                    flex
                                                                    h-10 w-10
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-xl
                                                                    ${
                                                                        isProtected
                                                                            ? "bg-rose-50 text-rose-600"
                                                                            : "bg-blue-50 text-blue-700"
                                                                    }
                                                                `}
                                                            >

                                                                {isProtected ? (
                                                                    <ShieldCheck
                                                                        className="h-4 w-4"
                                                                    />
                                                                ) : (
                                                                    <Users
                                                                        className="h-4 w-4"
                                                                    />
                                                                )}

                                                            </div>


                                                            <div className="min-w-0">

                                                                <div className="flex items-center gap-2">

                                                                    <span className="text-sm font-bold text-slate-700">

                                                                        {
                                                                            role.name
                                                                        }

                                                                    </span>


                                                                    {isProtected && (

                                                                        <span
                                                                            className="
                                                                                rounded-full
                                                                                bg-rose-100
                                                                                px-2
                                                                                py-0.5
                                                                                text-[9px]
                                                                                font-black
                                                                                text-rose-600
                                                                            "
                                                                        >
                                                                            PROTECTED
                                                                        </span>

                                                                    )}

                                                                </div>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* GUARD */}

                                                    <td className="px-4 py-4">

                                                        <span
                                                            className="
                                                                inline-flex
                                                                rounded-lg
                                                                bg-slate-100
                                                                px-2.5
                                                                py-1
                                                                text-xs
                                                                font-bold
                                                                text-slate-500
                                                            "
                                                        >

                                                            {
                                                                role.guard_name ||
                                                                "web"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* CREATED */}

                                                    <td className="px-4 py-4">

                                                        <span className="text-xs text-slate-400">

                                                            {role.created_at
                                                                ? new Date(
                                                                    role.created_at
                                                                ).toLocaleDateString(
                                                                    "id-ID",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )
                                                                : "-"
                                                            }

                                                        </span>

                                                    </td>


                                                    {/* ACTION */}

                                                    <td className="px-4 py-4">

                                                        <div className="flex items-center justify-end gap-1">


                                                            {/* EDIT */}

                                                            <button
                                                                type="button"
                                                                title="Edit Role"
                                                                onClick={() =>
                                                                    openEditRole(
                                                                        role
                                                                    )
                                                                }
                                                                disabled={
                                                                    isProtected ||
                                                                    roleSaving ||
                                                                    deletingRoleId !==
                                                                        null
                                                                }
                                                                className="
                                                                    flex
                                                                    h-9 w-9
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    text-slate-400
                                                                    transition
                                                                    hover:bg-blue-50
                                                                    hover:text-blue-600
                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-30
                                                                "
                                                            >

                                                                <Pencil className="h-4 w-4" />

                                                            </button>


                                                            {/* DELETE */}

                                                            <button
                                                                type="button"
                                                                title="Hapus Role"
                                                                onClick={() =>
                                                                    handleDeleteRole(
                                                                        role
                                                                    )
                                                                }
                                                                disabled={
                                                                    isProtected ||
                                                                    isDeleting ||
                                                                    roleSaving
                                                                }
                                                                className="
                                                                    flex
                                                                    h-9 w-9
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    text-slate-400
                                                                    transition
                                                                    hover:bg-rose-50
                                                                    hover:text-rose-600
                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-30
                                                                "
                                                            >

                                                                {isDeleting ? (
                                                                    <Loader2
                                                                        className="
                                                                            h-4 w-4
                                                                            animate-spin
                                                                        "
                                                                    />
                                                                ) : (
                                                                    <Trash2 className="h-4 w-4" />
                                                                )}

                                                            </button>

                                                        </div>

                                                    </td>

                                                </tr>

                                            );

                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>

                    )}

                </div>

            </div>


            {/* =========================================================
                ROLE MODAL
            ========================================================== */}

            {roleModalOpen && (

                <div
                    className="
                        fixed inset-0 z-50
                        flex items-center justify-center
                        bg-slate-900/40
                        p-4
                        backdrop-blur-sm
                    "
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeRoleModal();
                        }

                    }}
                >

                    <form
                        onSubmit={
                            handleRoleSubmit
                        }
                        className="
                            w-full max-w-md
                            overflow-hidden
                            rounded-2xl
                            border border-slate-200
                            bg-white
                            shadow-2xl
                        "
                    >


                        {/* Modal Header */}

                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">

                            <div>

                                <h2 className="text-base font-black text-slate-800">

                                    {roleModalMode ===
                                    "create"
                                        ? "Tambah Role"
                                        : "Edit Role"}

                                </h2>

                                <p className="mt-1 text-xs text-slate-400">

                                    {roleModalMode ===
                                    "create"
                                        ? "Buat Role baru untuk sistem."
                                        : "Ubah nama Role yang dipilih."
                                    }

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeRoleModal
                                }
                                disabled={
                                    roleSaving
                                }
                                className="
                                    flex h-8 w-8
                                    items-center justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                    disabled:opacity-40
                                "
                            >

                                <X className="h-4 w-4" />

                            </button>

                        </div>


                        {/* Form */}

                        <div className="p-5">

                            <label
                                htmlFor="role-name"
                                className="
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                "
                            >

                                Nama Role

                            </label>


                            <input
                                id="role-name"
                                type="text"
                                value={
                                    roleFormName
                                }
                                onChange={(
                                    event
                                ) =>
                                    setRoleFormName(
                                        event.target.value
                                    )
                                }
                                autoFocus
                                maxLength={255}
                                placeholder="Contoh: Administrator"
                                disabled={
                                    roleSaving
                                }
                                className="
                                    mt-2
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3 py-2.5
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                    disabled:bg-slate-50
                                "
                            />


                            <p className="mt-2 text-xs text-slate-400">

                                Role hanya merupakan master
                                identitas akses pengguna.

                            </p>

                        </div>


                        {/* Modal Footer */}

                        <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">

                            <button
                                type="button"
                                onClick={
                                    closeRoleModal
                                }
                                disabled={
                                    roleSaving
                                }
                                className="
                                    rounded-xl
                                    border border-slate-200
                                    bg-white
                                    px-4 py-2.5
                                    text-sm
                                    font-bold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                "
                            >

                                Batal

                            </button>


                            <button
                                type="submit"
                                disabled={
                                    roleSaving ||
                                    !roleFormName.trim()
                                }
                                className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-blue-900
                                    px-4 py-2.5
                                    text-sm
                                    font-black
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-slate-800
                                    disabled:cursor-not-allowed
                                    disabled:bg-slate-300
                                "
                            >

                                {roleSaving && (

                                    <Loader2
                                        className="
                                            h-4 w-4
                                            animate-spin
                                        "
                                    />

                                )}

                                {roleSaving
                                    ? "Menyimpan..."
                                    : roleModalMode ===
                                      "create"
                                    ? "Buat Role"
                                    : "Simpan Perubahan"
                                }

                            </button>

                        </div>

                    </form>

                </div>

            )}

        </div>
    );
}