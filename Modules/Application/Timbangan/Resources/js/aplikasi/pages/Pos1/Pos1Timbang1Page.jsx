import React, {
    useEffect,
    useRef,
    useState,
    useCallback,
} from 'react';

import mqtt from 'mqtt';

import {
    getTargetAktif,
    getLiveData,
    deleteCache,
    commitFinal,
    clearCacheByTarget,
    storeStream,
    updateTargetStatus,
} from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/Pos1Timbang1Service.js';

import targetService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/targetService.js';


// =========================================================
// KONFIGURASI MQTT
// =========================================================

const MQTT_URL = 'ws://192.168.1.102:9001';

const MQTT_TOPIC =
    '/timbangan/posrajangkrosok/penerimaan';

const MQTT_OPTIONS = {
    username: 'tes',
    password: 'tes123',
    reconnectPeriod: 2000,
};


// =========================================================
// PAGE
// =========================================================

export default function Pos1Timbang1Page() {

    // =====================================================
    // TARGET / DETAIL
    // =====================================================

    const targetIdRef = useRef(null);
    const currentIndexRef = useRef(1);
    const targetListRef = useRef([]);

    const [targetList, setTargetList] = useState([]);
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [detailList, setDetailList] = useState([]);
    const [selectedDetailId, setSelectedDetailId] = useState('');


    // =====================================================
    // REQUEST / MQTT REF
    // =====================================================

    const logBoxRef = useRef(null);
    const isFetchingRef = useRef(false);
    const mqttClientRef = useRef(null);


    // =====================================================
    // CONNECTION / LIVE WEIGHT
    // =====================================================

    const [isConnected, setIsConnected] = useState(false);
    const [weightDisplay, setWeightDisplay] = useState('0.00');
    const [timeDisplay, setTimeDisplay] = useState('-');


    // =====================================================
    // LOG
    // =====================================================

    const [logs, setLogs] = useState([
        '[Sistem] Menunggu data dari Pos 1 Timbang 1...',
    ]);


    // =====================================================
    // GRID BAL
    // =====================================================

    const [currentIndex, setCurrentIndex] = useState(1);
    const [totalBoxes, setTotalBoxes] = useState(5);
    const [packValues, setPackValues] = useState({});
    const [isFinished, setIsFinished] = useState(false);

    // Jumlah bal sudah memenuhi target
    const [isTargetFull, setIsTargetFull] = useState(false);


    // =====================================================
    // SYNC TARGET REF
    // =====================================================

    useEffect(() => {

        targetListRef.current = targetList;

    }, [targetList]);


    // =====================================================
    // LOG
    // =====================================================

    const addLog = useCallback((text) => {

        const time = new Date().toLocaleTimeString(
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
    // SET NOMOR BAL BERIKUTNYA
    // =====================================================

    const setNextPack = useCallback((next) => {

        const value = Number(next) || 1;

        currentIndexRef.current = value;

        setCurrentIndex(value);

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
    // GET TARGET AKTIF
    // =====================================================

    const fetchTargetAktif = useCallback(async () => {

        try {

            const res = await getTargetAktif();

            if (res.data?.success) {

                const data =
                    res.data.data || [];

                setTargetList(data);

                targetListRef.current = data;

            }

        } catch (err) {

            console.error(
                'Gagal mengambil target aktif:',
                err
            );

            addLog(
                'Gagal mengambil daftar target aktif.'
            );

        }

    }, [addLog]);


    // =====================================================
    // LOAD TARGET SAAT MOUNT
    // =====================================================

    useEffect(() => {

        fetchTargetAktif();

    }, [fetchTargetAktif]);


    // =====================================================
    // RESET GRID
    // =====================================================

    const resetGrid = useCallback(() => {

        setPackValues({});

        setNextPack(1);

        setTotalBoxes(5);

        setWeightDisplay('0.00');

        setTimeDisplay('-');

        setIsFinished(false);

        setIsTargetFull(false);

    }, [setNextPack]);


    // =====================================================
    // PILIH TARGET
    // =====================================================

    const handleSelectTarget = async (newTargetId) => {

        if (isConnected) {

            return;

        }

        setSelectedTargetId(newTargetId);

        setSelectedDetailId('');

        setDetailList([]);

        targetIdRef.current =
            newTargetId || null;

        resetGrid();

        if (!newTargetId) {

            return;

        }

        try {

            const res =
                await targetService.getById(
                    newTargetId
                );

            const aturan =
                res.data?.data?.aturan ?? [];

            const details =
                aturan.flatMap(
                    (item) =>
                        (item.detail ?? []).filter(
                            (detail) =>
                                detail.status !== 'finish'
                        )
                );

            setDetailList(details);

            addLog(
                `${details.length} detail ditemukan pada target.`
            );

        } catch (err) {

            console.error(
                'Gagal mengambil detail target:',
                err
            );

            addLog(
                'Gagal mengambil detail target.'
            );

        }

    };


    // =====================================================
    // PILIH DETAIL
    // =====================================================

    const handleSelectDetail = async (detailId) => {

        if (isConnected) {

            return;

        }

        setSelectedDetailId(detailId);

        resetGrid();

        if (
            !detailId ||
            !selectedTargetId
        ) {

            return;

        }

        try {

            targetIdRef.current =
                selectedTargetId;

            await ambilLiveData(
                selectedTargetId,
                detailId
            );

        } catch (err) {

            console.error(
                'Gagal memuat data detail:',
                err
            );

            addLog(
                'Gagal memuat data penimbangan item.'
            );

        }

    };


    // =====================================================
    // MQTT DISCONNECT
    // =====================================================

    const disconnectMqtt = useCallback(() => {

        if (mqttClientRef.current) {

            mqttClientRef.current.removeAllListeners();

            mqttClientRef.current.end(true);

            mqttClientRef.current = null;

        }

        setIsConnected(false);

    }, []);


    // =====================================================
    // MQTT CONNECT
    // =====================================================

    const connectMqtt = useCallback(() => {

        if (mqttClientRef.current) {

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


        // -------------------------------------------------
        // CONNECT
        // -------------------------------------------------

        client.on('connect', () => {

            setIsConnected(true);

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

        });


        // -------------------------------------------------
        // MESSAGE
        // -------------------------------------------------

        client.on(
            'message',
            (topic, payload) => {

                if (topic !== MQTT_TOPIC) {

                    return;

                }

                const raw =
                    payload
                        .toString()
                        .trim();

                const weight =
                    Number(raw);

                if (!Number.isFinite(weight)) {

                    return;

                }

                setWeightDisplay(
                    weight.toFixed(2)
                );

                setTimeDisplay(
                    new Date().toLocaleTimeString(
                        'id-ID',
                        {
                            hour12: false,
                        }
                    )
                );

            }
        );


        // -------------------------------------------------
        // ERROR
        // -------------------------------------------------

        client.on('error', (err) => {

            addLog(
                `MQTT error: ${err?.message || err}`
            );

        });


        // -------------------------------------------------
        // CLOSE
        // -------------------------------------------------

        client.on('close', () => {

            setIsConnected(false);

        });


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
    // GET LIVE DATA
    // =====================================================

    const ambilLiveData = useCallback(
        async (
            targetId = targetIdRef.current,
            detailId = selectedDetailId
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
                    await getLiveData(
                        targetId,
                        detailId
                    );

                if (!res.data?.success) {

                    return;

                }

                const {
                    cache_data = [],
                    active_cache,
                    next_nomor_bal,
                } = res.data;


                // -----------------------------------------
                // MAPPING CACHE
                // -----------------------------------------

                const values = {};

                cache_data.forEach(
                    (item) => {

                        const noBal =
                            Number(
                                item.nomor_bal
                            );

                        const berat =
                            Number(
                                item.berat_kotor
                            );

                        if (
                            Number.isFinite(noBal) &&
                            Number.isFinite(berat)
                        ) {

                            values[noBal] =
                                berat.toFixed(2);

                        }

                    }
                );


                // -----------------------------------------
                // TARGET BAL DETAIL
                // -----------------------------------------

                const selectedDetail =
                    detailList.find(
                        (item) =>
                            String(item.id) ===
                            String(detailId)
                    );

                const targetBal =
                    Number(
                        selectedDetail?.jumlah_bal
                    ) || 0;

                const totalTerisi =
                    Object.keys(values).length;

                const targetFull =
                    targetBal > 0 &&
                    totalTerisi >= targetBal;

                setIsTargetFull(
                    targetFull
                );

                if (targetFull) {

                    addLog(
                        `Jumlah bal sudah terpenuhi (${targetBal} bal).`
                    );

                }


                // -----------------------------------------
                // UPDATE GRID
                // -----------------------------------------

                setPackValues(values);


                // -----------------------------------------
                // ACTIVE CACHE
                // -----------------------------------------

                if (active_cache) {

                    setWeightDisplay(
                        Number(
                            active_cache.berat_kotor
                        ).toFixed(2)
                    );

                    setTimeDisplay(
                        new Date(
                            active_cache.updated_at
                        ).toLocaleTimeString(
                            'id-ID',
                            {
                                hour12: false,
                            }
                        )
                    );

                }


                // -----------------------------------------
                // NEXT BAL
                // -----------------------------------------

                if (next_nomor_bal) {

                    setNextPack(
                        next_nomor_bal
                    );

                    setTotalBoxes(
                        Math.max(
                            5,
                            Math.ceil(
                                next_nomor_bal / 5
                            ) * 5
                        )
                    );

                }

            } catch (err) {

                console.error(
                    'Gagal sinkronisasi live data:',
                    err
                );

                addLog(
                    'Gagal menyinkronkan data timbang.'
                );

            } finally {

                isFetchingRef.current =
                    false;

            }

        },
        [
            selectedDetailId,
            detailList,
            addLog,
            setNextPack,
        ]
    );


    // =====================================================
    // CONNECT / STOP
    // =====================================================

    const handleConnect = async () => {

        if (isConnected) {

            disconnectTimbangan();

            return;

        }

        if (!selectedTargetId) {

            alert(
                'Pilih Target Kerja terlebih dahulu!'
            );

            return;

        }

        if (!selectedDetailId) {

            alert(
                'Pilih Detail Timbangan terlebih dahulu!'
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
            'Memulai pemantauan live data Pos 1 Timbang 1 (MQTT)...'
        );

    };


    // =====================================================
    // SIMPAN BAL
    // =====================================================

    const handleSavePack = async (
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
                `Nilai bal nomor ${nomor} tidak valid!`
            );

            return;

        }

        try {

            addLog(
                `Mengonfirmasi bal nomor ${nomor} (${berat} KG)...`
            );

            const res =
                await storeStream({

                    target_id:
                        activeTargetId,

                    target_aturan_detail_id:
                        selectedDetailId,

                    nomor_bal:
                        nomor,

                    berat_kotor:
                        berat,

                });


            if (res.data?.success) {

                addLog(
                    `Bal No. ${nomor} berhasil dikonfirmasi.`
                );

                await ambilLiveData(
                    activeTargetId,
                    selectedDetailId
                );

            }

        } catch (err) {

            console.error(
                'Gagal menyimpan bal:',
                err
            );

            addLog(
                err.response?.data?.message ||
                `Gagal menyimpan data bal ${nomor}.`
            );

        }

    };


    // =====================================================
    // HAPUS BAL DARI CACHE
    // =====================================================

    const handleDeletePack = async (
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
                `Hapus data bal nomor ${nomor} dari staging?`
            )
        ) {

            return;

        }

        try {

            const res =
                await getLiveData(
                    activeTargetId,
                    selectedDetailId
                );

            const cacheItems =
                res.data?.cache_data || [];

            const targetCache =
                cacheItems.find(
                    (item) =>
                        Number(item.nomor_bal) ===
                        Number(nomor)
                );

            if (!targetCache) {

                addLog(
                    `Bal ${nomor} tidak ditemukan di staging.`
                );

                return;

            }

            const delRes =
                await deleteCache(
                    targetCache.id
                );

            if (delRes.data?.success) {

                addLog(
                    `Bal No. ${nomor} berhasil dihapus dari staging.`
                );

                await ambilLiveData(
                    activeTargetId,
                    selectedDetailId
                );

            }

        } catch (err) {

            console.error(
                'Gagal menghapus bal:',
                err
            );

            addLog(
                `Gagal menghapus bal ${nomor}.`
            );

        }

    };


    // =====================================================
    // RESET UI
    // =====================================================

    const resetUI = useCallback(() => {

        disconnectTimbangan();

        targetIdRef.current = null;

        setSelectedTargetId('');

        setSelectedDetailId('');

        setDetailList([]);

        setPackValues({});

        setWeightDisplay('0.00');

        setTimeDisplay('-');

        setNextPack(1);

        setTotalBoxes(5);

        setIsFinished(false);

        setIsTargetFull(false);

    }, [
        disconnectTimbangan,
        setNextPack,
    ]);


    // =====================================================
    // BATAL / RESET
    // =====================================================

    const handleCancel = async () => {

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

            const res =
                await clearCacheByTarget(
                    activeTargetId
                );

            const responseData =
                res.data || res;

            if (!responseData.success) {

                addLog(
                    responseData.message ||
                    'Gagal membersihkan cache.'
                );

                return;

            }

            addLog(
                responseData.message ||
                'Cache server berhasil dibersihkan.'
            );


            try {

                await updateTargetStatus(
                    activeTargetId,
                    'pending'
                );

            } catch (err) {

                addLog(
                    'Gagal mengembalikan status target ke pending.'
                );

            }


            resetUI();

            await fetchTargetAktif();

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

    const handleFinish = async () => {

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
                'Belum ada Detail Timbangan yang dipilih.'
            );

            return;

        }


        // -------------------------------------------------
        // CEK JUMLAH BAL
        // -------------------------------------------------

        if (!isTargetFull) {

            alert(
                'Jumlah bal belum terpenuhi.'
            );

            return;

        }


        const selectedDetail =
            detailList.find(
                (item) =>
                    String(item.id) ===
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
                `Selesaikan penimbangan item ${
                    selectedDetail.jenis_tbk || '-'
                }?`
            )
        ) {

            return;

        }


        try {

            addLog(
                'Menyimpan data timbang item secara permanen...'
            );

            const res =
                await commitFinal({

                    target_id:
                        activeTargetId,

                    target_aturan_detail_id:
                        selectedDetailId,

                });


            if (!res.data?.success) {

                return;

            }


            // -------------------------------------------------
            // PUTUS MQTT
            // -------------------------------------------------

            disconnectTimbangan();


            addLog(
                res.data.message ||
                'Item berhasil diselesaikan.'
            );


            const statusDetail =
                res.data.status_detail;

            const targetStatus =
                res.data.target_status;


            if (
                statusDetail === 'finish'
            ) {

                addLog(
                    '✓ Item berhasil diselesaikan.'
                );

            }


            // -----------------------------------------
            // SEMUA DETAIL SELESAI
            // -----------------------------------------

            if (
                targetStatus === 'finish'
            ) {

                addLog(
                    '✓ Seluruh item Target sudah selesai.'
                );

            }


            // -----------------------------------------
            // RESET DETAIL SAJA
            // -----------------------------------------

            setSelectedDetailId('');

            setPackValues({});

            setWeightDisplay('0.00');

            setTimeDisplay('-');

            setNextPack(1);

            setTotalBoxes(5);

            setIsTargetFull(false);


            // -----------------------------------------
            // REFRESH TARGET
            // -----------------------------------------

            await fetchTargetAktif();


            // -----------------------------------------
            // LOAD DETAIL TERBARU
            // -----------------------------------------

            const targetRes =
                await targetService.getById(
                    activeTargetId
                );

            const aturan =
                targetRes.data?.data?.aturan ?? [];

            const details =
                aturan.flatMap(
                    (item) =>
                        (item.detail ?? []).filter(
                            (detail) =>
                                detail.status !== 'finish'
                        )
                );

            setDetailList(details);


            // -----------------------------------------
            // TARGET SUDAH SELESAI
            // -----------------------------------------

            if (
                targetStatus === 'finish'
            ) {

                disconnectTimbangan();

                targetIdRef.current =
                    null;

                setSelectedTargetId('');

                setDetailList([]);

            }

        } catch (err) {

            console.error(
                'Gagal menyelesaikan item:',
                err
            );

            addLog(
                err.response?.data?.message ||
                'Gagal menyelesaikan item penimbangan.'
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
    // RENDER GRID
    // =====================================================

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
                    className="flex flex-col border border-gray-300 bg-white rounded-lg overflow-hidden w-full sm:w-[calc(50%-0.25rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.6rem)] xl:w-[calc(20%-0.65rem)] shadow-sm"
                >

                    {[0, 1, 2, 3, 4].map(
                        (offset) => {

                            const nomor =
                                start + offset;


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
                                        ] ?? ''
                                    );


                            const canSave =
                                (
                                    isActive ||
                                    isSavedInCache
                                ) &&
                                Number(value) > 0;


                            return (

                                <div
                                    key={nomor}
                                    id={`row-${nomor}`}
                                    className={`flex items-center w-full h-10 md:h-11 ${
                                        offset < 4
                                            ? 'border-b border-gray-300'
                                            : ''
                                    } ${
                                        isActive
                                            ? 'bg-blue-100/80 ring-2 ring-blue-500 ring-inset z-10'
                                            : 'bg-white'
                                    }`}
                                >

                                    {/* NOMOR BAL */}

                                    <div
                                        className={`w-9 sm:w-10 md:w-11 h-full flex-shrink-0 border-r border-gray-300 flex items-center justify-center text-xs md:text-sm font-bold ${
                                            isActive
                                                ? 'bg-blue-200 text-blue-800'
                                                : 'bg-gray-50 text-gray-600'
                                        }`}
                                    >
                                        {nomor}
                                    </div>


                                    {/* BERAT */}

                                    <div className="flex-1 min-w-0 h-full px-2 flex items-center">

                                        <input
                                            type="text"
                                            readOnly
                                            value={value}
                                            className="w-full h-full bg-transparent border-none outline-none text-right font-bold text-sm md:text-base text-blue-700"
                                        />

                                    </div>


                                    {/* AKSI */}

                                    <div className="flex h-full flex-shrink-0 border-l border-gray-200">

                                        {/* HAPUS */}

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
                                            className={`w-7 sm:w-8 h-full font-bold text-sm flex items-center justify-center border-r border-gray-200 transition-colors ${
                                                isSavedInCache &&
                                                !isFinished
                                                    ? 'text-red-600 hover:bg-red-100 hover:text-red-800 active:bg-red-200'
                                                    : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                            title={
                                                isSavedInCache
                                                    ? `Hapus bal ${nomor}`
                                                    : ''
                                            }
                                        >
                                            ✕
                                        </button>


                                        {/* SIMPAN */}

                                        <button
                                            type="button"
                                            disabled={
                                                !canSave ||
                                                isFinished ||
                                                isTargetFull
                                            }
                                            onClick={() =>
                                                canSave &&
                                                !isTargetFull &&
                                                handleSavePack(
                                                    nomor,
                                                    value
                                                )
                                            }
                                            className={`w-7 sm:w-8 h-full font-bold text-sm flex items-center justify-center transition-colors ${
                                                canSave &&
                                                !isFinished &&
                                                !isTargetFull
                                                    ? 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 active:bg-emerald-200'
                                                    : 'text-gray-300 cursor-not-allowed'
                                            }`}
                                            title={
                                                canSave &&
                                                !isTargetFull
                                                    ? `Simpan bal ${nomor}`
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

        <div className="max-w-6xl mx-auto w-full space-y-4 p-4 md:p-6">

            {/* =================================================
                CARD 1
            ================================================= */}

            <div className="bg-white p-4 md:p-6 rounded-xl shadow">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* -----------------------------------------
                        TARGET / DETAIL
                    ----------------------------------------- */}

                    <div className="space-y-3">

                        <div className="border-b pb-1">

                            <h3 className="font-bold text-gray-700 text-sm">
                                POS 1 - PENERIMAAN / TIMBANG 1
                            </h3>

                        </div>


                        {/* TARGET */}

                        <div>

                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                Pilih Target Kerja
                            </label>


                            <select
                                value={
                                    selectedTargetId
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
                                className="w-full p-2 text-xs border rounded-lg bg-gray-50 font-medium outline-none focus:border-blue-500 disabled:opacity-60"
                            >

                                <option value="">
                                    -- Pilih Target Kerja --
                                </option>


                                {targetList
                                    .filter(
                                        (item) =>
                                            item.status !==
                                            'finish'
                                    )
                                    .map(
                                        (item) => (

                                            <option
                                                key={item.id}
                                                value={item.id}
                                            >
                                                {`${ 
                                                    item.tanggal_formatted ||
                                                    '-'
                                                } | ${
                                                    item.kode_batch ||
                                                    '-'
                                                }`}
                                            </option>

                                        )
                                    )}

                            </select>

                        </div>


                        {/* DETAIL */}

                        <div>

                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                Pilih Detail Timbangan
                            </label>


                            <select
                                value={
                                    selectedDetailId
                                }
                                onChange={(e) =>
                                    handleSelectDetail(
                                        e.target.value
                                    )
                                }
                                disabled={
                                    !selectedTargetId ||
                                    isConnected ||
                                    isFinished
                                }
                                className="w-full p-2 text-xs border rounded-lg bg-gray-50 font-medium outline-none focus:border-blue-500 disabled:opacity-60"
                            >

                                <option value="">
                                    -- Pilih Detail --
                                </option>


                                {detailList.map(
                                    (detail) => (

                                        <option
                                            key={detail.id}
                                            value={detail.id}
                                        >
                                            {`${
                                                detail.type ||
                                                '-'
                                            } | ${
                                                detail.jenis_tbk ||
                                                '-'
                                            } | ${
                                                detail.tahun ||
                                                '-'
                                            } | ${
                                                detail.grade ||
                                                '-'
                                            } | ${
                                                detail.s_k ||
                                                '-'
                                            } | ${
                                                detail.jumlah_bal ||
                                                0
                                            } Bal`}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* -----------------------------------------
                        LIVE DISPLAY
                    ----------------------------------------- */}

                    <div className="bg-blue-50 p-4 rounded-xl text-center flex flex-col justify-between border border-blue-200">

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


                        <div className="text-5xl md:text-6xl font-extrabold text-blue-600 my-2">

                            {weightDisplay}

                            <span className="text-xl font-bold">
                                {' '}KG
                            </span>

                        </div>


                        <div className="text-xs text-gray-500 mb-3">

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
                                className={`w-full py-2 text-white rounded-lg font-bold shadow text-xs transition-colors ${
                                    isConnected
                                        ? 'bg-red-600 hover:bg-red-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                } ${
                                    isFinished
                                        ? 'opacity-50 cursor-not-allowed'
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

            <div className="bg-white p-3 md:p-4 rounded-xl shadow w-full max-w-6xl mx-auto space-y-3">

                <div className="flex justify-between items-center gap-2">

                    <div>

                        <h2 className="font-bold text-gray-700 text-base">
                            Lembar Bal (Pos 1)
                        </h2>


                        <div className="text-[11px] text-gray-500">

                            Bal aktif berikutnya:

                            <span className="font-bold text-blue-600">
                                {' '}
                                {currentIndex}
                            </span>

                        </div>


                        {isTargetFull && (

                            <span className="text-xs text-amber-600 font-semibold">
                                ⚠ Jumlah bal sudah terpenuhi.
                            </span>

                        )}


                        {isFinished && (

                            <span className="text-xs text-emerald-600 font-semibold">
                                ✓ Penimbangan Selesai & Committed
                            </span>

                        )}

                    </div>


                    {/* AKSI */}

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={
                                handleCancel
                            }
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold text-xs border border-gray-300 transition-colors"
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
                                    !isTargetFull
                                }
                                className={`px-4 py-2 rounded-lg font-bold text-xs shadow transition-colors ${
                                    selectedDetailId &&
                                    isTargetFull
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Selesaikan Item
                            </button>

                        )}

                    </div>

                </div>


                {/* GRID */}

                <div className="flex flex-wrap gap-2 md:gap-3 max-h-72 overflow-y-auto p-1 border rounded-lg bg-gray-50/50">

                    {renderSheetGrid()}

                </div>

            </div>


            {/* =================================================
                CARD 3 - LOG
            ================================================= */}

            <div
                ref={logBoxRef}
                className="bg-slate-900 text-green-400 p-3 rounded-xl shadow font-mono text-xs h-24 overflow-y-auto max-w-6xl mx-auto w-full"
            >

                {logs.map(
                    (log, idx) => (

                        <div key={idx}>
                            {log}
                        </div>

                    )
                )}

            </div>

        </div>

    );

}