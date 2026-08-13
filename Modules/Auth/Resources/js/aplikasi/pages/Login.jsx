import React, { useState } from 'react';
import { useNavigate, BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { LogIn, ArrowLeft, Loader2 } from 'lucide-react';

import api, { csrf } from "@Modules/System/Resources/js/aplikasi/axios/axios";

// import AgreementModalLogin from "../components/modal/AgreementModalLogin";
// import PendingRegister from "../components/modal/PendingRegister";


export default function Login() {

    const navigate = useNavigate();

    // =====================================================
    // STATE
    // =====================================================

    const [loading, setLoading] = useState(false);

    const [showAgreement, setShowAgreement] = useState(false);
    const [latestTerm, setLatestTerm] = useState(null);
    const [userTemp, setUserTemp] = useState(null);

    const [isPendingModalOpen, setIsPendingModalOpen] = useState(false);
    const [pendingMessage, setPendingMessage] = useState('');

    const [noWhatsapp, setNoWhatsapp] = useState('');
    const [password, setPassword] = useState('');


    // =====================================================
    // LOGIN
    // =====================================================

    const handleLogin = async (e) => {

        e.preventDefault();
        setLoading(true);

        try {

            // -------------------------------------------------
            // CSRF
            // -------------------------------------------------

            if (typeof csrf === 'function') {
                await csrf();
            }


            // -------------------------------------------------
            // LOGIN API
            // -------------------------------------------------

            const res = await api.post('/app/login', {
                identity: noWhatsapp,
                password,
            });


            const {
                user,
                access_token,
                agreement_required,
                latest_term,
            } = res.data;


            // -------------------------------------------------
            // AGREEMENT REQUIRED
            // -------------------------------------------------

            if (agreement_required) {

                setLatestTerm(latest_term);
                setUserTemp(user);

                localStorage.setItem(
                    'temp_token',
                    access_token
                );

                setShowAgreement(true);
                setLoading(false);

                return;
            }


            // -------------------------------------------------
            // LOGIN SUCCESS
            // -------------------------------------------------

            localStorage.setItem(
                'access_token',
                access_token
            );

            alert(
                "Login Berhasil! Selamat datang, " +
                (user?.name || 'Pengguna')
            );

            window.location.href = '/app/dashboard';

            // navigate('/dashboard');

        } catch (err) {

            if (err.response?.status === 403) {

                setPendingMessage(
                    err.response.data.message
                );

                setIsPendingModalOpen(true);

            } else {

                console.error(
                    "error login:",
                    err.response?.data
                );

                alert(
                    err.response?.data?.message ||
                    "Login gagal, periksa kredensial bapak."
                );
            }

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // AGREEMENT SUCCESS
    // =====================================================

    const handleAgreementSuccess = async () => {

        setLoading(true);

        const tempToken =
            localStorage.getItem('temp_token');


        try {

            await api.post(
                '/user/legal-consent',
                {
                    term_id: latestTerm.id,
                    identity: noWhatsapp,
                },
                {
                    headers: {
                        Authorization:
                            `Bearer ${tempToken}`,
                    },
                }
            );


            setShowAgreement(false);

            localStorage.removeItem(
                'temp_token'
            );


            alert(
                "Terima kasih pak " +
                (userTemp?.name || '') +
                ", persetujuan telah dicatat. Silakan login kembali."
            );


            setNoWhatsapp('');
            setPassword('');

        } catch (err) {

            console.error(
                "gagal simpan consent:",
                err.response?.data
            );

            alert(
                "Gagal mencatat persetujuan, silakan coba lagi pak."
            );

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="
            min-h-screen
            flex
            items-center
            justify-center
            bg-slate-50
            px-4
            py-8
            relative
            overflow-hidden
        ">


            {/* =================================================
                BACKGROUND DECORATION
            ================================================= */}

            <div className="
                absolute
                -top-32
                -right-32
                w-96
                h-96
                rounded-full
                bg-blue-600/10
                blur-3xl
            " />

            <div className="
                absolute
                -bottom-40
                -left-40
                w-[30rem]
                h-[30rem]
                rounded-full
                bg-indigo-900/10
                blur-3xl
            " />


            {/* =================================================
                LOGIN CONTAINER
            ================================================= */}

            <div className="
                relative
                z-10
                w-full
                max-w-md
            ">


                {/* =================================================
                    BRAND
                ================================================= */}

                <div className="text-center mb-8">

                    {/* Logo */}

                    <div className="
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
                    ">

                        <span className="
                            text-xl
                            font-extrabold
                            tracking-tight
                        ">
                            SWI
                        </span>

                    </div>


                    {/* Title */}

                    <h1 className="
                        text-3xl
                        font-extrabold
                        tracking-tight
                        text-slate-900
                    ">
                        Portal Login
                    </h1>


                    {/* Subtitle */}

                    <p className="
                        mt-2
                        text-xs
                        font-semibold
                        text-slate-400
                        uppercase
                        tracking-[0.18em]
                    ">
                        Node Primary PT Sukun Wartono Indonesia
                    </p>

                </div>


                {/* =================================================
                    LOGIN CARD
                ================================================= */}

                <div className="
                    bg-white
                    border
                    border-slate-200/80
                    rounded-3xl
                    p-7
                    sm:p-8
                    shadow-xl
                    shadow-slate-200/60
                ">


                    {/* =================================================
                        FORM
                    ================================================= */}

                    <form
                        onSubmit={handleLogin}
                        className="space-y-5"
                    >


                        {/* =================================================
                            IDENTITY
                        ================================================= */}

                        <div>

                            <label className="
                                block
                                mb-2
                                ml-1
                                text-xs
                                font-semibold
                                text-slate-600
                            ">
                                Email atau WhatsApp
                            </label>


                            <input
                                type="text"
                                name="no_whatsapp"
                                autoComplete="username"
                                value={noWhatsapp}
                                onChange={(e) =>
                                    setNoWhatsapp(e.target.value)
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


                        {/* =================================================
                            PASSWORD
                        ================================================= */}

                        <div>

                            <label className="
                                block
                                mb-2
                                ml-1
                                text-xs
                                font-semibold
                                text-slate-600
                            ">
                                Password
                            </label>


                            <input
                                type="password"
                                name="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
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


                        {/* =================================================
                            LOGIN BUTTON
                        ================================================= */}

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
                                    <LogIn size={18} />

                                    <span>
                                        Masuk ke Sistem
                                    </span>
                                </>

                            )}

                        </button>

                    </form>


                    {/* =================================================
                        REGISTER
                    ================================================= */}

                    <div className="
                        mt-7
                        pt-6
                        border-t
                        border-slate-100
                        text-center
                    ">

                        <span className="
                            text-sm
                            text-slate-500
                        ">
                            Belum punya akun?
                        </span>

                        {' '}

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


                    {/* =================================================
                        BACK TO LANDING
                    ================================================= */}

                    <div className="mt-5 text-center">

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

                            <ArrowLeft size={14} />

                            Kembali ke halaman utama

                        </a>

                    </div>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div className="
                    mt-6
                    text-center
                    text-[11px]
                    text-slate-400
                ">
                    PT Sukun Wartono Indonesia
                </div>

            </div>


            {/* =================================================
                AGREEMENT MODAL
            ================================================= */}

            {/*
            <AgreementModalLogin
                isOpen={showAgreement}
                termData={latestTerm}
                userDetails={{
                    name: userTemp?.name,
                    no_whatsapp: userTemp?.no_whatsapp
                }}
                loading={loading}
                onSuccess={handleAgreementSuccess}
            />
            */}


            {/* =================================================
                PENDING MODAL
            ================================================= */}

            {/*
            <PendingRegister
                isOpen={isPendingModalOpen}
                onClose={() => setIsPendingModalOpen(false)}
                message={pendingMessage}
            />
            */}

        </div>
    );
}


// =============================================================
// MOUNT REACT
// =============================================================

if (document.getElementById('auth-root')) {

    ReactDOM.createRoot(
        document.getElementById('auth-root')
    ).render(

        <BrowserRouter basename="/app">
            <Login />
        </BrowserRouter>

    );
}