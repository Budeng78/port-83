import React, {
    useState,
    useEffect,
} from 'react';

import {
    Outlet,
    useLocation,
} from 'react-router-dom';

import {
    AnimatePresence,
    motion,
} from 'framer-motion';

import {
    useAuth,
} from '@Modules/Platform/Auth/Resources/js/aplikasi/context/AuthContext';

import TopNavbar from './navbar/TopNavbar';
import SideNavbar from './navbar/SideNavbar';
import BottomNavbar from './navbar/BottomNavbar';


export default function DefaultLayout() {

    /*
    |--------------------------------------------------------------------------
    | AUTH
    |--------------------------------------------------------------------------
    */

    const {
        user,
        userMenus = [],
        hasPermission,
    } = useAuth();


    /*
    |--------------------------------------------------------------------------
    | LOCATION
    |--------------------------------------------------------------------------
    */

    const location = useLocation();


    /*
    |--------------------------------------------------------------------------
    | SIDEBAR STATE
    |--------------------------------------------------------------------------
    */

    const [
        isCollapsed,
        setIsCollapsed,
    ] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | MOBILE STATE
    |--------------------------------------------------------------------------
    */

    const [
        isMobile,
        setIsMobile,
    ] = useState(
        typeof window !== 'undefined'
            ? window.innerWidth < 768
            : false
    );


    /*
    |--------------------------------------------------------------------------
    | RESPONSIVE
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const handleResize = () => {

            setIsMobile(
                window.innerWidth < 768
            );

        };


        window.addEventListener(
            'resize',
            handleResize
        );


        return () => {

            window.removeEventListener(
                'resize',
                handleResize
            );

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | NORMALIZE USER MENU
    |--------------------------------------------------------------------------
    |
    | Sumber menu hanya dari AuthContext.
    |
    */

    const menus = Array.isArray(userMenus)
        ? userMenus
        : [];


    /*
    |--------------------------------------------------------------------------
    | DEBUG
    |--------------------------------------------------------------------------
    */

    useEffect(() => {


    }, [
        user,
        menus,
    ]);


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div
            className="
                flex
                flex-col
                h-screen
                overflow-hidden
                bg-slate-50
                antialiased
            "
        >

            {/* ==============================================================
                TOP NAVBAR
            ============================================================== */}

            <TopNavbar
                user={user}
            />


            {/* ==============================================================
                BODY
            ============================================================== */}

            <div
                className="
                    flex
                    flex-1
                    overflow-hidden
                "
            >

                {/* ==========================================================
                    DESKTOP SIDEBAR
                =========================================================== */}

                {!isMobile && (

                    <aside
                        className={`
                            bg-white
                            border-r
                            border-slate-200
                            transition-all
                            duration-300

                            ${
                                isCollapsed
                                    ? 'w-20'
                                    : 'w-64'
                            }
                        `}
                    >

                        <SideNavbar
                            isCollapsed={
                                isCollapsed
                            }

                            setIsCollapsed={
                                setIsCollapsed
                            }

                            menus={
                                menus
                            }
                        />

                    </aside>

                )}


                {/* ==========================================================
                    MAIN CONTENT
                =========================================================== */}

                <main
                    className="
                        flex-1
                        overflow-y-auto
                        bg-slate-50
                    "
                >

                    <div
                        className="
                            p-4
                            md:p-8
                            max-w-7xl
                            mx-auto
                        "
                    >

                        <AnimatePresence
                            mode="wait"
                        >

                            <motion.div

                                key={
                                    location.pathname
                                }

                                initial={{
                                    opacity: 0,
                                    y: 5,
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}

                                exit={{
                                    opacity: 0,
                                    y: -5,
                                }}

                                transition={{
                                    duration: 0.15,
                                }}
                            >

                                <Outlet
                                    context={{
                                        user,
                                        hasPermission,
                                    }}
                                />

                            </motion.div>

                        </AnimatePresence>

                    </div>

                </main>

            </div>


            {/* ==============================================================
                MOBILE BOTTOM NAVBAR
            ============================================================== */}

            {isMobile && (

                <BottomNavbar
                    menus={
                        menus
                    }
                />

            )}

        </div>
    );
}