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
    Home,
    User,
    LayoutGrid,
    X,
    ChevronRight,
} from 'lucide-react';

import { DynamicIcon } from '../DynamicIcon';


/*
|--------------------------------------------------------------------------
| THEME
|--------------------------------------------------------------------------
|
| Navy       : #243B72
| Blue       : #2563EB
| Blue Light : #EFF6FF
| Background : #F8FAFC
|
*/


/* ==========================================================================
| BOTTOM MENU ITEM
========================================================================== */

const BottomNavItem = ({
    menu,
    pathname,
    toggleSubMenu,
    openSubMenus,
    closeAll,
}) => {

    /*
    |--------------------------------------------------------------------------
    | CHILDREN
    |--------------------------------------------------------------------------
    */

    const hasChild =
        Array.isArray(menu.children) &&
        menu.children.length > 0;


    /*
    |--------------------------------------------------------------------------
    | MENU KEY
    |--------------------------------------------------------------------------
    */

    const menuKey =
        menu.id ||
        menu.label;


    /*
    |--------------------------------------------------------------------------
    | SUB MENU STATE
    |--------------------------------------------------------------------------
    */

    const isSubOpen =
        !!openSubMenus[menuKey];


    /*
    |--------------------------------------------------------------------------
    | ACTIVE CHECK
    |--------------------------------------------------------------------------
    */

    const checkActive = (item) => {

        if (
            item?.path &&
            pathname === item.path
        ) {
            return true;
        }


        if (
            Array.isArray(item?.children) &&
            item.children.length > 0
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
    | CLICK
    |--------------------------------------------------------------------------
    */

    const handleClick = (event) => {

        /*
        | Parent menu
        */

        if (hasChild) {

            event.preventDefault();

            toggleSubMenu(
                menuKey
            );

            return;

        }


        /*
        | Leaf menu
        */

        if (menu.path) {

            closeAll();

        }

    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div className="overflow-hidden">

            {/* ==================================================================
                MAIN MENU
            ================================================================== */}

            <NavLink

                to={
                    hasChild
                        ? '#'
                        : menu.path || '#'
                }

                onClick={
                    handleClick
                }

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

                {/* ==============================================================
                    ICON + LABEL
                ============================================================== */}

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        min-w-0
                    "
                >

                    {/* ICON */}

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
                                name={
                                    menu.icon
                                }
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
                                strokeWidth={2}
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
                                    ? `
                                        font-semibold
                                        text-[#243B72]
                                      `
                                    : `
                                        font-medium
                                      `
                            }
                        `}
                    >
                        {menu.label}
                    </span>

                </div>


                {/* ==============================================================
                    CHEVRON
                ============================================================== */}

                {hasChild && (

                    <ChevronRight
                        size={16}
                        strokeWidth={2}

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

            </NavLink>


            {/* ==================================================================
                CHILDREN
            ================================================================== */}

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

                            <div
                                className="
                                    space-y-1
                                "
                            >

                                {menu.children.map(
                                    (
                                        child,
                                        index
                                    ) => (

                                        <BottomNavItem

                                            key={
                                                child.id ||
                                                `${menuKey}-${index}`
                                            }

                                            menu={
                                                child
                                            }

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


/* ==========================================================================
| BOTTOM NAVBAR
========================================================================== */

export default function BottomNavbar({
    menus = [],
}) {

    /*
    |--------------------------------------------------------------------------
    | ROUTER
    |--------------------------------------------------------------------------
    */

    const {
        pathname,
    } = useLocation();


    /*
    |--------------------------------------------------------------------------
    | STATE
    |--------------------------------------------------------------------------
    */

    const [
        isOpen,
        setIsOpen,
    ] = useState(false);


    const [
        openSubMenus,
        setOpenSubMenus,
    ] = useState({});


    /*
    |--------------------------------------------------------------------------
    | NORMALIZE MENUS
    |--------------------------------------------------------------------------
    */

    const normalizedMenus =
        Array.isArray(menus)
            ? menus
            : [];


    /*
    |--------------------------------------------------------------------------
    | AUTO OPEN ACTIVE PARENT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (!normalizedMenus.length) {
            return;
        }


        const newOpenMenus = {};


        const findActiveParents = (
            items,
            parents = []
        ) => {

            items.forEach(item => {

                /*
                | Current menu
                */

                if (
                    item?.path &&
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


                /*
                | Children
                */

                if (
                    Array.isArray(
                        item?.children
                    ) &&
                    item.children.length > 0
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
            normalizedMenus
        );


        setOpenSubMenus(
            prev => ({
                ...prev,
                ...newOpenMenus,
            })
        );


    }, [
        pathname,
        menus,
    ]);


    /*
    |--------------------------------------------------------------------------
    | CLOSE ALL
    |--------------------------------------------------------------------------
    */

    const closeAll = () => {

        setIsOpen(false);

        setOpenSubMenus({});

    };


    /*
    |--------------------------------------------------------------------------
    | TOGGLE SUB MENU
    |--------------------------------------------------------------------------
    */

    const toggleSubMenu = (
        menuKey
    ) => {

        setOpenSubMenus(
            prev => ({
                ...prev,
                [menuKey]:
                    !prev[menuKey],
            })
        );

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE WHEN ROUTE CHANGES
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        setIsOpen(false);

        setOpenSubMenus({});

    }, [
        pathname,
    ]);


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <>

            {/* ==================================================================
                BACKDROP
            ================================================================== */}

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

                        onClick={
                            closeAll
                        }

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


            {/* ==================================================================
                MENU PANEL
            ================================================================== */}

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

                        {/* ======================================================
                            HEADER
                        ====================================================== */}

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
                                    Menu sesuai akses pengguna
                                </p>

                            </div>


                            {/* CLOSE */}

                            <button

                                type="button"

                                onClick={
                                    closeAll
                                }

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


                        {/* ======================================================
                            MENU LIST
                        ====================================================== */}

                        <div
                            className="
                                p-4

                                max-h-[65vh]

                                overflow-y-auto

                                custom-scrollbar
                            "
                        >

                            {normalizedMenus.length > 0 ? (

                                <div
                                    className="
                                        space-y-1.5
                                    "
                                >

                                    {normalizedMenus.map(
                                        (
                                            menu,
                                            index
                                        ) => (

                                            <BottomNavItem

                                                key={
                                                    menu.id ||
                                                    index
                                                }

                                                menu={
                                                    menu
                                                }

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

                            ) : (

                                /* ==================================================
                                    EMPTY
                                ================================================== */

                                <div
                                    className="
                                        py-10
                                        text-center
                                    "
                                >

                                    <div
                                        className="
                                            w-10
                                            h-10

                                            mx-auto
                                            mb-3

                                            rounded-xl

                                            bg-slate-100

                                            flex
                                            items-center
                                            justify-center
                                        "
                                    >

                                        <LayoutGrid
                                            size={18}
                                            className="
                                                text-slate-400
                                            "
                                        />

                                    </div>


                                    <p
                                        className="
                                            text-xs
                                            font-medium
                                            text-slate-500
                                        "
                                    >
                                        Belum ada menu.
                                    </p>


                                    <p
                                        className="
                                            mt-1
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        Menu akan tampil sesuai
                                        User Menu.
                                    </p>

                                </div>

                            )}

                        </div>

                    </motion.div>

                )}

            </AnimatePresence>


            {/* ==================================================================
                BOTTOM NAVIGATION
            ================================================================== */}

            <nav
                className="
                    fixed

                    -bottom-px
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

                        {/* ======================================================
                            HOME
                        ====================================================== */}

                        <NavLink
                            to="/dashboard"

                            onClick={
                                closeAll
                            }

                            className={({
                                isActive,
                            }) => `

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

                            {({
                                isActive,
                            }) => (

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


                        {/* ======================================================
                            CENTER MENU BUTTON
                        ====================================================== */}

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
                                        prev =>
                                            !prev
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


                        {/* ======================================================
                            PROFILE
                        ====================================================== */}

                        <NavLink
                            to="/profile"

                            onClick={
                                closeAll
                            }

                            className={({
                                isActive,
                            }) => `

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

                            {({
                                isActive,
                            }) => (

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