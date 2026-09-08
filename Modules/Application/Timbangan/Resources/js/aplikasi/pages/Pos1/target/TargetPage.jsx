import React, { useEffect, useState } from 'react';

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
            console.error(
                'Gagal mengambil data target:',
                error
            );
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
                await targetService.update(
                    selected.id,
                    form
                );
            } else {
                await targetService.create(form);
            }

            setFormOpen(false);
            setSelected(null);

            await loadData();
        } catch (error) {
            console.error(
                'Gagal menyimpan target:',
                error
            );
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (item) => {
        if (
            !window.confirm(
                `Hapus target ${item.kode_batch}?`
            )
        ) {
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
            console.error(
                'Gagal menghapus target:',
                error
            );
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

            const response =
                await targetAturanService.getAll(
                    target.id
                );

            setAturan(response.data.data ?? []);
        } catch (error) {
            console.error(
                'Gagal mengambil data aturan:',
                error
            );
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
                await targetAturanService.update(
                    aturanSelected.id,
                    form
                );
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
            console.error(
                'Gagal menyimpan aturan:',
                error
            );
        } finally {
            setAturanSaving(false);
        }
    };

    const handleAturanDelete = async (item) => {
        if (
            !window.confirm(
                `Hapus aturan ${item.nomor_aturan}?`
            )
        ) {
            return;
        }

        try {
            setAturanDeleting(true);

            await targetAturanService.delete(
                item.id
            );

            if (
                aturanDetailTarget?.id === item.id
            ) {
                setAturanDetail([]);
                setAturanDetailTarget(null);
                setAturanDetailFormOpen(false);
                setAturanDetailSelected(null);
            }

            await loadAturan(targetDetail);
            await loadData();
        } catch (error) {
            console.error(
                'Gagal menghapus aturan:',
                error
            );
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

            const response =
                await targetAturanDetailService.getAll(
                    item.id
                );

            setAturanDetail(
                response.data.data ?? []
            );
        } catch (error) {
            console.error(
                'Gagal mengambil detail aturan:',
                error
            );
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
                await targetAturanDetailService.create(
                    aturanDetailTarget.id,
                    {
                        ...form,
                        target_aturan_id:
                            aturanDetailTarget.id,
                    }
                );
            }

            setAturanDetailFormOpen(false);
            setAturanDetailSelected(null);

            await loadAturanDetail(
                aturanDetailTarget
            );

            await loadAturan(targetDetail);
        } catch (error) {
            console.error(
                'Gagal menyimpan detail aturan:',
                error
            );
        } finally {
            setAturanDetailSaving(false);
        }
    };

    const handleAturanDetailDelete = async (item) => {
        if (
            !window.confirm(
                `Hapus detail ${item.jenis_tbk}?`
            )
        ) {
            return;
        }

        try {
            setAturanDetailDeleting(true);

            await targetAturanDetailService.delete(
                aturanDetailTarget.id,
                item.id
            );

            await loadAturanDetail(
                aturanDetailTarget
            );

            await loadAturan(targetDetail);
        } catch (error) {
            console.error(
                'Gagal menghapus detail aturan:',
                error
            );
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
        <div className="p-6">
            <h1 className="mb-4 text-xl font-semibold">
                Target Timbangan Pos 1
            </h1>

            {/* =================================================
                TARGET
            ================================================= */}

            <button
                type="button"
                onClick={handleCreate}
                className="mb-4 rounded bg-black px-4 py-2 text-white"
            >
                Tambah Target
            </button>

            {formOpen && (
                <div className="mb-4 rounded-lg border bg-white p-4">
                    <TargetForm
                        data={selected}
                        loading={saving}
                        onSubmit={handleSubmit}
                        onCancel={handleCancel}
                    />
                </div>
            )}

            <div className="mt-4">
                <TargetTable
                    data={data}
                    loading={
                        loading || deleting
                    }
                    onDetail={loadAturan}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                />
            </div>

            {/* =================================================
                ATURAN
            ================================================= */}

            {targetDetail && (
                <div className="mt-6">
                    <div className="mb-3 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">
                                Aturan Target
                            </h2>

                            <p className="text-sm text-gray-500">
                                {targetDetail.kode_batch}
                            </p>
                        </div>

                        <div className="flex gap-2">
                            <button
                                type="button"
                                onClick={
                                    handleAturanCreate
                                }
                                className="rounded bg-black px-3 py-2 text-sm text-white"
                            >
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
                                className="rounded border px-3 py-2 text-sm"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>

                    {aturanFormOpen && (
                        <div className="mb-4">
                            <TargetAturanForm
                                data={aturanSelected}
                                targetId={
                                    targetDetail.id
                                }
                                loading={aturanSaving}
                                onSubmit={
                                    handleAturanSubmit
                                }
                                onCancel={
                                    handleAturanCancel
                                }
                            />
                        </div>
                    )}

                    <TargetAturanTable
                        data={aturan}
                        loading={
                            aturanLoading ||
                            aturanDeleting
                        }
                        onDetail={
                            loadAturanDetail
                        }
                        onEdit={
                            handleAturanEdit
                        }
                        onDelete={
                            handleAturanDelete
                        }
                    />

                    {/* =============================================
                        DETAIL ATURAN
                    ============================================= */}

                    {aturanDetailTarget && (
                        <div className="mt-6">
                            <div className="mb-3 flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">
                                        Detail Aturan
                                    </h3>

                                    <p className="text-sm text-gray-500">
                                        {
                                            aturanDetailTarget.nomor_aturan
                                        }
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={
                                            handleAturanDetailCreate
                                        }
                                        className="rounded bg-black px-3 py-2 text-sm text-white"
                                    >
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
                                        className="rounded border px-3 py-2 text-sm"
                                    >
                                        Tutup
                                    </button>
                                </div>
                            </div>

                            {aturanDetailFormOpen && (
                                <div className="mb-4">
                                    <TargetAturanDetailForm
                                        data={
                                            aturanDetailSelected
                                        }
                                        targetAturanId={
                                            aturanDetailTarget.id
                                        }
                                        loading={
                                            aturanDetailSaving
                                        }
                                        onSubmit={
                                            handleAturanDetailSubmit
                                        }
                                        onCancel={
                                            handleAturanDetailCancel
                                        }
                                    />
                                </div>
                            )}

                            <TargetAturanDetailTable
                                data={aturanDetail}
                                loading={
                                    aturanDetailLoading ||
                                    aturanDetailDeleting
                                }
                                onEdit={
                                    handleAturanDetailEdit
                                }
                                onDelete={
                                    handleAturanDetailDelete
                                }
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
