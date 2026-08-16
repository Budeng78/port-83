import api from '@Modules/System/Resources/js/aplikasi/axios/axios';

const permissionService = {
    async getPermissions() {
        const response = await api.get('/permissions');
        return response.data;
    },

    async createPermission(payload) {
        const response = await api.post('/permissions', payload);
        return response.data;
    },

    async updatePermission(id, payload) {
        const response = await api.put(`/permissions/${id}`, payload);
        return response.data;
    },

    async deletePermission(id) {
        const response = await api.delete(`/permissions/${id}`);
        return response.data;
    },
};

export default permissionService;