import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/organization-units';

const organizationUnitService = {

    async getOrganizationUnits(params = {}) {

        const queryParams = {
            search: params.search ?? '',
        };

        if (
            params.organization_level_id !== undefined &&
            params.organization_level_id !== null &&
            params.organization_level_id !== ''
        ) {
            queryParams.organization_level_id =
                params.organization_level_id;
        }

        if (
            params.is_active !== undefined &&
            params.is_active !== null &&
            params.is_active !== ''
        ) {
            queryParams.is_active =
                params.is_active;
        }

        const response = await api.get(BASE_URL, {
            params: queryParams,
        });

        return response.data;
    },


    async getOrganizationUnit(id) {

        const response = await api.get(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },


    async createOrganizationUnit(payload) {

        const response = await api.post(
            BASE_URL,
            payload
        );

        return response.data;
    },


    async updateOrganizationUnit(id, payload) {

        const response = await api.put(
            `${BASE_URL}/${id}`,
            payload
        );

        return response.data;
    },


    async deleteOrganizationUnit(id) {

        const response = await api.delete(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },

};

export default organizationUnitService;