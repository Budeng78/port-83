import api from '@Modules/System/Resources/js/aplikasi/axios/axios';

const roleService = {
    async getRoles() {
        const response = await api.get('/roles');
        return response.data;
    },

    async getPermissions() {
        const response = await api.get('/permissions');
        return response.data;
    },

    async createRole(payload) {
        const response = await api.post('/roles', payload);
        return response.data;
    },

    async updateRole(id, payload) {
        const response = await api.put(`/roles/${id}`, payload);
        return response.data;
    },

    async deleteRole(id) {
        const response = await api.delete(`/roles/${id}`);
        return response.data;
    },
};

export default roleService;