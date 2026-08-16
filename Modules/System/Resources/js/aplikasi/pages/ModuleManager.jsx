import React, { useState, useEffect } from 'react';
import api from '@Modules/System/Resources/js/aplikasi/axios/axios';
import {
    Package,
    CheckCircle2,
    XCircle,
    RefreshCw,
    Layers,
    Power,
    ShieldCheck,
    Server,
} from 'lucide-react';

/*
|--------------------------------------------------------------------------
| MODULE MANAGER
|--------------------------------------------------------------------------
| Theme: Navy (#243B72), Blue (#2563EB), Blue Light (#EFF6FF), Background (#F8FAFC)
*/

export default function ModuleManager() {
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingAlias, setProcessingAlias] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchModules = async () => {
        setLoading(true);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.get('/core/system/modules');
            if (res.data.status === 'success') {
                setModules(res.data.data || []);
            } else {
                setMessage({ type: 'error', text: res.data.message || 'Gagal memuat daftar modul.' });
            }
        } catch (error) {
            console.error('Gagal memuat modul:', error);
            setMessage({ type: 'error', text: 'Gagal memuat daftar modul dari server.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModules();
    }, []);

    const handleToggle = async (alias) => {
        if (alias === 'core') return;

        setProcessingAlias(alias);
        setMessage({ type: '', text: '' });
        try {
            const res = await api.post(`/core/system/modules/${alias}/toggle`);
            if (res.data.status === 'success') {
                setModules(prev =>
                    prev.map(mod =>
                        mod.alias === alias ? { ...mod, is_active: res.data.data.is_active } : mod
                    )
                );
                setMessage({ type: 'success', text: res.data.message || 'Status modul berhasil diperbarui.' });
            } else {
                setMessage({ type: 'error', text: res.data.message || 'Gagal mengubah status modul.' });
            }
        } catch (error) {
            console.error('Gagal mengubah status modul:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'Terjadi kesalahan saat mengubah status modul.' });
        } finally {
            setProcessingAlias(null);
        }
    };

    const totalModules = modules.length;
    const activeModules = modules.filter(m => m.is_active).length;
    const inactiveModules = modules.filter(m => !m.is_active).length;

    return (
        <div className="min-h-full bg-[#F8FAFC] p-4 sm:p-5 lg:p-6">
            <div className="max-w-7xl mx-auto space-y-5">
                
                {/* HEADER */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between pb-5 border-b border-slate-200">
                    <div className="flex items-start gap-3">
                        <div className="flex items-center justify-center w-11 h-11 shrink-0 rounded-xl bg-[#EFF6FF] text-[#2563EB] border border-blue-100">
                            <Package size={22} strokeWidth={2} />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-[#243B72] tracking-tight">
                                Manajemen Modul Sistem
                            </h1>
                            <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
                                Kelola status aktif dan non-aktif modul aplikasi secara dinamis.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={fetchModules}
                        disabled={loading}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm font-semibold text-[#243B72] shadow-sm hover:bg-[#EFF6FF] hover:border-blue-200 hover:text-[#2563EB] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
                    >
                        <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
                        <span>Muat Ulang</span>
                    </button>
                </div>

                {/* SUMMARY CARDS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Total Modul', count: totalModules, icon: Layers, color: 'text-[#243B72]', bg: 'bg-[#EFF6FF]', textCol: 'text-[#2563EB]' },
                        { label: 'Modul Aktif', count: activeModules, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50', textCol: 'text-emerald-600' },
                        { label: 'Non-Aktif', count: inactiveModules, icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50', textCol: 'text-rose-600' },
                    ].map((item, idx) => {
                        const IconComp = item.icon;
                        return (
                            <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{item.label}</p>
                                        <p className={`mt-1 text-2xl font-bold ${item.color}`}>{item.count}</p>
                                    </div>
                                    <div className={`w-10 h-10 rounded-xl ${item.bg} ${item.textCol} flex items-center justify-center`}>
                                        <IconComp size={19} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* NOTIFICATION */}
                {message.text && (
                    <div className={`flex items-start gap-3 p-4 rounded-xl text-sm font-medium border ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-rose-50 text-rose-800 border-rose-200'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 size={18} className="shrink-0 text-emerald-600" /> : <XCircle size={18} className="shrink-0 text-rose-600" />}
                        <span>{message.text}</span>
                    </div>
                )}

                {/* CONTENT CONTAINER */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-5 py-4 border-b border-slate-100">
                        <div>
                            <h2 className="text-sm font-bold text-[#243B72]">Daftar Modul</h2>
                            <p className="text-[11px] text-slate-400 mt-0.5">Modul yang terdeteksi pada sistem.</p>
                        </div>
                        <div className="inline-flex items-center gap-2 text-[11px] text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Sistem terhubung
                        </div>
                    </div>

                    {loading && modules.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <div className="w-12 h-12 rounded-2xl bg-[#EFF6FF] text-[#2563EB] flex items-center justify-center mb-4">
                                <RefreshCw size={22} className="animate-spin" />
                            </div>
                            <p className="text-sm font-semibold text-[#243B72]">Memindai modul...</p>
                            <p className="mt-1 text-xs text-slate-400">Mohon tunggu sebentar.</p>
                        </div>
                    ) : (
                        <>
                            {/* MOBILE CARD VIEW */}
                            <div className="block md:hidden p-3 space-y-3">
                                {modules.length > 0 ? (
                                    modules.map(mod => (
                                        <div key={mod.alias} className="bg-slate-50/70 border border-slate-200 rounded-2xl p-4">
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`flex items-center justify-center w-10 h-10 shrink-0 rounded-xl ${
                                                        mod.is_active ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-slate-100 text-slate-400'
                                                    }`}>
                                                        <Layers size={19} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <h3 className="text-sm font-bold text-[#243B72] truncate">{mod.name}</h3>
                                                        <code className="block mt-0.5 text-[10px] text-slate-400 truncate">{mod.folder_name}</code>
                                                    </div>
                                                </div>

                                                <span className={`shrink-0 inline-flex items-center gap-1 px-2 py-1 rounded-full border text-[10px] font-semibold ${
                                                    mod.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                                                }`}>
                                                    {mod.is_active ? <CheckCircle2 size={11} /> : <XCircle size={11} />}
                                                    {mod.is_active ? 'Aktif' : 'Nonaktif'}
                                                </span>
                                            </div>

                                            <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-slate-200">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Versi</p>
                                                    <p className="mt-1 text-xs font-semibold text-slate-600">v{mod.version || '1.0.0'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Alias</p>
                                                    <code className="block mt-1 text-xs font-medium text-slate-600 truncate">{mod.alias}</code>
                                                </div>
                                            </div>

                                            {mod.description && (
                                                <p className="mt-3 text-xs leading-relaxed text-slate-500">{mod.description}</p>
                                            )}

                                            <div className="mt-4 pt-3 border-t border-slate-200">
                                                <button
                                                    type="button"
                                                    onClick={() => handleToggle(mod.alias)}
                                                    disabled={processingAlias === mod.alias || mod.alias === 'core'}
                                                    className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                                        mod.alias === 'core'
                                                            ? 'bg-slate-100 text-slate-400'
                                                            : mod.is_active
                                                            ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                                                            : 'bg-[#2563EB] text-white border border-[#2563EB] hover:bg-[#243B72]'
                                                    }`}
                                                >
                                                    {processingAlias === mod.alias ? <RefreshCw size={14} className="animate-spin" /> : mod.alias === 'core' ? <ShieldCheck size={14} /> : <Power size={14} />}
                                                    {processingAlias === mod.alias ? 'Memproses...' : mod.alias === 'core' ? 'Modul Inti' : mod.is_active ? 'Matikan Modul' : 'Aktifkan Modul'}
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center">
                                        <Server size={28} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-sm font-semibold text-slate-500">Tidak ada modul</p>
                                        <p className="mt-1 text-xs text-slate-400">Tidak ditemukan modul pada direktori sistem.</p>
                                    </div>
                                )}
                            </div>

                            {/* DESKTOP TABLE VIEW */}
                            <div className="hidden md:block overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                                            <th className="py-3 px-5">Nama Modul</th>
                                            <th className="py-3 px-5">Alias / Direktori</th>
                                            <th className="py-3 px-5">Versi</th>
                                            <th className="py-3 px-5">Deskripsi</th>
                                            <th className="py-3 px-5 text-center">Status</th>
                                            <th className="py-3 px-5 text-right">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-sm">
                                        {modules.length > 0 ? (
                                            modules.map(mod => (
                                                <tr key={mod.alias} className="hover:bg-[#F8FAFC] transition-colors">
                                                    <td className="py-4 px-5">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${
                                                                mod.is_active ? 'bg-[#EFF6FF] text-[#2563EB]' : 'bg-slate-100 text-slate-400'
                                                            }`}>
                                                                <Layers size={17} />
                                                            </div>
                                                            <div>
                                                                <div className="font-semibold text-[#243B72]">{mod.name}</div>
                                                                {mod.alias === 'core' && (
                                                                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-slate-400">
                                                                        <ShieldCheck size={11} /> Modul inti
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <code className="inline-flex px-2 py-1 rounded-lg bg-slate-100 text-[11px] text-slate-600">{mod.folder_name}</code>
                                                    </td>
                                                    <td className="py-4 px-5">
                                                        <span className="inline-flex px-2.5 py-1 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-600">
                                                            v{mod.version || '1.0.0'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 max-w-xs">
                                                        <span className="block truncate text-xs text-slate-500" title={mod.description || ''}>
                                                            {mod.description || '-'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 text-center">
                                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[11px] font-semibold ${
                                                            mod.is_active ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-rose-50 border-rose-200 text-rose-700'
                                                        }`}>
                                                            {mod.is_active ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                                                            {mod.is_active ? 'Aktif' : 'Nonaktif'}
                                                        </span>
                                                    </td>
                                                    <td className="py-4 px-5 text-right">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleToggle(mod.alias)}
                                                            disabled={processingAlias === mod.alias || mod.alias === 'core'}
                                                            title={mod.alias === 'core' ? 'Modul inti tidak dapat dimatikan' : ''}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                                                                mod.alias === 'core'
                                                                    ? 'bg-slate-100 text-slate-400'
                                                                    : mod.is_active
                                                                    ? 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
                                                                    : 'bg-[#2563EB] text-white hover:bg-[#243B72]'
                                                            }`}
                                                        >
                                                            {processingAlias === mod.alias ? <RefreshCw size={13} className="animate-spin" /> : mod.alias === 'core' ? <ShieldCheck size={13} /> : <Power size={13} />}
                                                            {processingAlias === mod.alias ? 'Memproses...' : mod.alias === 'core' ? 'Modul Inti' : mod.is_active ? 'Matikan' : 'Aktifkan'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="6" className="py-14 text-center">
                                                    <Server size={30} className="mx-auto text-slate-300 mb-3" />
                                                    <p className="text-sm font-semibold text-slate-500">Tidak ada modul ditemukan</p>
                                                    <p className="mt-1 text-xs text-slate-400">Tidak ditemukan modul pada direktori sistem.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}