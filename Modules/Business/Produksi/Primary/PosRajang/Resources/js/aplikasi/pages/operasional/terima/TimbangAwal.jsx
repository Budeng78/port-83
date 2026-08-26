import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import mqtt from 'mqtt';

import {
    Timbangawal
} from '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/services/Timbangawal';


export default function TimbangAwal() {

    // =========================================================
    // MQTT
    // =========================================================

    const brokerUrl = 'ws://192.168.1.102:9001';
    const targetTopic = '/timbangan/data';

    const mqttClientRef = useRef(null);


    // =========================================================
    // DOKUMEN
    // =========================================================

    const dokumenIdRef = useRef(null);

    const currentIndexRef = useRef(1);

    const savedTallyRef = useRef(
        new Set()
    );

    const savingTallyRef = useRef(
        new Set()
    );


    // =========================================================
    // LOG
    // =========================================================

    const logBoxRef = useRef(null);


    // =========================================================
    // CONNECTION STATE
    // =========================================================

    const [
        isConnected,
        setIsConnected
    ] = useState(false);


    // =========================================================
    // DISPLAY TIMBANGAN
    // =========================================================

    const [
        weightDisplay,
        setWeightDisplay
    ] = useState('0.00');

    const [
        timeDisplay,
        setTimeDisplay
    ] = useState('-');


    // =========================================================
    // LOG DATA
    // =========================================================

    const [
        logs,
        setLogs
    ] = useState([
        '[Sistem] Menunggu koneksi...'
    ]);


    // =========================================================
    // HEADER
    // =========================================================

    const [no, setNo] = useState('');
    const [noWo, setNoWo] = useState('');
    const [jenis, setJenis] = useState('');
    const [sK, setSK] = useState('');
    const [tara, setTara] = useState('');
    const [jumlahBal, setJumlahBal] = useState('');


    // =========================================================
    // DOKUMEN STATE
    // =========================================================

    const [
        dokumenId,
        setDokumenId
    ] = useState(null);

    const [
        status,
        setStatus
    ] = useState(null);

    const [
        isFinished,
        setIsFinished
    ] = useState(false);


    // =========================================================
    // TALLY
    // =========================================================

    const [
        currentIndex,
        setCurrentIndex
    ] = useState(1);

    const [
        totalBoxes,
        setTotalBoxes
    ] = useState(5);

    const [
        tallyValues,
        setTallyValues
    ] = useState({});


    // =========================================================
    // LOG HELPER
    // =========================================================

    const addLog = text => {

        const time =
            new Date().toLocaleTimeString(
                'id-ID',
                {
                    hour12: false
                }
            );

        setLogs(prev => [
            ...prev,
            `[${time}] ${text}`
        ]);
    };


    // =========================================================
    // CURRENT TALLY HELPER
    // =========================================================

    const setNextTally = next => {

        const value =
            Number(next) || 1;

        currentIndexRef.current =
            value;

        setCurrentIndex(value);
    };


    // =========================================================
    // AUTO SCROLL LOG
    // =========================================================

    useEffect(() => {

        if (logBoxRef.current) {

            logBoxRef.current.scrollTop =
                logBoxRef.current.scrollHeight;
        }

    }, [logs]);


    // =========================================================
    // SIMPAN TALLY
    // =========================================================

    const simpanTally = async (
        nomor,
        berat
    ) => {

        const activeDokumenId =
            dokumenIdRef.current;


        if (!activeDokumenId) {

            addLog(
                'Gagal: Dokumen timbang belum tersedia.'
            );

            return false;
        }


        if (
            savedTallyRef.current.has(
                nomor
            )
        ) {

            addLog(
                `Tally ${nomor} sudah tersimpan, dilewati.`
            );

            return false;
        }


        if (
            savingTallyRef.current.has(
                nomor
            )
        ) {

            addLog(
                `Tally ${nomor} sedang diproses.`
            );

            return false;
        }


        savingTallyRef.current.add(
            nomor
        );


        const beratBruto =
            Number(berat) || 0;

        const beratTara =
            Number(tara) || 0;

        const beratNetto =
            Math.max(
                0,
                beratBruto - beratTara
            );


        addLog(
            `Menyimpan tally ${nomor}...`
        );


        try {

            // MariaDB DATETIME
            const waktuTimbang =
                new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ');


            const data =
                await Timbangawal.tambahTally({

                    dokumen_timbang_awal_id:
                        activeDokumenId,

                    nomor_tally:
                        nomor,

                    berat_bruto:
                        beratBruto,

                    tara:
                        beratTara,

                    berat_netto:
                        beratNetto,

                    waktu_timbang:
                        waktuTimbang
                });


            if (!data.success) {

                addLog(
                    data.message ||
                    `Gagal menyimpan tally ${nomor}.`
                );


                if (data.error) {

                    addLog(
                        `Detail backend: ${data.error}`
                    );
                }


                return false;
            }


            savedTallyRef.current.add(
                nomor
            );


            addLog(
                `Tally ${nomor} berhasil tersimpan.`
            );


            return true;

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                `Gagal menyimpan tally ${nomor}.`
            );


            if (
                err.response?.data?.error
            ) {

                addLog(
                    `Detail backend: ${err.response.data.error}`
                );
            }


            return false;

        } finally {

            savingTallyRef.current.delete(
                nomor
            );
        }
    };


    // =========================================================
    // MQTT CONNECT
    // =========================================================

    const connectMqtt = () => {

        if (
            mqttClientRef.current?.connected
        ) {

            addLog(
                'MQTT sudah terhubung.'
            );

            return;
        }


        addLog(
            `Menghubungkan MQTT: ${brokerUrl}`
        );


        const client =
            mqtt.connect(
                brokerUrl,
                {
                    username: 'tes',
                    password: 'tes123',
                    reconnectPeriod: 3000
                }
            );


        mqttClientRef.current =
            client;


        client.on(
            'connect',
            () => {

                addLog(
                    'MQTT berhasil terhubung.'
                );


                client.subscribe(
                    targetTopic,
                    err => {

                        if (err) {

                            addLog(
                                `Gagal subscribe: ${err.message}`
                            );

                            setIsConnected(
                                false
                            );

                            return;
                        }


                        addLog(
                            `Subscribe: ${targetTopic}`
                        );


                        setIsConnected(
                            true
                        );
                    }
                );
            }
        );


        // =====================================================
        // MQTT MESSAGE
        // =====================================================

        client.on(
            'message',
            async (
                topic,
                message
            ) => {

                if (
                    topic !==
                    targetTopic
                ) {
                    return;
                }


                const raw =
                    message
                        .toString()
                        .trim();


                let weight =
                    NaN;

                let time =
                    new Date()
                        .toLocaleTimeString(
                            'id-ID',
                            {
                                hour12: false
                            }
                        );


                try {

                    const data =
                        JSON.parse(raw);


                    if (
                        typeof data ===
                        'number'
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
                    !Number.isFinite(
                        weight
                    )
                ) {

                    addLog(
                        `Data MQTT bukan berat: ${raw}`
                    );

                    return;
                }


                // PENTING:
                // ambil nomor dari REF,
                // bukan currentIndex state
                const nomor =
                    currentIndexRef.current;


                const beratFixed =
                    weight.toFixed(2);


                setWeightDisplay(
                    beratFixed
                );

                setTimeDisplay(
                    time
                );


                addLog(
                    `Berat masuk: ${beratFixed} Kg → Tally ${nomor}`
                );


                // =================================================
                // TAMPILKAN SEMENTARA
                // =================================================

                setTallyValues(
                    prev => ({
                        ...prev,
                        [nomor]:
                            beratFixed
                    })
                );


                // =================================================
                // SIMPAN
                // =================================================

                const berhasil =
                    await simpanTally(
                        nomor,
                        weight
                    );


                // =================================================
                // GAGAL
                // =================================================

                if (!berhasil) {

                    setTallyValues(
                        prev => {

                            const copy = {
                                ...prev
                            };

                            delete copy[
                                nomor
                            ];

                            return copy;
                        }
                    );


                    addLog(
                        `Tally ${nomor} tetap aktif karena penyimpanan gagal.`
                    );


                    return;
                }


                // =================================================
                // BERHASIL
                // =================================================

                const next =
                    nomor + 1;


                setNextTally(
                    next
                );


                // =================================================
                // TAMBAH 5 BARIS
                // =================================================

                setTotalBoxes(
                    prev => {

                        if (
                            next > prev
                        ) {

                            return prev + 5;
                        }

                        return prev;
                    }
                );


                addLog(
                    `Tally berikutnya: ${next}`
                );
            }
        );


        // =====================================================
        // MQTT ERROR
        // =====================================================

        client.on(
            'error',
            err => {

                addLog(
                    `MQTT Error: ${err.message}`
                );

                setIsConnected(
                    false
                );
            }
        );


        // =====================================================
        // MQTT CLOSE
        // =====================================================

        client.on(
            'close',
            () => {

                addLog(
                    'MQTT terputus.'
                );

                setIsConnected(
                    false
                );
            }
        );


        // =====================================================
        // MQTT RECONNECT
        // =====================================================

        client.on(
            'reconnect',
            () => {

                addLog(
                    'MQTT mencoba reconnect...'
                );
            }
        );
    };


    // =========================================================
    // MQTT DISCONNECT
    // =========================================================

    const disconnectMqtt = () => {

        if (
            mqttClientRef.current
        ) {

            addLog(
                'Memutuskan koneksi MQTT...'
            );


            mqttClientRef.current.end(
                true
            );


            mqttClientRef.current =
                null;
        }


        setIsConnected(
            false
        );
    };


    // =========================================================
    // CONNECT / CREATE / RECOVERY
    // =========================================================

    const handleConnect = async () => {

        if (isConnected) {

            disconnectMqtt();

            return;
        }


        if (
            dokumenIdRef.current
        ) {

            addLog(
                'Dokumen timbang sudah tersedia.'
            );

            connectMqtt();

            return;
        }


        if (
            !no ||
            !noWo ||
            !jenis ||
            !sK ||
            !tara ||
            !jumlahBal
        ) {

            alert(
                'Lengkapi No, No WO, Jenis, S/K, Tara dan Jumlah Bal.'
            );

            return;
        }


        try {

            addLog(
                'Mencari dokumen timbang aktif...'
            );


            const hasil =
                await Timbangawal.cariBatch({
                    no_wo: noWo,
                    jenis,
                    s_k: sK
                });


            // =================================================
            // RECOVERY
            // =================================================

            if (
                hasil.success &&
                hasil.found === true &&
                hasil.data
                    ?.dokumen_timbang_awal
            ) {

                const dokumen =
                    hasil.data
                        .dokumen_timbang_awal;


                const details =
                    hasil.data.details ||
                    [];


                const next =
                    Number(
                        hasil.data.next_tally ||
                        details.length + 1
                    );


                dokumenIdRef.current =
                    dokumen.id;


                setDokumenId(
                    dokumen.id
                );


                setNo(
                    dokumen.no ?? ''
                );

                setNoWo(
                    dokumen.no_wo ?? ''
                );

                setJenis(
                    dokumen.jenis ?? ''
                );

                setSK(
                    dokumen.s_k ?? ''
                );

                setTara(
                    dokumen.tara ?? ''
                );

                setJumlahBal(
                    dokumen.jumlah_bal ?? ''
                );


                setStatus(
                    dokumen.status
                );


                setIsFinished(
                    false
                );


                // =============================================
                // LOAD TALLY
                // =============================================

                const values = {};


                details.forEach(
                    item => {

                        const nomor =
                            Number(
                                item.nomor_tally
                            );

                        const berat =
                            Number(
                                item.berat_netto
                            );


                        if (
                            Number.isFinite(
                                nomor
                            ) &&
                            Number.isFinite(
                                berat
                            )
                        ) {

                            values[
                                nomor
                            ] =
                                berat.toFixed(
                                    2
                                );
                        }
                    }
                );


                setTallyValues(
                    values
                );


                savedTallyRef.current =
                    new Set(
                        details.map(
                            item =>
                                Number(
                                    item.nomor_tally
                                )
                        )
                    );


                setNextTally(
                    next
                );


                // =============================================
                // TAMPILKAN MINIMAL 5
                // =============================================

                setTotalBoxes(
                    Math.max(
                        5,
                        Math.ceil(
                            next / 5
                        ) * 5
                    )
                );


                addLog(
                    `Dokumen aktif ditemukan: ${dokumen.id}`
                );


                addLog(
                    `Tally tersimpan: ${details.length}`
                );


                addLog(
                    `Tally berikutnya: ${next}`
                );


                connectMqtt();

                return;
            }


            // =================================================
            // CREATE
            // =================================================

            if (
                hasil.success &&
                hasil.found === false
            ) {

                addLog(
                    'Dokumen aktif tidak ditemukan. Membuat dokumen baru...'
                );


                const data =
                    await Timbangawal
                        .initiateTimbanganDraft({
                            no:
                                Number(no),

                            no_wo:
                                noWo,

                            jenis:
                                jenis,

                            s_k:
                                sK,

                            tara:
                                Number(tara),

                            jumlah_bal:
                                Number(
                                    jumlahBal
                                )
                        });


                if (
                    !data.success
                ) {

                    addLog(
                        data.message ||
                        'Gagal membuat dokumen.'
                    );

                    return;
                }


                const dokumen =
                    data.data
                        ?.dokumen_timbang_awal;


                if (
                    !dokumen?.id
                ) {

                    addLog(
                        'Response tidak memiliki ID dokumen.'
                    );

                    return;
                }


                const next =
                    Number(
                        data.data
                            ?.next_tally ||
                        1
                    );


                dokumenIdRef.current =
                    dokumen.id;


                setDokumenId(
                    dokumen.id
                );


                setNo(
                    dokumen.no ?? no
                );

                setNoWo(
                    dokumen.no_wo ?? noWo
                );

                setJenis(
                    dokumen.jenis ?? jenis
                );

                setSK(
                    dokumen.s_k ?? sK
                );

                setTara(
                    dokumen.tara ?? tara
                );

                setJumlahBal(
                    dokumen.jumlah_bal ??
                    jumlahBal
                );


                setStatus(
                    dokumen.status
                );


                setIsFinished(
                    false
                );


                savedTallyRef.current =
                    new Set();


                savingTallyRef.current =
                    new Set();


                setTallyValues(
                    {}
                );


                setNextTally(
                    next
                );


                // =============================================
                // SELALU MULAI 5 BARIS
                // =============================================

                setTotalBoxes(
                    5
                );


                addLog(
                    `Dokumen baru dibuat: ${dokumen.id}`
                );


                addLog(
                    `Tally berikutnya: ${next}`
                );


                connectMqtt();

                return;
            }

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                err.message ||
                'Gagal menginisiasi penimbangan.'
            );


            if (
                err.response?.data?.error
            ) {

                addLog(
                    `Detail backend: ${err.response.data.error}`
                );
            }
        }
    };


    // =========================================================
    // CARI BATCH / RECOVERY
    // =========================================================

    const handleCariBatch = async () => {

        if (
            !noWo ||
            !jenis ||
            !sK
        ) {

            alert(
                'Isi No WO, Jenis dan S/K terlebih dahulu.'
            );

            return;
        }


        try {

            addLog(
                'Mencari dokumen timbang aktif...'
            );


            const data =
                await Timbangawal.cariBatch({
                    no_wo: noWo,
                    jenis,
                    s_k: sK
                });


            if (
                !data.success ||
                !data.found
            ) {

                addLog(
                    data.message ||
                    'Dokumen timbang aktif tidak ditemukan.'
                );

                return;
            }


            const dokumen =
                data.data
                    ?.dokumen_timbang_awal;


            const details =
                data.data?.details ||
                [];


            if (!dokumen) {

                addLog(
                    'Data dokumen tidak ditemukan.'
                );

                return;
            }


            const next =
                Number(
                    data.data?.next_tally ||
                    details.length + 1
                );


            dokumenIdRef.current =
                dokumen.id;


            setDokumenId(
                dokumen.id
            );


            setNo(
                dokumen.no ?? ''
            );

            setNoWo(
                dokumen.no_wo ?? ''
            );

            setJenis(
                dokumen.jenis ?? ''
            );

            setSK(
                dokumen.s_k ?? ''
            );

            setTara(
                dokumen.tara ?? ''
            );

            setJumlahBal(
                dokumen.jumlah_bal ?? ''
            );

            setStatus(
                dokumen.status
            );


            setIsFinished(
                false
            );


            const values = {};


            details.forEach(
                item => {

                    const nomor =
                        Number(
                            item.nomor_tally
                        );

                    const berat =
                        Number(
                            item.berat_netto
                        );


                    if (
                        Number.isFinite(
                            nomor
                        ) &&
                        Number.isFinite(
                            berat
                        )
                    ) {

                        values[
                            nomor
                        ] =
                            berat.toFixed(
                                2
                            );
                    }
                }
            );


            setTallyValues(
                values
            );


            savedTallyRef.current =
                new Set(
                    details.map(
                        item =>
                            Number(
                                item.nomor_tally
                            )
                    )
                );


            setNextTally(
                next
            );


            setTotalBoxes(
                Math.max(
                    5,
                    Math.ceil(
                        next / 5
                    ) * 5
                )
            );


            addLog(
                `Dokumen ditemukan: ${dokumen.id}`
            );


            addLog(
                `Tally tersimpan: ${details.length}`
            );


            addLog(
                `Tally berikutnya: ${next}`
            );

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                err.message ||
                'Gagal mencari dokumen timbang.'
            );


            if (
                err.response?.data?.error
            ) {

                addLog(
                    `Detail backend: ${err.response.data.error}`
                );
            }
        }
    };


    // =========================================================
    // DELETE TALLY
    // =========================================================

    const handleDeleteTally = async (
        nomor
    ) => {

        const activeDokumenId =
            dokumenIdRef.current;


        if (!activeDokumenId) {

            addLog(
                'Dokumen timbang belum tersedia.'
            );

            return;
        }


        if (
            !savedTallyRef.current.has(
                nomor
            )
        ) {

            return;
        }


        if (
            !window.confirm(
                `Hapus tally nomor ${nomor}?`
            )
        ) {

            return;
        }


        try {

            addLog(
                `Menghapus tally ${nomor}...`
            );


            const data =
                await Timbangawal.deleteTally({
                    dokumen_timbang_awal_id:
                        activeDokumenId,

                    nomor_tally:
                        nomor
                });


            if (
                !data.success
            ) {

                addLog(
                    data.message ||
                    `Gagal menghapus tally ${nomor}.`
                );

                return;
            }


            const details =
                data.data?.details ||
                [];


            const values = {};


            details.forEach(
                item => {

                    const nomorBaru =
                        Number(
                            item.nomor_tally
                        );

                    const berat =
                        Number(
                            item.berat_netto
                        );


                    if (
                        Number.isFinite(
                            nomorBaru
                        ) &&
                        Number.isFinite(
                            berat
                        )
                    ) {

                        values[
                            nomorBaru
                        ] =
                            berat.toFixed(
                                2
                            );
                    }
                }
            );


            setTallyValues(
                values
            );


            savedTallyRef.current =
                new Set(
                    details.map(
                        item =>
                            Number(
                                item.nomor_tally
                            )
                    )
                );


            savingTallyRef.current =
                new Set();


            const next =
                Number(
                    data.data?.next_tally ||
                    details.length + 1
                );


            setNextTally(
                next
            );


            // Jangan mengecilkan window
            // secara otomatis.
            setTotalBoxes(
                prev =>
                    Math.max(
                        5,
                        prev,
                        Math.ceil(
                            next / 5
                        ) * 5
                    )
            );


            addLog(
                `Tally ${nomor} berhasil dihapus.`
            );


            addLog(
                `Nomor dirapatkan. Tally berikutnya: ${next}.`
            );

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                `Gagal menghapus tally ${nomor}.`
            );


            if (
                err.response?.data?.error
            ) {

                addLog(
                    `Detail backend: ${err.response.data.error}`
                );
            }
        }
    };


    // =========================================================
    // FINISH
    // =========================================================

    const handleFinish = async () => {

        const activeDokumenId =
            dokumenIdRef.current;


        if (!activeDokumenId) {

            alert(
                'Belum ada dokumen timbang aktif.'
            );

            return;
        }


        if (
            !window.confirm(
                'Apakah Anda yakin ingin menyelesaikan sesi ini?'
            )
        ) {

            return;
        }


        try {

            addLog(
                'Menyelesaikan sesi penimbangan...'
            );


            const data =
                await Timbangawal
                    .commitTimbangan({
                        dokumen_timbang_awal_id:
                            activeDokumenId
                    });


            if (
                !data.success
            ) {

                addLog(
                    data.message ||
                    'Gagal menyelesaikan sesi.'
                );

                return;
            }


            disconnectMqtt();


            setStatus(
                'completed'
            );


            setIsFinished(
                true
            );


            setIsConnected(
                false
            );


            setWeightDisplay(
                '0.00'
            );


            setTimeDisplay(
                '-'
            );


            addLog(
                'Sesi penimbangan berhasil diselesaikan.'
            );

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                err.message ||
                'Gagal menyelesaikan sesi.'
            );


            if (
                err.response?.data?.error
            ) {

                addLog(
                    `Detail backend: ${err.response.data.error}`
                );
            }
        }
    };


    // =========================================================
    // PRINT
    // =========================================================

    const handleCetak = () => {

        if (
            !dokumenIdRef.current
        ) {

            alert(
                'ID dokumen timbang tidak ditemukan.'
            );

            return;
        }


        window.open(
            `/posrajang/timbangawal/print/${dokumenIdRef.current}`,
            '_blank'
        );
    };


    // =========================================================
    // CLEANUP
    // =========================================================

    useEffect(() => {

        return () => {

            if (
                mqttClientRef.current
            ) {

                mqttClientRef.current.end(
                    true
                );

                mqttClientRef.current =
                    null;
            }
        };

    }, []);


    // =========================================================
    // SCROLL ACTIVE TALLY
    // =========================================================

    useEffect(() => {

        const row =
            document.getElementById(
                `row-${currentIndex}`
            );


        if (row) {

            row.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        }

    }, [
        currentIndex
    ]);


    // =========================================================
    // RENDER TALLY GRID
    // =========================================================

    const renderSheetGrid = () => {

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
                    "
                >

                    {[0, 1, 2, 3, 4].map(
                        offset => {

                            const nomor =
                                start +
                                offset;


                            const value =
                                tallyValues[
                                    nomor
                                ] ?? '';


                            const isActive =
                                nomor ===
                                currentIndex;


                            const hasValue =
                                value !== '';


                            return (

                                <div
                                    key={nomor}
                                    id={`row-${nomor}`}
                                    className={`
                                        flex items-center
                                        w-full h-10 md:h-11
                                        ${
                                            offset < 4
                                                ? 'border-b border-gray-300'
                                                : ''
                                        }
                                        ${
                                            isActive
                                                ? 'bg-blue-100'
                                                : 'bg-white'
                                        }
                                    `}
                                >

                                    {/* NOMOR */}

                                    <div
                                        className="
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
                                        "
                                    >
                                        {nomor}
                                    </div>


                                    {/* BERAT */}

                                    <div
                                        className="
                                            flex-1
                                            min-w-0
                                            h-full
                                            px-2 sm:px-3
                                            flex items-center
                                        "
                                    >

                                        <input
                                            type="text"
                                            readOnly
                                            value={
                                                value
                                            }
                                            className="
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
                                            "
                                        />

                                    </div>


                                    {/* DELETE */}

                                    <button
                                        type="button"
                                        disabled={
                                            !hasValue
                                        }
                                        onClick={() => {

                                            if (
                                                hasValue
                                            ) {

                                                handleDeleteTally(
                                                    nomor
                                                );
                                            }
                                        }}
                                        className={`
                                            w-9 sm:w-10 md:w-11
                                            h-full
                                            flex-shrink-0
                                            border-l
                                            border-gray-200
                                            font-bold
                                            text-lg
                                            ${
                                                hasValue
                                                    ? `
                                                        text-gray-400
                                                        hover:text-red-600
                                                        hover:bg-red-50
                                                    `
                                                    : `
                                                        text-transparent
                                                        cursor-default
                                                    `
                                            }
                                        `}
                                        title={
                                            hasValue
                                                ? `Hapus tally ${nomor}`
                                                : ''
                                        }
                                    >
                                        ×
                                    </button>

                                </div>
                            );
                        }
                    )}

                </div>
            );
        }


        return groups;
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        <div
            className="
                max-w-6xl
                mx-auto
                w-full
                space-y-4
                p-4 md:p-6
            "
        >

            {/* =================================================
                CARD 1
            ================================================= */}

            <div
                className="
                    bg-white
                    p-4 md:p-6
                    rounded-xl
                    shadow
                "
            >

                <div
                    className="
                        grid
                        grid-cols-1
                        md:grid-cols-2
                        gap-6
                    "
                >

                    {/* INFORMASI */}

                    <div
                        className="
                            space-y-3
                        "
                    >

                        <div
                            className="
                                border-b
                                pb-1
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

                            <Field
                                label="1. No"
                                value={no}
                                onChange={setNo}
                                type="number"
                            />

                            <Field
                                label="2. No. WO"
                                value={noWo}
                                onChange={setNoWo}
                                placeholder="Nomor WO"
                            />

                            <Field
                                label="3. Jenis"
                                value={jenis}
                                onChange={setJenis}
                                placeholder="Jenis"
                            />

                            <Field
                                label="4. S/K"
                                value={sK}
                                onChange={setSK}
                                placeholder="S/K"
                            />

                            <Field
                                label="5. Tara"
                                value={tara}
                                onChange={setTara}
                                type="number"
                                step="0.01"
                            />

                            <Field
                                label="6. Jumlah Bal"
                                value={jumlahBal}
                                onChange={setJumlahBal}
                                type="number"
                            />

                        </div>

                    </div>


                    {/* MQTT */}

                    <div
                        className="
                            bg-blue-50
                            p-4
                            rounded-xl
                            text-center
                            flex flex-col
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
                            {
                                isConnected
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
                                className="
                                    font-bold
                                "
                            >
                                {timeDisplay}
                            </span>

                        </div>


                        <div
                            className="
                                flex gap-2
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    handleConnect
                                }
                                className={`
                                    w-1/2
                                    py-2
                                    text-white
                                    rounded-lg
                                    font-bold
                                    shadow
                                    ${
                                        isConnected
                                            ? 'bg-red-600'
                                            : 'bg-blue-600'
                                    }
                                `}
                            >
                                {
                                    isConnected
                                        ? 'Disconnect'
                                        : 'Connect'
                                }
                            </button>


                            <button
                                type="button"
                                onClick={
                                    handleCariBatch
                                }
                                className="
                                    w-1/2
                                    py-2
                                    bg-amber-500
                                    text-white
                                    rounded-lg
                                    font-bold
                                    shadow
                                "
                            >
                                Cari Dokumen
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
                                    Dokumen ID:
                                    {' '}
                                    {dokumenId}
                                </div>

                                <div>
                                    Status:
                                    {' '}
                                    {status || '-'}
                                </div>

                            </div>

                        )}

                    </div>

                </div>

            </div>


            {/* =================================================
                CARD 2 - TALLY
            ================================================= */}

            <div
                className="
                    bg-white
                    p-3 md:p-4
                    rounded-xl
                    shadow
                    w-full
                    max-w-6xl
                    mx-auto
                    space-y-3
                "
            >

                {/* HEADER CARD 2 */}

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
                                text-[11px]
                                text-gray-500
                            "
                        >
                            Tally aktif:
                            {' '}
                            <span
                                className="
                                    font-bold
                                    text-blue-600
                                "
                            >
                                {currentIndex}
                            </span>
                        </div>


                        {isFinished && (

                            <span
                                className="
                                    text-xs
                                    text-emerald-600
                                    font-semibold
                                "
                            >
                                ✓ Timbang sudah selesai
                            </span>

                        )}

                    </div>


                    <div
                        className="
                            flex gap-2
                        "
                    >

                        {!isFinished && (

                            <button
                                type="button"
                                onClick={
                                    handleFinish
                                }
                                className="
                                    px-4
                                    py-2
                                    bg-emerald-600
                                    text-white
                                    rounded-lg
                                    font-bold
                                    text-xs
                                    shadow
                                "
                            >
                                Selesai
                            </button>

                        )}


                        {isFinished && (

                            <button
                                type="button"
                                onClick={
                                    handleCetak
                                }
                                className="
                                    px-4
                                    py-2
                                    bg-blue-600
                                    text-white
                                    rounded-lg
                                    font-bold
                                    text-xs
                                    shadow
                                "
                            >
                                🖨 Cetak
                            </button>

                        )}

                    </div>

                </div>


                {/* GRID */}

                <div
                    className="
                        flex
                        flex-wrap
                        gap-2 md:gap-3
                        max-h-72
                        overflow-y-auto
                        p-1
                        border
                        rounded-lg
                        bg-gray-50/50
                    "
                >

                    {renderSheetGrid()}

                </div>

            </div>


            {/* =================================================
                CARD 3 - LOG
            ================================================= */}

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
                    h-24
                    overflow-y-auto
                    max-w-6xl
                    mx-auto
                    w-full
                "
            >

                {logs.map(
                    (log, idx) => (

                        <div
                            key={idx}
                        >
                            {log}
                        </div>

                    )
                )}

            </div>

        </div>
    );
}


// =============================================================
// FIELD COMPONENT
// =============================================================

function Field({
    label,
    value,
    onChange,
    type = 'text',
    placeholder = '',
    step
}) {

    return (

        <div>

            <label
                className="
                    block
                    text-gray-500
                    mb-1
                    font-semibold
                "
            >
                {label}
            </label>


            <input
                type={type}
                step={step}
                value={value}
                onChange={e =>
                    onChange(
                        e.target.value
                    )
                }
                placeholder={placeholder}
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
    );
}