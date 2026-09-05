import{l as e,n as t,t as n}from"./jsx-runtime-gnJnb015.js";import{c as r,l as i,s as a,t as o}from"./app-D87xTNfH.js";import{t as s}from"./arrow-left-DJr6UpSU.js";import{t as c}from"./printer-5u-UcbcL.js";import{t as l}from"./tobaccoAturanService-DzxoMm9D.js";var u=e(t(),1),d=n();function f(){let{id:e}=r(),t=a(),[n]=i(),{user:f}=o(),[p,m]=(0,u.useState)(null),[h,g]=(0,u.useState)(!0),[_,v]=(0,u.useState)(``),y=n.get(`print`)===`1`;(0,u.useEffect)(()=>{if(!e){g(!1),v(`ID aturan tidak ditemukan.`);return}(async()=>{try{g(!0),v(``);let t=await l.getById(e);m(t?.data??null)}catch(e){console.error(`Gagal mengambil detail aturan:`,e),v(e?.response?.data?.message||`Data aturan tembakau gagal diambil.`)}finally{g(!1)}})()},[e]),(0,u.useEffect)(()=>{if(!h&&p&&y){let e=window.setTimeout(()=>{window.print()},500);return()=>{window.clearTimeout(e)}}},[h,p,y]);let b=e=>e?new Date(e).toLocaleDateString(`id-ID`,{day:`2-digit`,month:`long`,year:`numeric`}):`-`,x=()=>new Date().toLocaleDateString(`id-ID`,{day:`2-digit`,month:`long`,year:`numeric`}),S=e=>e==null||e===``?`-`:Number(e).toLocaleString(`id-ID`,{minimumFractionDigits:2,maximumFractionDigits:2});if(h)return(0,d.jsx)(`div`,{className:`flex min-h-[400px] items-center justify-center`,children:(0,d.jsx)(`div`,{className:`text-sm text-slate-500`,children:`Memuat data aturan...`})});if(_)return(0,d.jsx)(`div`,{className:`p-6`,children:(0,d.jsx)(`div`,{className:`rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600`,children:_})});if(!p)return(0,d.jsx)(`div`,{className:`p-6`,children:(0,d.jsx)(`div`,{className:`rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500`,children:`Data aturan tidak ditemukan.`})});let C=p.details??[],w=C.reduce((e,t)=>e+Number(t.rencana||0),0);return(0,d.jsxs)(d.Fragment,{children:[(0,d.jsx)(`style`,{children:`
                   @media print {

                    @page {
                        size: A4 portrait;
                        margin: 12mm;
                    }

                    html,
                    body {
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }

                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }

                    /* SEMBUNYIKAN SEMUA ELEMEN */
                    body * {
                        visibility: hidden !important;
                    }

                    /* HANYA DOKUMEN YANG DICETAK */
                    .print-document,
                    .print-document * {
                        visibility: visible !important;
                    }

                    .print-document {
                        position: absolute !important;
                        top: 0 !important;
                        left: 0 !important;

                        width: 100% !important;
                        max-width: none !important;

                        margin: 0 !important;
                        padding: 0 !important;

                        border: none !important;
                        border-radius: 0 !important;
                        box-shadow: none !important;

                        background: white !important;

                        overflow: visible !important;
                    }

                    .print-page {
                        min-height: 0 !important;
                        width: 100% !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        background: white !important;
                    }

                    table {
                        width: 100% !important;
                        page-break-inside: auto;
                    }

                    thead { display: table-header-group; }
                    tfoot { display: table-footer-group; }

                    tr {
                        page-break-inside: avoid;
                        page-break-after: auto;
                    }

                    td, th {
                        page-break-inside: avoid;
                    }

                    .print-footer {
                        page-break-inside: avoid;
                    }

                    .print-toolbar {
                        display: none !important;
                    }
                }
                `}),(0,d.jsxs)(`div`,{className:`print-page min-h-full bg-slate-100 p-4 md:p-6`,children:[(0,d.jsxs)(`div`,{className:`print-toolbar mx-auto mb-4 flex max-w-7xl items-center justify-between`,children:[(0,d.jsxs)(`button`,{type:`button`,onClick:()=>t(-1),className:`
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            border
                            border-slate-200
                            bg-white
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-slate-600
                            shadow-sm
                            transition
                            hover:bg-slate-50
                        `,children:[(0,d.jsx)(s,{size:16}),`Kembali`]}),(0,d.jsxs)(`button`,{type:`button`,onClick:()=>window.print(),className:`
                            inline-flex
                            items-center
                            gap-2
                            rounded-lg
                            bg-indigo-600
                            px-3
                            py-2
                            text-sm
                            font-medium
                            text-white
                            shadow-sm
                            transition
                            hover:bg-indigo-700
                        `,children:[(0,d.jsx)(c,{size:16}),`Print`]})]}),(0,d.jsxs)(`div`,{className:`print-document mx-auto max-w-7xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm`,children:[(0,d.jsxs)(`div`,{className:`px-6 pb-5 pt-7 text-center`,children:[(0,d.jsx)(`h1`,{className:`text-xl font-bold uppercase tracking-wide text-slate-800`,children:`Dokumen Pembuatan Aturan Tembakau`}),(0,d.jsx)(`p`,{className:`mt-1 text-sm text-slate-600`,children:`Sebagai dokumen persetujuan pemakaian Tembakau`})]}),(0,d.jsx)(`div`,{className:`px-6 pb-6`,children:(0,d.jsxs)(`div`,{className:`grid max-w-xl grid-cols-[110px_1fr] gap-y-2 text-sm`,children:[(0,d.jsx)(`div`,{className:`font-semibold text-slate-600`,children:`KODE :`}),(0,d.jsx)(`div`,{className:`font-medium text-slate-800`,children:p.kode_aturan||`-`}),(0,d.jsx)(`div`,{className:`font-semibold text-slate-600`,children:`Tgl Terbit :`}),(0,d.jsx)(`div`,{className:`font-medium text-slate-800`,children:b(p.tanggal_aturan)})]})}),(0,d.jsx)(`div`,{className:`px-4 pb-6 md:px-6`,children:(0,d.jsx)(`div`,{className:`overflow-x-auto rounded-lg border border-slate-300`,children:(0,d.jsxs)(`table`,{className:`w-full border-collapse text-xs`,children:[(0,d.jsx)(`thead`,{children:(0,d.jsxs)(`tr`,{className:`border-b border-slate-300 bg-slate-100 text-[11px] font-bold uppercase tracking-wide text-slate-600`,children:[(0,d.jsx)(`th`,{className:`border-r border-slate-300 px-2 py-2 text-center`,children:`NO`}),(0,d.jsx)(`th`,{className:`border-r border-slate-300 px-2 py-2 text-left`,children:`GDG`}),(0,d.jsx)(`th`,{className:`border-r border-slate-300 px-2 py-2 text-left`,children:`JENIS TBK`}),(0,d.jsx)(`th`,{className:`border-r border-slate-300 px-2 py-2 text-center`,children:`TYPE`}),(0,d.jsx)(`th`,{className:`border-r border-slate-300 px-2 py-2 text-center`,children:`THN`}),(0,d.jsx)(`th`,{className:`border-r border-slate-300 px-2 py-2 text-center`,children:`S.K`}),(0,d.jsx)(`th`,{className:`border-r border-slate-300 px-2 py-2 text-center`,children:`GRADE`}),(0,d.jsx)(`th`,{className:`px-2 py-2 text-right`,children:`RENCANA`})]})}),(0,d.jsx)(`tbody`,{children:C.length>0?C.map((e,t)=>(0,d.jsxs)(`tr`,{className:`border-b border-slate-200`,children:[(0,d.jsx)(`td`,{className:`border-r border-slate-200 bg-slate-50 px-2 py-2 text-center font-medium text-slate-700`,children:e.no??t+1}),(0,d.jsx)(`td`,{className:`border-r border-slate-200 px-2 py-2 text-left text-slate-700`,children:e.gdg||`-`}),(0,d.jsx)(`td`,{className:`border-r border-slate-200 px-2 py-2 text-left text-slate-700`,children:e.jenis_tembakau||`-`}),(0,d.jsx)(`td`,{className:`border-r border-slate-200 px-2 py-2 text-center text-slate-700`,children:e.type||`-`}),(0,d.jsx)(`td`,{className:`border-r border-slate-200 px-2 py-2 text-center text-slate-700`,children:e.tahun??`-`}),(0,d.jsx)(`td`,{className:`border-r border-slate-200 px-2 py-2 text-center text-slate-700`,children:e.s_k||`-`}),(0,d.jsx)(`td`,{className:`border-r border-slate-200 px-2 py-2 text-center text-slate-700`,children:e.grade||`-`}),(0,d.jsx)(`td`,{className:`px-2 py-2 text-right font-mono text-slate-700`,children:S(e.rencana)})]},e.id??t)):(0,d.jsx)(`tr`,{children:(0,d.jsx)(`td`,{colSpan:8,className:`px-4 py-8 text-center text-sm text-slate-400`,children:`Belum ada detail aturan.`})})}),(0,d.jsx)(`tfoot`,{children:(0,d.jsxs)(`tr`,{className:`bg-slate-50`,children:[(0,d.jsx)(`td`,{colSpan:7,className:`border-r border-slate-300 px-2 py-3 text-right text-xs font-bold uppercase tracking-wide text-slate-500`,children:`Total Rencana`}),(0,d.jsxs)(`td`,{className:`px-2 py-3 text-right font-mono text-sm font-bold text-indigo-600`,children:[S(w),` Kg`]})]})})]})})}),(0,d.jsxs)(`div`,{className:`print-footer px-6 pb-8 pt-4`,children:[(0,d.jsxs)(`div`,{className:`mb-8 text-right text-sm text-slate-700`,children:[`Kudus,`,` `,x()]}),(0,d.jsxs)(`div`,{className:`grid grid-cols-3 gap-6 text-center text-sm text-slate-700`,children:[(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`font-semibold`,children:`Approval`}),(0,d.jsx)(`div`,{className:`h-20`})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`font-semibold`,children:`Kabag. RND`}),(0,d.jsx)(`div`,{className:`h-20`})]}),(0,d.jsxs)(`div`,{children:[(0,d.jsx)(`div`,{className:`font-semibold`,children:`Petugas Laborat`}),(0,d.jsx)(`div`,{className:`h-20`}),(0,d.jsx)(`div`,{className:`font-medium text-slate-800`,children:f?.name||`-`})]})]})]})]})]})]})}export{f as default};