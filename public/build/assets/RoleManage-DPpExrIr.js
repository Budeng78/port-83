import{l as e,n as t,t as n}from"./jsx-runtime-gnJnb015.js";import{t as r}from"./circle-alert-BWTaSxY1.js";import{t as i}from"./loader-circle-CfzGKJRM.js";import{t as a}from"./pencil-BetRuNhI.js";import{t as o}from"./plus-DXd8y3Nd.js";import{t as s}from"./refresh-cw-Ce9bzc4n.js";import{t as c}from"./search-CqmL80By.js";import{t as l}from"./shield-check-Bf1BYkvx.js";import{t as u}from"./trash-2-DLP_jVPo.js";import{t as d}from"./users-CAF3lqwJ.js";import{t as f}from"./x-DryI0RwT.js";import{t as p}from"./roleService-Clw94eh3.js";var m=e(t(),1),h=n(),g=e=>{if(e?.success===!1)throw Error(e.message||`Request gagal.`);return e?.data===void 0?e||[]:e.data};function _(){let[e,t]=(0,m.useState)([]),[n,_]=(0,m.useState)(``),[v,y]=(0,m.useState)(!0),[b,x]=(0,m.useState)(!1),[S,C]=(0,m.useState)(null),[w,T]=(0,m.useState)(``),[E,D]=(0,m.useState)(``),[O,k]=(0,m.useState)(!1),[A,j]=(0,m.useState)(`create`),[M,N]=(0,m.useState)(``),[P,F]=(0,m.useState)(null),I=async()=>{try{y(!0),T(``),D(``);let e=g(await p.getRoles());t(Array.isArray(e)?e:[])}catch(e){console.error(`Role Management Load Error:`,e),T(e?.response?.data?.message||e?.message||`Gagal mengambil data Role.`)}finally{y(!1)}};(0,m.useEffect)(()=>{I()},[]);let L=(0,m.useMemo)(()=>{let t=n.trim().toLowerCase();return t?e.filter(e=>e?.name?.toLowerCase().includes(t)):e},[e,n]),R=()=>{j(`create`),N(``),F(null),T(``),D(``),k(!0)},z=e=>{e?.name!==`Super Admin`&&(j(`edit`),N(e?.name||``),F(e?.id??null),T(``),D(``),k(!0))},B=()=>{b||(k(!1),N(``),F(null))},V=async e=>{e.preventDefault();let n=M.trim();if(!n){T(`Nama Role wajib diisi.`);return}try{if(x(!0),T(``),D(``),A===`create`){let e=g(await p.createRole({name:n}));t(t=>[...t,e]),D(`Role "${e.name}" berhasil dibuat.`)}else{if(!P)throw Error(`Role yang akan diubah tidak ditemukan.`);let e=g(await p.updateRole(P,{name:n}));t(t=>t.map(t=>String(t.id)===String(e.id)?e:t)),D(`Role "${e.name}" berhasil diperbarui.`)}k(!1),N(``),F(null)}catch(e){console.error(`Role CRUD Error:`,e);let t=e?.response?.data?.errors;T(t?Object.values(t).flat().join(` `):e?.response?.data?.message||e?.message||`Gagal menyimpan Role.`)}finally{x(!1)}},H=async e=>{if(e?.name!==`Super Admin`&&window.confirm(`Hapus role "${e.name}"?\n\nRole yang dihapus tidak dapat dikembalikan.`))try{C(e.id),T(``),D(``),await p.deleteRole(e.id),t(t=>t.filter(t=>String(t.id)!==String(e.id))),D(`Role "${e.name}" berhasil dihapus.`)}catch(e){console.error(`Delete Role Error:`,e),T(e?.response?.data?.message||e?.message||`Gagal menghapus Role.`)}finally{C(null)}};return v?(0,h.jsx)(`div`,{className:`w-full`,children:(0,h.jsxs)(`div`,{className:`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`,children:[(0,h.jsx)(`div`,{className:`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400`}),(0,h.jsx)(`div`,{className:`flex items-center justify-center p-10`,children:(0,h.jsxs)(`div`,{className:`flex items-center gap-3 text-slate-500`,children:[(0,h.jsx)(i,{className:`h-5 w-5 animate-spin`}),(0,h.jsx)(`span`,{className:`text-sm font-medium`,children:`Memuat Role...`})]})})]})}):(0,h.jsxs)(`div`,{className:`w-full space-y-5`,children:[(0,h.jsxs)(`div`,{className:`relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`,children:[(0,h.jsx)(`div`,{className:`absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400`}),(0,h.jsxs)(`div`,{className:`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between`,children:[(0,h.jsxs)(`div`,{className:`flex items-center gap-4`,children:[(0,h.jsx)(`div`,{className:`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-md`,children:(0,h.jsx)(l,{size:24})}),(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h1`,{className:`text-xl font-black tracking-tight text-slate-900`,children:`Role Management`}),(0,h.jsx)(`p`,{className:`text-sm text-slate-500`,children:`Kelola Role yang tersedia dalam sistem.`})]})]}),(0,h.jsxs)(`div`,{className:`flex items-center gap-2 self-end sm:self-auto`,children:[(0,h.jsx)(`button`,{type:`button`,onClick:I,disabled:v||b,title:`Refresh Data`,className:`
                                flex h-11 w-11
                                items-center justify-center
                                rounded-xl
                                border border-slate-200
                                bg-white
                                text-slate-600
                                shadow-sm
                                transition-all
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            `,children:(0,h.jsx)(s,{size:18,className:v?`animate-spin`:``})}),(0,h.jsxs)(`button`,{type:`button`,onClick:R,disabled:b||S!==null,className:`
                                flex items-center gap-2
                                rounded-xl
                                bg-blue-900
                                px-4 py-2.5
                                text-sm font-bold
                                text-white
                                shadow-sm
                                transition-all
                                hover:bg-slate-800
                                disabled:cursor-not-allowed
                                disabled:opacity-50
                            `,children:[(0,h.jsx)(o,{size:18}),(0,h.jsx)(`span`,{children:`Tambah Role`})]})]})]})]}),w&&(0,h.jsxs)(`div`,{className:`
                        flex items-start gap-3
                        rounded-xl
                        border border-rose-200
                        bg-rose-50
                        px-4 py-3
                        text-sm text-rose-700
                    `,children:[(0,h.jsx)(r,{className:`mt-0.5 h-4 w-4 shrink-0`}),(0,h.jsx)(`span`,{children:w}),(0,h.jsx)(`button`,{type:`button`,onClick:()=>T(``),className:`
                            ml-auto
                            text-rose-400
                            hover:text-rose-600
                        `,children:(0,h.jsx)(f,{className:`h-4 w-4`})})]}),E&&(0,h.jsxs)(`div`,{className:`
                        flex items-center gap-3
                        rounded-xl
                        border border-emerald-200
                        bg-emerald-50
                        px-4 py-3
                        text-sm
                        font-medium
                        text-emerald-700
                    `,children:[(0,h.jsx)(`span`,{children:E}),(0,h.jsx)(`button`,{type:`button`,onClick:()=>D(``),className:`
                            ml-auto
                            text-emerald-400
                            hover:text-emerald-600
                        `,children:(0,h.jsx)(f,{className:`h-4 w-4`})})]}),(0,h.jsxs)(`div`,{className:`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm`,children:[(0,h.jsx)(`div`,{className:`border-b border-slate-100 px-5 py-4`,children:(0,h.jsxs)(`div`,{className:`flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h2`,{className:`text-base font-black text-slate-800`,children:`Daftar Role`}),(0,h.jsx)(`p`,{className:`mt-1 text-xs text-slate-400`,children:`Role merupakan master identitas akses pengguna.`})]}),(0,h.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,h.jsxs)(`div`,{className:`relative`,children:[(0,h.jsx)(c,{className:`
                                        absolute
                                        left-3
                                        top-1/2
                                        h-4 w-4
                                        -translate-y-1/2
                                        text-slate-400
                                    `}),(0,h.jsx)(`input`,{type:`text`,value:n,onChange:e=>_(e.target.value),placeholder:`Cari Role...`,className:`
                                        h-10
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        pl-9
                                        pr-3
                                        text-sm
                                        text-slate-700
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                        sm:w-64
                                    `})]}),(0,h.jsxs)(`div`,{className:`
                                    hidden
                                    whitespace-nowrap
                                    rounded-xl
                                    bg-slate-100
                                    px-3
                                    py-2.5
                                    text-xs
                                    font-bold
                                    text-slate-500
                                    sm:block
                                `,children:[L.length,` Role`]})]})]})}),(0,h.jsx)(`div`,{className:`p-4`,children:L.length===0?(0,h.jsxs)(`div`,{className:`py-14 text-center`,children:[(0,h.jsx)(`div`,{className:`
                                    mx-auto
                                    flex h-12 w-12
                                    items-center justify-center
                                    rounded-xl
                                    bg-slate-100
                                    text-slate-400
                                `,children:n?(0,h.jsx)(c,{className:`h-5 w-5`}):(0,h.jsx)(d,{className:`h-5 w-5`})}),(0,h.jsx)(`p`,{className:`mt-4 text-sm font-bold text-slate-500`,children:n?`Role tidak ditemukan.`:`Belum ada Role.`}),(0,h.jsx)(`p`,{className:`mt-1 text-xs text-slate-400`,children:n?`Coba gunakan kata pencarian lain.`:`Silakan buat Role baru.`})]}):(0,h.jsx)(`div`,{className:`overflow-x-auto`,children:(0,h.jsxs)(`table`,{className:`w-full min-w-[650px]`,children:[(0,h.jsx)(`thead`,{children:(0,h.jsxs)(`tr`,{className:`border-b border-slate-200`,children:[(0,h.jsx)(`th`,{className:`
                                                px-4 py-3
                                                text-left
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            `,children:`Role`}),(0,h.jsx)(`th`,{className:`
                                                px-4 py-3
                                                text-left
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            `,children:`Guard`}),(0,h.jsx)(`th`,{className:`
                                                px-4 py-3
                                                text-left
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            `,children:`Dibuat`}),(0,h.jsx)(`th`,{className:`
                                                px-4 py-3
                                                text-right
                                                text-[11px]
                                                font-black
                                                uppercase
                                                tracking-wider
                                                text-slate-400
                                            `,children:`Aksi`})]})}),(0,h.jsx)(`tbody`,{children:L.map(e=>{let t=e.name===`Super Admin`,n=String(S)===String(e.id);return(0,h.jsxs)(`tr`,{className:`
                                                        border-b
                                                        border-slate-100
                                                        last:border-b-0
                                                        transition
                                                        hover:bg-slate-50
                                                    `,children:[(0,h.jsx)(`td`,{className:`px-4 py-4`,children:(0,h.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,h.jsx)(`div`,{className:`
                                                                    flex
                                                                    h-10 w-10
                                                                    shrink-0
                                                                    items-center
                                                                    justify-center
                                                                    rounded-xl
                                                                    ${t?`bg-rose-50 text-rose-600`:`bg-blue-50 text-blue-700`}
                                                                `,children:t?(0,h.jsx)(l,{className:`h-4 w-4`}):(0,h.jsx)(d,{className:`h-4 w-4`})}),(0,h.jsx)(`div`,{className:`min-w-0`,children:(0,h.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,h.jsx)(`span`,{className:`text-sm font-bold text-slate-700`,children:e.name}),t&&(0,h.jsx)(`span`,{className:`
                                                                                rounded-full
                                                                                bg-rose-100
                                                                                px-2
                                                                                py-0.5
                                                                                text-[9px]
                                                                                font-black
                                                                                text-rose-600
                                                                            `,children:`PROTECTED`})]})})]})}),(0,h.jsx)(`td`,{className:`px-4 py-4`,children:(0,h.jsx)(`span`,{className:`
                                                                inline-flex
                                                                rounded-lg
                                                                bg-slate-100
                                                                px-2.5
                                                                py-1
                                                                text-xs
                                                                font-bold
                                                                text-slate-500
                                                            `,children:e.guard_name||`web`})}),(0,h.jsx)(`td`,{className:`px-4 py-4`,children:(0,h.jsx)(`span`,{className:`text-xs text-slate-400`,children:e.created_at?new Date(e.created_at).toLocaleDateString(`id-ID`,{day:`2-digit`,month:`short`,year:`numeric`}):`-`})}),(0,h.jsx)(`td`,{className:`px-4 py-4`,children:(0,h.jsxs)(`div`,{className:`flex items-center justify-end gap-1`,children:[(0,h.jsx)(`button`,{type:`button`,title:`Edit Role`,onClick:()=>z(e),disabled:t||b||S!==null,className:`
                                                                    flex
                                                                    h-9 w-9
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    text-slate-400
                                                                    transition
                                                                    hover:bg-blue-50
                                                                    hover:text-blue-600
                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-30
                                                                `,children:(0,h.jsx)(a,{className:`h-4 w-4`})}),(0,h.jsx)(`button`,{type:`button`,title:`Hapus Role`,onClick:()=>H(e),disabled:t||n||b,className:`
                                                                    flex
                                                                    h-9 w-9
                                                                    items-center
                                                                    justify-center
                                                                    rounded-lg
                                                                    text-slate-400
                                                                    transition
                                                                    hover:bg-rose-50
                                                                    hover:text-rose-600
                                                                    disabled:cursor-not-allowed
                                                                    disabled:opacity-30
                                                                `,children:n?(0,h.jsx)(i,{className:`
                                                                            h-4 w-4
                                                                            animate-spin
                                                                        `}):(0,h.jsx)(u,{className:`h-4 w-4`})})]})})]},e.id)})})]})})})]}),O&&(0,h.jsx)(`div`,{className:`
                        fixed inset-0 z-50
                        flex items-center justify-center
                        bg-slate-900/40
                        p-4
                        backdrop-blur-sm
                    `,onMouseDown:e=>{e.target===e.currentTarget&&B()},children:(0,h.jsxs)(`form`,{onSubmit:V,className:`
                            w-full max-w-md
                            overflow-hidden
                            rounded-2xl
                            border border-slate-200
                            bg-white
                            shadow-2xl
                        `,children:[(0,h.jsxs)(`div`,{className:`flex items-center justify-between border-b border-slate-100 px-5 py-4`,children:[(0,h.jsxs)(`div`,{children:[(0,h.jsx)(`h2`,{className:`text-base font-black text-slate-800`,children:A===`create`?`Tambah Role`:`Edit Role`}),(0,h.jsx)(`p`,{className:`mt-1 text-xs text-slate-400`,children:A===`create`?`Buat Role baru untuk sistem.`:`Ubah nama Role yang dipilih.`})]}),(0,h.jsx)(`button`,{type:`button`,onClick:B,disabled:b,className:`
                                    flex h-8 w-8
                                    items-center justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                    disabled:opacity-40
                                `,children:(0,h.jsx)(f,{className:`h-4 w-4`})})]}),(0,h.jsxs)(`div`,{className:`p-5`,children:[(0,h.jsx)(`label`,{htmlFor:`role-name`,className:`
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                `,children:`Nama Role`}),(0,h.jsx)(`input`,{id:`role-name`,type:`text`,value:M,onChange:e=>N(e.target.value),autoFocus:!0,maxLength:255,placeholder:`Contoh: Administrator`,disabled:b,className:`
                                    mt-2
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3 py-2.5
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                    disabled:bg-slate-50
                                `}),(0,h.jsx)(`p`,{className:`mt-2 text-xs text-slate-400`,children:`Role hanya merupakan master identitas akses pengguna.`})]}),(0,h.jsxs)(`div`,{className:`flex justify-end gap-2 border-t border-slate-100 px-5 py-4`,children:[(0,h.jsx)(`button`,{type:`button`,onClick:B,disabled:b,className:`
                                    rounded-xl
                                    border border-slate-200
                                    bg-white
                                    px-4 py-2.5
                                    text-sm
                                    font-bold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                    disabled:opacity-50
                                `,children:`Batal`}),(0,h.jsxs)(`button`,{type:`submit`,disabled:b||!M.trim(),className:`
                                    inline-flex
                                    items-center
                                    gap-2
                                    rounded-xl
                                    bg-blue-900
                                    px-4 py-2.5
                                    text-sm
                                    font-black
                                    text-white
                                    shadow-sm
                                    transition
                                    hover:bg-slate-800
                                    disabled:cursor-not-allowed
                                    disabled:bg-slate-300
                                `,children:[b&&(0,h.jsx)(i,{className:`
                                            h-4 w-4
                                            animate-spin
                                        `}),b?`Menyimpan...`:A===`create`?`Buat Role`:`Simpan Perubahan`]})]})]})})]})}export{_ as default};