import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/organization-levels';

const organizationLevelService = {

    /**
     * ============================================================
     * GET ORGANIZATION LEVELS
     * GET /api/organization-levels
     * ============================================================
     *
     * params:
     * - search
     * - is_active
     */
    async getOrganizationLevels(params = {}) {

        const queryParams = {
            search: params.search ?? '',
        };

        if (
            params.is_active !== undefined &&
            params.is_active !== null &&
            params.is_active !== ''
        ) {
            queryParams.is_active = params.is_active;
        }

        const response = await api.get(BASE_URL, {
            params: queryParams,
        });

        return response.data;
    },


    /**
     * ============================================================
     * GET ORGANIZATION LEVEL DETAIL
     * GET /api/organization-levels/{id}
     * ============================================================
     */
    async getOrganizationLevel(id) {

        const response = await api.get(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },


    /**
     * ============================================================
     * CREATE ORGANIZATION LEVEL
     * POST /api/organization-levels
     * ============================================================
     */
    async createOrganizationLevel(payload) {

        const response = await api.post(
            BASE_URL,
            payload
        );

        return response.data;
    },


    /**
     * ============================================================
     * UPDATE ORGANIZATION LEVEL
     * PUT /api/organization-levels/{id}
     * ============================================================
     */
    async updateOrganizationLevel(id, payload) {

        const response = await api.put(
            `${BASE_URL}/${id}`,
            payload
        );

        return response.data;
    },


    /**
     * ============================================================
     * DELETE ORGANIZATION LEVEL
     * DELETE /api/organization-levels/{id}
     * ============================================================
     */
    async deleteOrganizationLevel(id) {

        const response = await api.delete(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },

};

export default organizationLevelService;