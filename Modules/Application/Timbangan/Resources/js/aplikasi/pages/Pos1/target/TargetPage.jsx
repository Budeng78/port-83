import React, { useEffect, useState } from 'react';

import {
    Scale,
    RefreshCw,
    Plus,
    X,
    Layers,
    ChevronRight,
} from 'lucide-react';

import targetAturanService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/targetAturanService';
import targetService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/targetService';
import targetAturanDetailService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/targetAturanDetailService';

import TargetAturanTable from './components/TargetAturanTable';
import TargetAturanForm from './components/TargetAturanForm';
import TargetTable from './components/TargetTable';
import TargetForm from './components/TargetForm';
import TargetAturanDetailTable from './components/TargetAturanDetailTable';
import TargetAturanDetailForm from './components/TargetAturanDetailForm';

export default function TargetPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const [formOpen, setFormOpen] = useState(false);
    const [selected, setSelected] = useState(null);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [aturan, setAturan] = useState([]);
    const [aturanLoading, setAturanLoading] = useState(false);
    const [targetDetail, setTargetDetail] = useState(null);

    const [aturanFormOpen, setAturanFormOpen] = useState(false);
    const [aturanSelected, setAturanSelected] = useState(null);
    const [aturanSaving, setAturanSaving] = useState(false);
    const [aturanDeleting, setAturanDeleting] = useState(false);

    const [aturanDetail, setAturanDetail] = useState([]);
    const [aturanDetailLoading, setAturanDetailLoading] = useState(false);
    const [aturanDetailFormOpen, setAturanDetailFormOpen] = useState(false);
    const [aturanDetailSelected, setAturanDetailSelected] = useState(null);
    const [aturanDetailSaving, setAturanDetailSaving] = useState(false);
    const [aturanDetailDeleting, setAturanDetailDeleting] = useState(false);
    const [aturanDetailTarget, setAturanDetailTarget] = useState(null);

    // =====================================================
    // TARGET
    // =====================================================

    const loadData = async () => {
        try {
            setLoading(true);

            const response = await targetService.getAll();

            setData(response.data.data ?? []);
        } catch (error) {
            console.error('Gagal mengambil data target:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleCreate = () => {
        setSelected(null);
        setFormOpen(true);
    };

    const handleEdit = (item) => {
        setSelected(item);
        setFormOpen(true);
    };

    const handleSubmit = async (form) => {
        try {
            setSaving(true);

            if (selected) {
                await targetService.update(selected.id, form);
            } else {
                await targetService.create(form);
            }

            setFormOpen(false);
            setSelected(null);

            await loadData();
        } catch (error) {
            console.error('Gagal menyimpan target:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Hapus target ${item.kode_batch}?`)) {
            return;
        }

        try {
            setDeleting(true);

            await targetService.delete(item.id);

            if (targetDetail?.id === item.id) {
                setTargetDetail(null);
                setAturan([]);
                setAturanFormOpen(false);
                setAturanSelected(null);
                setAturanDetail([]);
                setAturanDetailTarget(null);
                setAturanDetailFormOpen(false);
                setAturanDetailSelected(null);
            }

            await loadData();
        } catch (error) {
            console.error('Gagal menghapus target:', error);
        } finally {
            setDeleting(false);
        }
    };

    const handleCancel = () => {
        setFormOpen(false);
        setSelected(null);
    };

    // =====================================================
    // ATURAN
    // =====================================================

    const loadAturan = async (target) => {
        try {
            setAturanLoading(true);

            setTargetDetail(target);

            setAturanFormOpen(false);
            setAturanSelected(null);

            setAturanDetail([]);
            setAturanDetailTarget(null);
            setAturanDetailFormOpen(false);
            setAturanDetailSelected(null);

            const response = await targetAturanService.getAll(target.id);

            setAturan(response.data.data ?? []);
        } catch (error) {
            console.error('Gagal mengambil data aturan:', error);
        } finally {
            setAturanLoading(false);
        }
    };

    const handleAturanCreate = () => {
        setAturanSelected(null);
        setAturanFormOpen(true);
    };

    const handleAturanEdit = (item) => {
        setAturanSelected(item);
        setAturanFormOpen(true);
    };

    const handleAturanSubmit = async (form) => {
        try {
            setAturanSaving(true);

            if (aturanSelected) {
                await targetAturanService.update(aturanSelected.id, form);
            } else {
                await targetAturanService.create({
                    ...form,
                    target_id: targetDetail.id,
                });
            }

            setAturanFormOpen(false);
            setAturanSelected(null);

            await loadAturan(targetDetail);
            await loadData();
        } catch (error) {
            console.error('Gagal menyimpan aturan:', error);
        } finally {
            setAturanSaving(false);
        }
    };

    const handleAturanDelete = async (item) => {
        if (!window.confirm(`Hapus aturan ${item.nomor_aturan}?`)) {
            return;
        }

        try {
            setAturanDeleting(true);

            await targetAturanService.delete(item.id);

            if (aturanDetailTarget?.id === item.id) {
                setAturanDetail([]);
                setAturanDetailTarget(null);
                setAturanDetailFormOpen(false);
                setAturanDetailSelected(null);
            }

            await loadAturan(targetDetail);
            await loadData();
        } catch (error) {
            console.error('Gagal menghapus aturan:', error);
        } finally {
            setAturanDeleting(false);
        }
    };

    const handleAturanCancel = () => {
        setAturanFormOpen(false);
        setAturanSelected(null);
    };

    // =====================================================
    // DETAIL ATURAN
    // =====================================================

    const loadAturanDetail = async (item) => {
        try {
            setAturanDetailLoading(true);

            setAturanDetailTarget(item);

            setAturanDetailFormOpen(false);
            setAturanDetailSelected(null);

            const response = await targetAturanDetailService.getAll(item.id);

            setAturanDetail(response.data.data ?? []);
        } catch (error) {
            console.error('Gagal mengambil detail aturan:', error);
        } finally {
            setAturanDetailLoading(false);
        }
    };

    const handleAturanDetailCreate = () => {
        setAturanDetailSelected(null);
        setAturanDetailFormOpen(true);
    };

    const handleAturanDetailEdit = (item) => {
        setAturanDetailSelected(item);
        setAturanDetailFormOpen(true);
    };

    const handleAturanDetailSubmit = async (form) => {
        try {
            setAturanDetailSaving(true);

            if (aturanDetailSelected) {
                await targetAturanDetailService.update(
                    aturanDetailTarget.id,
                    aturanDetailSelected.id,
                    form
                );
            } else {
                await targetAturanDetailService.create(aturanDetailTarget.id, {
                    ...form,
                    target_aturan_id: aturanDetailTarget.id,
                });
            }

            setAturanDetailFormOpen(false);
            setAturanDetailSelected(null);

            await loadAturanDetail(aturanDetailTarget);

            await loadAturan(targetDetail);
        } catch (error) {
            console.error('Gagal menyimpan detail aturan:', error);
        } finally {
            setAturanDetailSaving(false);
        }
    };

    const handleAturanDetailDelete = async (item) => {
        if (!window.confirm(`Hapus detail ${item.jenis_tbk}?`)) {
            return;
        }

        try {
            setAturanDetailDeleting(true);

            await targetAturanDetailService.delete(
                aturanDetailTarget.id,
                item.id
            );

            await loadAturanDetail(aturanDetailTarget);

            await loadAturan(targetDetail);
        } catch (error) {
            console.error('Gagal menghapus detail aturan:', error);
        } finally {
            setAturanDetailDeleting(false);
        }
    };

    const handleAturanDetailCancel = () => {
        setAturanDetailFormOpen(false);
        setAturanDetailSelected(null);
    };

    // =====================================================
    // RENDER
    // =====================================================

    return (
        <div className="min-h-full bg-slate-50 p-4 md:p-6">
            {/* =================================================
                HEADER
            ================================================= */}

            <div className="relative mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-amber-400" />

                <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-900 text-white shadow-sm">
                            <Scale size={25} strokeWidth={2} />
                        </div>

                        <div>
                            <h1 className="text-lg font-semibold text-slate-900 md:text-xl">
                                Target Timbangan Pos 1
                            </h1>

                            <p className="text-sm text-slate-500">
                                Kelola target, aturan, dan detail target
                                timbangan.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={loadData}
                            disabled={loading}
                            title="Refresh"
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <RefreshCw
                                size={18}
                                className={loading ? 'animate-spin' : ''}
                            />
                        </button>

                        <button
                            type="button"
                            onClick={handleCreate}
                            className="flex h-11 items-center gap-2 rounded-xl bg-blue-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                        >
                            <Plus size={18} />
                            Tambah Target
                        </button>
                    </div>
                </div>
            </div>

            {/* =================================================
                TARGET
            ================================================= */}

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-200 px-4 py-3 md:px-5">
                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                        <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
                                <Layers size={18} />
                            </div>

                            <div>
                                <h2 className="text-sm font-semibold text-slate-900">
                                    Daftar Target
                                </h2>

                                <p className="text-xs text-slate-500">
                                    Total:{' '}
                                    <span className="font-semibold text-slate-700">
                                        {data.length}
                                    </span>{' '}
                                    target
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="hidden rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500 sm:block">
                                Target Timbangan
                            </div>
                        </div>
                    </div>
                </div>

                {formOpen && (
                    <div className="border-b border-slate-200 bg-slate-50 p-4 md:p-5">
                        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <TargetForm
                                data={selected}
                                loading={saving}
                                onSubmit={handleSubmit}
                                onCancel={handleCancel}
                            />
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <TargetTable
                        data={data}
                        loading={loading || deleting}
                        onDetail={loadAturan}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                </div>
            </div>

            {/* =================================================
                ATURAN
            ================================================= */}

            {targetDetail && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4 md:px-5">
                        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 text-indigo-700">
                                    <ChevronRight size={20} />
                                </div>

                                <div>
                                    <h2 className="text-base font-semibold text-slate-900">
                                        Aturan Target
                                    </h2>

                                    <p className="mt-0.5 text-xs text-slate-500">
                                        Target:{' '}
                                        <span className="font-semibold text-blue-700">
                                            {targetDetail.kode_batch}
                                        </span>

                                        <span className="mx-2 text-slate-300">
                                            •
                                        </span>

                                        {aturan.length} aturan
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={handleAturanCreate}
                                    className="flex h-10 items-center gap-2 rounded-lg bg-blue-900 px-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                                >
                                    <Plus size={17} />
                                    Tambah Aturan
                                </button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setTargetDetail(null);
                                        setAturan([]);
                                        setAturanFormOpen(false);
                                        setAturanSelected(null);
                                        setAturanDetail([]);
                                        setAturanDetailTarget(null);
                                        setAturanDetailFormOpen(false);
                                        setAturanDetailSelected(null);
                                    }}
                                    title="Tutup"
                                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {aturanFormOpen && (
                        <div className="border-b border-slate-200 bg-slate-50 p-4 md:p-5">
                            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                <TargetAturanForm
                                    data={aturanSelected}
                                    targetId={targetDetail.id}
                                    loading={aturanSaving}
                                    onSubmit={handleAturanSubmit}
                                    onCancel={handleAturanCancel}
                                />
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <TargetAturanTable
                            data={aturan}
                            loading={aturanLoading || aturanDeleting}
                            onDetail={loadAturanDetail}
                            onEdit={handleAturanEdit}
                            onDelete={handleAturanDelete}
                        />
                    </div>

                    {/* =================================================
                        DETAIL ATURAN
                    ================================================= */}

                    {aturanDetailTarget && (
                        <div className="m-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:m-5">
                            <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-4">
                                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                                            <Layers size={18} />
                                        </div>

                                        <div>
                                            <h3 className="text-sm font-semibold text-slate-900">
                                                Detail Aturan
                                            </h3>

                                            <p className="mt-0.5 text-xs text-slate-500">
                                                Aturan:{' '}
                                                <span className="font-semibold text-blue-700">
                                                    {
                                                        aturanDetailTarget.nomor_aturan
                                                    }
                                                </span>

                                                <span className="mx-2 text-slate-300">
                                                    •
                                                </span>

                                                {aturanDetail.length} detail
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <button
                                            type="button"
                                            onClick={handleAturanDetailCreate}
                                            className="flex h-9 items-center gap-2 rounded-lg bg-blue-900 px-3 text-sm font-semibold text-white transition hover:bg-blue-800"
                                        >
                                            <Plus size={16} />
                                            Tambah Detail
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setAturanDetailTarget(null);
                                                setAturanDetail([]);
                                                setAturanDetailFormOpen(false);
                                                setAturanDetailSelected(null);
                                            }}
                                            title="Tutup"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-50 hover:text-red-600"
                                        >
                                            <X size={17} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {aturanDetailFormOpen && (
                                <div className="border-b border-slate-200 bg-slate-50 p-4">
                                    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                                        <TargetAturanDetailForm
                                            data={aturanDetailSelected}
                                            targetAturanId={
                                                aturanDetailTarget.id
                                            }
                                            loading={aturanDetailSaving}
                                            onSubmit={
                                                handleAturanDetailSubmit
                                            }
                                            onCancel={
                                                handleAturanDetailCancel
                                            }
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="overflow-x-auto">
                                <TargetAturanDetailTable
                                    data={aturanDetail}
                                    loading={
                                        aturanDetailLoading ||
                                        aturanDetailDeleting
                                    }
                                    onEdit={handleAturanDetailEdit}
                                    onDelete={handleAturanDetailDelete}
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}