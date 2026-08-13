import React, {
    useEffect,
    useState,
} from 'react';

import {
    Search,
    Plus,
    RefreshCw,
    Pencil,
    Trash2,
    UserRound,
    Mail,
    Phone,
    ShieldCheck,
} from 'lucide-react';

import UserService from '@Modules/Auth/Resources/js/aplikasi/services/UserService';


export default function UserManagement() {

    // =====================================================
    // STATE
    // =====================================================

    const [users, setUsers] = useState([]);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState('');

    const [search, setSearch] = useState('');

    const [page, setPage] = useState(1);

    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0,
    });


    // =====================================================
    // LOAD USERS
    // =====================================================

    const loadUsers = async () => {

        setLoading(true);

        setError('');

        try {

            const response = await UserService.getUsers({
                page,
                search,
            });


            console.log(
                'Response users:',
                response
            );


            /*
             * Backend kita:
             *
             * return response()->json([
             *     'status' => 'success',
             *     'data' => $users,
             * ]);
             *
             * Karena $users adalah paginator,
             * maka:
             *
             * response.data.data
             * = array user
             *
             * response.data.current_page
             * = halaman sekarang
             */


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


    // =====================================================
    // LOAD SAAT PAGE / SEARCH BERUBAH
    // =====================================================

    useEffect(() => {

        loadUsers();

    }, [page, search]);


    // =====================================================
    // SEARCH
    // =====================================================

    const handleSearchChange = (event) => {

        setSearch(
            event.target.value
        );

        setPage(1);

    };


    // =====================================================
    // REFRESH
    // =====================================================

    const handleRefresh = () => {

        loadUsers();

    };


    // =====================================================
    // PAGINATION
    // =====================================================

    const goToPage = (newPage) => {

        if (
            newPage < 1 ||
            newPage > pagination.last_page
        ) {
            return;
        }

        setPage(newPage);

    };


    // =====================================================
    // RENDER
    // =====================================================

    return (

        <div className="space-y-6">

            {/* =================================================
                HEADER
            ================================================= */}

            <div
                className="
                    flex
                    flex-col
                    sm:flex-row

                    sm:items-center
                    sm:justify-between

                    gap-4
                "
            >

                <div>

                    <h1
                        className="
                            text-2xl
                            font-black
                            text-slate-900
                            tracking-tight
                        "
                    >
                        Manajemen Pengguna
                    </h1>


                    <p
                        className="
                            mt-1
                            text-sm
                            text-slate-500
                        "
                    >
                        Kelola akun pengguna dan akses sistem.
                    </p>

                </div>


                {/* ACTION */}

                <div
                    className="
                        flex
                        items-center
                        gap-2
                    "
                >

                    <button
                        type="button"
                        onClick={handleRefresh}
                        disabled={loading}
                        className="
                            flex
                            items-center
                            justify-center

                            gap-2

                            px-4
                            py-2.5

                            rounded-xl

                            border
                            border-slate-200

                            bg-white

                            text-slate-600

                            font-semibold
                            text-sm

                            hover:bg-slate-50

                            disabled:opacity-50

                            transition-all
                        "
                    >

                        <RefreshCw
                            size={16}
                            className={
                                loading
                                    ? 'animate-spin'
                                    : ''
                            }
                        />

                        <span className="hidden sm:inline">
                            Refresh
                        </span>

                    </button>


                    <button
                        type="button"

                        className="
                            flex
                            items-center
                            justify-center

                            gap-2

                            px-4
                            py-2.5

                            rounded-xl

                            bg-blue-600

                            text-white

                            font-bold
                            text-sm

                            hover:bg-blue-700

                            active:scale-[0.98]

                            shadow-sm

                            transition-all
                        "
                    >

                        <Plus size={17} />

                        <span>
                            Tambah User
                        </span>

                    </button>

                </div>

            </div>


            {/* =================================================
                MAIN CARD
            ================================================= */}

            <div
                className="
                    bg-white

                    rounded-[2rem]

                    border
                    border-slate-200

                    shadow-sm

                    overflow-hidden
                "
            >

                {/* =================================================
                    TOOLBAR
                ================================================= */}

                <div
                    className="
                        p-5
                        sm:p-6

                        border-b
                        border-slate-100

                        flex
                        flex-col
                        lg:flex-row

                        gap-4

                        lg:items-center
                        lg:justify-between
                    "
                >

                    {/* SEARCH */}

                    <div
                        className="
                            relative

                            w-full
                            lg:max-w-md
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

                            onChange={
                                handleSearchChange
                            }

                            placeholder="
                                Cari nama, email, atau WhatsApp...
                            "

                            className="
                                w-full

                                pl-10
                                pr-4

                                py-2.5

                                rounded-xl

                                border
                                border-slate-200

                                bg-slate-50

                                text-sm

                                outline-none

                                focus:bg-white

                                focus:border-blue-400

                                focus:ring-2
                                focus:ring-blue-100

                                transition-all
                            "
                        />

                    </div>


                    {/* TOTAL */}

                    <div
                        className="
                            text-sm
                            text-slate-500
                            font-medium
                        "
                    >

                        Total:

                        <span
                            className="
                                ml-1
                                font-black
                                text-slate-800
                            "
                        >
                            {pagination.total}
                        </span>

                        {' '}pengguna

                    </div>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        className="
                            mx-5
                            sm:mx-6
                            mt-5

                            p-4

                            rounded-xl

                            bg-rose-50

                            border
                            border-rose-100

                            text-sm
                            text-rose-600

                            font-semibold
                        "
                    >
                        {error}
                    </div>

                )}


                {/* =================================================
                    TABLE
                ================================================= */}

                <div className="overflow-x-auto">

                    <table
                        className="
                            w-full
                            min-w-[760px]
                        "
                    >

                        <thead>

                            <tr
                                className="
                                    bg-slate-50

                                    border-b
                                    border-slate-100
                                "
                            >

                                <th
                                    className="
                                        px-6
                                        py-4

                                        text-left

                                        text-xs
                                        font-black

                                        uppercase
                                        tracking-wider

                                        text-slate-500
                                    "
                                >
                                    Pengguna
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4

                                        text-left

                                        text-xs
                                        font-black

                                        uppercase
                                        tracking-wider

                                        text-slate-500
                                    "
                                >
                                    Email
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4

                                        text-left

                                        text-xs
                                        font-black

                                        uppercase
                                        tracking-wider

                                        text-slate-500
                                    "
                                >
                                    WhatsApp
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4

                                        text-center

                                        text-xs
                                        font-black

                                        uppercase
                                        tracking-wider

                                        text-slate-500
                                    "
                                >
                                    Status
                                </th>


                                <th
                                    className="
                                        px-6
                                        py-4

                                        text-right

                                        text-xs
                                        font-black

                                        uppercase
                                        tracking-wider

                                        text-slate-500
                                    "
                                >
                                    Aksi
                                </th>

                            </tr>

                        </thead>


                        <tbody
                            className="
                                divide-y
                                divide-slate-100
                            "
                        >

                            {/* LOADING */}

                            {loading && (

                                <tr>

                                    <td
                                        colSpan="5"
                                        className="
                                            px-6
                                            py-12

                                            text-center
                                        "
                                    >

                                        <div
                                            className="
                                                flex
                                                items-center
                                                justify-center

                                                gap-2

                                                text-slate-400

                                                text-sm
                                            "
                                        >

                                            <RefreshCw
                                                size={18}
                                                className="animate-spin"
                                            />

                                            Memuat data pengguna...

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
                                                px-6
                                                py-12

                                                text-center
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    flex-col

                                                    items-center

                                                    text-slate-400
                                                "
                                            >

                                                <UserRound
                                                    size={40}
                                                    strokeWidth={1.5}
                                                />

                                                <p
                                                    className="
                                                        mt-3

                                                        text-sm

                                                        font-semibold
                                                    "
                                                >
                                                    Tidak ada data pengguna.
                                                </p>

                                            </div>

                                        </td>

                                    </tr>

                                )}


                            {/* DATA */}

                            {!loading &&
                                users.map((user) => (

                                    <tr
                                        key={user.id}

                                        className="
                                            hover:bg-slate-50

                                            transition-colors
                                        "
                                    >

                                        {/* USER */}

                                        <td
                                            className="
                                                px-6
                                                py-4
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
                                                        w-10
                                                        h-10

                                                        rounded-xl

                                                        bg-blue-50

                                                        flex
                                                        items-center
                                                        justify-center

                                                        text-blue-600

                                                        font-black
                                                    "
                                                >

                                                    {user.name
                                                        ?.charAt(0)
                                                        ?.toUpperCase()
                                                    }

                                                </div>


                                                <div
                                                    className="
                                                        min-w-0
                                                    "
                                                >

                                                    <p
                                                        className="
                                                            text-sm

                                                            font-black

                                                            text-slate-800

                                                            truncate
                                                        "
                                                    >
                                                        {user.name}
                                                    </p>

                                                    <p
                                                        className="
                                                            text-xs

                                                            text-slate-400

                                                            truncate
                                                        "
                                                    >
                                                        ID: {user.id}
                                                    </p>

                                                </div>

                                            </div>

                                        </td>


                                        {/* EMAIL */}

                                        <td
                                            className="
                                                px-6
                                                py-4
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2

                                                    text-sm
                                                    text-slate-600
                                                "
                                            >

                                                <Mail
                                                    size={15}
                                                    className="text-slate-400"
                                                />

                                                {user.email}

                                            </div>

                                        </td>


                                        {/* WHATSAPP */}

                                        <td
                                            className="
                                                px-6
                                                py-4
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    items-center
                                                    gap-2

                                                    text-sm
                                                    text-slate-600
                                                "
                                            >

                                                <Phone
                                                    size={15}
                                                    className="text-slate-400"
                                                />

                                                {user.no_whatsapp || '-'}
                                            </div>

                                        </td>


                                        {/* STATUS */}

                                        <td
                                            className="
                                                px-6
                                                py-4

                                                text-center
                                            "
                                        >

                                            <span
                                                className="
                                                    inline-flex
                                                    items-center

                                                    gap-1.5

                                                    px-2.5
                                                    py-1

                                                    rounded-full

                                                    bg-emerald-50

                                                    text-emerald-600

                                                    text-xs

                                                    font-black
                                                "
                                            >

                                                <ShieldCheck
                                                    size={13}
                                                />

                                                Aktif

                                            </span>

                                        </td>


                                        {/* ACTION */}

                                        <td
                                            className="
                                                px-6
                                                py-4
                                            "
                                        >

                                            <div
                                                className="
                                                    flex
                                                    justify-end
                                                    items-center
                                                    gap-2
                                                "
                                            >

                                                <button
                                                    type="button"

                                                    className="
                                                        w-9
                                                        h-9

                                                        rounded-lg

                                                        flex
                                                        items-center
                                                        justify-center

                                                        text-blue-600

                                                        bg-blue-50

                                                        hover:bg-blue-100

                                                        transition-all
                                                    "
                                                    title="Edit"
                                                >

                                                    <Pencil
                                                        size={16}
                                                    />

                                                </button>


                                                <button
                                                    type="button"

                                                    className="
                                                        w-9
                                                        h-9

                                                        rounded-lg

                                                        flex
                                                        items-center
                                                        justify-center

                                                        text-rose-600

                                                        bg-rose-50

                                                        hover:bg-rose-100

                                                        transition-all
                                                    "
                                                    title="Hapus"
                                                >

                                                    <Trash2
                                                        size={16}
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
                    PAGINATION
                ================================================= */}

                {pagination.last_page > 1 && (

                    <div
                        className="
                            px-5
                            sm:px-6
                            py-4

                            border-t
                            border-slate-100

                            flex
                            items-center
                            justify-between
                        "
                    >

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
                                px-3
                                py-2

                                rounded-lg

                                border
                                border-slate-200

                                text-sm
                                font-semibold

                                text-slate-600

                                disabled:opacity-40

                                hover:bg-slate-50
                            "
                        >
                            Sebelumnya
                        </button>


                        <div
                            className="
                                text-sm
                                text-slate-500
                            "
                        >

                            Halaman

                            <span
                                className="
                                    mx-1

                                    font-black

                                    text-slate-800
                                "
                            >
                                {pagination.current_page}
                            </span>

                            dari

                            <span
                                className="
                                    ml-1

                                    font-black

                                    text-slate-800
                                "
                            >
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
                                px-3
                                py-2

                                rounded-lg

                                border
                                border-slate-200

                                text-sm
                                font-semibold

                                text-slate-600

                                disabled:opacity-40

                                hover:bg-slate-50
                            "
                        >
                            Berikutnya
                        </button>

                    </div>

                )}

            </div>

        </div>

    );

}