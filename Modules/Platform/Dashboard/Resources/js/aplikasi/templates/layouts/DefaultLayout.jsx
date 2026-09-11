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
    */

    const menus = Array.isArray(userMenus)
        ? userMenus
        : [];


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

        print:block
        print:h-auto
        print:min-h-0
        print:overflow-visible
        print:bg-white
    "
>

            {/* ==============================================================
                TOP NAVBAR
            ============================================================== */}

            <div className="print:hidden">

                <TopNavbar
                    user={user}
                />

            </div>


            {/* ==============================================================
                BODY
            ============================================================== */}

            <div
                className="
                    flex
                    flex-1
                    overflow-hidden
                    print:block
                    print:w-full
                    print:overflow-visible
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
                            print:hidden

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

                        print:block
                        print:w-full
                        print:max-w-none
                        print:overflow-visible
                        print:bg-white
                    "
                >

                    <div
                        className="
                            p-4
                            md:p-8
                            max-w-7xl
                            mx-auto

                            print:w-full
                            print:max-w-none
                            print:m-0
                            print:p-0
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
                                    opacity: 1,
                                    y: 0,
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}

                                exit={{
                                    opacity: 1,
                                    y: 0,
                                }}

                                transition={{
                                    duration: 0,
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

                <div className="print:hidden">

                    <BottomNavbar
                        menus={
                            menus
                        }
                    />

                </div>

            )}

        </div>
    );
}