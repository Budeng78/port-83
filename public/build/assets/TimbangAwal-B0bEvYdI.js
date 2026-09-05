import{l as e,n as t,t as n}from"./jsx-runtime-gnJnb015.js";import{n as r}from"./app-D87xTNfH.js";var i=e(t(),1),a=r.create({baseURL:`/api/posrajang/timbangawal`,headers:{"Content-Type":`application/json`,Accept:`application/json`}}),o={initiateTimbanganDraft:async e=>(await a.post(`/connect-and-init`,e)).data,cariBatch:async e=>(await a.post(`/cari-batch`,e)).data,updateDraft:async e=>(await a.post(`/update-draft`,e)).data,tambahPack:async e=>(await a.post(`/karung`,e)).data,deletePack:async e=>(await a.delete(`/karung`,{data:e})).data,commitTimbangan:async e=>(await a.post(`/finish-session`,e)).data,printBatch:async e=>(await a.get(`/print/${e}`,{responseType:`text`})).data,getDetail:async e=>(await a.get(`/hasil-timbangan/${e}`)).data,getHasilTimbangan:async()=>(await a.get(`/hasil-timbangan`)).data,getDataTimbangMasuk:async()=>(await r.get(`/timbangan/penerimaan`)).data},s=n();function c(){let e=(0,i.useRef)(null),t=(0,i.useRef)(1),n=(0,i.useRef)(new Set),r=(0,i.useRef)(new Set),a=(0,i.useRef)(null),c=(0,i.useRef)(null),[u,d]=(0,i.useState)(!1),[f,p]=(0,i.useState)(`0.00`),[m,h]=(0,i.useState)(`-`),[g,_]=(0,i.useState)([`[Sistem] Menunggu data dari Laravel...`]),[v,y]=(0,i.useState)(``),[b,x]=(0,i.useState)(``),[S,C]=(0,i.useState)(``),[w,T]=(0,i.useState)(``),[E,D]=(0,i.useState)(``),[O,k]=(0,i.useState)(``),[A,j]=(0,i.useState)(null),[M,N]=(0,i.useState)(null),[P,F]=(0,i.useState)(!1),[I,L]=(0,i.useState)(1),[R,z]=(0,i.useState)(5),[B,V]=(0,i.useState)({}),H=e=>{let t=new Date().toLocaleTimeString(`id-ID`,{hour12:!1});_(n=>[...n,`[${t}] ${e}`])},U=e=>{let n=Number(e)||1;t.current=n,L(n)};(0,i.useEffect)(()=>{a.current&&(a.current.scrollTop=a.current.scrollHeight)},[g]);let W=async(t,i)=>{let a=e.current;if(!a)return H(`Gagal: Dokumen timbang belum tersedia.`),!1;if(n.current.has(t))return H(`Pack ${t} sudah tersimpan, dilewati.`),!1;if(r.current.has(t))return H(`Pack ${t} sedang diproses.`),!1;r.current.add(t);let s=Number(i)||0,c=Number(E)||0,l=Math.max(0,s-c);H(`Menyimpan pack ${t}...`);try{let e=new Date().toISOString().slice(0,19).replace(`T`,` `),r=await o.tambahPack({dokumen_timbang_awal_id:a,nomor_pack:t,berat_bruto:s,tara:c,berat_netto:l,waktu_timbang:e});return r.success?(n.current.add(t),H(`Pack ${t} berhasil tersimpan.`),!0):(H(r.message||`Gagal menyimpan pack ${t}.`),r.error&&H(`Detail backend: ${r.error}`),!1)}catch(e){return H(e.response?.data?.message||`Gagal menyimpan pack ${t}.`),e.response?.data?.error&&H(`Detail backend: ${e.response.data.error}`),!1}finally{r.current.delete(t)}},G=async()=>{if(!(!e.current||P))try{let e=await o.getDataTimbangMasuk();if(!e?.success)return;let i=e.data;if(!i)return;let a=Number(i.berat??i.weight??i.value);if(!Number.isFinite(a))return;let s=i.received_at??i.time??new Date().toISOString(),c=t.current,l=a.toFixed(2);if(p(l),h(new Date(s).toLocaleTimeString(`id-ID`,{hour12:!1})),a<=0||n.current.has(c)||r.current.has(c))return;if(H(`Berat dari Laravel: ${l} Kg → Pack ${c}`),V(e=>({...e,[c]:l})),!await W(c,a)){V(e=>{let t={...e};return delete t[c],t}),H(`Pack ${c} tetap aktif karena penyimpanan gagal.`);return}let u=c+1;U(u),z(e=>u>e?e+5:e),H(`Pack berikutnya: ${u}`)}catch(e){H(e.response?.data?.message||`Gagal mengambil data timbang dari Laravel.`)}},K=()=>{if(u){q();return}if(!e.current){H(`Dokumen timbang belum tersedia.`);return}H(`Mulai memantau data timbang dari Laravel...`),d(!0),G(),c.current=setInterval(()=>{G()},1e3)},q=()=>{c.current&&=(clearInterval(c.current),null),d(!1),H(`Pemantauan data timbang dihentikan.`)},J=async()=>{if(u){q();return}if(e.current){H(`Dokumen timbang sudah tersedia.`),K();return}if(!v||!b||!S||!w||!E||!O){alert(`Lengkapi No, No WO, Jenis, S/K, Tara dan Jumlah Bal.`);return}try{H(`Mencari dokumen timbang aktif...`);let t=await o.cariBatch({no_wo:b,jenis:S,s_k:w});if(t.success&&t.found===!0&&t.data?.dokumen_timbang_awal){let r=t.data.dokumen_timbang_awal,i=t.data.details||[],a=Number(t.data.next_pack||i.length+1);e.current=r.id,j(r.id),y(r.no??``),x(r.no_wo??``),C(r.jenis??``),T(r.s_k??``),D(r.tara??``),k(r.jumlah_bal??``),N(r.status),F(!1);let o={};i.forEach(e=>{let t=Number(e.nomor_pack),n=Number(e.berat_netto);Number.isFinite(t)&&Number.isFinite(n)&&(o[t]=n.toFixed(2))}),V(o),n.current=new Set(i.map(e=>Number(e.nomor_pack))),U(a),z(Math.max(5,Math.ceil(a/5)*5)),H(`Dokumen aktif ditemukan: ${r.id}`),H(`Pack tersimpan: ${i.length}`),H(`Pack berikutnya: ${a}`),K();return}if(t.success&&t.found===!1){H(`Dokumen aktif tidak ditemukan. Membuat dokumen baru...`);let t=await o.initiateTimbanganDraft({no:Number(v),no_wo:b,jenis:S,s_k:w,tara:Number(E),jumlah_bal:Number(O)});if(!t.success){H(t.message||`Gagal membuat dokumen.`);return}let i=t.data?.dokumen_timbang_awal;if(!i?.id){H(`Response tidak memiliki ID dokumen.`);return}let a=Number(t.data?.next_pack||1);e.current=i.id,j(i.id),y(i.no??v),x(i.no_wo??b),C(i.jenis??S),T(i.s_k??w),D(i.tara??E),k(i.jumlah_bal??O),N(i.status),F(!1),n.current=new Set,r.current=new Set,V({}),U(a),z(5),H(`Dokumen baru dibuat: ${i.id}`),H(`Pack berikutnya: ${a}`),K();return}}catch(e){H(e.response?.data?.message||e.message||`Gagal menginisiasi penimbangan.`),e.response?.data?.error&&H(`Detail backend: ${e.response.data.error}`)}},Y=async()=>{if(!b||!S||!w){alert(`Isi No WO, Jenis dan S/K terlebih dahulu.`);return}try{H(`Mencari dokumen timbang aktif...`);let t=await o.cariBatch({no_wo:b,jenis:S,s_k:w});if(!t.success||!t.found){H(t.message||`Dokumen timbang aktif tidak ditemukan.`);return}let r=t.data?.dokumen_timbang_awal,i=t.data?.details||[];if(!r){H(`Data dokumen tidak ditemukan.`);return}let a=Number(t.data?.next_pack||i.length+1);e.current=r.id,j(r.id),y(r.no??``),x(r.no_wo??``),C(r.jenis??``),T(r.s_k??``),D(r.tara??``),k(r.jumlah_bal??``),N(r.status),F(!1);let s={};i.forEach(e=>{let t=Number(e.nomor_pack),n=Number(e.berat_netto);Number.isFinite(t)&&Number.isFinite(n)&&(s[t]=n.toFixed(2))}),V(s),n.current=new Set(i.map(e=>Number(e.nomor_pack))),U(a),z(Math.max(5,Math.ceil(a/5)*5)),H(`Dokumen ditemukan: ${r.id}`),H(`Pack tersimpan: ${i.length}`),H(`Pack berikutnya: ${a}`)}catch(e){H(e.response?.data?.message||e.message||`Gagal mencari dokumen timbang.`),e.response?.data?.error&&H(`Detail backend: ${e.response.data.error}`)}},X=async t=>{let i=e.current;if(!i){H(`Dokumen timbang belum tersedia.`);return}if(n.current.has(t)&&window.confirm(`Hapus pack nomor ${t}?`))try{H(`Menghapus pack ${t}...`);let e=await o.deletePack({dokumen_timbang_awal_id:i,nomor_pack:t});if(!e.success){H(e.message||`Gagal menghapus pack ${t}.`);return}let a=e.data?.details||[],s={};a.forEach(e=>{let t=Number(e.nomor_pack),n=Number(e.berat_netto);Number.isFinite(t)&&Number.isFinite(n)&&(s[t]=n.toFixed(2))}),V(s),n.current=new Set(a.map(e=>Number(e.nomor_pack))),r.current=new Set;let c=Number(e.data?.next_pack||a.length+1);U(c),z(e=>Math.max(5,e,Math.ceil(c/5)*5)),H(`Pack ${t} berhasil dihapus.`),H(`Nomor dirapatkan. Pack berikutnya: ${c}.`)}catch(e){H(e.response?.data?.message||`Gagal menghapus pack ${t}.`),e.response?.data?.error&&H(`Detail backend: ${e.response.data.error}`)}};return(0,i.useEffect)(()=>()=>{c.current&&=(clearInterval(c.current),null)},[]),(0,i.useEffect)(()=>{let e=document.getElementById(`row-${I}`);e&&e.scrollIntoView({behavior:`smooth`,block:`nearest`})},[I]),(0,s.jsxs)(`div`,{className:`
                max-w-6xl
                mx-auto
                w-full
                space-y-4
                p-4 md:p-6
            `,children:[(0,s.jsx)(`div`,{className:`
                    bg-white
                    p-4 md:p-6
                    rounded-xl
                    shadow
                `,children:(0,s.jsxs)(`div`,{className:`
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-6
                    `,children:[(0,s.jsxs)(`div`,{className:`
                            space-y-3
                        `,children:[(0,s.jsx)(`div`,{className:`
                                border-b
                                pb-1
                            `,children:(0,s.jsx)(`h3`,{className:`
                                    font-bold
                                    text-gray-700
                                    text-sm
                                `,children:`Informasi Timbang Awal`})}),(0,s.jsxs)(`div`,{className:`
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                gap-3
                                text-xs
                            `,children:[(0,s.jsx)(l,{label:`1. No`,value:v,onChange:y,type:`number`}),(0,s.jsx)(l,{label:`2. No. WO`,value:b,onChange:x,placeholder:`Nomor WO`}),(0,s.jsx)(l,{label:`3. Jenis`,value:S,onChange:C,placeholder:`Jenis`}),(0,s.jsx)(l,{label:`4. S/K`,value:w,onChange:T,placeholder:`S/K`}),(0,s.jsx)(l,{label:`5. Tara`,value:E,onChange:D,type:`number`,step:`0.01`}),(0,s.jsx)(l,{label:`6. Jumlah Bal`,value:O,onChange:k,type:`number`})]})]}),(0,s.jsxs)(`div`,{className:`
                            bg-blue-50
                            p-4
                            rounded-xl
                            text-center
                            flex flex-col
                            justify-center
                            border
                            border-blue-200
                        `,children:[(0,s.jsx)(`div`,{className:`
                                text-xs
                                font-bold
                                uppercase
                                mb-1
                                ${u?`text-green-600`:`text-gray-400`}
                            `,children:u?`ONLINE`:`OFFLINE`}),(0,s.jsx)(`div`,{className:`
                                text-5xl
                                md:text-6xl
                                font-extrabold
                                text-blue-600
                                mb-1
                            `,children:f}),(0,s.jsxs)(`div`,{className:`
                                text-xs
                                text-gray-500
                                mb-3
                            `,children:[`Waktu diterima Laravel:`,` `,(0,s.jsx)(`span`,{className:`
                                    font-bold
                                `,children:m})]}),(0,s.jsxs)(`div`,{className:`
                                flex gap-2
                            `,children:[(0,s.jsx)(`button`,{type:`button`,onClick:J,className:`
                                    w-1/2
                                    py-2
                                    text-white
                                    rounded-lg
                                    font-bold
                                    shadow
                                    ${u?`bg-red-600`:`bg-blue-600`}
                                `,children:u?`Stop Pantau`:`Mulai Pantau`}),(0,s.jsx)(`button`,{type:`button`,onClick:Y,className:`
                                    w-1/2
                                    py-2
                                    bg-amber-500
                                    text-white
                                    rounded-lg
                                    font-bold
                                    shadow
                                `,children:`Cari Dokumen`})]}),A&&(0,s.jsxs)(`div`,{className:`
                                    mt-3
                                    text-[10px]
                                    text-left
                                    text-gray-500
                                    break-all
                                `,children:[(0,s.jsxs)(`div`,{children:[`Dokumen ID:`,` `,A]}),(0,s.jsxs)(`div`,{children:[`Status:`,` `,M||`-`]})]})]})]})}),(0,s.jsxs)(`div`,{className:`
                    bg-white
                    p-3 md:p-4
                    rounded-xl
                    shadow
                    w-full
                    max-w-6xl
                    mx-auto
                    space-y-3
                `,children:[(0,s.jsxs)(`div`,{className:`
                        flex
                        justify-between
                        items-center
                        gap-2
                    `,children:[(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`h2`,{className:`
                                font-bold
                                text-gray-700
                                text-base
                            `,children:`Lembar Pack`}),(0,s.jsxs)(`div`,{className:`
                                text-[11px]
                                text-gray-500
                            `,children:[`Pack aktif:`,` `,(0,s.jsx)(`span`,{className:`
                                    font-bold
                                    text-blue-600
                                `,children:I})]}),P&&(0,s.jsx)(`span`,{className:`
                                    text-xs
                                    text-emerald-600
                                    font-semibold
                                `,children:`✓ Timbang sudah selesai`})]}),(0,s.jsxs)(`div`,{className:`
                            flex gap-2
                        `,children:[!P&&(0,s.jsx)(`button`,{type:`button`,onClick:async()=>{let t=e.current;if(!t){alert(`Belum ada dokumen timbang aktif.`);return}if(window.confirm(`Apakah Anda yakin ingin menyelesaikan sesi ini?`))try{H(`Menyelesaikan sesi penimbangan...`);let e=await o.commitTimbangan({dokumen_timbang_awal_id:t});if(!e.success){H(e.message||`Gagal menyelesaikan sesi.`);return}q(),N(`completed`),F(!0),d(!1),p(`0.00`),h(`-`),H(`Sesi penimbangan berhasil diselesaikan.`)}catch(e){H(e.response?.data?.message||e.message||`Gagal menyelesaikan sesi.`),e.response?.data?.error&&H(`Detail backend: ${e.response.data.error}`)}},className:`
                                    px-4
                                    py-2
                                    bg-emerald-600
                                    text-white
                                    rounded-lg
                                    font-bold
                                    text-xs
                                    shadow
                                `,children:`Selesai`}),P&&(0,s.jsx)(`button`,{type:`button`,onClick:()=>{if(!e.current){alert(`ID dokumen timbang tidak ditemukan.`);return}window.open(`/app/produksi/primary/print/${e.current}`,`_blank`)},className:`
                                    px-4
                                    py-2
                                    bg-blue-600
                                    text-white
                                    rounded-lg
                                    font-bold
                                    text-xs
                                    shadow
                                `,children:`🖨 Cetak`})]})]}),(0,s.jsx)(`div`,{className:`
                        flex
                        flex-wrap
                        gap-2 md:gap-3
                        max-h-72
                        overflow-y-auto
                        p-1
                        border
                        rounded-lg
                        bg-gray-50/50
                    `,children:(()=>{let e=[];for(let t=0;t<R;t+=5){let n=t+1;e.push((0,s.jsx)(`div`,{className:`
                        flex flex-col
                        border border-gray-300
                        bg-white
                        rounded-lg
                        overflow-hidden
                        w-full
                        sm:w-[calc(50%-0.25rem)]
                        md:w-[calc(33.333%-0.5rem)]
                        lg:w-[calc(25%-0.6rem)]
                        xl:w-[calc(20%-0.65rem)]
                        shadow-sm
                    `,children:[0,1,2,3,4].map(e=>{let t=n+e,r=B[t]??``,i=t===I,a=r!==``;return(0,s.jsxs)(`div`,{id:`row-${t}`,className:`
                                        flex items-center
                                        w-full h-10 md:h-11
                                        ${e<4?`border-b border-gray-300`:``}
                                        ${i?`bg-blue-100`:`bg-white`}
                                    `,children:[(0,s.jsx)(`div`,{className:`
                                            w-9 sm:w-10 md:w-11
                                            h-full
                                            flex-shrink-0
                                            bg-gray-50
                                            border-r
                                            border-gray-300
                                            flex items-center
                                            justify-center
                                            text-xs md:text-sm
                                            font-bold
                                            text-gray-600
                                        `,children:t}),(0,s.jsx)(`div`,{className:`
                                            flex-1
                                            min-w-0
                                            h-full
                                            px-2 sm:px-3
                                            flex items-center
                                        `,children:(0,s.jsx)(`input`,{type:`text`,readOnly:!0,value:r,className:`
                                                w-full
                                                h-full
                                                bg-transparent
                                                border-none
                                                outline-none
                                                text-right
                                                font-bold
                                                text-sm
                                                md:text-base
                                                text-blue-700
                                            `})}),(0,s.jsx)(`button`,{type:`button`,disabled:!a,onClick:()=>{a&&X(t)},className:`
                                            w-9 sm:w-10 md:w-11
                                            h-full
                                            flex-shrink-0
                                            border-l
                                            border-gray-200
                                            font-bold
                                            text-lg
                                            ${a?`
                                                        text-gray-400
                                                        hover:text-red-600
                                                        hover:bg-red-50
                                                    `:`
                                                        text-transparent
                                                        cursor-default
                                                    `}
                                        `,title:a?`Hapus pack ${t}`:``,children:`×`})]},t)})},n))}return e})()})]}),(0,s.jsx)(`div`,{ref:a,className:`
                    bg-slate-900
                    text-green-400
                    p-3
                    rounded-xl
                    shadow
                    font-mono
                    text-xs
                    h-24
                    overflow-y-auto
                    max-w-6xl
                    mx-auto
                    w-full
                `,children:g.map((e,t)=>(0,s.jsx)(`div`,{children:e},t))})]})}function l({label:e,value:t,onChange:n,type:r=`text`,placeholder:i=``,step:a}){return(0,s.jsxs)(`div`,{children:[(0,s.jsx)(`label`,{className:`
                    block
                    text-gray-500
                    mb-1
                    font-semibold
                `,children:e}),(0,s.jsx)(`input`,{type:r,step:a,value:t,onChange:e=>n(e.target.value),placeholder:i,className:`
                    w-full
                    p-2
                    border
                    rounded-lg
                    bg-gray-50
                    font-medium
                    outline-none
                    focus:border-blue-500
                `})]})}export{c as default};