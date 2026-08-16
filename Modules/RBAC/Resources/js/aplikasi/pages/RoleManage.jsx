import React, { useEffect, useMemo, useState } from "react";
import {
    ShieldCheck,
    Users,
    UserRound,
    Settings,
    Save,
    RefreshCw,
    Check,
    Lock,
    ChevronRight,
    Loader2,
    AlertCircle,
    Plus,
    Pencil,
    Trash2,
    X,
    Trash,
} from "lucide-react";

import api from "@Modules/System/Resources/js/aplikasi/axios/axios";


/*
|--------------------------------------------------------------------------
| Helper
|--------------------------------------------------------------------------
*/

const moduleLabels = {
    dashboard: "Dashboard",
    system: "System",
    users: "Users",
    employees: "Employees",
    payroll: "Payroll",
};

const moduleIcons = {
    dashboard: ShieldCheck,
    system: Settings,
    users: Users,
    employees: UserRound,
    payroll: ShieldCheck,
};


const getModuleName = (permissionName) => {
    if (!permissionName) {
        return "other";
    }

    return permissionName.split(".")[0];
};


const getModuleLabel = (moduleName) => {
    return (
        moduleLabels[moduleName] ||
        moduleName.charAt(0).toUpperCase() + moduleName.slice(1)
    );
};


const getModuleIcon = (moduleName) => {
    return moduleIcons[moduleName] || ShieldCheck;
};


/*
|--------------------------------------------------------------------------
| Component
|--------------------------------------------------------------------------
*/

