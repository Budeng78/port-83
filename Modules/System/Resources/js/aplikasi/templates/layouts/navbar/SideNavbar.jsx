import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
} from 'lucide-react';

import api from '@Modules/System/Resources/js/aplikasi/axios/axios.js';
import { useAuth } from '@Modules/Auth/Resources/js/aplikasi/context/AuthContext';
import { DynamicIcon } from '../DynamicIcon';


/*
|--------------------------------------------------------------------------
| THEME
|--------------------------------------------------------------------------
|
| Theme disamakan dengan tampilan utama aplikasi:
|
| Navy       : #243B72
| Blue       : #2563EB
| Blue Light : #EFF6FF
| Background : #F8FAFC
|
*/


/* ============================================================
| SIDEBAR ITEM
============================================================ */

const SidebarItem = ({
    item,
    pathname,
    toggleSubMenu,
    openMenus,
    isCollapsed,
}) => {

    const hasChildren =
        item.children &&
        item.children.length > 0;

    const isOpen = openMenus[item.id || item.label];

    /*
    |--------------------------------------------------------------------------
    | ACTIVE CHECK
    |--------------------------------------------------------------------------
    */

    const isActive =
        item.path &&
        pathname === item.path;

    const checkChildrenActive = (children) => {

        if (!children) {
            return false;
        }

        return children.some(child => {

            if (child.path === pathname) {
                return true;
            }

            if (child.children) {
                return checkChildrenActive(child.children);
            }

            return false;
        });
    };

    const isChildActive =
        checkChildrenActive(item.children);


    const active =
        isActive ||
        isChildActive;


    /*
    |--------------------------------------------------------------------------
    | MENU KEY
    |--------------------------------------------------------------------------
    */

    const menuKey =
        item.id || item.label;


    return (
        <div className="relative">

            {/* ==================================================
                MAIN MENU
            ================================================== */}

            <NavLink
                to={hasChildren ? '#' : item.path || '#'}
                onClick={(e) => {

                    if (hasChildren) {

                        e.preventDefault();

                        toggleSubMenu(menuKey);
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

                    ${isCollapsed ? 'justify-center' : ''}
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


                {/* ==================================================
                    ICON + LABEL
                ================================================== */}

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

                    {/* ICON */}

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

                        {item.icon && (

                            <DynamicIcon
                                name={item.icon}
                                size={18}
                                strokeWidth={
                                    active
                                        ? 2.5
                                        : 2
                                }
                            />

                        )}

                    </div>


                    {/* LABEL */}

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


                {/* ==================================================
                    CHEVRON
                ================================================== */}

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


            {/* ==================================================
                SUB MENU
            ================================================== */}

            <AnimatePresence initial={false}>

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
                                duration: 0.2,
                                ease: 'easeOut',
                            }}

                            className="
                                overflow-hidden
                                ml-5
                                mt-1
                                pl-3
                                border-l
                                border-slate-200
                            "
                        >

                            <div className="space-y-0.5">

                                {item.children.map(
                                    (child, idx) => (

                                        <SidebarItem

                                            key={
                                                child.id ||
                                                `${item.id}-${idx}`
                                            }

                                            item={child}

                                            pathname={pathname}

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


/* ============================================================
| MAIN SIDEBAR
============================================================ */

export default function SideNavbar({
    isCollapsed,
    setIsCollapsed,
}) {

    const { pathname } =
        useLocation();

    const { token } =
        useAuth();

    const [menus, setMenus] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [openMenus, setOpenMenus] =
        useState({});


    /* ========================================================
    | LOAD MENU
    ======================================================== */

    useEffect(() => {

        let mounted = true;

        setLoading(true);

        api.get('/core/menus')

            .then(response => {

                if (!mounted) {
                    return;
                }

                setMenus(
                    response.data?.data || []
                );

            })

            .catch(error => {

                console.error(
                    'Gagal memuat menu:',
                    error
                );

            })

            .finally(() => {

                if (mounted) {
                    setLoading(false);
                }

            });


        return () => {
            mounted = false;
        };

    }, [token]);


    /* ========================================================
    | AUTO OPEN ACTIVE MENU
    ======================================================== */

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

                const isCurrent =
                    item.path === pathname;

                if (isCurrent) {

                    parents.forEach(parent => {

                        newOpenMenus[
                            parent.id ||
                            parent.label
                        ] = true;

                    });

                    return;
                }


                if (
                    item.children &&
                    item.children.length
                ) {

                    findActiveParents(
                        item.children,
                        [
                            ...parents,
                            item
                        ]
                    );

                }

            });

        };


        findActiveParents(menus);


        setOpenMenus(prev => ({
            ...prev,
            ...newOpenMenus,
        }));

    }, [pathname, menus]);


    /* ========================================================
    | TOGGLE SUB MENU
    ======================================================== */

    const toggleSubMenu = (menuKey) => {

        /*
        |--------------------------------------------------------------------------
        | Kalau sidebar collapsed
        | otomatis buka sidebar terlebih dahulu
        |--------------------------------------------------------------------------
        */

        if (isCollapsed) {

            setIsCollapsed(false);

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


    /* ========================================================
    | LOADING
    ======================================================== */

    if (loading) {

        return (

            <div
                className={`
                    flex
                    items-center
                    justify-center
                    h-full
                    bg-white
                `}
            >

                <div
                    className="
                        flex
                        flex-col
                        items-center
                        gap-3
                    "
                >

                    <div
                        className="
                            w-7
                            h-7
                            rounded-full
                            border-2
                            border-slate-200
                            border-t-[#2563EB]
                            animate-spin
                        "
                    />

                    {!isCollapsed && (

                        <span
                            className="
                                text-[11px]
                                text-slate-400
                                font-medium
                            "
                        >
                            Memuat menu...
                        </span>

                    )}

                </div>

            </div>

        );
    }


    /* ========================================================
    | SIDEBAR
    ======================================================== */

    return (

        <aside
            className={`
                relative
                flex
                flex-col
                h-full
                bg-white
                border-r
                border-slate-200
                transition-all
                duration-300
                ease-in-out
                select-none
            `}
        >

            {/* ==================================================
                COLLAPSE BUTTON
            ================================================== */}

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
                    hover:border-[#243B72]

                    transition-all
                    duration-200
                "
            >

                {isCollapsed ? (

                    <ChevronRight
                        size={13}
                        strokeWidth={2.5}
                    />

                ) : (

                    <ChevronLeft
                        size={13}
                        strokeWidth={2.5}
                    />

                )}

            </button>


            {/* ==================================================
                MENU CONTAINER
            ================================================== */}

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

                {/* ==================================================
                    SECTION LABEL
                ================================================== */}

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


                {/* ==================================================
                    MENU LIST
                ================================================== */}

                <nav
                    className="space-y-1"
                >

                    {menus.map(
                        (item, idx) => (

                            <SidebarItem

                                key={
                                    item.id ||
                                    idx
                                }

                                item={item}

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


                {/* ==================================================
                    EMPTY MENU
                ================================================== */}

                {!menus.length && (

                    <div
                        className="
                            flex
                            flex-col
                            items-center
                            justify-center
                            py-10
                            px-4
                            text-center
                        "
                    >

                        <div
                            className="
                                w-10
                                h-10
                                rounded-xl
                                bg-slate-100
                                flex
                                items-center
                                justify-center
                                mb-3
                            "
                        >
                            <span
                                className="
                                    text-slate-400
                                    text-lg
                                "
                            >
                                —
                            </span>
                        </div>

                        <p
                            className="
                                text-xs
                                font-medium
                                text-slate-500
                            "
                        >
                            Belum ada menu
                        </p>

                    </div>

                )}

            </div>


            {/* ==================================================
                SIDEBAR FOOTER
            ================================================== */}

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