
import React, { useEffect, useState } from 'react';

import {
    Search,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    Mail,
    Phone,
    ShieldCheck,
    Shield,
    Building2,
    X,
    Save,
} from 'lucide-react';

import UserService from '@Modules/Platform/Auth/Resources/js/aplikasi/services/UserService';
import UserMatrixService from '@Modules/Platform/RBAC/Resources/js/aplikasi/services/UserMatrixService';


export default function UserManagement() {

    // =========================================================
    // STATE
    // =========================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [success, setSuccess] = useState('');

    const [search, setSearch] = useState('');

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });


    // =========================================================
    // MODAL USER
    // =========================================================

    const [showModal, setShowModal] = useState(false);

    const [modalMode, setModalMode] = useState('create');

    const [selectedUser, setSelectedUser] = useState(null);


    // =========================================================
    // USER MATRIX
    // =========================================================

    const [showMatrix, setShowMatrix] = useState(false);

    const [matrixLoading, setMatrixLoading] = useState(false);

    const [matrixError, setMatrixError] = useState('');

    const [matrix, setMatrix] = useState(null);


    // =========================================================
    // FORM
    // =========================================================

    const [form, setForm] = useState({
        name: '',
        email: '',
        no_whatsapp: '',
        password: '',
    });

    const [formErrors, setFormErrors] = useState({});

    const [saving, setSaving] = useState(false);


    // =========================================================
    // OPEN USER MATRIX
    // =========================================================

    const openMatrixModal = async (user) => {

        setShowMatrix(true);

        setMatrixLoading(true);

        setMatrixError('');

        setMatrix(null);

        try {

            const response =
                await UserMatrixService.getUserMatrix(user.id);

            if (!response?.success) {

                throw new Error(
                    response?.message ||
                    'Gagal mengambil matrix akses user.'
                );

            }

            setMatrix(response.data);

        } catch (err) {

            console.error(
                'Gagal mengambil user matrix:',
                err
            );

            setMatrixError(
                err?.response?.data?.message ||
                err?.message ||
                'Gagal mengambil matrix akses user.'
            );

        } finally {

            setMatrixLoading(false);

        }
    };


    // =========================================================
    // CLOSE USER MATRIX
    // =========================================================

    const closeMatrixModal = () => {

        if (matrixLoading) {
            return;
        }

        setShowMatrix(false);

        setMatrix(null);

        setMatrixError('');
    };


    // =========================================================
    // LOAD USERS
    // =========================================================

    const loadUsers = async () => {

        setLoading(true);

        setError('');

        try {

            const response =
                await UserService.getUsers({
                    page,
                    search,
                });

            const paginator = response?.data;

            setUsers(
                Array.isArray(paginator?.data)
                    ? paginator.data
                    : []
            );

            setPagination({
                current_page:
                    paginator?.current_page ?? 1,

                last_page:
                    paginator?.last_page ?? 1,

                total:
                    paginator?.total ?? 0,
            });

        } catch (err) {

            console.error(
                'Gagal mengambil data user:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal mengambil data pengguna.'
            );

            setUsers([]);

        } finally {

            setLoading(false);

        }
    };


    // =========================================================
    // LOAD WHEN PAGE / SEARCH CHANGES
    // =========================================================

    useEffect(() => {

        loadUsers();

    }, [page, search]);


    // =========================================================
    // PAGINATION
    // =========================================================

    const goToPage = (newPage) => {

        if (
            newPage >= 1 &&
            newPage <= pagination.last_page
        ) {

            setPage(newPage);

        }
    };


    // =========================================================
    // FORM INPUT
    // =========================================================

    const handleInputChange = (event) => {

        const {
            name,
            value,
        } = event.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));

        setFormErrors((prev) => ({
            ...prev,
            [name]: undefined,
        }));
    };


    // =========================================================
    // CREATE MODAL
    // =========================================================

    const openCreateModal = () => {

        setModalMode('create');

        setSelectedUser(null);

        setForm({
            name: '',
            email: '',
            no_whatsapp: '',
            password: '',
        });

        setFormErrors({});

        setError('');

        setShowModal(true);
    };


    // =========================================================
    // EDIT MODAL
    // =========================================================

    const openEditModal = (user) => {

        setModalMode('edit');

        setSelectedUser(user);

        setForm({
            name: user?.name ?? '',
            email: user?.email ?? '',
            no_whatsapp: user?.no_whatsapp ?? '',
            password: '',
        });

        setFormErrors({});

        setError('');

        setShowModal(true);
    };


    // =========================================================
    // CLOSE MODAL
    // =========================================================

    const closeModal = () => {

        if (saving) {
            return;
        }

        setShowModal(false);

        setSelectedUser(null);

        setFormErrors({});
    };


    // =========================================================
    // VALIDATE FORM
    // =========================================================

    const validateForm = () => {

        const errors = {};

        if (!form.name.trim()) {

            errors.name =
                'Nama wajib diisi.';
        }

        if (!form.email.trim()) {

            errors.email =
                'Email wajib diisi.';
        }

        if (modalMode === 'create') {

            if (!form.password) {

                errors.password =
                    'Password wajib diisi.';

            } else if (
                form.password.length < 8
            ) {

                errors.password =
                    'Password minimal 8 karakter.';
            }

        } else if (
            form.password &&
            form.password.length < 8
        ) {

            errors.password =
                'Password minimal 8 karakter.';
        }

        setFormErrors(errors);

        return Object.keys(errors).length === 0;
    };


    // =========================================================
    // SUBMIT
    // =========================================================

    const handleSubmit = async (event) => {

        event.preventDefault();

        setError('');

        setSuccess('');

        if (!validateForm()) {
            return;
        }

        setSaving(true);

        try {

            // =================================================
            // CREATE
            // =================================================

            if (modalMode === 'create') {

                await UserService.createUser({

                    name: form.name,

                    email: form.email,

                    no_whatsapp:
                        form.no_whatsapp || null,

                    password: form.password,
                });

                setSuccess(
                    'User berhasil ditambahkan.'
                );

            }

            // =================================================
            // UPDATE
            // =================================================

            else {

                const payload = {

                    name: form.name,

                    email: form.email,

                    no_whatsapp:
                        form.no_whatsapp || null,
                };

                if (form.password) {

                    payload.password =
                        form.password;
                }

                await UserService.updateUser(
                    selectedUser.id,
                    payload
                );

                setSuccess(
                    'User berhasil diperbarui.'
                );
            }

            // =================================================
            // RESET
            // =================================================

            setShowModal(false);

            setSelectedUser(null);

            setForm({
                name: '',
                email: '',
                no_whatsapp: '',
                password: '',
            });

            setFormErrors({});

            await loadUsers();

        } catch (err) {

            console.error(
                'Gagal menyimpan user:',
                err
            );

            if (
                err?.response?.status === 422 &&
                err?.response?.data?.errors
            ) {

                setFormErrors(
                    err.response.data.errors
                );

            } else {

                setError(
                    err?.response?.data?.message ||
                    'Gagal menyimpan pengguna.'
                );
            }

        } finally {

            setSaving(false);
        }
    };


    // =========================================================
    // DELETE
    // =========================================================

    const handleDelete = async (user) => {

        const confirmed =
            window.confirm(
                `Apakah Anda yakin ingin menghapus user "${user.name}"?`
            );

        if (!confirmed) {
            return;
        }

        setLoading(true);

        setError('');

        setSuccess('');

        try {

            await UserService.deleteUser(
                user.id
            );

            setSuccess(
                'User berhasil dihapus.'
            );

            await loadUsers();

        } catch (err) {

            console.error(
                'Gagal menghapus user:',
                err
            );

            setError(
                err?.response?.data?.message ||
                'Gagal menghapus pengguna.'
            );

        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // FIELD ERROR
    // =========================================================

    const getFieldError = (field) => {

        const value =
            formErrors?.[field];

        return Array.isArray(value)
            ? value[0]
            : value;
    };


    // =========================================================
    // RENDER
    // =========================================================

    return (

        /*
         * =====================================================
         * PAGE AREA
         *
         * TOP NAVBAR    = 64px
         * BOTTOM NAVBAR = 60px
         *
         * Content diberi ruang agar tidak tertutup navbar.
         * =====================================================
         */

        <div
            className="
                relative
                min-h-[calc(100vh-124px)]
                space-y-5
                pb-[60px]
            "
        >


            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
                flex
                flex-col
                gap-4
                sm:flex-row
                sm:items-center
                sm:justify-between
            ">

                <div>

                    <h1 className="
                        text-2xl
                        font-black
                        tracking-tight
                        text-slate-900
                    ">

                        Manajemen Pengguna

                    </h1>

                    <p className="
                        mt-1
                        text-sm
                        text-slate-500
                    ">

                        Kelola akun pengguna dan akses sistem.

                    </p>

                </div>


                <div className="
                    flex
                    items-center
                    gap-2
                ">

                    <button
                        type="button"
                        onClick={loadUsers}
                        disabled={loading}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            border
                            border-slate-200
                            bg-white
                            px-3.5
                            py-2.5
                            text-sm
                            font-semibold
                            text-slate-600
                            shadow-sm
                            transition-all
                            hover:bg-slate-50
                            disabled:cursor-not-allowed
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

                        <span>
                            Refresh
                        </span>

                    </button>


                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="
                            flex
                            items-center
                            gap-2
                            rounded-xl
                            bg-blue-600
                            px-3.5
                            py-2.5
                            text-sm
                            font-bold
                            text-white
                            shadow-sm
                            transition-all
                            hover:bg-blue-700
                        "
                    >

                        <Plus size={16} />

                        <span>
                            Tambah User
                        </span>

                    </button>

                </div>

            </div>


            {/* =================================================
                SUCCESS ALERT
            ================================================= */}

            {success && (

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-emerald-100
                    bg-emerald-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-emerald-700
                ">

                    <span>
                        {success}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setSuccess('')
                        }
                        className="
                            rounded-lg
                            p-1
                            transition
                            hover:bg-emerald-100
                        "
                    >

                        <X size={15} />

                    </button>

                </div>

            )}


            {/* =================================================
                ERROR ALERT
            ================================================= */}

            {error && (

                <div className="
                    flex
                    items-center
                    justify-between
                    gap-3
                    rounded-xl
                    border
                    border-rose-100
                    bg-rose-50
                    px-4
                    py-3
                    text-sm
                    font-semibold
                    text-rose-600
                ">

                    <span>
                        {error}
                    </span>

                    <button
                        type="button"
                        onClick={() =>
                            setError('')
                        }
                        className="
                            rounded-lg
                            p-1
                            transition
                            hover:bg-rose-100
                        "
                    >

                        <X size={15} />

                    </button>

                </div>

            )}


            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div className="
                overflow-hidden
                rounded-2xl
                border
                border-slate-200
                bg-white
                shadow-sm
            ">


                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div className="
                    flex
                    flex-col
                    gap-3
                    border-b
                    border-slate-100
                    p-4
                    sm:flex-row
                    sm:items-center
                    sm:justify-between
                ">

                    <div className="
                        relative
                        w-full
                        sm:max-w-md
                    ">

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
                            type="text"
                            value={search}
                            onChange={(event) => {

                                setSearch(
                                    event.target.value
                                );

                                setPage(1);
                            }}
                            placeholder="
                                Cari nama, email, atau WhatsApp...
                            "
                            className="
                                w-full
                                rounded-xl
                                border
                                border-slate-200
                                bg-slate-50
                                py-2.5
                                pl-10
                                pr-3
                                text-sm
                                text-slate-700
                                outline-none
                                transition-all
                                focus:border-blue-400
                                focus:bg-white
                                focus:ring-2
                                focus:ring-blue-100
                            "
                        />

                    </div>


                    <div className="
                        text-sm
                        font-medium
                        text-slate-500
                    ">

                        Total:

                        <span className="
                            ml-1
                            font-black
                            text-slate-800
                        ">

                            {pagination.total}

                        </span>

                        <span className="ml-1">
                            pengguna
                        </span>

                    </div>

                </div>


                {/* =================================================
                    DESKTOP TABLE
                ================================================= */}

                <div className="
                    hidden
                    overflow-x-auto
                    md:block
                ">

                    <table className="
                        w-full
                        border-collapse
                        text-left
                    ">

                        <thead>

                            <tr className="
                                border-b
                                border-slate-100
                                bg-slate-50
                                text-xs
                                font-black
                                uppercase
                                tracking-wider
                                text-slate-500
                            ">

                                <th className="px-5 py-3.5">
                                    Pengguna
                                </th>

                                <th className="px-5 py-3.5">
                                    Email
                                </th>

                                <th className="px-5 py-3.5">
                                    WhatsApp
                                </th>

                                <th className="
                                    px-5
                                    py-3.5
                                    text-center
                                ">
                                    Status
                                </th>

                                <th className="
                                    px-5
                                    py-3.5
                                    text-right
                                ">
                                    Aksi
                                </th>

                            </tr>

                        </thead>


                        <tbody className="
                            divide-y
                            divide-slate-100
                            text-sm
                        ">

                            {/* LOADING */}

                            {loading && (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="
                                            px-5
                                            py-10
                                            text-center
                                            text-sm
                                            text-slate-400
                                        "
                                    >

                                        <div className="
                                            flex
                                            items-center
                                            justify-center
                                            gap-2
                                        ">

                                            <RefreshCw
                                                size={17}
                                                className="animate-spin"
                                            />

                                            Memuat data...

                                        </div>

                                    </td>

                                </tr>

                            )}


                            {/* EMPTY */}

                            {!loading &&
                                users.length === 0 && (

                                    <tr>

                                        <td
                                            colSpan="5"
                                            className="
                                                px-5
                                                py-10
                                                text-center
                                                text-sm
                                                font-semibold
                                                text-slate-400
                                            "
                                        >

                                            Tidak ada data pengguna.

                                        </td>

                                    </tr>

                                )}


                            {/* DATA */}

                            {!loading &&
                                users.length > 0 &&
                                users.map((user) => (

                                    <tr
                                        key={user.id}
                                        className="
                                            transition-colors
                                            hover:bg-slate-50
                                        "
                                    >

                                        {/* USER */}

                                        <td className="px-5 py-4">

                                            <div className="
                                                flex
                                                items-center
                                                gap-3
                                            ">

                                                <div className="
                                                    flex
                                                    h-9
                                                    w-9
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-blue-50
                                                    text-sm
                                                    font-black
                                                    text-blue-600
                                                ">

                                                    {user.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}

                                                </div>

                                                <div className="min-w-0">

                                                    <p className="
                                                        truncate
                                                        text-sm
                                                        font-black
                                                        text-slate-800
                                                    ">

                                                        {user.name}

                                                    </p>

                                                    <p className="
                                                        mt-0.5
                                                        truncate
                                                        text-xs
                                                        text-slate-400
                                                    ">

                                                        ID: {user.id}

                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* EMAIL */}

                                        <td className="
                                            px-5
                                            py-4
                                            text-sm
                                            text-slate-600
                                        ">

                                            <div className="
                                                flex
                                                max-w-xs
                                                items-center
                                                gap-2
                                            ">

                                                <Mail
                                                    size={15}
                                                    className="
                                                        shrink-0
                                                        text-slate-400
                                                    "
                                                />

                                                <span className="truncate">

                                                    {user.email || '-'}

                                                </span>

                                            </div>

                                        </td>


                                        {/* WHATSAPP */}

                                        <td className="
                                            px-5
                                            py-4
                                            text-sm
                                            text-slate-600
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                gap-2
                                            ">

                                                <Phone
                                                    size={15}
                                                    className="
                                                        shrink-0
                                                        text-slate-400
                                                    "
                                                />

                                                <span>

                                                    {user.no_whatsapp || '-'}

                                                </span>

                                            </div>

                                        </td>


                                        {/* STATUS */}

                                        <td className="
                                            px-5
                                            py-4
                                            text-center
                                        ">

                                            <span className="
                                                inline-flex
                                                items-center
                                                gap-1.5
                                                rounded-full
                                                bg-emerald-50
                                                px-2.5
                                                py-1
                                                text-xs
                                                font-black
                                                text-emerald-600
                                            ">

                                                <ShieldCheck
                                                    size={13}
                                                />

                                                Aktif

                                            </span>

                                        </td>


                                        {/* ACTION */}

                                        <td className="
                                            px-5
                                            py-4
                                            text-right
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                justify-end
                                                gap-1.5
                                            ">

                                                {/* EDIT */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openEditModal(user)
                                                    }
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-blue-50
                                                        text-blue-600
                                                        transition-all
                                                        hover:bg-blue-100
                                                    "
                                                    title="Edit"
                                                >

                                                    <Pencil
                                                        size={15}
                                                    />

                                                </button>


                                                {/* MATRIX */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        openMatrixModal(user)
                                                    }
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-violet-50
                                                        text-violet-600
                                                        transition-all
                                                        hover:bg-violet-100
                                                    "
                                                    title="Matrix Akses"
                                                >

                                                    <Shield
                                                        size={15}
                                                    />

                                                </button>


                                                {/* DELETE */}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleDelete(user)
                                                    }
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        bg-rose-50
                                                        text-rose-600
                                                        transition-all
                                                        hover:bg-rose-100
                                                    "
                                                    title="Hapus"
                                                >

                                                    <Trash2
                                                        size={15}
                                                    />

                                                </button>

                                            </div>

                                        </td>

                                    </tr>

                                ))}

                        </tbody>

                    </table>

                </div>


                {/* =================================================
                    MOBILE LIST
                ================================================= */}

                <div className="
                    divide-y
                    divide-slate-100
                    text-sm
                    md:hidden
                ">

                    {loading && (

                        <div className="
                            flex
                            items-center
                            justify-center
                            gap-2
                            p-8
                            text-sm
                            text-slate-400
                        ">

                            <RefreshCw
                                size={17}
                                className="animate-spin"
                            />

                            Memuat data...

                        </div>

                    )}


                    {!loading &&
                        users.length === 0 && (

                            <div className="
                                p-8
                                text-center
                                text-sm
                                font-semibold
                                text-slate-400
                            ">

                                Tidak ada data pengguna.

                            </div>

                        )}


                    {!loading &&
                        users.length > 0 &&
                        users.map((user) => (

                            <div
                                key={user.id}
                                className="
                                    space-y-3
                                    p-5
                                    transition-colors
                                    hover:bg-slate-50
                                "
                            >

                                <div className="
                                    flex
                                    items-start
                                    justify-between
                                    gap-3
                                ">

                                    <div className="
                                        flex
                                        min-w-0
                                        items-center
                                        gap-3
                                    ">

                                        <div className="
                                            flex
                                            h-9
                                            w-9
                                            shrink-0
                                            items-center
                                            justify-center
                                            rounded-xl
                                            bg-blue-50
                                            text-sm
                                            font-black
                                            text-blue-600
                                        ">

                                            {user.name
                                                ?.charAt(0)
                                                ?.toUpperCase()}

                                        </div>

                                        <div className="min-w-0">

                                            <p className="
                                                truncate
                                                text-sm
                                                font-black
                                                text-slate-800
                                            ">

                                                {user.name}

                                            </p>

                                            <p className="
                                                mt-0.5
                                                truncate
                                                text-xs
                                                text-slate-400
                                            ">

                                                ID: {user.id}

                                            </p>

                                        </div>

                                    </div>


                                    <span className="
                                        inline-flex
                                        shrink-0
                                        items-center
                                        gap-1.5
                                        rounded-full
                                        bg-emerald-50
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-black
                                        text-emerald-600
                                    ">

                                        <ShieldCheck
                                            size={13}
                                        />

                                        Aktif

                                    </span>

                                </div>


                                <div className="
                                    space-y-2
                                    text-sm
                                    text-slate-600
                                ">

                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                        truncate
                                    ">

                                        <Mail
                                            size={15}
                                            className="
                                                shrink-0
                                                text-slate-400
                                            "
                                        />

                                        <span className="truncate">

                                            {user.email || '-'}

                                        </span>

                                    </div>


                                    <div className="
                                        flex
                                        items-center
                                        gap-2
                                    ">

                                        <Phone
                                            size={15}
                                            className="
                                                shrink-0
                                                text-slate-400
                                            "
                                        />

                                        <span>

                                            {user.no_whatsapp || '-'}

                                        </span>

                                    </div>

                                </div>


                                <div className="
                                    flex
                                    gap-2
                                    border-t
                                    border-slate-100
                                    pt-3
                                ">

                                    <button
                                        type="button"
                                        onClick={() =>
                                            openEditModal(user)
                                        }
                                        className="
                                            flex
                                            h-9
                                            flex-1
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-lg
                                            bg-blue-50
                                            text-sm
                                            font-bold
                                            text-blue-600
                                            transition-all
                                            hover:bg-blue-100
                                        "
                                    >

                                        <Pencil
                                            size={15}
                                        />

                                        Edit

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            openMatrixModal(user)
                                        }
                                        className="
                                            flex
                                            h-9
                                            flex-1
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-lg
                                            bg-violet-50
                                            text-sm
                                            font-bold
                                            text-violet-600
                                            transition-all
                                            hover:bg-violet-100
                                        "
                                    >

                                        <Shield
                                            size={15}
                                        />

                                        Matrix

                                    </button>


                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleDelete(user)
                                        }
                                        className="
                                            flex
                                            h-9
                                            flex-1
                                            items-center
                                            justify-center
                                            gap-2
                                            rounded-lg
                                            bg-rose-50
                                            text-sm
                                            font-bold
                                            text-rose-600
                                            transition-all
                                            hover:bg-rose-100
                                        "
                                    >

                                        <Trash2
                                            size={15}
                                        />

                                        Hapus

                                    </button>

                                </div>

                            </div>

                        ))}

                </div>


                {/* =================================================
                    PAGINATION
                ================================================= */}

                {pagination.last_page > 1 && (

                    <div className="
                        flex
                        items-center
                        justify-between
                        border-t
                        border-slate-100
                        px-5
                        py-4
                        text-sm
                    ">

                        <button
                            type="button"
                            onClick={() =>
                                goToPage(
                                    pagination.current_page - 1
                                )
                            }
                            disabled={
                                pagination.current_page <= 1
                            }
                            className="
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                py-2
                                font-semibold
                                text-slate-600
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >

                            Sebelumnya

                        </button>


                        <div className="
                            text-slate-500
                        ">

                            Halaman

                            <span className="
                                mx-1
                                font-black
                                text-slate-800
                            ">

                                {pagination.current_page}

                            </span>

                            dari

                            <span className="
                                ml-1
                                font-black
                                text-slate-800
                            ">

                                {pagination.last_page}

                            </span>

                        </div>


                        <button
                            type="button"
                            onClick={() =>
                                goToPage(
                                    pagination.current_page + 1
                                )
                            }
                            disabled={
                                pagination.current_page >=
                                pagination.last_page
                            }
                            className="
                                rounded-lg
                                border
                                border-slate-200
                                px-3
                                py-2
                                font-semibold
                                text-slate-600
                                transition
                                hover:bg-slate-50
                                disabled:cursor-not-allowed
                                disabled:opacity-40
                            "
                        >

                            Berikutnya

                        </button>

                    </div>

                )}

            </div>


            {/* =====================================================
                USER MATRIX MODAL
                AREA:
                TOP    = 64px
                BOTTOM = 60px
            ===================================================== */}

            {showMatrix && (

                <div className="
                    fixed
                    inset-x-0
                    top-16
                    bottom-[60px]
                    z-[60]
                    flex
                    items-center
                    justify-center
                    p-4
                ">

                    {/* BACKDROP */}

                    <div
                        className="
                            absolute
                            inset-0
                            bg-slate-900/60
                            backdrop-blur-sm
                        "
                        onClick={closeMatrixModal}
                    />


                    {/* MODAL */}

                    <div className="
                        relative
                        flex
                        max-h-full
                        w-full
                        max-w-3xl
                        flex-col
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        shadow-2xl
                    ">


                        {/* HEADER */}

                        <div className="
                            flex
                            shrink-0
                            items-center
                            justify-between
                            border-b
                            border-slate-100
                            px-6
                            py-5
                        ">

                            <div className="
                                flex
                                items-center
                                gap-3
                            ">

                                <div className="
                                    flex
                                    h-10
                                    w-10
                                    items-center
                                    justify-center
                                    rounded-xl
                                    bg-violet-50
                                    text-violet-600
                                ">

                                    <Shield
                                        size={19}
                                    />

                                </div>


                                <div>

                                    <h2 className="
                                        text-xl
                                        font-black
                                        text-slate-900
                                    ">

                                        Matrix Akses User

                                    </h2>

                                    <p className="
                                        mt-0.5
                                        text-sm
                                        text-slate-500
                                    ">

                                        Role, permission, dan struktur organisasi.

                                    </p>

                                </div>

                            </div>


                            <button
                                type="button"
                                onClick={closeMatrixModal}
                                disabled={matrixLoading}
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition-all
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                "
                            >

                                <X size={19} />

                            </button>

                        </div>


                        {/* CONTENT */}

                        <div className="
                            min-h-0
                            flex-1
                            overflow-y-auto
                            p-6
                        ">


                            {/* LOADING */}

                            {matrixLoading && (

                                <div className="
                                    flex
                                    min-h-[300px]
                                    flex-col
                                    items-center
                                    justify-center
                                    gap-3
                                    text-sm
                                    text-slate-400
                                ">

                                    <RefreshCw
                                        size={24}
                                        className="animate-spin"
                                    />

                                    <span>
                                        Memuat matrix akses...
                                    </span>

                                </div>

                            )}


                            {/* ERROR */}

                            {!matrixLoading &&
                                matrixError && (

                                    <div className="
                                        rounded-xl
                                        border
                                        border-rose-100
                                        bg-rose-50
                                        p-4
                                        text-sm
                                        font-semibold
                                        text-rose-600
                                    ">

                                        {matrixError}

                                    </div>

                                )}


                            {/* MATRIX */}

                            {!matrixLoading &&
                                !matrixError &&
                                matrix && (

                                    <div className="
                                        space-y-5
                                    ">


                                        {/* USER INFO */}

                                        <div className="
                                            rounded-2xl
                                            border
                                            border-slate-200
                                            bg-slate-50
                                            p-4
                                        ">

                                            <div className="
                                                flex
                                                items-center
                                                gap-3
                                            ">

                                                <div className="
                                                    flex
                                                    h-11
                                                    w-11
                                                    shrink-0
                                                    items-center
                                                    justify-center
                                                    rounded-xl
                                                    bg-blue-100
                                                    text-base
                                                    font-black
                                                    text-blue-600
                                                ">

                                                    {matrix.user?.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()}

                                                </div>


                                                <div className="min-w-0">

                                                    <p className="
                                                        truncate
                                                        text-base
                                                        font-black
                                                        text-slate-900
                                                    ">

                                                        {matrix.user?.name}

                                                    </p>


                                                    <p className="
                                                        truncate
                                                        text-sm
                                                        text-slate-500
                                                    ">

                                                        {matrix.user?.email}

                                                    </p>

                                                </div>

                                            </div>

                                        </div>


                                        {/* ROLE */}

                                        <section>

                                            <div className="
                                                mb-3
                                                flex
                                                items-center
                                                gap-2
                                            ">

                                                <Shield
                                                    size={17}
                                                    className="
                                                        text-violet-600
                                                    "
                                                />

                                                <h3 className="
                                                    text-sm
                                                    font-black
                                                    uppercase
                                                    tracking-wider
                                                    text-slate-700
                                                ">

                                                    Role

                                                </h3>

                                            </div>


                                            <div className="
                                                flex
                                                flex-wrap
                                                gap-2
                                            ">

                                                {Array.isArray(
                                                    matrix.roles
                                                ) &&
                                                matrix.roles.length > 0
                                                    ? matrix.roles.map(
                                                        (role) => (

                                                            <span
                                                                key={role}
                                                                className="
                                                                    inline-flex
                                                                    items-center
                                                                    gap-1.5
                                                                    rounded-full
                                                                    bg-violet-50
                                                                    px-3
                                                                    py-1.5
                                                                    text-xs
                                                                    font-black
                                                                    text-violet-700
                                                                "
                                                            >

                                                                <Shield
                                                                    size={13}
                                                                />

                                                                {role}

                                                            </span>

                                                        )
                                                    )
                                                    : (

                                                        <span className="
                                                            text-sm
                                                            text-slate-400
                                                        ">

                                                            Tidak memiliki role.

                                                        </span>

                                                    )}

                                            </div>

                                        </section>


                                        {/* PERMISSIONS */}

                                        <section>

                                            <div className="
                                                mb-3
                                                flex
                                                items-center
                                                justify-between
                                            ">

                                                <div className="
                                                    flex
                                                    items-center
                                                    gap-2
                                                ">

                                                    <ShieldCheck
                                                        size={17}
                                                        className="
                                                            text-emerald-600
                                                        "
                                                    />

                                                    <h3 className="
                                                        text-sm
                                                        font-black
                                                        uppercase
                                                        tracking-wider
                                                        text-slate-700
                                                    ">

                                                        Permissions

                                                    </h3>

                                                </div>


                                                <span className="
                                                    rounded-full
                                                    bg-emerald-50
                                                    px-2.5
                                                    py-1
                                                    text-xs
                                                    font-black
                                                    text-emerald-700
                                                ">

                                                    {
                                                        matrix.permissions
                                                            ?.length ?? 0
                                                    }

                                                </span>

                                            </div>


                                            {Array.isArray(
                                                matrix.permissions
                                            ) &&
                                            matrix.permissions.length > 0
                                                ? (

                                                    <div className="
                                                        grid
                                                        gap-2
                                                        sm:grid-cols-2
                                                    ">

                                                        {matrix.permissions.map(
                                                            (permission) => (

                                                                <div
                                                                    key={
                                                                        permission
                                                                    }
                                                                    className="
                                                                        flex
                                                                        items-center
                                                                        gap-2
                                                                        rounded-xl
                                                                        border
                                                                        border-slate-100
                                                                        bg-white
                                                                        px-3
                                                                        py-2.5
                                                                        shadow-sm
                                                                    "
                                                                >

                                                                    <div className="
                                                                        flex
                                                                        h-6
                                                                        w-6
                                                                        shrink-0
                                                                        items-center
                                                                        justify-center
                                                                        rounded-lg
                                                                        bg-emerald-50
                                                                        text-emerald-600
                                                                    ">

                                                                        <ShieldCheck
                                                                            size={
                                                                                14
                                                                            }
                                                                        />

                                                                    </div>


                                                                    <span className="
                                                                        break-all
                                                                        text-xs
                                                                        font-semibold
                                                                        text-slate-600
                                                                    ">

                                                                        {
                                                                            permission
                                                                        }

                                                                    </span>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )
                                                : (

                                                    <div className="
                                                        rounded-xl
                                                        border
                                                        border-dashed
                                                        border-slate-200
                                                        p-6
                                                        text-center
                                                        text-sm
                                                        text-slate-400
                                                    ">

                                                        Tidak memiliki permission.

                                                    </div>

                                                )}

                                        </section>


                                        {/* ORGANIZATION */}

                                        <section>

                                            <div className="
                                                mb-3
                                                flex
                                                items-center
                                                gap-2
                                            ">

                                                <Building2
                                                    size={17}
                                                    className="
                                                        text-blue-600
                                                    "
                                                />

                                                <h3 className="
                                                    text-sm
                                                    font-black
                                                    uppercase
                                                    tracking-wider
                                                    text-slate-700
                                                ">

                                                    Struktur Organisasi

                                                </h3>

                                            </div>


                                            {Array.isArray(
                                                matrix.assignments
                                            ) &&
                                            matrix.assignments.length > 0
                                                ? (

                                                    <div className="
                                                        space-y-3
                                                    ">

                                                        {matrix.assignments.map(
                                                            (assignment) => (

                                                                <div
                                                                    key={
                                                                        assignment.id
                                                                    }
                                                                    className="
                                                                        rounded-xl
                                                                        border
                                                                        border-slate-200
                                                                        bg-white
                                                                        p-4
                                                                    "
                                                                >

                                                                    <div className="
                                                                        flex
                                                                        flex-col
                                                                        gap-3
                                                                        sm:flex-row
                                                                        sm:items-center
                                                                        sm:justify-between
                                                                    ">


                                                                        {/* UNIT */}

                                                                        <div className="
                                                                            flex
                                                                            items-start
                                                                            gap-3
                                                                        ">

                                                                            <div className="
                                                                                mt-0.5
                                                                                flex
                                                                                h-9
                                                                                w-9
                                                                                shrink-0
                                                                                items-center
                                                                                justify-center
                                                                                rounded-lg
                                                                                bg-blue-50
                                                                                text-blue-600
                                                                            ">

                                                                                <Building2
                                                                                    size={
                                                                                        16
                                                                                    }
                                                                                />

                                                                            </div>


                                                                            <div>

                                                                                <p className="
                                                                                    text-sm
                                                                                    font-black
                                                                                    text-slate-800
                                                                                ">

                                                                                    {assignment
                                                                                        .organization_unit
                                                                                        ?.name ||
                                                                                        '-'}

                                                                                </p>


                                                                                <p className="
                                                                                    mt-0.5
                                                                                    text-xs
                                                                                    text-slate-400
                                                                                ">

                                                                                    {assignment
                                                                                        .organization_unit
                                                                                        ?.code ||
                                                                                        '-'}
                                                                                    {' · '}
                                                                                    {assignment
                                                                                        .organization_unit
                                                                                        ?.type ||
                                                                                        '-'}

                                                                                </p>

                                                                            </div>

                                                                        </div>


                                                                        {/* LEVEL */}

                                                                        <div className="
                                                                            flex
                                                                            flex-wrap
                                                                            items-center
                                                                            gap-2
                                                                        ">

                                                                            <span className="
                                                                                rounded-lg
                                                                                bg-slate-100
                                                                                px-2.5
                                                                                py-1.5
                                                                                text-xs
                                                                                font-bold
                                                                                text-slate-600
                                                                            ">

                                                                                {assignment
                                                                                    .organization_level
                                                                                    ?.name ||
                                                                                    '-'}

                                                                            </span>


                                                                            {assignment.is_primary && (

                                                                                <span className="
                                                                                    rounded-lg
                                                                                    bg-blue-50
                                                                                    px-2.5
                                                                                    py-1.5
                                                                                    text-xs
                                                                                    font-black
                                                                                    text-blue-600
                                                                                ">

                                                                                    Primary

                                                                                </span>

                                                                            )}


                                                                            {!assignment.is_primary && (

                                                                                <span className="
                                                                                    rounded-lg
                                                                                    bg-slate-50
                                                                                    px-2.5
                                                                                    py-1.5
                                                                                    text-xs
                                                                                    font-bold
                                                                                    text-slate-500
                                                                                ">

                                                                                    Secondary

                                                                                </span>

                                                                            )}


                                                                            {assignment.is_active && (

                                                                                <span className="
                                                                                    rounded-lg
                                                                                    bg-emerald-50
                                                                                    px-2.5
                                                                                    py-1.5
                                                                                    text-xs
                                                                                    font-black
                                                                                    text-emerald-600
                                                                                ">

                                                                                    Aktif

                                                                                </span>

                                                                            )}

                                                                        </div>

                                                                    </div>

                                                                </div>

                                                            )
                                                        )}

                                                    </div>

                                                )
                                                : (

                                                    <div className="
                                                        rounded-xl
                                                        border
                                                        border-dashed
                                                        border-slate-200
                                                        p-6
                                                        text-center
                                                        text-sm
                                                        text-slate-400
                                                    ">

                                                        User belum memiliki
                                                        assignment organisasi.

                                                    </div>

                                                )}

                                        </section>

                                    </div>

                                )}

                        </div>


                        {/* FOOTER */}

                        <div className="
                            flex
                            shrink-0
                            justify-end
                            border-t
                            border-slate-100
                            px-6
                            py-4
                        ">

                            <button
                                type="button"
                                onClick={closeMatrixModal}
                                disabled={matrixLoading}
                                className="
                                    rounded-xl
                                    border
                                    border-slate-200
                                    bg-white
                                    px-4
                                    py-2.5
                                    text-sm
                                    font-bold
                                    text-slate-600
                                    transition-all
                                    hover:bg-slate-50
                                "
                            >

                                Tutup

                            </button>

                        </div>

                    </div>

                </div>

            )}


            {/* =====================================================
                CREATE / EDIT USER MODAL
                AREA:
                TOP    = 64px
                BOTTOM = 60px
            ===================================================== */}

            {showModal && (

                <div className="
                    fixed
                    inset-x-0
                    top-16
                    bottom-[60px]
                    z-[50]
                    flex
                    items-center
                    justify-center
                    overflow-y-auto
                    p-4
                ">

                    {/* BACKDROP */}

                    <div
                        className="
                            absolute
                            inset-0
                            bg-slate-900/50
                            backdrop-blur-sm
                        "
                        onClick={closeModal}
                    />


                    {/* MODAL */}

                    <div className="
                        relative
                        max-h-full
                        w-full
                        max-w-lg
                        overflow-hidden
                        rounded-2xl
                        bg-white
                        shadow-2xl
                    ">


                        {/* MODAL HEADER */}

                        <div className="
                            flex
                            items-center
                            justify-between
                            border-b
                            border-slate-100
                            px-6
                            py-5
                        ">

                            <div>

                                <h2 className="
                                    text-xl
                                    font-black
                                    text-slate-900
                                ">

                                    {modalMode === 'create'
                                        ? 'Tambah User'
                                        : 'Edit User'}

                                </h2>


                                <p className="
                                    mt-1
                                    text-sm
                                    text-slate-500
                                ">

                                    {modalMode === 'create'
                                        ? 'Buat akun pengguna baru.'
                                        : 'Perbarui informasi pengguna.'}

                                </p>

                            </div>


                            <button
                                type="button"
                                onClick={closeModal}
                                disabled={saving}
                                className="
                                    flex
                                    h-9
                                    w-9
                                    items-center
                                    justify-center
                                    rounded-lg
                                    text-slate-400
                                    transition-all
                                    hover:bg-slate-100
                                    hover:text-slate-600
                                "
                            >

                                <X size={19} />

                            </button>

                        </div>


                        {/* FORM */}

                        <form
                            onSubmit={handleSubmit}
                            className="
                                max-h-[calc(100vh-180px)]
                                space-y-5
                                overflow-y-auto
                                p-6
                                text-sm
                            "
                        >


                            {/* NAME */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                ">

                                    Nama

                                </label>


                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder="Nama pengguna"
                                    className={`
                                        w-full
                                        rounded-xl
                                        border
                                        px-3.5
                                        py-2.5
                                        text-sm
                                        outline-none
                                        transition-all
                                        ${
                                            getFieldError('name')
                                                ? 'border-rose-300 bg-rose-50'
                                                : 'border-slate-200 bg-slate-50'
                                        }
                                        focus:border-blue-400
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-blue-100
                                    `}
                                />


                                {getFieldError('name') && (

                                    <p className="
                                        mt-1.5
                                        text-xs
                                        text-rose-600
                                    ">

                                        {getFieldError('name')}

                                    </p>

                                )}

                            </div>


                            {/* EMAIL */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                ">

                                    Email

                                </label>


                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder="nama@email.com"
                                    className={`
                                        w-full
                                        rounded-xl
                                        border
                                        px-3.5
                                        py-2.5
                                        text-sm
                                        outline-none
                                        transition-all
                                        ${
                                            getFieldError('email')
                                                ? 'border-rose-300 bg-rose-50'
                                                : 'border-slate-200 bg-slate-50'
                                        }
                                        focus:border-blue-400
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-blue-100
                                    `}
                                />


                                {getFieldError('email') && (

                                    <p className="
                                        mt-1.5
                                        text-xs
                                        text-rose-600
                                    ">

                                        {getFieldError('email')}

                                    </p>

                                )}

                            </div>


                            {/* WHATSAPP */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                ">

                                    WhatsApp

                                </label>


                                <input
                                    type="text"
                                    name="no_whatsapp"
                                    value={form.no_whatsapp}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder="08xxxxxxxxxx"
                                    className={`
                                        w-full
                                        rounded-xl
                                        border
                                        px-3.5
                                        py-2.5
                                        text-sm
                                        outline-none
                                        transition-all
                                        ${
                                            getFieldError('no_whatsapp')
                                                ? 'border-rose-300 bg-rose-50'
                                                : 'border-slate-200 bg-slate-50'
                                        }
                                        focus:border-blue-400
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-blue-100
                                    `}
                                />


                                {getFieldError('no_whatsapp') && (

                                    <p className="
                                        mt-1.5
                                        text-xs
                                        text-rose-600
                                    ">

                                        {getFieldError('no_whatsapp')}

                                    </p>

                                )}

                            </div>


                            {/* PASSWORD */}

                            <div>

                                <label className="
                                    mb-2
                                    block
                                    text-sm
                                    font-bold
                                    text-slate-700
                                ">

                                    Password

                                    {modalMode === 'edit' && (

                                        <span className="
                                            ml-1
                                            font-normal
                                            text-slate-400
                                        ">

                                            (kosongkan jika tidak diubah)

                                        </span>

                                    )}

                                </label>


                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder={
                                        modalMode === 'create'
                                            ? 'Minimal 8 karakter'
                                            : 'Kosongkan jika tidak diubah'
                                    }
                                    className={`
                                        w-full
                                        rounded-xl
                                        border
                                        px-3.5
                                        py-2.5
                                        text-sm
                                        outline-none
                                        transition-all
                                        ${
                                            getFieldError('password')
                                                ? 'border-rose-300 bg-rose-50'
                                                : 'border-slate-200 bg-slate-50'
                                        }
                                        focus:border-blue-400
                                        focus:bg-white
                                        focus:ring-2
                                        focus:ring-blue-100
                                    `}
                                />


                                {getFieldError('password') && (

                                    <p className="
                                        mt-1.5
                                        text-xs
                                        text-rose-600
                                    ">

                                        {getFieldError('password')}

                                    </p>

                                )}

                            </div>


                            {/* FOOTER */}

                            <div className="
                                flex
                                justify-end
                                gap-2
                                border-t
                                border-slate-100
                                pt-5
                            ">

                                <button
                                    type="button"
                                    onClick={closeModal}
                                    disabled={saving}
                                    className="
                                        rounded-xl
                                        border
                                        border-slate-200
                                        bg-white
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-bold
                                        text-slate-600
                                        transition-all
                                        hover:bg-slate-50
                                    "
                                >

                                    Batal

                                </button>


                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="
                                        flex
                                        items-center
                                        gap-2
                                        rounded-xl
                                        bg-blue-600
                                        px-4
                                        py-2.5
                                        text-sm
                                        font-bold
                                        text-white
                                        transition-all
                                        hover:bg-blue-700
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >

                                    {saving ? (

                                        <>

                                            <RefreshCw
                                                size={15}
                                                className="animate-spin"
                                            />

                                            Menyimpan...

                                        </>

                                    ) : (

                                        <>

                                            <Save
                                                size={15}
                                            />

                                            {modalMode === 'create'
                                                ? 'Simpan User'
                                                : 'Simpan Perubahan'}

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
