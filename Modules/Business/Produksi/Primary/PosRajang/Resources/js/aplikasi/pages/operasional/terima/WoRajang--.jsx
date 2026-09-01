import React, {
    useCallback,
    useEffect,
    useState,
} from 'react';

import {
    Plus,
    Search,
    Edit,
    Trash2,
    RotateCcw,
    X,
    RefreshCw,
    FileText,
    ClipboardList,
    CheckCircle2,
    Clock3,
    Ban,
    Save,
} from 'lucide-react';

import PrimaryPos1RajangWoService
    from '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/services/PrimaryPos1RajangWoService';


export default function WoManagement() {

    /*
    |--------------------------------------------------------------------------
    | STATE DATA
    |--------------------------------------------------------------------------
    */

    const [items, setItems] = useState([]);

    const [loading, setLoading] = useState(false);

    const [saving, setSaving] = useState(false);

    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');


    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] = useState('');

    const [statusFilter, setStatusFilter] = useState('all');

    const [showTrash, setShowTrash] = useState(false);


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const [page, setPage] = useState(1);

    const [perPage, setPerPage] = useState(15);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
        from: 0,
        to: 0,
    });


    /*
    |--------------------------------------------------------------------------
    | MODAL
    |--------------------------------------------------------------------------
    */

    const [showModal, setShowModal] = useState(false);

    const [editingId, setEditingId] = useState(null);


    /*
    |--------------------------------------------------------------------------
    | FORM
    |--------------------------------------------------------------------------
    */

    const emptyForm = {
        no_wo: '',
        tanggal_wo: '',
        aturan: '',
        jumlah_bal: '',
        status: 'draft',
        keterangan: '',
    };


    const [form, setForm] = useState({
        ...emptyForm,
    });


    /*
    |--------------------------------------------------------------------------
    | HELPERS
    |--------------------------------------------------------------------------
    */

    const clearMessages = () => {
        setError('');
        setSuccess('');
    };


    const getErrorMessage = (err) => {

        console.error(
            'FULL ERROR OBJECT:',
            err
        );

        const responseData =
            err?.response?.data ?? null;


        /*
        |----------------------------------------------------------------------
        | Laravel validation errors
        |----------------------------------------------------------------------
        */

        if (
            responseData?.errors &&
            typeof responseData.errors === 'object'
        ) {

            const messages =
                Object.values(
                    responseData.errors
                )
                    .flat()
                    .filter(Boolean);


            if (messages.length > 0) {

                return messages.join(' ');

            }

        }


        /*
        |----------------------------------------------------------------------
        | Laravel message
        |----------------------------------------------------------------------
        */

        if (
            typeof responseData?.message === 'string' &&
            responseData.message.trim() !== ''
        ) {

            return responseData.message;

        }


        /*
        |----------------------------------------------------------------------
        | Backend string
        |----------------------------------------------------------------------
        */

        if (
            typeof responseData === 'string' &&
            responseData.trim() !== ''
        ) {

            return responseData;

        }


        /*
        |----------------------------------------------------------------------
        | Axios status fallback
        |----------------------------------------------------------------------
        */

        if (
            err?.response?.status
        ) {

            return `Server mengembalikan HTTP ${err.response.status}.`;

        }


        /*
        |----------------------------------------------------------------------
        | JavaScript Error
        |----------------------------------------------------------------------
        */

        if (
            typeof err?.message === 'string' &&
            err.message.trim() !== ''
        ) {

            return err.message;

        }


        return 'Terjadi kesalahan. Silakan periksa log server.';
    };


    /*
    |--------------------------------------------------------------------------
    | LOAD DATA
    |--------------------------------------------------------------------------
    */

    const loadData = useCallback(
        async () => {

            setLoading(true);

            clearMessages();

            try {

                const response =
                    await PrimaryPos1RajangWoService.getAll({

                        page,

                        per_page:
                            perPage,

                        search:
                            search.trim(),

                        status:
                            statusFilter,

                        trash:
                            showTrash ? 1 : 0,

                    });


                if (
                    !response?.success
                ) {

                    throw new Error(
                        response?.message ||
                        'Gagal mengambil data WO.'
                    );

                }


                const data =
                    response.data;


                setItems(
                    Array.isArray(
                        data?.data
                    )
                        ? data.data
                        : []
                );


                setPagination({

                    current_page:
                        data?.current_page ??
                        1,

                    last_page:
                        data?.last_page ??
                        1,

                    total:
                        data?.total ??
                        0,

                    from:
                        data?.from ??
                        0,

                    to:
                        data?.to ??
                        0,

                });

            } catch (err) {

                console.error(
                    'WO LOAD ERROR:',
                    err
                );

                setError(
                    getErrorMessage(err)
                );

                setItems([]);

            } finally {

                setLoading(false);

            }

        },
        [
            page,
            perPage,
            search,
            statusFilter,
            showTrash,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INITIAL / FILTER LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadData();

    }, [loadData]);


    /*
    |--------------------------------------------------------------------------
    | SEARCH DELAY
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        const timer =
            setTimeout(() => {

                setPage(1);

            }, 400);


        return () => {

            clearTimeout(timer);

        };

    }, [
        search,
        statusFilter,
        showTrash,
        perPage,
    ]);


    /*
    |--------------------------------------------------------------------------
    | FORM CHANGE
    |--------------------------------------------------------------------------
    */

    const handleChange = (
        e
    ) => {

        const {
            name,
            value,
        } = e.target;


        setForm(prev => ({
            ...prev,
            [name]: value,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN CREATE
    |--------------------------------------------------------------------------
    */

    const openCreate = () => {

        clearMessages();

        setEditingId(null);

        setForm({
            ...emptyForm,
        });

        setShowModal(true);

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT
    |--------------------------------------------------------------------------
    */

    const openEdit = (
        item
    ) => {

        clearMessages();

        setEditingId(
            item.id
        );


        setForm({

            no_wo:
                item.no_wo ?? '',

            tanggal_wo:
                item.tanggal_wo
                    ? String(
                        item.tanggal_wo
                    ).substring(
                        0,
                        10
                    )
                    : '',

            aturan:
                item.aturan ?? '',

            jumlah_bal:
                item.jumlah_bal ?? '',

            status:
                item.status ??
                'draft',

            keterangan:
                item.keterangan ??
                '',

        });


        setShowModal(true);

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE MODAL
    |--------------------------------------------------------------------------
    */

    const closeModal = () => {

        if (saving) {

            return;

        }

        setShowModal(false);

        setEditingId(null);

        setForm({
            ...emptyForm,
        });

    };


    /*
    |--------------------------------------------------------------------------
    | SAVE
    |--------------------------------------------------------------------------
    */

    const handleSubmit = async (
        e
    ) => {

        e.preventDefault();

        clearMessages();


        /*
        |----------------------------------------------------------------------
        | VALIDASI NO WO
        |----------------------------------------------------------------------
        */

        if (
            !form.no_wo.trim()
        ) {

            setError(
                'No. WO wajib diisi.'
            );

            return;

        }


        /*
        |----------------------------------------------------------------------
        | VALIDASI ATURAN
        |----------------------------------------------------------------------
        */

        if (
            !form.aturan.trim()
        ) {

            setError(
                'Aturan wajib diisi.'
            );

            return;

        }


        /*
        |----------------------------------------------------------------------
        | VALIDASI JUMLAH BAL
        |----------------------------------------------------------------------
        */

        if (
            form.jumlah_bal === ''
        ) {

            setError(
                'Jumlah bal wajib diisi.'
            );

            return;

        }


        const jumlahBal =
            Number(
                form.jumlah_bal
            );


        if (
            !Number.isInteger(
                jumlahBal
            ) ||
            jumlahBal < 1
        ) {

            setError(
                'Jumlah bal harus berupa angka bulat minimal 1.'
            );

            return;

        }


        /*
        |----------------------------------------------------------------------
        | PAYLOAD
        |----------------------------------------------------------------------
        */

        const payload = {

            no_wo:
                form.no_wo.trim(),

            tanggal_wo:
                form.tanggal_wo ||
                null,

            aturan:
                form.aturan.trim(),

            jumlah_bal:
                jumlahBal,

            status:
                form.status,

            keterangan:
                form.keterangan.trim() ||
                null,

        };


        setSaving(true);


        try {

            let response;


            /*
            |------------------------------------------------------------------
            | UPDATE
            |------------------------------------------------------------------
            */

            if (editingId) {

                response =
                    await PrimaryPos1RajangWoService.update(
                        editingId,
                        payload
                    );

            }


            /*
            |------------------------------------------------------------------
            | CREATE
            |------------------------------------------------------------------
            */

            else {

                response =
                    await PrimaryPos1RajangWoService.create(
                        payload
                    );

            }


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    'Gagal menyimpan WO.'
                );

            }


            setSuccess(
                editingId
                    ? 'WO berhasil diperbarui.'
                    : 'WO berhasil dibuat.'
            );


            /*
            |------------------------------------------------------------------
            | CLOSE MODAL
            |------------------------------------------------------------------
            */

            setShowModal(false);

            setEditingId(null);

            setForm({
                ...emptyForm,
            });


            await loadData();

        } catch (err) {

            console.error(
                'WO SAVE ERROR:',
                err
            );

            setError(
                getErrorMessage(err)
            );

        } finally {

            setSaving(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | DELETE
    |--------------------------------------------------------------------------
    */

    const handleDelete = async (
        item
    ) => {

        clearMessages();


        const yakin =
            window.confirm(
                `Hapus WO "${item.no_wo}"?\n\n` +
                `Data akan masuk ke tempat sampah dan masih dapat dipulihkan.`
            );


        if (!yakin) {

            return;

        }


        try {

            setLoading(true);


            const response =
                await PrimaryPos1RajangWoService.delete(
                    item.id
                );


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    'Gagal menghapus WO.'
                );

            }


            setSuccess(
                `WO ${item.no_wo} berhasil dihapus.`
            );


            await loadData();

        } catch (err) {

            console.error(
                'WO DELETE ERROR:',
                err
            );

            setError(
                getErrorMessage(err)
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | RESTORE
    |--------------------------------------------------------------------------
    */

    const handleRestore = async (
        item
    ) => {

        clearMessages();


        const yakin =
            window.confirm(
                `Pulihkan WO "${item.no_wo}"?`
            );


        if (!yakin) {

            return;

        }


        try {

            setLoading(true);


            const response =
                await PrimaryPos1RajangWoService.restore(
                    item.id
                );


            if (
                !response?.success
            ) {

                throw new Error(
                    response?.message ||
                    'Gagal memulihkan WO.'
                );

            }


            setSuccess(
                `WO ${item.no_wo} berhasil dipulihkan.`
            );


            await loadData();

        } catch (err) {

            console.error(
                'WO RESTORE ERROR:',
                err
            );

            setError(
                getErrorMessage(err)
            );

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | STATUS BADGE
    |--------------------------------------------------------------------------
    */

    const renderStatus = (
        status
    ) => {

        const config = {

            draft: {
                label: 'Draft',
                className:
                    'bg-amber-100 text-amber-700',
                icon: Clock3,
            },

            open: {
                label: 'Open',
                className:
                    'bg-blue-100 text-blue-700',
                icon: ClipboardList,
            },

            closed: {
                label: 'Closed',
                className:
                    'bg-emerald-100 text-emerald-700',
                icon: CheckCircle2,
            },

            cancelled: {
                label: 'Cancelled',
                className:
                    'bg-rose-100 text-rose-700',
                icon: Ban,
            },

        };


        const current =
            config[status] ||
            config.draft;


        const Icon =
            current.icon;


        return (

            <span
                className={`
                    inline-flex
                    items-center
                    gap-1
                    px-2
                    py-1
                    rounded-full
                    text-[10px]
                    font-bold
                    uppercase
                    ${current.className}
                `}
            >

                <Icon
                    size={12}
                />

                {current.label}

            </span>

        );

    };


    /*
    |--------------------------------------------------------------------------
    | FORMAT DATE
    |--------------------------------------------------------------------------
    */

    const formatDate = (
        value
    ) => {

        if (!value) {

            return '-';

        }


        const date =
            new Date(value);


        if (
            Number.isNaN(
                date.getTime()
            )
        ) {

            return String(
                value
            ).substring(
                0,
                10
            );

        }


        return date.toLocaleDateString(
            'id-ID',
            {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }
        );

    };


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const goToPage = (
        target
    ) => {

        const next =
            Math.max(
                1,
                Math.min(
                    target,
                    pagination.last_page
                )
            );


        setPage(next);

    };


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div
            className="
                max-w-7xl
                mx-auto
                w-full
                p-4
                md:p-6
                space-y-4
            "
        >

            {/* =========================================================
                HEADER
            ========================================================== */}

            <div
                className="
                    bg-gradient-to-r
                    from-blue-900
                    via-indigo-800
                    to-amber-600
                    rounded-2xl
                    p-5
                    md:p-6
                    text-white
                    shadow-lg
                    border
                    border-slate-200
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        md:flex-row
                        md:items-center
                        md:justify-between
                        gap-4
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-4
                        "
                    >

                        <div
                            className="
                                w-12
                                h-12
                                rounded-xl
                                bg-white/90
                                flex
                                items-center
                                justify-center
                                shadow
                            "
                        >

                            <ClipboardList
                                size={26}
                                className="
                                    text-blue-900
                                "
                            />

                        </div>


                        <div>

                            <h1
                                className="
                                    text-xl
                                    md:text-2xl
                                    font-extrabold
                                "
                            >
                                Manage Work Order
                            </h1>


                            <p
                                className="
                                    text-xs
                                    md:text-sm
                                    text-blue-100
                                    mt-1
                                "
                            >
                                Primary Pos 1 — Rajang
                            </p>

                        </div>

                    </div>


                    {!showTrash && (

                        <button
                            type="button"
                            onClick={
                                openCreate
                            }
                            className="
                                inline-flex
                                items-center
                                justify-center
                                gap-2
                                px-4
                                py-2.5
                                bg-white
                                text-blue-900
                                rounded-xl
                                font-bold
                                text-sm
                                shadow
                                hover:bg-slate-100
                                active:scale-95
                                transition
                            "
                        >

                            <Plus
                                size={18}
                            />

                            Tambah WO

                        </button>

                    )}

                </div>

            </div>


            {/* =========================================================
                ALERT ERROR
            ========================================================== */}

            {error && (

                <div
                    className="
                        flex
                        items-start
                        justify-between
                        gap-3
                        p-3
                        rounded-xl
                        border
                        border-rose-200
                        bg-rose-50
                        text-rose-700
                        text-sm
                    "
                >

                    <div>

                        <strong>
                            Terjadi kesalahan
                        </strong>

                        <div
                            className="
                                mt-1
                                whitespace-pre-wrap
                                break-words
                            "
                        >
                            {error}
                        </div>

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                        className="
                            p-1
                            rounded-lg
                            hover:bg-rose-100
                            shrink-0
                        "
                    >

                        <X
                            size={16}
                        />

                    </button>

                </div>

            )}


            {/* =========================================================
                ALERT SUCCESS
            ========================================================== */}

            {success && (

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        gap-3
                        p-3
                        rounded-xl
                        border
                        border-emerald-200
                        bg-emerald-50
                        text-emerald-700
                        text-sm
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <CheckCircle2
                            size={18}
                        />

                        {success}

                    </div>


                    <button
                        type="button"
                        onClick={() =>
                            setSuccess('')
                        }
                        className="
                            p-1
                            rounded-lg
                            hover:bg-emerald-100
                        "
                    >

                        <X
                            size={16}
                        />

                    </button>

                </div>

            )}


            {/* =========================================================
                FILTER CARD
            ========================================================== */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    p-4
                "
            >

                <div
                    className="
                        flex
                        flex-col
                        lg:flex-row
                        lg:items-center
                        gap-3
                    "
                >

                    {/* SEARCH */}

                    <div
                        className="
                            relative
                            flex-1
                        "
                    >

                        <Search
                            size={18}
                            className="
                                absolute
                                left-3
                                top-1/2
                                -translate-y-1/2
                                text-slate-400
                            "
                        />

                        <input
                            type="text"
                            value={search}
                            onChange={e =>
                                setSearch(
                                    e.target.value
                                )
                            }
                            placeholder="Cari nomor WO..."
                            className="
                                w-full
                                pl-10
                                pr-4
                                py-2.5
                                border
                                border-slate-300
                                rounded-xl
                                text-sm
                                outline-none
                                focus:ring-2
                                focus:ring-blue-200
                                focus:border-blue-500
                            "
                        />

                    </div>


                    {/* STATUS */}

                    <select
                        value={
                            statusFilter
                        }
                        onChange={e => {

                            setStatusFilter(
                                e.target.value
                            );

                            setPage(1);

                        }}
                        className="
                            w-full
                            lg:w-44
                            px-3
                            py-2.5
                            border
                            border-slate-300
                            rounded-xl
                            text-sm
                            bg-white
                            outline-none
                            focus:ring-2
                            focus:ring-blue-200
                            focus:border-blue-500
                        "
                    >

                        <option value="all">
                            Semua Status
                        </option>

                        <option value="draft">
                            Draft
                        </option>

                        <option value="open">
                            Open
                        </option>

                        <option value="closed">
                            Closed
                        </option>

                        <option value="cancelled">
                            Cancelled
                        </option>

                    </select>


                    {/* TRASH */}

                    <button
                        type="button"
                        onClick={() => {

                            setShowTrash(
                                prev => !prev
                            );

                            setPage(1);

                        }}
                        className={`
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-4
                            py-2.5
                            rounded-xl
                            font-bold
                            text-sm
                            transition
                            ${
                                showTrash
                                    ? 'bg-rose-600 text-white hover:bg-rose-700'
                                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }
                        `}
                    >

                        {showTrash ? (

                            <>
                                <RotateCcw
                                    size={17}
                                />

                                Data Aktif
                            </>

                        ) : (

                            <>
                                <Trash2
                                    size={17}
                                />

                                Trash
                            </>

                        )}

                    </button>


                    {/* REFRESH */}

                    <button
                        type="button"
                        onClick={
                            loadData
                        }
                        disabled={
                            loading
                        }
                        className="
                            inline-flex
                            items-center
                            justify-center
                            gap-2
                            px-3
                            py-2.5
                            rounded-xl
                            bg-blue-50
                            text-blue-700
                            font-bold
                            hover:bg-blue-100
                            disabled:opacity-50
                            transition
                        "
                        title="Refresh"
                    >

                        <RefreshCw
                            size={17}
                            className={
                                loading
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        <span
                            className="
                                hidden
                                sm:inline
                            "
                        >
                            Refresh
                        </span>

                    </button>

                </div>

            </div>


            {/* =========================================================
                CONTENT
            ========================================================== */}

            <div
                className="
                    bg-white
                    rounded-2xl
                    border
                    border-slate-200
                    shadow-sm
                    overflow-hidden
                "
            >

                {/* CONTENT HEADER */}

                <div
                    className="
                        px-4
                        py-3
                        border-b
                        border-slate-200
                        flex
                        flex-col
                        sm:flex-row
                        sm:items-center
                        sm:justify-between
                        gap-2
                    "
                >

                    <div
                        className="
                            flex
                            items-center
                            gap-2
                        "
                    >

                        <FileText
                            size={18}
                            className="
                                text-blue-700
                            "
                        />

                        <span
                            className="
                                font-bold
                                text-slate-700
                            "
                        >
                            {showTrash
                                ? 'WO Terhapus'
                                : 'Daftar Work Order'
                            }
                        </span>

                    </div>


                    <div
                        className="
                            text-xs
                            text-slate-500
                        "
                    >

                        Menampilkan{' '}

                        <strong>
                            {pagination.from}
                        </strong>

                        {' - '}

                        <strong>
                            {pagination.to}
                        </strong>

                        {' dari '}

                        <strong>
                            {pagination.total}
                        </strong>

                        {' data'}

                    </div>

                </div>


                {/* LOADING */}

                {loading ? (

                    <div
                        className="
                            py-16
                            flex
                            flex-col
                            items-center
                            justify-center
                            text-slate-400
                        "
                    >

                        <RefreshCw
                            size={28}
                            className="
                                animate-spin
                                mb-3
                                text-blue-500
                            "
                        />

                        <span
                            className="
                                text-sm
                                font-medium
                            "
                        >
                            Memuat data WO...
                        </span>

                    </div>

                ) : items.length === 0 ? (

                    /* EMPTY */

                    <div
                        className="
                            py-16
                            px-4
                            text-center
                            text-slate-400
                        "
                    >

                        <div
                            className="
                                mx-auto
                                w-14
                                h-14
                                rounded-2xl
                                bg-slate-100
                                flex
                                items-center
                                justify-center
                                mb-3
                            "
                        >

                            <FileText
                                size={26}
                                className="
                                    text-slate-400
                                "
                            />

                        </div>


                        <div
                            className="
                                font-bold
                                text-slate-600
                            "
                        >
                            Tidak ada data WO
                        </div>


                        <div
                            className="
                                text-xs
                                mt-1
                            "
                        >
                            {showTrash
                                ? 'Belum ada WO di tempat sampah.'
                                : 'Belum ada WO yang sesuai filter.'
                            }
                        </div>

                    </div>

                ) : (

                    <>

                        {/* =================================================
                            DESKTOP TABLE
                        ================================================== */}

                        <div
                            className="
                                hidden
                                md:block
                                overflow-x-auto
                            "
                        >

                            <table
                                className="
                                    w-full
                                    text-sm
                                "
                            >

                                <thead>

                                    <tr
                                        className="
                                            bg-slate-50
                                            border-b
                                            border-slate-200
                                        "
                                    >

                                        <th
                                            className="
                                                px-4
                                                py-3
                                                text-left
                                                text-xs
                                                font-bold
                                                text-slate-500
                                                uppercase
                                            "
                                        >
                                            No. WO
                                        </th>

                                        <th
                                            className="
                                                px-4
                                                py-3
                                                text-left
                                                text-xs
                                                font-bold
                                                text-slate-500
                                                uppercase
                                            "
                                        >
                                            Tanggal
                                        </th>

                                        <th
                                            className="
                                                px-4
                                                py-3
                                                text-left
                                                text-xs
                                                font-bold
                                                text-slate-500
                                                uppercase
                                            "
                                        >
                                            Aturan
                                        </th>

                                        <th
                                            className="
                                                px-4
                                                py-3
                                                text-center
                                                text-xs
                                                font-bold
                                                text-slate-500
                                                uppercase
                                            "
                                        >
                                            Bal
                                        </th>

                                        <th
                                            className="
                                                px-4
                                                py-3
                                                text-left
                                                text-xs
                                                font-bold
                                                text-slate-500
                                                uppercase
                                            "
                                        >
                                            Status
                                        </th>

                                        <th
                                            className="
                                                px-4
                                                py-3
                                                text-right
                                                text-xs
                                                font-bold
                                                text-slate-500
                                                uppercase
                                            "
                                        >
                                            Aksi
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {items.map(
                                        item => (

                                            <tr
                                                key={
                                                    item.id
                                                }
                                                className="
                                                    border-b
                                                    border-slate-100
                                                    hover:bg-blue-50/40
                                                    transition
                                                "
                                            >

                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                        font-bold
                                                        text-blue-700
                                                    "
                                                >
                                                    {item.no_wo}
                                                </td>


                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                        text-slate-600
                                                    "
                                                >
                                                    {formatDate(
                                                        item.tanggal_wo
                                                    )}
                                                </td>


                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                        text-slate-700
                                                    "
                                                >
                                                    {item.aturan ||
                                                        '-'}
                                                </td>


                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                        text-center
                                                        font-bold
                                                        text-slate-700
                                                    "
                                                >
                                                    {item.jumlah_bal ??
                                                        '-'}
                                                </td>


                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                    "
                                                >
                                                    {renderStatus(
                                                        item.status
                                                    )}
                                                </td>


                                                <td
                                                    className="
                                                        px-4
                                                        py-3
                                                    "
                                                >

                                                    <div
                                                        className="
                                                            flex
                                                            justify-end
                                                            items-center
                                                            gap-1.5
                                                        "
                                                    >

                                                        {showTrash ? (

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleRestore(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1
                                                                    px-3
                                                                    py-1.5
                                                                    rounded-lg
                                                                    bg-emerald-50
                                                                    text-emerald-700
                                                                    hover:bg-emerald-100
                                                                    text-xs
                                                                    font-bold
                                                                "
                                                            >

                                                                <RotateCcw
                                                                    size={14}
                                                                />

                                                                Restore

                                                            </button>

                                                        ) : (

                                                            <>

                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        openEdit(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="
                                                                        p-2
                                                                        rounded-lg
                                                                        bg-blue-50
                                                                        text-blue-700
                                                                        hover:bg-blue-100
                                                                    "
                                                                    title="Edit WO"
                                                                >

                                                                    <Edit
                                                                        size={15}
                                                                    />

                                                                </button>


                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        handleDelete(
                                                                            item
                                                                        )
                                                                    }
                                                                    className="
                                                                        p-2
                                                                        rounded-lg
                                                                        bg-rose-50
                                                                        text-rose-600
                                                                        hover:bg-rose-100
                                                                    "
                                                                    title="Hapus WO"
                                                                >

                                                                    <Trash2
                                                                        size={15}
                                                                    />

                                                                </button>

                                                            </>

                                                        )}

                                                    </div>

                                                </td>

                                            </tr>

                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>


                        {/* =================================================
                            MOBILE CARD
                        ================================================== */}

                        <div
                            className="
                                md:hidden
                                divide-y
                                divide-slate-100
                            "
                        >

                            {items.map(
                                item => (

                                    <div
                                        key={
                                            item.id
                                        }
                                        className="
                                            p-4
                                            space-y-3
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                justify-between
                                                items-start
                                                gap-3
                                            "
                                        >

                                            <div>

                                                <div
                                                    className="
                                                        text-base
                                                        font-extrabold
                                                        text-blue-700
                                                    "
                                                >
                                                    {item.no_wo}
                                                </div>


                                                <div
                                                    className="
                                                        text-xs
                                                        text-slate-500
                                                        mt-1
                                                    "
                                                >
                                                    {formatDate(
                                                        item.tanggal_wo
                                                    )}
                                                </div>

                                            </div>


                                            {renderStatus(
                                                item.status
                                            )}

                                        </div>


                                        <div
                                            className="
                                                grid
                                                grid-cols-2
                                                gap-2
                                                text-xs
                                            "
                                        >

                                            <div
                                                className="
                                                    bg-slate-50
                                                    rounded-lg
                                                    p-2
                                                    col-span-2
                                                "
                                            >

                                                <div
                                                    className="
                                                        text-slate-400
                                                    "
                                                >
                                                    Aturan
                                                </div>

                                                <div
                                                    className="
                                                        font-bold
                                                        text-slate-700
                                                        mt-1
                                                    "
                                                >
                                                    {item.aturan ||
                                                        '-'}
                                                </div>

                                            </div>


                                            <div
                                                className="
                                                    bg-slate-50
                                                    rounded-lg
                                                    p-2
                                                "
                                            >

                                                <div
                                                    className="
                                                        text-slate-400
                                                    "
                                                >
                                                    Jumlah Bal
                                                </div>

                                                <div
                                                    className="
                                                        font-bold
                                                        text-slate-700
                                                        mt-1
                                                    "
                                                >
                                                    {item.jumlah_bal ??
                                                        '-'}
                                                </div>

                                            </div>


                                            <div
                                                className="
                                                    bg-slate-50
                                                    rounded-lg
                                                    p-2
                                                "
                                            >

                                                <div
                                                    className="
                                                        text-slate-400
                                                    "
                                                >
                                                    Status
                                                </div>

                                                <div className="mt-1">
                                                    {renderStatus(
                                                        item.status
                                                    )}
                                                </div>

                                            </div>

                                        </div>


                                        {item.keterangan && (

                                            <div
                                                className="
                                                    bg-slate-50
                                                    rounded-lg
                                                    p-2
                                                    text-xs
                                                "
                                            >

                                                <div
                                                    className="
                                                        text-slate-400
                                                    "
                                                >
                                                    Keterangan
                                                </div>

                                                <div
                                                    className="
                                                        text-slate-700
                                                        mt-1
                                                    "
                                                >
                                                    {item.keterangan}
                                                </div>

                                            </div>

                                        )}


                                        <div
                                            className="
                                                flex
                                                justify-end
                                                gap-2
                                            "
                                        >

                                            {showTrash ? (

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleRestore(
                                                            item
                                                        )
                                                    }
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        px-3
                                                        py-2
                                                        rounded-lg
                                                        bg-emerald-50
                                                        text-emerald-700
                                                        font-bold
                                                        text-xs
                                                    "
                                                >

                                                    <RotateCcw
                                                        size={14}
                                                    />

                                                    Restore

                                                </button>

                                            ) : (

                                                <>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEdit(
                                                                item
                                                            )
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            px-3
                                                            py-2
                                                            rounded-lg
                                                            bg-blue-50
                                                            text-blue-700
                                                            font-bold
                                                            text-xs
                                                        "
                                                    >

                                                        <Edit
                                                            size={14}
                                                        />

                                                        Edit

                                                    </button>


                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleDelete(
                                                                item
                                                            )
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            px-3
                                                            py-2
                                                            rounded-lg
                                                            bg-rose-50
                                                            text-rose-600
                                                            font-bold
                                                            text-xs
                                                        "
                                                    >

                                                        <Trash2
                                                            size={14}
                                                        />

                                                        Hapus

                                                    </button>

                                                </>

                                            )}

                                        </div>

                                    </div>

                                )
                            )}

                        </div>

                    </>

                )}


                {/* =========================================================
                    PAGINATION
                ========================================================== */}

                {!loading &&
                    items.length > 0 && (

                        <div
                            className="
                                px-4
                                py-3
                                border-t
                                border-slate-200
                                flex
                                flex-col
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
                                gap-3
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-2
                                    text-xs
                                    text-slate-500
                                "
                            >

                                <span>
                                    Per halaman
                                </span>

                                <select
                                    value={
                                        perPage
                                    }
                                    onChange={e => {

                                        setPerPage(
                                            Number(
                                                e.target.value
                                            )
                                        );

                                        setPage(
                                            1
                                        );

                                    }}
                                    className="
                                        border
                                        border-slate-300
                                        rounded-lg
                                        px-2
                                        py-1
                                        bg-white
                                    "
                                >

                                    <option value="10">
                                        10
                                    </option>

                                    <option value="15">
                                        15
                                    </option>

                                    <option value="25">
                                        25
                                    </option>

                                    <option value="50">
                                        50
                                    </option>

                                </select>

                            </div>


                            <div
                                className="
                                    flex
                                    items-center
                                    gap-1
                                "
                            >

                                <button
                                    type="button"
                                    disabled={
                                        page <= 1
                                    }
                                    onClick={() =>
                                        goToPage(
                                            page - 1
                                        )
                                    }
                                    className="
                                        px-3
                                        py-1.5
                                        rounded-lg
                                        border
                                        border-slate-300
                                        text-xs
                                        font-bold
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                        hover:bg-slate-50
                                    "
                                >
                                    Sebelumnya
                                </button>


                                <span
                                    className="
                                        px-3
                                        py-1.5
                                        text-xs
                                        font-bold
                                        text-slate-600
                                    "
                                >
                                    {pagination.current_page}
                                    {' / '}
                                    {pagination.last_page}
                                </span>


                                <button
                                    type="button"
                                    disabled={
                                        page >=
                                        pagination.last_page
                                    }
                                    onClick={() =>
                                        goToPage(
                                            page + 1
                                        )
                                    }
                                    className="
                                        px-3
                                        py-1.5
                                        rounded-lg
                                        border
                                        border-slate-300
                                        text-xs
                                        font-bold
                                        disabled:opacity-40
                                        disabled:cursor-not-allowed
                                        hover:bg-slate-50
                                    "
                                >
                                    Berikutnya
                                </button>

                            </div>

                        </div>

                    )}

            </div>


            {/* =========================================================
                MODAL CREATE / EDIT
            ========================================================== */}

            {showModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-50
                        bg-slate-900/50
                        backdrop-blur-sm
                        flex
                        items-center
                        justify-center
                        p-4
                    "
                    onMouseDown={e => {

                        if (
                            e.target ===
                            e.currentTarget
                        ) {

                            closeModal();

                        }

                    }}
                >

                    <div
                        className="
                            w-full
                            max-w-2xl
                            bg-white
                            rounded-2xl
                            shadow-2xl
                            overflow-hidden
                        "
                    >

                        {/* MODAL HEADER */}

                        <div
                            className="
                                bg-gradient-to-r
                                from-blue-900
                                to-indigo-700
                                px-5
                                py-4
                                text-white
                                flex
                                items-center
                                justify-between
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-center
                                    gap-3
                                "
                            >

                                <div
                                    className="
                                        w-9
                                        h-9
                                        rounded-lg
                                        bg-white/15
                                        flex
                                        items-center
                                        justify-center
                                    "
                                >

                                    {editingId ? (

                                        <Edit
                                            size={19}
                                        />

                                    ) : (

                                        <Plus
                                            size={20}
                                        />

                                    )}

                                </div>


                                <div>

                                    <h2
                                        className="
                                            font-bold
                                            text-base
                                        "
                                    >
                                        {editingId
                                            ? 'Edit Work Order'
                                            : 'Tambah Work Order'
                                        }
                                    </h2>


                                    <p
                                        className="
                                            text-[11px]
                                            text-blue-100
                                        "
                                    >
                                        Primary Pos 1 — Rajang
                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeModal
                                }
                                disabled={
                                    saving
                                }
                                className="
                                    p-2
                                    rounded-lg
                                    hover:bg-white/10
                                    disabled:opacity-40
                                "
                            >

                                <X
                                    size={19}
                                />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={
                                handleSubmit
                            }
                            className="
                                p-5
                                space-y-4
                            "
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    sm:grid-cols-2
                                    gap-4
                                "
                            >

                                {/* NO WO */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-xs
                                            font-bold
                                            text-slate-600
                                            mb-1.5
                                        "
                                    >
                                        No. WO
                                        <span className="text-rose-500">
                                            {' '}*
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="no_wo"
                                        value={
                                            form.no_wo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contoh: EXE-30"
                                        autoFocus
                                        disabled={saving}
                                        className="
                                            w-full
                                            px-3
                                            py-2.5
                                            border
                                            border-slate-300
                                            rounded-xl
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                            disabled:bg-slate-100
                                        "
                                    />

                                </div>


                                {/* TANGGAL */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-xs
                                            font-bold
                                            text-slate-600
                                            mb-1.5
                                        "
                                    >
                                        Tanggal WO
                                    </label>

                                    <input
                                        type="date"
                                        name="tanggal_wo"
                                        value={
                                            form.tanggal_wo
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={saving}
                                        className="
                                            w-full
                                            px-3
                                            py-2.5
                                            border
                                            border-slate-300
                                            rounded-xl
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                            disabled:bg-slate-100
                                        "
                                    />

                                </div>


                                {/* ATURAN */}

                                <div
                                    className="
                                        sm:col-span-2
                                    "
                                >

                                    <label
                                        className="
                                            block
                                            text-xs
                                            font-bold
                                            text-slate-600
                                            mb-1.5
                                        "
                                    >
                                        Aturan
                                        <span className="text-rose-500">
                                            {' '}*
                                        </span>
                                    </label>

                                    <input
                                        type="text"
                                        name="aturan"
                                        value={
                                            form.aturan
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contoh: CHN"
                                        disabled={saving}
                                        className="
                                            w-full
                                            px-3
                                            py-2.5
                                            border
                                            border-slate-300
                                            rounded-xl
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                            disabled:bg-slate-100
                                        "
                                    />

                                </div>


                                {/* JUMLAH BAL */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-xs
                                            font-bold
                                            text-slate-600
                                            mb-1.5
                                        "
                                    >
                                        Jumlah Bal
                                        <span className="text-rose-500">
                                            {' '}*
                                        </span>
                                    </label>

                                    <input
                                        type="number"
                                        min="1"
                                        step="1"
                                        name="jumlah_bal"
                                        value={
                                            form.jumlah_bal
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        placeholder="Contoh: 15"
                                        disabled={saving}
                                        className="
                                            w-full
                                            px-3
                                            py-2.5
                                            border
                                            border-slate-300
                                            rounded-xl
                                            text-sm
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                            disabled:bg-slate-100
                                        "
                                    />

                                </div>


                                {/* STATUS */}

                                <div>

                                    <label
                                        className="
                                            block
                                            text-xs
                                            font-bold
                                            text-slate-600
                                            mb-1.5
                                        "
                                    >
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            form.status
                                        }
                                        onChange={
                                            handleChange
                                        }
                                        disabled={saving}
                                        className="
                                            w-full
                                            px-3
                                            py-2.5
                                            border
                                            border-slate-300
                                            rounded-xl
                                            text-sm
                                            bg-white
                                            outline-none
                                            focus:border-blue-500
                                            focus:ring-2
                                            focus:ring-blue-100
                                            disabled:bg-slate-100
                                        "
                                    >

                                        <option value="draft">
                                            Draft
                                        </option>

                                        <option value="open">
                                            Open
                                        </option>

                                        <option value="closed">
                                            Closed
                                        </option>

                                        <option value="cancelled">
                                            Cancelled
                                        </option>

                                    </select>

                                </div>

                            </div>


                            {/* KETERANGAN */}

                            <div>

                                <label
                                    className="
                                        block
                                        text-xs
                                        font-bold
                                        text-slate-600
                                        mb-1.5
                                    "
                                >
                                    Keterangan
                                </label>

                                <textarea
                                    name="keterangan"
                                    value={
                                        form.keterangan
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    rows={3}
                                    placeholder="Keterangan WO..."
                                    disabled={saving}
                                    className="
                                        w-full
                                        px-3
                                        py-2.5
                                        border
                                        border-slate-300
                                        rounded-xl
                                        text-sm
                                        outline-none
                                        resize-none
                                        focus:border-blue-500
                                        focus:ring-2
                                        focus:ring-blue-100
                                        disabled:bg-slate-100
                                    "
                                />

                            </div>


                            {/* FOOTER */}

                            <div
                                className="
                                    pt-3
                                    border-t
                                    border-slate-200
                                    flex
                                    justify-end
                                    gap-2
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="
                                        px-4
                                        py-2.5
                                        rounded-xl
                                        bg-slate-100
                                        text-slate-700
                                        font-bold
                                        text-sm
                                        hover:bg-slate-200
                                        disabled:opacity-50
                                    "
                                >
                                    Batal
                                </button>


                                <button
                                    type="submit"
                                    disabled={
                                        saving
                                    }
                                    className="
                                        inline-flex
                                        items-center
                                        gap-2
                                        px-5
                                        py-2.5
                                        rounded-xl
                                        bg-blue-600
                                        text-white
                                        font-bold
                                        text-sm
                                        shadow
                                        hover:bg-blue-700
                                        disabled:bg-slate-300
                                        disabled:cursor-not-allowed
                                    "
                                >

                                    {saving ? (

                                        <>

                                            <RefreshCw
                                                size={16}
                                                className="
                                                    animate-spin
                                                "
                                            />

                                            Menyimpan...

                                        </>

                                    ) : (

                                        <>

                                            <Save
                                                size={16}
                                            />

                                            {editingId
                                                ? 'Simpan Perubahan'
                                                : 'Simpan WO'
                                            }

                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}

        </div>

    );

}