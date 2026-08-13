import api from '@Modules/System/Resources/js/aplikasi/axios/axios.js';

const UserService = {

    /**
     * =====================================================
     * AMBIL DAFTAR USER
     * GET /api/users
     * =====================================================
     */
    async getUsers(params = {}) {

        const response = await api.get(
            '/users',
            {
                params,
            }
        );

        return response.data;
    },


    /**
     * =====================================================
     * AMBIL DETAIL USER
     * GET /api/users/{id}
     * =====================================================
     */
    async getUser(id) {

        const response = await api.get(
            `/users/${id}`
        );

        return response.data;
    },


    /**
     * =====================================================
     * TAMBAH USER
     * POST /api/users
     * =====================================================
     */
    async createUser(data) {

        const response = await api.post(
            '/users',
            data
        );

        return response.data;
    },


    /**
     * =====================================================
     * UPDATE USER
     * PUT /api/users/{id}
     * =====================================================
     */
    async updateUser(id, data) {

        const response = await api.put(
            `/users/${id}`,
            data
        );

        return response.data;
    },


    /**
     * =====================================================
     * HAPUS USER
     * DELETE /api/users/{id}
     * =====================================================
     */
    async deleteUser(id) {

        const response = await api.delete(
            `/users/${id}`
        );

        return response.data;
    },

};

export default UserService;