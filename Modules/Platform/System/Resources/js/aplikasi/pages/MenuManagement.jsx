import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Plus,
    Edit,
    Trash2,
    FileText,
    Search,
    X,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    Menu as MenuIcon,
    ShieldCheck,
    GripVertical,
    KeyRound,
    AlertCircle,
    RefreshCw,
} from 'lucide-react';

import {
    menuService,
} from '@Modules/Platform/System/Resources/js/aplikasi/services/menuService.js';

import organizationUnitService from
    '@Modules/Platform/RBAC/Resources/js/aplikasi/services/organizationUnitService';

import {
    DynamicIcon,
} from '@Modules/Platform/Dashboard/Resources/js/aplikasi/templates/layouts/DynamicIcon.jsx';


/*
|--------------------------------------------------------------------------
| DEFAULT FORM
|--------------------------------------------------------------------------
*/

const DEFAULT_FORM = {
    label: '',
    path: '',
    icon: '',
    organization_unit_name: '',
    permission_name: '',
    parent_id: '',
    order: 0,
    is_active: true,
};


/*
|--------------------------------------------------------------------------
| PERMISSION OPTIONS
|--------------------------------------------------------------------------
|
| Permission adalah fungsi yang dapat dilakukan user
| pada area/menu tersebut.
|
*/

const PERMISSION_GROUPS = [
    {
        group: 'PLAN',
        items: [
            {
                value: 'plan.view',
                label: 'Plan - View',
            },
            {
                value: 'plan.create',
                label: 'Plan - Create',
            },
            {
                value: 'plan.edit',
                label: 'Plan - Edit',
            },
            {
                value: 'plan.delete',
                label: 'Plan - Delete',
            },
        ],
    },

    {
        group: 'DO',
        items: [
            {
                value: 'do.view',
                label: 'Do - View',
            },
            {
                value: 'do.create',
                label: 'Do - Create',
            },
            {
                value: 'do.edit',
                label: 'Do - Edit',
            },
            {
                value: 'do.delete',
                label: 'Do - Delete',
            },
        ],
    },

    {
        group: 'CHECK',
        items: [
            {
                value: 'check.view',
                label: 'Check - View',
            },
            {
                value: 'check.create',
                label: 'Check - Create',
            },
            {
                value: 'check.edit',
                label: 'Check - Edit',
            },
            {
                value: 'check.delete',
                label: 'Check - Delete',
            },
        ],
    },

    {
        group: 'ACTION',
        items: [
            {
                value: 'action.view',
                label: 'Action - View',
            },
            {
                value: 'action.create',
                label: 'Action - Create',
            },
            {
                value: 'action.edit',
                label: 'Action - Edit',
            },
            {
                value: 'action.delete',
                label: 'Action - Delete',
            },
        ],
    },
];


/*
|--------------------------------------------------------------------------
| ICON OPTIONS
|--------------------------------------------------------------------------
*/

const ICON_OPTIONS = [
    {
        value: 'LayoutDashboard',
        label: 'Dashboard',
    },
    {
        value: 'Users',
        label: 'Users',
    },
    {
        value: 'Settings',
        label: 'Settings',
    },
    {
        value: 'ShieldCheck',
        label: 'Shield',
    },
    {
        value: 'Factory',
        label: 'Factory',
    },
    {
        value: 'ClipboardCheck',
        label: 'Clipboard',
    },
    {
        value: 'ListChecks',
        label: 'List',
    },
];


/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/

const normalizeBoolean = (
    value,
    fallback = true
) => {

    if (
        value === true ||
        value === 1 ||
        value === '1' ||
        value === 'true'
    ) {
        return true;
    }

    if (
        value === false ||
        value === 0 ||
        value === '0' ||
        value === 'false'
    ) {
        return false;
    }

    return fallback;
};


