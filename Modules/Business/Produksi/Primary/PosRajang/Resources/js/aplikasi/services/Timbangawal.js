
import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/api/posrajang/timbangawal';

const apiClient = api.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

const TimbangAwal = {

    /*
    |--------------------------------------------------------------------------
    | SESSION / DRAFT
    |--------------------------------------------------------------------------
    */

    initiateTimbanganDraft: async (data) => {
        const response = await apiClient.post(
            '/connect-and-init',
            data
        );

        return response.data;
    },

    cariBatch: async (data) => {
        const response = await apiClient.post(
            '/cari-batch',
            data
        );

        return response.data;
    },

    updateDraft: async (data) => {
        const response = await apiClient.post(
            '/update-draft',
            data
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | PACK / KARUNG
    |--------------------------------------------------------------------------
    */

    tambahPack: async (data) => {
        const response = await apiClient.post(
            '/karung',
            data
        );

        return response.data;
    },

    deletePack: async (data) => {
        const response = await apiClient.delete(
            '/karung',
            {
                data,
            }
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | FINISH SESSION
    |--------------------------------------------------------------------------
    */

    commitTimbangan: async (data) => {
        const response = await apiClient.post(
            '/finish-session',
            data
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | PRINT
    |--------------------------------------------------------------------------
    */

    printBatch: async (id) => {
        const response = await apiClient.get(
            `/print/${id}`,
            {
                responseType: 'text',
            }
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | HASIL TIMBANGAN
    |--------------------------------------------------------------------------
    */

    getDetail: async (id) => {
        const response = await apiClient.get(
            `/hasil-timbangan/${id}`
        );

        return response.data;
    },

    getHasilTimbangan: async () => {
        const response = await apiClient.get(
            '/hasil-timbangan'
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | DATA TIMBANG DARI NODE-RED
    |--------------------------------------------------------------------------
    |
    | Node-RED:
    | POST /api/timbangan/penerimaan
    |
    | React:
    | GET /api/timbangan/penerimaan
    |
    */

    getDataTimbangMasuk: async () => {
        const response = await api.get(
            '/timbangan/penerimaan'
        );

        return response.data;
    },

};

export default TimbangAwal;
