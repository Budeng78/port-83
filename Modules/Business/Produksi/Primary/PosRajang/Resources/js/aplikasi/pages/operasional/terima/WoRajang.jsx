import React, {
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import {
    ClipboardList,
    Search,
    Plus,
    Edit,
    Trash2,
    RotateCcw,
    X,
    Save,
    RefreshCw,
    Check,
    AlertCircle,
    ChevronRight,
    Package,
    CalendarDays,
    Warehouse,
    Scale,
    FileText,
    Eye,
} from 'lucide-react';

import PrimaryPos1RajangWoService
    from '@Modules/Business/Produksi/Primary/PosRajang/Resources/js/aplikasi/services/PrimaryPos1RajangWoService';


/*
|--------------------------------------------------------------------------
| STATUS
|--------------------------------------------------------------------------
*/

const STATUS_CONFIG = {
    draft: {
        label: 'Draft',
        className: 'bg-amber-50 text-amber-700',
    },

    open: {
        label: 'Open',
        className: 'bg-blue-50 text-blue-700',
    },

    closed: {
        label: 'Closed',
        className: 'bg-emerald-50 text-emerald-700',
    },

    cancelled: {
        label: 'Cancelled',
        className: 'bg-rose-50 text-rose-700',
    },
};


/*
|--------------------------------------------------------------------------
| EMPTY FORM
|--------------------------------------------------------------------------
*/

const EMPTY_WO_FORM = {
    no_wo: '',
    tanggal_wo: '',
    aturan: '',
    jumlah_bal: '',
    status: 'draft',
    keterangan: '',
};


const EMPTY_DETAIL_FORM = {
    no_urut: '',
    gudang: '',
    jenis_tbk: '',
    tahun: '',
    s_k: '',
    grade: '',
    jml_bal: '',
    tara: '',
    bruto: '',
    netto: '',
};


/*
|--------------------------------------------------------------------------
| COMPONENT
|--------------------------------------------------------------------------
*/

export default function WoRajang() {

    /*
    |--------------------------------------------------------------------------
    | WO DATA
    |--------------------------------------------------------------------------
    */

    const [items, setItems] = useState([]);

    const [loading, setLoading] =
        useState(true);

    const [saving, setSaving] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | FILTER
    |--------------------------------------------------------------------------
    */

    const [search, setSearch] =
        useState('');

    const [statusFilter, setStatusFilter] =
        useState('all');

    const [showTrash, setShowTrash] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | PAGINATION
    |--------------------------------------------------------------------------
    */

    const [page, setPage] =
        useState(1);

    const [perPage, setPerPage] =
        useState(15);

    const [pagination, setPagination] =
        useState({
            current_page: 1,
            last_page: 1,
            total: 0,
            from: 0,
            to: 0,
        });


    /*
    |--------------------------------------------------------------------------
    | ALERT
    |--------------------------------------------------------------------------
    */

    const [alert, setAlert] =
        useState(null);


    /*
    |--------------------------------------------------------------------------
    | WO MODAL
    |--------------------------------------------------------------------------
    */

    const [showWoModal, setShowWoModal] =
        useState(false);

    const [editingWoId, setEditingWoId] =
        useState(null);

    const [woForm, setWoForm] =
        useState({
            ...EMPTY_WO_FORM,
        });


    /*
    |--------------------------------------------------------------------------
    | DETAIL MODAL
    |--------------------------------------------------------------------------
    */

    const [selectedWo, setSelectedWo] =
        useState(null);

    const [details, setDetails] =
        useState([]);

    const [loadingDetails, setLoadingDetails] =
        useState(false);

    const [showDetailModal, setShowDetailModal] =
        useState(false);


    /*
    |--------------------------------------------------------------------------
    | DETAIL FORM MODAL
    |--------------------------------------------------------------------------
    */

    const [showDetailForm, setShowDetailForm] =
        useState(false);

    const [editingDetailId, setEditingDetailId] =
        useState(null);

    const [detailForm, setDetailForm] =
        useState({
            ...EMPTY_DETAIL_FORM,
        });


    /*
    |--------------------------------------------------------------------------
    | ERROR HANDLER
    |--------------------------------------------------------------------------
    */

    const getErrorMessage = useCallback(
        (error) => {

            const responseData =
                error?.response?.data;

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

                if (messages.length) {
                    return messages.join(' ');
                }
            }

            if (
                typeof responseData?.message === 'string' &&
                responseData.message.trim()
            ) {
                return responseData.message;
            }

            if (
                typeof responseData === 'string' &&
                responseData.trim()
            ) {
                return responseData;
            }

            if (error?.response?.status) {
                return `Server mengembalikan HTTP ${error.response.status}.`;
            }

            return (
                error?.message ||
                'Terjadi kesalahan. Silakan periksa log server.'
            );

        },
        []
    );


    /*
    |--------------------------------------------------------------------------
    | LOAD WO
    |--------------------------------------------------------------------------
    */

    const loadData = useCallback(
        async () => {

            try {

                setLoading(true);

                setAlert(null);

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
                            showTrash
                                ? 1
                                : 0,

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

            } catch (error) {

                console.error(
                    'WO LOAD ERROR:',
                    error
                );

                setAlert({

                    type: 'error',

                    message:
                        getErrorMessage(
                            error
                        ),

                });

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
            getErrorMessage,
        ]
    );


    /*
    |--------------------------------------------------------------------------
    | INITIAL LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        loadData();

    }, [loadData]);


    /*
    |--------------------------------------------------------------------------
    | FILTER RESET
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
    | ALERT
    |--------------------------------------------------------------------------
    */

    const renderAlert = () => {

        if (!alert) {
            return null;
        }

        const success =
            alert.type === 'success';

        return (

            <div
                className={`
                    rounded-2xl
                    border
                    px-4
                    py-3
                    shadow-sm
                    ${
                        success
                            ? 'border-emerald-200 bg-emerald-50'
                            : 'border-red-200 bg-red-50'
                    }
                `}
            >

                <div
                    className="
                        flex
                        items-start
                        gap-3
                    "
                >

                    {success ? (

                        <Check
                            size={18}
                            className="
                                mt-0.5
                                shrink-0
                                text-emerald-600
                            "
                        />

                    ) : (

                        <AlertCircle
                            size={18}
                            className="
                                mt-0.5
                                shrink-0
                                text-red-600
                            "
                        />

                    )}


                    <p
                        className={`
                            text-sm
                            font-medium
                            ${
                                success
                                    ? 'text-emerald-700'
                                    : 'text-red-700'
                            }
                        `}
                    >
                        {alert.message}
                    </p>


                    <button
                        type="button"
                        onClick={() =>
                            setAlert(null)
                        }
                        className="
                            ml-auto
                            rounded-lg
                            p-1
                            text-slate-400
                            hover:bg-white/60
                        "
                    >

                        <X size={15} />

                    </button>

                </div>

            </div>

        );
    };


    /*
    |--------------------------------------------------------------------------
    | WO FORM
    |--------------------------------------------------------------------------
    */

    const handleWoChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setWoForm((current) => ({
            ...current,
            [name]: value,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN CREATE WO
    |--------------------------------------------------------------------------
    */

    const openCreateWo = () => {

        setAlert(null);

        setEditingWoId(null);

        setWoForm({
            ...EMPTY_WO_FORM,
        });

        setShowWoModal(true);

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT WO
    |--------------------------------------------------------------------------
    */

    const openEditWo = (item) => {

        setAlert(null);

        setEditingWoId(
            item.id
        );

        setWoForm({

            no_wo:
                item.no_wo ?? '',

            tanggal_wo:
                item.tanggal_wo
                    ? String(
                        item.tanggal_wo
                    ).substring(0, 10)
                    : '',

            aturan:
                item.aturan ?? '',

            jumlah_bal:
                item.jumlah_bal ?? '',

            status:
                item.status ??
                'draft',

            keterangan:
                item.keterangan ?? '',

        });

        setShowWoModal(true);

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE WO MODAL
    |--------------------------------------------------------------------------
    */

    const closeWoModal = () => {

        if (saving) {
            return;
        }

        setShowWoModal(false);

        setEditingWoId(null);

        setWoForm({
            ...EMPTY_WO_FORM,
        });

    };


    /*
    |--------------------------------------------------------------------------
    | SAVE WO
    |--------------------------------------------------------------------------
    */

    const handleWoSubmit = async (event) => {

        event.preventDefault();

        setAlert(null);


        if (!woForm.no_wo.trim()) {

            setAlert({
                type: 'error',
                message: 'No. WO wajib diisi.',
            });

            return;
        }


        if (!woForm.aturan.trim()) {

            setAlert({
                type: 'error',
                message: 'Aturan wajib diisi.',
            });

            return;
        }


        const jumlahBal =
            Number(
                woForm.jumlah_bal
            );


        if (
            !Number.isInteger(jumlahBal) ||
            jumlahBal < 1
        ) {

            setAlert({
                type: 'error',
                message:
                    'Jumlah bal harus berupa angka bulat minimal 1.',
            });

            return;
        }


        const payload = {

            no_wo:
                woForm.no_wo.trim(),

            tanggal_wo:
                woForm.tanggal_wo ||
                null,

            aturan:
                woForm.aturan.trim(),

            jumlah_bal:
                jumlahBal,

            status:
                woForm.status,

            keterangan:
                woForm.keterangan.trim() ||
                null,

        };


        try {

            setSaving(true);


            let response;


            if (editingWoId) {

                response =
                    await PrimaryPos1RajangWoService.update(
                        editingWoId,
                        payload
                    );

            } else {

                response =
                    await PrimaryPos1RajangWoService.create(
                        payload
                    );

            }


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    'Gagal menyimpan WO.'
                );

            }


            setShowWoModal(false);

            setEditingWoId(null);

            setWoForm({
                ...EMPTY_WO_FORM,
            });


            setAlert({

                type: 'success',

                message:
                    editingWoId
                        ? 'WO berhasil diperbarui.'
                        : 'WO berhasil dibuat.',

            });


            await loadData();

        } catch (error) {

            console.error(
                'WO SAVE ERROR:',
                error
            );

            setAlert({

                type: 'error',

                message:
                    getErrorMessage(
                        error
                    ),

            });

        } finally {

            setSaving(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | DELETE WO
    |--------------------------------------------------------------------------
    */

        const handleDeleteWo = async (item) => {

            if (!item?.id) {
                setAlert({
                    type: 'error',
                    message: 'ID WO tidak ditemukan.',
                });

                return;
            }


            const confirmed =
                window.confirm(
                    `Hapus WO "${item.no_wo}"?`
                );


            if (!confirmed) {
                return;
            }


            try {

                setLoading(true);

                setAlert(null);


                /*
                |--------------------------------------------------------------------------
                | DELETE
                |--------------------------------------------------------------------------
                */

                await PrimaryPos1RajangWoService.delete(
                    item.id
                );


                /*
                |--------------------------------------------------------------------------
                | REFRESH DATA
                |--------------------------------------------------------------------------
                */

                await loadData();


                /*
                |--------------------------------------------------------------------------
                | SUCCESS
                |--------------------------------------------------------------------------
                */

                setAlert({

                    type: 'success',

                    message:
                        `WO "${item.no_wo}" berhasil dihapus.`,

                });


            } catch (error) {

                console.error(
                    'WO DELETE ERROR:',
                    error
                );


                /*
                |--------------------------------------------------------------------------
                | ERROR MESSAGE
                |--------------------------------------------------------------------------
                */

                let message =
                    'Gagal menghapus WO.';


                if (
                    error?.response?.data?.message
                ) {

                    message =
                        error.response.data.message;

                } else if (
                    error?.response?.data?.errors
                ) {

                    message =
                        Object.values(
                            error.response.data.errors
                        )
                            .flat()
                            .join(' ');

                } else if (
                    error?.message
                ) {

                    message =
                        error.message;

                }


                setAlert({

                    type: 'error',

                    message,

                });


            } finally {

                setLoading(false);

            }

        };


    /*
    |--------------------------------------------------------------------------
    | RESTORE WO
    |--------------------------------------------------------------------------
    */

    const handleRestoreWo = async (item) => {

        if (
            !window.confirm(
                `Pulihkan WO "${item.no_wo}"?`
            )
        ) {
            return;
        }


        try {

            setLoading(true);

            setAlert(null);


            const response =
                await PrimaryPos1RajangWoService.restore(
                    item.id
                );


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    'Gagal memulihkan WO.'
                );

            }


            setAlert({

                type: 'success',

                message:
                    `WO ${item.no_wo} berhasil dipulihkan.`,

            });


            await loadData();

        } catch (error) {

            console.error(
                'WO RESTORE ERROR:',
                error
            );

            setAlert({

                type: 'error',

                message:
                    getErrorMessage(
                        error
                    ),

            });

        } finally {

            setLoading(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | LOAD DETAIL
    |--------------------------------------------------------------------------
    */

    const openDetail = async (wo) => {

        setSelectedWo(wo);

        setDetails([]);

        setAlert(null);

        setShowDetailModal(true);

        setLoadingDetails(true);


        try {

            const response =
                await PrimaryPos1RajangWoService.getDetails(
                    wo.id
                );


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    'Gagal mengambil detail WO.'
                );

            }


            const data =
                response.data;


            setDetails(
                Array.isArray(data?.data)
                    ? data.data
                    : Array.isArray(data)
                        ? data
                        : []
            );

        } catch (error) {

            console.error(
                'DETAIL LOAD ERROR:',
                error
            );

            setAlert({

                type: 'error',

                message:
                    getErrorMessage(
                        error
                    ),

            });

        } finally {

            setLoadingDetails(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE DETAIL
    |--------------------------------------------------------------------------
    */

    const closeDetail = () => {

        if (saving) {
            return;
        }

        setShowDetailModal(false);

        setSelectedWo(null);

        setDetails([]);

        setShowDetailForm(false);

    };


    /*
    |--------------------------------------------------------------------------
    | DETAIL FORM
    |--------------------------------------------------------------------------
    */

    const handleDetailChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setDetailForm((current) => ({
            ...current,
            [name]: value,
        }));

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN CREATE DETAIL
    |--------------------------------------------------------------------------
    */

    const openCreateDetail = () => {

        if (!selectedWo) {
            return;
        }

        setEditingDetailId(null);

        setDetailForm({

            ...EMPTY_DETAIL_FORM,

            no_urut:
                details.length + 1,

            tahun:
                new Date()
                    .getFullYear(),

        });

        setShowDetailForm(true);

    };


    /*
    |--------------------------------------------------------------------------
    | OPEN EDIT DETAIL
    |--------------------------------------------------------------------------
    */

    const openEditDetail = (item) => {

        setEditingDetailId(
            item.id
        );

        setDetailForm({

            no_urut:
                item.no_urut ?? '',

            gudang:
                item.gudang ?? '',

            jenis_tbk:
                item.jenis_tbk ?? '',

            tahun:
                item.tahun ?? '',

            s_k:
                item.s_k ?? '',

            grade:
                item.grade ?? '',

            jml_bal:
                item.jml_bal ?? '',

            tara:
                item.tara ?? '',

            bruto:
                item.bruto ?? '',

            netto:
                item.netto ?? '',

        });

        setShowDetailForm(true);

    };


    /*
    |--------------------------------------------------------------------------
    | CLOSE DETAIL FORM
    |--------------------------------------------------------------------------
    */

    const closeDetailForm = () => {

        if (saving) {
            return;
        }

        setShowDetailForm(false);

        setEditingDetailId(null);

        setDetailForm({
            ...EMPTY_DETAIL_FORM,
        });

    };


    /*
    |--------------------------------------------------------------------------
    | SAVE DETAIL
    |--------------------------------------------------------------------------
    */

    const handleDetailSubmit = async (event) => {

        event.preventDefault();

        if (!selectedWo) {
            return;
        }


        setAlert(null);


        if (!detailForm.gudang.trim()) {

            setAlert({
                type: 'error',
                message: 'Gudang wajib diisi.',
            });

            return;
        }


        if (!detailForm.jenis_tbk.trim()) {

            setAlert({
                type: 'error',
                message: 'Jenis TBK wajib diisi.',
            });

            return;
        }


        if (!detailForm.s_k.trim()) {

            setAlert({
                type: 'error',
                message: 'S/K wajib diisi.',
            });

            return;
        }


        if (!detailForm.grade.trim()) {

            setAlert({
                type: 'error',
                message: 'Grade wajib diisi.',
            });

            return;
        }


        const payload = {

            no_urut:
                Number(
                    detailForm.no_urut
                ),

            gudang:
                detailForm.gudang.trim(),

            jenis_tbk:
                detailForm.jenis_tbk.trim(),

            tahun:
                Number(
                    detailForm.tahun
                ),

            s_k:
                detailForm.s_k.trim(),

            grade:
                detailForm.grade.trim(),

            jml_bal:
                Number(
                    detailForm.jml_bal
                ),

            tara:
                Number(
                    detailForm.tara || 0
                ),

            bruto:
                Number(
                    detailForm.bruto || 0
                ),

            netto:
                Number(
                    detailForm.netto || 0
                ),

        };


        try {

            setSaving(true);


            let response;


            if (editingDetailId) {

                response =
                    await PrimaryPos1RajangWoService.updateDetail(
                        selectedWo.id,
                        editingDetailId,
                        payload
                    );

            } else {

                response =
                    await PrimaryPos1RajangWoService.createDetail(
                        selectedWo.id,
                        payload
                    );

            }


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    'Gagal menyimpan detail WO.'
                );

            }


            closeDetailForm();


            await openDetail(
                selectedWo
            );


            setAlert({

                type: 'success',

                message:
                    editingDetailId
                        ? 'Detail WO berhasil diperbarui.'
                        : 'Detail WO berhasil ditambahkan.',

            });

        } catch (error) {

            console.error(
                'DETAIL SAVE ERROR:',
                error
            );

            setAlert({

                type: 'error',

                message:
                    getErrorMessage(
                        error
                    ),

            });

        } finally {

            setSaving(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | DELETE DETAIL
    |--------------------------------------------------------------------------
    */

    const handleDeleteDetail = async (item) => {

        if (!selectedWo) {
            return;
        }


        if (
            !window.confirm(
                `Hapus detail urutan ${item.no_urut}?`
            )
        ) {
            return;
        }


        try {

            setSaving(true);

            setAlert(null);


            const response =
                await PrimaryPos1RajangWoService.deleteDetail(
                    selectedWo.id,
                    item.id
                );


            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    'Gagal menghapus detail.'
                );

            }


            await openDetail(
                selectedWo
            );


            setAlert({

                type: 'success',

                message:
                    'Detail WO berhasil dihapus.',

            });

        } catch (error) {

            console.error(
                'DETAIL DELETE ERROR:',
                error
            );

            setAlert({

                type: 'error',

                message:
                    getErrorMessage(
                        error
                    ),

            });

        } finally {

            setSaving(false);

        }

    };


    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    const renderStatus = (status) => {

        const config =
            STATUS_CONFIG[status] ||
            STATUS_CONFIG.draft;

        return (

            <span
                className={`
                    inline-flex
                    items-center
                    rounded-full
                    px-2.5
                    py-1
                    text-[10px]
                    font-bold
                    ${config.className}
                `}
            >
                {config.label}
            </span>

        );

    };


    /*
    |--------------------------------------------------------------------------
    | DATE
    |--------------------------------------------------------------------------
    */

    const formatDate = (value) => {

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
            return String(value)
                .substring(0, 10);
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

    const goToPage = (target) => {

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
    | MOBILE WO CARD
    |--------------------------------------------------------------------------
    */

    const renderMobileCard = (item) => {

        return (

            <div
                key={item.id}
                className="
                    overflow-hidden
                    rounded-2xl
                    border
                    border-[#D9DEE8]
                    bg-white
                    shadow-sm
                "
            >

                <div className="p-4">

                    <div
                        className="
                            flex
                            items-start
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-11
                                w-11
                                shrink-0
                                items-center
                                justify-center
                                rounded-xl
                                bg-[#EAF1FF]
                                text-[#243A70]
                            "
                        >

                            <ClipboardList
                                size={20}
                            />

                        </div>


                        <div
                            className="
                                min-w-0
                                flex-1
                            "
                        >

                            <div
                                className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-2
                                "
                            >

                                <div className="min-w-0">

                                    <h3
                                        className="
                                            truncate
                                            text-sm
                                            font-bold
                                            text-[#243A70]
                                        "
                                    >
                                        {item.no_wo}
                                    </h3>

                                    <p
                                        className="
                                            mt-0.5
                                            text-[11px]
                                            text-slate-400
                                        "
                                    >
                                        {formatDate(
                                            item.tanggal_wo
                                        )}
                                    </p>

                                </div>

                                {renderStatus(
                                    item.status
                                )}

                            </div>


                            <div
                                className="
                                    mt-3
                                    grid
                                    grid-cols-2
                                    gap-2
                                "
                            >

                                <div
                                    className="
                                        rounded-xl
                                        bg-slate-50
                                        p-2.5
                                    "
                                >

                                    <div
                                        className="
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        Aturan
                                    </div>

                                    <div
                                        className="
                                            mt-1
                                            truncate
                                            text-xs
                                            font-bold
                                            text-slate-700
                                        "
                                    >
                                        {item.aturan || '-'}
                                    </div>

                                </div>


                                <div
                                    className="
                                        rounded-xl
                                        bg-slate-50
                                        p-2.5
                                    "
                                >

                                    <div
                                        className="
                                            text-[10px]
                                            text-slate-400
                                        "
                                    >
                                        Jumlah Bal
                                    </div>

                                    <div
                                        className="
                                            mt-1
                                            text-xs
                                            font-bold
                                            text-slate-700
                                        "
                                    >
                                        {item.jumlah_bal ?? 0}
                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>


                    <div
                        className="
                            mt-4
                            flex
                            flex-wrap
                            justify-end
                            gap-2
                            border-t
                            border-slate-100
                            pt-3
                        "
                    >

                        {showTrash ? (

                            <button
                                type="button"
                                onClick={() =>
                                    handleRestoreWo(
                                        item
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                    rounded-xl
                                    bg-emerald-50
                                    px-3
                                    py-2
                                    text-xs
                                    font-bold
                                    text-emerald-700
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
                                        openDetail(
                                            item
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-xl
                                        bg-[#EAF1FF]
                                        px-3
                                        py-2
                                        text-xs
                                        font-bold
                                        text-[#243A70]
                                    "
                                >

                                    <Eye
                                        size={14}
                                    />

                                    Detail

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        openEditWo(
                                            item
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-xl
                                        bg-slate-100
                                        px-3
                                        py-2
                                        text-xs
                                        font-bold
                                        text-slate-700
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
                                        handleDeleteWo(
                                            item
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-xl
                                        bg-rose-50
                                        px-3
                                        py-2
                                        text-xs
                                        font-bold
                                        text-rose-600
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

            </div>

        );

    };


    /*
    |--------------------------------------------------------------------------
    | DESKTOP WO ROWS
    |--------------------------------------------------------------------------
    */

    const renderDesktopRows = () => {

        return items.map((item) => (

            <tr
                key={item.id}
                className="
                    group
                    border-b
                    border-slate-100
                    transition
                    hover:bg-[#F8FAFD]
                "
            >

                <td className="px-5 py-4">

                    <div
                        className="
                            flex
                            items-center
                            gap-3
                        "
                    >

                        <div
                            className="
                                flex
                                h-9
                                w-9
                                shrink-0
                                items-center
                                justify-center
                                rounded-lg
                                bg-[#EAF1FF]
                                text-[#243A70]
                            "
                        >

                            <ClipboardList
                                size={17}
                            />

                        </div>


                        <div>

                            <div
                                className="
                                    font-semibold
                                    text-[#243A70]
                                "
                            >
                                {item.no_wo}
                            </div>

                        </div>

                    </div>

                </td>


                <td
                    className="
                        px-5
                        py-4
                        text-xs
                        text-slate-600
                    "
                >
                    {formatDate(
                        item.tanggal_wo
                    )}
                </td>


                <td
                    className="
                        px-5
                        py-4
                        text-xs
                        font-medium
                        text-slate-700
                    "
                >
                    {item.aturan || '-'}
                </td>


                <td
                    className="
                        px-5
                        py-4
                        text-center
                    "
                >

                    <span
                        className="
                            inline-flex
                            min-w-8
                            items-center
                            justify-center
                            rounded-lg
                            bg-[#EAF1FF]
                            px-2
                            py-1
                            text-xs
                            font-bold
                            text-[#243A70]
                        "
                    >
                        {item.jumlah_bal ?? 0}
                    </span>

                </td>


                <td className="px-5 py-4">

                    {renderStatus(
                        item.status
                    )}

                </td>


                <td className="px-5 py-4">

                    <div
                        className="
                            flex
                            justify-end
                            gap-1
                        "
                    >

                        {showTrash ? (

                            <button
                                type="button"
                                onClick={() =>
                                    handleRestoreWo(
                                        item
                                    )
                                }
                                className="
                                    flex
                                    items-center
                                    gap-1.5
                                    rounded-xl
                                    px-3
                                    py-2
                                    text-xs
                                    font-bold
                                    text-emerald-700
                                    hover:bg-emerald-50
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
                                        openDetail(
                                            item
                                        )
                                    }
                                    className="
                                        flex
                                        items-center
                                        gap-1.5
                                        rounded-xl
                                        px-3
                                        py-2
                                        text-xs
                                        font-bold
                                        text-[#243A70]
                                        hover:bg-[#EAF1FF]
                                    "
                                >

                                    <Eye
                                        size={14}
                                    />

                                    Detail

                                    <ChevronRight
                                        size={13}
                                    />

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        openEditWo(
                                            item
                                        )
                                    }
                                    className="
                                        rounded-lg
                                        p-2
                                        text-slate-500
                                        hover:bg-slate-100
                                        hover:text-[#243A70]
                                    "
                                    title="Edit"
                                >

                                    <Edit
                                        size={15}
                                    />

                                </button>


                                <button
                                    type="button"
                                    onClick={() =>
                                        handleDeleteWo(
                                            item
                                        )
                                    }
                                    className="
                                        rounded-lg
                                        p-2
                                        text-rose-500
                                        hover:bg-rose-50
                                    "
                                    title="Hapus"
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

        ));

    };


    /*
    |--------------------------------------------------------------------------
    | DETAIL DATA TOTAL
    |--------------------------------------------------------------------------
    */

    const detailTotalBal =
        useMemo(
            () =>
                details.reduce(
                    (total, item) =>
                        total +
                        Number(
                            item.jml_bal || 0
                        ),
                    0
                ),
            [details]
        );


    /*
    |--------------------------------------------------------------------------
    | RENDER
    |--------------------------------------------------------------------------
    */

    return (

        <div
            className="
                min-h-full
                bg-[#F3F4F6]
            "
        >

            <div
                className="
                    mx-auto
                    max-w-7xl
                    space-y-4
                    px-3
                    py-4
                    sm:space-y-5
                    sm:px-5
                    sm:py-6
                    lg:px-8
                "
            >

                {/* =====================================================
                    CARD 1
                ====================================================== */}

                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#D9DEE8]
                        bg-white
                        shadow-sm
                    "
                >

                    <div
                        className="
                            h-1
                            w-full
                            bg-gradient-to-r
                            from-[#243A70]
                            via-[#4B8DF5]
                            to-[#FF9D00]
                        "
                    />


                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            p-4
                            sm:p-5
                        "
                    >

                        <div
                            className="
                                flex
                                flex-col
                                gap-4
                                sm:flex-row
                                sm:items-center
                                sm:justify-between
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
                                        flex
                                        h-11
                                        w-11
                                        shrink-0
                                        items-center
                                        justify-center
                                        rounded-xl
                                        bg-[#243A70]
                                        text-white
                                        shadow-sm
                                    "
                                >

                                    <ClipboardList
                                        size={21}
                                    />

                                </div>


                                <div>

                                    <h1
                                        className="
                                            text-lg
                                            font-bold
                                            tracking-tight
                                            text-[#243A70]
                                            sm:text-xl
                                        "
                                    >
                                        Work Order Rajang
                                    </h1>

                                    <p
                                        className="
                                            mt-0.5
                                            text-xs
                                            text-slate-500
                                            sm:text-sm
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
                                        openCreateWo
                                    }
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-[#243A70]
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-bold
                                        text-white
                                        shadow-sm
                                        transition
                                        hover:bg-[#1D315F]
                                        active:scale-[0.98]
                                        sm:w-auto
                                    "
                                >

                                    <Plus
                                        size={17}
                                    />

                                    Tambah WO

                                </button>

                            )}

                        </div>


                        {/* SEARCH */}

                        <div
                            className="
                                flex
                                flex-col
                                gap-2
                                sm:flex-row
                            "
                        >

                            <div
                                className="
                                    relative
                                    min-w-0
                                    flex-1
                                "
                            >

                                <Search
                                    size={17}
                                    className="
                                        absolute
                                        left-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-slate-400
                                    "
                                />

                                <input
                                    type="search"
                                    value={search}
                                    onChange={(e) =>
                                        setSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Cari nomor WO, aturan..."
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-slate-50
                                        py-2.5
                                        pl-10
                                        pr-10
                                        text-sm
                                        text-slate-700
                                        outline-none
                                        transition
                                        placeholder:text-slate-400
                                        focus:border-[#4B8DF5]
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-[#DCE9FF]
                                    "
                                />

                                {search && (

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setSearch('')
                                        }
                                        className="
                                            absolute
                                            right-3
                                            top-1/2
                                            -translate-y-1/2
                                            rounded-md
                                            p-1
                                            text-slate-400
                                            hover:bg-slate-100
                                        "
                                    >

                                        <X
                                            size={15}
                                        />

                                    </button>

                                )}

                            </div>


                            <select
                                value={
                                    statusFilter
                                }
                                onChange={(e) => {

                                    setStatusFilter(
                                        e.target.value
                                    );

                                    setPage(1);

                                }}
                                className="
                                    w-full
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-slate-50
                                    px-3
                                    py-2.5
                                    text-sm
                                    text-slate-700
                                    outline-none
                                    focus:border-[#4B8DF5]
                                    sm:w-40
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


                            <button
                                type="button"
                                onClick={() => {

                                    setShowTrash(
                                        (current) =>
                                            !current
                                    );

                                    setPage(1);

                                }}
                                className={`
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    px-4
                                    py-2.5
                                    text-xs
                                    font-bold
                                    ${
                                        showTrash
                                            ? 'bg-rose-600 text-white'
                                            : 'bg-slate-100 text-slate-700'
                                    }
                                `}
                            >

                                {showTrash ? (

                                    <>
                                        <RotateCcw
                                            size={15}
                                        />

                                        Data Aktif
                                    </>

                                ) : (

                                    <>
                                        <Trash2
                                            size={15}
                                        />

                                        Trash
                                    </>

                                )}

                            </button>


                            <button
                                type="button"
                                onClick={
                                    loadData
                                }
                                disabled={
                                    loading
                                }
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-[#EAF1FF]
                                    px-4
                                    py-2.5
                                    text-xs
                                    font-bold
                                    text-[#243A70]
                                    disabled:opacity-50
                                "
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

                    </div>

                </div>


                {/* ALERT */}

                {alert &&
                    renderAlert()}


                {/* =====================================================
                    CARD 2 — WO GRID
                ====================================================== */}

                <div
                    className="
                        overflow-hidden
                        rounded-2xl
                        border
                        border-[#D9DEE8]
                        bg-white
                        shadow-sm
                    "
                >

                    <div
                        className="
                            flex
                            flex-col
                            gap-2
                            border-b
                            border-[#D9DEE8]
                            px-4
                            py-3
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                            sm:px-5
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
                                size={17}
                                className="text-[#243A70]"
                            />

                            <span
                                className="
                                    text-sm
                                    font-bold
                                    text-[#243A70]
                                "
                            >
                                {showTrash
                                    ? 'WO Terhapus'
                                    : 'Daftar Work Order'}
                            </span>

                        </div>


                        <span
                            className="
                                text-[11px]
                                text-slate-400
                            "
                        >
                            {pagination.from} - {pagination.to}
                            {' dari '}
                            {pagination.total} data
                        </span>

                    </div>


                    {loading ? (

                        <div
                            className="
                                flex
                                min-h-[300px]
                                flex-col
                                items-center
                                justify-center
                            "
                        >

                            <RefreshCw
                                size={28}
                                className="
                                    mb-3
                                    animate-spin
                                    text-[#243A70]
                                "
                            />

                            <p
                                className="
                                    text-sm
                                    text-slate-500
                                "
                            >
                                Memuat data WO...
                            </p>

                        </div>

                    ) : items.length === 0 ? (

                        <div
                            className="
                                px-5
                                py-14
                                text-center
                            "
                        >

                            <div
                                className="
                                    mx-auto
                                    flex
                                    h-12
                                    w-12
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-[#EAF1FF]
                                    text-[#243A70]
                                "
                            >

                                <ClipboardList
                                    size={22}
                                />

                            </div>

                            <h3
                                className="
                                    mt-3
                                    text-sm
                                    font-bold
                                    text-[#243A70]
                                "
                            >
                                Tidak ada Work Order
                            </h3>

                            <p
                                className="
                                    mt-1
                                    text-xs
                                    text-slate-400
                                "
                            >
                                Belum ada data WO yang sesuai.
                            </p>

                        </div>

                    ) : (

                        <>

                            {/* MOBILE */}

                            <div
                                className="
                                    space-y-2.5
                                    p-3
                                    md:hidden
                                "
                            >

                                {items.map(
                                    renderMobileCard
                                )}

                            </div>


                            {/* DESKTOP */}

                            <div
                                className="
                                    hidden
                                    overflow-x-auto
                                    md:block
                                "
                            >

                                <table
                                    className="
                                        min-w-full
                                    "
                                >

                                    <thead>

                                        <tr
                                            className="
                                                border-b
                                                border-[#D9DEE8]
                                                bg-[#F8FAFD]
                                            "
                                        >

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                No. WO
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Tanggal
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Aturan
                                            </th>

                                            <th className="px-5 py-3.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Bal
                                            </th>

                                            <th className="px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Status
                                            </th>

                                            <th className="px-5 py-3.5 text-right text-[11px] font-bold uppercase tracking-wider text-[#243A70]">
                                                Aksi
                                            </th>

                                        </tr>

                                    </thead>


                                    <tbody>
                                        {renderDesktopRows()}
                                    </tbody>

                                </table>

                            </div>

                        </>

                    )}


                    {/* PAGINATION */}

                    {!loading &&
                        items.length > 0 && (

                            <div
                                className="
                                    flex
                                    flex-col
                                    gap-3
                                    border-t
                                    border-[#D9DEE8]
                                    px-4
                                    py-3
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
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
                                        onChange={(e) => {

                                            setPerPage(
                                                Number(
                                                    e.target.value
                                                )
                                            );

                                            setPage(1);

                                        }}
                                        className="
                                            rounded-lg
                                            border
                                            border-slate-200
                                            px-2
                                            py-1
                                        "
                                    >

                                        <option value={10}>
                                            10
                                        </option>

                                        <option value={15}>
                                            15
                                        </option>

                                        <option value={25}>
                                            25
                                        </option>

                                        <option value={50}>
                                            50
                                        </option>

                                    </select>

                                </div>


                                <div
                                    className="
                                        flex
                                        items-center
                                        justify-between
                                        gap-2
                                        sm:justify-end
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
                                            rounded-lg
                                            border
                                            border-slate-200
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-bold
                                            disabled:opacity-40
                                        "
                                    >
                                        Sebelumnya
                                    </button>


                                    <span
                                        className="
                                            px-2
                                            text-xs
                                            font-bold
                                            text-slate-500
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
                                            rounded-lg
                                            border
                                            border-slate-200
                                            px-3
                                            py-1.5
                                            text-xs
                                            font-bold
                                            disabled:opacity-40
                                        "
                                    >
                                        Berikutnya
                                    </button>

                                </div>

                            </div>

                        )}

                </div>

            </div>


            {/* =========================================================
                MODAL WO
            ========================================================== */}

            {showWoModal && (

                <div
                    className="
                        fixed
                        inset-0
                        z-[100]
                        flex
                        items-start
                        justify-center
                        bg-blue-900/50
                        p-3
                        pt-[calc(64px+12px)]
                        pb-4
                        backdrop-blur-sm
                        sm:items-center
                        sm:p-4
                    "
                >

                    <div
                        className="
                            relative
                            z-[101]
                            flex
                            max-h-[calc(100dvh-92px)]
                            w-full
                            flex-col
                            overflow-hidden
                            rounded-2xl
                            bg-white
                            shadow-2xl
                            sm:max-w-2xl
                        "
                    >

                        <div
                            className="
                                h-2
                                w-full
                                shrink-0
                                bg-gradient-to-r
                                from-[#243A70]
                                via-[#4B8DF5]
                                to-[#FF9D00]
                            "
                        />


                        <div
                            className="
                                flex
                                items-center
                                justify-between
                                border-b
                                border-[#D9DEE8]
                                px-5
                                py-4
                            "
                        >

                            <div>

                                <h2
                                    className="
                                        text-base
                                        font-bold
                                        text-[#243A70]
                                        sm:text-lg
                                    "
                                >
                                    {editingWoId
                                        ? 'Edit Work Order'
                                        : 'Tambah Work Order'}
                                </h2>

                                <p
                                    className="
                                        mt-0.5
                                        text-[11px]
                                        text-slate-400
                                    "
                                >
                                    Primary Pos 1 — Rajang
                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={
                                    closeWoModal
                                }
                                disabled={saving}
                                className="
                                    rounded-xl
                                    p-2
                                    text-slate-400
                                    hover:bg-slate-100
                                "
                            >

                                <X size={19} />

                            </button>

                        </div>


                        <form
                            onSubmit={
                                handleWoSubmit
                            }
                            className="
                                min-h-0
                                flex-1
                                overflow-y-auto
                                px-5
                                py-5
                            "
                        >

                            <div
                                className="
                                    grid
                                    grid-cols-1
                                    gap-4
                                    sm:grid-cols-2
                                "
                            >

                                <FormInput
                                    label="No. WO"
                                    name="no_wo"
                                    value={
                                        woForm.no_wo
                                    }
                                    onChange={
                                        handleWoChange
                                    }
                                    required
                                    disabled={saving}
                                />


                                <FormInput
                                    label="Tanggal WO"
                                    name="tanggal_wo"
                                    type="date"
                                    value={
                                        woForm.tanggal_wo
                                    }
                                    onChange={
                                        handleWoChange
                                    }
                                    disabled={saving}
                                />


                                <div
                                    className="
                                        sm:col-span-2
                                    "
                                >

                                    <FormInput
                                        label="Aturan"
                                        name="aturan"
                                        value={
                                            woForm.aturan
                                        }
                                        onChange={
                                            handleWoChange
                                        }
                                        placeholder="Contoh: CHN"
                                        required
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                <FormInput
                                    label="Jumlah Bal"
                                    name="jumlah_bal"
                                    type="number"
                                    min="1"
                                    value={
                                        woForm.jumlah_bal
                                    }
                                    onChange={
                                        handleWoChange
                                    }
                                    required
                                    disabled={saving}
                                />


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
                                        Status
                                    </label>

                                    <select
                                        name="status"
                                        value={
                                            woForm.status
                                        }
                                        onChange={
                                            handleWoChange
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-white
                                            px-3
                                            py-2.5
                                            text-sm
                                            outline-none
                                            focus:border-[#4B8DF5]
                                            focus:ring-2
                                            focus:ring-[#DCE9FF]
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


                                <div
                                    className="
                                        sm:col-span-2
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
                                        Keterangan
                                    </label>

                                    <textarea
                                        name="keterangan"
                                        value={
                                            woForm.keterangan
                                        }
                                        onChange={
                                            handleWoChange
                                        }
                                        rows={3}
                                        disabled={
                                            saving
                                        }
                                        className="
                                            w-full
                                            resize-none
                                            rounded-xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            px-3
                                            py-2.5
                                            text-sm
                                            outline-none
                                            focus:border-[#4B8DF5]
                                            focus:bg-white
                                            focus:ring-2
                                            focus:ring-[#DCE9FF]
                                        "
                                        placeholder="Keterangan WO..."
                                    />

                                </div>

                            </div>


                            <div
                                className="
                                    mt-5
                                    flex
                                    flex-col-reverse
                                    gap-2
                                    border-t
                                    border-[#D9DEE8]
                                    pt-4
                                    sm:flex-row
                                    sm:justify-end
                                "
                            >

                                <button
                                    type="button"
                                    onClick={
                                        closeWoModal
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="
                                        w-full
                                        rounded-xl
                                        border
                                        border-slate-200
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-semibold
                                        text-slate-600
                                        hover:bg-slate-50
                                        sm:w-auto
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
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-[#243A70]
                                        px-5
                                        py-2.5
                                        text-sm
                                        font-bold
                                        text-white
                                        hover:bg-[#1D315F]
                                        disabled:opacity-50
                                        sm:w-auto
                                    "
                                >

                                    {saving ? (

                                        <>
                                            <RefreshCw
                                                size={16}
                                                className="animate-spin"
                                            />

                                            Menyimpan...
                                        </>

                                    ) : (

                                        <>
                                            <Save
                                                size={16}
                                            />

                                            Simpan WO
                                        </>

                                    )}

                                </button>

                            </div>

                        </form>

                    </div>

                </div>

            )}


            {/* =========================================================
                MODAL DETAIL WO
            ========================================================== */}

            {showDetailModal &&
                selectedWo && (

                    <div
                        className="
                            fixed
                            inset-0
                            z-[100]
                            flex
                            items-start
                            justify-center
                            bg-blue-900/50
                            p-3
                            pt-[calc(64px+12px)]
                            pb-4
                            backdrop-blur-sm
                            sm:items-center
                            sm:p-4
                        "
                    >

                        <div
                            className="
                                relative
                                z-[101]
                                flex
                                max-h-[calc(100dvh-92px)]
                                w-full
                                flex-col
                                overflow-hidden
                                rounded-2xl
                                bg-white
                                shadow-2xl
                                sm:max-w-6xl
                            "
                        >

                            <div
                                className="
                                    h-2
                                    w-full
                                    shrink-0
                                    bg-gradient-to-r
                                    from-[#243A70]
                                    via-[#4B8DF5]
                                    to-[#FF9D00]
                                "
                            />


                            {/* HEADER */}

                            <div
                                className="
                                    flex
                                    shrink-0
                                    items-center
                                    justify-between
                                    border-b
                                    border-[#D9DEE8]
                                    px-4
                                    py-4
                                    sm:px-5
                                "
                            >

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
                                            h-10
                                            w-10
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-[#EAF1FF]
                                            text-[#243A70]
                                        "
                                    >

                                        <ClipboardList
                                            size={19}
                                        />

                                    </div>


                                    <div
                                        className="
                                            min-w-0
                                        "
                                    >

                                        <h2
                                            className="
                                                truncate
                                                text-base
                                                font-bold
                                                text-[#243A70]
                                                sm:text-lg
                                            "
                                        >
                                            Detail WO — {selectedWo.no_wo}
                                        </h2>

                                        <p
                                            className="
                                                mt-0.5
                                                text-[11px]
                                                text-slate-400
                                            "
                                        >
                                            Aturan: {selectedWo.aturan || '-'}
                                            {' • '}
                                            {selectedWo.jumlah_bal ?? 0} Bal
                                        </p>

                                    </div>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeDetail
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="
                                        rounded-xl
                                        p-2
                                        text-slate-400
                                        hover:bg-slate-100
                                    "
                                >

                                    <X size={19} />

                                </button>

                            </div>


                            {/* DETAIL TOOLBAR */}

                            <div
                                className="
                                    flex
                                    shrink-0
                                    flex-col
                                    gap-3
                                    border-b
                                    border-[#D9DEE8]
                                    bg-[#F8FAFD]
                                    px-4
                                    py-3
                                    sm:flex-row
                                    sm:items-center
                                    sm:justify-between
                                    sm:px-5
                                "
                            >

                                <div
                                    className="
                                        flex
                                        flex-wrap
                                        gap-2
                                    "
                                >

                                    <span
                                        className="
                                            flex
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            bg-white
                                            px-3
                                            py-1.5
                                            text-[11px]
                                            font-semibold
                                            text-slate-600
                                        "
                                    >

                                        <Package
                                            size={13}
                                        />

                                        {details.length} Detail

                                    </span>


                                    <span
                                        className="
                                            flex
                                            items-center
                                            gap-1.5
                                            rounded-lg
                                            bg-[#EAF1FF]
                                            px-3
                                            py-1.5
                                            text-[11px]
                                            font-bold
                                            text-[#243A70]
                                        "
                                    >

                                        <Package
                                            size={13}
                                        />

                                        {detailTotalBal} Bal

                                    </span>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        openCreateDetail
                                    }
                                    className="
                                        flex
                                        w-full
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-xl
                                        bg-[#243A70]
                                        px-4
                                        py-2.5
                                        text-xs
                                        font-bold
                                        text-white
                                        hover:bg-[#1D315F]
                                        sm:w-auto
                                    "
                                >

                                    <Plus
                                        size={15}
                                    />

                                    Tambah Detail

                                </button>

                            </div>


                            {/* DETAIL BODY */}

                            <div
                                className="
                                    min-h-0
                                    flex-1
                                    overflow-y-auto
                                    p-3
                                    sm:p-5
                                "
                            >

                                {loadingDetails ? (

                                    <div
                                        className="
                                            flex
                                            min-h-[250px]
                                            flex-col
                                            items-center
                                            justify-center
                                        "
                                    >

                                        <RefreshCw
                                            size={28}
                                            className="
                                                mb-3
                                                animate-spin
                                                text-[#243A70]
                                            "
                                        />

                                        <p
                                            className="
                                                text-sm
                                                text-slate-500
                                            "
                                        >
                                            Memuat detail WO...
                                        </p>

                                    </div>

                                ) : details.length === 0 ? (

                                    <div
                                        className="
                                            rounded-2xl
                                            border
                                            border-dashed
                                            border-[#D9DEE8]
                                            bg-[#F8FAFD]
                                            px-5
                                            py-14
                                            text-center
                                        "
                                    >

                                        <Package
                                            size={26}
                                            className="
                                                mx-auto
                                                text-slate-300
                                            "
                                        />

                                        <h3
                                            className="
                                                mt-3
                                                text-sm
                                                font-bold
                                                text-[#243A70]
                                            "
                                        >
                                            Belum ada detail WO
                                        </h3>

                                        <p
                                            className="
                                                mt-1
                                                text-xs
                                                text-slate-400
                                            "
                                        >
                                            Tambahkan detail untuk WO ini.
                                        </p>

                                    </div>

                                ) : (

                                    <>

                                        {/* MOBILE DETAIL */}

                                        <div
                                            className="
                                                space-y-2.5
                                                md:hidden
                                            "
                                        >

                                            {details.map(
                                                (item) => (

                                                    <div
                                                        key={
                                                            item.id
                                                        }
                                                        className="
                                                            rounded-2xl
                                                            border
                                                            border-[#D9DEE8]
                                                            bg-white
                                                            p-4
                                                            shadow-sm
                                                        "
                                                    >

                                                        <div
                                                            className="
                                                                flex
                                                                items-start
                                                                justify-between
                                                                gap-3
                                                            "
                                                        >

                                                            <div>

                                                                <span
                                                                    className="
                                                                        inline-flex
                                                                        rounded-lg
                                                                        bg-[#EAF1FF]
                                                                        px-2.5
                                                                        py-1
                                                                        text-[10px]
                                                                        font-bold
                                                                        text-[#243A70]
                                                                    "
                                                                >
                                                                    #{item.no_urut}
                                                                </span>

                                                                <h4
                                                                    className="
                                                                        mt-2
                                                                        text-sm
                                                                        font-bold
                                                                        text-slate-700
                                                                    "
                                                                >
                                                                    {item.gudang || '-'}
                                                                </h4>

                                                            </div>


                                                            <div
                                                                className="
                                                                    text-right
                                                                "
                                                            >

                                                                <div
                                                                    className="
                                                                        text-[10px]
                                                                        text-slate-400
                                                                    "
                                                                >
                                                                    Bal
                                                                </div>

                                                                <div
                                                                    className="
                                                                        text-lg
                                                                        font-bold
                                                                        text-[#243A70]
                                                                    "
                                                                >
                                                                    {item.jml_bal ?? 0}
                                                                </div>

                                                            </div>

                                                        </div>


                                                        <div
                                                            className="
                                                                mt-3
                                                                grid
                                                                grid-cols-2
                                                                gap-2
                                                                text-xs
                                                            "
                                                        >

                                                            <DetailInfo
                                                                label="Jenis TBK"
                                                                value={
                                                                    item.jenis_tbk
                                                                }
                                                            />

                                                            <DetailInfo
                                                                label="Tahun"
                                                                value={
                                                                    item.tahun
                                                                }
                                                            />

                                                            <DetailInfo
                                                                label="S/K"
                                                                value={
                                                                    item.s_k
                                                                }
                                                            />

                                                            <DetailInfo
                                                                label="Grade"
                                                                value={
                                                                    item.grade
                                                                }
                                                            />

                                                            <DetailInfo
                                                                label="Tara"
                                                                value={
                                                                    item.tara
                                                                }
                                                            />

                                                            <DetailInfo
                                                                label="Bruto"
                                                                value={
                                                                    item.bruto
                                                                }
                                                            />

                                                            <DetailInfo
                                                                label="Netto"
                                                                value={
                                                                    item.netto
                                                                }
                                                            />

                                                        </div>


                                                        <div
                                                            className="
                                                                mt-3
                                                                flex
                                                                justify-end
                                                                gap-2
                                                                border-t
                                                                border-slate-100
                                                                pt-3
                                                            "
                                                        >

                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    openEditDetail(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-xl
                                                                    bg-[#EAF1FF]
                                                                    px-3
                                                                    py-2
                                                                    text-xs
                                                                    font-bold
                                                                    text-[#243A70]
                                                                "
                                                            >

                                                                <Edit
                                                                    size={13}
                                                                />

                                                                Edit

                                                            </button>


                                                            <button
                                                                type="button"
                                                                onClick={() =>
                                                                    handleDeleteDetail(
                                                                        item
                                                                    )
                                                                }
                                                                className="
                                                                    flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-xl
                                                                    bg-rose-50
                                                                    px-3
                                                                    py-2
                                                                    text-xs
                                                                    font-bold
                                                                    text-rose-600
                                                                "
                                                            >

                                                                <Trash2
                                                                    size={13}
                                                                />

                                                                Hapus

                                                            </button>

                                                        </div>

                                                    </div>

                                                )
                                            )}

                                        </div>


                                        {/* DESKTOP DETAIL */}

                                        <div
                                            className="
                                                hidden
                                                overflow-x-auto
                                                rounded-2xl
                                                border
                                                border-[#D9DEE8]
                                                md:block
                                            "
                                        >

                                            <table
                                                className="
                                                    min-w-full
                                                    text-xs
                                                "
                                            >

                                                <thead>

                                                    <tr
                                                        className="
                                                            border-b
                                                            border-[#D9DEE8]
                                                            bg-[#F8FAFD]
                                                        "
                                                    >

                                                        <th className="px-4 py-3 text-left font-bold text-[#243A70]">
                                                            No
                                                        </th>

                                                        <th className="px-4 py-3 text-left font-bold text-[#243A70]">
                                                            Gudang
                                                        </th>

                                                        <th className="px-4 py-3 text-left font-bold text-[#243A70]">
                                                            Jenis TBK
                                                        </th>

                                                        <th className="px-4 py-3 text-center font-bold text-[#243A70]">
                                                            Tahun
                                                        </th>

                                                        <th className="px-4 py-3 text-left font-bold text-[#243A70]">
                                                            S/K
                                                        </th>

                                                        <th className="px-4 py-3 text-left font-bold text-[#243A70]">
                                                            Grade
                                                        </th>

                                                        <th className="px-4 py-3 text-center font-bold text-[#243A70]">
                                                            Bal
                                                        </th>

                                                        <th className="px-4 py-3 text-right font-bold text-[#243A70]">
                                                            Tara
                                                        </th>

                                                        <th className="px-4 py-3 text-right font-bold text-[#243A70]">
                                                            Bruto
                                                        </th>

                                                        <th className="px-4 py-3 text-right font-bold text-[#243A70]">
                                                            Netto
                                                        </th>

                                                        <th className="px-4 py-3 text-right font-bold text-[#243A70]">
                                                            Aksi
                                                        </th>

                                                    </tr>

                                                </thead>


                                                <tbody>

                                                    {details.map(
                                                        (item) => (

                                                            <tr
                                                                key={
                                                                    item.id
                                                                }
                                                                className="
                                                                    border-b
                                                                    border-slate-100
                                                                    hover:bg-[#F8FAFD]
                                                                "
                                                            >

                                                                <td
                                                                    className="
                                                                        px-4
                                                                        py-3
                                                                        font-bold
                                                                        text-[#243A70]
                                                                    "
                                                                >
                                                                    {item.no_urut}
                                                                </td>

                                                                <td className="px-4 py-3 font-medium text-slate-700">
                                                                    {item.gudang || '-'}
                                                                </td>

                                                                <td className="px-4 py-3 text-slate-600">
                                                                    {item.jenis_tbk || '-'}
                                                                </td>

                                                                <td className="px-4 py-3 text-center text-slate-600">
                                                                    {item.tahun || '-'}
                                                                </td>

                                                                <td className="px-4 py-3 text-slate-600">
                                                                    {item.s_k || '-'}
                                                                </td>

                                                                <td className="px-4 py-3 text-slate-600">
                                                                    {item.grade || '-'}
                                                                </td>

                                                                <td className="px-4 py-3 text-center font-bold text-[#243A70]">
                                                                    {item.jml_bal ?? 0}
                                                                </td>

                                                                <td className="px-4 py-3 text-right text-slate-600">
                                                                    {item.tara ?? '0.00'}
                                                                </td>

                                                                <td className="px-4 py-3 text-right text-slate-600">
                                                                    {item.bruto ?? '0.00'}
                                                                </td>

                                                                <td className="px-4 py-3 text-right font-bold text-[#009B6A]">
                                                                    {item.netto ?? '0.00'}
                                                                </td>

                                                                <td className="px-4 py-3">

                                                                    <div
                                                                        className="
                                                                            flex
                                                                            justify-end
                                                                            gap-1
                                                                        "
                                                                    >

                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                openEditDetail(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="
                                                                                rounded-lg
                                                                                p-2
                                                                                text-[#243A70]
                                                                                hover:bg-[#EAF1FF]
                                                                            "
                                                                        >

                                                                            <Edit
                                                                                size={14}
                                                                            />

                                                                        </button>


                                                                        <button
                                                                            type="button"
                                                                            onClick={() =>
                                                                                handleDeleteDetail(
                                                                                    item
                                                                                )
                                                                            }
                                                                            className="
                                                                                rounded-lg
                                                                                p-2
                                                                                text-rose-500
                                                                                hover:bg-rose-50
                                                                            "
                                                                        >

                                                                            <Trash2
                                                                                size={14}
                                                                            />

                                                                        </button>

                                                                    </div>

                                                                </td>

                                                            </tr>

                                                        )
                                                    )}

                                                </tbody>

                                            </table>

                                        </div>

                                    </>

                                )}

                            </div>

                        </div>

                    </div>

                )}


            {/* =========================================================
                MODAL DETAIL FORM
            ========================================================== */}

            {showDetailForm &&
                selectedWo && (

                    <div
                        className="
                            fixed
                            inset-0
                            z-[150]
                            flex
                            items-start
                            justify-center
                            bg-blue-950/60
                            p-3
                            pt-[calc(64px+12px)]
                            pb-4
                            backdrop-blur-sm
                            sm:items-center
                            sm:p-4
                        "
                    >

                        <div
                            className="
                                flex
                                max-h-[calc(100dvh-92px)]
                                w-full
                                flex-col
                                overflow-hidden
                                rounded-2xl
                                bg-white
                                shadow-2xl
                                sm:max-w-3xl
                            "
                        >

                            <div
                                className="
                                    h-2
                                    shrink-0
                                    bg-gradient-to-r
                                    from-[#243A70]
                                    via-[#4B8DF5]
                                    to-[#FF9D00]
                                "
                            />


                            <div
                                className="
                                    flex
                                    items-center
                                    justify-between
                                    border-b
                                    border-[#D9DEE8]
                                    px-5
                                    py-4
                                "
                            >

                                <div>

                                    <h2
                                        className="
                                            text-base
                                            font-bold
                                            text-[#243A70]
                                        "
                                    >
                                        {editingDetailId
                                            ? 'Edit Detail WO'
                                            : 'Tambah Detail WO'}
                                    </h2>

                                    <p
                                        className="
                                            mt-0.5
                                            text-[11px]
                                            text-slate-400
                                        "
                                    >
                                        WO: {selectedWo.no_wo}
                                    </p>

                                </div>


                                <button
                                    type="button"
                                    onClick={
                                        closeDetailForm
                                    }
                                    disabled={
                                        saving
                                    }
                                    className="
                                        rounded-xl
                                        p-2
                                        text-slate-400
                                        hover:bg-slate-100
                                    "
                                >

                                    <X size={19} />

                                </button>

                            </div>


                            <form
                                onSubmit={
                                    handleDetailSubmit
                                }
                                className="
                                    min-h-0
                                    flex-1
                                    overflow-y-auto
                                    px-5
                                    py-5
                                "
                            >

                                <div
                                    className="
                                        grid
                                        grid-cols-1
                                        gap-4
                                        sm:grid-cols-2
                                    "
                                >

                                    <FormInput
                                        label="No. Urut"
                                        name="no_urut"
                                        type="number"
                                        min="1"
                                        value={
                                            detailForm.no_urut
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        required
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Gudang"
                                        name="gudang"
                                        value={
                                            detailForm.gudang
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        required
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Jenis TBK"
                                        name="jenis_tbk"
                                        value={
                                            detailForm.jenis_tbk
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        required
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Tahun"
                                        name="tahun"
                                        type="number"
                                        value={
                                            detailForm.tahun
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        required
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="S/K"
                                        name="s_k"
                                        value={
                                            detailForm.s_k
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        required
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Grade"
                                        name="grade"
                                        value={
                                            detailForm.grade
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        required
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Jumlah Bal"
                                        name="jml_bal"
                                        type="number"
                                        min="1"
                                        value={
                                            detailForm.jml_bal
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        required
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Tara"
                                        name="tara"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            detailForm.tara
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Bruto"
                                        name="bruto"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            detailForm.bruto
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />


                                    <FormInput
                                        label="Netto"
                                        name="netto"
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={
                                            detailForm.netto
                                        }
                                        onChange={
                                            handleDetailChange
                                        }
                                        disabled={
                                            saving
                                        }
                                    />

                                </div>


                                <div
                                    className="
                                        mt-5
                                        flex
                                        flex-col-reverse
                                        gap-2
                                        border-t
                                        border-[#D9DEE8]
                                        pt-4
                                        sm:flex-row
                                        sm:justify-end
                                    "
                                >

                                    <button
                                        type="button"
                                        onClick={
                                            closeDetailForm
                                        }
                                        disabled={
                                            saving
                                        }
                                        className="
                                            w-full
                                            rounded-xl
                                            border
                                            border-slate-200
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-semibold
                                            text-slate-600
                                            hover:bg-slate-50
                                            sm:w-auto
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
                                            flex
                                            w-full
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-xl
                                            bg-[#243A70]
                                            px-5
                                            py-2.5
                                            text-sm
                                            font-bold
                                            text-white
                                            hover:bg-[#1D315F]
                                            disabled:opacity-50
                                            sm:w-auto
                                        "
                                    >

                                        {saving ? (

                                            <>
                                                <RefreshCw
                                                    size={16}
                                                    className="animate-spin"
                                                />

                                                Menyimpan...
                                            </>

                                        ) : (

                                            <>
                                                <Save
                                                    size={16}
                                                />

                                                Simpan Detail
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


/*
|--------------------------------------------------------------------------
| FORM INPUT
|--------------------------------------------------------------------------
*/

function FormInput({
    label,
    name,
    type = 'text',
    value,
    onChange,
    required = false,
    disabled = false,
    placeholder = '',
    min,
    step,
}) {

    return (

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

                {label}

                {required && (

                    <span
                        className="
                            text-rose-500
                        "
                    >
                        {' '}*
                    </span>

                )}

            </label>


            <input
                type={type}
                name={name}
                value={value ?? ''}
                onChange={onChange}
                required={required}
                disabled={disabled}
                min={min}
                step={step}
                placeholder={
                    placeholder
                }
                className="
                    w-full
                    rounded-xl
                    border
                    border-slate-200
                    bg-slate-50
                    px-3
                    py-2.5
                    text-sm
                    text-slate-700
                    outline-none
                    transition
                    placeholder:text-slate-400
                    focus:border-[#4B8DF5]
                    focus:bg-white
                    focus:ring-2
                    focus:ring-[#DCE9FF]
                    disabled:cursor-not-allowed
                    disabled:bg-slate-100
                "
            />

        </div>

    );
}


/*
|--------------------------------------------------------------------------
| DETAIL INFO
|--------------------------------------------------------------------------
*/

function DetailInfo({
    label,
    value,
}) {

    return (

        <div
            className="
                rounded-xl
                bg-slate-50
                p-2.5
            "
        >

            <div
                className="
                    text-[10px]
                    text-slate-400
                "
            >
                {label}
            </div>

            <div
                className="
                    mt-1
                    truncate
                    font-semibold
                    text-slate-700
                "
            >
                {value ?? '-'}
            </div>

        </div>

    );
}