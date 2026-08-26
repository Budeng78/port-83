import React, { useState, useEffect } from 'react';

const MQTT_STATUS = {
    disconnected: 'DISCONNECTED',
    connecting: 'CONNECTING',
    connected: 'CONNECTED',
    error: 'ERROR'
};

export default function TimbangAwal() {
    // --- State Utama & Form ---
    const [form, setForm] = useState({
        tanggal: '2026-08-26',
        no_wo: '',
        urutan_kiriman: '',
        nama_sopir: '',
        no_kendaraan: '',
        tara: '',
        berat_netto: '',
        jumlah_bal: ''
    });

    const [dokumen, setDokumen] = useState(null);
    const [details, setDetails] = useState([]);
    const [nextTally, setNextTally] = useState(1);
    
    // --- State Loading & Status ---
    const [loading, setLoading] = useState(false);
    const [finishing, setFinishing] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);

    // --- State MQTT & Timbangan ---
    const [mqttStatus, setMqttStatus] = useState(MQTT_STATUS.disconnected);
    const [beratBruto, setBeratBruto] = useState(0);
    const [lastMqttTime, setLastMqttTime] = useState('-');
    const [logs, setLogs] = useState([]);

    // --- Fungsi Helper ---
    const formatNumber = (num) => {
        if (num === null || num === undefined || isNaN(num)) return '0.00';
        return Number(num).toLocaleString('id-ID', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const formatDateTime = (date) => {
        if (!date) return '-';
        return new Date(date).toLocaleTimeString('id-ID');
    };

    const addLog = (message) => {
        setLogs((prev) => [...prev, { waktu: new Date(), message }]);
    };

    // --- Handler Form ---
    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // --- Logika MQTT & Tally (Dapat disesuaikan dengan koneksi aslinya) ---
    const connectMqtt = () => {
        setMqttStatus(MQTT_STATUS.connecting);
        addLog('Menghubungkan ke broker MQTT...');
        setTimeout(() => {
            setMqttStatus(MQTT_STATUS.connected);
            setBeratBruto(1450.50);
            setLastMqttTime(new Date().toLocaleTimeString('id-ID'));
            addLog('Berhasil terhubung ke MQTT Timbangan.');
        }, 800);
    };

    const disconnectMqtt = () => {
        setMqttStatus(MQTT_STATUS.disconnected);
        addLog('Koneksi MQTT diputus.');
    };

    // --- Logika Tombol "Cari Batch" ---
    const createDokumen = () => {
        setLoading(true);
        addLog(`Mencari batch dengan kode: ${form.no_wo || 'Baru'}...`);
        setTimeout(() => {
            // Simulasi data dokumen/batch ditemukan
            setDokumen({ id: 101, no_wo: form.no_wo || 'WO-2026-08' });
            setLoading(false);
            addLog('Batch ditemukan dan berhasil dimuat.');
        }, 800);
    };

    // --- Logika Selesai / Close Batch ---
    const finishSession = () => {
        setFinishing(true);
        addLog('Memproses penutupan batch...');
        setTimeout(() => {
            setIsCompleted(true);
            setFinishing(false);
            addLog('Batch berhasil ditutup (Close Batch).');
        }, 1000);
    };

    // --- Logika Hapus Tally ---
    const deleteTally = (nomorTally) => {
        setDeleting(true);
        addLog(`Menghapus tally nomor #${nomorTally}...`);
        setTimeout(() => {
            setDetails((prev) => prev.filter(item => item.nomor_tally !== nomorTally));
            setDeleting(false);
            addLog(`Tally nomor #${nomorTally} berhasil dihapus.`);
        }, 500);
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-6 font-sans">
            <div className="mx-auto max-w-[1400px] space-y-6">

                {/* ==================================================
                    BAGIAN ATAS: 8 FIELD FORM & KARTU MONITOR MQTT
                ================================================== */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    
                    {/* Sisi Kiri: 8 Field Form Input (2 Kolom) */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        {/* 1. Tanggal */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Tanggal
                            </label>
                            <input
                                type="date"
                                name="tanggal"
                                value={form.tanggal}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* 2. Masukkan Kode */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                Masukkan Kode
                            </label>
                            <input
                                type="text"
                                name="no_wo"
                                value={form.no_wo}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                placeholder="Masukkan Kode"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* 3. Urutan Kiriman */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                3. Urutan Kiriman
                            </label>
                            <input
                                type="number"
                                name="urutan_kiriman"
                                value={form.urutan_kiriman}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                placeholder="Contoh: 1"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* 4. Nama Sopir */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                4. Nama Sopir
                            </label>
                            <input
                                type="text"
                                name="nama_sopir"
                                value={form.nama_sopir}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                placeholder="Nama Driver"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* 5. No. Kendaraan */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                5. No. Kendaraan
                            </label>
                            <input
                                type="text"
                                name="no_kendaraan"
                                value={form.no_kendaraan}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                placeholder="Contoh: B 1234 XYZ"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* 6. Berat Tara */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                6. Berat Tara
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                name="tara"
                                value={form.tara}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                placeholder="0.20"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* 7. Berat Netto */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                7. Berat Netto
                            </label>
                            <input
                                type="number"
                                name="berat_netto"
                                value={form.berat_netto}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                placeholder="1500"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                        {/* 8. Jumlah Karung */}
                        <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1">
                                8. Jumlah Karung
                            </label>
                            <input
                                type="number"
                                name="jumlah_bal"
                                value={form.jumlah_bal}
                                onChange={handleFormChange}
                                disabled={Boolean(dokumen)}
                                placeholder="50"
                                className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-slate-100"
                            />
                        </div>

                    </div>

                    {/* Sisi Kanan: Kartu Status MQTT & Tombol Connect / Cari Batch */}
                    <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 flex flex-col justify-between items-center text-center">
                        <div className="w-full">
                            <div className="text-xs font-bold tracking-wider uppercase text-slate-500 mb-1">
                                {mqttStatus === MQTT_STATUS.connected ? 'ONLINE' : 'OFFLINE'}
                            </div>
                            <div className="text-5xl font-black text-blue-600 tracking-tight my-2">
                                {formatNumber(beratBruto)}
                            </div>
                            <div className="text-xs text-slate-500">
                                Waktu MQTT: {lastMqttTime}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 w-full mt-4">
                            <button
                                type="button"
                                onClick={mqttStatus === MQTT_STATUS.connected ? disconnectMqtt : connectMqtt}
                                className="py-3 px-4 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
                            >
                                {mqttStatus === MQTT_STATUS.connected ? 'Disconnect' : 'Connect'}
                            </button>

                            <button
                                type="button"
                                onClick={createDokumen}
                                disabled={loading}
                                className="py-3 px-4 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition disabled:opacity-50"
                            >
                                {loading ? 'Proses...' : 'Cari Batch'}
                            </button>
                        </div>
                    </div>

                </div>


                {/* ==================================================
                    BAGIAN TENGAH: LEMBAR TALLY (AUTO-FILL)
                ================================================== */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-slate-800">
                            Lembar Tally (Auto-Fill)
                        </h2>

                        <button
                            type="button"
                            onClick={finishSession}
                            disabled={finishing || !dokumen?.id || (details.length === 0 && isCompleted)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 px-5 rounded-xl text-sm transition shadow-sm disabled:opacity-50"
                        >
                            {finishing ? 'Memproses...' : 'Selesai / Close Batch'}
                        </button>
                    </div>

                    {/* Tabel Tally Sesuai Gambar Mockup */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden bg-white">
                        <table className="w-full border-collapse">
                            <tbody>
                                {details.length > 0 ? (
                                    details.map((item, index) => (
                                        <tr key={item.id || index} className="border-b border-slate-200">
                                            <td className="w-24 p-3 text-center font-bold text-blue-900 bg-blue-50/40 border-r border-slate-200">
                                                {item.nomor_tally || index + 1}
                                            </td>
                                            <td className="p-3 text-slate-700 font-medium">
                                                {formatNumber(item.berat_bruto)} kg
                                            </td>
                                            <td className="w-16 p-3 text-center">
                                                {!isCompleted && (
                                                    <button
                                                        type="button"
                                                        onClick={() => deleteTally(Number(item.nomor_tally))}
                                                        disabled={deleting}
                                                        className="text-rose-500 hover:text-rose-700 font-bold disabled:opacity-50"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    // Placeholder 5 baris kosong sesuai gambar
                                    [1, 2, 3, 4, 5].map((num) => (
                                        <tr key={num} className="border-b border-slate-200 last:border-b-0">
                                            <td className="w-24 p-3 text-center font-bold text-slate-700 bg-slate-100/70 border-r border-slate-200">
                                                {num}
                                            </td>
                                            <td className="p-3 text-slate-400 italic">
                                                {num === 1 ? 'Menunggu data timbangan...' : ''}
                                            </td>
                                            <td className="w-16 p-3 text-center text-slate-400 font-bold">
                                                ✕
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>


                {/* ==================================================
                    BAGIAN BAWAH: TERMINAL LOG AKTIVITAS
                ================================================== */}
                <div className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs shadow-inner space-y-1">
                    {logs.length > 0 ? (
                        logs.slice(-5).map((log, idx) => (
                            <div key={idx}>
                                <span className="text-slate-500">[{formatDateTime(log.waktu)}]</span> {log.message}
                            </div>
                        ))
                    ) : (
                        <div>[Sistem] Menunggu koneksi...</div>
                    )}
                </div>

            </div>
        </div>
    );
}