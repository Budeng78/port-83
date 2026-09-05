import React, { useEffect, useRef, useState, useCallback } from 'react';
import mqtt from 'mqtt';
import {
    getTargetAktif,
    getLiveData,
    deleteCache,
    commitFinal,
    storeStream
} from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/Pos1Timbang1Service.js';

const MQTT_URL = 'ws://192.168.1.102:9001';
const MQTT_TOPIC = '/timbangan/data';
const MQTT_OPTIONS = {
    username: 'tes',
    password: 'tes123',
    reconnectPeriod: 2000,
};

export default function Pos1Timbang1Page() {

    // =========================================================
    // DOKUMEN / TARGET STATE & REF
    // =========================================================
    const targetIdRef = useRef(null);
    const currentIndexRef = useRef(1);

    // =========================================================
    // LOG & POLLING REF
    // =========================================================
    const logBoxRef = useRef(null);
    const gridPollingRef = useRef(null); // polling grid staging saja (bukan live weight lagi)
    const isFetchingRef = useRef(false);
    const mqttClientRef = useRef(null); // koneksi MQTT untuk live weight

    // =========================================================
    // UI & CONNECTION STATE
    // =========================================================
    const [isConnected, setIsConnected] = useState(false);
    const [weightDisplay, setWeightDisplay] = useState('0.00');
    const [timeDisplay, setTimeDisplay] = useState('-');
    const [logs, setLogs] = useState(['[Sistem] Menunggu data dari Pos 1 Timbang 1...']);

    // Form / Target Active List State
    const [targetList, setTargetList] = useState([]);
    const [selectedTargetId, setSelectedTargetId] = useState('');

    // Pack Grid State
    const [currentIndex, setCurrentIndex] = useState(1);
    const [totalBoxes, setTotalBoxes] = useState(5);
    const [packValues, setPackValues] = useState({});
    const [isFinished, setIsFinished] = useState(false);

    // =========================================================
    // HELPER FUNCTIONS
    // =========================================================
    const addLog = useCallback((text) => {
        const time = new Date().toLocaleTimeString('id-ID', { hour12: false });
        setLogs((prev) => [...prev, `[${time}] ${text}`]);
    }, []);

    const setNextPack = (next) => {
        const value = Number(next) || 1;
        currentIndexRef.current = value;
        setCurrentIndex(value);
    };

    // Auto scroll console log
    useEffect(() => {
        if (logBoxRef.current) {
            logBoxRef.current.scrollTop = logBoxRef.current.scrollHeight;
        }
    }, [logs]);

    // Load Target Aktif saat komponen mount
    useEffect(() => {
        fetchTargetAktif();
    }, []);

    const fetchTargetAktif = async () => {
        try {
            const res = await getTargetAktif();
            if (res.data?.success) {
                setTargetList(res.data.data || []);
            }
        } catch (err) {
            addLog('Gagal mengambil daftar target aktif.');
        }
    };

    // =========================================================
    // MQTT — LIVE WEIGHT
    // =========================================================
    const connectMqtt = useCallback(() => {
        if (mqttClientRef.current) return;

        addLog('Menghubungkan ke MQTT broker...');

        const client = mqtt.connect(MQTT_URL, MQTT_OPTIONS);

        client.on('connect', () => {
            setIsConnected(true);
            addLog('Terhubung ke MQTT broker.');

            client.subscribe(MQTT_TOPIC, (err) => {
                if (err) {
                    addLog(`Gagal subscribe topic ${MQTT_TOPIC}.`);
                }
            });
        });

        client.on('message', (topic, payload) => {
            if (topic !== MQTT_TOPIC) return;

            try {
                const data = JSON.parse(payload.toString());

                if (data?.value !== undefined) {
                    setWeightDisplay(Number(data.value).toFixed(2));
                    setTimeDisplay(data.time || new Date().toLocaleTimeString('id-ID', { hour12: false }));
                }
            } catch (err) {
                addLog('Payload MQTT tidak valid / gagal di-parse.');
            }
        });

        client.on('error', (err) => {
            addLog(`MQTT error: ${err?.message || err}`);
        });

        client.on('close', () => {
            setIsConnected(false);
        });

        mqttClientRef.current = client;
    }, [addLog]);

    const disconnectMqtt = useCallback(() => {
        if (mqttClientRef.current) {
            mqttClientRef.current.end(true);
            mqttClientRef.current = null;
        }
        setIsConnected(false);
    }, []);

    // Stop semua pemantauan (MQTT + polling grid)
    const disconnectTimbangan = useCallback(() => {
        disconnectMqtt();

        if (gridPollingRef.current) {
            clearInterval(gridPollingRef.current);
            gridPollingRef.current = null;
        }

        addLog('Pemantauan data timbang dihentikan.');
    }, [disconnectMqtt, addLog]);

    // =========================================================
    // POLLING GRID STAGING (cache_data) — TETAP REST
    // =========================================================
    const ambilLiveData = useCallback(async () => {
        const activeTargetId = targetIdRef.current;
        if (!activeTargetId || isFetchingRef.current) return;

        try {
            isFetchingRef.current = true;
            const res = await getLiveData(activeTargetId);
            if (!res.data?.success) return;

            const { cache_data, next_nomor_bal } = res.data;

            // Map data cache ke tampilan grid pack
            const values = {};
            if (Array.isArray(cache_data) && cache_data.length > 0) {
                cache_data.forEach((item) => {
                    const noBal = Number(item.nomor_bal);
                    const berat = Number(item.berat_kotor);
                    if (Number.isFinite(noBal) && Number.isFinite(berat)) {
                        values[noBal] = berat.toFixed(2);
                    }
                });
            }

            // Cegah re-render berlebihan jika nilai packValues sama persis
            setPackValues((prev) => {
                const isSame = JSON.stringify(prev) === JSON.stringify(values);
                return isSame ? prev : values;
            });

            // Set urutan nomor bal berikutnya
            if (next_nomor_bal) {
                setNextPack(next_nomor_bal);
                setTotalBoxes((prev) => Math.max(5, Math.ceil(next_nomor_bal / 5) * 5));
            }
        } catch (err) {
            addLog('Gagal menyinkronkan data grid dari server.');
        } finally {
            isFetchingRef.current = false;
        }
    }, [addLog]);

    // =========================================================
    // TOGGLE MONITORING / CONNECT
    // =========================================================
    const handleConnect = () => {
        if (isConnected) {
            disconnectTimbangan();
            return;
        }

        if (!selectedTargetId) {
            alert('Pilih Target Kerja terlebih dahulu!');
            return;
        }

        targetIdRef.current = selectedTargetId;
        connectMqtt();
        addLog('Memulai pemantauan live data Pos 1 Timbang 1 (MQTT)...');

        ambilLiveData();
        gridPollingRef.current = setInterval(ambilLiveData, 5000);
    };

    // =========================================================
    // AKSI SIMPAN BAL (V)
    // =========================================================
    const handleSavePack = async (nomor, berat) => {
        const activeTargetId = targetIdRef.current;
        if (!activeTargetId) return;

        if (!berat) {
            alert(`Nilai bal nomor ${nomor} kosong!`);
            return;
        }

        try {
            addLog(`Mengonfirmasi/menyimpan bal nomor ${nomor} (${berat} KG)...`);

            const res = await storeStream({
                target_id: activeTargetId,
                nomor_bal: nomor,
                berat_kotor: berat,
            });

            if (res.data?.success) {
                addLog(`Bal No. ${nomor} berhasil dikonfirmasi.`);
                ambilLiveData();
            }
        } catch (err) {
            addLog(err.response?.data?.message || `Gagal menyimpan data bal ${nomor}.`);
        }
    };

    // =========================================================
    // AKSI HAPUS BAL (X)
    // =========================================================
    const handleDeletePack = async (nomor) => {
        const activeTargetId = targetIdRef.current;
        if (!activeTargetId) return;

        if (!window.confirm(`Hapus data bal nomor ${nomor} dari staging?`)) return;

        try {
            isFetchingRef.current = true;
            const res = await getLiveData(activeTargetId);
            const cacheItems = res.data?.cache_data || [];
            const targetCache = cacheItems.find((item) => Number(item.nomor_bal) === nomor);

            if (!targetCache) {
                addLog(`Item bal ${nomor} tidak ditemukan di staging.`);
                return;
            }

            const delRes = await deleteCache(targetCache.id);
            if (delRes.data?.success) {
                addLog(`Bal No. ${nomor} berhasil dihapus dari staging.`);
            }
        } catch (err) {
            addLog(`Gagal menghapus bal ${nomor}.`);
        } finally {
            isFetchingRef.current = false;
            ambilLiveData();
        }
    };

    // =========================================================
    // FINISH / COMMIT FINAL
    // =========================================================
    const handleFinish = async () => {
        const activeTargetId = targetIdRef.current;
        if (!activeTargetId) {
            alert('Belum ada Target Kerja yang dipilih.');
            return;
        }

        if (!window.confirm('Simpan permanen seluruh data penimbangan?')) return;

        try {
            addLog('Memindahkan data cache ke penyimpanan permanen...');
            const res = await commitFinal(activeTargetId);

            if (res.data?.success) {
                disconnectTimbangan();
                setIsFinished(true);
                addLog('Seluruh data penimbangan Pos 1 berhasil disimpan secara permanen!');
            }
        } catch (err) {
            addLog(err.response?.data?.message || 'Gagal melakukan commit final.');
        }
    };

    // Cleanup saat unmount
    useEffect(() => {
        return () => {
            disconnectMqtt();
            if (gridPollingRef.current) clearInterval(gridPollingRef.current);
        };
    }, [disconnectMqtt]);

    // Scroll otomatis ke row aktif
    useEffect(() => {
        const row = document.getElementById(`row-${currentIndex}`);
        if (row) {
            row.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, [currentIndex]);

    // =========================================================
    // RENDER PACK GRID
    // =========================================================
    const renderSheetGrid = () => {
        const groups = [];

        for (let i = 0; i < totalBoxes; i += 5) {
            const start = i + 1;

            groups.push(
                <div
                    key={start}
                    className="flex flex-col border border-gray-300 bg-white rounded-lg overflow-hidden w-full sm:w-[calc(50%-0.25rem)] md:w-[calc(33.333%-0.5rem)] lg:w-[calc(25%-0.6rem)] xl:w-[calc(20%-0.65rem)] shadow-sm"
                >
                    {[0, 1, 2, 3, 4].map((offset) => {
                        const nomor = start + offset;
                        const value = nomor === currentIndex && isConnected
                            ? weightDisplay
                            : (packValues[nomor] ?? '');
                        const isActive = nomor === currentIndex;
                        const hasValue = value !== '';

                        return (
                            <div
                                key={nomor}
                                id={`row-${nomor}`}
                                className={`flex items-center w-full h-10 md:h-11 ${
                                    offset < 4 ? 'border-b border-gray-300' : ''
                                } ${isActive ? 'bg-blue-100/80 ring-2 ring-blue-500 ring-inset z-10' : 'bg-white'}`}
                            >
                                {/* Nomor Bal */}
                                <div className={`w-9 sm:w-10 md:w-11 h-full flex-shrink-0 border-r border-gray-300 flex items-center justify-center text-xs md:text-sm font-bold ${
                                    isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-50 text-gray-600'
                                }`}>
                                    {nomor}
                                </div>

                                {/* Nilai Berat */}
                                <div className="flex-1 min-w-0 h-full px-2 flex items-center">
                                    <input
                                        type="text"
                                        readOnly
                                        value={value}
                                        className="w-full h-full bg-transparent border-none outline-none text-right font-bold text-sm md:text-base text-blue-700"
                                    />
                                </div>

                                {/* GROUP ICON AKSI (X KIRI & V KANAN) */}
                                <div className="flex h-full flex-shrink-0 border-l border-gray-200">

                                    {/* ICON X (HAPUS) - KIRI */}
                                    <button
                                        type="button"
                                        disabled={!hasValue || isFinished}
                                        onClick={() => hasValue && handleDeletePack(nomor)}
                                        className={`w-7 sm:w-8 h-full font-bold text-sm flex items-center justify-center border-r border-gray-200 transition-colors ${
                                            isActive && hasValue && !isFinished
                                                ? 'text-red-600 hover:bg-red-100 hover:text-red-800 active:bg-red-200'
                                                : hasValue && !isFinished
                                                    ? 'text-gray-400 hover:text-red-600'
                                                    : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        title={hasValue ? `Hapus bal ${nomor}` : ''}
                                    >
                                        ✕
                                    </button>

                                    {/* ICON V (SIMPAN) - KANAN */}
                                    <button
                                        type="button"
                                        disabled={!hasValue || isFinished}
                                        onClick={() => hasValue && handleSavePack(nomor, value)}
                                        className={`w-7 sm:w-8 h-full font-bold text-sm flex items-center justify-center transition-colors ${
                                            isActive && hasValue && !isFinished
                                                ? 'text-emerald-600 hover:bg-emerald-100 hover:text-emerald-800 active:bg-emerald-200'
                                                : hasValue && !isFinished
                                                    ? 'text-gray-400 hover:text-emerald-600'
                                                    : 'text-gray-300 cursor-not-allowed'
                                        }`}
                                        title={hasValue ? `Simpan bal ${nomor}` : ''}
                                    >
                                        ✓
                                    </button>

                                </div>
                            </div>
                        );
                    })}
                </div>
            );
        }

        return groups;
    };

    return (
        <div className="max-w-6xl mx-auto w-full space-y-4 p-4 md:p-6">

            {/* CARD 1: INFORMASI & TIMBANGAN */}
            <div className="bg-white p-4 md:p-6 rounded-xl shadow">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* INFORMASI TARGET */}
                    <div className="space-y-3">
                        <div className="border-b pb-1">
                            <h3 className="font-bold text-gray-700 text-sm">
                                POS 1 - PENERIMAAN / TIMBANG 1
                            </h3>
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-gray-500 mb-1">
                                Pilih Target Kerja Aktif
                            </label>
                            <select
                                value={selectedTargetId}
                                onChange={(e) => {
                                    setSelectedTargetId(e.target.value);
                                    targetIdRef.current = e.target.value;
                                }}
                                disabled={isConnected || isFinished}
                                className="w-full p-2 text-xs border rounded-lg bg-gray-50 font-medium outline-none focus:border-blue-500 disabled:opacity-60"
                            >
                                <option value="">-- Pilih Target Kerja --</option>
                                {targetList
                                    .filter((item) => !item.is_finished)
                                    .map((item) => (
                                        <option key={item.id} value={item.id}>
                                            {`${item.tanggal_formatted || '-'} | ${item.jenis_tbk || '-'} | ${item.tahun || '-'} | ${item.s_k || '-'} | ${item.jumlah_bal || 0}`}
                                        </option>
                                    ))}
                            </select>
                        </div>
                    </div>

                    {/* LIVE DISPLAY TIMBANGAN */}
                    <div className="bg-blue-50 p-4 rounded-xl text-center flex flex-col justify-between border border-blue-200">
                        <div className={`text-xs font-bold uppercase ${isConnected ? 'text-green-600' : 'text-gray-400'}`}>
                            {isConnected ? 'ONLINE' : 'OFFLINE'}
                        </div>

                        <div className="text-5xl md:text-6xl font-extrabold text-blue-600 my-2">
                            {weightDisplay} <span className="text-xl font-bold">KG</span>
                        </div>

                        <div className="text-xs text-gray-500 mb-3">
                            Waktu Stream: <span className="font-bold">{timeDisplay}</span>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={handleConnect}
                                disabled={isFinished}
                                className={`w-full py-2 text-white rounded-lg font-bold shadow text-xs transition-colors ${
                                    isConnected ? 'bg-red-600 hover:bg-red-700' : 'bg-blue-600 hover:bg-blue-700'
                                } ${isFinished ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isConnected ? 'Stop Pantau' : 'Mulai Pantau'}
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            {/* CARD 2: GRID SHEET LEMBAR BAL */}
            <div className="bg-white p-3 md:p-4 rounded-xl shadow w-full max-w-6xl mx-auto space-y-3">
                <div className="flex justify-between items-center gap-2">
                    <div>
                        <h2 className="font-bold text-gray-700 text-base">Lembar Bal (Pos 1)</h2>
                        <div className="text-[11px] text-gray-500">
                            Bal aktif berikutnya: <span className="font-bold text-blue-600">{currentIndex}</span>
                        </div>
                        {isFinished && (
                            <span className="text-xs text-emerald-600 font-semibold">
                                ✓ Penimbangan Selesai & Committed
                            </span>
                        )}
                    </div>

                    {!isFinished && (
                        <button
                            type="button"
                            onClick={handleFinish}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-bold text-xs shadow hover:bg-emerald-700 transition-colors"
                        >
                            Commit Final (Selesai)
                        </button>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3 max-h-72 overflow-y-auto p-1 border rounded-lg bg-gray-50/50">
                    {renderSheetGrid()}
                </div>
            </div>

            {/* CARD 3: CONSOLE LOG */}
            <div
                ref={logBoxRef}
                className="bg-slate-900 text-green-400 p-3 rounded-xl shadow font-mono text-xs h-24 overflow-y-auto max-w-6xl mx-auto w-full"
            >
                {logs.map((log, idx) => (
                    <div key={idx}>{log}</div>
                ))}
            </div>

        </div>
    );
}