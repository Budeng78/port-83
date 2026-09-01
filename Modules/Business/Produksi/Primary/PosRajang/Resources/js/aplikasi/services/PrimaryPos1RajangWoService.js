import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/posrajang/wo';

const PrimaryPos1RajangWoService = {

    /*
    |--------------------------------------------------------------------------
    | WO HEADER
    |--------------------------------------------------------------------------
    */

    async getAll(params = {}) {

        const response = await api.get(
            BASE_URL,
            {
                params,
            }
        );

        return response.data;
    },


    async getById(id) {

        if (!id) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        const response = await api.get(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },


    async create(payload) {

        const response = await api.post(
            BASE_URL,
            payload
        );

        return response.data;
    },


    async update(id, payload) {

        if (!id) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        const response = await api.put(
            `${BASE_URL}/${id}`,
            payload
        );

        return response.data;
    },


    async delete(id) {

        if (!id) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        const response = await api.delete(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },


    async restore(id) {

        if (!id) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        const response = await api.post(
            `${BASE_URL}/${id}/restore`
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | WO DETAIL
    |--------------------------------------------------------------------------
    */

    async getDetails(
        woId,
        params = {}
    ) {

        if (!woId) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        const response = await api.get(
            `${BASE_URL}/${woId}/detail`,
            {
                params,
            }
        );

        return response.data;
    },


    async getDetail(
        woId,
        detailId
    ) {

        if (!woId) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        if (!detailId) {
            throw new Error(
                'ID detail WO wajib diberikan.'
            );
        }

        const response = await api.get(
            `${BASE_URL}/${woId}/detail/${detailId}`
        );

        return response.data;
    },


    async createDetail(
        woId,
        payload
    ) {

        if (!woId) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        const response = await api.post(
            `${BASE_URL}/${woId}/detail`,
            payload
        );

        return response.data;
    },


    async updateDetail(
        woId,
        detailId,
        payload
    ) {

        if (!woId) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        if (!detailId) {
            throw new Error(
                'ID detail WO wajib diberikan.'
            );
        }

        const response = await api.put(
            `${BASE_URL}/${woId}/detail/${detailId}`,
            payload
        );

        return response.data;
    },


    async deleteDetail(
        woId,
        detailId
    ) {

        if (!woId) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        if (!detailId) {
            throw new Error(
                'ID detail WO wajib diberikan.'
            );
        }

        const response = await api.delete(
            `${BASE_URL}/${woId}/detail/${detailId}`
        );

        return response.data;
    },


    async restoreDetail(
        woId,
        detailId
    ) {

        if (!woId) {
            throw new Error(
                'ID WO wajib diberikan.'
            );
        }

        if (!detailId) {
            throw new Error(
                'ID detail WO wajib diberikan.'
            );
        }

        const response = await api.post(
            `${BASE_URL}/${woId}/detail/${detailId}/restore`
        );

        return response.data;
    },

};

export default PrimaryPos1RajangWoService;