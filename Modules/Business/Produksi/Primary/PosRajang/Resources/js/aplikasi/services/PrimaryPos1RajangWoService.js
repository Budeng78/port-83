import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';


const BASE_URL = '/posrajang/wo';


const PrimaryPos1RajangWoService = {

    /*
    |--------------------------------------------------------------------------
    | GET LIST WO
    |--------------------------------------------------------------------------
    */

    async getAll(params = {}) {

        const response = await api.get(
            BASE_URL,
            {
                params
            }
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | GET WO DETAIL
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | CREATE WO
    |--------------------------------------------------------------------------
    */

    async create(payload) {

        const response = await api.post(
            BASE_URL,
            payload
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | UPDATE WO
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | DELETE WO
    |--------------------------------------------------------------------------
    */

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


    /*
    |--------------------------------------------------------------------------
    | RESTORE WO
    |--------------------------------------------------------------------------
    */

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


};


export default PrimaryPos1RajangWoService;
