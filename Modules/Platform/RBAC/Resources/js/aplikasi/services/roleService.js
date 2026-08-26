import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const roleService = {

    /**
     * Mengambil seluruh Role.
     */
    async getRoles() {
        const response = await api.get('/roles');
        return response.data;
    },

    /**
     * Membuat Role baru.
     */
    async createRole(payload) {
        const response = await api.post(
            '/roles',
            payload
        );

        return response.data;
    },

    /**
     * Memperbarui Role.
     */
    async updateRole(id, payload) {
        const response = await api.put(
            `/roles/${id}`,
            payload
        );

        return response.data;
    },

    /**
     * Menghapus Role.
     */
    async deleteRole(id) {
        const response = await api.delete(
            `/roles/${id}`
        );

        return response.data;
    },


    async getRolePermissions(roleId) {
        const response = await api.get(
            `/roles/${roleId}/permissions`
        );

        return response.data;
    },

    /**
     * Mengambil seluruh permission beserta
     * status assignment-nya.
     */
    async getAvailablePermissions(roleId) {
        const response = await api.get(
            `/roles/${roleId}/available-permissions`
        );

        return response.data;
    },

    /**
     * Sinkronisasi permission role.
     */
    async syncRolePermissions(roleId, permissions) {
        const response = await api.put(
            `/roles/${roleId}/permissions`,
            {
                permissions,
            }
        );

        return response.data;
    },

};

export default roleService;