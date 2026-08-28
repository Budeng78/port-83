import React, {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    ClipboardList,
    Search,
    RefreshCw,
    Eye,
    X,
    Scale,
    Package,
    Weight,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Loader2,
} from "lucide-react";

import hasilTimbanganService from "@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/services/hasilTimbanganService.js";


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function HasilTimbangan() {


    /*
    |--------------------------------------------------------------------------
    | DATA
    |--------------------------------------------------------------------------
    */

    const [data, setData] = useState([]);


    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 15,
        total: 0,
    });


    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const [filters, setFilters] = useState({
        search: "",
        jenis: "",
        s_k: "",
    });


    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    const [loading, setLoading] =
        useState(false);


    const [detailLoading, setDetailLoading] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | MESSAGE
    |--------------------------------------------------------------------------
    */

    const [error, setError] =
        useState("");


    const [success, setSuccess] =
        useState("");


    const [detailError, setDetailError] =
        useState("");


    /*
    |--------------------------------------------------------------------------
    | DETAIL
    |--------------------------------------------------------------------------
    */

    const [selectedId, setSelectedId] =
        useState(null);


    const [detail, setDetail] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | LOAD DATA
    |--------------------------------------------------------------------------
    */

    const loadData = useCallback(
        async (page = 1) => {

            setLoading(true);
            setError("");

            try {

                const response =
                    await hasilTimbanganService.getAll({
                        search:
                            filters.search ||
                            undefined,

                        jenis:
                            filters.jenis ||
                            undefined,

                        s_k:
                            filters.s_k ||
                            undefined,

                        per_page:
                            pagination.per_page,

                        page,
                    });


                const result =
                    response?.data;


                if (!result?.success) {

                    throw new Error(
                        result?.message ||
                        "Gagal mengambil hasil timbangan."
                    );

                }


                const paginator =
                    result.data;


                setData(
                    paginator?.data || []
                );


                setPagination({
                    current_page:
                        paginator?.current_page ||
                        1,

                    last_page:
                        paginator?.last_page ||
                        1,

                    per_page:
                        paginator?.per_page ||
                        15,

                    total:
                        paginator?.total ||
                        0,
                });


            } catch (err) {

                console.error(
                    "Gagal mengambil hasil timbangan:",
                    err
                );


                setError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Gagal mengambil hasil timbangan."
                );


            } finally {

                setLoading(false);

            }

        },
        [
            filters.search,
            filters.jenis,
            filters.s_k,
            pagination.per_page,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadData(1);

    }, [
        filters.search,
        filters.jenis,
        filters.s_k,
    ]);


    /*
    |--------------------------------------------------------------------------
    | DETAIL
    |--------------------------------------------------------------------------
    */

    const handleDetail = async (id) => {

        setSelectedId(id);

        setDetail(null);

        setDetailError("");

        setDetailLoading(true);


        try {

            const response =
                await hasilTimbanganService.getDetail(
                    id
                );


            const result =
                response?.data;


            if (!result?.success) {

                throw new Error(
                    result?.message ||
                    "Gagal mengambil detail hasil timbangan."
                );

            }


            setDetail(
                result.data
            );


        } catch (err) {

            console.error(
                "Gagal mengambil detail:",
                err
            );


            setDetailError(
                err?.response?.data?.message ||
                err?.message ||
                "Gagal mengambil detail hasil timbangan."
            );


        } finally {

            setDetailLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE DETAIL
    |--------------------------------------------------------------------------
    */

    const closeDetail = () => {

        setSelectedId(null);

        setDetail(null);

        setDetailError("");

    };


    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const handleSearch = (event) => {

        setFilters((prev) => ({
            ...prev,
            search:
                event.target.value,
        }));

    };


    const handleJenis = (event) => {

        setFilters((prev) => ({
            ...prev,
            jenis:
                event.target.value,
        }));

    };


    const handleSK = (event) => {

        setFilters((prev) => ({
            ...prev,
            s_k:
                event.target.value,
        }));

    };


    const resetFilter = () => {

        setFilters({
            search: "",
            jenis: "",
            s_k: "",
        });

    };


    /*
    |--------------------------------------------------------------------------
    | FORMAT
    |--------------------------------------------------------------------------
    */

    const formatNumber = (value) => {

        return Number(value || 0)
            .toLocaleString("id-ID", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

    };


    const formatDate = (value) => {

        if (!value) {
            return "-";
        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return value;

        }


        return date.toLocaleString(
            "id-ID",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const goToPage = (page) => {

        if (
            page < 1 ||
            page >
                pagination.last_page ||
            page ===
                pagination.current_page
        ) {

            return;

        }


        loadData(page);

    };


    /*
    |--------------------------------------------------------------------------
    | LOADING SCREEN
    |--------------------------------------------------------------------------
    */

    if (
        loading &&
        data.length === 0
    ) {

        return (

            <div className="w-full">

                <div
                    className="
                        relative
                        overflow-hidden
                        rounded-2xl
                        border border-slate-200
                        bg-white
                        shadow-sm
                    "
                >

                    <div
                        className="
                            absolute
                            inset-x-0
                            top-0
                            h-1
                            bg-gradient-to-r
                            from-blue-700
                            via-indigo-500
                            to-amber-400
                        "
                    />


                    <div
                        className="
                            flex
                            min-h-[180px]
                            items-center
                            justify-center
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                text-slate-500
                            "
                        >

                            <Loader2
                                className="
                                    h-5 w-5
                                    animate-spin
                                "
                            />

                            <span
                                className="
                                    text-sm
                                    font-medium
                                "
                            >
                                Memuat hasil timbangan...
                            </span>

                        </div>

                    </div>

                </div>

            </div>

        );

    }


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div
            className="
                w-full
                space-y-4
                sm:space-y-5
            "
        >


            {/* =========================================================
                HEADER CARD
            ========================================================== */}

            <div
                className="
                    relative
                    overflow-hidden
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    shadow-sm
                "
            >

                <div
                    className="
                        absolute
                        inset-x-0
                        top-0
                        h-1
                        bg-gradient-to-r
                        from-blue-700
                        via-indigo-500
                        to-amber-400
                    "
                />


                <div
                    className="
                        flex
                        flex-col
                        gap-3
                        p-4
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        sm:p-5
                    "
                >


                    {/* HEADER INFORMATION */}

                    <div
                        className="
                            flex
                            min-w-0
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-11 w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-blue-900
                                text-white
                                shadow-md
                            "
                        >

                            <ClipboardList
                                className="h-5 w-5"
                            />

                        </div>


                        <div className="min-w-0">

                            <h1
                                className="
                                    text-lg
                                    font-black
                                    tracking-tight
                                    text-slate-900
                                    sm:text-xl
                                "
                            >
                                Hasil Timbangan
                            </h1>


                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-slate-500
                                    sm:text-sm
                                "
                            >
                                Kelola dan lihat hasil timbang awal
                                Pos Rajang yang telah selesai.
                            </p>

                        </div>

                    </div>


                    {/* REFRESH */}

                    <button
                        type="button"
                        onClick={() =>
                            loadData(
                                pagination.current_page
                            )
                        }
                        disabled={loading}
                        title="Refresh Data"
                        className="
                            flex
                            h-10 w-10
                            shrink-0
                            items-center
                            justify-center
                            self-end
                            rounded-xl
                            border border-slate-200
                            bg-white
                            text-slate-600
                            shadow-sm
                            transition
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                            sm:self-auto
                        "
                    >

                        <RefreshCw
                            className={`
                                h-4 w-4
                                ${loading
                                    ? "animate-spin"
                                    : ""
                                }
                            `}
                        />

                    </button>

                </div>

            </div>


            {/* =========================================================
                ERROR
            ========================================================== */}

            {error && (

                <div
                    className="
                        flex
                        items-start
                        gap-3
                        rounded-xl
                        border border-rose-200
                        bg-rose-50
                        px-3 py-2.5
                        text-sm
                        text-rose-700
                    "
                >

                    <AlertCircle
                        className="
                            mt-0.5
                            h-4 w-4
                            shrink-0
                        "
                    />

                    <span>
                        {error}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setError("")
                        }
                        className="
                            ml-auto
                            shrink-0
                            text-rose-400
                            hover:text-rose-600
                        "
                    >

                        <X className="h-4 w-4" />

                    </button>

                </div>

            )}


            {/* =========================================================
                SUCCESS
            ========================================================== */}

            {success && (

                <div
                    className="
                        flex
                        items-center
                        gap-3
                        rounded-xl
                        border border-emerald-200
                        bg-emerald-50
                        px-3 py-2.5
                        text-sm
                        font-medium
                        text-emerald-700
                    "
                >

                    <span>
                        {success}
                    </span>


                    <button
                        type="button"
                        onClick={() =>
                            setSuccess("")
                        }
                        className="
                            ml-auto
                            text-emerald-400
                            hover:text-emerald-600
                        "
                    >

                        <X className="h-4 w-4" />

                    </button>

                </div>

            )}


            {/* =========================================================
                FILTER + CONTENT CARD
            ========================================================== */}

            <div
                className="
                    overflow-hidden
                    rounded-2xl
                    border border-slate-200
                    bg-white
                    shadow-sm
                "
            >


                {/* CARD HEADER */}

                <div
                    className="
                        border-b
                        border-slate-100
                        px-4 py-3
                        sm:px-5 sm:py-4
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-3
                            lg:flex-row
                            lg:items-center
                            lg:justify-between
                        "
                    >

                        <div>

                            <h2
                                className="
                                    text-base
                                    font-black
                                    text-slate-800
                                "
                            >
                                Daftar Hasil Timbangan
                            </h2>


                            <p
                                className="
                                    mt-0.5
                                    text-xs
                                    text-slate-400
                                "
                            >
                                Dokumen timbang awal yang
                                telah selesai.
                            </p>

                        </div>


                        {/* COUNTER */}

                        <div
                            className="
                                self-start
                                whitespace-nowrap
                                rounded-xl
                                bg-slate-100
                                px-3
                                py-2
                                text-xs
                                font-bold
                                text-slate-500
                            "
                        >
                            {pagination.total} Dokumen
                        </div>

                    </div>

                </div>


                {/* FILTER */}

                <div
                    className="
                        border-b
                        border-slate-100
                        p-4
                        sm:p-5
                    "
                >

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-3
                            md:grid-cols-2
                            lg:grid-cols-4
                        "
                    >


                        {/* SEARCH */}

                        <div
                            className="
                                md:col-span-2
                            "
                        >

                            <label
                                className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-bold
                                    text-slate-600
                                "
                            >
                                Pencarian
                            </label>


                            <div className="relative">

                                <Search
                                    className="
                                        absolute
                                        left-3
                                        top-1/2
                                        h-4 w-4
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />


                                <input
                                    type="text"
                                    value={
                                        filters.search
                                    }
                                    onChange={
                                        handleSearch
                                    }
                                    placeholder="
                                        Cari No, No WO,
                                        Jenis, S/K...
                                    "
                                    className="
                                        h-10
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        pl-9 pr-3
                                        text-sm
                                        text-slate-700
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                    "
                                />

                            </div>

                        </div>


                        {/* JENIS */}

                        <div>

                            <label
                                className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-bold
                                    text-slate-600
                                "
                            >
                                Jenis
                            </label>


                            <input
                                type="text"
                                value={
                                    filters.jenis
                                }
                                onChange={
                                    handleJenis
                                }
                                placeholder="Filter jenis..."
                                className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />

                        </div>


                        {/* S/K */}

                        <div>

                            <label
                                className="
                                    mb-1.5
                                    block
                                    text-xs
                                    font-bold
                                    text-slate-600
                                "
                            >
                                S / K
                            </label>


                            <input
                                type="text"
                                value={
                                    filters.s_k
                                }
                                onChange={
                                    handleSK
                                }
                                placeholder="Filter S/K..."
                                className="
                                    h-10
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-3
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    transition
                                    placeholder:text-slate-400
                                    focus:border-blue-500
                                    focus:ring-2
                                    focus:ring-blue-100
                                "
                            />

                        </div>

                    </div>


                    {/* RESET */}

                    <div
                        className="
                            mt-3
                            flex
                            justify-end
                        "
                    >

                        <button
                            type="button"
                            onClick={
                                resetFilter
                            }
                            className="
                                rounded-xl
                                border
                                border-slate-200
                                bg-white
                                px-3.5 py-2
                                text-xs
                                font-bold
                                text-slate-600
                                transition
                                hover:bg-slate-50
                            "
                        >
                            Reset Filter
                        </button>

                    </div>

                </div>


                {/* =====================================================
                    TABLE
                ====================================================== */}

                {loading ? (

                    <div
                        className="
                            flex
                            min-h-[260px]
                            items-center
                            justify-center
                            p-6
                        "
                    >

                        <div
                            className="
                                flex
                                items-center
                                gap-3
                                text-sm
                                text-slate-500
                            "
                        >

                            <Loader2
                                className="
                                    h-5 w-5
                                    animate-spin
                                "
                            />

                            Memuat hasil timbangan...

                        </div>

                    </div>

                ) : data.length === 0 ? (

                    <div
                        className="
                            flex
                            min-h-[260px]
                            flex-col
                            items-center
                            justify-center
                            px-5
                            text-center
                        "
                    >

                        <div
                            className="
                                flex
                                h-12 w-12
                                items-center
                                justify-center
                                rounded-xl
                                bg-slate-100
                                text-slate-400
                            "
                        >

                            <ClipboardList
                                className="h-5 w-5"
                            />

                        </div>


                        <p
                            className="
                                mt-3
                                text-sm
                                font-bold
                                text-slate-500
                            "
                        >
                            Belum ada hasil timbangan.
                        </p>


                        <p
                            className="
                                mt-1
                                text-xs
                                text-slate-400
                            "
                        >
                            Tidak ditemukan dokumen timbang
                            yang sudah selesai.
                        </p>

                    </div>

                ) : (

                    <div className="overflow-x-auto">

                        <table
                            className="
                                w-full
                                min-w-[900px]
                            "
                        >

                            <thead>

                                <tr
                                    className="
                                        border-b
                                        border-slate-200
                                        bg-slate-50
                                    "
                                >

                                    <TableHead>
                                        No
                                    </TableHead>

                                    <TableHead>
                                        No WO
                                    </TableHead>

                                    <TableHead>
                                        Jenis
                                    </TableHead>

                                    <TableHead>
                                        S/K
                                    </TableHead>

                                    <TableHead align="right">
                                        Jumlah Bal
                                    </TableHead>

                                    <TableHead align="right">
                                        Tally
                                    </TableHead>

                                    <TableHead align="right">
                                        Netto
                                    </TableHead>

                                    <TableHead align="center">
                                        Status
                                    </TableHead>

                                    <TableHead align="right">
                                        Aksi
                                    </TableHead>

                                </tr>

                            </thead>


                            <tbody>

                                {data.map((item) => (

                                    <tr
                                        key={item.id}
                                        className="
                                            border-b
                                            border-slate-100
                                            last:border-b-0
                                            transition
                                            hover:bg-slate-50
                                        "
                                    >

                                        <TableCell>
                                            <span
                                                className="
                                                    font-bold
                                                    text-slate-700
                                                "
                                            >
                                                {item.no}
                                            </span>
                                        </TableCell>


                                        <TableCell>
                                            {item.no_wo}
                                        </TableCell>


                                        <TableCell>
                                            {item.jenis}
                                        </TableCell>


                                        <TableCell>
                                            {item.s_k}
                                        </TableCell>


                                        <TableCell align="right">
                                            {Number(
                                                item.jumlah_bal ||
                                                0
                                            ).toLocaleString(
                                                "id-ID"
                                            )}
                                        </TableCell>


                                        <TableCell align="right">

                                            <span
                                                className="
                                                    font-bold
                                                    text-blue-700
                                                "
                                            >
                                                {Number(
                                                    item.jumlah_tally ||
                                                    0
                                                ).toLocaleString(
                                                    "id-ID"
                                                )}
                                            </span>

                                        </TableCell>


                                        <TableCell align="right">

                                            <span
                                                className="
                                                    font-bold
                                                    text-slate-800
                                                "
                                            >
                                                {formatNumber(
                                                    item.total_netto
                                                )}
                                            </span>

                                            <span
                                                className="
                                                    ml-1
                                                    text-[10px]
                                                    text-slate-400
                                                "
                                            >
                                                kg
                                            </span>

                                        </TableCell>


                                        <TableCell align="center">

                                            <span
                                                className="
                                                    inline-flex
                                                    rounded-full
                                                    bg-emerald-100
                                                    px-2.5 py-1
                                                    text-[10px]
                                                    font-black
                                                    text-emerald-700
                                                "
                                            >
                                                Completed
                                            </span>

                                        </TableCell>


                                        <TableCell align="right">

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleDetail(
                                                        item.id
                                                    )
                                                }
                                                className="
                                                    inline-flex
                                                    h-9
                                                    items-center
                                                    gap-1.5
                                                    rounded-lg
                                                    bg-blue-900
                                                    px-3
                                                    text-xs
                                                    font-bold
                                                    text-white
                                                    transition
                                                    hover:bg-slate-800
                                                "
                                            >

                                                <Eye
                                                    className="
                                                        h-3.5 w-3.5
                                                    "
                                                />

                                                Detail

                                            </button>

                                        </TableCell>

                                    </tr>

                                ))}

                            </tbody>

                        </table>

                    </div>

                )}


                {/* =====================================================
                    PAGINATION
                ====================================================== */}

                {!loading &&
                    data.length > 0 && (

                        <div
                            className="
                                flex
                                flex-col
                                gap-3
                                border-t
                                border-slate-100
                                px-4 py-3
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                sm:px-5
                            "
                        >

                            <div
                                className="
                                    text-xs
                                    text-slate-500
                                "
                            >
                                Halaman{" "}

                                <span
                                    className="
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    {pagination.current_page}
                                </span>

                                {" "}dari{" "}

                                <span
                                    className="
                                        font-bold
                                        text-slate-700
                                    "
                                >
                                    {pagination.last_page}
                                </span>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                "
                            >

                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            pagination.current_page -
                                            1
                                        )
                                    }
                                    disabled={
                                        pagination.current_page <=
                                        1
                                    }
                                    className="
                                        flex
                                        h-9 w-9
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-slate-200
                                        bg-white
                                        text-slate-600
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >

                                    <ChevronLeft
                                        className="h-4 w-4"
                                    />

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        goToPage(
                                            pagination.current_page +
                                            1
                                        )
                                    }
                                    disabled={
                                        pagination.current_page >=
                                        pagination.last_page
                                    }
                                    className="
                                        flex
                                        h-9 w-9
                                        items-center
                                        justify-center
                                        rounded-lg
                                        border
                                        border-slate-200
                                        bg-white
                                        text-slate-600
                                        transition
                                        hover:bg-slate-50
                                        disabled:cursor-not-allowed
                                        disabled:opacity-40
                                    "
                                >

                                    <ChevronRight
                                        className="h-4 w-4"
                                    />

                                </button>

                            </div>

                        </div>

                    )}

            </div>


            {/* =========================================================
                DETAIL MODAL
            ========================================================== */}

            {selectedId && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        flex
                        items-center
                        justify-center
                        bg-slate-900/40
                        p-3
                        backdrop-blur-sm
                        sm:p-4
                    "
                    onMouseDown={(event) => {

                        if (
                            event.target ===
                            event.currentTarget
                        ) {
                            closeDetail();
                        }

                    }}
                >

                    <div
                        className="
                            flex
                            max-h-[94vh]
                            w-full
                            max-w-6xl
                            flex-col
                            overflow-hidden
                            rounded-2xl
                            border
                            border-slate-200
                            bg-white
                            shadow-2xl
                        "
                    >


                        {/* MODAL HEADER */}

                        <div
                            className="
                                relative
                                flex
                                items-center
                                justify-between
                                border-b
                                border-slate-100
                                bg-white
                                px-4 py-3
                                sm:px-5
                            "
                        >

                            <div
                                className="
                                    absolute
                                    inset-x-0
                                    top-0
                                    h-1
                                    bg-gradient-to-r
                                    from-blue-700
                                    via-indigo-500
                                    to-amber-400
                                "
                            />


                            <div
                                className="
                                    flex
                                    min-w-0
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        flex
                                        h-10 w-10
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-blue-900
                                        text-white
                                    "
                                >

                                    <Scale
                                        className="h-5 w-5"
                                    />

                                </div>


                                <div className="min-w-0">

                                    <h2
                                        className="
                                            text-base
                                            font-black
                                            text-slate-800
                                        "
                                    >
                                        Detail Hasil Timbangan
                                    </h2>


                                    <p
                                        className="
                                            mt-0.5
                                            text-xs
                                            text-slate-400
                                        "
                                    >
                                        Rincian dokumen dan tally.
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeDetail
                                }
                                className="
                                    flex
                                    h-9 w-9
                                    shrink-0
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                "
                            >

                                <X
                                    className="h-5 w-5"
                                />

                            </button>

                        </div>


                        {/* MODAL BODY */}

                        <div
                            className="
                                flex-1
                                overflow-y-auto
                                p-4
                                sm:p-5
                            "
                        >

                            {detailLoading ? (

                                <div
                                    className="
                                        flex
                                        min-h-[260px]
                                        items-center
                                        justify-center
                                    "
                                >

                                    <div
                                        className="
                                            flex
                                            items-center
                                            gap-3
                                            text-sm
                                            text-slate-500
                                        "
                                    >

                                        <Loader2
                                            className="
                                                h-5 w-5
                                                animate-spin
                                            "
                                        />

                                        Memuat detail...

                                    </div>

                                </div>

                            ) : detailError ? (

                                <div
                                    className="
                                        flex
                                        items-start
                                        gap-3
                                        rounded-xl
                                        border
                                        border-rose-200
                                        bg-rose-50
                                        px-3 py-2.5
                                        text-sm
                                        text-rose-700
                                    "
                                >

                                    <AlertCircle
                                        className="
                                            mt-0.5
                                            h-4 w-4
                                            shrink-0
                                        "
                                    />

                                    {detailError}

                                </div>

                            ) : detail ? (

                                <div
                                    className="
                                        space-y-4
                                        sm:space-y-5
                                    "
                                >


                                    {/* DOCUMENT INFORMATION */}

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-3
                                            sm:grid-cols-2
                                            lg:grid-cols-4
                                        "
                                    >

                                        <InfoCard
                                            icon={Package}
                                            label="No WO"
                                            value={
                                                detail
                                                    .dokumen_timbang_awal
                                                    ?.no_wo
                                            }
                                        />


                                        <InfoCard
                                            icon={Scale}
                                            label="Jenis"
                                            value={
                                                detail
                                                    .dokumen_timbang_awal
                                                    ?.jenis
                                            }
                                        />


                                        <InfoCard
                                            icon={Package}
                                            label="S / K"
                                            value={
                                                detail
                                                    .dokumen_timbang_awal
                                                    ?.s_k
                                            }
                                        />


                                        <InfoCard
                                            icon={CalendarDays}
                                            label="Tanggal"
                                            value={formatDate(
                                                detail
                                                    .dokumen_timbang_awal
                                                    ?.updated_at
                                            )}
                                        />

                                    </div>


                                    {/* SUMMARY */}

                                    <div
                                        className="
                                            grid
                                            grid-cols-1
                                            gap-3
                                            sm:grid-cols-3
                                        "
                                    >

                                        <SummaryCard
                                            icon={Package}
                                            label="Jumlah Tally"
                                            value={
                                                detail
                                                    .ringkasan
                                                    ?.jumlah_tally ||
                                                0
                                            }
                                        />


                                        <SummaryCard
                                            icon={Weight}
                                            label="Total Bruto"
                                            value={`
                                                ${formatNumber(
                                                    detail
                                                        .ringkasan
                                                        ?.total_bruto
                                                )} kg
                                            `}
                                        />


                                        <SummaryCard
                                            icon={Scale}
                                            label="Total Netto"
                                            value={`
                                                ${formatNumber(
                                                    detail
                                                        .ringkasan
                                                        ?.total_netto
                                                )} kg
                                            `}
                                        />

                                    </div>


                                    {/* DETAIL TALLY */}

                                    <div
                                        className="
                                            overflow-hidden
                                            rounded-xl
                                            border
                                            border-slate-200
                                        "
                                    >

                                        <div
                                            className="
                                                border-b
                                                border-slate-100
                                                bg-slate-50
                                                px-4 py-3
                                            "
                                        >

                                            <h3
                                                className="
                                                    text-sm
                                                    font-black
                                                    text-slate-800
                                                "
                                            >
                                                Rincian Tally
                                            </h3>

                                        </div>


                                        <div className="overflow-x-auto">

                                            <table
                                                className="
                                                    w-full
                                                    min-w-[650px]
                                                "
                                            >

                                                <thead>

                                                    <tr
                                                        className="
                                                            border-b
                                                            border-slate-200
                                                        "
                                                    >

                                                        <TableHead>
                                                            Tally
                                                        </TableHead>

                                                        <TableHead align="right">
                                                            Bruto
                                                        </TableHead>

                                                        <TableHead align="right">
                                                            Tara
                                                        </TableHead>

                                                        <TableHead align="right">
                                                            Netto
                                                        </TableHead>

                                                        <TableHead>
                                                            Waktu Timbang
                                                        </TableHead>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {(detail.details || [])
                                                        .map(
                                                            (item) => (

                                                                <tr
                                                                    key={
                                                                        item.id
                                                                    }
                                                                    className="
                                                                        border-b
                                                                        border-slate-100
                                                                        last:border-b-0
                                                                        hover:bg-slate-50
                                                                    "
                                                                >

                                                                    <TableCell>

                                                                        <span
                                                                            className="
                                                                                font-bold
                                                                                text-blue-700
                                                                            "
                                                                        >
                                                                            {
                                                                                item.nomor_tally
                                                                            }
                                                                        </span>

                                                                    </TableCell>


                                                                    <TableCell align="right">
                                                                        {formatNumber(
                                                                            item.berat_bruto
                                                                        )}{" "}
                                                                        kg
                                                                    </TableCell>


                                                                    <TableCell align="right">
                                                                        {formatNumber(
                                                                            item.tara
                                                                        )}{" "}
                                                                        kg
                                                                    </TableCell>


                                                                    <TableCell align="right">

                                                                        <span
                                                                            className="
                                                                                font-bold
                                                                                text-slate-800
                                                                            "
                                                                        >
                                                                            {formatNumber(
                                                                                item.berat_netto
                                                                            )}{" "}
                                                                            kg
                                                                        </span>

                                                                    </TableCell>


                                                                    <TableCell>
                                                                        {formatDate(
                                                                            item.waktu_timbang
                                                                        )}
                                                                    </TableCell>

                                                                </tr>

                                                            )
                                                        )}

                                                </tbody>

                                            </table>

                                        </div>

                                    </div>

                                </div>

                            ) : null}

                        </div>


                        {/* MODAL FOOTER */}

                        <div
                            className="
                                flex
                                justify-end
                                border-t
                                border-slate-100
                                bg-slate-50
                                px-4 py-3
                                sm:px-5
                            "
                        >

                            <button
                                type="button"
                                onClick={
                                    closeDetail
                                }
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4 py-2.5
                                    text-xs
                                    font-bold
                                    text-slate-600
                                    transition
                                    hover:bg-slate-50
                                "
                            >
                                Tutup
                            </button>

                        </div>

                    </div>

                </div>

            )}

        </div>

    );
}


