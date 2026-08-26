import api from '@Modules/System/Resources/js/aplikasi/axios/axios.js'; // Menggunakan instance api yang sudah Anda buat

export const authService = {
    // Roles
    getRoles: () => api.get('/roles'),
    createRole: (data) => api.post('/roles', data),
    updateRole: (id, data) => api.put(`/roles/${id}`, data),
    deleteRole: (id) => api.delete(`/roles/${id}`),

    // Permissions
    getPermissions: () => api.get('/permissions'),

    // Matrix
    getMatrix: () => api.get('/matrix/permissions'),
    updateMatrix: (matrixData) => api.post('/matrix/permissions', { matrix: matrixData }),

    // Users
    getUsers: () => api.get('/users'),
    createUser: (data) => api.post('/users', data),
    updateUser: (id, data) => api.put(`/users/${id}`, data),
    deleteUser: (id) => api.delete(`/users/${id}`),
};