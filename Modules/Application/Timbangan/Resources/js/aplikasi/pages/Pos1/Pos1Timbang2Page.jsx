import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

import mqtt from 'mqtt';

import timbang2Service from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/Timbang2Service.js';


// =========================================================
// KONFIGURASI MQTT
// =========================================================

const MQTT_URL =
    'ws://192.168.1.102:9001';

const MQTT_TOPIC =
    '/timbangan/posrajangkrosok/rajang';

const MQTT_OPTIONS = {
    username: 'tes',
    password: 'tes123',
    reconnectPeriod: 2000,
};


// =========================================================
// PAGE
// =========================================================

export default function Pos1Timbang2Page() {

    // =====================================================
    // TARGET / DETAIL
    // =====================================================

    const targetIdRef =
        useRef(null);

    const currentIndexRef =
        useRef(1);

    const targetListRef =
        useRef([]);

    const [targetList, setTargetList] =
        useState([]);

    const [selectedTargetId, setSelectedTargetId] =
        useState('');

    const [selectedDetailId, setSelectedDetailId] =
        useState('');


    // =====================================================
    // REQUEST / MQTT REF
    // =====================================================

    const logBoxRef =
        useRef(null);

    const isFetchingRef =
        useRef(false);

    const mqttClientRef =
        useRef(null);


    // =====================================================
    // CONNECTION / LIVE WEIGHT
    // =====================================================

    const [isConnected, setIsConnected] =
        useState(false);

    const [weightDisplay, setWeightDisplay] =
        useState('0.00');

    const [timeDisplay, setTimeDisplay] =
        useState('-');


    // =====================================================
    // LOG
    // =====================================================

    const [logs, setLogs] =
        useState([
            '[Sistem] Menunggu data dari Pos 1 Timbang 2...',
        ]);


    // =====================================================
    // GRID KARUNG
    // =====================================================

    const [currentIndex, setCurrentIndex] =
        useState(1);

    const [totalBoxes, setTotalBoxes] =
        useState(5);

    const [packValues, setPackValues] =
        useState({});

    const [timbang1Data, setTimbang1Data] =
        useState([]);

    const [isFinished, setIsFinished] =
        useState(false);


    // =====================================================
    // SYNC TARGET REF
    // =====================================================

    useEffect(() => {

        targetListRef.current =
            targetList;

    }, [targetList]);


    // =====================================================
    // LOG
    // =====================================================

    const addLog =
        useCallback((text) => {

            const time =
                new Date().toLocaleTimeString(
                    'id-ID',
                    {
                        hour12: false,
                    }
                );

            setLogs((prev) => [
                ...prev,
                `[${time}] ${text}`,
            ]);

        }, []);


    // =====================================================
    // SET NOMOR KARUNG BERIKUTNYA
    // =====================================================

    const setNextPack =
        useCallback((next) => {

            const value =
                Number(next) || 1;

            currentIndexRef.current =
                value;

            setCurrentIndex(
                value
            );

        }, []);


    // =====================================================
    // AUTO SCROLL LOG
    // =====================================================

    useEffect(() => {

        if (logBoxRef.current) {

            logBoxRef.current.scrollTop =
                logBoxRef.current.scrollHeight;

        }

    }, [logs]);


    // =====================================================
    // GET TARGET TIMBANG 1
    // =====================================================

    const fetchTargetTimbang1 =
        useCallback(async () => {

            try {

                const res =
                    await timbang2Service
                        .getTargetTimbang1();

                if (
                    res?.success
                ) {

                    const data =
                        res.data || [];

                    setTargetList(
                        data
                    );

                    targetListRef.current =
                        data;

                    addLog(
                        `${data.length} kelompok detail Timbang 1 ditemukan.`
                    );

                }

            } catch (err) {

                console.error(
                    'Gagal mengambil kelompok detail Timbang 1:',
                    err
                );

                addLog(
                    'Gagal mengambil daftar kelompok detail Timbang 1.'
                );

            }

        }, [addLog]);


    // =====================================================
    // LOAD TARGET SAAT MOUNT
    // =====================================================

    useEffect(() => {

        fetchTargetTimbang1();

    }, [fetchTargetTimbang1]);


    // =====================================================
    // RESET GRID
    // =====================================================

    const resetGrid =
        useCallback(() => {

            setPackValues({});

            setTimbang1Data([]);

            setNextPack(1);

            setTotalBoxes(5);

            setWeightDisplay(
                '0.00'
            );

            setTimeDisplay(
                '-'
            );

            setIsFinished(
                false
            );

        }, [setNextPack]);


    // =====================================================
    // GET LIVE DATA
    // DIDEKLARASIKAN SEBELUM FUNGSI YANG MEMANGGILNYA
    // =====================================================

    const ambilLiveData =
        useCallback(
            async (
                targetId =
                    targetIdRef.current,
                detailId =
                    selectedDetailId
            ) => {

                if (
                    !targetId ||
                    !detailId ||
                    isFetchingRef.current
                ) {

                    return;

                }

                try {

                    isFetchingRef.current =
                        true;

                    const res =
                        await timbang2Service
                            .getLiveData(
                                targetId,
                                detailId
                            );

                    const payload =
                        res?.data ?? {};


                    // -----------------------------------------
                    // MAPPING CACHE
                    // -----------------------------------------

                    const values =
                        {};

                    const cacheData =
                        Array.isArray(
                            payload.cache_data
                        )
                            ? payload.cache_data
                            : [];


                    cacheData.forEach(
                        (item) => {

                            const nomorKarung =
                                Number(
                                    item.nomor_karung
                                );

                            const berat =
                                Number(
                                    item.berat_kotor
                                );

                            if (
                                Number.isFinite(
                                    nomorKarung
                                ) &&
                                Number.isFinite(
                                    berat
                                )
                            ) {

                                values[
                                    nomorKarung
                                ] =
                                    berat.toFixed(2);

                            }

                        }
                    );


                    // -----------------------------------------
                    // UPDATE GRID
                    // -----------------------------------------

                    setPackValues(
                        values
                    );


                    // -----------------------------------------
                    // ACTIVE CACHE
                    // -----------------------------------------

                    if (
                        payload.active_cache
                    ) {

                        setWeightDisplay(
                            Number(
                                payload
                                    .active_cache
                                    .berat_kotor
                            ).toFixed(2)
                        );

                        setTimeDisplay(
                            new Date(
                                payload
                                    .active_cache
                                    .updated_at
                            ).toLocaleTimeString(
                                'id-ID',
                                {
                                    hour12: false,
                                }
                            )
                        );

                    }


                    // -----------------------------------------
                    // NEXT KARUNG
                    // -----------------------------------------

                    const nextNomor =
                        Number(
                            payload
                                .next_nomor_karung ??
                            1
                        );

                    setNextPack(
                        nextNomor
                    );


                    setTotalBoxes(
                        Math.max(
                            5,
                            Math.ceil(
                                nextNomor / 5
                            ) * 5
                        )
                    );

                } catch (err) {

                    console.error(
                        'Gagal sinkronisasi live data:',
                        err
                    );

                    addLog(
                        'Gagal menyinkronkan data timbang karung.'
                    );

                } finally {

                    isFetchingRef.current =
                        false;

                }

            },
            [
                selectedDetailId,
                addLog,
                setNextPack,
            ]
        );


    // =====================================================
    // GET DATA TIMBANG 1
    // =====================================================

    const ambilDataTimbang1 =
        useCallback(
            async (
                targetId,
                detailId
            ) => {

                if (
                    !targetId ||
                    !detailId
                ) {

                    setTimbang1Data([]);

                    return;

                }

                try {

                    const res =
                        await timbang2Service
                            .getTimbang1(
                                targetId,
                                detailId
                            );

                    const data =
                        Array.isArray(
                            res?.data
                        )
                            ? res.data
                            : [];

                    setTimbang1Data(
                        data
                    );

                    addLog(
                        `${data.length} data Timbang 1 ditemukan.`
                    );

                } catch (err) {

                    console.error(
                        'Gagal mengambil data Timbang 1:',
                        err
                    );

                    setTimbang1Data([]);

                    addLog(
                        'Gagal mengambil data Timbang 1.'
                    );

                }

            },
            [addLog]
        );


    // =====================================================
    // PILIH DETAIL TIMBANG 1
    // =====================================================

    const handleSelectTarget =
        async (detailId) => {

            if (isConnected) {

                return;

            }

            const selectedItem =
                targetListRef.current.find(
                    (item) =>
                        String(item.detail_id) ===
                        String(detailId)
                );

            if (!selectedItem) {

                setSelectedTargetId('');

                setSelectedDetailId('');

                targetIdRef.current =
                    null;

                resetGrid();

                return;

            }

            const newTargetId =
                selectedItem.target_id;


            setSelectedTargetId(
                newTargetId
            );

            setSelectedDetailId(
                selectedItem.detail_id
            );

            targetIdRef.current =
                newTargetId;

            resetGrid();


            await ambilDataTimbang1(
                newTargetId,
                selectedItem.detail_id
            );

            await ambilLiveData(
                newTargetId,
                selectedItem.detail_id
            );


            addLog(
                `Dipilih ${selectedItem.jenis_tbk} | ${selectedItem.tahun} | ${selectedItem.grade} | ${selectedItem.s_k}.`
            );

        };


    // =====================================================
    // MQTT DISCONNECT
    // =====================================================

    const disconnectMqtt =
        useCallback(() => {

            if (
                mqttClientRef.current
            ) {

                mqttClientRef.current
                    .removeAllListeners();

                mqttClientRef.current
                    .end(true);

                mqttClientRef.current =
                    null;

            }

            setIsConnected(
                false
            );

        }, []);


    // =====================================================
    // MQTT CONNECT
    // =====================================================

    const connectMqtt =
        useCallback(() => {

            if (
                mqttClientRef.current
            ) {

                return;

            }

            addLog(
                'Menghubungkan ke MQTT broker...'
            );

            const client =
                mqtt.connect(
                    MQTT_URL,
                    MQTT_OPTIONS
                );


            client.on(
                'connect',
                () => {

                    setIsConnected(
                        true
                    );

                    addLog(
                        'Terhubung ke MQTT broker.'
                    );

                    client.subscribe(
                        MQTT_TOPIC,
                        (err) => {

                            if (err) {

                                addLog(
                                    `Gagal subscribe topic ${MQTT_TOPIC}.`
                                );

                                return;

                            }

                            addLog(
                                `Subscribe topic ${MQTT_TOPIC} berhasil.`
                            );

                        }
                    );

                }
            );


            client.on(
                'message',
                (
                    topic,
                    payload
                ) => {

                    if (
                        topic !==
                        MQTT_TOPIC
                    ) {

                        return;

                    }

                    const raw =
                        payload
                            .toString()
                            .trim();

                    if (!raw) {

                        return;

                    }

                    let weight =
                        null;


                    try {

                        const parsed =
                            JSON.parse(
                                raw
                            );

                        if (
                            typeof parsed ===
                            'number'
                        ) {

                            weight =
                                parsed;

                        } else if (
                            parsed &&
                            typeof parsed ===
                            'object'
                        ) {

                            weight =
                                parsed.weight ??
                                parsed.berat ??
                                parsed.berat_kotor ??
                                parsed.value;

                        }

                    } catch {

                        weight =
                            Number(
                                raw.replace(
                                    ',',
                                    '.'
                                )
                            );

                    }


                    if (
                        !Number.isFinite(
                            Number(weight)
                        )
                    ) {

                        return;

                    }


                    setWeightDisplay(
                        Number(weight).toFixed(2)
                    );

                    setTimeDisplay(
                        new Date()
                            .toLocaleTimeString(
                                'id-ID',
                                {
                                    hour12: false,
                                }
                            )
                    );

                }
            );


            client.on(
                'error',
                (err) => {

                    addLog(
                        `MQTT error: ${
                            err?.message ||
                            err
                        }`
                    );

                }
            );


            client.on(
                'close',
                () => {

                    setIsConnected(
                        false
                    );

                }
            );


            client.on(
                'offline',
                () => {

                    setIsConnected(
                        false
                    );

                }
            );


            mqttClientRef.current =
                client;

        }, [addLog]);


    // =====================================================
    // DISCONNECT TIMBANGAN
    // =====================================================

    const disconnectTimbangan =
        useCallback(() => {

            disconnectMqtt();

            addLog(
                'Pemantauan data timbang dihentikan.'
            );

        }, [
            disconnectMqtt,
            addLog,
        ]);


    // =====================================================
    // CONNECT / STOP
    // =====================================================

    const handleConnect =
        async () => {

            if (isConnected) {

                disconnectTimbangan();

                return;

            }


            if (!selectedTargetId) {

                alert(
                    'Pilih Detail Timbang 1 terlebih dahulu!'
                );

                return;

            }


            if (!selectedDetailId) {

                alert(
                    'Detail Timbangan belum tersedia.'
                );

                return;

            }


            targetIdRef.current =
                selectedTargetId;


            await ambilLiveData(
                selectedTargetId,
                selectedDetailId
            );


            connectMqtt();


            addLog(
                'Memulai pemantauan live data Pos 1 Timbang 2 (MQTT)...'
            );

        };


    // =====================================================
    // SIMPAN KARUNG
    // =====================================================

    const handleSavePack =
        async (
            nomor,
            berat
        ) => {

            const activeTargetId =
                targetIdRef.current;


            if (
                !activeTargetId ||
                !selectedDetailId
            ) {

                return;

            }


            if (
                !berat ||
                Number(berat) <= 0
            ) {

                alert(
                    `Nilai karung nomor ${nomor} tidak valid!`
                );

                return;

            }


            try {

                addLog(
                    `Mengonfirmasi karung nomor ${nomor} (${berat} KG)...`
                );


                const res =
                    await timbang2Service
                        .storeStream({

                            target_id:
                                activeTargetId,

                            target_aturan_detail_id:
                                selectedDetailId,

                            nomor_karung:
                                nomor,

                            berat_kotor:
                                berat,

                        });


                if (
                    res?.success
                ) {

                    addLog(
                        `Karung No. ${nomor} berhasil dikonfirmasi.`
                    );

                    await ambilLiveData(
                        activeTargetId,
                        selectedDetailId
                    );

                }

            } catch (err) {

                console.error(
                    'Gagal menyimpan karung:',
                    err
                );

                addLog(
                    err.response?.data?.message ||
                    `Gagal menyimpan data karung ${nomor}.`
                );

            }

        };


    // =====================================================
    // HAPUS KARUNG DARI CACHE
    // =====================================================

    const handleDeletePack =
        async (
            nomor
        ) => {

            const activeTargetId =
                targetIdRef.current;


            if (
                !activeTargetId ||
                !selectedDetailId
            ) {

                return;

            }


            if (
                !window.confirm(
                    `Hapus data karung nomor ${nomor} dari staging?`
                )
            ) {

                return;

            }


            try {

                const res =
                    await timbang2Service
                        .getLiveData(
                            activeTargetId,
                            selectedDetailId
                        );


                const cacheItems =
                    res?.data?.cache_data ||
                    [];


                const targetCache =
                    cacheItems.find(
                        (item) =>
                            Number(
                                item.nomor_karung
                            ) ===
                            Number(nomor)
                    );


                if (!targetCache) {

                    addLog(
                        `Karung ${nomor} tidak ditemukan di staging.`
                    );

                    return;

                }


                const delRes =
                    await timbang2Service
                        .deleteCache(
                            targetCache.id
                        );


                if (
                    delRes?.success
                ) {

                    addLog(
                        `Karung No. ${nomor} berhasil dihapus dari staging.`
                    );

                    await ambilLiveData(
                        activeTargetId,
                        selectedDetailId
                    );

                }

            } catch (err) {

                console.error(
                    'Gagal menghapus karung:',
                    err
                );

                addLog(
                    `Gagal menghapus karung ${nomor}.`
                );

            }

        };


    // =====================================================
    // RESET UI
    // =====================================================

    const resetUI =
        useCallback(() => {

            disconnectTimbangan();

            targetIdRef.current =
                null;

            setSelectedTargetId(
                ''
            );

            setSelectedDetailId(
                ''
            );

            setPackValues(
                {}
            );

            setTimbang1Data(
                []
            );

            setWeightDisplay(
                '0.00'
            );

            setTimeDisplay(
                '-'
            );

            setNextPack(
                1
            );

            setTotalBoxes(
                5
            );

            setIsFinished(
                false
            );

        }, [
            disconnectTimbangan,
            setNextPack,
        ]);


    // =====================================================
    // BATAL / RESET
    // =====================================================

    const handleCancel =
        async () => {

            const activeTargetId =
                targetIdRef.current;


            if (!activeTargetId) {

                resetUI();

                return;

            }


            const confirmCancel =
                window.confirm(
                    'Apakah Anda yakin ingin membatalkan? Seluruh data staging/cache untuk target ini akan dihapus!'
                );


            if (!confirmCancel) {

                return;

            }


            try {

                addLog(
                    `Membersihkan cache server untuk Target ID: ${activeTargetId}...`
                );


                await timbang2Service
                    .clearCacheByTarget(
                        activeTargetId
                    );


                addLog(
                    'Cache server berhasil dibersihkan.'
                );


                resetUI();

                await fetchTargetTimbang1();

            } catch (err) {

                console.error(
                    'Error clear cache:',
                    err
                );

                addLog(
                    `Gagal menghapus cache di server: ${
                        err.response?.data?.message ||
                        err.message
                    }`
                );

            }

        };


    // =====================================================
    // SELESAIKAN ITEM
    // =====================================================

    const handleFinish =
        async () => {

            const activeTargetId =
                targetIdRef.current;


            if (!activeTargetId) {

                alert(
                    'Belum ada Target Kerja yang dipilih.'
                );

                return;

            }


            if (!selectedDetailId) {

                alert(
                    'Belum ada Detail Timbangan yang tersedia.'
                );

                return;

            }


            const currentValues =
                Object.keys(
                    packValues
                );


            if (
                currentValues.length === 0
            ) {

                alert(
                    'Belum ada data timbang karung.'
                );

                return;

            }


            const selectedDetail =
                targetListRef.current.find(
                    (item) =>
                        String(item.detail_id) ===
                        String(selectedDetailId)
                );


            if (!selectedDetail) {

                alert(
                    'Detail Timbangan tidak ditemukan.'
                );

                return;

            }


            if (
                !window.confirm(
                    `Selesaikan penimbangan karung ${
                        selectedDetail.jenis_tbk ||
                        '-'
                    }?`
                )
            ) {

                return;

            }


            try {

                addLog(
                    'Menyimpan data timbang karung secara permanen...'
                );


                const response =
                    await timbang2Service
                        .commitFinal(
                            activeTargetId,
                            selectedDetailId
                        );


                if (
                    !response?.success
                ) {

                    return;

                }


                disconnectTimbangan();


                addLog(
                    response.message ||
                    'Data timbang karung berhasil disimpan permanen.'
                );


                setIsFinished(
                    true
                );

            } catch (err) {

                console.error(
                    'Gagal menyelesaikan timbang karung:',
                    err
                );

                addLog(
                    err.response?.data?.message ||
                    'Gagal menyimpan data timbang karung permanen.'
                );

            }

        };


    // =====================================================
    // CLEANUP MQTT
    // =====================================================

    useEffect(() => {

        return () => {

            disconnectMqtt();

        };

    }, [disconnectMqtt]);


    // =====================================================
    // SCROLL ROW AKTIF
    // =====================================================

    useEffect(() => {

        const row =
            document.getElementById(
                `row-${currentIndex}`
            );


        if (row) {

            row.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });

        }

    }, [currentIndex]);


    // =====================================================
    // RENDER GRID KARUNG
    // =====================================================

    const renderSheetGrid =
        () => {

            const groups =
                [];


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
                        className="flex w-full flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-sm sm:w-[calc(50%-0.25rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.6rem)] xl:w-[calc(20%-0.65rem)]"
                    >

                        {[
                            0,
                            1,
                            2,
                            3,
                            4,
                        ].map(
                            (offset) => {

                                const nomor =
                                    start +
                                    offset;


                                const isSavedInCache =
                                    packValues[
                                        nomor
                                    ] !== undefined &&
                                    packValues[
                                        nomor
                                    ] !== '';


                                const isActive =
                                    nomor ===
                                    currentIndex;


                                const value =
                                    isActive &&
                                    isConnected
                                        ? weightDisplay
                                        : (
                                            packValues[
                                                nomor
                                            ] ??
                                            ''
                                        );


                                const canSave =
                                    (
                                        isActive ||
                                        isSavedInCache
                                    ) &&
                                    Number(value) >
                                    0;


                                return (

                                    <div
                                        key={nomor}
                                        id={`row-${nomor}`}
                                        className={`flex h-10 w-full items-center md:h-11 ${
                                            offset < 4
                                                ? 'border-b border-gray-300'
                                                : ''
                                        } ${
                                            isActive
                                                ? 'z-10 bg-blue-100/80 ring-2 ring-inset ring-blue-500'
                                                : 'bg-white'
                                        }`}
                                    >

                                        <div
                                            className={`flex h-full w-9 flex-shrink-0 items-center justify-center border-r border-gray-300 text-xs font-bold sm:w-10 md:w-11 md:text-sm ${
                                                isActive
                                                    ? 'bg-blue-200 text-blue-800'
                                                    : 'bg-gray-50 text-gray-600'
                                            }`}
                                        >
                                            {nomor}
                                        </div>


                                        <div className="flex h-full min-w-0 flex-1 items-center px-2">

                                            <input
                                                type="text"
                                                readOnly
                                                value={
                                                    value
                                                }
                                                className="h-full w-full border-none bg-transparent text-right text-sm font-bold text-blue-700 outline-none md:text-base"
                                            />

                                        </div>


                                        <div className="flex h-full flex-shrink-0 border-l border-gray-200">

                                            <button
                                                type="button"
                                                disabled={
                                                    !isSavedInCache ||
                                                    isFinished
                                                }
                                                onClick={() =>
                                                    isSavedInCache &&
                                                    handleDeletePack(
                                                        nomor
                                                    )
                                                }
                                                className={`flex h-full w-7 items-center justify-center border-r border-gray-200 text-sm font-bold transition-colors sm:w-8 ${
                                                    isSavedInCache &&
                                                    !isFinished
                                                        ? 'text-red-600 hover:bg-red-100 hover:text-red-800 active:bg-red-200'
                                                        : 'cursor-not-allowed text-gray-300'
                                                }`}
                                                title={
                                                    isSavedInCache
                                                        ? `Hapus karung ${nomor}`
                                                        : ''
                                                }
                                            >
                                                ✕
                                            </button>


                                            <button
                                                type="button"
                                                disabled={
                                                    !canSave ||
                                                    isFinished
                                                }
                                                onClick={() =>
                                                    canSave &&
                                                    handleSavePack(
                                                        nomor,
                                                        value
                                                    )
                                                }
                                                className={`flex h-full w-7 items-center justify-center text-sm font-bold transition-colors sm:w-8 ${
                                                    canSave &&
                                                    !isFinished
                                                        ? 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 active:bg-emerald-200'
                                                        : 'cursor-not-allowed text-gray-300'
                                                }`}
                                                title={
                                                    canSave
                                                        ? `Simpan karung ${nomor}`
                                                        : ''
                                                }
                                            >
                                                ✓
                                            </button>

                                        </div>

                                    </div>

                                );

                            }
                        )}

                    </div>

                );

            }


            return groups;

        };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="mx-auto w-full max-w-6xl space-y-4 p-4 md:p-6">

            {/* =================================================
                CARD 1
            ================================================= */}

            <div className="rounded-xl bg-white p-4 shadow md:p-6">

                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

                    <div className="space-y-3">

                        <div className="border-b pb-1">

                            <h3 className="text-sm font-bold text-gray-700">
                                POS 1 - RAJANG / TIMBANG 2
                            </h3>

                        </div>


                        <div>

                            <label className="mb-1 block text-xs font-semibold text-gray-500">
                                Pilih Detail Timbang 1
                            </label>


                            <select
                                value={
                                    selectedDetailId
                                }
                                onChange={(e) =>
                                    handleSelectTarget(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    isConnected ||
                                    isFinished
                                }
                                className="w-full rounded-lg border bg-gray-50 p-2 text-xs font-medium outline-none focus:border-blue-500 disabled:opacity-60"
                            >

                                <option value="">
                                    -- Pilih Detail Timbang 1 --
                                </option>


                                {targetList.map(
                                    (item) => (

                                        <option
                                            key={item.detail_id}
                                            value={item.detail_id}
                                        >
                                            {`${item.jenis_tbk || '-'} | ${
                                                item.tahun || '-'
                                            } | ${
                                                item.grade || '-'
                                            } | ${
                                                item.s_k || '-'
                                            }`}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    <div className="flex flex-col justify-between rounded-xl border border-blue-200 bg-blue-50 p-4 text-center">

                        <div
                            className={`text-xs font-bold uppercase ${
                                isConnected
                                    ? 'text-green-600'
                                    : 'text-gray-400'
                            }`}
                        >
                            {isConnected
                                ? 'ONLINE'
                                : 'OFFLINE'}
                        </div>


                        <div className="my-2 text-5xl font-extrabold text-blue-600 md:text-6xl">

                            {weightDisplay}

                            <span className="text-xl font-bold">
                                {' '}KG
                            </span>

                        </div>


                        <div className="mb-3 text-xs text-gray-500">

                            Waktu Stream:

                            <span className="font-bold">
                                {' '}
                                {timeDisplay}
                            </span>

                        </div>


                        <div className="flex gap-2">

                            <button
                                type="button"
                                onClick={
                                    handleConnect
                                }
                                disabled={
                                    isFinished
                                }
                                className={`w-full rounded-lg py-2 text-xs font-bold text-white shadow transition-colors ${
                                    isConnected
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } ${
                                    isFinished
                                        ? 'cursor-not-allowed opacity-50'
                                        : ''
                                }`}
                            >
                                {isConnected
                                    ? 'Stop Pantau'
                                    : 'Mulai Pantau'}
                            </button>

                        </div>

                    </div>

                </div>

            </div>


            {/* =================================================
                CARD 2
            ================================================= */}

            <div className="mx-auto w-full max-w-6xl space-y-3 rounded-xl bg-white p-3 shadow md:p-4">

                <div className="flex items-center justify-between gap-2">

                    <div>

                        <h2 className="text-base font-bold text-gray-700">
                            Lembar Karung (Pos 1)
                        </h2>


                        <div className="text-[11px] text-gray-500">

                            Karung aktif berikutnya:

                            <span className="font-bold text-blue-600">
                                {' '}
                                {currentIndex}
                            </span>

                        </div>


                        {isFinished && (

                            <span className="text-xs font-semibold text-emerald-600">
                                ✓ Penimbangan Selesai &amp; Committed
                            </span>

                        )}

                    </div>


                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={
                                handleCancel
                            }
                            className="rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs font-bold text-gray-700 transition-colors hover:bg-gray-200"
                        >
                            Batal / Reset
                        </button>


                        {!isFinished && (

                            <button
                                type="button"
                                onClick={
                                    handleFinish
                                }
                                disabled={
                                    !selectedDetailId ||
                                    !Object.keys(
                                        packValues
                                    ).length
                                }
                                className={`rounded-lg px-4 py-2 text-xs font-bold shadow transition-colors ${
                                    selectedDetailId &&
                                    Object.keys(
                                        packValues
                                    ).length
                                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                        : 'cursor-not-allowed bg-gray-200 text-gray-400'
                                }`}
                            >
                                Selesaikan Item
                            </button>

                        )}

                    </div>

                </div>


                {/* =================================================
                    DATA TIMBANG 1
                ================================================= */}

                {timbang1Data.length > 0 && (

                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3">

                        <div className="mb-2 text-xs font-bold text-blue-800">
                            DATA TIMBANG 1
                        </div>


                        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">

                            {timbang1Data.map(
                                (item) => (

                                    <div
                                        key={item.id}
                                        className="rounded-lg border border-blue-200 bg-white px-3 py-2"
                                    >

                                        <div className="text-[10px] font-semibold text-gray-500">
                                            Bal {item.nomor_bal}
                                        </div>

                                        <div className="text-sm font-bold text-blue-700">
                                            {Number(
                                                item.berat_kotor
                                            ).toFixed(2)} KG
                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </div>

                )}


                {/* =================================================
                    GRID TIMBANG 2
                ================================================= */}

                <div className="flex max-h-72 flex-wrap gap-2 overflow-y-auto rounded-lg border bg-gray-50/50 p-1 md:gap-3">

                    {renderSheetGrid()}

                </div>

            </div>


            {/* =================================================
                CARD 3 - LOG
            ================================================= */}

            <div
                ref={logBoxRef}
                className="mx-auto h-24 w-full max-w-6xl overflow-y-auto rounded-xl bg-slate-900 p-3 font-mono text-xs text-green-400 shadow"
            >

                {logs.map(
                    (
                        log,
                        idx
                    ) => (

                        <div key={idx}>
                            {log}
                        </div>

                    )
                )}

            </div>

        </div>

    );

}
