import React, { useState, useRef, useEffect } from 'react';
import {
    Bell,
    User,
    Settings,
    LogOut,
    ChevronDown,
    ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@Modules/Auth/Resources/js/aplikasi/context/AuthContext';

import LogoWartono from '../../components/logo_mc-wartono.png';


export default function TopNavbar() {

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const [isOpen, setIsOpen] = useState(false);

    const dropdownRef = useRef(null);


    // =====================================================
    // CLOSE DROPDOWN KETIKA KLIK DI LUAR
    // =====================================================

    useEffect(() => {

        const handleClickOutside = (event) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }

        };

        document.addEventListener(
            'mousedown',
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                'mousedown',
                handleClickOutside
            );

        };

    }, []);


    // =====================================================
    // USER DATA
    // =====================================================

    const userName =
        user?.name ||
        'Master Admin';

    const userEmail =
        user?.email ||
        'admin@system.com';

    const userRole =
        user?.role ||
        user?.roles?.[0]?.name ||
        'Super Admin';


    const userInitial =
        userName
            .trim()
            .charAt(0)
            .toUpperCase();


    // =====================================================
    // LOGOUT
    // =====================================================

    const handleLogoutClick = async () => {

        setIsOpen(false);

        try {

            await logout();

        } catch (error) {

            console.error(
                'Logout gagal:',
                error
            );

        }

    };


    // =====================================================
    // PROFILE
    // =====================================================

    const goToProfile = () => {

        setIsOpen(false);

        navigate('/profil');

    };


    // =====================================================
    // SETTINGS
    // =====================================================

    const goToSettings = () => {

        setIsOpen(false);

        navigate('/pengaturan');

    };


    return (

        <nav
            className="
                w-full
                h-16

                sticky
                top-0

                z-[1020]

                flex
                items-center
                justify-between

                px-3
                sm:px-4
                md:px-8

                bg-gradient-to-r
                from-[#081a4d]
                via-[#1e3a8a]
                to-[#3b82f6]

                shadow-lg

                border-b
                border-white/10

                select-none
            "
        >

            {/* =================================================
                LEFT SIDE
            ================================================= */}

            <div className="flex items-center min-w-0">

                {/* LOGO */}

                <div
                    className="
                        flex
                        items-center
                        justify-center

                        shrink-0
                    "
                >

                    <img
                        src={LogoWartono}
                        alt="PT. Sukun Wartono Indonesia"
                        className="
                            h-9
                            sm:h-10

                            w-auto

                            object-contain
                        "
                    />

                </div>


                {/* SEPARATOR */}

                <div
                    className="
                        hidden
                        md:block

                        h-8
                        w-px

                        bg-white/20

                        mx-4
                    "
                />


                {/* COMPANY NAME */}

                <div
                    className="
                        hidden
                        md:block

                        min-w-0
                    "
                >

                    <h1
                        className="
                            text-lg
                            lg:text-xl

                            font-black

                            text-white

                            uppercase
                            italic

                            tracking-tight

                            leading-none

                            truncate
                        "
                    >
                        PT. Sukun Wartono Indonesia
                    </h1>


                    <p
                        className="
                            text-[9px]

                            text-blue-200

                            font-semibold

                            tracking-[0.25em]

                            uppercase

                            mt-1
                        "
                    >
                        Integrated Management System
                    </p>

                </div>

            </div>


            {/* =================================================
                RIGHT SIDE
            ================================================= */}

            <div
                className="
                    flex
                    items-center

                    gap-1
                    sm:gap-2
                "
            >

                {/* =================================================
                    NOTIFICATION
                ================================================= */}

                <button
                    type="button"

                    className="
                        relative

                        flex
                        items-center
                        justify-center

                        w-10
                        h-10

                        rounded-xl

                        text-white/80

                        hover:text-white

                        hover:bg-white/10

                        active:scale-95

                        transition-all
                    "

                    aria-label="Notifikasi"
                >

                    <Bell
                        size={20}
                        strokeWidth={2}
                    />


                    {/* NOTIFICATION DOT */}

                    <span
                        className="
                            absolute

                            top-2
                            right-2

                            w-2
                            h-2

                            bg-amber-400

                            rounded-full

                            ring-2
                            ring-[#1e3a8a]
                        "
                    />

                </button>


                {/* =================================================
                    USER DROPDOWN
                ================================================= */}

                <div
                    ref={dropdownRef}
                    className="relative"
                >

                    <button
                        type="button"

                        onClick={() =>
                            setIsOpen(
                                prev => !prev
                            )
                        }

                        className="
                            flex
                            items-center

                            gap-2
                            sm:gap-3

                            p-1

                            rounded-2xl

                            hover:bg-white/10

                            active:scale-[0.98]

                            transition-all
                        "
                    >

                        {/* USER INFORMATION */}

                        <div
                            className="
                                hidden
                                sm:block

                                text-right

                                max-w-[180px]
                                lg:max-w-[220px]
                            "
                        >

                            <p
                                className="
                                    text-sm

                                    font-black

                                    text-white

                                    leading-none

                                    truncate
                                "
                            >
                                {userName}
                            </p>


                            <div
                                className="
                                    flex
                                    items-center
                                    justify-end

                                    gap-1

                                    mt-1
                                "
                            >

                                <ShieldCheck
                                    size={11}
                                    className="text-blue-200"
                                />

                                <p
                                    className="
                                        text-[9px]

                                        text-blue-200

                                        font-bold

                                        uppercase

                                        tracking-widest

                                        truncate
                                    "
                                >
                                    {userRole}
                                </p>

                            </div>

                        </div>


                        {/* =================================================
                            AVATAR
                        ================================================= */}

                        <div
                            className="
                                relative

                                w-9
                                h-9

                                sm:w-10
                                sm:h-10

                                rounded-xl

                                bg-white

                                flex
                                items-center
                                justify-center

                                shadow-md

                                overflow-hidden
                            "
                        >

                            {user?.avatar ? (

                                <img
                                    src={user.avatar}
                                    alt={userName}

                                    className="
                                        w-full
                                        h-full

                                        object-cover
                                    "
                                />

                            ) : (

                                <span
                                    className="
                                        text-[#081a4d]

                                        font-black

                                        text-sm
                                        sm:text-base
                                    "
                                >
                                    {userInitial}
                                </span>

                            )}


                            {/* ONLINE STATUS */}

                            <span
                                className="
                                    absolute

                                    right-[-1px]
                                    bottom-[-1px]

                                    w-2.5
                                    h-2.5

                                    rounded-full

                                    bg-emerald-400

                                    ring-2
                                    ring-white
                                "
                            />

                        </div>


                        {/* CHEVRON */}

                        <ChevronDown
                            size={15}

                            className={`
                                hidden
                                sm:block

                                text-white/70

                                transition-transform
                                duration-300

                                ${
                                    isOpen
                                        ? 'rotate-180'
                                        : ''
                                }
                            `}
                        />

                    </button>


                    {/* =================================================
                        DROPDOWN
                    ================================================= */}

                    <AnimatePresence>

                        {isOpen && (

                            <motion.div

                                initial={{
                                    opacity: 0,
                                    y: 8,
                                    scale: 0.97,
                                }}

                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                }}

                                exit={{
                                    opacity: 0,
                                    y: 8,
                                    scale: 0.97,
                                }}

                                transition={{
                                    duration: 0.18,
                                }}

                                className="
                                    absolute

                                    right-0

                                    mt-2

                                    w-[calc(100vw-1.5rem)]
                                    max-w-[280px]

                                    bg-white

                                    rounded-2xl

                                    shadow-2xl

                                    border
                                    border-slate-100

                                    overflow-hidden

                                    z-[1100]
                                "
                            >

                                {/* =================================================
                                    USER HEADER
                                ================================================= */}

                                <div
                                    className="
                                        px-4
                                        py-4

                                        bg-gradient-to-r
                                        from-slate-50
                                        to-blue-50

                                        border-b
                                        border-slate-100
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center

                                            gap-3
                                        "
                                    >

                                        <div
                                            className="
                                                w-10
                                                h-10

                                                rounded-xl

                                                bg-gradient-to-br
                                                from-[#081a4d]
                                                to-[#3b82f6]

                                                flex
                                                items-center
                                                justify-center

                                                text-white

                                                font-black

                                                shadow-sm
                                            "
                                        >
                                            {userInitial}
                                        </div>


                                        <div
                                            className="
                                                min-w-0
                                            "
                                        >

                                            <p
                                                className="
                                                    text-sm

                                                    font-black

                                                    text-slate-800

                                                    truncate
                                                "
                                            >
                                                {userName}
                                            </p>


                                            <p
                                                className="
                                                    text-[11px]

                                                    text-slate-500

                                                    truncate
                                                "
                                            >
                                                {userEmail}
                                            </p>

                                        </div>

                                    </div>

                                </div>


                                {/* =================================================
                                    MENU
                                ================================================= */}

                                <div
                                    className="
                                        p-2

                                        space-y-1
                                    "
                                >

                                    {/* PROFILE */}

                                    <button
                                        type="button"

                                        onClick={goToProfile}

                                        className="
                                            w-full

                                            flex
                                            items-center

                                            gap-3

                                            px-3
                                            py-2.5

                                            text-sm

                                            font-semibold

                                            text-slate-600

                                            hover:bg-blue-50
                                            hover:text-blue-600

                                            active:bg-blue-100

                                            rounded-xl

                                            transition-all

                                            text-left
                                        "
                                    >

                                        <div
                                            className="
                                                w-8
                                                h-8

                                                rounded-lg

                                                bg-blue-50

                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >

                                            <User
                                                size={16}
                                                className="text-blue-600"
                                            />

                                        </div>

                                        <span>
                                            Profil Saya
                                        </span>

                                    </button>


                                    {/* SETTINGS */}

                                    <button
                                        type="button"

                                        onClick={goToSettings}

                                        className="
                                            w-full

                                            flex
                                            items-center

                                            gap-3

                                            px-3
                                            py-2.5

                                            text-sm

                                            font-semibold

                                            text-slate-600

                                            hover:bg-blue-50
                                            hover:text-blue-600

                                            active:bg-blue-100

                                            rounded-xl

                                            transition-all

                                            text-left
                                        "
                                    >

                                        <div
                                            className="
                                                w-8
                                                h-8

                                                rounded-lg

                                                bg-slate-100

                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >

                                            <Settings
                                                size={16}
                                                className="text-slate-600"
                                            />

                                        </div>

                                        <span>
                                            Pengaturan Akun
                                        </span>

                                    </button>


                                    {/* SEPARATOR */}

                                    <div
                                        className="
                                            h-px

                                            bg-slate-100

                                            my-1
                                        "
                                    />


                                    {/* LOGOUT */}

                                    <button
                                        type="button"

                                        onClick={
                                            handleLogoutClick
                                        }

                                        className="
                                            w-full

                                            flex
                                            items-center

                                            gap-3

                                            px-3
                                            py-2.5

                                            text-sm

                                            font-semibold

                                            text-rose-600

                                            hover:bg-rose-50

                                            active:bg-rose-100

                                            rounded-xl

                                            transition-all

                                            text-left
                                        "
                                    >

                                        <div
                                            className="
                                                w-8
                                                h-8

                                                rounded-lg

                                                bg-rose-50

                                                flex
                                                items-center
                                                justify-center
                                            "
                                        >

                                            <LogOut
                                                size={16}
                                                className="text-rose-600"
                                            />

                                        </div>

                                        <span>
                                            Keluar Sistem
                                        </span>

                                    </button>

                                </div>


                                {/* =================================================
                                    FOOTER
                                ================================================= */}

                                <div
                                    className="
                                        px-4
                                        py-2.5

                                        bg-slate-50

                                        border-t
                                        border-slate-100

                                        text-center
                                    "
                                >

                                    <p
                                        className="
                                            text-[9px]

                                            text-slate-400

                                            font-semibold

                                            uppercase

                                            tracking-widest
                                        "
                                    >
                                        Integrated Management System
                                    </p>

                                </div>

                            </motion.div>

                        )}

                    </AnimatePresence>

                </div>

            </div>

        </nav>

    );

}