export default function RoleManagement() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [selectedRoleId, setSelectedRoleId] = useState(null);

    const [selectedPermissions, setSelectedPermissions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [dirty, setDirty] = useState(false);

    /*
    |--------------------------------------------------------------------------
    | Role CRUD
    |--------------------------------------------------------------------------
    */

    const [roleModalOpen, setRoleModalOpen] = useState(false);
    const [roleModalMode, setRoleModalMode] = useState("create");
    const [roleFormName, setRoleFormName] = useState("");
    const [roleSaving, setRoleSaving] = useState(false);
    const [deletingRoleId, setDeletingRoleId] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | Load Matrix
    |--------------------------------------------------------------------------
    */

    const loadMatrix = async (keepSelectedRole = true) => {
        try {
            setLoading(true);
            setError("");
            setSuccess("");

            const response = await api.get("/matrix/permissions");

            const result = response.data;

            if (!result.success) {
                throw new Error(
                    result.message || "Gagal mengambil data Role & Permission."
                );
            }

            const loadedRoles = result.data?.roles || [];
            const loadedPermissions = result.data?.permissions || [];

            setRoles(loadedRoles);
            setPermissions(loadedPermissions);


            /*
            |--------------------------------------------------------------------------
            | Tentukan Role Aktif
            |--------------------------------------------------------------------------
            */

            let activeRoleId = selectedRoleId;

            if (
                !keepSelectedRole ||
                !activeRoleId ||
                !loadedRoles.some(
                    (role) => Number(role.id) === Number(activeRoleId)
                )
            ) {
                activeRoleId = loadedRoles[0]?.id ?? null;
            }

            setSelectedRoleId(activeRoleId);


            /*
            |--------------------------------------------------------------------------
            | Permission Role Aktif
            |--------------------------------------------------------------------------
            */

            const activeRole = loadedRoles.find(
                (role) => Number(role.id) === Number(activeRoleId)
            );

            const rolePermissions =
                activeRole?.permissions?.map(
                    (permission) => permission.name
                ) || [];

            setSelectedPermissions(rolePermissions);

            setDirty(false);
        } catch (err) {
            console.error("RBAC Matrix Error:", err);

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Gagal mengambil data Role & Permission."
            );
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        loadMatrix(false);
    }, []);


    /*
    |--------------------------------------------------------------------------
    | Role Aktif
    |--------------------------------------------------------------------------
    */

    const selectedRole = useMemo(() => {
        return roles.find(
            (role) => Number(role.id) === Number(selectedRoleId)
        );
    }, [roles, selectedRoleId]);


    /*
    |--------------------------------------------------------------------------
    | Permission Grouping
    |--------------------------------------------------------------------------
    */

    const groupedPermissions = useMemo(() => {
        const groups = {};

        permissions.forEach((permission) => {
            const moduleName = getModuleName(permission.name);

            if (!groups[moduleName]) {
                groups[moduleName] = [];
            }

            groups[moduleName].push(permission);
        });

        return groups;
    }, [permissions]);


    /*
    |--------------------------------------------------------------------------
    | Role Permission Count
    |--------------------------------------------------------------------------
    */

    const permissionCount = selectedPermissions.length;

    const totalPermissionCount = permissions.length;


    /*
    |--------------------------------------------------------------------------
    | Role Selection
    |--------------------------------------------------------------------------
    */

    const handleSelectRole = (role) => {
        if (dirty) {
            const confirmChange = window.confirm(
                "Ada perubahan permission yang belum disimpan.\n\nLanjut pindah Role?"
            );

            if (!confirmChange) {
                return;
            }
        }

        setSelectedRoleId(role.id);

        const rolePermissions =
            role.permissions?.map(
                (permission) => permission.name
            ) || [];

        setSelectedPermissions(rolePermissions);

        setDirty(false);
        setSuccess("");
        setError("");
    };


    /*
    |--------------------------------------------------------------------------
    | Role CRUD
    |--------------------------------------------------------------------------
    */

    const openCreateRole = () => {
        setRoleModalMode("create");
        setRoleFormName("");
        setRoleModalOpen(true);
        setError("");
        setSuccess("");
    };

    const openEditRole = (role) => {
        if (role.name === "Super Admin") {
            return;
        }

        setRoleModalMode("edit");
        setRoleFormName(role.name || "");
        setSelectedRoleId(role.id);
        setRoleModalOpen(true);
        setError("");
        setSuccess("");
    };

    const closeRoleModal = () => {
        if (roleSaving) {
            return;
        }

        setRoleModalOpen(false);
        setRoleFormName("");
    };

    const handleRoleSubmit = async (event) => {
        event.preventDefault();

        const name = roleFormName.trim();

        if (!name) {
            setError("Nama Role wajib diisi.");
            return;
        }

        try {
            setRoleSaving(true);
            setError("");
            setSuccess("");

            if (roleModalMode === "create") {
                const response = await api.post("/roles", {
                    name,
                    permissions: [],
                });

                const result = response.data;

                if (!result.success) {
                    throw new Error(
                        result.message || "Gagal membuat Role."
                    );
                }

                const newRole = result.data;

                setRoles((currentRoles) => [
                    ...currentRoles,
                    newRole,
                ]);

                setSelectedRoleId(newRole.id);
                setSelectedPermissions([]);
                setDirty(false);

                setSuccess(`Role "${newRole.name}" berhasil dibuat.`);
            } else {
                const role = roles.find(
                    (item) =>
                        Number(item.id) === Number(selectedRoleId)
                );

                if (!role) {
                    throw new Error("Role yang akan diubah tidak ditemukan.");
                }

                const response = await api.put(`/roles/${role.id}`, {
                    name,
                    permissions: selectedPermissions,
                });

                const result = response.data;

                if (!result.success) {
                    throw new Error(
                        result.message || "Gagal memperbarui Role."
                    );
                }

                const updatedRole = result.data;

                setRoles((currentRoles) =>
                    currentRoles.map((item) =>
                        Number(item.id) === Number(updatedRole.id)
                            ? updatedRole
                            : item
                    )
                );

                setSelectedRoleId(updatedRole.id);
                setSelectedPermissions(
                    updatedRole.permissions?.map(
                        (permission) => permission.name
                    ) || []
                );
                setDirty(false);

                setSuccess(`Role "${updatedRole.name}" berhasil diperbarui.`);
            }

            setRoleModalOpen(false);
            setRoleFormName("");
        } catch (err) {
            console.error("Role CRUD Error:", err);

            const validationErrors = err?.response?.data?.errors;

            if (validationErrors) {
                setError(
                    Object.values(validationErrors)
                        .flat()
                        .join(" ")
                );
            } else {
                setError(
                    err?.response?.data?.message ||
                        err?.message ||
                        "Gagal menyimpan Role."
                );
            }
        } finally {
            setRoleSaving(false);
        }
    };

   const handleDeleteRole = async (role) => {
        if (!window.confirm(`Hapus role "${role.name}"?`)) {
            return;
        }

        try {
            setDeletingRoleId(role.id);

            await api.delete(`/roles/${role.id}`);

            setRoles((current) =>
                current.filter(
                    (item) => Number(item.id) !== Number(role.id)
                )
            );

            if (
                Number(selectedRoleId) === Number(role.id)
            ) {
                setSelectedRoleId(null);
                setSelectedPermissions([]);
                setDirty(false);
            }

            setSuccess(`Role "${role.name}" berhasil dihapus.`);
        } catch (error) {
            console.error("Delete Role Error:", error);

            setError(
                error.response?.data?.message ||
                "Gagal menghapus role."
            );
        } finally {
            setDeletingRoleId(null);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | Checkbox
    |--------------------------------------------------------------------------
    */

    const handlePermissionToggle = (permissionName) => {
        if (selectedRole?.name === "Super Admin") {
            return;
        }

        setSelectedPermissions((current) => {
            if (current.includes(permissionName)) {
                return current.filter(
                    (permission) => permission !== permissionName
                );
            }

            return [...current, permissionName];
        });

        setDirty(true);
        setSuccess("");
    };


    /*
    |--------------------------------------------------------------------------
    | Save
    |--------------------------------------------------------------------------
    */

    const handleSave = async () => {
        if (!selectedRole) return;

        setRoleSaving(true);

        try {
            await api.post('/matrix/permissions', {
                matrix: {
                    [selectedRole.id]: selectedPermissions,
                },
            });

            alert('Permission berhasil disimpan.');

            // Refresh data
            await loadData();

        } catch (error) {
            console.error('Gagal menyimpan permission:', error);
        } finally {
            setRoleSaving(false);
        }
    };


    /*
    |--------------------------------------------------------------------------
    | Render
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span className="text-sm font-medium">
                        Memuat Role & Permission...
                    </span>
                </div>
            </div>
        );
    }


    return (
        <div className="w-full space-y-4">

            {/* ================================================================
                HEADER
            ================================================================ */}

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                <div>
                    <h1 className="text-xl font-black text-slate-800">
                        Role Management
                    </h1>

                    <p className="mt-1 text-xs text-slate-500">
                        Kelola permission berdasarkan Role dan Module.
                    </p>
                </div>


                <div className="flex items-center gap-2">

                    <button
                        type="button"
                        onClick={() => loadMatrix(true)}
                        disabled={loading || saving}
                        className="
                            inline-flex items-center gap-2
                            px-3 py-2
                            rounded-xl
                            border border-slate-200
                            bg-white
                            text-xs font-bold text-slate-600
                            shadow-sm
                            hover:bg-slate-50
                            disabled:opacity-50
                        "
                    >
                        <RefreshCw
                            className={`w-4 h-4 ${
                                loading ? "animate-spin" : ""
                            }`}
                        />

                        Refresh
                    </button>


                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={
                            saving ||
                            !dirty ||
                            selectedRole?.name === "Super Admin"
                        }
                        className="
                            inline-flex items-center gap-2
                            px-4 py-2
                            rounded-xl
                            bg-blue-600
                            text-white
                            text-xs font-bold
                            shadow-sm
                            hover:bg-blue-700
                            disabled:bg-slate-300
                            disabled:cursor-not-allowed
                        "
                    >
                        {saving ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Menyimpan...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4" />
                                Simpan
                            </>
                        )}
                    </button>

                </div>
            </div>


            {/* ================================================================
                ERROR
            ================================================================ */}

            {error && (
                <div
                    className="
                        flex items-start gap-3
                        rounded-xl
                        border border-rose-200
                        bg-rose-50
                        px-4 py-3
                        text-xs text-rose-700
                    "
                >
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />

                    <span>{error}</span>
                </div>
            )}


            {/* ================================================================
                SUCCESS
            ================================================================ */}

            {success && (
                <div
                    className="
                        flex items-center gap-3
                        rounded-xl
                        border border-emerald-200
                        bg-emerald-50
                        px-4 py-3
                        text-xs font-medium text-emerald-700
                    "
                >
                    <Check className="w-4 h-4" />

                    {success}
                </div>
            )}


            {/* ================================================================
                MAIN
            ================================================================ */}

            <div
                className="
                    grid
                    grid-cols-1
                    lg:grid-cols-[280px_minmax(0,1fr)]
                    gap-4
                "
            >

                {/* ============================================================
                    ROLE LIST
                ============================================================ */}

                <div
                    className="
                        bg-white
                        border border-slate-200
                        rounded-2xl
                        shadow-sm
                        overflow-hidden
                    "
                >

                    <div className="px-5 py-4 border-b border-slate-100 flex items-start justify-between gap-3">
                        <div>
                            <h2 className="text-sm font-black text-slate-800">
                                Daftar Role
                            </h2>

                            <p className="mt-1 text-[10px] text-slate-400">
                                Pilih Role untuk mengatur permission.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={openCreateRole}
                            disabled={roleSaving || deletingRoleId !== null}
                            className="
                                inline-flex items-center gap-1.5
                                px-2.5 py-1.5
                                rounded-lg
                                bg-blue-600
                                text-white
                                text-[10px] font-black
                                shadow-sm
                                hover:bg-blue-700
                                disabled:opacity-50
                                disabled:cursor-not-allowed
                            "
                        >
                            <Plus className="w-3.5 h-3.5" />
                            Tambah
                        </button>
                    </div>


                    <div className="p-3 space-y-2">

                        {roles.map((role) => {
                            const isSelected =
                                Number(role.id) ===
                                Number(selectedRoleId);

                            const rolePermissionCount =
                                role.permissions?.length || 0;

                            const isProtected =
                                role.name === "Super Admin";

                            return (
                                <div
                                    key={role.id}
                                    className={`
                                        w-full
                                        flex items-center gap-3
                                        p-3
                                        rounded-xl
                                        border
                                        transition
                                        ${
                                            isSelected
                                                ? "bg-blue-50 border-blue-200"
                                                : "bg-white border-transparent hover:bg-slate-50"
                                        }
                                    `}
                                >
                                    <button
                                        type="button"
                                        onClick={() => handleSelectRole(role)}
                                        className="flex items-center gap-3 min-w-0 flex-1 text-left"
                                    >
                                        <div
                                            className={`
                                                w-9 h-9
                                                rounded-xl
                                                flex items-center justify-center
                                                shrink-0
                                                ${
                                                    isSelected
                                                        ? "bg-blue-600 text-white"
                                                        : "bg-slate-100 text-slate-500"
                                                }
                                            `}
                                        >
                                            {isProtected ? (
                                                <ShieldCheck className="w-4 h-4" />
                                            ) : (
                                                <Users className="w-4 h-4" />
                                            )}
                                        </div>

                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2">
                                                <span
                                                    className={`
                                                        text-xs font-bold truncate
                                                        ${
                                                            isSelected
                                                                ? "text-blue-700"
                                                                : "text-slate-700"
                                                        }
                                                    `}
                                                >
                                                    {role.name}
                                                </span>

                                                {isProtected && (
                                                    <span
                                                        className="
                                                            px-1.5 py-0.5
                                                            rounded-full
                                                            bg-rose-100
                                                            text-[8px]
                                                            font-black
                                                            text-rose-600
                                                        "
                                                    >
                                                        PROTECTED
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mt-1 text-[10px] text-slate-400">
                                                {rolePermissionCount} permission
                                            </div>
                                        </div>

                                        <ChevronRight
                                            className={`
                                                w-4 h-4
                                                shrink-0
                                                ${
                                                    isSelected
                                                        ? "text-blue-500"
                                                        : "text-slate-300"
                                                }
                                            `}
                                        />
                                    </button>

                                    {!isProtected && (
                                        <div className="flex items-center gap-1 shrink-0">
                                            <button
                                                type="button"
                                                title="Edit Role"
                                                onClick={() => openEditRole(role)}
                                                disabled={
                                                    roleSaving ||
                                                    deletingRoleId !== null
                                                }
                                                className="
                                                    w-7 h-7
                                                    rounded-lg
                                                    flex items-center justify-center
                                                    text-slate-400
                                                    hover:text-blue-600
                                                    hover:bg-blue-50
                                                    disabled:opacity-40
                                                "
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </button>

                                            <button
                                            type="button"
                                            onClick={() => handleDeleteRole(role)}
                                            disabled={deletingRoleId === role.id}
                                            className="text-red-500 hover:text-red-700"
                                            title="Hapus role"
                                            >
                                            {deletingRoleId === role.id ? "Menghapus..." : <Trash size={18} />}
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}

                    </div>
                </div>


                {/* ============================================================
                    PERMISSION
                ============================================================ */}

                <div
                    className="
                        bg-white
                        border border-slate-200
                        rounded-2xl
                        shadow-sm
                        overflow-hidden
                    "
                >

                    {/* Header */}

                    <div
                        className="
                            px-5 py-4
                            border-b border-slate-100
                            flex flex-col sm:flex-row
                            sm:items-center
                            sm:justify-between
                            gap-3
                        "
                    >

                        <div>

                            <div className="flex items-center gap-2">

                                <ShieldCheck className="w-4 h-4 text-blue-600" />

                                <h2 className="text-sm font-black text-slate-800">
                                    Permission
                                </h2>

                            </div>


                            <p className="mt-1 text-[10px] text-slate-400">

                                Role:{" "}

                                <span className="font-bold text-slate-600">
                                    {selectedRole?.name || "-"}
                                </span>

                            </p>

                        </div>


                        <div
                            className="
                                self-start sm:self-auto
                                px-3 py-2
                                rounded-xl
                                bg-blue-50
                                text-[10px]
                                font-black
                                text-blue-600
                            "
                        >
                            {permissionCount} / {totalPermissionCount} Permission
                        </div>

                    </div>


                    {/* Protected Notice */}

                    {selectedRole?.name === "Super Admin" && (
                        <div
                            className="
                                mx-5 mt-5
                                flex items-center gap-2
                                rounded-xl
                                border border-amber-200
                                bg-amber-50
                                px-3 py-2
                                text-[10px]
                                font-medium
                                text-amber-700
                            "
                        >
                            <Lock className="w-3.5 h-3.5" />

                            Super Admin adalah Role protected.
                            Permission tidak dapat diubah.
                        </div>
                    )}


                    {/* Permission Modules */}

                    <div className="p-5">

                        <div
                            className="
                                grid
                                grid-cols-1
                                xl:grid-cols-2
                                gap-4
                            "
                        >

                            {Object.entries(groupedPermissions).map(
                                ([moduleName, modulePermissions]) => {

                                    const Icon =
                                        getModuleIcon(moduleName);

                                    const activeCount =
                                        modulePermissions.filter(
                                            (permission) =>
                                                selectedPermissions.includes(
                                                    permission.name
                                                )
                                        ).length;

                                    return (
                                        <div
                                            key={moduleName}
                                            className="
                                                rounded-2xl
                                                border border-slate-200
                                                overflow-hidden
                                                bg-white
                                            "
                                        >

                                            {/* Module Header */}

                                            <div
                                                className="
                                                    px-4 py-3
                                                    bg-slate-50
                                                    border-b border-slate-200
                                                    flex items-center justify-between
                                                "
                                            >

                                                <div className="flex items-center gap-2">

                                                    <div
                                                        className="
                                                            w-7 h-7
                                                            rounded-lg
                                                            bg-white
                                                            border border-slate-200
                                                            flex items-center justify-center
                                                        "
                                                    >
                                                        <Icon className="w-3.5 h-3.5 text-blue-600" />
                                                    </div>


                                                    <div>

                                                        <h3 className="text-xs font-black text-slate-700">
                                                            {getModuleLabel(
                                                                moduleName
                                                            )}
                                                        </h3>

                                                        <p className="text-[9px] text-slate-400">
                                                            {activeCount} dari{" "}
                                                            {modulePermissions.length}{" "}
                                                            permission aktif
                                                        </p>

                                                    </div>

                                                </div>


                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {modulePermissions.length}
                                                </span>

                                            </div>


                                            {/* Permissions */}

                                            <div>

                                                {modulePermissions.map(
                                                    (permission) => {

                                                        const checked =
                                                            selectedPermissions.includes(
                                                                permission.name
                                                            );

                                                        const disabled =
                                                            selectedRole?.name ===
                                                            "Super Admin";

                                                        return (
                                                            <label
                                                                key={
                                                                    permission.id
                                                                }
                                                                className={`
                                                                    flex
                                                                    items-center
                                                                    gap-3
                                                                    px-4 py-3
                                                                    border-b
                                                                    border-slate-100
                                                                    last:border-b-0
                                                                    transition
                                                                    ${
                                                                        disabled
                                                                            ? "cursor-not-allowed opacity-70"
                                                                            : "cursor-pointer hover:bg-slate-50"
                                                                    }
                                                                `}
                                                            >

                                                                <input
                                                                    type="checkbox"
                                                                    checked={
                                                                        checked
                                                                    }
                                                                    disabled={
                                                                        disabled
                                                                    }
                                                                    onChange={() =>
                                                                        handlePermissionToggle(
                                                                            permission.name
                                                                        )
                                                                    }
                                                                    className="
                                                                        w-4 h-4
                                                                        rounded
                                                                        border-slate-300
                                                                        text-blue-600
                                                                        focus:ring-blue-500
                                                                        shrink-0
                                                                    "
                                                                />


                                                                <span
                                                                    className={`
                                                                        flex-1
                                                                        text-[11px]
                                                                        font-medium
                                                                        ${
                                                                            checked
                                                                                ? "text-blue-700"
                                                                                : "text-slate-600"
                                                                        }
                                                                    `}
                                                                >
                                                                    {
                                                                        permission.name
                                                                    }
                                                                </span>


                                                                {checked && (
                                                                    <span
                                                                        className="
                                                                            w-5 h-5
                                                                            rounded-md
                                                                            bg-blue-600
                                                                            text-white
                                                                            flex
                                                                            items-center
                                                                            justify-center
                                                                        "
                                                                    >
                                                                        <Check className="w-3 h-3" />
                                                                    </span>
                                                                )}

                                                            </label>
                                                        );
                                                    }
                                                )}

                                            </div>

                                        </div>
                                    );
                                }
                            )}

                        </div>

                    </div>

                </div>

            </div>


            {/* ================================================================
                ROLE MODAL
            ================================================================ */}

            {roleModalOpen && (
                <div
                    className="
                        fixed inset-0 z-50
                        flex items-center justify-center
                        p-4
                        bg-slate-900/40
                        backdrop-blur-sm
                    "
                    onMouseDown={(event) => {
                        if (event.target === event.currentTarget) {
                            closeRoleModal();
                        }
                    }}
                >
                    <form
                        onSubmit={handleRoleSubmit}
                        className="
                            w-full max-w-md
                            bg-white
                            rounded-2xl
                            border border-slate-200
                            shadow-2xl
                            overflow-hidden
                        "
                    >
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-slate-800">
                                    {roleModalMode === "create"
                                        ? "Tambah Role"
                                        : "Edit Role"}
                                </h2>

                                <p className="mt-1 text-[10px] text-slate-400">
                                    {roleModalMode === "create"
                                        ? "Buat Role baru untuk sistem."
                                        : "Ubah nama Role yang dipilih."}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={closeRoleModal}
                                disabled={roleSaving}
                                className="
                                    w-8 h-8
                                    rounded-lg
                                    flex items-center justify-center
                                    text-slate-400
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                    disabled:opacity-40
                                "
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="p-5">
                            <label className="block text-xs font-bold text-slate-700">
                                Nama Role
                            </label>

                            <input
                                type="text"
                                value={roleFormName}
                                onChange={(event) =>
                                    setRoleFormName(event.target.value)
                                }
                                autoFocus
                                maxLength={100}
                                placeholder="Contoh: Gudang"
                                disabled={roleSaving}
                                className="
                                    mt-2
                                    w-full
                                    px-3 py-2.5
                                    rounded-xl
                                    border border-slate-200
                                    bg-white
                                    text-xs text-slate-700
                                    outline-none
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                    disabled:bg-slate-50
                                "
                            />

                            <p className="mt-2 text-[10px] text-slate-400">
                                Permission dapat diatur setelah Role dibuat.
                            </p>
                        </div>

                        <div className="px-5 py-4 border-t border-slate-100 flex justify-end gap-2">
                            <button
                                type="button"
                                onClick={closeRoleModal}
                                disabled={roleSaving}
                                className="
                                    px-4 py-2
                                    rounded-xl
                                    border border-slate-200
                                    bg-white
                                    text-xs font-bold text-slate-600
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                "
                            >
                                Batal
                            </button>

                            <button
                                type="submit"
                                disabled={roleSaving || !roleFormName.trim()}
                                className="
                                    inline-flex items-center gap-2
                                    px-4 py-2
                                    rounded-xl
                                    bg-blue-600
                                    text-white
                                    text-xs font-black
                                    shadow-sm
                                    hover:bg-blue-700
                                    disabled:bg-slate-300
                                    disabled:cursor-not-allowed
                                "
                            >
                                {roleSaving && (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                )}

                                {roleSaving
                                    ? "Menyimpan..."
                                    : roleModalMode === "create"
                                      ? "Buat Role"
                                      : "Simpan Perubahan"}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* ================================================================
                BOTTOM SAVE
            ================================================================ */}

            {dirty && selectedRole?.name !== "Super Admin" && (
                <div
                    className="
                        sticky bottom-3
                        flex items-center justify-between gap-3
                        p-3
                        rounded-2xl
                        border border-blue-200
                        bg-blue-50/95
                        backdrop-blur
                        shadow-lg
                    "
                >

                    <div className="text-[10px] text-blue-700">

                        <span className="font-black">
                            Perubahan belum disimpan.
                        </span>

                        <span className="hidden sm:inline ml-1">
                            Klik Simpan untuk menerapkan permission.
                        </span>

                    </div>


                    <button
                        type="button"
                        onClick={handleSave}
                        disabled={roleSaving || !selectedRole}
                        className="..."
                    >
                        {roleSaving ? 'Menyimpan...' : 'Simpan'}
                    </button>

                </div>
            )}

        </div>
    );
}