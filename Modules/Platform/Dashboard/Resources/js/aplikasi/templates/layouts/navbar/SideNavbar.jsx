import React, {
    useState,
    useEffect,
} from 'react';

import {
    NavLink,
    useLocation,
} from 'react-router-dom';

import {
    motion,
    AnimatePresence,
} from 'framer-motion';

import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';

import {
    DynamicIcon,
} from '../DynamicIcon';


/* ==========================================================================
| SIDEBAR ITEM
========================================================================== */

const SidebarItem = ({
    item,
    pathname,
    toggleSubMenu,
    openMenus,
    isCollapsed,
}) => {

    const hasChildren =
        Array.isArray(item.children) &&
        item.children.length > 0;


    const menuKey =
        item.id || item.label;


    const isOpen =
        !!openMenus[menuKey];


    /*
    |--------------------------------------------------------------------------
    | ACTIVE CHECK
    |--------------------------------------------------------------------------
    */

    const isActive =
        item.path &&
        pathname === item.path;


    const checkChildrenActive = (
        children
    ) => {

        if (
            !Array.isArray(children)
        ) {
            return false;
        }


        return children.some(child => {

            if (
                child.path &&
                pathname === child.path
            ) {
                return true;
            }


            if (
                Array.isArray(
                    child.children
                )
            ) {

                return checkChildrenActive(
                    child.children
                );

            }


            return false;

        });

    };


    const isChildActive =
        checkChildrenActive(
            item.children
        );


    const active =
        isActive ||
        isChildActive;


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="relative">

            {/* ==============================================================
                MAIN MENU
            ============================================================== */}

            <NavLink

                to={
                    hasChildren
                        ? '#'
                        : item.path || '#'
                }

                onClick={(event) => {

                    if (hasChildren) {

                        event.preventDefault();

                        toggleSubMenu(
                            menuKey
                        );

                    }

                }}

                title={
                    isCollapsed
                        ? item.label
                        : undefined
                }

                className={`
                    group
                    relative
                    flex
                    items-center
                    justify-between
                    w-full
                    min-h-[44px]
                    px-3
                    rounded-xl
                    transition-all
                    duration-200
                    select-none

                    ${
                        active
                            ? `
                                bg-blue-50
                                text-[#243B72]
                              `
                            : `
                                text-slate-500
                                hover:bg-blue-50/70
                                hover:text-[#243B72]
                              `
                    }

                    ${
                        isCollapsed
                            ? 'justify-center'
                            : ''
                    }
                `}
            >

                {/* ACTIVE INDICATOR */}

                {active && (

                    <motion.div

                        layoutId="sidebar-active"

                        className="
                            absolute
                            left-0
                            top-1/2
                            -translate-y-1/2
                            w-[3px]
                            h-6
                            rounded-r-full
                            bg-[#2563EB]
                        "
                    />

                )}


                {/* ==========================================================
                    ICON + LABEL
                =========================================================== */}

                <div
                    className={`
                        flex
                        items-center
                        min-w-0

                        ${
                            isCollapsed
                                ? 'justify-center'
                                : 'gap-3'
                        }
                    `}
                >

                    <div
                        className={`
                            flex
                            items-center
                            justify-center
                            w-8
                            h-8
                            shrink-0
                            rounded-lg
                            transition-all
                            duration-200

                            ${
                                active
                                    ? `
                                        bg-white
                                        text-[#2563EB]
                                        shadow-sm
                                      `
                                    : `
                                        text-slate-400
                                        group-hover:text-[#2563EB]
                                      `
                            }
                        `}
                    >

                        {item.icon ? (

                            <DynamicIcon
                                name={
                                    item.icon
                                }

                                size={18}

                                strokeWidth={
                                    active
                                        ? 2.5
                                        : 2
                                }
                            />

                        ) : null}

                    </div>


                    {!isCollapsed && (

                        <span
                            className={`
                                truncate
                                text-[13px]
                                tracking-[0.01em]

                                ${
                                    active
                                        ? 'font-semibold text-[#243B72]'
                                        : 'font-medium'
                                }
                            `}
                        >
                            {item.label}
                        </span>

                    )}

                </div>


                {/* CHEVRON */}

                {hasChildren &&
                    !isCollapsed && (

                        <ChevronDown
                            size={15}
                            strokeWidth={2}
                            className={`
                                shrink-0
                                mr-1
                                transition-transform
                                duration-300

                                ${
                                    isOpen
                                        ? 'rotate-180 text-[#2563EB]'
                                        : 'text-slate-400'
                                }
                            `}
                        />

                    )}

            </NavLink>


            {/* ==============================================================
                CHILDREN
            ============================================================== */}

            <AnimatePresence
                initial={false}
            >

                {hasChildren &&
                    isOpen &&
                    !isCollapsed && (

                        <motion.div

                            initial={{
                                height: 0,
                                opacity: 0,
                            }}

                            animate={{
                                height: 'auto',
                                opacity: 1,
                            }}

                            exit={{
                                height: 0,
                                opacity: 0,
                            }}

                            transition={{
                                duration: 0.25,
                                ease: 'easeOut',
                            }}

                            className="
                                overflow-hidden
                                mt-1
                                pl-2
                            "
                        >

                            <div
                                className="
                                    space-y-0.5
                                "
                            >

                                {item.children.map(
                                    (
                                        child,
                                        index
                                    ) => (

                                        <SidebarItem

                                            key={
                                                child.id ||
                                                `${menuKey}-${index}`
                                            }

                                            item={
                                                child
                                            }

                                            pathname={
                                                pathname
                                            }

                                            toggleSubMenu={
                                                toggleSubMenu
                                            }

                                            openMenus={
                                                openMenus
                                            }

                                            isCollapsed={
                                                isCollapsed
                                            }

                                        />

                                    )
                                )}

                            </div>

                        </motion.div>

                    )}

            </AnimatePresence>

        </div>

    );

};


/* ==========================================================================
| SIDEBAR
========================================================================== */

export default function SideNavbar({

    isCollapsed,

    setIsCollapsed,

    menus = [],

}) {

    const {
        pathname,
    } = useLocation();


    const [
        openMenus,
        setOpenMenus,
    ] = useState({});


    /*
    |--------------------------------------------------------------------------
    | AUTO OPEN ACTIVE PARENT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!menus.length) {
            return;
        }


        const newOpenMenus = {};


        const findActiveParents = (
            items,
            parents = []
        ) => {

            items.forEach(item => {

                if (
                    item.path &&
                    pathname === item.path
                ) {

                    parents.forEach(
                        parent => {

                            const key =
                                parent.id ||
                                parent.label;

                            newOpenMenus[key] =
                                true;

                        }
                    );

                    return;

                }


                if (
                    Array.isArray(
                        item.children
                    ) &&
                    item.children.length
                ) {

                    findActiveParents(
                        item.children,
                        [
                            ...parents,
                            item,
                        ]
                    );

                }

            });

        };


        findActiveParents(
            menus
        );


        setOpenMenus(prev => ({
            ...prev,
            ...newOpenMenus,
        }));

    }, [
        pathname,
        menus,
    ]);


    /*
    |--------------------------------------------------------------------------
    | TOGGLE
    |--------------------------------------------------------------------------
    */

    const toggleSubMenu = (
        menuKey
    ) => {

        if (isCollapsed) {

            setIsCollapsed(
                false
            );

            setOpenMenus({
                [menuKey]: true,
            });

            return;

        }


        setOpenMenus(prev => ({
            ...prev,
            [menuKey]:
                !prev[menuKey],
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <aside
            className="
                relative
                flex
                flex-col
                h-full
                bg-white
                select-none
            "
        >

            {/* ==============================================================
                COLLAPSE
            ============================================================== */}

            <button

                type="button"

                onClick={() =>
                    setIsCollapsed(
                        !isCollapsed
                    )
                }

                title={
                    isCollapsed
                        ? 'Buka sidebar'
                        : 'Tutup sidebar'
                }

                className="
                    absolute
                    -right-3
                    top-5
                    z-40
                    flex
                    items-center
                    justify-center
                    w-6
                    h-6
                    rounded-full
                    bg-white
                    border
                    border-slate-200
                    text-slate-500
                    shadow-sm
                    hover:bg-[#243B72]
                    hover:text-white
                    transition-all
                "
            >

                {isCollapsed ? (

                    <ChevronRight
                        size={13}
                    />

                ) : (

                    <ChevronLeft
                        size={13}
                    />

                )}

            </button>


            {/* ==============================================================
                MENU
            ============================================================== */}

            <div
                className="
                    flex-1
                    min-h-0
                    px-3
                    py-4
                    overflow-y-auto
                    custom-scrollbar
                "
            >

                {!isCollapsed && (

                    <div
                        className="
                            px-3
                            mb-3
                            text-[10px]
                            font-bold
                            uppercase
                            tracking-[0.16em]
                            text-slate-400
                        "
                    >
                        Menu Utama
                    </div>

                )}


                {menus.length > 0 ? (

                    <nav
                        className="space-y-1"
                    >

                        {menus.map(
                            (
                                item,
                                index
                            ) => (

                                <SidebarItem

                                    key={
                                        item.id ||
                                        index
                                    }

                                    item={
                                        item
                                    }

                                    pathname={
                                        pathname
                                    }

                                    toggleSubMenu={
                                        toggleSubMenu
                                    }

                                    openMenus={
                                        openMenus
                                    }

                                    isCollapsed={
                                        isCollapsed
                                    }

                                />

                            )
                        )}

                    </nav>

                ) : (

                    <div
                        className="
                            flex
                            items-center
                            justify-center
                            py-10
                            text-xs
                            text-slate-400
                        "
                    >
                        Belum ada menu
                    </div>

                )}

            </div>


            {/* FOOTER */}

            {!isCollapsed && (

                <div
                    className="
                        shrink-0
                        px-4
                        py-3
                        border-t
                        border-slate-100
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                            text-[10px]
                            text-slate-400
                        "
                    >

                        <div
                            className="
                                w-1.5
                                h-1.5
                                rounded-full
                                bg-emerald-500
                            "
                        />

                        <span>
                            Sistem Online
                        </span>

                    </div>

                </div>

            )}

        </aside>

    );

}