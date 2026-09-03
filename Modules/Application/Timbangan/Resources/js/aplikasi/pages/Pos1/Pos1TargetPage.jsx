import React, { useCallback, useEffect, useState } from 'react';

import {
    Plus,
    RefreshCw,
} from 'lucide-react';

import pos1TargetService from '@Modules/Application/Timbangan/Resources/js/aplikasi/services/Pos1/pos1TargetService';

import Pos1TargetForm from './components/Pos1TargetForm';
import Pos1TargetTable from './components/Pos1TargetTable';

export default function Pos1TargetPage() {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [editing, setEditing] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const loadData = useCallback(async () => {
        setLoading(true);

        try {
            const response = await pos1TargetService.getAll();

            setData(response?.data ?? []);
        } catch (error) {
            console.error('Gagal mengambil target Pos 1:', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const handleSubmit = async (payload) => {
        setSaving(true);

        try {
            if (editing) {
                await pos1TargetService.update(
                    editing.id,
                    payload
                );
            } else {
                await pos1TargetService.create(payload);
            }

            setEditing(null);
            setShowForm(false);

            await loadData();
        } catch (error) {
            console.error('Gagal menyimpan target Pos 1:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleEdit = (item) => {
        setEditing(item);
        setShowForm(true);
    };

    const handleDelete = async (item) => {
        if (
            !window.confirm(
                `Hapus target ${item.nomor_aturan} - ${item.jenis_tbk}?`
            )
        ) {
            return;
        }

        try {
            await pos1TargetService.delete(item.id);
            await loadData();
        } catch (error) {
            console.error('Gagal menghapus target Pos 1:', error);
        }
    };

    const handleNew = () => {
        setEditing(null);
        setShowForm(true);
    };

    const handleCancel = () => {
        setEditing(null);
        setShowForm(false);
    };

    const handleTimbang = (item) => {
        console.log('Mulai timbang Pos 1:', item);
    };

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-semibold">
                        Target Timbangan Pos 1
                    </h1>

                    <p className="text-sm text-gray-500">
                        Pengaturan target pekerjaan penimbangan.
                    </p>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={loadData}
                        disabled={loading}
                        className="inline-flex items-center gap-2 rounded-md border border-gray-300 px-4 py-2"
                    >
                        <RefreshCw size={16} />
                        Refresh
                    </button>

                    <button
                        type="button"
                        onClick={handleNew}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white"
                    >
                        <Plus size={16} />
                        Tambah Target
                    </button>
                </div>
            </div>

            {showForm && (
                <Pos1TargetForm
                    data={editing}
                    loading={saving}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                />
            )}

            <Pos1TargetTable
                data={data}
                loading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onTimbang={handleTimbang}
            />
        </div>
    );
}

