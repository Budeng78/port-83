import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Search,
    RefreshCw,
    Save,
    X,
    Check,
    ChevronDown,
    ChevronRight,
    Menu as MenuIcon,
    Users,
    ShieldCheck,
} from 'lucide-react';

import UserService
    from '@Modules/Platform/Auth/Resources/js/aplikasi/services/UserService';

import UserMenuService
    from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/UserMenuService';


export default function UserMenu() {

    // =========================================================
    // USERS
    // =========================================================

    const [users, setUsers] = useState([]);

    const [loadingUsers, setLoadingUsers] = useState(false);

    const [userSearch, setUserSearch] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);


    // =========================================================
    // MENUS
    // =========================================================

    const [menus, setMenus] = useState([]);

    const [loadingMenus, setLoadingMenus] = useState(false);

    const [menuSearch, setMenuSearch] = useState('');

    const [selectedMenuIds, setSelectedMenuIds] = useState([]);


    // =========================================================
    // UI
    // =========================================================

    const [savingMenu, setSavingMenu] = useState(false);

    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');

    const [expandedMenus, setExpandedMenus] = useState({});


    // =========================================================
    // LOAD USERS
    // =========================================================

    const loadUsers = async () => {

        setLoadingUsers(true);
        setError('');

        try {

            const response = await UserService.getUsers({
                page: 1,
                search: '',
            });

            /*
             * UserService biasanya mengembalikan:
             *
             * {
             *     data: {
             *         data: [...]
             *     }
             * }
             */

            const paginator = response?.data;

            const userData =
                Array.isArray(paginator?.data)
                    ? paginator.data
                    : Array.isArray(response?.data)
                        ? response.data
                        : [];

            setUsers(userData);

        } catch (err) {

            console.error(
                'Gagal mengambil data user:',
                err
            );

            setUsers([]);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal mengambil data pengguna.'
            );

        } finally {

            setLoadingUsers(false);

        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadUsers();

    }, []);


    // =========================================================
    // LOAD USER MENU
    // =========================================================

    const loadUserMenus = async (user) => {

        if (!user?.id) {
            return;
        }

        setSelectedUser(user);

        setLoadingMenus(true);

        setError('');

        setSuccess('');

        setMenus([]);

        setSelectedMenuIds([]);

        setMenuSearch('');


        try {

            /*
             * PENTING:
             *
             * Gunakan UserMenuService.
             *
             * Jangan UserMatrixService.
             */

            const response =
                await UserMenuService.getUserMenus(
                    user.id
                );


            /*
             * Toleransi beberapa bentuk response.
             */

            const payload =
                response?.data ?? response;


            let menuData = [];

            let selectedIds = [];


            // -------------------------------------------------
            // RESPONSE:
            //
            // {
            //     success: true,
            //     data: {
            //         menus: [],
            //         selected_menu_ids: []
            //     }
            // }
            // -------------------------------------------------

            if (
                payload &&
                !Array.isArray(payload) &&
                Array.isArray(payload?.menus)
            ) {

                menuData = payload.menus;

                selectedIds =
                    Array.isArray(
                        payload.selected_menu_ids
                    )
                        ? payload.selected_menu_ids
                        : [];

            }


            // -------------------------------------------------
            // RESPONSE:
            //
            // {
            //     data: [...]
            // }
            // -------------------------------------------------

            else if (Array.isArray(payload)) {

                menuData = payload;

            }


            // -------------------------------------------------
            // RESPONSE:
            //
            // {
            //     data: {
            //         data: [...]
            //     }
            // }
            // -------------------------------------------------

            else if (
                Array.isArray(payload?.data)
            ) {

                menuData = payload.data;

            }


            // -------------------------------------------------
            // SET MENUS
            // -------------------------------------------------

            setMenus(menuData);


            // -------------------------------------------------
            // SELECTED MENU IDS
            // -------------------------------------------------

            if (selectedIds.length > 0) {

                setSelectedMenuIds(
                    selectedIds.map(
                        (id) => String(id)
                    )
                );

            } else {

                /*
                 * Kalau backend tidak memberikan
                 * selected_menu_ids, deteksi dari
                 * property menu.
                 */

                const detectedIds =
                    flattenMenus(menuData)
                        .filter((menu) =>
                            menu?.selected === true ||
                            menu?.is_selected === true ||
                            menu?.has_access === true ||
                            menu?.access === true
                        )
                        .map(
                            (menu) =>
                                String(menu.id)
                        );


                setSelectedMenuIds(
                    detectedIds
                );

            }


            // -------------------------------------------------
            // EXPAND PARENT MENU
            // -------------------------------------------------

            const expanded = {};


            flattenMenus(menuData)
                .forEach((menu) => {

                    if (
                        Array.isArray(
                            menu?.children
                        ) &&
                        menu.children.length > 0
                    ) {

                        expanded[
                            String(menu.id)
                        ] = true;

                    }

                });


            setExpandedMenus(expanded);

        } catch (err) {

            console.error(
                'Gagal mengambil menu user:',
                err
            );

            setMenus([]);

            setSelectedMenuIds([]);

            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal mengambil akses menu user.'
            );

        } finally {

            setLoadingMenus(false);

        }
    };


    // =========================================================
    // FLATTEN MENU
    // =========================================================

    const flattenMenus = (
        menuItems,
        result = []
    ) => {

        if (!Array.isArray(menuItems)) {
            return result;
        }

        menuItems.forEach((menu) => {

            result.push(menu);

            if (
                Array.isArray(menu?.children) &&
                menu.children.length > 0
            ) {

                flattenMenus(
                    menu.children,
                    result
                );

            }

        });

        return result;
    };


    // =========================================================
    // FILTER USERS
    // =========================================================

    const filteredUsers = useMemo(() => {

        const keyword =
            userSearch
                .trim()
                .toLowerCase();


        if (!keyword) {
            return users;
        }


        return users.filter((user) => {

            const name =
                String(
                    user?.name ?? ''
                ).toLowerCase();


            const email =
                String(
                    user?.email ?? ''
                ).toLowerCase();


            const whatsapp =
                String(
                    user?.no_whatsapp ?? ''
                ).toLowerCase();


            return (
                name.includes(keyword) ||
                email.includes(keyword) ||
                whatsapp.includes(keyword)
            );

        });

    }, [
        users,
        userSearch,
    ]);


    // =========================================================
    // ALL MENUS
    // =========================================================

    const allMenus = useMemo(() => {

        return flattenMenus(menus);

    }, [menus]);


    // =========================================================
    // FILTER MENU TREE
    // =========================================================

    const filterMenuTree = (
        menuItems,
        keyword
    ) => {

        if (!Array.isArray(menuItems)) {
            return [];
        }


        if (!keyword) {
            return menuItems;
        }


        return menuItems
            .map((menu) => {

                const label =
                    String(
                        menu?.label ?? ''
                    ).toLowerCase();


                const name =
                    String(
                        menu?.name ?? ''
                    ).toLowerCase();


                const path =
                    String(
                        menu?.path ?? ''
                    ).toLowerCase();


                const permission =
                    String(
                        menu?.permission_name ?? ''
                    ).toLowerCase();


                const ownMatch =
                    label.includes(keyword) ||
                    name.includes(keyword) ||
                    path.includes(keyword) ||
                    permission.includes(keyword);


                const children =
                    filterMenuTree(
                        menu?.children || [],
                        keyword
                    );


                if (
                    ownMatch ||
                    children.length > 0
                ) {

                    return {
                        ...menu,
                        children,
                    };

                }


                return null;

            })
            .filter(Boolean);

    };


    // =========================================================
    // FILTERED MENUS
    // =========================================================

    const filteredMenus = useMemo(() => {

        return filterMenuTree(
            menus,
            menuSearch
                .trim()
                .toLowerCase()
        );

    }, [
        menus,
        menuSearch,
    ]);


    // =========================================================
    // TOGGLE EXPAND
    // =========================================================

    const toggleExpand = (menuId) => {

        const key = String(menuId);


        setExpandedMenus((prev) => ({

            ...prev,

            [key]: !prev[key],

        }));

    };


    // =========================================================
    // GET DESCENDANT IDS
    // =========================================================

    const getDescendantIds = (menu) => {

        const ids = [];


        if (
            !Array.isArray(menu?.children)
        ) {

            return ids;

        }


        menu.children.forEach((child) => {

            ids.push(
                String(child.id)
            );


            ids.push(
                ...getDescendantIds(child)
            );

        });


        return ids;

    };


    // =========================================================
    // GET TREE IDS
    // =========================================================

    const getMenuTreeIds = (menu) => {

        return [
            String(menu.id),
            ...getDescendantIds(menu),
        ];

    };


    // =========================================================
    // TOGGLE MENU TREE
    // =========================================================

    const toggleMenu = (menu) => {

        if (
            menu?.is_active === false
        ) {

            return;

        }


        const ids =
            getMenuTreeIds(menu);


        setSelectedMenuIds((prev) => {

            const selected =
                new Set(
                    prev.map(
                        (id) =>
                            String(id)
                    )
                );


            const rootId =
                String(menu.id);


            if (
                selected.has(rootId)
            ) {

                ids.forEach((id) => {

                    selected.delete(id);

                });

            } else {

                ids.forEach((id) => {

                    selected.add(id);

                });

            }


            return Array.from(selected);

        });

    };


    // =========================================================
    // SELECT ALL
    // =========================================================

    const selectAllMenus = () => {

        const ids =
            allMenus
                .filter(
                    (menu) =>
                        menu?.is_active !== false
                )
                .map(
                    (menu) =>
                        String(menu.id)
                );


        setSelectedMenuIds(ids);

    };


    // =========================================================
    // CLEAR ALL
    // =========================================================

    const clearAllMenus = () => {

        setSelectedMenuIds([]);

    };


    // =========================================================
    // IS SELECTED
    // =========================================================

    const isSelected = (menuId) => {

        return selectedMenuIds.includes(
            String(menuId)
        );

    };


    // =========================================================
    // IS PARTIAL
    // =========================================================

    const isPartial = (menu) => {

        if (
            !Array.isArray(menu?.children) ||
            menu.children.length === 0
        ) {

            return false;

        }


        const childIds =
            getDescendantIds(menu);


        if (childIds.length === 0) {

            return false;

        }


        const selectedCount =
            childIds.filter(
                (id) =>
                    selectedMenuIds.includes(
                        String(id)
                    )
            ).length;


        return (
            selectedCount > 0 &&
            selectedCount < childIds.length
        );

    };


    // =========================================================
    // ACTIVE MENU COUNT
    // =========================================================

    const activeMenuCount = useMemo(() => {

        return allMenus.filter(
            (menu) =>
                menu?.is_active !== false
        ).length;

    }, [allMenus]);


    // =========================================================
    // SAVE MENU ACCESS
    // =========================================================

    const handleSaveMenu = async () => {

        if (!selectedUser?.id) {

            setError(
                'Silakan pilih user terlebih dahulu.'
            );

            return;

        }


        setSavingMenu(true);

        setError('');

        setSuccess('');


        try {

            /*
             * PENTING:
             *
             * Sekarang benar-benar memanggil
             * UserMenuService.
             */

            const response =
                await UserMenuService.updateUserMenus(
                    selectedUser.id,
                    selectedMenuIds
                );


            /*
             * Backend bisa mengembalikan:
             *
             * {
             *     success: true,
             *     message: "..."
             * }
             */

            const payload =
                response?.data ?? response;


            if (
                payload?.success === false
            ) {

                throw new Error(
                    payload?.message ||
                    'Gagal menyimpan akses menu.'
                );

            }


            setSuccess(
                payload?.message ||
                'Akses menu berhasil disimpan.'
            );


            /*
             * Setelah save berhasil,
             * reload data dari backend.
             */

            await loadUserMenus(
                selectedUser
            );

        } catch (err) {

            console.error(
                'Gagal menyimpan menu:',
                err
            );


            setError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal menyimpan akses menu.'
            );

        } finally {

            setSavingMenu(false);

        }

    };


    // =========================================================
    // RENDER MENU TREE
    // =========================================================

    const renderMenuTree = (
        menuItems,
        level = 0
    ) => {

        if (
            !Array.isArray(menuItems) ||
            menuItems.length === 0
        ) {

            return null;

        }


        return menuItems.map((menu) => {

            const hasChildren =
                Array.isArray(
                    menu?.children
                ) &&
                menu.children.length > 0;


            const expanded =
                expandedMenus[
                    String(menu.id)
                ] === true;


            const selected =
                isSelected(menu.id);


            const partial =
                isPartial(menu);


            const inactive =
                menu?.is_active === false;


            return (

                <div
                    key={menu.id}
                    className="space-y-1"
                >

                    {/* MENU ROW */}

                    <div
                        className={`
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            px-3
                            py-2.5
                            transition-all

                            ${
                                selected
                                    ? 'border-blue-200 bg-blue-50'
                                    : partial
                                        ? 'border-blue-100 bg-blue-50/40'
                                        : 'border-slate-100 bg-white'
                            }

                            ${
                                inactive
                                    ? 'opacity-50'
                                    : 'hover:border-slate-200 hover:bg-slate-50'
                            }
                        `}
                        style={{
                            marginLeft:
                                `${level * 20}px`,
                        }}
                    >

                        {/* EXPAND */}

                        {hasChildren ? (

                            <button
                                type="button"
                                onClick={() =>
                                    toggleExpand(
                                        menu.id
                                    )
                                }
                                className="
                                    flex
                                    h-7
                                    w-7
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                "
                            >

                                {expanded ? (

                                    <ChevronDown
                                        size={15}
                                    />

                                ) : (

                                    <ChevronRight
                                        size={15}
                                    />

                                )}

                            </button>

                        ) : (

                            <div
                                className="
                                    h-7
                                    w-7
                                    shrink-0
                                "
                            />

                        )}


                        {/* CHECKBOX */}

                        <button
                            type="button"
                            disabled={inactive}
                            onClick={() =>
                                toggleMenu(menu)
                            }
                            className="
                                flex
                                h-5
                                w-5
                                shrink-0
                                items-center
                                justify-center
                                rounded-md
                                transition
                                disabled:cursor-not-allowed
                            "
                        >

                            {selected ? (

                                <span className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-md
                                    bg-blue-600
                                    text-white
                                ">

                                    <Check
                                        size={13}
                                        strokeWidth={3}
                                    />

                                </span>

                            ) : partial ? (

                                <span className="
                                    flex
                                    h-5
                                    w-5
                                    items-center
                                    justify-center
                                    rounded-md
                                    bg-blue-100
                                    text-blue-600
                                ">

                                    <span className="
                                        h-0.5
                                        w-2.5
                                        rounded-full
                                        bg-blue-600
                                    " />

                                </span>

                            ) : (

                                <span className="
                                    h-5
                                    w-5
                                    rounded-md
                                    border
                                    border-slate-300
                                    bg-white
                                " />

                            )}

                        </button>


                        {/* ICON */}

                        <div className={`
                            flex
                            h-8
                            w-8
                            shrink-0
                            items-center
                            justify-center
                            rounded-lg

                            ${
                                selected
                                    ? 'bg-blue-100 text-blue-600'
                                    : 'bg-slate-100 text-slate-500'
                            }
                        `}>

                            <MenuIcon
                                size={15}
                            />

                        </div>


                        {/* LABEL */}

                        <button
                            type="button"
                            disabled={inactive}
                            onClick={() =>
                                toggleMenu(menu)
                            }
                            className="
                                min-w-0
                                flex-1
                                text-left
                                disabled:cursor-not-allowed
                            "
                        >

                            <p className={`
                                truncate
                                text-sm
                                font-bold

                                ${
                                    selected
                                        ? 'text-blue-700'
                                        : 'text-slate-700'
                                }
                            `}>

                                {
                                    menu?.label ||
                                    menu?.name ||
                                    '-'
                                }

                            </p>


                            {(menu?.path ||
                                menu?.permission_name) && (

                                <p className="
                                    mt-0.5
                                    truncate
                                    text-[11px]
                                    text-slate-400
                                ">

                                    {
                                        menu?.path ||
                                        menu?.permission_name
                                    }

                                </p>

                            )}

                        </button>


                        {/* STATUS */}

                        {inactive && (

                            <span className="
                                shrink-0
                                rounded-full
                                bg-slate-100
                                px-2
                                py-1
                                text-[10px]
                                font-bold
                                text-slate-400
                            ">

                                Nonaktif

                            </span>

                        )}

                    </div>


                    {/* CHILDREN */}

                    {hasChildren &&
                        expanded && (

                            <div className="space-y-1">

                                {renderMenuTree(
                                    menu.children,
                                    level + 1
                                )}

                            </div>

                        )}

                </div>

            );

        });

    };


    // =========================================================
    // SELECTED USER
    // =========================================================

    const hasSelectedUser =
        Boolean(selectedUser);


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div className="
            relative
            min-h-[calc(100vh-124px)]
            space-y-5
            pb-[60px]
        ">


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
            ">

                <div>

                    <h1 className="
                        text-2xl
                        font-black
                        tracking-tight
                        text-slate-900
                    ">

                        User Menu

                    </h1>

                    <p className="
                        mt-1
                        text-sm
                        text-slate-500
                    ">

                        Kelola akses menu untuk setiap pengguna.

                    </p>

                </div>


                <button
                    type="button"
                    onClick={loadUsers}
                    disabled={loadingUsers}
                    className="
                        flex
                        items-center
                        justify-center
                        gap-2
                        rounded-xl
                        border
                        border-slate-200
                        bg-white
                        px-3.5
                        py-2.5
                        text-sm
                        font-semibold
                        text-slate-600
                        shadow-sm
                        transition-all
                        hover:bg-slate-50
                        disabled:cursor-not-allowed
                        disabled:opacity-50
                    "
                >

                    <RefreshCw
                        size={15}
                        className={
                            loadingUsers
                                ? 'animate-spin'
                                : ''
                        }
                    />

                    Refresh

                </button>

            </div>


            {/* =================================================
                ALERT
            ================================================= */}

            {success && (

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-emerald-100
                    bg-emerald-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-emerald-700
                ">

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess('')
                        }
                        className="
                            rounded-lg
                            p-1
                            hover:bg-emerald-100
                        "
                    >

                        <X size={15} />

                    </button>

                </div>

            )}


            {error && (

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-rose-100
                    bg-rose-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-rose-600
                ">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                        className="
                            rounded-lg
                            p-1
                            hover:bg-rose-100
                        "
                    >

                        <X size={15} />

                    </button>

                </div>

            )}


            {/* =================================================
                MAIN
            ================================================= */}

            <div className="
                grid
                gap-5
                lg:grid-cols-[320px_minmax(0,1fr)]
            ">


                {/* =================================================
                    USER PANEL
                ================================================= */}

                <div className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                ">

                    <div className="
                        border-b
                        border-slate-100
                        p-4
                    ">

                        <div className="
                            mb-3
                            flex
                            items-center
                            gap-2
                        ">

                            <Users
                                size={17}
                                className="text-blue-600"
                            />

                            <h2 className="
                                text-sm
                                font-black
                                uppercase
                                tracking-wider
                                text-slate-700
                            ">

                                Pengguna

                            </h2>

                        </div>


                        <div className="relative">

                            <Search
                                size={16}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="text"
                                value={userSearch}
                                onChange={(event) =>
                                    setUserSearch(
                                        event.target.value
                                    )
                                }
                                placeholder="Cari pengguna..."
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    py-2.5
                                    pl-9
                                    pr-3
                                    text-sm
                                    outline-none
                                    transition
                                    focus:border-blue-400
                                    focus:bg-white
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />

                        </div>

                    </div>


                    {/* USERS */}

                    <div className="
                        max-h-[calc(100vh-310px)]
                        overflow-y-auto
                        p-2
                    ">

                        {loadingUsers && (

                            <div className="
                                flex
                                items-center
                                justify-center
                                gap-2
                                p-6
                                text-sm
                                text-slate-400
                            ">

                                <RefreshCw
                                    size={17}
                                    className="animate-spin"
                                />

                                Memuat user...

                            </div>

                        )}


                        {!loadingUsers &&
                            filteredUsers.length === 0 && (

                                <div className="
                                    p-6
                                    text-center
                                    text-sm
                                    text-slate-400
                                ">

                                    Tidak ada user.

                                </div>

                            )}


                        {!loadingUsers &&
                            filteredUsers.map((user) => {

                                const active =
                                    selectedUser?.id ===
                                    user.id;


                                return (

                                    <button
                                        key={user.id}
                                        type="button"
                                        onClick={() =>
                                            loadUserMenus(
                                                user
                                            )
                                        }
                                        className={`
                                            mb-1
                                            flex
                                            w-full
                                            items-center
                                            gap-3
                                            rounded-xl
                                            p-3
                                            text-left
                                            transition-all

                                            ${
                                                active
                                                    ? 'bg-blue-50 ring-1 ring-blue-200'
                                                    : 'hover:bg-slate-50'
                                            }
                                        `}
                                    >

                                        <div className={`
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            text-sm
                                            font-black

                                            ${
                                                active
                                                    ? 'bg-blue-100 text-blue-600'
                                                    : 'bg-slate-100 text-slate-500'
                                            }
                                        `}>

                                            {user?.name
                                                ?.charAt(0)
                                                ?.toUpperCase()}

                                        </div>


                                        <div className="min-w-0">

                                            <p className={`
                                                truncate
                                                text-sm
                                                font-bold

                                                ${
                                                    active
                                                        ? 'text-blue-700'
                                                        : 'text-slate-700'
                                                }
                                            `}>

                                                {user?.name}

                                            </p>


                                            <p className="
                                                mt-0.5
                                                truncate
                                                text-xs
                                                text-slate-400
                                            ">

                                                {user?.email}

                                            </p>

                                        </div>

                                    </button>

                                );

                            })}

                    </div>

                </div>


                {/* =================================================
                    MENU PANEL
                ================================================= */}

                <div className="
                    min-w-0
                    overflow-hidden
                    rounded-2xl
                    border
                    border-slate-200
                    bg-white
                    shadow-sm
                ">


                    {!hasSelectedUser ? (

                        <div className="
                            flex
                            min-h-[500px]
                            flex-col
                            items-center
                            justify-center
                            gap-3
                            p-8
                            text-center
                        ">

                            <div className="
                                flex
                                h-14
                                w-14
                                items-center
                                justify-center
                                rounded-2xl
                                bg-blue-50
                                text-blue-600
                            ">

                                <MenuIcon
                                    size={24}
                                />

                            </div>


                            <div>

                                <h2 className="
                                    text-base
                                    font-black
                                    text-slate-800
                                ">

                                    Pilih Pengguna

                                </h2>

                                <p className="
                                    mt-1
                                    text-sm
                                    text-slate-400
                                ">

                                    Pilih user di sebelah kiri
                                    untuk mengatur akses menu.

                                </p>

                            </div>

                        </div>

                    ) : (

                        <>

                            {/* MENU HEADER */}

                            <div className="
                                border-b
                                border-slate-100
                                p-5
                            ">

                                <div className="
                                    flex
                                    flex-col
                                    gap-4
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-violet-50
                                            text-violet-600
                                        ">

                                            <ShieldCheck
                                                size={19}
                                            />

                                        </div>


                                        <div className="min-w-0">

                                            <h2 className="
                                                truncate
                                                text-base
                                                font-black
                                                text-slate-900
                                            ">

                                                {
                                                    selectedUser?.name
                                                }

                                            </h2>


                                            <p className="
                                                truncate
                                                text-xs
                                                text-slate-400
                                            ">

                                                Pengaturan Menu Access

                                            </p>

                                        </div>

                                    </div>


                                    <span className="
                                        rounded-full
                                        bg-blue-50
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-black
                                        text-blue-700
                                    ">

                                        {selectedMenuIds.length}
                                        {' / '}
                                        {activeMenuCount}

                                    </span>

                                </div>


                                {/* MENU SEARCH */}

                                <div className="
                                    relative
                                    mt-4
                                ">

                                    <Search
                                        size={16}
                                        className="
                                            absolute
                                            left-3
                                            top-1/2
                                            -translate-y-1/2
                                            text-slate-400
                                        "
                                    />

                                    <input
                                        type="text"
                                        value={menuSearch}
                                        onChange={(event) =>
                                            setMenuSearch(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Cari menu..."
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            py-2.5
                                            pl-9
                                            pr-3
                                            text-sm
                                            outline-none
                                            transition
                                            focus:border-blue-400
                                            focus:bg-white
                                            focus:ring-2
                                            focus:ring-blue-100
                                        "
                                    />

                                </div>


                                {/* ACTION */}

                                <div className="
                                    mt-3
                                    flex
                                    flex-wrap
                                    items-center
                                    gap-2
                                ">

                                    <button
                                        type="button"
                                        onClick={
                                            selectAllMenus
                                        }
                                        disabled={
                                            loadingMenus ||
                                            allMenus.length === 0
                                        }
                                        className="
                                            rounded-lg
                                            bg-blue-50
                                            px-3
                                            py-2
                                            text-xs
                                            font-bold
                                            text-blue-600
                                            transition
                                            hover:bg-blue-100
                                            disabled:opacity-40
                                        "
                                    >

                                        Pilih Semua

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            clearAllMenus
                                        }
                                        disabled={
                                            loadingMenus ||
                                            selectedMenuIds.length === 0
                                        }
                                        className="
                                            rounded-lg
                                            bg-slate-100
                                            px-3
                                            py-2
                                            text-xs
                                            font-bold
                                            text-slate-600
                                            transition
                                            hover:bg-slate-200
                                            disabled:opacity-40
                                        "
                                    >

                                        Batal Semua

                                    </button>

                                </div>

                            </div>


                            {/* MENU CONTENT */}

                            <div className="
                                min-h-[400px]
                                max-h-[calc(100vh-410px)]
                                overflow-y-auto
                                p-4
                            ">

                                {loadingMenus && (

                                    <div className="
                                        flex
                                        min-h-[350px]
                                        flex-col
                                        items-center
                                        justify-center
                                        gap-3
                                        text-sm
                                        text-slate-400
                                    ">

                                        <RefreshCw
                                            size={24}
                                            className="animate-spin"
                                        />

                                        Memuat menu user...

                                    </div>

                                )}


                                {!loadingMenus &&
                                    filteredMenus.length === 0 && (

                                        <div className="
                                            flex
                                            min-h-[350px]
                                            flex-col
                                            items-center
                                            justify-center
                                            gap-2
                                            text-center
                                        ">

                                            <MenuIcon
                                                size={25}
                                                className="text-slate-300"
                                            />

                                            <p className="
                                                text-sm
                                                font-semibold
                                                text-slate-400
                                            ">

                                                Tidak ada menu.

                                            </p>

                                        </div>

                                    )}


                                {!loadingMenus &&
                                    filteredMenus.length > 0 && (

                                        <div className="
                                            space-y-1
                                        ">

                                            {renderMenuTree(
                                                filteredMenus
                                            )}

                                        </div>

                                    )}

                            </div>


                            {/* FOOTER */}

                            <div className="
                                flex
                                flex-col-reverse
                                gap-3
                                border-t
                                border-slate-100
                                p-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                            ">

                                <div className="
                                    text-xs
                                    text-slate-400
                                ">

                                    {selectedMenuIds.length}
                                    {' '}
                                    menu dipilih

                                </div>


                                <div className="
                                    flex
                                    items-center
                                    justify-end
                                    gap-2
                                ">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            selectedUser &&
                                            loadUserMenus(
                                                selectedUser
                                            )
                                        }
                                        disabled={
                                            loadingMenus ||
                                            savingMenu
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-4
                                            py-2.5
                                            text-sm
                                            font-bold
                                            text-slate-600
                                            transition
                                            hover:bg-slate-50
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >

                                        <RefreshCw
                                            size={15}
                                            className={
                                                loadingMenus
                                                    ? 'animate-spin'
                                                    : ''
                                            }
                                        />

                                        Reset

                                    </button>


                                    <button
                                        type="button"
                                        onClick={
                                            handleSaveMenu
                                        }
                                        disabled={
                                            savingMenu ||
                                            loadingMenus
                                        }
                                        className="
                                            flex
                                            items-center
                                            gap-2
                                            rounded-xl
                                            bg-purple-600
                                            px-4
                                            py-2.5
                                            text-sm
                                            font-bold
                                            text-white
                                            shadow-sm
                                            transition
                                            hover:bg-purple-700
                                            disabled:cursor-not-allowed
                                            disabled:opacity-50
                                        "
                                    >

                                        {savingMenu ? (

                                            <>

                                                <RefreshCw
                                                    size={15}
                                                    className="
                                                        animate-spin
                                                    "
                                                />

                                                Menyimpan...

                                            </>

                                        ) : (

                                            <>

                                                <Save
                                                    size={15}
                                                />

                                                Save Menu Access

                                            </>

                                        )}

                                    </button>

                                </div>

                            </div>

                        </>

                    )}

                </div>

            </div>

        </div>

    );

}