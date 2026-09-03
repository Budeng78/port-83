import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/rnd/aturan';

export const tobaccoAturanService = {

    /**
     * Mengambil seluruh aturan tembakau
     */
    getAll: async (params = {}) => {
            const response = await axios.get(BASE_URL, {
                params,
            });

            return response.data;
        },

    /**
     * Mengambil satu aturan berdasarkan ID
     */
    getById: async (id) => {
        const response = await axios.get(`${BASE_URL}/${id}`);

        return response.data;
    },

    /**
     * Membuat aturan tembakau baru
     */
    create: async (data) => {
        const response = await axios.post(BASE_URL, data);

        return response.data;
    },

    /**
     * Memperbarui aturan tembakau
     */
    update: async (id, data) => {
        const response = await axios.put(
            `${BASE_URL}/${id}`,
            data
        );

        return response.data;
    },

    /**
     * Soft delete aturan tembakau
     */
    delete: async (id) => {
        const response = await axios.delete(
            `${BASE_URL}/${id}`
        );

        return response.data;
    },

    /**
     * Mengambil data yang berada di trash
     */
    getTrash: async () => {
        const response = await axios.get(
            `${BASE_URL}/trash`
        );

        return response.data;
    },

    /**
     * Restore aturan dari trash
     */
    restore: async (id) => {
        const response = await axios.post(
            `${BASE_URL}/${id}/restore`
        );

        return response.data;
    },

    /**
     * Hapus permanen aturan
     */
    forceDelete: async (id) => {
        const response = await axios.delete(
            `${BASE_URL}/${id}/force`
        );

        return response.data;
    },
};
