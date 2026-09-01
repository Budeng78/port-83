import axios from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios'; // Sesuaikan alias path jika project menggunakan '@/' atau relative path

export const tobaccoAturanService = {
    // Mengambil semua data aturan tembakau
    getAll: async () => {
        const response = await axios.get('/tobacco-aturan');
        return response.data;
    },

    // Mengambil detail berdasarkan ID
    getById: async (id) => {
        const response = await axios.get(`/tobacco-aturan/${id}`);
        return response.data;
    },

    // Menyimpan data baru
    create: async (data) => {
        const response = await axios.post('/tobacco-aturan', data);
        return response.data;
    },

    // Memperbarui data
    update: async (id, data) => {
        const response = await axios.put(`/tobacco-aturan/${id}`, data);
        return response.data;
    },

    // Menghapus data (Soft Delete)
    delete: async (id) => {
        const response = await axios.delete(`/tobacco-aturan/${id}`);
        return response.data;
    }
};