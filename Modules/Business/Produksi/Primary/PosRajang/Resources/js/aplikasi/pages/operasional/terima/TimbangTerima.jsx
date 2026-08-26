import React, {
    useCallback,
    useEffect,
    useRef,
    useState,
} from 'react';

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

    /*
     * nextTally = nomor tally berikutnya yang ditentukan backend.
     */
    const [nextTally, setNextTally] = useState(1);

    /*
     * Ref digunakan MQTT.
     *
     * Jangan mengandalkan state React di dalam callback MQTT
     * karena callback MQTT dapat menggunakan nilai state lama.
     */
    const nextTallyRef = useRef(1);


    /*
    |--------------------------------------------------------------------------
    | LOCK PENYIMPANAN TALLY
    |--------------------------------------------------------------------------
    |
    | State isSaving hanya untuk UI.
    |
    | savingTallyRef adalah LOCK realtime untuk MQTT.
    |
    | Ini mencegah:
    |
    | MQTT #1 -> simpan tally 1
    | MQTT #2 -> ikut menyimpan tally 1
    |
    */

    const [isSaving, setIsSaving] = useState(false);

    const savingTallyRef = useRef(false);


    /*
    |--------------------------------------------------------------------------
    | FINISHED
    |--------------------------------------------------------------------------
    */

    const [isFinished, setIsFinished] = useState(false);

    const isFinishedRef = useRef(false);


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
    | SYNC DOKUMEN ID REF
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        dokumenIdRef.current = dokumenId;

    }, [dokumenId]);


    /*
    |--------------------------------------------------------------------------
    | SYNC NEXT TALLY REF
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        nextTallyRef.current =
            Number(nextTally) > 0
                ? Number(nextTally)
                : 1;

    }, [nextTally]);


    /*
    |--------------------------------------------------------------------------
    | SYNC FINISHED REF
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        isFinishedRef.current = isFinished;

    }, [isFinished]);


    /*
    |--------------------------------------------------------------------------
    | SET NEXT TALLY DARI BACKEND
    |--------------------------------------------------------------------------
    |
    | Semua penentuan nomor berikutnya dipusatkan di sini.
    |
    */

    const syncNextTally = useCallback(async (id) => {

        if (!id) {

            setNextTally(1);

            nextTallyRef.current = 1;

            return 1;

        }

        try {

            const response =
                await PrimaryPos1RajangTimbangAwalService.getNextTally(
                    id
                );

            if (!response?.success) {

                addLog(
                    response?.message ||
                    'Gagal mengambil nomor tally berikutnya.'
                );

                return nextTallyRef.current;

            }

            const serverNext =
                Number(
                    response.data?.next_tally ?? 1
                );

            const safeNext =
                Number.isFinite(serverNext) &&
                serverNext > 0
                    ? serverNext
                    : 1;

            /*
             * Update state.
             */
            setNextTally(safeNext);

            /*
             * Update ref secara langsung.
             *
             * Ini penting karena MQTT memakai ref.
             */
            nextTallyRef.current = safeNext;

            addLog(
                `Nomor tally berikutnya dari backend: ${safeNext}`
            );

            return safeNext;

        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                'Gagal mengambil nomor tally berikutnya.'
            );

            return nextTallyRef.current;

        }

    }, [addLog]);


    /*
    |--------------------------------------------------------------------------
    | LOAD DOKUMEN
    |--------------------------------------------------------------------------
    |
    | Fungsi ini dipakai setelah:
    |
    | - Cari dokumen
    | - Save tally
    | - Delete tally
    | - Finish
    |
    | Frontend tidak melakukan pergeseran nomor tally.
    |
    | Backend adalah sumber kebenaran.
    |
    */

    const loadDokumen = useCallback(async (id) => {

        if (!id) {

            return;

        }

        try {

            addLog(
                `Mengambil dokumen ${id}...`
            );


            const response =
                await PrimaryPos1RajangTimbangAwalService.getTimbang(
                    id
                );


            if (!response?.success) {

                addLog(
                    response?.message ||
                    'Gagal mengambil dokumen timbang.'
                );

                return;

            }


            const data =
                response.data;


            /*
             * HEADER
             */

            setDokumenId(
                data.id
            );

            dokumenIdRef.current =
                data.id;


            setNo(
                data.no ?? ''
            );


            setNoWo(
                data.no_wo ?? ''
            );


            setJenis(
                data.jenis ?? ''
            );


            setSK(
                data.s_k ?? ''
            );


            setTara(
                data.tara ?? ''
            );


            setJumlahBal(
                data.jumlah_bal ?? ''
            );


            setStatus(
                data.status ?? ''
            );


            /*
             * TALLY
             */

            const cacheData =
                Array.isArray(data.detail_caches)
                    ? data.detail_caches
                    : [];


            setTallies(
                cacheData
            );


            /*
             * STATUS
             */

            const completed =
                data.status === 'completed';


            setIsFinished(
                completed
            );


            isFinishedRef.current =
                completed;


            /*
             * NEXT TALLY
             *
             * Selalu ambil dari backend.
             */

            await syncNextTally(
                data.id
            );


            /*
             * LOG
             */

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

    }, [
        addLog,
        syncNextTally
    ]);


    /*
    |--------------------------------------------------------------------------
    | CARI / RECOVERY DOKUMEN
    |--------------------------------------------------------------------------
    */

    const handleCariDokumen = async () => {

        /*
         * Tidak boleh mencari dokumen ketika MQTT aktif.
         */
        if (isConnected) {

            alert(
                'Disconnect timbangan terlebih dahulu.'
            );

            return;

        }


        const id =
            window.prompt(
                'Masukkan ID Dokumen Timbang Awal:'
            );


        if (!id) {

            return;

        }


        addLog(
            `Recovery dokumen: ${id}`
        );


        await loadDokumen(
            id
        );

    };


    /*
    |--------------------------------------------------------------------------
    | CREATE HEADER
    |--------------------------------------------------------------------------
    */

    const handleCreateHeader = async () => {

        if (dokumenIdRef.current) {

            alert(
                'Dokumen sudah dibuat.'
            );

            return;

        }


        if (!noWo.trim()) {

            alert(
                'No. WO wajib diisi.'
            );

            return;

        }


        if (!jenis.trim()) {

            alert(
                'Jenis wajib diisi.'
            );

            return;

        }


        if (!sK.trim()) {

            alert(
                'S/K wajib diisi.'
            );

            return;

        }


        if (
            tara === '' ||
            Number(tara) < 0
        ) {

            alert(
                'Tara wajib diisi.'
            );

            return;

        }


        if (
            jumlahBal === '' ||
            Number(jumlahBal) < 1
        ) {

            alert(
                'Jumlah bal wajib diisi.'
            );

            return;

        }


        try {

            addLog(
                'Membuat dokumen timbang awal...'
            );


            const payload = {

                /*
                 * No dibuat backend jika kosong.
                 */
                no: no
                    ? Number(no)
                    : undefined,

                no_wo:
                    noWo.trim(),

                jenis:
                    jenis.trim(),

                s_k:
                    sK.trim(),

                tara:
                    Number(tara),

                jumlah_bal:
                    Number(jumlahBal),

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


            const data =
                response.data;


            /*
             * SET HEADER
             */

            setDokumenId(
                data.id
            );

            dokumenIdRef.current =
                data.id;


            setNo(
                data.no ?? ''
            );


            setNoWo(
                data.no_wo ?? ''
            );


            setJenis(
                data.jenis ?? ''
            );


            setSK(
                data.s_k ?? ''
            );


            setTara(
                data.tara ?? ''
            );


            setJumlahBal(
                data.jumlah_bal ?? ''
            );


            setStatus(
                data.status ?? 'draft'
            );


            /*
             * RESET TALLY
             */

            setTallies([]);


            setNextTally(1);

            nextTallyRef.current = 1;


            setIsFinished(false);

            isFinishedRef.current = false;


            addLog(
                `Dokumen #${data.no} berhasil dibuat.`
            );


            addLog(
                `ID Dokumen: ${data.id}`
            );


            /*
             * Sinkronkan nomor berikutnya dengan backend.
             */
            await syncNextTally(
                data.id
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
    |
    | nomor_tally selalu berasal dari backend/ref.
    |
    | Setelah save:
    |
    | backend -> loadDokumen()
    |         -> getNextTally()
    |         -> nextTallyRef
    |
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

            return false;

        }


        if (isFinishedRef.current) {

            addLog(
                'Dokumen sudah selesai.'
            );

            return false;

        }


        /*
         * LOCK UTAMA
         *
         * Jika masih ada proses save:
         * MQTT berikutnya diabaikan.
         */
        if (savingTallyRef.current) {

            addLog(
                `Tally ${nomor} diabaikan: penyimpanan sebelumnya masih berlangsung.`
            );

            return false;

        }


        const beratBruto =
            Number(berat);


        if (!Number.isFinite(beratBruto)) {

            addLog(
                'Berat MQTT tidak valid.'
            );

            return false;

        }


        const nomorTally =
            Number(nomor);


        if (
            !Number.isInteger(nomorTally) ||
            nomorTally < 1
        ) {

            addLog(
                `Nomor tally tidak valid: ${nomor}`
            );

            return false;

        }


        /*
         * Jangan menyimpan nomor di atas jumlah bal.
         */
        const targetJumlah =
            Number(jumlahBal);


        if (
            Number.isFinite(targetJumlah) &&
            targetJumlah > 0 &&
            nomorTally > targetJumlah
        ) {

            addLog(
                `Tally ${nomorTally} melebihi jumlah bal ${targetJumlah}.`
            );

            return false;

        }


        const beratTara =
            Number(tara) || 0;


        try {

            /*
             * Aktifkan LOCK SEBELUM request API.
             */
            savingTallyRef.current = true;

            setIsSaving(true);


            addLog(
                `Menyimpan tally ${nomorTally}: ${beratBruto.toFixed(2)} Kg`
            );


            const response =
                await PrimaryPos1RajangTimbangAwalService.saveTally(
                    activeId,
                    {
                        nomor_tally:
                            nomorTally,

                        berat_bruto:
                            beratBruto,

                        tara:
                            beratTara,
                    }
                );


            if (!response?.success) {

                addLog(
                    response?.message ||
                    `Gagal menyimpan tally ${nomorTally}.`
                );

                return false;

            }


            addLog(
                `Tally ${nomorTally} berhasil masuk cache.`
            );


            /*
             * Backend menjadi sumber kebenaran.
             *
             * Jangan:
             *
             * nextTally + 1
             *
             * di frontend.
             */
            await loadDokumen(
                activeId
            );


            return true;

        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                `Gagal menyimpan tally ${nomorTally}.`
            );

            return false;

        } finally {

            /*
             * Lepaskan LOCK setelah seluruh proses selesai.
             */
            savingTallyRef.current = false;

            setIsSaving(false);

        }

    }, [
        addLog,
        jumlahBal,
        tara,
        loadDokumen
    ]);


    /*
    |--------------------------------------------------------------------------
    | CONNECT MQTT
    |--------------------------------------------------------------------------
    */

    const connectMqtt = useCallback(() => {

        if (
            mqttClientRef.current?.connected
        ) {

            addLog(
                'MQTT sudah terhubung.'
            );

            return;

        }


        if (!dokumenIdRef.current) {

            addLog(
                'Tidak dapat connect: dokumen belum tersedia.'
            );

            return;

        }


        if (isFinishedRef.current) {

            addLog(
                'Tidak dapat connect: dokumen sudah completed.'
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
                    username:
                        'tes',

                    password:
                        'tes123',

                    reconnectPeriod:
                        3000,
                }
            );


        mqttClientRef.current =
            client;


        /*
        |--------------------------------------------------------------------------
        | MQTT CONNECT
        |--------------------------------------------------------------------------
        */

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


        /*
        |--------------------------------------------------------------------------
        | MQTT MESSAGE
        |--------------------------------------------------------------------------
        */

        client.on(
            'message',
            async (topic, message) => {

                if (
                    topic !== targetTopic
                ) {

                    return;

                }


                /*
                 * Jika dokumen sudah selesai,
                 * jangan proses MQTT.
                 */
                if (
                    isFinishedRef.current
                ) {

                    addLog(
                        'Dokumen completed. Berat MQTT diabaikan.'
                    );

                    return;

                }


                /*
                 * Jika sedang menyimpan tally sebelumnya,
                 * jangan menerima trigger berikutnya.
                 *
                 * Ini pengaman utama double-trigger.
                 */
                if (
                    savingTallyRef.current
                ) {

                    addLog(
                        'Berat MQTT diabaikan: masih menyimpan tally sebelumnya.'
                    );

                    return;

                }


                const raw =
                    message.toString().trim();


                let weight =
                    NaN;


                let time =
                    new Date().toLocaleTimeString(
                        'id-ID',
                        {
                            hour12: false
                        }
                    );


                /*
                 * PARSE MQTT
                 */

                try {

                    const data =
                        JSON.parse(raw);


                    if (
                        typeof data === 'number'
                    ) {

                        weight =
                            Number(data);

                    } else if (
                        data &&
                        typeof data === 'object'
                    ) {

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


                /*
                 * VALIDASI BERAT
                 */

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
                |--------------------------------------------------------------------------
                | AMBIL NOMOR TALLY
                |--------------------------------------------------------------------------
                |
                | PENTING:
                |
                | Jangan:
                |
                | const nomor = nextTally;
                |
                | karena state bisa stale.
                |
                | Gunakan:
                |
                | nextTallyRef.current
                |
                */

                const nomor =
                    Number(
                        nextTallyRef.current
                    );


                if (
                    !Number.isInteger(nomor) ||
                    nomor < 1
                ) {

                    addLog(
                        `Nomor tally dari backend tidak valid: ${nomor}`
                    );

                    return;

                }


                /*
                |--------------------------------------------------------------------------
                | VALIDASI JUMLAH BAL
                |--------------------------------------------------------------------------
                */

                const targetJumlah =
                    Number(jumlahBal);


                if (
                    Number.isFinite(targetJumlah) &&
                    targetJumlah > 0 &&
                    nomor > targetJumlah
                ) {

                    addLog(
                        'Jumlah bal sudah terpenuhi.'
                    );

                    return;

                }


                /*
                |--------------------------------------------------------------------------
                | SIMPAN
                |--------------------------------------------------------------------------
                */

                await simpanTally(
                    nomor,
                    weight
                );

            }
        );


        /*
        |--------------------------------------------------------------------------
        | MQTT ERROR
        |--------------------------------------------------------------------------
        */

        client.on(
            'error',
            (error) => {

                addLog(
                    `MQTT Error: ${error.message}`
                );

                setIsConnected(false);

            }
        );


        /*
        |--------------------------------------------------------------------------
        | MQTT CLOSE
        |--------------------------------------------------------------------------
        */

        client.on(
            'close',
            () => {

                addLog(
                    'MQTT terputus.'
                );

                setIsConnected(false);

            }
        );


        /*
        |--------------------------------------------------------------------------
        | MQTT RECONNECT
        |--------------------------------------------------------------------------
        */

        client.on(
            'reconnect',
            () => {

                addLog(
                    'MQTT mencoba reconnect...'
                );

            }
        );

    }, [
        addLog,
        jumlahBal,
        simpanTally
    ]);


    /*
    |--------------------------------------------------------------------------
    | DISCONNECT MQTT
    |--------------------------------------------------------------------------
    */

    const disconnectMqtt = useCallback(() => {

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


            mqttClientRef.current =
                null;

        }


        setIsConnected(false);

    }, [addLog]);


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


        if (isFinishedRef.current) {

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
    |
    | PENTING:
    |
    | Frontend TIDAK menggeser nomor.
    |
    | Contoh:
    |
    | Sebelum:
    | 1
    | 2
    | 3
    | 4
    |
    | Delete 2
    |
    | Backend:
    | 1
    | 3 -> 2
    | 4 -> 3
    |
    | Frontend:
    | loadDokumen()
    |
    | Hasil:
    | 1
    | 2
    | 3
    |
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


        if (isFinishedRef.current) {

            alert(
                'Dokumen sudah selesai dan tidak dapat diubah.'
            );

            return;

        }


        /*
         * Jangan delete ketika save MQTT sedang berlangsung.
         */
        if (savingTallyRef.current) {

            alert(
                'Tunggu proses penyimpanan tally selesai.'
            );

            return;

        }


        /*
         * Cari target berdasarkan nomor_tally.
         */

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
                `Nomor tally setelahnya akan otomatis dirapatkan oleh backend.`
            );


        if (!yakin) {

            return;

        }


        try {

            /*
             * Matikan sementara penerimaan MQTT
             * agar tidak ada save bersamaan dengan delete.
             */
            savingTallyRef.current = true;

            setIsSaving(true);


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
                'Backend sedang menjadi sumber nomor tally baru...'
            );


            /*
             * JANGAN:
             *
             * setTallies(...)
             * nomorTally + 1
             *
             * di frontend.
             *
             * Ambil ulang semuanya dari backend.
             */

            await loadDokumen(
                activeId
            );


            addLog(
                'Nomor tally berhasil disinkronkan dengan backend.'
            );

        } catch (error) {

            addLog(
                error?.response?.data?.message ||
                `Gagal menghapus tally ${nomorTally}.`
            );

        } finally {

            savingTallyRef.current = false;

            setIsSaving(false);

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


        if (isFinishedRef.current) {

            alert(
                'Dokumen sudah selesai.'
            );

            return;

        }


        /*
         * Jangan finish ketika sedang save.
         */
        if (savingTallyRef.current) {

            alert(
                'Tunggu proses penyimpanan tally selesai.'
            );

            return;

        }


        const targetJumlah =
            Number(jumlahBal);


        if (
            !Number.isFinite(targetJumlah) ||
            targetJumlah < 1
        ) {

            alert(
                'Jumlah bal tidak valid.'
            );

            return;

        }


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


            /*
             * Disconnect MQTT.
             */

            disconnectMqtt();


            /*
             * Update status.
             */

            setIsFinished(true);

            isFinishedRef.current =
                true;


            setStatus(
                'completed'
            );


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

                mqttClientRef.current =
                    null;

            }

        };

    }, []);


    /*
    |--------------------------------------------------------------------------
    | RENDER TALLY GRID
    |--------------------------------------------------------------------------
    */

    const renderTallyGrid = () => {

        /*
         * Jumlah tampilan minimal mengikuti:
         *
         * - jumlah bal
         * - jumlah tally yang tersimpan
         * - next tally
         *
         * Tetapi nomor isi tetap berasal dari backend.
         */

        const jumlah =
            Math.max(
                Number(jumlahBal) || 0,
                tallies.length,
                nextTally
            );


        /*
         * Minimal 5 dan kelipatan 5.
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


                            /*
                             * Cari berdasarkan nomor_tally.
                             */

                            const item =
                                tallies.find(
                                    tally =>
                                        Number(
                                            tally.nomor_tally
                                        ) ===
                                        nomor
                                );


                            const isActive =
                                nomor ===
                                    nextTally &&
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
                                        ${
                                            isActive
                                                ? 'bg-blue-100'
                                                : ''
                                        }
                                    `}
                                >

                                    {/* NOMOR TALLY */}

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


                                    {/* BERAT */}

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


                                    {/* DELETE */}

                                    {isFilled &&
                                        !isFinished && (

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDeleteTally(
                                                        nomor
                                                    )
                                                }
                                                disabled={
                                                    isSaving
                                                }
                                                className="
                                                    mr-1
                                                    w-5
                                                    h-5
                                                    rounded-full
                                                    bg-rose-500
                                                    hover:bg-rose-600
                                                    disabled:bg-slate-300
                                                    disabled:cursor-not-allowed
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
                                                title={
                                                    `Hapus tally ${nomor}`
                                                }
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

                            {/* NO DOKUMEN */}

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
                                    readOnly
                                    placeholder="Otomatis"
                                    className="
                                        w-full
                                        p-2
                                        border
                                        rounded-lg
                                        bg-slate-100
                                        text-slate-600
                                        font-medium
                                        outline-none
                                        cursor-not-allowed
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
                                        setNoWo(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Contoh: EXE-30"
                                    disabled={
                                        Boolean(dokumenId) ||
                                        isFinished
                                    }
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
                                        setJenis(
                                            e.target.value
                                        )
                                    }
                                    placeholder="CHN"
                                    disabled={
                                        Boolean(dokumenId) ||
                                        isFinished
                                    }
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
                                        setSK(
                                            e.target.value
                                        )
                                    }
                                    placeholder="4/J1/21"
                                    disabled={
                                        Boolean(dokumenId) ||
                                        isFinished
                                    }
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
                                        setTara(
                                            e.target.value
                                        )
                                    }
                                    placeholder="4.50"
                                    disabled={
                                        Boolean(dokumenId) ||
                                        isFinished
                                    }
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
                                        setJumlahBal(
                                            e.target.value
                                        )
                                    }
                                    placeholder="15"
                                    disabled={
                                        Boolean(dokumenId) ||
                                        isFinished
                                    }
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
                                text-xs
                                text-slate-500
                                mb-3
                            "
                        >
                            Tally berikutnya:{' '}

                            <span
                                className="
                                    font-bold
                                    text-emerald-600
                                "
                            >
                                {nextTally}
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
                                onClick={
                                    handleCreateHeader
                                }
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
                                onClick={
                                    handleCariDokumen
                                }
                                disabled={
                                    isConnected ||
                                    isSaving
                                }
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
                                onClick={
                                    handleConnect
                                }
                                disabled={
                                    !dokumenId ||
                                    isFinished ||
                                    isSaving
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


                        {isSaving && (

                            <div
                                className="
                                    text-xs
                                    text-blue-600
                                    font-semibold
                                    mt-1
                                "
                            >
                                Menyimpan / sinkronisasi...
                            </div>

                        )}


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


                    {!isFinished &&
                        dokumenId && (

                            <button
                                type="button"
                                onClick={
                                    handleFinish
                                }
                                disabled={
                                    isSaving ||
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