import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const BASE_URL = '/timbangan/pos1/target';

const pos1TargetService = {
    getAll: async (params = {}) => {
        const response = await axios.get(BASE_URL, {
            params,
        });

        return response.data;
    },

    getById: async (id) => {
        const response = await axios.get(`${BASE_URL}/${id}`);

        return response.data;
    },

    create: async (data) => {
        const response = await axios.post(BASE_URL, data);

        return response.data;
    },

    update: async (id, data) => {
        const response = await axios.put(`${BASE_URL}/${id}`, data);

        return response.data;
    },

    delete: async (id) => {
        const response = await axios.delete(`${BASE_URL}/${id}`);

        return response.data;
    },

    // PERBAIKAN: Hilangkan 'export const' & gunakan format method objek
    generateBatchCode: async (tanggal) => {
        try {
            const response = await axios.get(`${BASE_URL}/generate-batch-code`, {
                params: { tanggal },
            });
            return response.data; // Mengembalikan { success: true, kode_batch: "..." }
        } catch (error) {
            console.error("Error generating batch code:", error);
            throw error;
        }
    },
};

export default pos1TargetService;