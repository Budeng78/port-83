import React, {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    ShieldCheck,
    KeyRound,
    UserCircle,
    Loader2,
    RefreshCw,
    Search,
    Plus,
    X,
    Check,
    Trash2,
    Users,
    UserRoundCog,
    CircleAlert,
} from "lucide-react";

import api from "@Modules/Platform/System/Resources/js/aplikasi/axios/axios.js";

/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalizeArray = (value) => {
    return Array.isArray(value) ? value : [];
};

const getInitials = (name = "") => {
    return name
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((item) => item.charAt(0).toUpperCase())
        .join("");
};

const isSuperAdmin = (user) => {
    return user?.roles?.some(
        (role) =>
            String(role?.name || "")
                .toLowerCase()
                .replace(/[\s_-]+/g, "") === "superadmin"
    );
};

const getUserRoles = (user) => {
    return Array.isArray(user?.roles)
        ? user.roles
        : [];
};

const getUserPermissions = (user) => {
    if (Array.isArray(user?.direct_permissions)) {
        return user.direct_permissions;
    }

    if (Array.isArray(user?.permissions)) {
        return user.permissions;
    }

    return [];
};

/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function UserMatrix() {
    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [error, setError] = useState("");
    const [search, setSearch] = useState("");

    const [activeUser, setActiveUser] = useState(null);
    const [activeType, setActiveType] = useState(null);

    const [selectorSearch, setSelectorSearch] = useState("");

    /*
    |--------------------------------------------------------------------------
    | LOAD MATRIX
    |--------------------------------------------------------------------------
    */

    const loadMatrix = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/matrix/users");

            const result = response?.data;

            if (!result?.success) {
                throw new Error(
                    result?.message ||
                        "Gagal mengambil User Matrix."
                );
            }

            const data = result?.data || {};

            setUsers(
                normalizeArray(data.users)
            );

            setRoles(
                normalizeArray(data.roles)
            );

            setPermissions(
                normalizeArray(data.permissions)
            );
        } catch (err) {
            console.error(
                "User Matrix Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    err?.message ||
                    "Gagal mengambil User Matrix."
            );

            setUsers([]);
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
        loadMatrix();
    }, []);

    /*
    |--------------------------------------------------------------------------
    | FILTER USERS
    |--------------------------------------------------------------------------
    */

    const filteredUsers = useMemo(() => {
        const keyword = search
            .trim()
            .toLowerCase();

        if (!keyword) {
            return users;
        }

        return users.filter((user) => {
            const name = String(
                user?.name || ""
            ).toLowerCase();

            const email = String(
                user?.email || ""
            ).toLowerCase();

            return (
                name.includes(keyword) ||
                email.includes(keyword)
            );
        });
    }, [users, search]);

    /*
    |--------------------------------------------------------------------------
    | OPEN SELECTOR
    |--------------------------------------------------------------------------
    */

    const openSelector = (type, user) => {
        setError("");
        setSelectorSearch("");
        setActiveUser(user);
        setActiveType(type);
    };

    /*
    |--------------------------------------------------------------------------
    | CLOSE SELECTOR
    |--------------------------------------------------------------------------
    */

    const closeSelector = () => {
        if (saving) {
            return;
        }

        setActiveUser(null);
        setActiveType(null);
        setSelectorSearch("");
    };

    /*
    |--------------------------------------------------------------------------
    | UPDATE USER LOCALLY
    |--------------------------------------------------------------------------
    */

    const updateUserLocally = (
        userId,
        updater
    ) => {
        setUsers((currentUsers) =>
            currentUsers.map((user) => {
                if (
                    String(user.id) !==
                    String(userId)
                ) {
                    return user;
                }

                return updater(user);
            })
        );

        setActiveUser((currentUser) => {
            if (
                !currentUser ||
                String(currentUser.id) !==
                    String(userId)
            ) {
                return currentUser;
            }

            return updater(currentUser);
        });
    };

    /*
    |--------------------------------------------------------------------------
    | ADD ROLE
    |--------------------------------------------------------------------------
    */

    const handleAddRole = async (
        user,
        role
    ) => {
        if (!user?.id || !role?.id) {
            return;
        }

        const exists = getUserRoles(user).some(
            (item) =>
                String(item.id) ===
                String(role.id)
        );

        if (exists) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            await api.post(
                `/matrix/users/${user.id}/roles`,
                {
                    role_id: role.id,
                }
            );

            updateUserLocally(
                user.id,
                (currentUser) => ({
                    ...currentUser,
                    roles: [
                        ...getUserRoles(
                            currentUser
                        ),
                        role,
                    ],
                })
            );
        } catch (err) {
            console.error(
                "Add Role Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Gagal menambahkan Role."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE ROLE
    |--------------------------------------------------------------------------
    */

    const handleRemoveRole = async (
        user,
        role
    ) => {
        if (!user?.id || !role?.id) {
            return;
        }

        /*
        |----------------------------------------------------------------------
        | PROTECTED SUPER ADMIN
        |----------------------------------------------------------------------
        */

        if (
            isSuperAdmin(user) &&
            String(role?.name || "")
                .toLowerCase()
                .replace(/[\s_-]+/g, "") ===
                "superadmin"
        ) {
            setError(
                "Role Super Admin merupakan protected system data dan tidak dapat dihapus melalui User Matrix."
            );

            return;
        }

        try {
            setSaving(true);
            setError("");

            await api.delete(
                `/matrix/users/${user.id}/roles/${role.id}`
            );

            updateUserLocally(
                user.id,
                (currentUser) => ({
                    ...currentUser,
                    roles: getUserRoles(
                        currentUser
                    ).filter(
                        (item) =>
                            String(item.id) !==
                            String(role.id)
                    ),
                })
            );
        } catch (err) {
            console.error(
                "Remove Role Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Gagal menghapus Role."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | ADD DIRECT PERMISSION
    |--------------------------------------------------------------------------
    */

    const handleAddPermission = async (
        user,
        permission
    ) => {
        if (
            !user?.id ||
            !permission?.id
        ) {
            return;
        }

        const exists =
            getUserPermissions(user).some(
                (item) =>
                    String(item.id) ===
                    String(permission.id)
            );

        if (exists) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            await api.post(
                `/matrix/users/${user.id}/permissions`,
                {
                    permission_id:
                        permission.id,
                }
            );

            updateUserLocally(
                user.id,
                (currentUser) => ({
                    ...currentUser,
                    direct_permissions: [
                        ...getUserPermissions(
                            currentUser
                        ),
                        permission,
                    ],
                })
            );
        } catch (err) {
            console.error(
                "Add Permission Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Gagal menambahkan Permission."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REMOVE DIRECT PERMISSION
    |--------------------------------------------------------------------------
    */

    const handleRemovePermission = async (
        user,
        permission
    ) => {
        if (
            !user?.id ||
            !permission?.id
        ) {
            return;
        }

        try {
            setSaving(true);
            setError("");

            await api.delete(
                `/matrix/users/${user.id}/permissions/${permission.id}`
            );

            updateUserLocally(
                user.id,
                (currentUser) => ({
                    ...currentUser,
                    direct_permissions:
                        getUserPermissions(
                            currentUser
                        ).filter(
                            (item) =>
                                String(
                                    item.id
                                ) !==
                                String(
                                    permission.id
                                )
                        ),
                })
            );
        } catch (err) {
            console.error(
                "Remove Permission Error:",
                err
            );

            setError(
                err?.response?.data?.message ||
                    "Gagal menghapus Permission."
            );
        } finally {
            setSaving(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | FILTER SELECTOR
    |--------------------------------------------------------------------------
    */

    const filteredRoles = useMemo(() => {
        const keyword =
            selectorSearch
                .trim()
                .toLowerCase();

        if (!keyword) {
            return roles;
        }

        return roles.filter((role) =>
            String(
                role?.name || ""
            )
                .toLowerCase()
                .includes(keyword)
        );
    }, [
        roles,
        selectorSearch,
    ]);

    const filteredPermissions =
        useMemo(() => {
            const keyword =
                selectorSearch
                    .trim()
                    .toLowerCase();

            if (!keyword) {
                return permissions;
            }

            return permissions.filter(
                (permission) =>
                    String(
                        permission?.name ||
                            ""
                    )
                        .toLowerCase()
                        .includes(keyword)
            );
        }, [
            permissions,
            selectorSearch,
        ]);

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {
        return (
            <div className="flex min-h-[320px] items-center justify-center">
                <div className="flex items-center gap-3 text-slate-500">
                    <Loader2
                        size={20}
                        className="animate-spin"
                    />

                    <span className="text-sm font-semibold">
                        Memuat User Matrix...
                    </span>
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
        <div className="w-full space-y-4 pb-[80px] md:pb-6">
            {/* ==============================================================
                HEADER
            ============================================================== */}

            <div className="relative overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white p-5 shadow-sm">
                <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400" />

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex min-w-0 items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#1B365D] text-white shadow-sm">
                            <UserRoundCog
                                size={24}
                            />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-lg font-black text-slate-800">
                                User Matrix
                            </h1>

                            <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                                Kelola Role dan Direct
                                Permission setiap
                                personnel.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={loadMatrix}
                        disabled={saving}
                        className="inline-flex h-10 w-10 shrink-0 items-center justify-center self-end rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
                        title="Refresh"
                    >
                        <RefreshCw
                            size={17}
                        />
                    </button>
                </div>
            </div>

            {/* ==============================================================
                ERROR
            ============================================================== */}

            {error && (
                <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-xs font-semibold text-rose-600">
                    <CircleAlert
                        size={16}
                        className="mt-0.5 shrink-0"
                    />

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        className="ml-auto shrink-0 text-rose-400 hover:text-rose-600"
                    >
                        <X size={15} />
                    </button>
                </div>
            )}

            {/* ==============================================================
                SEARCH
            ============================================================== */}

            <div className="rounded-2xl border border-[#D9DEE8] bg-white p-3 shadow-sm">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-md">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target
                                        .value
                                )
                            }
                            placeholder="Cari personnel..."
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                        />
                    </div>

                    <div className="flex items-center gap-2 px-2 text-xs font-semibold text-slate-500">
                        <Users
                            size={15}
                        />

                        <span>
                            {filteredUsers.length}{" "}
                            personnel
                        </span>
                    </div>
                </div>
            </div>

            {/* ==============================================================
                DESKTOP TABLE
            ============================================================== */}

            <div className="hidden overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm md:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[900px] table-fixed">
                        <thead>
                            <tr className="border-b border-[#D9DEE8] bg-[#F8FAFD]">
                                <th className="w-[30%] px-6 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#243A70]">
                                    Personnel
                                </th>

                                <th className="w-[35%] px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#243A70]">
                                    System Roles
                                </th>

                                <th className="w-[35%] px-4 py-4 text-left text-[10px] font-black uppercase tracking-wider text-[#243A70]">
                                    Direct Permissions
                                </th>
                            </tr>
                        </thead>

                        <tbody>
                            {filteredUsers.length ===
                            0 ? (
                                <EmptyTable />
                            ) : (
                                filteredUsers.map(
                                    (user) => (
                                        <UserTableRow
                                            key={
                                                user.id
                                            }
                                            user={
                                                user
                                            }
                                            saving={
                                                saving
                                            }
                                            onAddRole={() =>
                                                openSelector(
                                                    "role",
                                                    user
                                                )
                                            }
                                            onAddPermission={() =>
                                                openSelector(
                                                    "permission",
                                                    user
                                                )
                                            }
                                            onRemoveRole={
                                                handleRemoveRole
                                            }
                                            onRemovePermission={
                                                handleRemovePermission
                                            }
                                        />
                                    )
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ==============================================================
                MOBILE
            ============================================================== */}

            <div className="space-y-3 md:hidden">
                {filteredUsers.length ===
                0 ? (
                    <EmptyMobile />
                ) : (
                    filteredUsers.map(
                        (user) => (
                            <UserMobileCard
                                key={user.id}
                                user={user}
                                saving={saving}
                                onAddRole={() =>
                                    openSelector(
                                        "role",
                                        user
                                    )
                                }
                                onAddPermission={() =>
                                    openSelector(
                                        "permission",
                                        user
                                    )
                                }
                                onRemoveRole={
                                    handleRemoveRole
                                }
                                onRemovePermission={
                                    handleRemovePermission
                                }
                            />
                        )
                    )
                )}
            </div>

            {/* ==============================================================
                SELECTOR MODAL
            ============================================================== */}

            {activeUser &&
                activeType && (
                    <SelectorModal
                        type={
                            activeType
                        }
                        user={
                            activeUser
                        }
                        roles={
                            filteredRoles
                        }
                        permissions={
                            filteredPermissions
                        }
                        selectorSearch={
                            selectorSearch
                        }
                        setSelectorSearch={
                            setSelectorSearch
                        }
                        saving={
                            saving
                        }
                        onClose={
                            closeSelector
                        }
                        onAddRole={
                            handleAddRole
                        }
                        onAddPermission={
                            handleAddPermission
                        }
                    />
                )}
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| USER TABLE ROW
|--------------------------------------------------------------------------
*/

function UserTableRow({
    user,
    saving,
    onAddRole,
    onAddPermission,
    onRemoveRole,
    onRemovePermission,
}) {
    const userRoles =
        getUserRoles(user);

    const userPermissions =
        getUserPermissions(user);

    return (
        <tr className="border-b border-slate-100 last:border-b-0 hover:bg-[#F8FAFD]">
            {/* USER */}

            <td className="px-6 py-5 align-top">
                <UserIdentity
                    user={user}
                />
            </td>

            {/* ROLES */}

            <td className="px-4 py-5 align-top">
                <div className="flex flex-wrap gap-2">
                    {userRoles.map(
                        (role) => (
                            <RoleChip
                                key={
                                    role.id
                                }
                                role={
                                    role
                                }
                                user={
                                    user
                                }
                                saving={
                                    saving
                                }
                                onRemove={
                                    onRemoveRole
                                }
                            />
                        )
                    )}

                    <AddButton
                        label="Add Role"
                        onClick={
                            onAddRole
                        }
                        disabled={
                            saving
                        }
                    />
                </div>

                {userRoles.length ===
                    0 && (
                    <div className="mb-2 text-[11px] text-slate-400">
                        Belum memiliki
                        Role.
                    </div>
                )}
            </td>

            {/* PERMISSIONS */}

            <td className="px-4 py-5 align-top">
                <div className="flex flex-wrap gap-2">
                    {userPermissions.map(
                        (
                            permission
                        ) => (
                            <PermissionChip
                                key={
                                    permission.id
                                }
                                permission={
                                    permission
                                }
                                user={
                                    user
                                }
                                saving={
                                    saving
                                }
                                onRemove={
                                    onRemovePermission
                                }
                            />
                        )
                    )}

                    <AddButton
                        label="Add Permission"
                        onClick={
                            onAddPermission
                        }
                        disabled={
                            saving
                        }
                    />
                </div>

                {userPermissions.length ===
                    0 && (
                    <div className="mb-2 text-[11px] text-slate-400">
                        Belum memiliki
                        Direct
                        Permission.
                    </div>
                )}
            </td>
        </tr>
    );
}

/*
|--------------------------------------------------------------------------
| MOBILE CARD
|--------------------------------------------------------------------------
*/

function UserMobileCard({
    user,
    saving,
    onAddRole,
    onAddPermission,
    onRemoveRole,
    onRemovePermission,
}) {
    const userRoles =
        getUserRoles(user);

    const userPermissions =
        getUserPermissions(user);

    return (
        <div className="overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm">
            {/* USER */}

            <div className="border-b border-slate-100 p-4">
                <UserIdentity
                    user={user}
                />
            </div>

            {/* ROLES */}

            <div className="border-b border-slate-100 p-4">
                <SectionTitle
                    icon={
                        <ShieldCheck
                            size={14}
                        />
                    }
                    title="System Roles"
                    count={
                        userRoles.length
                    }
                />

                <div className="mt-3 flex flex-wrap gap-2">
                    {userRoles.map(
                        (role) => (
                            <RoleChip
                                key={
                                    role.id
                                }
                                role={
                                    role
                                }
                                user={
                                    user
                                }
                                saving={
                                    saving
                                }
                                onRemove={
                                    onRemoveRole
                                }
                            />
                        )
                    )}

                    <AddButton
                        label="Add Role"
                        onClick={
                            onAddRole
                        }
                        disabled={
                            saving
                        }
                    />
                </div>

                {userRoles.length ===
                    0 && (
                    <div className="mt-2 text-[10px] text-slate-400">
                        Belum memiliki
                        Role.
                    </div>
                )}
            </div>

            {/* PERMISSIONS */}

            <div className="p-4">
                <SectionTitle
                    icon={
                        <KeyRound
                            size={14}
                        />
                    }
                    title="Direct Permissions"
                    count={
                        userPermissions.length
                    }
                />

                <div className="mt-3 flex flex-wrap gap-2">
                    {userPermissions.map(
                        (
                            permission
                        ) => (
                            <PermissionChip
                                key={
                                    permission.id
                                }
                                permission={
                                    permission
                                }
                                user={
                                    user
                                }
                                saving={
                                    saving
                                }
                                onRemove={
                                    onRemovePermission
                                }
                            />
                        )
                    )}

                    <AddButton
                        label="Add Permission"
                        onClick={
                            onAddPermission
                        }
                        disabled={
                            saving
                        }
                    />
                </div>

                {userPermissions.length ===
                    0 && (
                    <div className="mt-2 text-[10px] text-slate-400">
                        Belum memiliki
                        Direct
                        Permission.
                    </div>
                )}
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| USER IDENTITY
|--------------------------------------------------------------------------
*/

function UserIdentity({
    user,
}) {
    const initials =
        getInitials(
            user?.name
        );

    return (
        <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#1B365D]">
                {initials ? (
                    <span className="text-xs font-black">
                        {
                            initials
                        }
                    </span>
                ) : (
                    <UserCircle
                        size={21}
                    />
                )}
            </div>

            <div className="min-w-0">
                <div className="truncate text-sm font-black text-slate-800">
                    {user?.name ||
                        "-"}
                </div>

                <div className="mt-0.5 truncate text-[10px] text-slate-400">
                    {user?.email ||
                        "-"}
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| SECTION TITLE
|--------------------------------------------------------------------------
*/

function SectionTitle({
    icon,
    title,
    count,
}) {
    return (
        <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#EEF3FA] text-[#243A70]">
                {icon}
            </span>

            <span className="text-[10px] font-black uppercase tracking-wider text-[#243A70]">
                {title}
            </span>

            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-100 px-1.5 text-[9px] font-black text-slate-500">
                {count}
            </span>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| ROLE CHIP
|--------------------------------------------------------------------------
*/

function RoleChip({
    role,
    user,
    saving,
    onRemove,
}) {
    const protectedRole =
        isSuperAdmin(user) &&
        String(
            role?.name || ""
        )
            .toLowerCase()
            .replace(
                /[\s_-]+/g,
                ""
            ) ===
            "superadmin";

    return (
        <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-[#DCE5FF] bg-[#F4F7FF] py-1.5 pl-2.5 pr-1 text-[10px] font-bold text-[#3F5FC4]">
            <ShieldCheck
                size={12}
                className="shrink-0"
            />

            <span className="max-w-[180px] truncate">
                {role?.name ||
                    "-"}
            </span>

            {!protectedRole && (
                <button
                    type="button"
                    onClick={() =>
                        onRemove(
                            user,
                            role
                        )
                    }
                    disabled={
                        saving
                    }
                    className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-[#7890D8] transition hover:bg-white hover:text-rose-500 disabled:opacity-40"
                    title="Hapus Role"
                >
                    <X
                        size={12}
                    />
                </button>
            )}
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| PERMISSION CHIP
|--------------------------------------------------------------------------
*/

function PermissionChip({
    permission,
    user,
    saving,
    onRemove,
}) {
    return (
        <span className="inline-flex max-w-full items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-2.5 pr-1 text-[9px] font-semibold text-slate-600">
            <KeyRound
                size={11}
                className="shrink-0 text-slate-400"
            />

            <span className="max-w-[220px] truncate font-mono">
                {permission?.name ||
                    "-"}
            </span>

            <button
                type="button"
                onClick={() =>
                    onRemove(
                        user,
                        permission
                    )
                }
                disabled={
                    saving
                }
                className="ml-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-white hover:text-rose-500 disabled:opacity-40"
                title="Hapus Permission"
            >
                <X size={12} />
            </button>
        </span>
    );
}

/*
|--------------------------------------------------------------------------
| ADD BUTTON
|--------------------------------------------------------------------------
*/

function AddButton({
    label,
    onClick,
    disabled,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-500 transition hover:border-[#4B8DF5] hover:bg-[#F4F7FF] hover:text-[#3F5FC4] disabled:cursor-not-allowed disabled:opacity-50"
        >
            <Plus
                size={12}
            />

            {label}
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| SELECTOR MODAL
|--------------------------------------------------------------------------
*/

function SelectorModal({
    type,
    user,
    roles,
    permissions,
    selectorSearch,
    setSelectorSearch,
    saving,
    onClose,
    onAddRole,
    onAddPermission,
}) {
    const isRole =
        type === "role";

    const title = isRole
        ? "Add System Role"
        : "Add Direct Permission";

    const subtitle = isRole
        ? "Pilih role yang akan diberikan kepada user."
        : "Pilih permission langsung untuk user.";

    const currentItems =
        isRole
            ? getUserRoles(user)
            : getUserPermissions(
                  user
              );

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-blue-900/50 px-3 py-[72px] backdrop-blur-sm sm:px-4 sm:py-[72px]"
            style={{
                paddingBottom:
                    "max(72px, env(safe-area-inset-bottom) + 72px)",
            }}
            onMouseDown={(
                event
            ) => {
                if (
                    event.target ===
                    event.currentTarget
                ) {
                    onClose();
                }
            }}
        >
            <div className="flex w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-2xl max-h-[calc(100vh-152px)] max-h-[calc(100dvh-152px)]">
                {/* HEADER */}

                <div className="shrink-0 border-b border-slate-100 bg-white px-5 py-4">
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#EEF3FA] text-[#243A70]">
                                    {isRole ? (
                                        <ShieldCheck
                                            size={
                                                17
                                            }
                                        />
                                    ) : (
                                        <KeyRound
                                            size={
                                                17
                                            }
                                        />
                                    )}
                                </div>

                                <div className="min-w-0">
                                    <h2 className="truncate text-sm font-black text-slate-800">
                                        {
                                            title
                                        }
                                    </h2>

                                    <p className="mt-0.5 truncate text-[10px] text-slate-400">
                                        {
                                            user?.name
                                        }
                                    </p>
                                </div>
                            </div>

                            <p className="mt-3 text-[11px] leading-relaxed text-slate-500">
                                {
                                    subtitle
                                }
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={
                                onClose
                            }
                            disabled={
                                saving
                            }
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-40"
                        >
                            <X
                                size={17}
                            />
                        </button>
                    </div>

                    {/* SEARCH */}

                    <div className="relative mt-4">
                        <Search
                            size={15}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                        />

                        <input
                            type="search"
                            value={
                                selectorSearch
                            }
                            onChange={(
                                event
                            ) =>
                                setSelectorSearch(
                                    event
                                        .target
                                        .value
                                )
                            }
                            placeholder={
                                isRole
                                    ? "Cari role..."
                                    : "Cari permission..."
                            }
                            disabled={
                                saving
                            }
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                        />
                    </div>
                </div>

                {/* CURRENT */}

                {currentItems.length >
                    0 && (
                    <div className="shrink-0 border-b border-slate-100 bg-slate-50/70 px-5 py-3">
                        <div className="mb-2 text-[9px] font-black uppercase tracking-wider text-slate-400">
                            Sudah Dimiliki
                        </div>

                        <div className="flex flex-wrap gap-1.5">
                            {currentItems.map(
                                (
                                    item
                                ) => (
                                    <span
                                        key={
                                            item.id
                                        }
                                        className="rounded-lg bg-white px-2 py-1 text-[9px] font-semibold text-slate-500 shadow-sm"
                                    >
                                        {
                                            item.name
                                        }
                                    </span>
                                )
                            )}
                        </div>
                    </div>
                )}

                {/* BODY */}

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3">
                    <div className="space-y-1">
                        {isRole
                            ? roles.map(
                                  (
                                      role
                                  ) => {
                                      const exists =
                                          currentItems.some(
                                              (
                                                  item
                                              ) =>
                                                  String(
                                                      item.id
                                                  ) ===
                                                  String(
                                                      role.id
                                                  )
                                          );

                                      return (
                                          <SelectorItem
                                              key={
                                                  role.id
                                              }
                                              icon={
                                                  <ShieldCheck
                                                      size={
                                                          16
                                                      }
                                                  />
                                              }
                                              title={
                                                  role.name
                                              }
                                              exists={
                                                  exists
                                              }
                                              disabled={
                                                  saving ||
                                                  exists
                                              }
                                              onClick={() =>
                                                  onAddRole(
                                                      user,
                                                      role
                                                  )
                                              }
                                          />
                                      );
                                  }
                              )
                            : permissions.map(
                                  (
                                      permission
                                  ) => {
                                      const exists =
                                          currentItems.some(
                                              (
                                                  item
                                              ) =>
                                                  String(
                                                      item.id
                                                  ) ===
                                                  String(
                                                      permission.id
                                                  )
                                          );

                                      return (
                                          <SelectorItem
                                              key={
                                                  permission.id
                                              }
                                              icon={
                                                  <KeyRound
                                                      size={
                                                          15
                                                      }
                                                  />
                                              }
                                              title={
                                                  permission.name
                                              }
                                              mono={
                                                  true
                                              }
                                              exists={
                                                  exists
                                              }
                                              disabled={
                                                  saving ||
                                                  exists
                                              }
                                              onClick={() =>
                                                  onAddPermission(
                                                      user,
                                                      permission
                                                  )
                                              }
                                          />
                                      );
                                  }
                              )}

                        {((isRole &&
                            roles.length ===
                                0) ||
                            (!isRole &&
                                permissions.length ===
                                    0)) && (
                            <div className="py-12 text-center">
                                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                                    {isRole ? (
                                        <ShieldCheck
                                            size={
                                                20
                                            }
                                        />
                                    ) : (
                                        <KeyRound
                                            size={
                                                20
                                            }
                                        />
                                    )}
                                </div>

                                <div className="mt-3 text-xs font-bold text-slate-600">
                                    Data tidak
                                    ditemukan
                                </div>

                                <div className="mt-1 text-[10px] text-slate-400">
                                    Coba kata
                                    kunci
                                    lainnya.
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* FOOTER */}

                <div className="flex shrink-0 items-center justify-between border-t border-slate-100 bg-white px-5 py-3">
                    <div className="text-[10px] text-slate-400">
                        Klik item untuk
                        menambahkan.
                    </div>

                    <button
                        type="button"
                        onClick={
                            onClose
                        }
                        disabled={
                            saving
                        }
                        className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-500 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    );
}

/*
|--------------------------------------------------------------------------
| SELECTOR ITEM
|--------------------------------------------------------------------------
*/

function SelectorItem({
    icon,
    title,
    exists,
    disabled,
    onClick,
    mono = false,
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={`flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left transition ${
                exists
                    ? "border-emerald-100 bg-emerald-50/60"
                    : "border-slate-100 bg-white hover:border-[#DCE5FF] hover:bg-[#F8FAFD]"
            } ${
                disabled
                    ? "cursor-default"
                    : "cursor-pointer"
            }`}
        >
            <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                    exists
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-[#EEF3FA] text-[#243A70]"
                }`}
            >
                {icon}
            </div>

            <div className="min-w-0 flex-1">
                <div
                    className={`break-all text-xs font-bold ${
                        mono
                            ? "font-mono"
                            : ""
                    } ${
                        exists
                            ? "text-emerald-700"
                            : "text-slate-700"
                    }`}
                >
                    {title}
                </div>
            </div>

            {exists ? (
                <div className="flex shrink-0 items-center gap-1 rounded-full bg-emerald-100 px-2 py-1 text-[9px] font-black text-emerald-600">
                    <Check
                        size={11}
                    />
                    AKTIF
                </div>
            ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-50 text-slate-400">
                    <Plus
                        size={14}
                    />
                </div>
            )}
        </button>
    );
}

/*
|--------------------------------------------------------------------------
| EMPTY STATES
|--------------------------------------------------------------------------
*/

function EmptyTable() {
    return (
        <tr>
            <td
                colSpan="3"
                className="px-5 py-16 text-center"
            >
                <EmptyContent />
            </td>
        </tr>
    );
}

function EmptyMobile() {
    return (
        <div className="rounded-2xl border border-[#D9DEE8] bg-white px-5 py-14 text-center shadow-sm">
            <EmptyContent />
        </div>
    );
}

function EmptyContent() {
    return (
        <>
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <Users
                    size={21}
                />
            </div>

            <div className="mt-3 text-sm font-bold text-slate-600">
                Tidak ada personnel
            </div>

            <div className="mt-1 text-[10px] text-slate-400">
                Belum ada user yang
                sesuai dengan pencarian.
            </div>
        </>
    );
}