/*
|--------------------------------------------------------------------------
| TABLE HEAD
|--------------------------------------------------------------------------
*/

const TableHead = ({
    children,
    align = "left",
}) => {

    const alignment = {
        left: "text-left",
        right: "text-right",
        center: "text-center",
    }[align];


    return (

        <th
            className={`
                whitespace-nowrap
                px-3 py-2.5
                text-[10px]
                font-black
                uppercase
                tracking-wider
                text-slate-400
                sm:px-4
                ${alignment}
            `}
        >
            {children}
        </th>

    );
};


/*
|--------------------------------------------------------------------------
| TABLE CELL
|--------------------------------------------------------------------------
*/

const TableCell = ({
    children,
    align = "left",
}) => {

    const alignment = {
        left: "text-left",
        right: "text-right",
        center: "text-center",
    }[align];


    return (

        <td
            className={`
                whitespace-nowrap
                px-3 py-3
                text-xs
                text-slate-600
                sm:px-4
                ${alignment}
            `}
        >
            {children}
        </td>

    );
};


/*
|--------------------------------------------------------------------------
| INFO CARD
|--------------------------------------------------------------------------
*/

const InfoCard = ({
    icon: Icon,
    label,
    value,
}) => {

    return (

        <div
            className="
                rounded-xl
                border
                border-slate-200
                bg-slate-50
                p-3
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                <Icon
                    className="
                        h-4 w-4
                        text-blue-700
                    "
                />


                <span
                    className="
                        text-[10px]
                        font-black
                        uppercase
                        tracking-wide
                        text-slate-400
                    "
                >
                    {label}
                </span>

            </div>


            <div
                className="
                    mt-2
                    break-words
                    text-sm
                    font-bold
                    text-slate-800
                "
            >
                {value || "-"}
            </div>

        </div>

    );
};


/*
|--------------------------------------------------------------------------
| SUMMARY CARD
|--------------------------------------------------------------------------
*/

const SummaryCard = ({
    icon: Icon,
    label,
    value,
}) => {

    return (

        <div
            className="
                rounded-xl
                border
                border-slate-200
                bg-white
                p-3
                shadow-sm
            "
        >

            <div
                className="
                    flex
                    items-center
                    gap-2
                "
            >

                <div
                    className="
                        flex
                        h-8 w-8
                        shrink-0
                        items-center
                        justify-center
                        rounded-lg
                        bg-blue-50
                    "
                >

                    <Icon
                        className="
                            h-4 w-4
                            text-blue-700
                        "
                    />

                </div>


                <span
                    className="
                        text-xs
                        font-bold
                        text-slate-500
                    "
                >
                    {label}
                </span>

            </div>


            <div
                className="
                    mt-2
                    text-lg
                    font-black
                    text-slate-800
                "
            >
                {value}
            </div>

        </div>

    );
};