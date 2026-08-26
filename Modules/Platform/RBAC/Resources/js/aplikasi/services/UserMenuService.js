import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios.js';

const UserMenuService = {

    async getUserMenus(userId) {

        const response = await api.get(
            `/users/${userId}/menus`
        );

        return response.data;
    },


    async updateUserMenus(userId, menuIds) {

        const response = await api.put(
            `/users/${userId}/menus`,
            menuIds
        );

        return response.data;
    },

};

export default UserMenuService;