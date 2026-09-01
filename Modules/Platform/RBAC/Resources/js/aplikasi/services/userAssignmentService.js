import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

import UserService
    from '@Modules/Platform/Auth/Resources/js/aplikasi/services/UserService';

import organizationUnitService
    from './organizationUnitService';

import organizationLevelService
    from './organizationLevelService';


const BASE_URL = '/assignments';


const userAssignmentService = {

    // =========================================================
    // GET USER ASSIGNMENTS
    // GET /api/assignments
    //
    // 1 ROW = 1 USER
    // =========================================================
    async getAssignments(params = {}) {

        const response = await api.get(
            BASE_URL,
            {
                params: {
                    search:
                        params.search ?? '',

                    user_id:
                        params.user_id ?? '',

                    organization_unit_id:
                        params.organization_unit_id ?? '',

                    organization_level_id:
                        params.organization_level_id ?? '',

                    is_active:
                        params.is_active ?? '',

                    is_primary:
                        params.is_primary ?? '',

                    page:
                        params.page ?? 1,

                    per_page:
                        params.per_page ?? 15,
                },
            }
        );

        /*
         * Axios:
         *
         * response.data
         *
         * Contoh:
         *
         * {
         *     success: true,
         *     data: [...],
         *     meta: {...}
         * }
         */

        return response.data;
    },


    // =========================================================
    // GET DETAIL
    // =========================================================
    async getAssignment(id) {

        const response = await api.get(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },


    // =========================================================
    // CREATE
    // =========================================================
    async createAssignment(payload) {

        const response = await api.post(
            BASE_URL,
            payload
        );

        return response.data;
    },


    // =========================================================
    // UPDATE
    // =========================================================
    async updateAssignment(id, payload) {

        const response = await api.put(
            `${BASE_URL}/${id}`,
            payload
        );

        return response.data;
    },


    // =========================================================
    // DELETE
    // =========================================================
    async deleteAssignment(id) {

        const response = await api.delete(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },


    // =========================================================
    // MASTER USERS
    // =========================================================
    async getUsers(params = {}) {

        return UserService.getUsers({
            page:
                params.page ?? 1,

            search:
                params.search ?? '',

            per_page:
                params.per_page ?? 1000,
        });
    },


    // =========================================================
    // MASTER ORGANIZATION UNITS
    // =========================================================
    async getOrganizationUnits(params = {}) {

        return organizationUnitService
            .getOrganizationUnits(params);
    },


    // =========================================================
    // MASTER ORGANIZATION LEVELS
    // =========================================================
    async getOrganizationLevels(params = {}) {

        return organizationLevelService
            .getOrganizationLevels(params);
    },

};


export default userAssignmentService;