import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import {
    Home,
    User,
    LayoutGrid,
    X,
    ChevronRight,
} from 'lucide-react';

import api from '@Modules/System/Resources/js/aplikasi/axios/axios.js';
import { useAuth } from '@Modules/Auth/Resources/js/aplikasi/context/AuthContext';
import { DynamicIcon } from '../DynamicIcon';


/*
|--------------------------------------------------------------------------
| THEME
|--------------------------------------------------------------------------
|
| Sama dengan SideNavbar + Navbar utama
|
| Navy       : #243B72
| Blue       : #2563EB
| Blue Light : #EFF6FF
| Background : #F8FAFC
|
*/


/* ============================================================
| BOTTOM MENU ITEM
============================================================ */

const BottomNavItem = ({
    menu,
    pathname,
    toggleSubMenu,
    openSubMenus,
    closeAll,
}) => {

    const hasChild =
        Array.isArray(menu.children) &&
        menu.children.length > 0;


    /*
    |--------------------------------------------------------------------------
    | MENU KEY
    |--------------------------------------------------------------------------
    */

    const menuKey =
        menu.id || menu.label;


    const isSubOpen =
        openSubMenus[menuKey];


    /*
    |--------------------------------------------------------------------------
    | ACTIVE CHECK
    |--------------------------------------------------------------------------
    */

    const checkActive = (item) => {

        if (
            item.path &&
            pathname === item.path
        ) {
            return true;
        }

        if (
            item.children &&
            item.children.length
        ) {
            return item.children.some(
                checkActive
            );
        }

        return false;
    };


    const isActive =
        checkActive(menu);


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="overflow-hidden">

            {/* ==================================================
                MENU UTAMA
            ================================================== */}

            <button
                type="button"

                onClick={() => {

                    if (hasChild) {

                        toggleSubMenu(
                            menuKey
                        );

                    } else {

                        if (menu.path) {
                            window.location.href =
                                menu.path;
                        }

                        closeAll();

                    }

                }}

                className={`
                    group
                    w-full
                    flex
                    items-center
                    justify-between
                    px-4
                    py-3
                    rounded-2xl
                    transition-all
                    duration-200
                    active:scale-[0.98]

                    ${
                        isActive
                            ? `
                                bg-[#EFF6FF]
                                text-[#243B72]
                                border
                                border-blue-100
                              `
                            : `
                                bg-white
                                text-slate-600
                                border
                                border-transparent
                                hover:bg-slate-50
                              `
                    }
                `}
            >

                {/* ==================================================
                    ICON + LABEL
                ================================================== */}

                <div className="flex items-center gap-3 min-w-0">

                    {/* ICON CONTAINER */}

                    <div
                        className={`
                            flex
                            items-center
                            justify-center
                            w-9
                            h-9
                            shrink-0
                            rounded-xl
                            transition-all

                            ${
                                isActive
                                    ? `
                                        bg-white
                                        text-[#2563EB]
                                        shadow-sm
                                      `
                                    : `
                                        bg-slate-50
                                        text-slate-400
                                        group-hover:text-[#2563EB]
                                      `
                            }
                        `}
                    >

                        {menu.icon ? (

                            <DynamicIcon
                                name={menu.icon}
                                size={18}
                                strokeWidth={
                                    isActive
                                        ? 2.5
                                        : 2
                                }
                            />

                        ) : (

                            <LayoutGrid
                                size={18}
                            />

                        )}

                    </div>


                    {/* LABEL */}

                    <span
                        className={`
                            truncate
                            text-[13px]
                            ${
                                isActive
                                    ? 'font-semibold text-[#243B72]'
                                    : 'font-medium'
                            }
                        `}
                    >
                        {menu.label}
                    </span>

                </div>


                {/* ==================================================
                    CHEVRON
                ================================================== */}

                {hasChild && (

                    <ChevronRight
                        size={16}
                        className={`
                            shrink-0
                            transition-transform
                            duration-300

                            ${
                                isSubOpen
                                    ? `
                                        rotate-90
                                        text-[#2563EB]
                                      `
                                    : `
                                        text-slate-400
                                      `
                            }
                        `}
                    />

                )}

            </button>


            {/* ==================================================
                CHILDREN
            ================================================== */}

            <AnimatePresence
                initial={false}
            >

                {hasChild &&
                    isSubOpen && (

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
                                pl-4
                                mt-1
                                border-l-2
                                border-blue-100
                            "
                        >

                            <div className="space-y-1">

                                {menu.children.map(
                                    (child, ci) => (

                                        <BottomNavItem

                                            key={
                                                child.id ||
                                                `${menuKey}-${ci}`
                                            }

                                            menu={child}

                                            pathname={
                                                pathname
                                            }

                                            toggleSubMenu={
                                                toggleSubMenu
                                            }

                                            openSubMenus={
                                                openSubMenus
                                            }

                                            closeAll={
                                                closeAll
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
| BOTTOM NAVBAR
============================================================ */

export default function BottomNavbar() {

    const [isOpen, setIsOpen] =
        useState(false);

    const { pathname } =
        useLocation();

    const { token } =
        useAuth();

    const [menus, setMenus] =
        useState([]);

    const [openSubMenus, setOpenSubMenus] =
        useState({});


    /* ========================================================
    | LOAD MENU
    ======================================================== */

    useEffect(() => {

        let mounted = true;

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
                    'Gagal memuat menu bottom navbar:',
                    error
                );

            });


        return () => {
            mounted = false;
        };

    }, [token]);


    /* ========================================================
    | CLOSE ALL
    ======================================================== */

    const closeAll = () => {

        setIsOpen(false);

        setOpenSubMenus({});

    };


    /* ========================================================
    | TOGGLE SUB MENU
    ======================================================== */

    const toggleSubMenu = (menuKey) => {

        setOpenSubMenus(prev => ({

            ...prev,

            [menuKey]:
                !prev[menuKey],

        }));

    };


    /* ========================================================
    | CLOSE MENU WHEN ROUTE CHANGES
    ======================================================== */

    useEffect(() => {

        setIsOpen(false);

        setOpenSubMenus({});

    }, [pathname]);


    /* ========================================================
    | RENDER
    ======================================================== */

    return (

        <>

            {/* ==================================================
                BACKDROP
            ================================================== */}

            <AnimatePresence>

                {isOpen && (

                    <motion.div

                        initial={{
                            opacity: 0,
                        }}

                        animate={{
                            opacity: 1,
                        }}

                        exit={{
                            opacity: 0,
                        }}

                        onClick={closeAll}

                        className="
                            fixed
                            inset-0
                            bg-[#243B72]/20
                            backdrop-blur-[3px]
                            z-[998]
                            md:hidden
                        "
                    />

                )}

            </AnimatePresence>


            {/* ==================================================
                MENU PANEL
            ================================================== */}

            <AnimatePresence>

                {isOpen && (

                    <motion.div

                        initial={{
                            y: 30,
                            opacity: 0,
                            scale: 0.97,
                        }}

                        animate={{
                            y: 0,
                            opacity: 1,
                            scale: 1,
                        }}

                        exit={{
                            y: 30,
                            opacity: 0,
                            scale: 0.97,
                        }}

                        transition={{
                            duration: 0.2,
                            ease: 'easeOut',
                        }}

                        className="
                            fixed
                            bottom-[5.75rem]
                            left-4
                            right-4
                            z-[999]

                            bg-white

                            rounded-[1.75rem]

                            border
                            border-slate-200

                            shadow-[0_20px_50px_rgba(36,59,114,0.18)]

                            overflow-hidden

                            md:hidden
                        "
                    >

                        {/* ==================================================
                            PANEL HEADER
                        ================================================== */}

                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                px-5
                                py-4

                                border-b
                                border-slate-100
                            "
                        >

                            <div>

                                <h3
                                    className="
                                        text-sm
                                        font-bold
                                        text-[#243B72]
                                    "
                                >
                                    Menu Aplikasi
                                </h3>

                                <p
                                    className="
                                        mt-0.5
                                        text-[10px]
                                        text-slate-400
                                    "
                                >
                                    Pilih menu yang ingin dibuka
                                </p>

                            </div>


                            {/* CLOSE */}

                            <button
                                type="button"
                                onClick={closeAll}

                                className="
                                    flex
                                    items-center
                                    justify-center
                                    w-8
                                    h-8
                                    rounded-xl

                                    bg-slate-50
                                    text-slate-400

                                    hover:bg-[#243B72]
                                    hover:text-white

                                    transition-all
                                "
                            >

                                <X
                                    size={16}
                                />

                            </button>

                        </div>


                        {/* ==================================================
                            MENU LIST
                        ================================================== */}

                        <div
                            className="
                                p-4
                                max-h-[65vh]
                                overflow-y-auto
                                custom-scrollbar
                            "
                        >

                            <div className="space-y-1.5">

                                {menus.map(
                                    (menu, i) => (

                                        <BottomNavItem

                                            key={
                                                menu.id ||
                                                i
                                            }

                                            menu={menu}

                                            pathname={
                                                pathname
                                            }

                                            toggleSubMenu={
                                                toggleSubMenu
                                            }

                                            openSubMenus={
                                                openSubMenus
                                            }

                                            closeAll={
                                                closeAll
                                            }

                                        />

                                    )
                                )}

                            </div>


                            {/* EMPTY */}

                            {!menus.length && (

                                <div
                                    className="
                                        py-8
                                        text-center
                                    "
                                >

                                    <p
                                        className="
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Belum ada menu.
                                    </p>

                                </div>

                            )}

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>


            {/* ==================================================
                BOTTOM NAVIGATION
            ================================================== */}

            <nav
                className="
                    fixed
                    bottom-0
                    left-0
                    right-0

                    z-[1000]

                    md:hidden

                    px-4
                    pb-[max(0.75rem,env(safe-area-inset-bottom))]
                    pt-2
                "
            >

                <div
                    className="
                        relative
                        h-16

                        bg-white

                        border
                        border-slate-200

                        rounded-[1.5rem]

                        shadow-[0_8px_30px_rgba(36,59,114,0.12)]
                    "
                >

                    <div
                        className="
                            relative
                            flex
                            items-center
                            justify-between
                            h-full
                            px-8
                        "
                    >

                        {/* ==================================================
                            HOME
                        ================================================== */}

                        <NavLink
                            to="dashboard"

                            className={({ isActive }) => `

                                relative

                                flex
                                items-center
                                justify-center

                                w-11
                                h-11

                                rounded-xl

                                transition-all

                                ${
                                    isActive
                                        ? `
                                            bg-[#EFF6FF]
                                            text-[#2563EB]
                                          `
                                        : `
                                            text-slate-400
                                            hover:text-[#243B72]
                                          `
                                }

                            `}
                        >

                            {({ isActive }) => (

                                <>
                                    <Home
                                        size={21}
                                        strokeWidth={
                                            isActive
                                                ? 2.5
                                                : 2
                                        }
                                    />

                                    {isActive && (

                                        <span
                                            className="
                                                absolute
                                                -bottom-1
                                                w-1
                                                h-1
                                                rounded-full
                                                bg-[#2563EB]
                                            "
                                        />

                                    )}

                                </>

                            )}

                        </NavLink>


                        {/* ==================================================
                            CENTER MENU BUTTON
                        ================================================== */}

                        <div
                            className="
                                relative
                                -mt-8
                            "
                        >

                            <button

                                type="button"

                                onClick={() =>
                                    setIsOpen(
                                        !isOpen
                                    )
                                }

                                aria-label={
                                    isOpen
                                        ? 'Tutup menu'
                                        : 'Buka menu'
                                }

                                className={`
                                    relative
                                    flex
                                    items-center
                                    justify-center

                                    w-14
                                    h-14

                                    rounded-2xl

                                    border-4
                                    border-white

                                    shadow-[0_8px_20px_rgba(37,99,235,0.28)]

                                    transition-all
                                    duration-200

                                    active:scale-90

                                    ${
                                        isOpen
                                            ? `
                                                bg-[#243B72]
                                                text-white
                                              `
                                            : `
                                                bg-[#2563EB]
                                                text-white
                                              `
                                    }
                                `}
                            >

                                <motion.div
                                    animate={{
                                        rotate:
                                            isOpen
                                                ? 90
                                                : 0,
                                    }}

                                    transition={{
                                        duration: 0.2,
                                    }}
                                >

                                    {isOpen ? (

                                        <X
                                            size={24}
                                            strokeWidth={2.5}
                                        />

                                    ) : (

                                        <LayoutGrid
                                            size={24}
                                            strokeWidth={2.5}
                                        />

                                    )}

                                </motion.div>

                            </button>

                        </div>


                        {/* ==================================================
                            PROFILE
                        ================================================== */}

                        <NavLink
                            to="/profile"

                            className={({ isActive }) => `

                                relative

                                flex
                                items-center
                                justify-center

                                w-11
                                h-11

                                rounded-xl

                                transition-all

                                ${
                                    isActive
                                        ? `
                                            bg-[#EFF6FF]
                                            text-[#2563EB]
                                          `
                                        : `
                                            text-slate-400
                                            hover:text-[#243B72]
                                          `
                                }

                            `}
                        >

                            {({ isActive }) => (

                                <>
                                    <User
                                        size={21}
                                        strokeWidth={
                                            isActive
                                                ? 2.5
                                                : 2
                                        }
                                    />

                                    {isActive && (

                                        <span
                                            className="
                                                absolute
                                                -bottom-1
                                                w-1
                                                h-1
                                                rounded-full
                                                bg-[#2563EB]
                                            "
                                        />

                                    )}

                                </>

                            )}

                        </NavLink>

                    </div>

                </div>

            </nav>

        </>

    );
}