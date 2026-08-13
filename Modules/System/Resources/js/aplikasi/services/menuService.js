import api from '@Modules/System/Resources/js/aplikasi/axios/axios';

const API_URL = '/core/menus';

export const menuService = {
    // Mengambil seluruh menu (format tree)
    async getMenus() {
        const response = await api.get(API_URL);
        return response.data.data;
    },

    // Menambah menu baru
    async createMenu(data) {
        const response = await api.post(API_URL, data);
        return response.data;
    },

    // Memperbarui menu
    async updateMenu(id, data) {
        const response = await api.put(`${API_URL}/${id}`, data);
        return response.data;
    },

    // Menghapus menu
    async deleteMenu(id) {
        const response = await api.delete(`${API_URL}/${id}`);
        return response.data;
    }
};