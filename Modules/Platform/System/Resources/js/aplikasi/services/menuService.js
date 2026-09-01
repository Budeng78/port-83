import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios';

const API_URL = '/system/menus';

export const menuService = {
    /**
     * Mengambil seluruh menu master.
     *
     * Endpoint:
     * GET /api/system/menus
     *
     * Response:
     * {
     *   success: true,
     *   data: [...]
     * }
     */
    async getMenus() {
        const response = await api.get(API_URL);

        return response.data.data;
    },

    /**
     * Membuat menu baru.
     *
     * organization_unit_name:
     *   Nama Organization Unit yang menjadi
     *   acuan akses menu.
     *
     * permission_key:
     *   Permission yang diperlukan setelah
     *   user masuk ke menu.
     */
    async createMenu(data) {
        const response = await api.post(API_URL, {
            parent_id: data.parent_id ?? null,
            label: data.label,
            path: data.path ?? null,
            icon: data.icon ?? null,

            organization_unit_name:
                data.organization_unit_name ?? null,

            permission_key:
                data.permission_key ?? null,

            order: data.order ?? 0,
            is_active: data.is_active ?? true,
        });

        return response.data;
    },

    /**
     * Memperbarui menu.
     */
    async updateMenu(id, data) {
        const response = await api.put(
            `${API_URL}/${id}`,
            {
                parent_id: data.parent_id ?? null,
                label: data.label,
                path: data.path ?? null,
                icon: data.icon ?? null,

                organization_unit_name:
                    data.organization_unit_name ?? null,

                permission_key:
                    data.permission_key ?? null,

                order: data.order ?? 0,
                is_active: data.is_active ?? true,
            }
        );

        return response.data;
    },

    /**
     * Menghapus menu.
     */
    async deleteMenu(id) {
        const response = await api.delete(
            `${API_URL}/${id}`
        );

        return response.data;
    },
};