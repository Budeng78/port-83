import{l as e,n as t,t as n}from"./jsx-runtime-gnJnb015.js";import{n as r,r as i,t as a}from"./app-D87xTNfH.js";import{t as o}from"./createLucideIcon-CGdC-YAj.js";import{t as s}from"./arrow-left-DJr6UpSU.js";import{t as c}from"./loader-circle-CfzGKJRM.js";var l=o(`log-in`,[[`path`,{d:`m10 17 5-5-5-5`,key:`1bsop3`}],[`path`,{d:`M15 12H3`,key:`6jk70r`}],[`path`,{d:`M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4`,key:`u53s6r`}]]),u=e(t(),1),d=n();function f(){let[e,t]=(0,u.useState)(!1),[n,o]=(0,u.useState)(``),[f,p]=(0,u.useState)(``),{login:m}=a();return(0,d.jsxs)(`div`,{className:`
                min-h-screen

                flex
                items-center
                justify-center

                bg-slate-50

                px-4
                py-8

                relative
                overflow-hidden
            `,children:[(0,d.jsx)(`div`,{className:`
                    absolute
                    -top-32
                    -right-32

                    w-96
                    h-96

                    rounded-full

                    bg-blue-600/10

                    blur-3xl
                `}),(0,d.jsx)(`div`,{className:`
                    absolute
                    -bottom-40
                    -left-40

                    w-[30rem]
                    h-[30rem]

                    rounded-full

                    bg-indigo-900/10

                    blur-3xl
                `}),(0,d.jsxs)(`div`,{className:`
                    relative
                    z-10

                    w-full
                    max-w-md
                `,children:[(0,d.jsxs)(`div`,{className:`
                        text-center
                        mb-8
                    `,children:[(0,d.jsx)(`div`,{className:`
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
                        `,children:(0,d.jsx)(`span`,{className:`
                                text-xl
                                font-extrabold
                                tracking-tight
                            `,children:`SWI`})}),(0,d.jsx)(`h1`,{className:`
                            text-3xl
                            font-extrabold
                            tracking-tight
                            text-slate-900
                        `,children:`Portal Login`}),(0,d.jsx)(`p`,{className:`
                            mt-2

                            text-xs
                            font-semibold

                            text-slate-400

                            uppercase

                            tracking-[0.18em]
                        `,children:`Node Primary PT Sukun Wartono Indonesia`})]}),(0,d.jsxs)(`div`,{className:`
                        bg-white

                        border
                        border-slate-200/80

                        rounded-3xl

                        p-7
                        sm:p-8

                        shadow-xl
                        shadow-slate-200/60
                    `,children:[(0,d.jsxs)(`form`,{onSubmit:async a=>{if(a.preventDefault(),!e){t(!0);try{typeof i==`function`&&await i();let{user:e,access_token:t}=(await r.post(`/app/login`,{identity:n,password:f})).data;if(console.log(`USER DATA HASIL LOGIN:`,e),!e||!t)throw Error(`Data user atau access token tidak ditemukan.`);let a=m(e,t);if(!a?.success)throw Error(a?.message||`Login tidak berhasil.`);console.log(`USER LOGIN:`,e),alert(`Login Berhasil! Selamat datang, ${e?.name||`Pengguna`}`),window.location.href=`/app/Platform/dashboard`}catch(e){console.error(`Error login:`,e.response?.data||e),alert(e.response?.data?.message||e.message||`Login gagal, periksa kredensial bapak.`)}finally{t(!1)}}},className:`space-y-5`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`label`,{className:`
                                    block

                                    mb-2
                                    ml-1

                                    text-xs
                                    font-semibold

                                    text-slate-600
                                `,children:`Email atau WhatsApp`}),(0,d.jsx)(`input`,{type:`text`,name:`no_whatsapp`,autoComplete:`username`,value:n,onChange:e=>o(e.target.value),className:`
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
                                `,placeholder:`email@email.com / 0812345678`,required:!0})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`label`,{className:`
                                    block

                                    mb-2
                                    ml-1

                                    text-xs
                                    font-semibold

                                    text-slate-600
                                `,children:`Password`}),(0,d.jsx)(`input`,{type:`password`,name:`password`,autoComplete:`current-password`,value:f,onChange:e=>p(e.target.value),className:`
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
                                `,placeholder:`••••••••`,required:!0})]}),(0,d.jsx)(`button`,{type:`submit`,disabled:e,className:`
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
                            `,children:e?(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(c,{size:18,className:`animate-spin`}),(0,d.jsx)(`span`,{children:`Memverifikasi...`})]}):(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(l,{size:18}),(0,d.jsx)(`span`,{children:`Masuk ke Sistem`})]})})]}),(0,d.jsxs)(`div`,{className:`
                            mt-7
                            pt-6

                            border-t
                            border-slate-100

                            text-center
                        `,children:[(0,d.jsx)(`span`,{className:`
                                text-sm
                                text-slate-500
                            `,children:`Belum punya akun?`}),` `,(0,d.jsx)(`a`,{href:`/register`,className:`
                                text-sm
                                font-bold

                                text-blue-600

                                hover:text-blue-700

                                transition-colors
                            `,children:`Daftar sekarang`})]}),(0,d.jsx)(`div`,{className:`
                            mt-5

                            text-center
                        `,children:(0,d.jsxs)(`a`,{href:`/`,className:`
                                inline-flex
                                items-center

                                gap-1.5

                                text-xs
                                font-semibold

                                text-slate-400

                                hover:text-blue-600

                                transition-colors
                            `,children:[(0,d.jsx)(s,{size:14}),`Kembali ke halaman utama`]})})]}),(0,d.jsx)(`div`,{className:`
                        mt-6

                        text-center

                        text-[11px]

                        text-slate-400
                    `,children:`PT Sukun Wartono Indonesia`})]})]})}export{f as default};