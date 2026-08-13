import React, { useEffect, useMemo, useState } from 'react';

import {
    Plus,
    Edit,
    Trash2,
    Folder,
    FileText,
    Search,
    X,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Menu as MenuIcon,
    ShieldCheck,
    GripVertical,
} from 'lucide-react';

import {
    menuService,
} from '@Modules/System/Resources/js/aplikasi/services/menuService.js';

import {
    DynamicIcon,
} from '@Modules/System/Resources/js/aplikasi/templates/layouts/DynamicIcon.jsx';


// ============================================================
// SUKUN CORPORATE COLORS
// ============================================================

const COLORS = {
    navy: '#243A70',
    navyDark: '#1D315F',

    blue: '#4B8DF5',
    blueHover: '#397BE8',
    blueSoft: '#EAF1FF',
    blueSoft2: '#DCE9FF',

    orange: '#FF9D00',
    orangeHover: '#E58D00',
    orangeSoft: '#FFF4DE',

    green: '#009B6A',
    greenSoft: '#E8F7F1',

    red: '#C0392B',
    redSoft: '#FFF1F1',

    background: '#F3F4F6',
    border: '#D9DEE8',
};


// ============================================================
// ICON OPTIONS
// ============================================================

const ICON_OPTIONS = [
    // Layout & Dashboard
    { name: 'LayoutDashboard', label: 'Dashboard' },
    { name: 'LayoutGrid', label: 'Layout Grid' },
    { name: 'AppWindow', label: 'App Window' },
    { name: 'Columns', label: 'Columns' },
    { name: 'Grid', label: 'Grid' },
    { name: 'Layers', label: 'Layers' },

    // User & Security
    { name: 'Users', label: 'Users' },
    { name: 'User', label: 'User' },
    { name: 'UserCheck', label: 'User Check' },
    { name: 'UserPlus', label: 'User Plus' },
    { name: 'UserX', label: 'User X' },
    { name: 'Shield', label: 'Shield' },
    { name: 'ShieldCheck', label: 'Shield Check' },
    { name: 'Lock', label: 'Lock' },
    { name: 'Unlock', label: 'Unlock' },
    { name: 'Key', label: 'Key' },
    { name: 'Fingerprint', label: 'Fingerprint' },

    // Files & Storage
    { name: 'Folder', label: 'Folder' },
    { name: 'FolderOpen', label: 'Folder Open' },
    { name: 'FolderPlus', label: 'Folder Plus' },
    { name: 'FileText', label: 'File Text' },
    { name: 'File', label: 'File' },
    { name: 'Database', label: 'Database' },
    { name: 'Server', label: 'Server' },
    { name: 'HardDrive', label: 'Hard Drive' },
    { name: 'Archive', label: 'Archive' },
    { name: 'Box', label: 'Box' },
    { name: 'Package', label: 'Package' },

    // Settings & System
    { name: 'Settings', label: 'Settings' },
    { name: 'Sliders', label: 'Sliders' },
    { name: 'Wrench', label: 'Wrench' },
    { name: 'Cpu', label: 'CPU' },
    { name: 'Terminal', label: 'Terminal' },
    { name: 'Activity', label: 'Activity' },
    { name: 'Power', label: 'Power' },
    { name: 'RefreshCw', label: 'Refresh' },

    // Analytics & Finance
    { name: 'BarChart', label: 'Bar Chart' },
    { name: 'BarChart2', label: 'Bar Chart 2' },
    { name: 'PieChart', label: 'Pie Chart' },
    { name: 'TrendingUp', label: 'Trending Up' },
    { name: 'LineChart', label: 'Line Chart' },
    { name: 'Wallet', label: 'Wallet' },
    { name: 'CreditCard', label: 'Credit Card' },
    { name: 'DollarSign', label: 'Dollar Sign' },
    { name: 'ShoppingBag', label: 'Shopping Bag' },
    { name: 'ShoppingCart', label: 'Shopping Cart' },

    // Communication
    { name: 'Mail', label: 'Mail' },
    { name: 'MessageSquare', label: 'Message Square' },
    { name: 'Bell', label: 'Bell' },
    { name: 'Send', label: 'Send' },
    { name: 'Globe', label: 'Globe' },

    // Time
    { name: 'Calendar', label: 'Calendar' },
    { name: 'Clock', label: 'Clock' },
    { name: 'History', label: 'History' },

    // Business
    { name: 'Briefcase', label: 'Briefcase' },
    { name: 'Building', label: 'Building' },
    { name: 'Award', label: 'Award' },
    { name: 'Bookmark', label: 'Bookmark' },
    { name: 'BookOpen', label: 'Book Open' },
    { name: 'Flag', label: 'Flag' },
    { name: 'Target', label: 'Target' },
    { name: 'Image', label: 'Image' },
    { name: 'Video', label: 'Video' },
    { name: 'Truck', label: 'Truck' },

    // General
    { name: 'Home', label: 'Home' },
    { name: 'Search', label: 'Search' },
    { name: 'Trash', label: 'Trash' },
    { name: 'Trash2', label: 'Trash Modern' },
    { name: 'Filter', label: 'Filter' },
    { name: 'List', label: 'List' },
];


// ============================================================
// DEFAULT FORM
// ============================================================

const DEFAULT_FORM = {
    label: '',
    path: '',
    icon: '',
    permission_name: '',
    parent_id: '',
    order: 0,
    is_active: true,
};


