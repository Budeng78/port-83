import React, {
    useEffect,
    useRef,
    useState
} from 'react';

import timbangAwalService from '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/services/Timbangawal';


export default function TimbangAwal() {

    // =========================================================
    // DOKUMEN
    // =========================================================

    const dokumenIdRef = useRef(null);

    const currentIndexRef = useRef(1);

    const savedPackRef = useRef(
        new Set()
    );

    const savingPackRef = useRef(
        new Set()
    );


    // =========================================================
    // LOG
    // =========================================================

    const logBoxRef = useRef(null);


    // =========================================================
    // POLLING
    // =========================================================

    const pollingRef = useRef(null);


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
        '[Sistem] Menunggu data dari Laravel...'
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
    // PACK
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
        packValues,
        setPackValues
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
    // SET NEXT PACK
    // =========================================================

    const setNextPack = next => {

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
    // SIMPAN PACK
    // =========================================================

    const simpanPack = async (
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
            savedPackRef.current.has(
                nomor
            )
        ) {

            addLog(
                `Pack ${nomor} sudah tersimpan, dilewati.`
            );

            return false;
        }


        if (
            savingPackRef.current.has(
                nomor
            )
        ) {

            addLog(
                `Pack ${nomor} sedang diproses.`
            );

            return false;
        }


        savingPackRef.current.add(
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
            `Menyimpan pack ${nomor}...`
        );


        try {

            const waktuTimbang =
                new Date()
                    .toISOString()
                    .slice(0, 19)
                    .replace('T', ' ');


            const data =
                await timbangAwalService.tambahPack({

                    dokumen_timbang_awal_id:
                        activeDokumenId,

                    nomor_pack:
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
                    `Gagal menyimpan pack ${nomor}.`
                );


                if (data.error) {

                    addLog(
                        `Detail backend: ${data.error}`
                    );
                }


                return false;
            }


            savedPackRef.current.add(
                nomor
            );


            addLog(
                `Pack ${nomor} berhasil tersimpan.`
            );


            return true;

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                `Gagal menyimpan pack ${nomor}.`
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

            savingPackRef.current.delete(
                nomor
            );
        }
    };


    // =========================================================
    // AMBIL DATA TIMBANG DARI LARAVEL
    // =========================================================

    const ambilDataTimbang = async () => {

        if (
            !dokumenIdRef.current ||
            isFinished
        ) {
            return;
        }


        try {

            const response =
                await timbangAwalService
                    .getDataTimbangMasuk();


            if (
                !response?.success
            ) {
                return;
            }


            const data =
                response.data;


            if (!data) {
                return;
            }


            const weight =
                Number(
                    data.berat ??
                    data.weight ??
                    data.value
                );


            if (
                !Number.isFinite(
                    weight
                )
            ) {
                return;
            }


            const waktu =
                data.received_at ??
                data.time ??
                new Date().toISOString();


            const nomor =
                currentIndexRef.current;


            const beratFixed =
                weight.toFixed(2);


            // =================================================
            // TAMPILKAN BERAT
            // =================================================

            setWeightDisplay(
                beratFixed
            );


            setTimeDisplay(
                new Date(waktu)
                    .toLocaleTimeString(
                        'id-ID',
                        {
                            hour12: false
                        }
                    )
            );


            // =================================================
            // JIKA BERAT 0, JANGAN SIMPAN
            // =================================================

            if (
                weight <= 0
            ) {
                return;
            }


            // =================================================
            // JIKA PACK SUDAH TERSIMPAN,
            // JANGAN PROSES ULANG DATA YANG SAMA
            // =================================================

            if (
                savedPackRef.current.has(
                    nomor
                ) ||
                savingPackRef.current.has(
                    nomor
                )
            ) {
                return;
            }


            addLog(
                `Berat dari Laravel: ${beratFixed} Kg → Pack ${nomor}`
            );


            // =================================================
            // TAMPILKAN SEMENTARA
            // =================================================

            setPackValues(
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
                await simpanPack(
                    nomor,
                    weight
                );


            // =================================================
            // GAGAL
            // =================================================

            if (!berhasil) {

                setPackValues(
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
                    `Pack ${nomor} tetap aktif karena penyimpanan gagal.`
                );


                return;
            }


            // =================================================
            // BERHASIL
            // =================================================

            const next =
                nomor + 1;


            setNextPack(
                next
            );


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
                `Pack berikutnya: ${next}`
            );

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                'Gagal mengambil data timbang dari Laravel.'
            );
        }
    };


    // =========================================================
    // MULAI / BERHENTI PANTAU DATA LARAVEL
    // =========================================================

    const connectTimbangan = () => {

        if (
            isConnected
        ) {

            disconnectTimbangan();

            return;
        }


        if (
            !dokumenIdRef.current
        ) {

            addLog(
                'Dokumen timbang belum tersedia.'
            );

            return;
        }


        addLog(
            'Mulai memantau data timbang dari Laravel...'
        );


        setIsConnected(
            true
        );


        // Ambil langsung
        ambilDataTimbang();


        // Polling setiap 1 detik
        pollingRef.current =
            setInterval(
                () => {

                    ambilDataTimbang();

                },
                1000
            );
    };


    // =========================================================
    // STOP PANTAU
    // =========================================================

    const disconnectTimbangan = () => {

        if (
            pollingRef.current
        ) {

            clearInterval(
                pollingRef.current
            );

            pollingRef.current =
                null;
        }


        setIsConnected(
            false
        );


        addLog(
            'Pemantauan data timbang dihentikan.'
        );
    };


    // =========================================================
    // CONNECT / CREATE / RECOVERY
    // =========================================================

    const handleConnect = async () => {

        if (
            isConnected
        ) {

            disconnectTimbangan();

            return;
        }


        if (
            dokumenIdRef.current
        ) {

            addLog(
                'Dokumen timbang sudah tersedia.'
            );

            connectTimbangan();

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
                await timbangAwalService.cariBatch({
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
                        hasil.data.next_pack ||
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
                                item.nomor_pack
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


                setPackValues(
                    values
                );


                savedPackRef.current =
                    new Set(
                        details.map(
                            item =>
                                Number(
                                    item.nomor_pack
                                )
                        )
                    );


                setNextPack(
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
                    `Dokumen aktif ditemukan: ${dokumen.id}`
                );


                addLog(
                    `Pack tersimpan: ${details.length}`
                );


                addLog(
                    `Pack berikutnya: ${next}`
                );


                connectTimbangan();

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
                    await timbangAwalService
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
                            ?.next_pack ||
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


                savedPackRef.current =
                    new Set();


                savingPackRef.current =
                    new Set();


                setPackValues(
                    {}
                );


                setNextPack(
                    next
                );


                setTotalBoxes(
                    5
                );


                addLog(
                    `Dokumen baru dibuat: ${dokumen.id}`
                );


                addLog(
                    `Pack berikutnya: ${next}`
                );


                connectTimbangan();

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
                await timbangAwalService.cariBatch({
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
                    data.data?.next_pack ||
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
                            item.nomor_pack
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


            setPackValues(
                values
            );


            savedPackRef.current =
                new Set(
                    details.map(
                        item =>
                            Number(
                                item.nomor_pack
                            )
                    )
                );


            setNextPack(
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
                `Pack tersimpan: ${details.length}`
            );


            addLog(
                `Pack berikutnya: ${next}`
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
    // DELETE PACK
    // =========================================================

    const handleDeletePack = async (
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
            !savedPackRef.current.has(
                nomor
            )
        ) {

            return;
        }


        if (
            !window.confirm(
                `Hapus pack nomor ${nomor}?`
            )
        ) {

            return;
        }


        try {

            addLog(
                `Menghapus pack ${nomor}...`
            );


            const data =
                await timbangAwalService.deletePack({
                    dokumen_timbang_awal_id:
                        activeDokumenId,

                    nomor_pack:
                        nomor
                });


            if (
                !data.success
            ) {

                addLog(
                    data.message ||
                    `Gagal menghapus pack ${nomor}.`
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
                            item.nomor_pack
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


            setPackValues(
                values
            );


            savedPackRef.current =
                new Set(
                    details.map(
                        item =>
                            Number(
                                item.nomor_pack
                            )
                    )
                );


            savingPackRef.current =
                new Set();


            const next =
                Number(
                    data.data?.next_pack ||
                    details.length + 1
                );


            setNextPack(
                next
            );


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
                `Pack ${nomor} berhasil dihapus.`
            );


            addLog(
                `Nomor dirapatkan. Pack berikutnya: ${next}.`
            );

        } catch (err) {

            addLog(
                err.response?.data?.message ||
                `Gagal menghapus pack ${nomor}.`
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
                await timbangAwalService
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


            disconnectTimbangan();


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
            `/app/produksi/primary/print/${dokumenIdRef.current}`,
            '_blank'
        );
    };


    // =========================================================
    // CLEANUP POLLING
    // =========================================================

    useEffect(() => {

        return () => {

            if (
                pollingRef.current
            ) {

                clearInterval(
                    pollingRef.current
                );

                pollingRef.current =
                    null;
            }

        };

    }, []);


    // =========================================================
    // SCROLL ACTIVE PACK
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
    // RENDER PACK GRID
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
                                packValues[
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


                                    <button
                                        type="button"
                                        disabled={
                                            !hasValue
                                        }
                                        onClick={() => {

                                            if (
                                                hasValue
                                            ) {

                                                handleDeletePack(
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
                                                ? `Hapus pack ${nomor}`
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


                    {/* DATA TIMBANG LARAVEL */}

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
                                        ? 'text-green-600'
                                        : 'text-gray-400'
                                }
                            `}
                        >
                            {
                                isConnected
                                    ? 'ONLINE'
                                    : 'OFFLINE'
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
                            Waktu diterima Laravel:{' '}

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
                                        ? 'Stop Pantau'
                                        : 'Mulai Pantau'
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
                CARD 2
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
                            Lembar Pack
                        </h2>


                        <div
                            className="
                                text-[11px]
                                text-gray-500
                            "
                        >
                            Pack aktif:
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
                CARD 3
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