import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/rnd';

const kirimanTbkService = {
    /**
     * Ambil aturan beserta detailnya.
     */
    getAturan: async (aturanId) => {
        const response = await axios.get(
            `${BASE_URL}/aturan/${aturanId}`
        );

        return response.data;
    },

    /**
     * Ambil semua kiriman berdasarkan aturan.
     */
    getByAturan: async (aturanId) => {
        const response = await axios.get(
            `${BASE_URL}/aturan/${aturanId}/kiriman`
        );

        return response.data;
    },

    /**
     * Ambil satu kiriman.
     */
    getById: async (id) => {
        const response = await axios.get(
            `${BASE_URL}/kiriman/${id}`
        );

        return response.data;
    },

    /**
     * Simpan kiriman + detail.
     */
    create: async (aturanId, payload) => {
        const response = await axios.post(
            `${BASE_URL}/aturan/${aturanId}/kiriman`,
            payload
        );

        return response.data;
    },

    /**
     * Update kiriman + detail.
     */
    update: async (id, payload) => {
        const response = await axios.put(
            `${BASE_URL}/kiriman/${id}`,
            payload
        );

        return response.data;
    },

    /**
     * Soft delete.
     */
    delete: async (id) => {
        const response = await axios.delete(
            `${BASE_URL}/kiriman/${id}`
        );

        return response.data;
    },

    /**
     * Ambil trash.
     */
    getTrash: async () => {
        const response = await axios.get(
            `${BASE_URL}/kiriman/trash`
        );

        return response.data;
    },

    /**
     * Restore.
     */
    restore: async (id) => {
        const response = await axios.post(
            `${BASE_URL}/kiriman/${id}/restore`
        );

        return response.data;
    },

    /**
     * Force delete.
     */
    forceDelete: async (id) => {
        const response = await axios.delete(
            `${BASE_URL}/kiriman/${id}/force`
        );

        return response.data;
    },
};

export default kirimanTbkService;