import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

export const trashService = {
    /**
     * Mengambil daftar data yang berada di Trash berdasarkan modul & resource tertentu
     * @param {string} module - Nama modul (contoh: 'system')
     * @param {string} resource - Nama resource (contoh: 'menus')
     */
    async getTrashedData(module, resource) {
        try {
            const response = await api.get(`/system/trash/${module}/${resource}`);
            return response.data.data;
        } catch (error) {
            console.error(`Gagal memuat data sampah untuk ${module}/${resource}:`, error);
            throw error;
        }
    },

    /**
     * Mengambil seluruh data sampah secara global dari semua modul/tabel
     */
    async getAllTrashedData() {
        try {
            // Menggunakan instance 'api' agar konsisten dengan header auth/sanctum
            const response = await api.get('/system/trash/all');
            return response.data;
        } catch (error) {
            console.error('Gagal memuat data tempat sampah global:', error);
            throw error;
        }
    },

    /**
     * Memulihkan data dari Trash
     * @param {string} module - Nama modul
     * @param {string} resource - Nama resource
     * @param {string|number} id - ID data
     */
    async restoreData(module, resource, id) {
        try {
            const response = await api.post(`/system/trash/${module}/${resource}/${id}/restore`);
            return response.data;
        } catch (error) {
            console.error(`Gagal memulihkan data ID ${id}:`, error);
            throw error;
        }
    },

    /**
     * Menghapus data secara permanen (Force Delete)
     * @param {string} module - Nama modul
     * @param {string} resource - Nama resource
     * @param {string|number} id - ID data
     */
    async forceDeleteData(module, resource, id) {
        try {
            const response = await api.delete(`/system/trash/${module}/${resource}/${id}/force-delete`);
            return response.data;
        } catch (error) {
            console.error(`Gagal menghapus permanen data ID ${id}:`, error);
            throw error;
        }
    }
};