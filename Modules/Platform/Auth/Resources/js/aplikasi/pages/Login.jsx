
import React, { useState } from 'react';
import { LogIn, ArrowLeft, Loader2 } from 'lucide-react';

import api, {
    csrf
} from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

import {
    useAuth
} from '@Modules/Platform/Auth/Resources/js/aplikasi/context/AuthContext';


export default function Login() {

    const [loading, setLoading] = useState(false);

    const [noWhatsapp, setNoWhatsapp] = useState('');

    const [password, setPassword] = useState('');

    const { login } = useAuth();


    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();

        if (loading) return;

        setLoading(true);


        try {

            // -------------------------------------------------
            // CSRF
            // -------------------------------------------------

            if (typeof csrf === 'function') {
                await csrf();
            }


            // -------------------------------------------------
            // REQUEST LOGIN
            // -------------------------------------------------

            const res = await api.post(
                '/app/login',
                {
                    identity: noWhatsapp,
                    password,
                }
            );


            // -------------------------------------------------
            // DATA LOGIN
            // -------------------------------------------------

            const {
                user,
                access_token,
            } = res.data;


            console.log(
                'USER DATA HASIL LOGIN:',
                user
            );


            // -------------------------------------------------
            // VALIDASI RESPONSE
            // -------------------------------------------------

            if (!user || !access_token) {

                throw new Error(
                    'Data user atau access token tidak ditemukan.'
                );

            }


            // -------------------------------------------------
            // SIMPAN KE AUTH CONTEXT
            //
            // Ini yang sebelumnya terlewat.
            // AuthContext akan:
            // - menyimpan access_token
            // - menyimpan user_data
            // - mengisi state user
            // - memasang Authorization header
            // -------------------------------------------------

            const result = login(
                user,
                access_token
            );


            if (!result?.success) {

                throw new Error(
                    result?.message ||
                    'Login tidak berhasil.'
                );

            }


            // -------------------------------------------------
            // CEK DATA USER YANG AKAN DIPAKAI NAVBAR
            // -------------------------------------------------

                    console.log('USER LOGIN:', user);



            // -------------------------------------------------
            // LOGIN BERHASIL
            // -------------------------------------------------

            alert(
                `Login Berhasil! Selamat datang, ${
                    user?.name || 'Pengguna'
                }`
            );


            // -------------------------------------------------
            // MASUK DASHBOARD
            // -------------------------------------------------

            window.location.href =
                '/app/Platform/dashboard';


        } catch (err) {

            console.error(
                'Error login:',
                err.response?.data || err
            );


            alert(
                err.response?.data?.message ||
                err.message ||
                'Login gagal, periksa kredensial bapak.'
            );


        } finally {

            setLoading(false);

        }

    };


    return (

        <div
            className="
                min-h-screen

                flex
                items-center
                justify-center

                bg-slate-50

                px-4
                py-8

                relative
                overflow-hidden
            "
        >

            {/* BACKGROUND */}

            <div
                className="
                    absolute
                    -top-32
                    -right-32

                    w-96
                    h-96

                    rounded-full

                    bg-blue-600/10

                    blur-3xl
                "
            />

            <div
                className="
                    absolute
                    -bottom-40
                    -left-40

                    w-[30rem]
                    h-[30rem]

                    rounded-full

                    bg-indigo-900/10

                    blur-3xl
                "
            />


            {/* LOGIN CONTAINER */}

            <div
                className="
                    relative
                    z-10

                    w-full
                    max-w-md
                "
            >

                {/* HEADER */}

                <div
                    className="
                        text-center
                        mb-8
                    "
                >

                    <div
                        className="
                            inline-flex
                            items-center
                            justify-center

                            w-16
                            h-16

                            rounded-2xl

                            bg-gradient-to-br
                            from-[#081a4d]
                            via-[#1e3a8a]
                            to-[#2563eb]

                            text-white

                            shadow-xl
                            shadow-blue-900/20

                            mb-5
                        "
                    >

                        <span
                            className="
                                text-xl
                                font-extrabold
                                tracking-tight
                            "
                        >
                            SWI
                        </span>

                    </div>


                    <h1
                        className="
                            text-3xl
                            font-extrabold
                            tracking-tight
                            text-slate-900
                        "
                    >
                        Portal Login
                    </h1>


                    <p
                        className="
                            mt-2

                            text-xs
                            font-semibold

                            text-slate-400

                            uppercase

                            tracking-[0.18em]
                        "
                    >
                        Node Primary PT Sukun Wartono Indonesia
                    </p>

                </div>


                {/* CARD */}

                <div
                    className="
                        bg-white

                        border
                        border-slate-200/80

                        rounded-3xl

                        p-7
                        sm:p-8

                        shadow-xl
                        shadow-slate-200/60
                    "
                >

                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >

                        {/* IDENTITY */}

                        <div>

                            <label
                                className="
                                    block

                                    mb-2
                                    ml-1

                                    text-xs
                                    font-semibold

                                    text-slate-600
                                "
                            >
                                Email atau WhatsApp
                            </label>


                            <input
                                type="text"

                                name="no_whatsapp"

                                autoComplete="username"

                                value={noWhatsapp}

                                onChange={(e) =>
                                    setNoWhatsapp(
                                        e.target.value
                                    )
                                }

                                className="
                                    w-full
                                    h-12

                                    px-4

                                    rounded-xl

                                    bg-slate-50

                                    border
                                    border-slate-200

                                    text-sm
                                    font-medium
                                    text-slate-800

                                    placeholder:text-slate-400

                                    outline-none

                                    transition-all

                                    focus:bg-white

                                    focus:border-blue-500

                                    focus:ring-4
                                    focus:ring-blue-500/10
                                "

                                placeholder="email@email.com / 0812345678"

                                required
                            />

                        </div>


                        {/* PASSWORD */}

                        <div>

                            <label
                                className="
                                    block

                                    mb-2
                                    ml-1

                                    text-xs
                                    font-semibold

                                    text-slate-600
                                "
                            >
                                Password
                            </label>


                            <input
                                type="password"

                                name="password"

                                autoComplete="current-password"

                                value={password}

                                onChange={(e) =>
                                    setPassword(
                                        e.target.value
                                    )
                                }

                                className="
                                    w-full
                                    h-12

                                    px-4

                                    rounded-xl

                                    bg-slate-50

                                    border
                                    border-slate-200

                                    text-sm
                                    font-medium
                                    text-slate-800

                                    placeholder:text-slate-400

                                    outline-none

                                    transition-all

                                    focus:bg-white

                                    focus:border-blue-500

                                    focus:ring-4
                                    focus:ring-blue-500/10
                                "

                                placeholder="••••••••"

                                required
                            />

                        </div>


                        {/* LOGIN BUTTON */}

                        <button
                            type="submit"

                            disabled={loading}

                            className="
                                w-full
                                h-12

                                mt-2

                                rounded-xl

                                bg-gradient-to-r
                                from-[#081a4d]
                                via-[#1e3a8a]
                                to-[#2563eb]

                                text-white

                                text-sm
                                font-bold

                                shadow-lg
                                shadow-blue-900/20

                                transition-all

                                hover:shadow-xl
                                hover:-translate-y-0.5

                                active:translate-y-0

                                disabled:opacity-60
                                disabled:cursor-not-allowed

                                flex
                                items-center
                                justify-center

                                gap-2
                            "
                        >

                            {loading ? (

                                <>

                                    <Loader2
                                        size={18}
                                        className="animate-spin"
                                    />

                                    <span>
                                        Memverifikasi...
                                    </span>

                                </>

                            ) : (

                                <>

                                    <LogIn
                                        size={18}
                                    />

                                    <span>
                                        Masuk ke Sistem
                                    </span>

                                </>

                            )}

                        </button>

                    </form>


                    {/* REGISTER */}

                    <div
                        className="
                            mt-7
                            pt-6

                            border-t
                            border-slate-100

                            text-center
                        "
                    >

                        <span
                            className="
                                text-sm
                                text-slate-500
                            "
                        >
                            Belum punya akun?
                        </span>{' '}


                        <a
                            href="/register"

                            className="
                                text-sm
                                font-bold

                                text-blue-600

                                hover:text-blue-700

                                transition-colors
                            "
                        >
                            Daftar sekarang
                        </a>

                    </div>


                    {/* BACK */}

                    <div
                        className="
                            mt-5

                            text-center
                        "
                    >

                        <a
                            href="/"

                            className="
                                inline-flex
                                items-center

                                gap-1.5

                                text-xs
                                font-semibold

                                text-slate-400

                                hover:text-blue-600

                                transition-colors
                            "
                        >

                            <ArrowLeft
                                size={14}
                            />

                            Kembali ke halaman utama

                        </a>

                    </div>

                </div>


                {/* FOOTER */}

                <div
                    className="
                        mt-6

                        text-center

                        text-[11px]

                        text-slate-400
                    "
                >
                    PT Sukun Wartono Indonesia
                </div>

            </div>

        </div>

    );

}
