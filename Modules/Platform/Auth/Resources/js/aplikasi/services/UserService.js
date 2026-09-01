
import api from "@Modules/Platform/System/Resources/js/aplikasi/axios/axios";

const UserService = {

    /**
     * ============================================================
     * GET USERS
     * GET /api/users
     * ============================================================
     */
    async getUsers(params = {}) {
        const response = await api.get("/users", {
            params: {
                page: params.page ?? 1,
                search: params.search ?? "",
            },
        });

        return response.data;
    },


    /**
     * ============================================================
     * GET USER DETAIL
     * GET /api/users/{id}
     * ============================================================
     */
    async getUser(id) {
        const response = await api.get(`/users/${id}`);

        return response.data;
    },


    /**
     * ============================================================
     * CREATE USER
     * POST /api/users
     * ============================================================
     */
    async createUser(payload) {
        const response = await api.post("/users", payload);

        return response.data;
    },


    /**
     * ============================================================
     * UPDATE USER
     * PUT /api/users/{id}
     * ============================================================
     */
    async updateUser(id, payload) {
        const response = await api.put(`/users/${id}`, payload);

        return response.data;
    },


    /**
     * ============================================================
     * DELETE USER
     * DELETE /api/users/{id}
     * ============================================================
     */
    async deleteUser(id) {
        const response = await api.delete(`/users/${id}`);

        return response.data;
    },

};


export default UserService;
