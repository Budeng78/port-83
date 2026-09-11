
import React, {
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    Eye,
    RefreshCw,
    Search,
    X,
    Printer,
} from 'lucide-react';
import {
    useNavigate,
} from 'react-router-dom';

import timbanganReportService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/timbanganReportService.js';

export default function TimbanganReportPage() {

    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedTarget, setSelectedTarget] = useState(null);

    const [search, setSearch] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState('');

    const navigate = useNavigate();
    // =========================================================
    // LOAD REPORT
    // =========================================================

    const loadReport = async () => {

        try {

            setLoading(true);

            const res =
                await timbanganReportService.getAll();

            if (res.data?.success) {

                setData(
                    res.data.data || []
                );
            }

        } catch (err) {

            console.error(
                'Gagal mengambil report penimbangan:',
                err
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // LOAD SAAT MOUNT
    // =========================================================

    useEffect(() => {

        loadReport();

    }, []);


    // =========================================================
    // DAFTAR TAHUN
    // =========================================================

    const years = useMemo(() => {

        const result = [
            ...new Set(
                data
                    .map((item) => {

                        if (!item.tanggal) {
                            return null;
                        }

                        const date =
                            new Date(
                                item.tanggal
                            );

                        return date.getFullYear();
                    })
                    .filter(Boolean)
            ),
        ];

        return result.sort(
            (a, b) => b - a
        );

    }, [data]);


    // =========================================================
    // FILTER DATA
    // =========================================================

    const filteredData = useMemo(() => {

        const keyword =
            search
                .trim()
                .toLowerCase();

        return data.filter(
            (item) => {

                // ---------------------------------------------
                // FILTER BULAN / TAHUN
                // ---------------------------------------------

                if (
                    selectedMonth ||
                    selectedYear
                ) {

                    if (!item.tanggal) {
                        return false;
                    }

                    const date =
                        new Date(
                            item.tanggal
                        );

                    const month =
                        date.getMonth() + 1;

                    const year =
                        date.getFullYear();

                    if (
                        selectedMonth &&
                        month !==
                            Number(
                                selectedMonth
                            )
                    ) {
                        return false;
                    }

                    if (
                        selectedYear &&
                        year !==
                            Number(
                                selectedYear
                            )
                    ) {
                        return false;
                    }
                }


                // ---------------------------------------------
                // SEARCH
                // ---------------------------------------------

                if (keyword) {

                    const kodeBatch =
                        String(
                            item.kode_batch || ''
                        ).toLowerCase();

                    const tanggal =
                        item.tanggal
                            ? new Date(
                                item.tanggal
                            ).toLocaleDateString(
                                'id-ID'
                            ).toLowerCase()
                            : '';

                    const aturan =
                        Array.isArray(
                            item.aturan
                        )
                            ? item.aturan
                                .map(
                                    (aturanItem) =>
                                        aturanItem
                                            ?.nomor_aturan || ''
                                )
                                .join(' ')
                                .toLowerCase()
                            : '';

                    const searchableText =
                        [
                            kodeBatch,
                            tanggal,
                            aturan,
                        ].join(' ');

                    if (
                        !searchableText.includes(
                            keyword
                        )
                    ) {
                        return false;
                    }
                }

                return true;
            }
        );

    }, [
        data,
        search,
        selectedMonth,
        selectedYear,
    ]);


    // =========================================================
    // RESET FILTER
    // =========================================================

    const resetFilter = () => {

        setSearch('');
        setSelectedMonth('');
        setSelectedYear('');

    };


    // =========================================================
    // BUKA DETAIL
    // =========================================================

    const handleDetail = async (targetId) => {

        try {

            setLoading(true);

            const res =
                await timbanganReportService.getByTarget(
                    targetId
                );

            if (res.data?.success) {

                setSelectedTarget(
                    res.data.data
                );
            }

        } catch (err) {

            console.error(
                'Gagal mengambil detail report:',
                err
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // FORMAT ANGKA
    // =========================================================

    const formatNumber = (value) => {

        if (
            value === null ||
            value === undefined ||
            value === ''
        ) {
            return '-';
        }

        return Number(value).toLocaleString(
            'id-ID',
            {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            }
        );
    };


    // =========================================================
    // FORMAT TANGGAL
    // =========================================================

    const formatDate = (value) => {

        if (!value) {
            return '-';
        }

        return new Date(
            value
        ).toLocaleDateString(
            'id-ID'
        );
    };


    // =========================================================
    // HASIL PENIMBANGAN PER DETAIL
    // =========================================================

    const getDetailSummary = (detail) => {

        const timbangan =
            (
                selectedTarget?.timbangan || []
            ).filter(
                (item) =>
                    item.target_aturan_detail_id ===
                    detail.id
            );


        const totalBruto =
            timbangan.reduce(
                (total, item) =>
                    total +
                    (
                        Number(
                            item.berat_kotor
                        ) || 0
                    ),
                0
            );


        const jumlahBal =
            Number(
                detail.jumlah_bal
            ) || 0;


        const tara =
            Number(
                detail.tara
            ) || 0;


        const totalTara =
            jumlahBal * tara;


        const totalNetto =
            totalBruto - totalTara;


        return {
            totalBruto,
            totalTara,
            totalNetto,
        };
    };


    // =========================================================
    // RENDER
    // =========================================================
console.log('SELECTED TARGET:', selectedTarget);
    return (

        <div className="max-w-6xl mx-auto w-full space-y-4 p-4 md:p-6">


            {/* ================================================= */}
            {/* CARD 1 - FILTER */}
            {/* ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />

                <div className="p-4 md:p-5">

                    {/* HEADER */}

                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

                        <div>

                            <h1 className="text-lg md:text-xl font-bold text-slate-800">
                                Report Penimbangan Pos 1
                            </h1>

                            <p className="text-xs text-slate-500 mt-1">
                                Hasil penimbangan yang sudah selesai.
                            </p>

                        </div>


                        <button
                            type="button"
                            onClick={loadReport}
                            disabled={loading}
                            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
                        >

                            <RefreshCw
                                size={15}
                                className={
                                    loading
                                        ? 'animate-spin'
                                        : ''
                                }
                            />

                            Refresh

                        </button>

                    </div>


                    {/* FILTER */}

                    <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-4">

                        {/* SEARCH */}

                        <div className="md:col-span-2">

                            <label className="mb-1 block text-[11px] font-bold text-slate-600">
                                Pencarian
                            </label>

                            <div className="relative">

                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Cari kode batch atau nomor aturan..."
                                    className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-9 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                                />

                                {search && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch('')
                                        }
                                        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                    >

                                        <X size={14} />

                                    </button>

                                )}

                            </div>

                        </div>


                        {/* BULAN */}

                        <div>

                            <label className="mb-1 block text-[11px] font-bold text-slate-600">
                                Bulan
                            </label>

                            <select
                                value={selectedMonth}
                                onChange={(e) =>
                                    setSelectedMonth(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua Bulan
                                </option>

                                <option value="1">
                                    Januari
                                </option>

                                <option value="2">
                                    Februari
                                </option>

                                <option value="3">
                                    Maret
                                </option>

                                <option value="4">
                                    April
                                </option>

                                <option value="5">
                                    Mei
                                </option>

                                <option value="6">
                                    Juni
                                </option>

                                <option value="7">
                                    Juli
                                </option>

                                <option value="8">
                                    Agustus
                                </option>

                                <option value="9">
                                    September
                                </option>

                                <option value="10">
                                    Oktober
                                </option>

                                <option value="11">
                                    November
                                </option>

                                <option value="12">
                                    Desember
                                </option>

                            </select>

                        </div>


                        {/* TAHUN */}

                        <div>

                            <label className="mb-1 block text-[11px] font-bold text-slate-600">
                                Tahun
                            </label>

                            <select
                                value={selectedYear}
                                onChange={(e) =>
                                    setSelectedYear(
                                        e.target.value
                                    )
                                }
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            >

                                <option value="">
                                    Semua Tahun
                                </option>

                                {years.map(
                                    (year) => (

                                        <option
                                            key={year}
                                            value={year}
                                        >
                                            {year}
                                        </option>

                                    )
                                )}

                            </select>

                        </div>

                    </div>


                    {/* FILTER FOOTER */}

                    <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

                        <div className="text-[11px] text-slate-500">

                            Menampilkan{' '}

                            <span className="font-bold text-slate-700">
                                {filteredData.length}
                            </span>

                            {' '}dari{' '}

                            <span className="font-bold text-slate-700">
                                {data.length}
                            </span>

                            {' '}laporan

                        </div>


                        {(search ||
                            selectedMonth ||
                            selectedYear) && (

                            <button
                                type="button"
                                onClick={
                                    resetFilter
                                }
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-600 hover:bg-slate-50"
                            >

                                <X size={13} />

                                Reset Filter

                            </button>

                        )}

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* CARD 2 - DAFTAR REPORT */}
            {/* ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                <div className="h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />

                <div className="p-4 md:p-5">

                    {/* HEADER */}

                    <div className="mb-4">

                        <h2 className="text-sm md:text-base font-bold text-slate-800">
                            Daftar Laporan
                        </h2>

                        <p className="mt-1 text-[11px] text-slate-500">
                            Ringkasan laporan penimbangan berdasarkan kode batch.
                        </p>

                    </div>


                    {/* TABLE */}

                    <div className="overflow-x-auto rounded-xl border border-slate-200">

                        <table className="w-full text-sm">

                            <thead className="border-b border-slate-200 bg-slate-50">

                                <tr>

                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600">
                                        No
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600">
                                        Kode Batch
                                    </th>

                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600">
                                        Tanggal
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600">
                                        Jumlah Aturan
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600">
                                        Jumlah Bal
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600">
                                        Status
                                    </th>

                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-600">
                                        Aksi
                                    </th>

                                </tr>

                            </thead>


                            <tbody className="divide-y divide-slate-100">

                                {loading &&
                                data.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="px-4 py-8 text-center text-xs text-slate-500"
                                        >
                                            Memuat report...
                                        </td>

                                    </tr>

                                ) : filteredData.length === 0 ? (

                                    <tr>

                                        <td
                                            colSpan="7"
                                            className="px-4 py-8 text-center text-xs text-slate-500"
                                        >
                                            Tidak ada laporan yang sesuai dengan filter.
                                        </td>

                                    </tr>

                                ) : (

                                    filteredData.map(
                                        (item, index) => (

                                            <tr
                                                key={item.id}
                                                className="hover:bg-slate-50"
                                            >

                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    {index + 1}
                                                </td>

                                                <td className="px-4 py-3 text-xs font-bold text-slate-800">
                                                    {item.kode_batch || '-'}
                                                </td>

                                                <td className="px-4 py-3 text-xs text-slate-600">
                                                    {formatDate(
                                                        item.tanggal
                                                    )}
                                                </td>

                                                <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                                                    {item.aturan_count || 0}
                                                </td>

                                                <td className="px-4 py-3 text-center text-xs font-semibold text-slate-700">
                                                    {item.jumlah_bal || 0}
                                                </td>

                                                <td className="px-4 py-3 text-center">

                                                    <span
                                                        className={
                                                            `
                                                            inline-flex
                                                            rounded-full
                                                            px-2.5
                                                            py-1
                                                            text-[10px]
                                                            font-bold
                                                            uppercase
                                                            ${
                                                                item.status === 'finish'
                                                                    ? 'bg-emerald-100 text-emerald-700'
                                                                    : item.status === 'active'
                                                                        ? 'bg-blue-100 text-blue-700'
                                                                        : 'bg-slate-100 text-slate-600'
                                                            }
                                                            `
                                                        }
                                                    >
                                                        {item.status || '-'}
                                                    </span>

                                                </td>

                                                <td className="px-4 py-3 text-center">

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDetail(
                                                                item.id
                                                            )
                                                        }
                                                        className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700"
                                                    >

                                                        <Eye size={14} />

                                                        Detail

                                                    </button>

                                                </td>

                                            </tr>

                                        )
                                    )

                                )}

                            </tbody>

                        </table>

                    </div>

                </div>

            </div>


            {/* ================================================= */}
            {/* CARD 3 - DETAIL REPORT */}
            {/* ================================================= */}

            {selectedTarget && (

                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="h-1 bg-gradient-to-r from-blue-700 via-indigo-500 to-amber-400" />

                    <div className="p-4 md:p-5">

                        {/* HEADER */}

                        <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

                            <div>

                                <h2 className="text-sm md:text-base font-bold text-slate-800">
                                    Detail Report Penimbangan
                                </h2>

                                <p className="mt-1 text-[11px] text-slate-500">
                                    Rincian berdasarkan kode batch dan nomor aturan.
                                </p>

                            </div>
<button
    type="button"
    onClick={() => {
        navigate(
            `/app/timbangan/pos1/timbangan-report/print/${selectedTarget.target.id}`
        );
    }}
    className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800"
>
    <Printer size={16} />
    Print
</button>
                            <button
                                type="button"
                                onClick={() =>
                                    setSelectedTarget(null)
                                }
                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50"
                            >

                                <X size={14} />

                                Tutup

                            </button>

                        </div>


                        {/* ================================================= */}
                        {/* INFORMASI BATCH */}
                        {/* ================================================= */}

                        <div className="mb-5 grid grid-cols-2 gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-5">

                            <div>

                                <div className="text-[11px] text-slate-500">
                                    Kode Batch
                                </div>

                                <div className="mt-1 text-sm font-bold text-slate-800">
                                    {selectedTarget.target?.kode_batch || '-'}
                                </div>

                            </div>


                            <div>

                                <div className="text-[11px] text-slate-500">
                                    Tanggal
                                </div>

                                <div className="mt-1 text-sm font-bold text-slate-800">
                                    {formatDate(
                                        selectedTarget.target?.tanggal
                                    )}
                                </div>

                            </div>


                            <div>

                                <div className="text-[11px] text-slate-500">
                                    Jumlah Aturan
                                </div>

                                <div className="mt-1 text-sm font-bold text-slate-800">
                                    {selectedTarget.target?.aturan?.length || 0}
                                </div>

                            </div>


                            <div>

                                <div className="text-[11px] text-slate-500">
                                    Jumlah Bal
                                </div>

                                <div className="mt-1 text-sm font-bold text-slate-800">

                                    {(
                                        selectedTarget.target?.aturan || []
                                    ).reduce(
                                        (total, aturan) =>
                                            total +
                                            (
                                                aturan.detail || []
                                            ).reduce(
                                                (sum, detail) =>
                                                    sum +
                                                    (
                                                        Number(
                                                            detail.jumlah_bal
                                                        ) || 0
                                                    ),
                                                0
                                            ),
                                        0
                                    )}

                                </div>

                            </div>


                            <div>

                                <div className="text-[11px] text-slate-500">
                                    Status
                                </div>

                                <div className="mt-1">

                                    <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                        {selectedTarget.target?.status || '-'}
                                    </span>

                                </div>

                            </div>

                        </div>


                        {/* ================================================= */}
                        {/* DAFTAR ATURAN */}
                        {/* ================================================= */}

                        <div className="space-y-5">

                            {(
                                selectedTarget.target?.aturan || []
                            ).map(
                                (aturan, aturanIndex) => {

                                    const jumlahBalAturan =
                                        (
                                            aturan.detail || []
                                        ).reduce(
                                            (total, detail) =>
                                                total +
                                                (
                                                    Number(
                                                        detail.jumlah_bal
                                                    ) || 0
                                                ),
                                            0
                                        );

                                    return (

                                        <div
                                            key={aturan.id}
                                            className="overflow-hidden rounded-xl border border-slate-200"
                                        >

                                            {/* HEADER ATURAN */}

                                            <div className="flex flex-col gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 md:flex-row md:items-center md:justify-between">

                                                <div>

                                                    <div className="text-[10px] font-bold uppercase text-slate-400">
                                                        Aturan {aturanIndex + 1}
                                                    </div>

                                                    <div className="mt-0.5 text-sm font-bold text-blue-700">
                                                        {aturan.nomor_aturan || '-'}
                                                    </div>

                                                </div>


                                                <div className="text-xs font-semibold text-slate-600">

                                                    Total Bal:{' '}

                                                    <span className="font-bold text-slate-800">
                                                        {jumlahBalAturan}
                                                    </span>

                                                </div>

                                            </div>


                                            {/* DETAIL ATURAN */}

                                            <div className="overflow-x-auto">

                                                <table className="w-full text-sm">

                                                    <thead className="border-b border-slate-200 bg-white">

                                                        <tr>

                                                            <th className="px-3 py-2 text-center text-[11px] font-bold text-slate-600">
                                                                No
                                                            </th>

                                                            <th className="px-3 py-2 text-left text-[11px] font-bold text-slate-600">
                                                                Type
                                                            </th>

                                                            <th className="px-3 py-2 text-left text-[11px] font-bold text-slate-600">
                                                                Jenis TBK
                                                            </th>

                                                            <th className="px-3 py-2 text-center text-[11px] font-bold text-slate-600">
                                                                Tahun
                                                            </th>

                                                            <th className="px-3 py-2 text-center text-[11px] font-bold text-slate-600">
                                                                S/K
                                                            </th>

                                                            <th className="px-3 py-2 text-left text-[11px] font-bold text-slate-600">
                                                                Grade
                                                            </th>

                                                            <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-600">
                                                                Jumlah Bal
                                                            </th>

                                                            <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-600">
                                                                Tara
                                                            </th>

                                                            <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-600">
                                                                Total Bruto
                                                            </th>

                                                            <th className="px-3 py-2 text-right text-[11px] font-bold text-slate-600">
                                                                Total Netto
                                                            </th>

                                                        </tr>

                                                    </thead>


                                                    <tbody className="divide-y divide-slate-100">

                                                        {(
                                                            aturan.detail || []
                                                        ).map(
                                                            (detail, detailIndex) => {

                                                                const summary =
                                                                    getDetailSummary(
                                                                        detail
                                                                    );

                                                                return (

                                                                    <tr
                                                                        key={detail.id}
                                                                        className="hover:bg-slate-50"
                                                                    >

                                                                        <td className="px-3 py-2 text-center text-xs text-slate-600">
                                                                            {detailIndex + 1}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-xs font-semibold uppercase text-slate-700">
                                                                            {detail.type || '-'}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-xs text-slate-700">
                                                                            {detail.jenis_tbk || '-'}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-center text-xs text-slate-700">
                                                                            {detail.tahun || '-'}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-center text-xs font-semibold text-slate-700">
                                                                            {detail.s_k || '-'}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-xs text-slate-700">
                                                                            {detail.grade || '-'}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-right text-xs font-bold text-slate-800">
                                                                            {detail.jumlah_bal || 0}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-right text-xs font-semibold text-slate-700">
                                                                            {formatNumber(
                                                                                detail.tara
                                                                            )}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-right text-xs font-semibold text-slate-800">
                                                                            {formatNumber(
                                                                                summary.totalBruto
                                                                            )}
                                                                        </td>

                                                                        <td className="px-3 py-2 text-right text-xs font-bold text-emerald-700">
                                                                            {formatNumber(
                                                                                summary.totalNetto
                                                                            )}
                                                                        </td>

                                                                    </tr>

                                                                );
                                                            }
                                                        )}

                                                    </tbody>

                                                </table>

                                            </div>

                                        </div>

                                    );

                                }
                            )}

                        </div>

                    </div>

                </div>

            )}

        </div>
    );
}
