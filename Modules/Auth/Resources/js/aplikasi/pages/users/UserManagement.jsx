import React, { useEffect, useState } from 'react';
import { Search, Plus, RefreshCw, Pencil, Trash2, UserRound, Mail, Phone, ShieldCheck, X, Save } from 'lucide-react';
import UserService from '@Modules/Auth/Resources/js/aplikasi/services/UserService';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });

    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [selectedUser, setSelectedUser] = useState(null);

    const [form, setForm] = useState({ name: '', email: '', no_whatsapp: '', password: '' });
    const [formErrors, setFormErrors] = useState({});
    const [saving, setSaving] = useState(false);

    const loadUsers = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await UserService.getUsers({ page, search });
            const paginator = response?.data;
            setUsers(Array.isArray(paginator?.data) ? paginator.data :[]);
            setPagination({
                current_page: paginator?.current_page ?? 1,
                last_page: paginator?.last_page ?? 1,
                total: paginator?.total ?? 0,
            });
        } catch (err) {
            console.error('Gagal mengambil data user:', err);
            setError(err?.response?.data?.message || 'Gagal mengambil data pengguna.');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { loadUsers(); }, [page, search]);

    const goToPage = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.last_page) setPage(newPage);
    };

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedUser(null);
        setForm({ name: '', email: '', no_whatsapp: '', password: '' });
        setFormErrors({});
        setError('');
        setShowModal(true);
    };

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

    const closeModal = () => {
        if (saving) return;
        setShowModal(false);
        setSelectedUser(null);
        setFormErrors({});
    };

    const validateForm = () => {
        const errors = {};
        if (!form.name.trim()) errors.name = 'Nama wajib diisi.';
        if (!form.email.trim()) errors.email = 'Email wajib diisi.';
        if (modalMode === 'create') {
            if (!form.password) errors.password = 'Password wajib diisi.';
            else if (form.password.length < 8) errors.password = 'Password minimal 8 karakter.';
        } else if (form.password && form.password.length < 8) {
            errors.password = 'Password minimal 8 karakter.';
        }
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setSuccess('');
        if (!validateForm()) return;
        setSaving(true);
        try {
            if (modalMode === 'create') {
                await UserService.createUser({
                    name: form.name,
                    email: form.email,
                    no_whatsapp: form.no_whatsapp || null,
                    password: form.password,
                });
                setSuccess('User berhasil ditambahkan.');
            } else {
                const payload = { name: form.name, email: form.email, no_whatsapp: form.no_whatsapp || null };
                if (form.password) payload.password = form.password;
                await UserService.updateUser(selectedUser.id, payload);
                setSuccess('User berhasil diperbarui.');
            }
            setShowModal(false);
            setSelectedUser(null);
            setForm({ name: '', email: '', no_whatsapp: '', password: '' });
            setFormErrors({});
            await loadUsers();
        } catch (err) {
            console.error('Gagal menyimpan user:', err);
            if (err?.response?.status === 422 && err?.response?.data?.errors) {
                setFormErrors(err.response.data.errors);
            } else {
                setError(err?.response?.data?.message || 'Gagal menyimpan pengguna.');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (user) => {
        if (!window.confirm(`Apakah Anda yakin ingin menghapus user "${user.name}"?`)) return;
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await UserService.deleteUser(user.id);
            setSuccess('User berhasil dihapus.');
            await loadUsers();
        } catch (err) {
            console.error('Gagal menghapus user:', err);
            setError(err?.response?.data?.message || 'Gagal menghapus pengguna.');
        } finally {
            setLoading(false);
        }
    };

    const getFieldError = (field) => {
        const val = formErrors?.[field];
        return Array.isArray(val) ? val[0] : val;
    };

    return (
        <div className="space-y-4">
            {/* HEADER */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight">Manajemen Pengguna</h1>
                    <p className="text-xs text-slate-500">Kelola akun pengguna dan akses sistem.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button type="button" onClick={loadUsers} disabled={loading} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-600 font-semibold text-xs hover:bg-slate-50 disabled:opacity-50 transition-all">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        <span className="hidden sm:inline">Refresh</span>
                    </button>
                    <button type="button" onClick={openCreateModal} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition-all shadow-sm">
                        <Plus size={15} />
                        <span>Tambah User</span>
                    </button>
                </div>
            </div>

            {/* ALERTS */}
            {success && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-700 font-semibold">
                    <span>{success}</span>
                    <button type="button" onClick={() => setSuccess('')}><X size={14} /></button>
                </div>
            )}
            {error && (
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-600 font-semibold">
                    <span>{error}</span>
                    <button type="button" onClick={() => setError('')}><X size={14} /></button>
                </div>
            )}

            {/* MAIN CARD */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* TOOLBAR */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                    <div className="relative w-full sm:max-w-xs">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                            placeholder="Cari nama, email, atau WhatsApp..."
                            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100 transition-all"
                        />
                    </div>
                    <div className="text-xs text-slate-500 font-medium">
                        Total: <span className="font-black text-slate-800">{pagination.total}</span> pengguna
                    </div>
                </div>

                {/* DESKTOP TABLE */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-black uppercase tracking-wider text-slate-500">
                                <th className="px-4 py-3">Pengguna</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">WhatsApp</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400">
                                        <div className="flex items-center justify-center gap-2">
                                            <RefreshCw size={16} className="animate-spin" /> Memuat data...
                                        </div>
                                    </td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-semibold">
                                        Tidak ada data pengguna.
                                    </td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0">
                                                    {user.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-black text-slate-800 truncate">{user.name}</p>
                                                    <p className="text-[10px] text-slate-400">ID: {user.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <div className="flex items-center gap-1.5 max-w-xs">
                                                <Mail size={13} className="text-slate-400 shrink-0" />
                                                <span className="truncate">{user.email || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-600">
                                            <div className="flex items-center gap-1.5">
                                                <Phone size={13} className="text-slate-400 shrink-0" />
                                                <span>{user.no_whatsapp || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black">
                                                <ShieldCheck size={11} /> Aktif
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            <div className="flex justify-end items-center gap-1">
                                                <button type="button" onClick={() => openEditModal(user)} className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-600 bg-blue-50 hover:bg-blue-100 transition-all" title="Edit">
                                                    <Pencil size={14} />
                                                </button>
                                                <button type="button" onClick={() => handleDelete(user)} className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-600 bg-rose-50 hover:bg-rose-100 transition-all" title="Hapus">
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* MOBILE LIST */}
                <div className="md:hidden divide-y divide-slate-100 text-xs">
                    {loading ? (
                        <div className="p-6 text-center text-slate-400 flex items-center justify-center gap-2">
                            <RefreshCw size={16} className="animate-spin" /> Memuat data...
                        </div>
                    ) : users.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 font-semibold">Tidak ada data pengguna.</div>
                    ) : (
                        users.map((user) => (
                            <div key={user.id} className="p-4 space-y-2.5 hover:bg-slate-50">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex items-center gap-2.5 min-w-0">
                                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 font-black text-xs shrink-0">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="font-black text-slate-800 truncate">{user.name}</p>
                                            <p className="text-[10px] text-slate-400">ID: {user.id}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black shrink-0">
                                        <ShieldCheck size={11} /> Aktif
                                    </span>
                                </div>
                                <div className="space-y-1 text-slate-600 text-[11px]">
                                    <div className="flex items-center gap-1.5 truncate">
                                        <Mail size={13} className="text-slate-400 shrink-0" />
                                        <span className="truncate">{user.email || '-'}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <Phone size={13} className="text-slate-400 shrink-0" />
                                        <span>{user.no_whatsapp || '-'}</span>
                                    </div>
                                </div>
                                <div className="pt-2 border-t border-slate-100 flex gap-2">
                                    <button type="button" onClick={() => openEditModal(user)} className="flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-blue-600 bg-blue-50 hover:bg-blue-100 font-bold transition-all">
                                        <Pencil size={14} /> Edit
                                    </button>
                                    <button type="button" onClick={() => handleDelete(user)} className="flex-1 h-8 rounded-lg flex items-center justify-center gap-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 font-bold transition-all">
                                        <Trash2 size={14} /> Hapus
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* PAGINATION */}
                {pagination.last_page > 1 && (
                    <div className="px-4 py-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <button type="button" onClick={() => goToPage(pagination.current_page - 1)} disabled={pagination.current_page <= 1} className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50">
                            Sebelumnya
                        </button>
                        <div className="text-slate-500">
                            Hal <span className="font-black text-slate-800">{pagination.current_page}</span> / <span className="font-black text-slate-800">{pagination.last_page}</span>
                        </div>
                        <button type="button" onClick={() => goToPage(pagination.current_page + 1)} disabled={pagination.current_page >= pagination.last_page} className="px-2.5 py-1.5 rounded-lg border border-slate-200 font-semibold text-slate-600 disabled:opacity-40 hover:bg-slate-50">
                            Berikutnya
                        </button>
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={closeModal} />
                    <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">{modalMode === 'create' ? 'Tambah User' : 'Edit User'}</h2>
                                <p className="text-xs text-slate-500 mt-0.5">{modalMode === 'create' ? 'Buat akun pengguna baru.' : 'Perbarui informasi pengguna.'}</p>
                            </div>
                            <button type="button" onClick={closeModal} disabled={saving} className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600">
                                <X size={18} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Nama</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder="Nama pengguna"
                                    className={`w-full px-3 py-2.5 rounded-xl border ${getFieldError('name') ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'} text-xs outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100`}
                                />
                                {getFieldError('name') && <p className="mt-1 text-[11px] text-rose-600">{getFieldError('name')}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={form.email}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder="nama@email.com"
                                    className={`w-full px-3 py-2.5 rounded-xl border ${getFieldError('email') ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'} text-xs outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100`}
                                />
                                {getFieldError('email') && <p className="mt-1 text-[11px] text-rose-600">{getFieldError('email')}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">WhatsApp</label>
                                <input
                                    type="text"
                                    name="no_whatsapp"
                                    value={form.no_whatsapp}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder="08xxxxxxxxxx"
                                    className={`w-full px-3 py-2.5 rounded-xl border ${getFieldError('no_whatsapp') ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'} text-xs outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100`}
                                />
                                {getFieldError('no_whatsapp') && <p className="mt-1 text-[11px] text-rose-600">{getFieldError('no_whatsapp')}</p>}
                            </div>

                            <div>
                                <label className="block font-bold text-slate-700 mb-1.5">
                                    Password {modalMode === 'edit' && <span className="font-normal text-slate-400">(kosongkan jika tidak diubah)</span>}
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={form.password}
                                    onChange={handleInputChange}
                                    disabled={saving}
                                    placeholder={modalMode === 'create' ? 'Minimal 8 karakter' : 'Kosongkan jika tidak diubah'}
                                    className={`w-full px-3 py-2.5 rounded-xl border ${getFieldError('password') ? 'border-rose-300 bg-rose-50' : 'border-slate-200 bg-slate-50'} text-xs outline-none focus:bg-white focus:border-blue-400 focus:ring-1 focus:ring-blue-100`}
                                />
                                {getFieldError('password') && <p className="mt-1 text-[11px] text-rose-600">{getFieldError('password')}</p>}
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
                                <button type="button" onClick={closeModal} disabled={saving} className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50">
                                    Batal
                                </button>
                                <button type="submit" disabled={saving} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 disabled:opacity-50">
                                    {saving ? (
                                        <>
                                            <RefreshCw size={14} className="animate-spin" /> Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={14} /> {modalMode === 'create' ? 'Simpan User' : 'Simpan Perubahan'}
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