// ============================================================
// COMPONENT
// ============================================================

export default function MenuManagement() {

    // ========================================================
    // STATE
    // ========================================================

    const [menus, setMenus] = useState([]);

    const [loading, setLoading] = useState(true);

    const [isModalOpen, setIsModalOpen] = useState(false);

    const [currentMenu, setCurrentMenu] = useState(null);

    const [formData, setFormData] = useState({
        ...DEFAULT_FORM,
    });

    const [search, setSearch] = useState('');

    const [expandedMenus, setExpandedMenus] = useState({});


    // ========================================================
    // LOAD DATA
    // ========================================================

    useEffect(() => {
        fetchMenus();
    }, []);


    const fetchMenus = async () => {

        try {

            setLoading(true);

            const data = await menuService.getMenus();

            setMenus(
                Array.isArray(data)
                    ? data
                    : []
            );

        } catch (error) {

            console.error(
                'Gagal memuat menu:',
                error
            );

        } finally {

            setLoading(false);

        }
    };


    // ========================================================
    // FLATTEN MENU
    // ========================================================

    const flattenMenus = (
        menuList,
        excludeIds = []
    ) => {

        let result = [];

        for (const menu of menuList || []) {

            if (
                excludeIds.includes(menu.id)
            ) {
                continue;
            }

            result.push(menu);

            if (
                menu.children &&
                menu.children.length > 0
            ) {

                result = result.concat(
                    flattenMenus(
                        menu.children,
                        excludeIds
                    )
                );

            }
        }

        return result;
    };


    // ========================================================
    // COLLECT DESCENDANTS
    // ========================================================

    const collectDescendantIds = (
        menu,
        result = []
    ) => {

        if (
            !menu ||
            !menu.children ||
            menu.children.length === 0
        ) {
            return result;
        }

        for (
            const child
            of menu.children
        ) {

            result.push(
                child.id
            );

            collectDescendantIds(
                child,
                result
            );
        }

        return result;
    };


    // ========================================================
    // AVAILABLE PARENT MENUS
    // ========================================================

    const availableParentMenus =
        useMemo(() => {

            if (!currentMenu) {

                return flattenMenus(
                    menus
                );

            }

            const excludeIds = [
                currentMenu.id,
                ...collectDescendantIds(
                    currentMenu
                ),
            ];

            return flattenMenus(
                menus,
                excludeIds
            );

        }, [
            menus,
            currentMenu,
        ]);


    // ========================================================
    // SEARCH
    // ========================================================

    const filteredMenus =
        useMemo(() => {

            if (!search.trim()) {

                return menus;

            }

            const keyword =
                search
                    .toLowerCase()
                    .trim();


            const filterRecursive =
                (items) => {

                    return (
                        items || []
                    )
                        .map((menu) => {

                            const children =
                                filterRecursive(
                                    menu.children
                                );

                            const matched =
                                menu.label
                                    ?.toLowerCase()
                                    .includes(
                                        keyword
                                    ) ||

                                menu.path
                                    ?.toLowerCase()
                                    .includes(
                                        keyword
                                    ) ||

                                menu.permission_name
                                    ?.toLowerCase()
                                    .includes(
                                        keyword
                                    );


                            if (
                                matched ||
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


            return filterRecursive(
                menus
            );

        }, [
            menus,
            search,
        ]);


    // ========================================================
    // OPEN MODAL
    // ========================================================

    const handleOpenModal = (
        menu = null
    ) => {

        if (menu) {

            setCurrentMenu(
                menu
            );

            setFormData({
                label:
                    menu.label || '',

                path:
                    menu.path || '',

                icon:
                    menu.icon || '',

                permission_name:
                    menu.permission_name || '',

                parent_id:
                    menu.parent_id ?? '',

                order:
                    menu.order ?? 0,

                is_active:
                    menu.is_active ?? true,
            });

        } else {

            setCurrentMenu(
                null
            );

            setFormData({
                ...DEFAULT_FORM,
            });

        }

        setIsModalOpen(
            true
        );
    };


    // ========================================================
    // CLOSE MODAL
    // ========================================================

    const handleCloseModal = () => {

        setIsModalOpen(
            false
        );

        setCurrentMenu(
            null
        );

        setFormData({
            ...DEFAULT_FORM,
        });

    };


    // ========================================================
    // SUBMIT
    // ========================================================

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();

        try {

            const payload = {

                ...formData,

                parent_id:
                    formData.parent_id === ''
                        ? null
                        : formData.parent_id,

            };


            if (currentMenu) {

                await menuService.updateMenu(
                    currentMenu.id,
                    payload
                );

            } else {

                await menuService.createMenu(
                    payload
                );

            }


            handleCloseModal();

            await fetchMenus();

        } catch (error) {

            console.error(
                'Gagal menyimpan menu:',
                error
            );

            alert(
                error?.response?.data?.message ||
                'Terjadi kesalahan saat menyimpan data.'
            );

        }
    };


    // ========================================================
    // DELETE
    // ========================================================

    const handleDelete = async (
        menu
    ) => {

        const hasChildren =
            menu.children &&
            menu.children.length > 0;


        const message =
            hasChildren

                ? `Menu "${menu.label}" memiliki submenu. Apakah Anda yakin ingin menghapusnya?`

                : `Apakah Anda yakin ingin menghapus menu "${menu.label}"?`;


        if (
            !window.confirm(
                message
            )
        ) {

            return;

        }


        try {

            await menuService.deleteMenu(
                menu.id
            );

            await fetchMenus();

        } catch (error) {

            console.error(
                'Gagal menghapus menu:',
                error
            );

            alert(
                error?.response?.data?.message ||
                'Terjadi kesalahan saat menghapus menu.'
            );

        }
    };


    // ========================================================
    // EXPAND / COLLAPSE
    // ========================================================

    const toggleExpanded = (
        id
    ) => {

        setExpandedMenus(
            (prev) => ({
                ...prev,
                [id]:
                    !prev[id],
            })
        );

    };


    // ========================================================
    // EXPAND ALL
    // ========================================================

    const expandAll = () => {

        const state = {};

        const recursive = (
            items
        ) => {

            for (
                const menu
                of items || []
            ) {

                if (
                    menu.children?.length
                ) {

                    state[
                        menu.id
                    ] = true;

                    recursive(
                        menu.children
                    );

                }
            }
        };

        recursive(
            menus
        );

        setExpandedMenus(
            state
        );
    };


    // ========================================================
    // COLLAPSE ALL
    // ========================================================

    const collapseAll = () => {

        setExpandedMenus({});

    };


    // ========================================================
    // MOBILE MENU CARD
    // ========================================================

    const renderMobileMenu = (
        menu,
        level = 0
    ) => {

        const hasChildren =
            menu.children?.length > 0;

        const expanded =
            expandedMenus[
                menu.id
            ];


        return (

            <div
                key={menu.id}
                className="relative"
            >

                {/* ==================================================
                    CARD
                ================================================== */}

                <div
                    className={`
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#D9DEE8]
                        bg-white
                        shadow-sm
                        transition
                        hover:shadow-md
                        ${
                            level > 0
                                ? 'bg-slate-50/80'
                                : ''
                        }
                    `}
                >

                    <div className="p-4">

                        {/* ==================================================
                            HEADER CARD
                        ================================================== */}

                        <div className="flex items-start gap-3">

                            {/* ICON */}

                            <div
                                className={`
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    ${
                                        level === 0
                                            ? 'bg-[#EAF1FF] text-[#243A70]'
                                            : 'bg-slate-100 text-slate-500'
                                    }
                                `}
                            >

                                <DynamicIcon
                                    name={
                                        menu.icon
                                    }
                                    size={21}
                                />

                            </div>


                            {/* INFORMATION */}

                            <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                    <div className="min-w-0">

                                        <h3 className="truncate text-sm font-bold text-[#243A70]">

                                            {menu.label}

                                        </h3>


                                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">

                                            {
                                                menu.path ||
                                                'Tanpa URL'
                                            }

                                        </p>

                                    </div>


                                    {/* STATUS */}

                                    <span
                                        className={`
                                            shrink-0
                                            rounded-full
                                            px-2.5
                                            py-1
                                            text-[10px]
                                            font-bold
                                            ${
                                                menu.is_active

                                                    ? 'bg-[#E8F7F1] text-[#009B6A]'

                                                    : 'bg-[#FFF1F1] text-[#C0392B]'
                                            }
                                        `}
                                    >

                                        {
                                            menu.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'
                                        }

                                    </span>

                                </div>


                                {/* META */}

                                <div className="mt-3 flex flex-wrap gap-1.5">

                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">

                                        {menu.permission_name || 'Public'}

                                    </span>


                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">

                                        Order {menu.order}

                                    </span>


                                    {menu.icon && (

                                        <span className="rounded-lg bg-[#EAF1FF] px-2 py-1 font-mono text-[10px] font-medium text-[#243A70]">

                                            {menu.icon}

                                        </span>

                                    )}

                                </div>

                            </div>

                        </div>


                        {/* ==================================================
                            ACTION BAR
                        ================================================== */}

                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                            {hasChildren ? (

                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleExpanded(
                                            menu.id
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        px-2.5
                                        py-1.5
                                        text-xs
                                        font-semibold
                                        text-[#243A70]
                                        transition
                                        hover:bg-[#EAF1FF]
                                    "
                                >

                                    {
                                        expanded
                                            ? <ChevronDown size={15} />
                                            : <ChevronRight size={15} />
                                    }

                                    {menu.children.length}

                                    <span>
                                        Submenu
                                    </span>

                                </button>

                            ) : (

                                <span className="flex items-center gap-1.5 text-[11px] text-slate-400">

                                    <FileText
                                        size={13}
                                    />

                                    Menu

                                </span>

                            )}


                            {/* ACTIONS */}

                            <div className="flex gap-1.5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenModal(
                                            menu
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        bg-[#EAF1FF]
                                        px-3
                                        py-2
                                        text-xs
                                        font-bold
                                        text-[#243A70]
                                        transition
                                        hover:bg-[#DCE9FF]
                                    "
                                >

                                    <Edit
                                        size={14}
                                    />

                                    Edit

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            menu
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-lg
                                        bg-red-50
                                        px-3
                                        py-2
                                        text-xs
                                        font-bold
                                        text-red-600
                                        transition
                                        hover:bg-red-100
                                    "
                                >

                                    <Trash2
                                        size={14}
                                    />

                                    Hapus

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    CHILDREN
                ================================================== */}

                {hasChildren &&
                    expanded && (

                        <div className="ml-4 mt-2 space-y-2 border-l-2 border-[#D9DEE8] pl-3">

                            {menu.children.map(
                                (child) =>
                                    renderMobileMenu(
                                        child,
                                        level + 1
                                    )
                            )}

                        </div>

                    )}

            </div>

        );
    };


    // ========================================================
    // DESKTOP TABLE
    // ========================================================

    const renderDesktopRows = (
        items,
        level = 0
    ) => {

        return (
            items || []
        ).flatMap(
            (menu) => {

                const rows = [

                    <tr
                        key={`menu-${menu.id}`}
                        className="
                            group
                            border-b
                            border-slate-100
                            transition
                            hover:bg-[#F8FAFD]
                        "
                    >

                        {/* MENU */}

                        <td className="px-5 py-3.5">

                            <div
                                className="flex items-center gap-2"
                                style={{
                                    paddingLeft:
                                        `${level * 24}px`,
                                }}
                            >

                                {menu.children?.length > 0 ? (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            toggleExpanded(
                                                menu.id
                                            )
                                        }
                                        className="
                                            rounded-md
                                            p-1
                                            text-slate-400
                                            hover:bg-[#EAF1FF]
                                            hover:text-[#243A70]
                                        "
                                    >

                                        {
                                            expandedMenus[
                                                menu.id
                                            ]

                                                ? (
                                                    <ChevronDown
                                                        size={15}
                                                    />
                                                )

                                                : (
                                                    <ChevronRight
                                                        size={15}
                                                    />
                                                )
                                        }

                                    </button>

                                ) : (

                                    <span className="w-7" />

                                )}


                                <div
                                    className={`
                                        flex
                                        h-8
                                        w-8
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-lg
                                        ${
                                            level === 0

                                                ? 'bg-[#EAF1FF] text-[#243A70]'

                                                : 'bg-slate-100 text-slate-500'
                                        }
                                    `}
                                >

                                    <DynamicIcon
                                        name={
                                            menu.icon
                                        }
                                        size={16}
                                    />

                                </div>


                                <div className="min-w-0">

                                    <div className="truncate font-semibold text-[#243A70]">

                                        {menu.label}

                                    </div>


                                    {level > 0 && (

                                        <div className="text-[10px] text-slate-400">

                                            Submenu

                                        </div>

                                    )}

                                </div>

                            </div>

                        </td>


                        {/* PATH */}

                        <td className="px-5 py-3.5">

                            <span className="font-mono text-xs text-slate-500">

                                {
                                    menu.path ||
                                    '-'
                                }

                            </span>

                        </td>


                        {/* PERMISSION */}

                        <td className="px-5 py-3.5">

                            <span className="rounded-lg bg-slate-100 px-2 py-1 font-mono text-[10px] text-slate-600">

                                {
                                    menu.permission_name ||
                                    'Public'
                                }

                            </span>

                        </td>


                        {/* ORDER */}

                        <td className="px-5 py-3.5 text-center">

                            <span className="text-sm font-semibold text-slate-500">

                                {menu.order}

                            </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-3.5">

                            <span
                                className={`
                                    inline-flex
                                    rounded-full
                                    px-2.5
                                    py-1
                                    text-[10px]
                                    font-bold
                                    ${
                                        menu.is_active

                                            ? 'bg-[#E8F7F1] text-[#009B6A]'

                                            : 'bg-[#FFF1F1] text-[#C0392B]'
                                    }
                                `}
                            >

                                {
                                    menu.is_active
                                        ? 'Aktif'
                                        : 'Nonaktif'
                                }

                            </span>

                        </td>


                        {/* ACTION */}

                        <td className="px-5 py-3.5">

                            <div className="flex justify-end gap-1 opacity-70 transition group-hover:opacity-100">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenModal(
                                            menu
                                        )
                                    }
                                    className="
                                        rounded-lg
                                        p-2
                                        text-slate-500
                                        transition
                                        hover:bg-[#EAF1FF]
                                        hover:text-[#243A70]
                                    "
                                    title="Edit"
                                >

                                    <Edit
                                        size={16}
                                    />

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDelete(
                                            menu
                                        )
                                    }
                                    className="
                                        rounded-lg
                                        p-2
                                        text-slate-500
                                        transition
                                        hover:bg-red-50
                                        hover:text-red-600
                                    "
                                    title="Hapus"
                                >

                                    <Trash2
                                        size={16}
                                    />

                                </button>

                            </div>

                        </td>

                    </tr>,
                ];


                if (
                    menu.children?.length > 0 &&
                    expandedMenus[
                        menu.id
                    ]
                ) {

                    rows.push(
                        ...renderDesktopRows(
                            menu.children,
                            level + 1
                        )
                    );

                }


                return rows;

            }
        );

    };


    // ========================================================
    // MAIN UI
    // ========================================================

    return (

        <div
            className="
                min-h-full
                bg-[#F3F4F6]
            "
        >

            <div
                className="
                    mx-auto
                    max-w-7xl
                    space-y-4
                    px-3
                    py-4
                    sm:space-y-5
                    sm:px-5
                    sm:py-6
                    lg:px-8
                "
            >

                {/* ==================================================
                    HEADER
                ================================================== */}

                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#D9DEE8]
                        bg-white
                        shadow-sm
                    "
                >

                    {/* BRAND STRIPE */}

                    <div
                        className="
                            h-1
                            w-full
                            bg-gradient-to-r
                            from-[#243A70]
                            via-[#4B8DF5]
                            to-[#FF9D00]
                        "
                    />


                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            p-4
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            sm:p-5
                        "
                    >

                        {/* TITLE */}

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    h-11
                                    w-11
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#243A70]
                                    text-white
                                    shadow-sm
                                "
                            >

                                <MenuIcon
                                    size={21}
                                />

                            </div>


                            <div className="min-w-0">

                                <h1
                                    className="
                                        text-lg
                                        font-bold
                                        tracking-tight
                                        text-[#243A70]
                                        sm:text-xl
                                    "
                                >

                                    Manajemen Menu

                                </h1>


                                <p
                                    className="
                                        mt-0.5
                                        text-xs
                                        text-slate-500
                                        sm:text-sm
                                    "
                                >

                                    Kelola navigasi dan struktur
                                    menu aplikasi.

                                </p>

                            </div>

                        </div>


                        {/* ADD */}

                        <button
                            type="button"
                            onClick={() =>
                                handleOpenModal()
                            }
                            className="
                                flex
                                w-full
                                items-center
                                justify-center
                                gap-2
                                rounded-xl
                                bg-[#243A70]
                                px-4
                                py-2.5
                                text-sm
                                font-bold
                                text-white
                                shadow-sm
                                transition
                                hover:bg-[#1D315F]
                                active:scale-[0.98]
                                sm:w-auto
                            "
                        >

                            <Plus
                                size={18}
                            />

                            Tambah Menu

                        </button>

                    </div>

                </div>


                {/* ==================================================
                    SEARCH + TOOLBAR
                ================================================== */}

                <div
                    className="
                        rounded-2xl
                        border
                        border-[#D9DEE8]
                        bg-white
                        p-3
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-2
                            sm:flex-row
                        "
                    >

                        {/* SEARCH */}

                        <div className="relative flex-1">

                            <Search
                                size={17}
                                className="
                                    absolute
                                    left-3
                                    top-1/2
                                    -translate-y-1/2
                                    text-slate-400
                                "
                            />

                            <input
                                type="search"
                                value={search}
                                onChange={(e) =>
                                    setSearch(
                                        e.target.value
                                    )
                                }
                                placeholder="Cari menu, path, atau permission..."
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    py-2.5
                                    pl-10
                                    pr-10
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-[#4B8DF5]
                                    focus:bg-white
                                    focus:ring-2
                                    focus:ring-[#DCE9FF]
                                "
                            />


                            {search && (

                                <button
                                    type="button"
                                    onClick={() =>
                                        setSearch('')
                                    }
                                    className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        rounded-md
                                        p-1
                                        text-slate-400
                                        hover:bg-slate-100
                                        hover:text-slate-600
                                    "
                                >

                                    <X
                                        size={15}
                                    />

                                </button>

                            )}

                        </div>


                        {/* EXPAND / COLLAPSE */}

                        <div
                            className="
                                flex
                                gap-2
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    expandAll
                                }
                                className="
                                    flex
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-xl
                                    border
                                    border-[#D9DEE8]
                                    px-3
                                    py-2.5
                                    text-xs
                                    font-semibold
                                    text-[#243A70]
                                    transition
                                    hover:bg-[#EAF1FF]
                                    sm:flex-none
                                "
                            >

                                <ChevronDown
                                    size={15}
                                />

                                Buka Semua

                            </button>


                            <button
                                type="button"
                                onClick={
                                    collapseAll
                                }
                                className="
                                    flex
                                    flex-1
                                    items-center
                                    justify-center
                                    gap-1.5
                                    rounded-xl
                                    border
                                    border-[#D9DEE8]
                                    px-3
                                    py-2.5
                                    text-xs
                                    font-semibold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    sm:flex-none
                                "
                            >

                                <ChevronRight
                                    size={15}
                                />

                                Tutup Semua

                            </button>

                        </div>

                    </div>

                </div>


                {/* ==================================================
                    CONTENT
                ================================================== */}

                {loading ? (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-[#D9DEE8]
                            bg-white
                            p-10
                            text-center
                            shadow-sm
                        "
                    >

                        <div
                            className="
                                mx-auto
                                mb-3
                                h-8
                                w-8
                                animate-spin
                                rounded-full
                                border-2
                                border-slate-200
                                border-t-[#243A70]
                            "
                        />

                        <p
                            className="
                                text-sm
                                text-slate-500
                            "
                        >

                            Memuat data menu...

                        </p>

                    </div>

                ) : filteredMenus.length === 0 ? (

                    <div
                        className="
                            rounded-2xl
                            border
                            border-dashed
                            border-[#D9DEE8]
                            bg-white
                            px-5
                            py-14
                            text-center
                        "
                    >

                        <div
                            className="
                                mx-auto
                                flex
                                h-12
                                w-12
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#EAF1FF]
                                text-[#243A70]
                            "
                        >

                            <Search
                                size={22}
                            />

                        </div>


                        <h3
                            className="
                                mt-3
                                text-sm
                                font-bold
                                text-[#243A70]
                            "
                        >

                            Tidak ada menu

                        </h3>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-400
                            "
                        >

                            Tidak ditemukan menu
                            yang sesuai.

                        </p>

                    </div>

                ) : (

                    <>

                        {/* ==================================================
                            MOBILE CARD
                        ================================================== */}

                        <div
                            className="
                                space-y-2.5
                                md:hidden
                            "
                        >

                            {filteredMenus.map(
                                (menu) =>
                                    renderMobileMenu(
                                        menu
                                    )
                            )}

                        </div>


                        {/* ==================================================
                            DESKTOP TABLE
                        ================================================== */}

                        <div
                            className="
                                hidden
                                overflow-hidden
                                rounded-2xl
                                border
                                border-[#D9DEE8]
                                bg-white
                                shadow-sm
                                md:block
                            "
                        >

                            <div
                                className="
                                    overflow-x-auto
                                "
                            >

                                <table
                                    className="
                                        min-w-full
                                    "
                                >

                                    <thead>

                                        <tr
                                            className="
                                                border-b
                                                border-[#D9DEE8]
                                                bg-[#F8FAFD]
                                            "
                                        >

                                            <th
                                                className="
                                                    px-5
                                                    py-3.5
                                                    text-left
                                                    text-[11px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-[#243A70]
                                                "
                                            >

                                                Menu

                                            </th>


                                            <th
                                                className="
                                                    px-5
                                                    py-3.5
                                                    text-left
                                                    text-[11px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-[#243A70]
                                                "
                                            >

                                                Path

                                            </th>


                                            <th
                                                className="
                                                    px-5
                                                    py-3.5
                                                    text-left
                                                    text-[11px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-[#243A70]
                                                "
                                            >

                                                Permission

                                            </th>


                                            <th
                                                className="
                                                    px-5
                                                    py-3.5
                                                    text-center
                                                    text-[11px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-[#243A70]
                                                "
                                            >

                                                Order

                                            </th>


                                            <th
                                                className="
                                                    px-5
                                                    py-3.5
                                                    text-left
                                                    text-[11px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-[#243A70]
                                                "
                                            >

                                                Status

                                            </th>


                                            <th
                                                className="
                                                    px-5
                                                    py-3.5
                                                    text-right
                                                    text-[11px]
                                                    font-bold
                                                    uppercase
                                                    tracking-wider
                                                    text-[#243A70]
                                                "
                                            >

                                                Aksi

                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>

                                        {renderDesktopRows(
                                            filteredMenus
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </div>

                    </>

                )}

            </div>


            {/* ==========================================================
                MODAL
            ========================================================== */}

            {isModalOpen && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-end
                        justify-center
                        bg-slate-950/50
                        p-0
                        backdrop-blur-[2px]
                        sm:items-center
                        sm:p-4
                    "
                >

                    <div
                        className="
                            flex
                            max-h-[94vh]
                            w-full
                            flex-col
                            overflow-hidden
                            rounded-t-3xl
                            bg-white
                            shadow-2xl
                            sm:max-w-xl
                            sm:rounded-2xl
                        "
                    >

                        {/* ==================================================
                            MODAL BRAND STRIPE
                        ================================================== */}

                        <div
                            className="
                                h-1
                                w-full
                                bg-gradient-to-r
                                from-[#243A70]
                                via-[#4B8DF5]
                                to-[#FF9D00]
                            "
                        />


                        {/* ==================================================
                            MODAL HEADER
                        ================================================== */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-[#D9DEE8]
                                px-5
                                py-4
                            "
                        >

                            <div>

                                <div
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            h-8
                                            w-8
                                            items-center
                                            justify-center
                                            rounded-lg
                                            bg-[#EAF1FF]
                                            text-[#243A70]
                                        "
                                    >

                                        <MenuIcon
                                            size={16}
                                        />

                                    </div>


                                    <h2
                                        className="
                                            text-base
                                            font-bold
                                            text-[#243A70]
                                            sm:text-lg
                                        "
                                    >

                                        {
                                            currentMenu
                                                ? 'Edit Menu'
                                                : 'Tambah Menu'
                                        }

                                    </h2>

                                </div>


                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        text-slate-400
                                    "
                                >

                                    Atur informasi,
                                    struktur, dan akses menu.

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseModal
                                }
                                className="
                                    rounded-xl
                                    p-2
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                "
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>


                        {/* ==================================================
                            FORM
                        ================================================== */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="
                                flex
                                min-h-0
                                flex-1
                                flex-col
                            "
                        >

                            <div
                                className="
                                    space-y-6
                                    overflow-y-auto
                                    px-5
                                    py-5
                                "
                            >

                                {/* ==================================================
                                    INFORMASI
                                ================================================== */}

                                <section>

                                    <div
                                        className="
                                            mb-4
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <div
                                            className="
                                                h-5
                                                w-1
                                                rounded-full
                                                bg-[#4B8DF5]
                                            "
                                        />

                                        <h3
                                            className="
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-[#243A70]
                                            "
                                        >

                                            Informasi Menu

                                        </h3>

                                    </div>


                                    <div
                                        className="
                                            space-y-4
                                        "
                                    >

                                        {/* LABEL */}

                                        <div>

                                            <label
                                                className="
                                                    mb-1.5
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >

                                                Label Menu

                                            </label>


                                            <input
                                                type="text"
                                                value={
                                                    formData.label
                                                }
                                                onChange={
                                                    (e) =>
                                                        setFormData({
                                                            ...formData,
                                                            label:
                                                                e.target.value,
                                                        })
                                                }
                                                required
                                                placeholder="Contoh: Manajemen Karyawan"
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-3.5
                                                    py-2.5
                                                    text-sm
                                                    text-slate-700
                                                    outline-none
                                                    transition
                                                    placeholder:text-slate-400
                                                    focus:border-[#4B8DF5]
                                                    focus:bg-white
                                                    focus:ring-2
                                                    focus:ring-[#DCE9FF]
                                                "
                                            />

                                        </div>


                                        {/* PARENT */}

                                        <div>

                                            <label
                                                className="
                                                    mb-1.5
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >

                                                Parent Menu

                                            </label>


                                            <select
                                                value={
                                                    formData.parent_id
                                                }
                                                onChange={
                                                    (e) =>
                                                        setFormData({
                                                            ...formData,
                                                            parent_id:
                                                                e.target.value,
                                                        })
                                                }
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-3.5
                                                    py-2.5
                                                    text-sm
                                                    text-slate-700
                                                    outline-none
                                                    transition
                                                    focus:border-[#4B8DF5]
                                                    focus:bg-white
                                                    focus:ring-2
                                                    focus:ring-[#DCE9FF]
                                                "
                                            >

                                                <option value="">
                                                    Menu Utama
                                                </option>


                                                {availableParentMenus.map(
                                                    (menu) => (

                                                        <option
                                                            key={
                                                                menu.id
                                                            }
                                                            value={
                                                                menu.id
                                                            }
                                                        >

                                                            {
                                                                menu.label
                                                            }

                                                        </option>

                                                    )
                                                )}

                                            </select>


                                            <p
                                                className="
                                                    mt-1.5
                                                    text-[11px]
                                                    text-slate-400
                                                "
                                            >

                                                Kosongkan jika
                                                menu berada di
                                                level utama.

                                            </p>

                                        </div>


                                        {/* PATH */}

                                        <div>

                                            <label
                                                className="
                                                    mb-1.5
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >

                                                Path / URL

                                            </label>


                                            <div
                                                className="
                                                    relative
                                                "
                                            >

                                                <ExternalLink
                                                    size={15}
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
                                                    value={
                                                        formData.path
                                                    }
                                                    onChange={
                                                        (e) =>
                                                            setFormData({
                                                                ...formData,
                                                                path:
                                                                    e.target.value,
                                                            })
                                                    }
                                                    placeholder="/app/users"
                                                    className="
                                                        w-full
                                                        rounded-xl
                                                        border
                                                        border-slate-200
                                                        bg-slate-50
                                                        py-2.5
                                                        pl-9
                                                        pr-3.5
                                                        font-mono
                                                        text-sm
                                                        text-slate-700
                                                        outline-none
                                                        transition
                                                        placeholder:text-slate-400
                                                        focus:border-[#4B8DF5]
                                                        focus:bg-white
                                                        focus:ring-2
                                                        focus:ring-[#DCE9FF]
                                                    "
                                                />

                                            </div>

                                        </div>

                                    </div>

                                </section>


                                {/* ==================================================
                                    TAMPILAN
                                ================================================== */}

                                <section
                                    className="
                                        border-t
                                        border-slate-100
                                        pt-5
                                    "
                                >

                                    <div
                                        className="
                                            mb-4
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <div
                                            className="
                                                h-5
                                                w-1
                                                rounded-full
                                                bg-[#FF9D00]
                                            "
                                        />

                                        <h3
                                            className="
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-[#243A70]
                                            "
                                        >

                                            Tampilan

                                        </h3>

                                    </div>


                                    <div>

                                        <label
                                            className="
                                                mb-1.5
                                                block
                                                text-xs
                                                font-semibold
                                                text-slate-700
                                            "
                                        >

                                            Ikon Menu

                                        </label>


                                        <div
                                            className="
                                                flex
                                                gap-2
                                            "
                                        >

                                            <select
                                                value={
                                                    formData.icon
                                                }
                                                onChange={
                                                    (e) =>
                                                        setFormData({
                                                            ...formData,
                                                            icon:
                                                                e.target.value,
                                                        })
                                                }
                                                className="
                                                    min-w-0
                                                    flex-1
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-3.5
                                                    py-2.5
                                                    text-sm
                                                    text-slate-700
                                                    outline-none
                                                    transition
                                                    focus:border-[#4B8DF5]
                                                    focus:bg-white
                                                    focus:ring-2
                                                    focus:ring-[#DCE9FF]
                                                "
                                            >

                                                <option value="">
                                                    Pilih ikon
                                                </option>


                                                {ICON_OPTIONS.map(
                                                    ({
                                                        name,
                                                        label,
                                                    }) => (

                                                        <option
                                                            key={
                                                                name
                                                            }
                                                            value={
                                                                name
                                                            }
                                                        >

                                                            {label}

                                                        </option>

                                                    )
                                                )}

                                            </select>


                                            {/* ICON PREVIEW */}

                                            <div
                                                className="
                                                    flex
                                                    h-11
                                                    w-11
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    border
                                                    border-[#D9DEE8]
                                                    bg-[#EAF1FF]
                                                    text-[#243A70]
                                                "
                                            >

                                                <DynamicIcon
                                                    name={
                                                        formData.icon
                                                    }
                                                    size={21}
                                                />

                                            </div>

                                        </div>

                                    </div>

                                </section>


                                {/* ==================================================
                                    PENGATURAN
                                ================================================== */}

                                <section
                                    className="
                                        border-t
                                        border-slate-100
                                        pt-5
                                    "
                                >

                                    <div
                                        className="
                                            mb-4
                                            flex
                                            items-center
                                            gap-2
                                        "
                                    >

                                        <div
                                            className="
                                                h-5
                                                w-1
                                                rounded-full
                                                bg-[#009B6A]
                                            "
                                        />

                                        <h3
                                            className="
                                                text-xs
                                                font-bold
                                                uppercase
                                                tracking-wider
                                                text-[#243A70]
                                            "
                                        >

                                            Pengaturan

                                        </h3>

                                    </div>


                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-4
                                            sm:grid-cols-2
                                        "
                                    >

                                        {/* ORDER */}

                                        <div>

                                            <label
                                                className="
                                                    mb-1.5
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >

                                                Urutan

                                            </label>


                                            <div
                                                className="
                                                    relative
                                                "
                                            >

                                                <GripVertical
                                                    size={15}
                                                    className="
                                                        absolute
                                                        left-3
                                                        top-1/2
                                                        -translate-y-1/2
                                                        text-slate-400
                                                    "
                                                />


                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={
                                                        formData.order
                                                    }
                                                    onChange={
                                                        (e) =>
                                                            setFormData({
                                                                ...formData,
                                                                order:
                                                                    parseInt(
                                                                        e.target.value,
                                                                        10
                                                                    ) || 0,
                                                            })
                                                    }
                                                    className="
                                                        w-full
                                                        rounded-xl
                                                        border
                                                        border-slate-200
                                                        bg-slate-50
                                                        py-2.5
                                                        pl-9
                                                        pr-3.5
                                                        text-sm
                                                        text-slate-700
                                                        outline-none
                                                        transition
                                                        focus:border-[#4B8DF5]
                                                        focus:bg-white
                                                        focus:ring-2
                                                        focus:ring-[#DCE9FF]
                                                    "
                                                />

                                            </div>

                                        </div>


                                        {/* STATUS */}

                                        <div>

                                            <label
                                                className="
                                                    mb-1.5
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >

                                                Status

                                            </label>


                                            <select
                                                value={
                                                    formData.is_active
                                                        ? 'true'
                                                        : 'false'
                                                }
                                                onChange={
                                                    (e) =>
                                                        setFormData({
                                                            ...formData,
                                                            is_active:
                                                                e.target.value ===
                                                                'true',
                                                        })
                                                }
                                                className="
                                                    w-full
                                                    rounded-xl
                                                    border
                                                    border-slate-200
                                                    bg-slate-50
                                                    px-3.5
                                                    py-2.5
                                                    text-sm
                                                    text-slate-700
                                                    outline-none
                                                    transition
                                                    focus:border-[#4B8DF5]
                                                    focus:bg-white
                                                    focus:ring-2
                                                    focus:ring-[#DCE9FF]
                                                "
                                            >

                                                <option value="true">
                                                    Aktif
                                                </option>

                                                <option value="false">
                                                    Nonaktif
                                                </option>

                                            </select>

                                        </div>


                                        {/* PERMISSION */}

                                        <div
                                            className="
                                                sm:col-span-2
                                            "
                                        >

                                            <label
                                                className="
                                                    mb-1.5
                                                    block
                                                    text-xs
                                                    font-semibold
                                                    text-slate-700
                                                "
                                            >

                                                Permission Name

                                            </label>


                                            <div
                                                className="
                                                    relative
                                                "
                                            >

                                                <ShieldCheck
                                                    size={15}
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
                                                    value={
                                                        formData.permission_name
                                                    }
                                                    onChange={
                                                        (e) =>
                                                            setFormData({
                                                                ...formData,
                                                                permission_name:
                                                                    e.target.value,
                                                            })
                                                    }
                                                    placeholder="Contoh: view-users"
                                                    className="
                                                        w-full
                                                        rounded-xl
                                                        border
                                                        border-slate-200
                                                        bg-slate-50
                                                        py-2.5
                                                        pl-9
                                                        pr-3.5
                                                        font-mono
                                                        text-sm
                                                        text-slate-700
                                                        outline-none
                                                        transition
                                                        placeholder:text-slate-400
                                                        focus:border-[#4B8DF5]
                                                        focus:bg-white
                                                        focus:ring-2
                                                        focus:ring-[#DCE9FF]
                                                    "
                                                />

                                            </div>

                                        </div>

                                    </div>

                                </section>

                            </div>


                            {/* ==================================================
                                MODAL FOOTER
                            ================================================== */}

                            <div
                                className="
                                    border-t
                                    border-[#D9DEE8]
                                    bg-white
                                    px-5
                                    py-3.5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        flex-col-reverse
                                        gap-2
                                        sm:flex-row
                                        sm:justify-end
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            handleCloseModal
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-4
                                            py-2.5
                                            text-sm
                                            font-semibold
                                            text-slate-600
                                            transition
                                            hover:bg-slate-50
                                            sm:w-auto
                                        "
                                    >

                                        Batal

                                    </button>


                                    <button
                                        type="submit"
                                        className="
                                            w-full
                                            rounded-xl
                                            bg-[#243A70]
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-bold
                                            text-white
                                            shadow-sm
                                            transition
                                            hover:bg-[#1D315F]
                                            active:scale-[0.98]
                                            sm:w-auto
                                        "
                                    >

                                        {
                                            currentMenu
                                                ? 'Simpan Perubahan'
                                                : 'Simpan Menu'
                                        }

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