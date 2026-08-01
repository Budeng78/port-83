import React, { useState, useEffect } from 'react';
import { authService } from '@modules/Auth/Resources/js/aplikasi/services/authService'; // Sesuaikan jalur import authService Anda

export default function PermissionMatrix() {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [matrix, setMatrix] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        fetchMatrixData();
    }, []);

    const fetchMatrixData = async () => {
            try {
                setLoading(true);
                setMessage(null);
                const response = await authService.getMatrix();
                
                // Ambil data dengan aman menggunakan optional chaining
                const responseData = response.data?.data || response.data || {};
                const rolesData = responseData.roles || [];
                const permissionsData = responseData.permissions || [];
                
                setRoles(rolesData);
                setPermissions(permissionsData);

                // Inisialisasi state matriks lokal secara aman
                const initialMatrix = {};
                rolesData.forEach(role => {
                    initialMatrix[role.id] = role.permissions ? role.permissions.map(p => p.name) : [];
                });
                setMatrix(initialMatrix);
            } catch (error) {
                console.error('Gagal memuat data matriks:', error);
                setMessage({ 
                    type: 'error', 
                    text: error.response?.data?.message || 'Gagal memuat data matriks dari server.' 
                });
            } finally {
                setLoading(false);
            }
        };

    const handleCheckboxChange = (roleId, permissionName) => {
        setMatrix(prev => {
            const currentPermissions = prev[roleId] || [];
            if (currentPermissions.includes(permissionName)) {
                // Hapus jika sudah ada
                return {
                    ...prev,
                    [roleId]: currentPermissions.filter(p => p !== permissionName)
                };
            } else {
                // Tambahkan jika belum ada
                return {
                    ...prev,
                    [roleId]: [...currentPermissions, permissionName]
                };
            }
        });
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setMessage(null);
            await authService.updateMatrix(matrix);
            setMessage({ type: 'success', text: 'Matriks hak akses berhasil disimpan!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal menyimpan perubahan matriks.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-6 text-center text-gray-500">Memuat matriks hak akses...</div>;
    }

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Matriks Hak Akses (Role & Permission)</h1>
                    <p className="text-sm text-gray-600">Atur hak akses untuk setiap peran secara cepat dan massal.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium shadow transition disabled:opacity-50"
                >
                    {saving ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>

            {message && (
                <div className={`p-4 mb-4 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                    Permission / Peran
                                </th>
                                {roles.map(role => (
                                    <th key={role.id} className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        {role.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {permissions.map(permission => (
                                <tr key={permission.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {permission.name}
                                    </td>
                                    {roles.map(role => {
                                        const isChecked = matrix[role.id]?.includes(permission.name) || false;
                                        const isSuperAdmin = role.name === 'Super Admin';

                                        return (
                                            <td key={role.id} className="px-6 py-4 whitespace-nowrap text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={isSuperAdmin ? true : isChecked}
                                                    disabled={isSuperAdmin}
                                                    onChange={() => handleCheckboxChange(role.id, permission.name)}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer disabled:opacity-50"
                                                />
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}