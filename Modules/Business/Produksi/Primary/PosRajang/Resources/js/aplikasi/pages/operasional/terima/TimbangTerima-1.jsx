import React, { useCallback, useEffect, useRef, useState } from 'react';
import mqtt from 'mqtt';

import PrimaryPos1RajangTimbangAwalService
    from '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/services/PrimaryPos1RajangTimbangAwalService';


export default function TimbangAwal() {

    /*
    |--------------------------------------------------------------------------
    | MQTT
    |--------------------------------------------------------------------------
    */

    const brokerUrl = 'ws://192.168.1.102:9001';
    const targetTopic = '/timbangan/data';

    const mqttClientRef = useRef(null);


    /*
    |--------------------------------------------------------------------------
    | STATE HEADER
    |--------------------------------------------------------------------------
    */

    const [no, setNo] = useState('');
    const [noWo, setNoWo] = useState('');
    const [jenis, setJenis] = useState('');
    const [sK, setSK] = useState('');
    const [tara, setTara] = useState('');
    const [jumlahBal, setJumlahBal] = useState('');


    /*
    |--------------------------------------------------------------------------
    | STATE DOKUMEN
    |--------------------------------------------------------------------------
    */

    const [dokumenId, setDokumenId] = useState(null);
    const dokumenIdRef = useRef(null);

    const [status, setStatus] = useState('');


    /*
    |--------------------------------------------------------------------------
    | STATE MQTT
    |--------------------------------------------------------------------------
    */

    const [isConnected, setIsConnected] = useState(false);
    const [weightDisplay, setWeightDisplay] = useState('0.00');
    const [timeDisplay, setTimeDisplay] = useState('-');


    /*
    |--------------------------------------------------------------------------
    | STATE TALLY
    |--------------------------------------------------------------------------
    */

    const [tallies, setTallies] = useState([]);

    const [nextTally, setNextTally] = useState(1);

    const [isSaving, setIsSaving] = useState(false);

    const [isFinished, setIsFinished] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | LOG
    |--------------------------------------------------------------------------
    */

    const [logs, setLogs] = useState([
        '[Sistem] Menunggu koneksi...'
    ]);

    const logBoxRef = useRef(null);


    /*
    |--------------------------------------------------------------------------
    | HELPER LOG
    |--------------------------------------------------------------------------
    */

    const addLog = useCallback((text) => {

        const time = new Date().toLocaleTimeString(
            'id-ID',
            {
                hour12: false
            }
        );

        setLogs(prev => [
            ...prev,
            `[${time}] ${text}`
        ]);

    }, []);


    /*
    |--------------------------------------------------------------------------
    | AUTO SCROLL LOG
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        if (logBoxRef.current) {

            logBoxRef.current.scrollTop =
                logBoxRef.current.scrollHeight;

        }

    }, [logs]);


    /*
    |--------------------------------------------------------------------------
    | UPDATE DOKUMEN ID REF
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        dokumenIdRef.current = dokumenId;

    }, [dokumenId]);


    /*
    |--------------------------------------------------------------------------
    | LOAD DOKUMEN
    |--------------------------------------------------------------------------
    |
    | Satu fungsi dipakai untuk:
    |
    | - recovery
    | - refresh setelah delete
    | - refresh setelah save
    |
    */

    const loadDokumen = useCallback(async (id) => {

        if (!id) {
            return;
        }

        try {

            addLog(`Mengambil dokumen ${id}...`);

            const response =
                await PrimaryPos1RajangTimbangAwalService.getTimbang(id);

            if (!response?.success) {

                addLog(
                    response?.message ||
                    'Gagal mengambil dokumen timbang.'
                );

                return;
            }

            const data = response.data;

            setDokumenId(data.id);
            setNo(data.no ?? '');
            setNoWo(data.no_wo ?? '');
            setJenis(data.jenis ?? '');
            setSK(data.s_k ?? '');
            setTara(data.tara ?? '');
            setJumlahBal(data.jumlah_bal ?? '');
            setStatus(data.status ?? '');

            /*
             * Backend mengembalikan detailCaches.
             */
            const cacheData =
                Array.isArray(data.detail_caches)
                    ? data.detail_caches
                    : [];

            setTallies(cacheData);

            /*
             * Tentukan nomor tally berikutnya
             * berdasarkan backend.
             */
            const nextResponse =
                await PrimaryPos1RajangTimbangAwalService.getNextTally(id);

            if (nextResponse?.success) {

                const serverNext =
                    Number(
                        nextResponse.data?.next_tally ?? 1
                    );

                setNextTally(
                    serverNext > 0
                        ? serverNext
                        : 1
                );
            }

            const completed =
                data.status === 'completed';

            setIsFinished(completed);

            addLog(
                `Dokumen #${data.no} berhasil dimuat.`
            );

            addLog(
                `Tally tersimpan: ${cacheData.length}`
            );

            if (completed) {

                addLog(
                    'Dokumen sudah completed.'
                );

            }

        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                'Gagal mengambil dokumen timbang.'
            );

        }

    }, [addLog]);


    /*
    |--------------------------------------------------------------------------
    | CARI / RECOVERY DOKUMEN
    |--------------------------------------------------------------------------
    |
    | Karena backend service yang kita punya saat ini:
    |
    | createHeader()
    | getTimbang()
    | getNextTally()
    | saveTally()
    | deleteTally()
    | finish()
    |
    | maka recovery dilakukan menggunakan ID dokumen.
    |
    */

    const handleCariDokumen = async () => {

        const id = window.prompt(
            'Masukkan ID Dokumen Timbang Awal:'
        );

        if (!id) {
            return;
        }

        addLog(
            `Recovery dokumen: ${id}`
        );

        await loadDokumen(id);
    };


    /*
    |--------------------------------------------------------------------------
    | CREATE HEADER
    |--------------------------------------------------------------------------
    */

    const handleCreateHeader = async () => {

        if (!noWo.trim()) {

            alert('No. WO wajib diisi.');

            return;
        }

        if (!jenis.trim()) {

            alert('Jenis wajib diisi.');

            return;
        }

        if (!sK.trim()) {

            alert('S/K wajib diisi.');

            return;
        }

        if (
            tara === '' ||
            Number(tara) < 0
        ) {

            alert('Tara wajib diisi.');

            return;
        }

        if (
            jumlahBal === '' ||
            Number(jumlahBal) < 1
        ) {

            alert('Jumlah bal wajib diisi.');

            return;
        }


        try {

            addLog(
                'Membuat dokumen timbang awal...'
            );

            const payload = {

                /*
                 * no sengaja tidak wajib dikirim.
                 *
                 * Backend membuat otomatis.
                 */
                no: no
                    ? Number(no)
                    : undefined,

                no_wo: noWo.trim(),

                jenis: jenis.trim(),

                s_k: sK.trim(),

                tara: Number(tara),

                jumlah_bal: Number(jumlahBal),

            };


            const response =
                await PrimaryPos1RajangTimbangAwalService.createHeader(
                    payload
                );


            if (!response?.success) {

                addLog(
                    response?.message ||
                    'Gagal membuat dokumen.'
                );

                return;
            }


            const data = response.data;


            setDokumenId(data.id);

            setNo(data.no ?? '');

            setNoWo(data.no_wo ?? '');

            setJenis(data.jenis ?? '');

            setSK(data.s_k ?? '');

            setTara(data.tara ?? '');

            setJumlahBal(data.jumlah_bal ?? '');

            setStatus(data.status ?? 'draft');

            setTallies([]);

            setNextTally(1);

            setIsFinished(false);


            dokumenIdRef.current = data.id;


            addLog(
                `Dokumen #${data.no} berhasil dibuat.`
            );

            addLog(
                `ID Dokumen: ${data.id}`
            );

        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                'Gagal membuat dokumen timbang awal.'
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | SIMPAN TALLY
    |--------------------------------------------------------------------------
    */

    const simpanTally = useCallback(async (
        nomor,
        berat
    ) => {

        const activeId =
            dokumenIdRef.current;

        if (!activeId) {

            addLog(
                'Gagal: dokumen timbang belum tersedia.'
            );

            return;

        }


        if (isFinished) {

            addLog(
                'Dokumen sudah selesai.'
            );

            return;

        }


        if (isSaving) {

            addLog(
                'Proses penyimpanan sebelumnya masih berlangsung.'
            );

            return;

        }


        const beratBruto =
            Number(berat);


        if (!Number.isFinite(beratBruto)) {

            addLog(
                'Berat MQTT tidak valid.'
            );

            return;

        }


        const beratTara =
            Number(tara) || 0;


        try {

            setIsSaving(true);


            addLog(
                `Menyimpan tally ${nomor}: ${beratBruto.toFixed(2)} Kg`
            );


            const response =
                await PrimaryPos1RajangTimbangAwalService.saveTally(
                    activeId,
                    {
                        nomor_tally: nomor,

                        berat_bruto: beratBruto,

                        tara: beratTara,
                    }
                );


            if (!response?.success) {

                addLog(
                    response?.message ||
                    `Gagal menyimpan tally ${nomor}.`
                );

                return;

            }


            addLog(
                `Tally ${nomor} berhasil masuk cache.`
            );


            /*
             * Jangan menghitung sendiri.
             *
             * Ambil ulang dari backend.
             */
            await loadDokumen(activeId);


        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                `Gagal menyimpan tally ${nomor}.`
            );

        } finally {

            setIsSaving(false);

        }

    }, [
        addLog,
        isFinished,
        isSaving,
        tara,
        loadDokumen
    ]);


    /*
    |--------------------------------------------------------------------------
    | CONNECT MQTT
    |--------------------------------------------------------------------------
    */

    const connectMqtt = () => {

        if (mqttClientRef.current?.connected) {

            addLog(
                'MQTT sudah terhubung.'
            );

            return;

        }


        addLog(
            `Menghubungkan MQTT: ${brokerUrl}`
        );


        const client = mqtt.connect(
            brokerUrl,
            {
                username: 'tes',

                password: 'tes123',

                reconnectPeriod: 3000,
            }
        );


        mqttClientRef.current = client;


        client.on(
            'connect',
            () => {

                addLog(
                    'MQTT berhasil terhubung.'
                );


                client.subscribe(
                    targetTopic,
                    (error) => {

                        if (error) {

                            addLog(
                                `Gagal subscribe: ${error.message}`
                            );

                            setIsConnected(false);

                            return;

                        }


                        addLog(
                            `Subscribe: ${targetTopic}`
                        );


                        setIsConnected(true);

                    }
                );

            }
        );


        client.on(
            'message',
            async (topic, message) => {

                if (
                    topic !== targetTopic
                ) {

                    return;

                }


                const raw =
                    message.toString().trim();


                let weight = NaN;

                let time =
                    new Date().toLocaleTimeString(
                        'id-ID',
                        {
                            hour12: false
                        }
                    );


                try {

                    const data =
                        JSON.parse(raw);


                    if (
                        typeof data === 'number'
                    ) {

                        weight =
                            Number(data);

                    } else {

                        weight =
                            Number(
                                data.value ??
                                data.berat ??
                                data.weight ??
                                data.payload
                            );


                        if (data.time) {

                            time =
                                data.time;

                        }

                    }

                } catch {

                    weight =
                        Number(raw);

                }


                if (
                    !Number.isFinite(weight)
                ) {

                    addLog(
                        `Data MQTT bukan berat: ${raw}`
                    );

                    return;

                }


                const beratFixed =
                    weight.toFixed(2);


                setWeightDisplay(
                    beratFixed
                );


                setTimeDisplay(
                    time
                );


                addLog(
                    `Berat masuk: ${beratFixed} Kg`
                );


                /*
                 * Nomor tally selalu berasal
                 * dari state yang sudah disinkron
                 * dengan backend.
                 */
                const nomor =
                    nextTally;


                if (!dokumenIdRef.current) {

                    addLog(
                        'Berat diterima tetapi dokumen belum dibuat.'
                    );

                    return;

                }


                if (isFinished) {

                    addLog(
                        'Dokumen completed. Berat diabaikan.'
                    );

                    return;

                }


                if (
                    Number(jumlahBal) > 0 &&
                    nomor > Number(jumlahBal)
                ) {

                    addLog(
                        'Jumlah bal sudah terpenuhi.'
                    );

                    return;

                }


                await simpanTally(
                    nomor,
                    weight
                );

            }
        );


        client.on(
            'error',
            (error) => {

                addLog(
                    `MQTT Error: ${error.message}`
                );

                setIsConnected(false);

            }
        );


        client.on(
            'close',
            () => {

                addLog(
                    'MQTT terputus.'
                );

                setIsConnected(false);

            }
        );


        client.on(
            'reconnect',
            () => {

                addLog(
                    'MQTT mencoba reconnect...'
                );

            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | DISCONNECT MQTT
    |--------------------------------------------------------------------------
    */

    const disconnectMqtt = () => {

        if (
            mqttClientRef.current
        ) {

            addLog(
                'Memutuskan koneksi MQTT...'
            );


            mqttClientRef.current.end(
                true,
                () => {

                    addLog(
                        'MQTT berhasil diputus.'
                    );

                }
            );


            mqttClientRef.current = null;

        }


        setIsConnected(false);

    };


    /*
    |--------------------------------------------------------------------------
    | CONNECT / DISCONNECT BUTTON
    |--------------------------------------------------------------------------
    */

    const handleConnect = () => {

        if (isConnected) {

            disconnectMqtt();

            return;

        }


        if (!dokumenIdRef.current) {

            alert(
                'Buat atau cari dokumen timbang terlebih dahulu.'
            );

            return;

        }


        if (isFinished) {

            alert(
                'Dokumen sudah selesai.'
            );

            return;

        }


        connectMqtt();

    };


    /*
    |--------------------------------------------------------------------------
    | DELETE TALLY
    |--------------------------------------------------------------------------
    */

    const handleDeleteTally = async (
        nomorTally
    ) => {

        const activeId =
            dokumenIdRef.current;


        if (!activeId) {

            alert(
                'Dokumen timbang tidak ditemukan.'
            );

            return;

        }


        if (isFinished) {

            alert(
                'Dokumen sudah selesai dan tidak dapat diubah.'
            );

            return;

        }


        const target =
            tallies.find(
                item =>
                    Number(item.nomor_tally) ===
                    Number(nomorTally)
            );


        if (!target) {

            alert(
                `Tally nomor ${nomorTally} tidak ditemukan.`
            );

            return;

        }


        const yakin =
            window.confirm(
                `Hapus tally nomor ${nomorTally}?\n\n` +
                `Setelah dihapus, nomor tally di bawahnya ` +
                `akan otomatis bergeser.`
            );


        if (!yakin) {

            return;

        }


        try {

            addLog(
                `Menghapus tally ${nomorTally}...`
            );


            const response =
                await PrimaryPos1RajangTimbangAwalService.deleteTally(
                    activeId,
                    nomorTally
                );


            if (!response?.success) {

                addLog(
                    response?.message ||
                    `Gagal menghapus tally ${nomorTally}.`
                );

                return;

            }


            addLog(
                `Tally ${nomorTally} berhasil dihapus.`
            );


            addLog(
                'Memuat ulang nomor tally dari backend...'
            );


            /*
             * Backend yang melakukan pergeseran nomor.
             *
             * Frontend tidak menggeser nomor sendiri.
             */
            await loadDokumen(
                activeId
            );


        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                `Gagal menghapus tally ${nomorTally}.`
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | FINISH
    |--------------------------------------------------------------------------
    */

    const handleFinish = async () => {

        const activeId =
            dokumenIdRef.current;


        if (!activeId) {

            alert(
                'Belum ada dokumen timbang aktif.'
            );

            return;

        }


        if (isFinished) {

            alert(
                'Dokumen sudah selesai.'
            );

            return;

        }


        const targetJumlah =
            Number(jumlahBal);


        if (
            tallies.length !==
            targetJumlah
        ) {

            alert(
                `Jumlah tally belum lengkap.\n\n` +
                `Rencana: ${targetJumlah} bal\n` +
                `Sudah ditimbang: ${tallies.length} bal`
            );

            return;

        }


        const yakin =
            window.confirm(
                'Apakah Anda yakin ingin menyelesaikan penimbangan ini?'
            );


        if (!yakin) {

            return;

        }


        try {

            addLog(
                'Menyelesaikan penimbangan...'
            );


            const response =
                await PrimaryPos1RajangTimbangAwalService.finish(
                    activeId
                );


            if (!response?.success) {

                addLog(
                    response?.message ||
                    'Gagal menyelesaikan penimbangan.'
                );

                return;

            }


            disconnectMqtt();


            setIsFinished(true);

            setStatus('completed');


            addLog(
                'Penimbangan berhasil diselesaikan.'
            );


            /*
             * Refresh dari backend.
             */
            await loadDokumen(
                activeId
            );


        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                'Gagal menyelesaikan penimbangan.'
            );

        }

    };


    /*
    |--------------------------------------------------------------------------
    | CLEANUP MQTT
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        return () => {

            if (
                mqttClientRef.current
            ) {

                mqttClientRef.current.end(
                    true
                );

                mqttClientRef.current = null;

            }

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | RENDER TALLY
    |--------------------------------------------------------------------------
    */

    const renderTallyGrid = () => {

        const jumlah =
            Math.max(
                Number(jumlahBal) || 0,
                tallies.length,
                nextTally
            );


        /*
         * Tampilkan minimal kelipatan 5.
         */
        const totalBoxes =
            Math.max(
                5,
                Math.ceil(jumlah / 5) * 5
            );


        const groups = [];


        for (
            let i = 0;
            i < totalBoxes;
            i += 5
        ) {

            const start =
                i + 1;


            groups.push(

                <div
                    key={start}
                    className="
                        flex
                        flex-col
                        border
                        border-gray-400
                        bg-white
                        rounded
                        overflow-hidden
                        w-[calc(50%-0.3rem)]
                        sm:w-[calc(33.333%-0.5rem)]
                        md:w-[calc(25%-0.6rem)]
                        lg:w-[calc(16.666%-0.65rem)]
                        shadow-sm
                    "
                >

                    {[0, 1, 2, 3, 4].map(
                        j => {

                            const nomor =
                                start + j;


                            const item =
                                tallies.find(
                                    tally =>
                                        Number(
                                            tally.nomor_tally
                                        ) === nomor
                                );


                            const isActive =
                                nomor === nextTally &&
                                !isFinished;


                            const isFilled =
                                Boolean(item);


                            const borderClass =
                                j < 4
                                    ? 'border-b border-gray-300'
                                    : '';


                            return (

                                <div
                                    key={nomor}
                                    id={`row-${nomor}`}
                                    className={`
                                        flex
                                        ${borderClass}
                                        h-9
                                        md:h-10
                                        items-center
                                        ${isActive
                                            ? 'bg-blue-100'
                                            : ''
                                        }
                                    `}
                                >

                                    <div
                                        className="
                                            w-7
                                            md:w-8
                                            bg-gray-50
                                            flex-shrink-0
                                            border-r
                                            border-gray-300
                                            flex
                                            items-center
                                            justify-center
                                            text-[10px]
                                            md:text-xs
                                            font-bold
                                            text-gray-600
                                        "
                                    >
                                        {nomor}
                                    </div>


                                    <div
                                        className="
                                            flex-1
                                            min-w-0
                                            px-1
                                            text-right
                                        "
                                    >

                                        {isFilled ? (

                                            <span
                                                className="
                                                    font-bold
                                                    text-xs
                                                    md:text-sm
                                                    text-blue-700
                                                "
                                            >
                                                {Number(
                                                    item.berat_netto
                                                ).toFixed(2)}
                                            </span>

                                        ) : (

                                            <span
                                                className="
                                                    text-[10px]
                                                    text-gray-300
                                                "
                                            >
                                                -
                                            </span>

                                        )}

                                    </div>


                                    {isFilled &&
                                        !isFinished && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteTally(
                                                        nomor
                                                    )
                                                }
                                                className="
                                                    mr-1
                                                    w-5
                                                    h-5
                                                    rounded-full
                                                    bg-rose-500
                                                    hover:bg-rose-600
                                                    text-white
                                                    flex
                                                    items-center
                                                    justify-center
                                                    text-xs
                                                    font-bold
                                                    shadow-sm
                                                    active:scale-90
                                                    transition
                                                "
                                                title={`Hapus tally ${nomor}`}
                                            >
                                                ×
                                            </button>

                                        )}

                                </div>

                            );

                        }
                    )}

                </div>

            );

        }


        return groups;

    };


    /*
    |--------------------------------------------------------------------------
    | AUTO SCROLL KE TALLY AKTIF
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const row =
            document.getElementById(
                `row-${nextTally}`
            );


        if (row) {

            row.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });

        }

    }, [nextTally]);


    /*
    |--------------------------------------------------------------------------
    | UI
    |--------------------------------------------------------------------------
    */

    return (

        <div
            className="
                max-w-6xl
                mx-auto
                w-full
                space-y-4
                p-4
                md:p-6
            "
        >

            {/* =========================================================
                CARD 1
            ========================================================== */}

            <div
                className="
                    bg-white
                    p-4
                    md:p-6
                    rounded-xl
                    shadow
                    border
                    border-slate-200
                "
            >

                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-6
                        items-center
                    "
                >

                    {/* HEADER */}

                    <div className="space-y-3">

                        <div
                            className="
                                border-b
                                pb-2
                                flex
                                justify-between
                                items-center
                            "
                        >

                            <h3
                                className="
                                    font-bold
                                    text-gray-700
                                    text-sm
                                "
                            >
                                Informasi Timbang Awal
                            </h3>


                            {status && (

                                <span
                                    className={`
                                        px-2
                                        py-1
                                        rounded-full
                                        text-[10px]
                                        font-bold
                                        uppercase
                                        ${
                                            status === 'completed'
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : status === 'in_progress'
                                                    ? 'bg-blue-100 text-blue-700'
                                                    : 'bg-amber-100 text-amber-700'
                                        }
                                    `}
                                >
                                    {status}
                                </span>

                            )}

                        </div>


                        <div
                            className="
                                grid
                                grid-cols-1
                                sm:grid-cols-2
                                gap-3
                                text-xs
                            "
                        >

                            {/* NO */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-gray-500
                                        mb-1
                                        font-semibold
                                    "
                                >
                                    No. Dokumen
                                </label>

                                <input
                                    type="number"
                                    value={no}
                                    onChange={e =>
                                        setNo(e.target.value)
                                    }
                                    placeholder="Otomatis"
                                    className="
                                        w-full
                                        p-2
                                        border
                                        rounded-lg
                                        bg-gray-50
                                        font-medium
                                        outline-none
                                        focus:border-blue-500
                                    "
                                />

                            </div>


                            {/* NO WO */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-gray-500
                                        mb-1
                                        font-semibold
                                    "
                                >
                                    No. WO
                                </label>

                                <input
                                    type="text"
                                    value={noWo}
                                    onChange={e =>
                                        setNoWo(e.target.value)
                                    }
                                    placeholder="Contoh: EXE-30"
                                    disabled={Boolean(dokumenId)}
                                    className="
                                        w-full
                                        p-2
                                        border
                                        rounded-lg
                                        bg-gray-50
                                        font-medium
                                        outline-none
                                        focus:border-blue-500
                                        disabled:bg-slate-100
                                        disabled:text-slate-500
                                    "
                                />

                            </div>


                            {/* JENIS */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-gray-500
                                        mb-1
                                        font-semibold
                                    "
                                >
                                    Jenis
                                </label>

                                <input
                                    type="text"
                                    value={jenis}
                                    onChange={e =>
                                        setJenis(e.target.value)
                                    }
                                    placeholder="CHN"
                                    disabled={Boolean(dokumenId)}
                                    className="
                                        w-full
                                        p-2
                                        border
                                        rounded-lg
                                        bg-gray-50
                                        font-medium
                                        outline-none
                                        focus:border-blue-500
                                        disabled:bg-slate-100
                                        disabled:text-slate-500
                                    "
                                />

                            </div>


                            {/* S/K */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-gray-500
                                        mb-1
                                        font-semibold
                                    "
                                >
                                    S / K
                                </label>

                                <input
                                    type="text"
                                    value={sK}
                                    onChange={e =>
                                        setSK(e.target.value)
                                    }
                                    placeholder="4/J1/21"
                                    disabled={Boolean(dokumenId)}
                                    className="
                                        w-full
                                        p-2
                                        border
                                        rounded-lg
                                        bg-gray-50
                                        font-medium
                                        outline-none
                                        focus:border-blue-500
                                        disabled:bg-slate-100
                                        disabled:text-slate-500
                                    "
                                />

                            </div>


                            {/* TARA */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-gray-500
                                        mb-1
                                        font-semibold
                                    "
                                >
                                    Berat Tara
                                </label>

                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={tara}
                                    onChange={e =>
                                        setTara(e.target.value)
                                    }
                                    placeholder="4.50"
                                    disabled={Boolean(dokumenId)}
                                    className="
                                        w-full
                                        p-2
                                        border
                                        rounded-lg
                                        bg-gray-50
                                        font-medium
                                        outline-none
                                        focus:border-blue-500
                                        disabled:bg-slate-100
                                        disabled:text-slate-500
                                    "
                                />

                            </div>


                            {/* JUMLAH BAL */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-gray-500
                                        mb-1
                                        font-semibold
                                    "
                                >
                                    Jumlah Bal
                                </label>

                                <input
                                    type="number"
                                    min="1"
                                    value={jumlahBal}
                                    onChange={e =>
                                        setJumlahBal(e.target.value)
                                    }
                                    placeholder="15"
                                    disabled={Boolean(dokumenId)}
                                    className="
                                        w-full
                                        p-2
                                        border
                                        rounded-lg
                                        bg-gray-50
                                        font-medium
                                        outline-none
                                        focus:border-blue-500
                                        disabled:bg-slate-100
                                        disabled:text-slate-500
                                    "
                                />

                            </div>

                        </div>

                    </div>


                    {/* MQTT */}

                    <div
                        className="
                            bg-blue-50
                            p-4
                            rounded-xl
                            text-center
                            flex
                            flex-col
                            justify-center
                            border
                            border-blue-200
                        "
                    >

                        <div
                            className={`
                                text-xs
                                font-bold
                                uppercase
                                mb-1
                                ${
                                    isConnected
                                        ? 'text-green-500'
                                        : 'text-gray-400'
                                }
                            `}
                        >
                            {isConnected
                                ? 'Online'
                                : 'Offline'
                            }
                        </div>


                        <div
                            className="
                                text-5xl
                                md:text-6xl
                                font-extrabold
                                text-blue-600
                                mb-1
                            "
                        >
                            {weightDisplay}
                        </div>


                        <div
                            className="
                                text-xs
                                text-gray-500
                                mb-3
                            "
                        >
                            Waktu MQTT:{' '}

                            <span
                                className="font-bold"
                            >
                                {timeDisplay}
                            </span>
                        </div>


                        <div
                            className="
                                grid
                                grid-cols-2
                                gap-2
                            "
                        >

                            {/* CREATE */}

                            <button
                                type="button"
                                onClick={handleCreateHeader}
                                disabled={
                                    Boolean(dokumenId) ||
                                    isFinished
                                }
                                className="
                                    py-2
                                    bg-indigo-600
                                    text-white
                                    rounded-lg
                                    font-bold
                                    shadow
                                    hover:bg-indigo-700
                                    disabled:bg-slate-300
                                    disabled:cursor-not-allowed
                                    active:scale-95
                                    transition
                                    text-xs
                                "
                            >
                                Buat Dokumen
                            </button>


                            {/* CARI */}

                            <button
                                type="button"
                                onClick={handleCariDokumen}
                                disabled={isConnected}
                                className="
                                    py-2
                                    bg-amber-500
                                    text-white
                                    rounded-lg
                                    font-bold
                                    shadow
                                    hover:bg-amber-600
                                    disabled:bg-slate-300
                                    disabled:cursor-not-allowed
                                    active:scale-95
                                    transition
                                    text-xs
                                "
                            >
                                Cari Dokumen
                            </button>


                            {/* CONNECT */}

                            <button
                                type="button"
                                onClick={handleConnect}
                                disabled={
                                    !dokumenId ||
                                    isFinished
                                }
                                className={`
                                    col-span-2
                                    py-2
                                    text-white
                                    rounded-lg
                                    font-bold
                                    shadow
                                    active:scale-95
                                    transition
                                    text-xs
                                    ${
                                        isConnected
                                            ? 'bg-red-600 hover:bg-red-700'
                                            : 'bg-blue-600 hover:bg-blue-700'
                                    }
                                    disabled:bg-slate-300
                                    disabled:cursor-not-allowed
                                `}
                            >
                                {isConnected
                                    ? 'Disconnect Timbangan'
                                    : 'Connect Timbangan'
                                }
                            </button>

                        </div>


                        {dokumenId && (

                            <div
                                className="
                                    mt-3
                                    text-[10px]
                                    text-left
                                    text-gray-500
                                    break-all
                                "
                            >

                                <div>
                                    Dokumen ID: {dokumenId}
                                </div>

                                <div>
                                    No. Dokumen: {no}
                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =========================================================
                CARD 2
            ========================================================== */}

            <div
                className="
                    bg-white
                    p-3
                    md:p-4
                    rounded-xl
                    shadow
                    border
                    border-slate-200
                    w-full
                    max-w-6xl
                    mx-auto
                    space-y-3
                "
            >

                <div
                    className="
                        flex
                        justify-between
                        items-center
                        gap-2
                    "
                >

                    <div>

                        <h2
                            className="
                                font-bold
                                text-gray-700
                                text-base
                            "
                        >
                            Lembar Tally
                        </h2>


                        <div
                            className="
                                text-xs
                                text-gray-500
                                mt-1
                            "
                        >

                            Tally:{' '}

                            <span
                                className="
                                    font-bold
                                    text-blue-600
                                "
                            >
                                {tallies.length}
                            </span>

                            {' / '}

                            <span
                                className="font-bold"
                            >
                                {jumlahBal || 0}
                            </span>


                            {!isFinished && (

                                <>
                                    {' • '}
                                    Berikutnya:{' '}

                                    <span
                                        className="
                                            font-bold
                                            text-emerald-600
                                        "
                                    >
                                        {nextTally}
                                    </span>
                                </>

                            )}

                        </div>


                        {isFinished && (

                            <span
                                className="
                                    text-xs
                                    text-emerald-600
                                    font-semibold
                                "
                            >
                                ✓ Penimbangan sudah selesai
                            </span>

                        )}

                    </div>


                    {!isFinished && dokumenId && (

                        <button
                            type="button"
                            onClick={handleFinish}
                            disabled={
                                tallies.length !==
                                Number(jumlahBal)
                            }
                            className="
                                px-4
                                py-2
                                bg-emerald-600
                                text-white
                                rounded-lg
                                font-bold
                                text-xs
                                md:text-sm
                                shadow
                                hover:bg-emerald-700
                                disabled:bg-slate-300
                                disabled:cursor-not-allowed
                                active:scale-95
                                transition
                            "
                        >
                            Selesai / Close
                        </button>

                    )}

                </div>


                <div
                    className="
                        flex
                        flex-wrap
                        gap-2
                        md:gap-3
                        max-h-72
                        overflow-y-auto
                        p-1
                        border
                        rounded-lg
                        bg-gray-50/50
                    "
                >

                    {dokumenId ? (

                        renderTallyGrid()

                    ) : (

                        <div
                            className="
                                w-full
                                py-12
                                text-center
                                text-sm
                                text-gray-400
                            "
                        >
                            Buat atau cari dokumen timbang
                            terlebih dahulu.
                        </div>

                    )}

                </div>

            </div>


            {/* =========================================================
                CARD 3
            ========================================================== */}

            <div
                ref={logBoxRef}
                className="
                    bg-slate-900
                    text-green-400
                    p-3
                    rounded-xl
                    shadow
                    font-mono
                    text-xs
                    h-28
                    overflow-y-auto
                    flex
                    flex-col
                    justify-end
                    max-w-6xl
                    mx-auto
                    w-full
                "
            >

                {logs.map(
                    (log, index) => (

                        <div
                            key={index}
                            className="leading-5"
                        >
                            {log}
                        </div>

                    )
                )}

            </div>

        </div>

    );

}