const normalizeMenu = (menu) => {

    return {
        ...menu,

        organization_unit_name:
            menu?.organization_unit_name ?? '',

        permission_name:
            menu?.permission_name ??
            menu?.permission_key ??
            '',

        parent_id:
            menu?.parent_id ?? null,

        order:
            Number(menu?.order ?? 0),

        is_active:
            normalizeBoolean(
                menu?.is_active,
                true
            ),

        children:
            Array.isArray(menu?.children)
                ? menu.children.map(
                    normalizeMenu
                )
                : [],
    };
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function MenuManagement() {

    /*
    |--------------------------------------------------------------------------
    | MENU STATE
    |--------------------------------------------------------------------------
    */

    const [menus, setMenus] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState('');

    const [search, setSearch] =
        useState('');

    const [expandedMenus, setExpandedMenus] =
        useState({});


    /*
    |--------------------------------------------------------------------------
    | MODAL STATE
    |--------------------------------------------------------------------------
    */

    const [isModalOpen, setIsModalOpen] =
        useState(false);

    const [currentMenu, setCurrentMenu] =
        useState(null);

    const [formData, setFormData] =
        useState({
            ...DEFAULT_FORM,
        });


    /*
    |--------------------------------------------------------------------------
    | ORGANIZATION UNIT
    |--------------------------------------------------------------------------
    */

    const [
        organizationUnits,
        setOrganizationUnits,
    ] = useState([]);

    const [
        loadingOrganizationUnits,
        setLoadingOrganizationUnits,
    ] = useState(false);

    const [
        organizationUnitError,
        setOrganizationUnitError,
    ] = useState('');


    /*
    |--------------------------------------------------------------------------
    | ACTION STATE
    |--------------------------------------------------------------------------
    */

    const [saving, setSaving] =
        useState(false);

    const [deletingId, setDeletingId] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        fetchMenus();

        fetchOrganizationUnits();

    }, []);


    /*
    |--------------------------------------------------------------------------
    | FETCH MENUS
    |--------------------------------------------------------------------------
    */

    const fetchMenus = async () => {

        try {

            setLoading(true);

            setError('');

            const response =
                await menuService.getMenus();

            const data =
                Array.isArray(response)
                    ? response
                    : Array.isArray(response?.data)
                        ? response.data
                        : Array.isArray(
                            response?.data?.data
                        )
                            ? response.data.data
                            : [];

            setMenus(
                data.map(
                    normalizeMenu
                )
            );

        } catch (err) {

            console.error(
                '[MenuManagement] Gagal memuat menu:',
                err
            );

            setMenus([]);

            setError(
                err?.response?.data?.message ||
                'Data menu gagal dimuat.'
            );

        } finally {

            setLoading(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | FETCH ORGANIZATION UNITS
    |--------------------------------------------------------------------------
    */

    const fetchOrganizationUnits = async () => {

        try {

            setLoadingOrganizationUnits(true);

            setOrganizationUnitError('');

            const response =
                await organizationUnitService
                    .getOrganizationUnits({
                        is_active: true,
                    });

            let data = [];

            if (
                Array.isArray(response)
            ) {

                data = response;

            } else if (
                Array.isArray(response?.data)
            ) {

                data = response.data;

            } else if (
                Array.isArray(
                    response?.data?.data
                )
            ) {

                data =
                    response.data.data;

            }

            data = data
                .filter(
                    (unit) =>
                        unit &&
                        normalizeBoolean(
                            unit.is_active,
                            true
                        )
                )
                .filter(
                    (unit) =>
                        String(
                            unit.name ?? ''
                        ).trim() !== ''
                )
                .sort(
                    (a, b) =>
                        String(a.name)
                            .localeCompare(
                                String(b.name),
                                'id',
                                {
                                    sensitivity:
                                        'base',
                                }
                            )
                );

            setOrganizationUnits(
                data
            );

        } catch (err) {

            console.error(
                '[MenuManagement] Gagal memuat Organization Unit:',
                err
            );

            setOrganizationUnits([]);

            setOrganizationUnitError(
                err?.response?.data?.message ||
                'Organization Unit gagal dimuat.'
            );

        } finally {

            setLoadingOrganizationUnits(
                false
            );

        }
    };


    /*
    |--------------------------------------------------------------------------
    | FLATTEN MENU
    |--------------------------------------------------------------------------
    */

    const flattenMenus = (
        menuList,
        excludeIds = []
    ) => {

        const result = [];

        const walk = (items) => {

            for (
                const menu of items || []
            ) {

                if (
                    excludeIds.includes(
                        String(menu.id)
                    )
                ) {
                    continue;
                }

                result.push(menu);

                if (
                    menu.children?.length
                ) {

                    walk(
                        menu.children
                    );

                }
            }
        };

        walk(menuList);

        return result;
    };


    /*
    |--------------------------------------------------------------------------
    | DESCENDANT IDS
    |--------------------------------------------------------------------------
    */

    const collectDescendantIds = (
        menu,
        result = []
    ) => {

        for (
            const child
            of menu?.children || []
        ) {

            result.push(
                String(child.id)
            );

            collectDescendantIds(
                child,
                result
            );
        }

        return result;
    };


    /*
    |--------------------------------------------------------------------------
    | AVAILABLE PARENT MENUS
    |--------------------------------------------------------------------------
    */

    const availableParentMenus =
        useMemo(() => {

            const excludeIds =
                currentMenu
                    ? [
                        String(
                            currentMenu.id
                        ),
                        ...collectDescendantIds(
                            currentMenu
                        ),
                    ]
                    : [];

            return flattenMenus(
                menus,
                excludeIds
            );

        }, [
            menus,
            currentMenu,
        ]);


    /*
    |--------------------------------------------------------------------------
    | SEARCH TREE
    |--------------------------------------------------------------------------
    */

    const filteredMenus =
        useMemo(() => {

            const keyword =
                search
                    .trim()
                    .toLowerCase();

            if (!keyword) {

                return menus;

            }

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

                            const searchable = [
                                menu.label,
                                menu.path,
                                menu.organization_unit_name,
                                menu.permission_name,
                            ]
                                .filter(Boolean)
                                .join(' ')
                                .toLowerCase();

                            const matched =
                                searchable.includes(
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


    /*
    |--------------------------------------------------------------------------
    | OPEN MODAL
    |--------------------------------------------------------------------------
    */

    const handleOpenModal = (
        menu = null
    ) => {

        if (menu) {

            setCurrentMenu(
                menu
            );

            setFormData({

                label:
                    menu.label ?? '',

                path:
                    menu.path ?? '',

                icon:
                    menu.icon ?? '',

                organization_unit_name:
                    menu.organization_unit_name ??
                    '',

                permission_name:
                    menu.permission_name ??
                    menu.permission_key ??
                    '',

                parent_id:
                    menu.parent_id ?? '',

                order:
                    Number(
                        menu.order ?? 0
                    ),

                is_active:
                    normalizeBoolean(
                        menu.is_active,
                        true
                    ),

            });

        } else {

            setCurrentMenu(
                null
            );

            setFormData({
                ...DEFAULT_FORM,
            });

        }

        setOrganizationUnitError('');

        setIsModalOpen(true);

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE MODAL
    |--------------------------------------------------------------------------
    */

    const handleCloseModal = () => {

        if (saving) {

            return;

        }

        setIsModalOpen(false);

        setCurrentMenu(null);

        setFormData({
            ...DEFAULT_FORM,
        });

        setOrganizationUnitError('');

    };


    /*
    |--------------------------------------------------------------------------
    | FORM CHANGE
    |--------------------------------------------------------------------------
    */

    const updateForm = (
        field,
        value
    ) => {

        setFormData(
            (previous) => ({
                ...previous,
                [field]: value,
            })
        );

    };


    /*
    |--------------------------------------------------------------------------
    | SUBMIT
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        event
    ) => {

        event.preventDefault();

        const label =
            String(
                formData.label ?? ''
            ).trim();

        if (!label) {

            alert(
                'Label menu wajib diisi.'
            );

            return;
        }


        try {

            setSaving(true);

            const payload = {

                label,

                path:
                    String(
                        formData.path ?? ''
                    ).trim() || null,

                icon:
                    String(
                        formData.icon ?? ''
                    ).trim() || null,

                organization_unit_name:
                    String(
                        formData.organization_unit_name ??
                        ''
                    ).trim() || null,

                permission_name:
                    String(
                        formData.permission_name ?? ''
                    )
                        .trim()
                        .toLowerCase() || null,

                parent_id:
                    formData.parent_id
                        ? formData.parent_id
                        : null,

                order:
                    Number(
                        formData.order
                    ) || 0,

                is_active:
                    Boolean(
                        formData.is_active
                    ),

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


            setIsModalOpen(false);

            setCurrentMenu(null);

            setFormData({
                ...DEFAULT_FORM,
            });

            await fetchMenus();

        } catch (err) {

            console.error(
                '[MenuManagement] Gagal menyimpan menu:',
                err
            );

            alert(
                err?.response?.data?.message ||
                'Terjadi kesalahan saat menyimpan menu.'
            );

        } finally {

            setSaving(false);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (
        menu
    ) => {

        const hasChildren =
            menu.children?.length > 0;

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

            setDeletingId(
                menu.id
            );

            await menuService.deleteMenu(
                menu.id
            );

            await fetchMenus();

        } catch (err) {

            console.error(
                '[MenuManagement] Gagal menghapus menu:',
                err
            );

            alert(
                err?.response?.data?.message ||
                'Terjadi kesalahan saat menghapus menu.'
            );

        } finally {

            setDeletingId(null);

        }
    };


    /*
    |--------------------------------------------------------------------------
    | EXPAND / COLLAPSE
    |--------------------------------------------------------------------------
    */

    const toggleExpanded = (
        id
    ) => {

        setExpandedMenus(
            (previous) => ({
                ...previous,
                [id]:
                    !previous[id],
            })
        );

    };


    const expandAll = () => {

        const state = {};

        const walk = (
            items
        ) => {

            for (
                const menu
                of items || []
            ) {

                if (
                    menu.children?.length
                ) {

                    state[menu.id] =
                        true;

                    walk(
                        menu.children
                    );

                }

            }

        };

        walk(menus);

        setExpandedMenus(
            state
        );

    };


    const collapseAll = () => {

        setExpandedMenus({});

    };


    /*
    |--------------------------------------------------------------------------
    | MOBILE MENU
    |--------------------------------------------------------------------------
    */

    const renderMobileMenu = (
        menu,
        level = 0
    ) => {

        const hasChildren =
            menu.children?.length > 0;

        const expanded =
            Boolean(
                expandedMenus[
                    menu.id
                ]
            );

        return (

            <div
                key={menu.id}
                className="relative"
            >

                <div
                    className={`overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm transition hover:shadow-md ${
                        level > 0
                            ? 'bg-slate-50/80'
                            : ''
                    }`}
                >

                    <div className="p-4">

                        <div className="flex items-start gap-3">

                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                                    level === 0
                                        ? 'bg-[#EAF1FF] text-[#243A70]'
                                        : 'bg-slate-100 text-slate-500'
                                }`}
                            >

                                <DynamicIcon
                                    name={
                                        menu.icon
                                    }
                                    size={21}
                                />

                            </div>


                            <div className="min-w-0 flex-1">

                                <div className="flex items-start justify-between gap-2">

                                    <div className="min-w-0">

                                        <h3 className="truncate text-sm font-bold text-[#243A70]">

                                            {
                                                menu.label
                                            }

                                        </h3>

                                        <p className="mt-0.5 truncate font-mono text-[11px] text-slate-400">

                                            {
                                                menu.path ||
                                                'Tanpa URL'
                                            }

                                        </p>

                                    </div>


                                    <span
                                        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                            menu.is_active
                                                ? 'bg-[#E8F7F1] text-[#009B6A]'
                                                : 'bg-[#FFF1F1] text-[#C0392B]'
                                        }`}
                                    >

                                        {
                                            menu.is_active
                                                ? 'Aktif'
                                                : 'Nonaktif'
                                        }

                                    </span>

                                </div>


                                <div className="mt-3 flex flex-wrap gap-1.5">

                                    {menu.organization_unit_name && (

                                        <span className="rounded-lg bg-[#EAF1FF] px-2 py-1 font-mono text-[10px] font-semibold text-[#243A70]">

                                            Organization Unit:{' '}

                                            {
                                                menu.organization_unit_name
                                            }

                                        </span>

                                    )}


                                    {menu.permission_name && (

                                        <span className="rounded-lg bg-amber-50 px-2 py-1 font-mono text-[10px] font-semibold text-amber-700">

                                            Permission:{' '}

                                            {
                                                menu.permission_name
                                            }

                                        </span>

                                    )}


                                    {!menu.organization_unit_name &&
                                        !menu.permission_name && (

                                            <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">

                                                Container

                                            </span>

                                        )}


                                    <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-600">

                                        Order {menu.order}

                                    </span>

                                </div>

                            </div>

                        </div>


                        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

                            {hasChildren ? (

                                <button
                                    type="button"
                                    onClick={() =>
                                        toggleExpanded(
                                            menu.id
                                        )
                                    }
                                    className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#243A70] transition hover:bg-[#EAF1FF]"
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

                                    {
                                        menu.children.length
                                    }

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


                            <div className="flex gap-1.5">

                                <button
                                    type="button"
                                    onClick={() =>
                                        handleOpenModal(
                                            menu
                                        )
                                    }
                                    className="flex items-center gap-1.5 rounded-lg bg-[#EAF1FF] px-3 py-2 text-xs font-bold text-[#243A70] transition hover:bg-[#DCE9FF]"
                                >

                                    <Edit
                                        size={14}
                                    />

                                    Edit

                                </button>


                                <button
                                    type="button"
                                    disabled={
                                        deletingId ===
                                        menu.id
                                    }
                                    onClick={() =>
                                        handleDelete(
                                            menu
                                        )
                                    }
                                    className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-2 text-xs font-bold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
                                >

                                    {
                                        deletingId ===
                                        menu.id
                                            ? (
                                                <RefreshCw
                                                    size={14}
                                                    className="animate-spin"
                                                />
                                            )
                                            : (
                                                <Trash2
                                                    size={14}
                                                />
                                            )
                                    }

                                    Hapus

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


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


    /*
    |--------------------------------------------------------------------------
    | DESKTOP ROWS
    |--------------------------------------------------------------------------
    */

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
                        className="group border-b border-slate-100 transition hover:bg-[#F8FAFD]"
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
                                        className="rounded-md p-1 text-slate-400 hover:bg-[#EAF1FF] hover:text-[#243A70]"
                                    >

                                        {expandedMenus[
                                            menu.id
                                        ] ? (
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

                                    <span className="w-7" />

                                )}


                                <div
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                        level === 0
                                            ? 'bg-[#EAF1FF] text-[#243A70]'
                                            : 'bg-slate-100 text-slate-500'
                                    }`}
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

                                        {
                                            menu.label
                                        }

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


                        {/* ORGANIZATION UNIT */}

                        <td className="px-5 py-3.5">

                            {menu.organization_unit_name ? (

                                <span className="rounded-lg bg-[#EAF1FF] px-2 py-1 font-mono text-[10px] font-semibold text-[#243A70]">

                                    {
                                        menu.organization_unit_name
                                    }

                                </span>

                            ) : (

                                <span className="text-xs text-slate-400">

                                    Semua Organization Unit

                                </span>

                            )}

                        </td>


                        {/* PERMISSION */}

                        <td className="px-5 py-3.5">

                            {menu.permission_name ? (

                                <span className="rounded-lg bg-amber-50 px-2 py-1 font-mono text-[10px] font-semibold text-amber-700">

                                    {
                                        menu.permission_name
                                    }

                                </span>

                            ) : (

                                <span className="text-xs text-slate-400">

                                    Container

                                </span>

                            )}

                        </td>


                        {/* ORDER */}

                        <td className="px-5 py-3.5 text-center">

                            <span className="text-sm font-semibold text-slate-500">

                                {
                                    menu.order
                                }

                            </span>

                        </td>


                        {/* STATUS */}

                        <td className="px-5 py-3.5">

                            <span
                                className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                                    menu.is_active
                                        ? 'bg-[#E8F7F1] text-[#009B6A]'
                                        : 'bg-[#FFF1F1] text-[#C0392B]'
                                }`}
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
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-[#EAF1FF] hover:text-[#243A70]"
                                    title="Edit"
                                >

                                    <Edit
                                        size={16}
                                    />

                                </button>


                                <button
                                    type="button"
                                    disabled={
                                        deletingId ===
                                        menu.id
                                    }
                                    onClick={() =>
                                        handleDelete(
                                            menu
                                        )
                                    }
                                    className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                                    title="Hapus"
                                >

                                    {
                                        deletingId ===
                                        menu.id
                                            ? (
                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />
                                            )
                                            : (
                                                <Trash2
                                                    size={16}
                                                />
                                            )
                                    }

                                </button>

                            </div>

                        </td>

                    </tr>,

                ];


                if (
                    menu.children?.length &&
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


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="min-h-full bg-[#F3F4F6]">

            <div className="mx-auto max-w-7xl space-y-4 px-3 py-4 sm:space-y-5 sm:px-5 sm:py-6 lg:px-8">

                {/* HEADER */}

                <div className="overflow-hidden rounded-2xl border border-[#D9DEE8] bg-white shadow-sm">

                    <div className="h-1 w-full bg-gradient-to-r from-[#243A70] via-[#4B8DF5] to-[#FF9D00]" />

                    <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">

                        <div className="flex items-center gap-3">

                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#243A70] text-white shadow-sm">

                                <MenuIcon
                                    size={21}
                                />

                            </div>

                            <div className="min-w-0">

                                <h1 className="text-lg font-bold tracking-tight text-[#243A70] sm:text-xl">

                                    Manajemen Menu

                                </h1>

                                <p className="mt-0.5 text-xs text-slate-500 sm:text-sm">

                                    Kelola navigasi,
                                    organization unit,
                                    dan permission
                                    menu aplikasi.

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

                            <Plus
                                size={18}
                            />

                            Tambah Menu

                        </button>

                    </div>

                </div>


                {/* ERROR */}

                {error && (

                    <div className="rounded-2xl border border-red-100 bg-red-50 p-4">

                        <div className="flex items-start gap-3">

                            <AlertCircle
                                size={18}
                                className="mt-0.5 shrink-0 text-red-500"
                            />

                            <div className="min-w-0 flex-1">

                                <p className="text-sm font-semibold text-red-700">

                                    {
                                        error
                                    }

                                </p>

                                <button
                                    type="button"
                                    onClick={
                                        fetchMenus
                                    }
                                    className="mt-2 flex items-center gap-1.5 text-xs font-bold text-red-600 hover:underline"
                                >

                                    <RefreshCw
                                        size={13}
                                    />

                                    Muat ulang

                                </button>

                            </div>

                        </div>

                    </div>

                )}


                {/* SEARCH / FILTER */}

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
                                placeholder="Cari menu, path, organization unit, atau permission..."
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

                                    <X
                                        size={15}
                                    />

                                </button>

                            )}

                        </div>


                        <div className="flex gap-2">

                            <button
                                type="button"
                                onClick={
                                    expandAll
                                }
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D9DEE8] px-3 py-2.5 text-xs font-semibold text-[#243A70] transition hover:bg-[#EAF1FF] sm:flex-none"
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
                                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-[#D9DEE8] px-3 py-2.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
                            >

                                <ChevronRight
                                    size={15}
                                />

                                Tutup Semua

                            </button>

                        </div>

                    </div>

                </div>


                {/* CONTENT */}

                {loading ? (

                    <div className="rounded-2xl border border-[#D9DEE8] bg-white p-10 text-center shadow-sm">

                        <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-[#243A70]" />

                        <p className="text-sm text-slate-500">

                            Memuat data menu...

                        </p>

                    </div>

                ) : filteredMenus.length === 0 ? (

                    <div className="rounded-2xl border border-dashed border-[#D9DEE8] bg-white px-5 py-14 text-center">

                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#EAF1FF] text-[#243A70]">

                            <Search
                                size={22}
                            />

                        </div>

                        <h3 className="mt-3 text-sm font-bold text-[#243A70]">

                            Tidak ada menu

                        </h3>

                        <p className="mt-1 text-xs text-slate-400">

                            Tidak ditemukan menu yang sesuai.

                        </p>

                    </div>

                ) : (

                    <>

                        {/* MOBILE */}

                        <div className="space-y-2.5 md:hidden">

                            {filteredMenus.map(
                                (menu) =>
                                    renderMobileMenu(
                                        menu
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
                                                Menu
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Path
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Organization Unit
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Permission
                                            </th>

                                            <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Order
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

                                        {
                                            renderDesktopRows(
                                                filteredMenus
                                            )
                                        }

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

                <div className="fixed inset-0 z-[100] flex items-start justify-center bg-slate-950/50 p-3 pt-[76px] pb-[76px] backdrop-blur-[2px] sm:items-center sm:p-4">

                    <div
                        className="absolute inset-0"
                        onClick={
                            handleCloseModal
                        }
                    />


                    <div
                        className="relative z-[101] flex max-h-[calc(100dvh-152px)] w-full flex-col overflow-hidden rounded-2xl bg-white shadow-2xl sm:max-w-xl"
                        onClick={(e) =>
                            e.stopPropagation()
                        }
                    >

                        <div className="h-2 w-full shrink-0 bg-gradient-to-r from-[#243A70] via-[#4B8DF5] to-[#FF9D00]" />


                        {/* MODAL HEADER */}

                        <div className="flex shrink-0 items-center justify-between border-b border-[#D9DEE8] px-5 py-4">

                            <div>

                                <div className="flex items-center gap-2">

                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#243A70]">

                                        <MenuIcon
                                            size={16}
                                        />

                                    </div>

                                    <h2 className="text-base font-bold text-[#243A70] sm:text-lg">

                                        {
                                            currentMenu
                                                ? 'Edit Menu'
                                                : 'Tambah Menu'
                                        }

                                    </h2>

                                </div>

                                <p className="mt-1 text-xs text-slate-400">

                                    Atur informasi,
                                    struktur,
                                    organization unit,
                                    dan permission menu.

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={
                                    saving
                                }
                                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="flex min-h-0 flex-1 flex-col"
                        >

                            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">

                                <div className="space-y-6">

                                    {/* INFORMASI */}

                                    <section>

                                        <div className="mb-4 flex items-center gap-2">

                                            <div className="h-5 w-1 rounded-full bg-[#4B8DF5]" />

                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#243A70]">

                                                Informasi Menu

                                            </h3>

                                        </div>


                                        <div className="space-y-4">

                                            {/* LABEL */}

                                            <div>

                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                    Label Menu

                                                </label>

                                                <input
                                                    type="text"
                                                    value={
                                                        formData.label
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'label',
                                                            e.target.value
                                                        )
                                                    }
                                                    required
                                                    placeholder="Contoh: Rajang"
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                />

                                            </div>


                                            {/* PARENT */}

                                            <div>

                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                    Parent Menu

                                                </label>

                                                <select
                                                    value={
                                                        formData.parent_id
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'parent_id',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                >

                                                    <option value="">

                                                        Menu Utama

                                                    </option>

                                                    {
                                                        availableParentMenus.map(
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
                                                        )
                                                    }

                                                </select>

                                            </div>


                                            {/* PATH */}

                                            <div>

                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                    Path / URL

                                                </label>

                                                <div className="relative">

                                                    <ExternalLink
                                                        size={15}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />

                                                    <input
                                                        type="text"
                                                        value={
                                                            formData.path
                                                        }
                                                        onChange={(e) =>
                                                            updateForm(
                                                                'path',
                                                                e.target.value
                                                            )
                                                        }
                                                        placeholder="/app/produksi/rajang"
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 font-mono text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                    />

                                                </div>

                                            </div>

                                        </div>

                                    </section>


                                    {/* ACCESS CONTROL */}

                                    <section className="border-t border-slate-100 pt-5">

                                        <div className="mb-4 flex items-center gap-2">

                                            <div className="h-5 w-1 rounded-full bg-[#4B8DF5]" />

                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#243A70]">

                                                Access Control

                                            </h3>

                                        </div>


                                        <div className="space-y-4">

                                            {/* ORGANIZATION UNIT */}

                                            <div>

                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                    Organization Unit

                                                </label>

                                                <div className="relative">

                                                    <ShieldCheck
                                                        size={15}
                                                        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                                                    />

                                                    <select
                                                        value={
                                                            formData.organization_unit_name
                                                        }
                                                        onChange={(e) =>
                                                            updateForm(
                                                                'organization_unit_name',
                                                                e.target.value
                                                            )
                                                        }
                                                        disabled={
                                                            loadingOrganizationUnits
                                                        }
                                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 text-sm text-slate-700 outline-none transition focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF] disabled:cursor-not-allowed disabled:opacity-60"
                                                    >

                                                        <option value="">

                                                            Semua Organization Unit

                                                        </option>

                                                        {
                                                            organizationUnits.map(
                                                                (unit) => (

                                                                    <option
                                                                        key={
                                                                            unit.id
                                                                        }
                                                                        value={
                                                                            unit.name
                                                                        }
                                                                    >

                                                                        {
                                                                            unit.name
                                                                        }

                                                                    </option>

                                                                )
                                                            )
                                                        }

                                                    </select>


                                                    <ChevronDown
                                                        size={15}
                                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />

                                                </div>


                                                {loadingOrganizationUnits ? (

                                                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-400">

                                                        <RefreshCw
                                                            size={12}
                                                            className="animate-spin"
                                                        />

                                                        Memuat Organization Unit...

                                                    </div>

                                                ) : organizationUnitError ? (

                                                    <div className="mt-2 rounded-xl border border-red-100 bg-red-50 p-3">

                                                        <div className="flex items-start gap-2">

                                                            <AlertCircle
                                                                size={14}
                                                                className="mt-0.5 shrink-0 text-red-500"
                                                            />

                                                            <div>

                                                                <p className="text-[11px] font-semibold text-red-600">

                                                                    {
                                                                        organizationUnitError
                                                                    }

                                                                </p>

                                                                <button
                                                                    type="button"
                                                                    onClick={
                                                                        fetchOrganizationUnits
                                                                    }
                                                                    className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-red-600 hover:underline"
                                                                >

                                                                    <RefreshCw
                                                                        size={11}
                                                                    />

                                                                    Coba lagi

                                                                </button>

                                                            </div>

                                                        </div>

                                                    </div>

                                                ) : (

                                                    <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">

                                                        Organization Unit
                                                        diambil dari
                                                        <span className="font-semibold">

                                                            {' '}
                                                            master Organization Unit

                                                        </span>
                                                        . Nilai yang
                                                        disimpan adalah
                                                        <span className="font-semibold">

                                                            {' '}
                                                            name

                                                        </span>
                                                        .

                                                    </p>

                                                )}

                                            </div>


                                            {/* PERMISSION */}

                                            <div>

                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                    Permission

                                                </label>

                                                <div className="relative">

                                                    <KeyRound
                                                        size={15}
                                                        className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-slate-400"
                                                    />

                                                    <select
                                                        value={
                                                            formData.permission_name
                                                        }
                                                        onChange={(e) =>
                                                            updateForm(
                                                                'permission_name',
                                                                e.target.value
                                                            )
                                                        }
                                                        className="w-full appearance-none rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-10 font-mono text-sm text-slate-700 outline-none transition focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                    >

                                                        <option value="">

                                                            Tidak ada permission

                                                        </option>


                                                        {
                                                            PERMISSION_GROUPS.map(
                                                                (group) => (

                                                                    <optgroup
                                                                        key={
                                                                            group.group
                                                                        }
                                                                        label={
                                                                            group.group
                                                                        }
                                                                    >

                                                                        {
                                                                            group.items.map(
                                                                                (
                                                                                    permission
                                                                                ) => (

                                                                                    <option
                                                                                        key={
                                                                                            permission.value
                                                                                        }
                                                                                        value={
                                                                                            permission.value
                                                                                        }
                                                                                    >

                                                                                        {
                                                                                            permission.label
                                                                                        }

                                                                                    </option>

                                                                                )
                                                                            )
                                                                        }

                                                                    </optgroup>

                                                                )
                                                            )
                                                        }

                                                    </select>


                                                    <ChevronDown
                                                        size={15}
                                                        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />

                                                </div>


                                                <p className="mt-1.5 text-[11px] leading-relaxed text-slate-400">

                                                    Permission menentukan
                                                    fungsi yang dapat
                                                    diakses user pada
                                                    menu tersebut.

                                                </p>

                                            </div>

                                        </div>

                                    </section>


                                    {/* TAMPILAN */}

                                    <section className="border-t border-slate-100 pt-5">

                                        <div className="mb-4 flex items-center gap-2">

                                            <div className="h-5 w-1 rounded-full bg-[#FF9D00]" />

                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#243A70]">

                                                Tampilan

                                            </h3>

                                        </div>


                                        <div>

                                            <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                Ikon Menu

                                            </label>

                                            <div className="flex gap-2">

                                                <select
                                                    value={
                                                        formData.icon
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'icon',
                                                            e.target.value
                                                        )
                                                    }
                                                    className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                >

                                                    <option value="">

                                                        Pilih ikon

                                                    </option>

                                                    {
                                                        ICON_OPTIONS.map(
                                                            (icon) => (

                                                                <option
                                                                    key={
                                                                        icon.value
                                                                    }
                                                                    value={
                                                                        icon.value
                                                                    }
                                                                >

                                                                    {
                                                                        icon.label
                                                                    }

                                                                </option>

                                                            )
                                                        )
                                                    }

                                                </select>


                                                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#D9DEE8] bg-[#EAF1FF] text-[#243A70]">

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


                                    {/* PENGATURAN */}

                                    <section className="border-t border-slate-100 pt-5">

                                        <div className="mb-4 flex items-center gap-2">

                                            <div className="h-5 w-1 rounded-full bg-[#009B6A]" />

                                            <h3 className="text-xs font-bold uppercase tracking-wider text-[#243A70]">

                                                Pengaturan

                                            </h3>

                                        </div>


                                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                                            {/* ORDER */}

                                            <div>

                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                    Urutan

                                                </label>

                                                <div className="relative">

                                                    <GripVertical
                                                        size={15}
                                                        className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                                    />

                                                    <input
                                                        type="number"
                                                        min="0"
                                                        value={
                                                            formData.order
                                                        }
                                                        onChange={(e) =>
                                                            updateForm(
                                                                'order',
                                                                Number(
                                                                    e.target.value
                                                                ) || 0
                                                            )
                                                        }
                                                        className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3.5 text-sm text-slate-700 outline-none transition focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                    />

                                                </div>

                                            </div>


                                            {/* STATUS */}

                                            <div>

                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">

                                                    Status

                                                </label>

                                                <select
                                                    value={
                                                        formData.is_active
                                                            ? 'true'
                                                            : 'false'
                                                    }
                                                    onChange={(e) =>
                                                        updateForm(
                                                            'is_active',
                                                            e.target.value ===
                                                            'true'
                                                        )
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-700 outline-none transition focus:border-[#4B8DF5] focus:bg-white focus:ring-2 focus:ring-[#DCE9FF]"
                                                >

                                                    <option value="true">
                                                        Aktif
                                                    </option>

                                                    <option value="false">
                                                        Nonaktif
                                                    </option>

                                                </select>

                                            </div>

                                        </div>

                                    </section>

                                </div>

                            </div>


                            {/* FOOTER */}

                            <div className="border-t border-[#D9DEE8] bg-white px-6 py-3">

                                <div className="flex items-center justify-between gap-3">

                                    <button
                                        type="button"
                                        onClick={
                                            handleCloseModal
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="rounded-xl border border-slate-200 bg-white px-8 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                                    >

                                        Batal

                                    </button>


                                    <button
                                        type="submit"
                                        disabled={
                                            saving
                                        }
                                        className="flex items-center justify-center gap-2 rounded-xl bg-[#243A70] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#1D315F] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
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

                                            currentMenu
                                                ? 'Simpan Perubahan'
                                                : 'Simpan Menu'

                                        )}

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