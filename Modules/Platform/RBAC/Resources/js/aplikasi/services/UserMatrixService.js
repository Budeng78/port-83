import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios.js';

const UserMatrixService = {

    /*
    |--------------------------------------------------------------------------
    | GET USER MATRIX
    |--------------------------------------------------------------------------
    |
    | Mengambil detail matrix satu user.
    |
    */

    async getUserMatrix(userId) {

        const response = await api.get(
            `/matrix/users/${userId}`
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | GET USER MENU ACCESS
    |--------------------------------------------------------------------------
    |
    | Menu Access bersifat READ ONLY.
    |
    | Menu dihitung dari:
    |
    | User
    |   ↓
    | Role / Direct Permission
    |   ↓
    | Permission
    |   ↓
    | Menu
    |
    */

    async getUserMenus(userId) {

        const response = await api.get(
            `/matrix/users/${userId}/menus`
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | CREATE ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    async createAssignment(
        userId,
        payload
    ) {

        const response = await api.post(
            `/matrix/users/${userId}/assignments`,
            payload
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | UPDATE ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    async updateAssignment(
        userId,
        assignmentId,
        payload
    ) {

        const response = await api.put(
            `/matrix/users/${userId}/assignments/${assignmentId}`,
            payload
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | DELETE ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    async deleteAssignment(
        userId,
        assignmentId
    ) {

        const response = await api.delete(
            `/matrix/users/${userId}/assignments/${assignmentId}`
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | ADD ROLE
    |--------------------------------------------------------------------------
    */

    async addRole(
        userId,
        roleId
    ) {

        const response = await api.post(
            `/matrix/users/${userId}/roles`,
            {
                role_id: roleId,
            }
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | REMOVE ROLE
    |--------------------------------------------------------------------------
    */

    async removeRole(
        userId,
        roleId
    ) {

        const response = await api.delete(
            `/matrix/users/${userId}/roles/${roleId}`
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | ADD DIRECT PERMISSION
    |--------------------------------------------------------------------------
    */

    async addPermission(
        userId,
        permissionId
    ) {

        const response = await api.post(
            `/matrix/users/${userId}/permissions`,
            {
                permission_id: permissionId,
            }
        );

        return response.data;
    },


    /*
    |--------------------------------------------------------------------------
    | REMOVE DIRECT PERMISSION
    |--------------------------------------------------------------------------
    */

    async removePermission(
        userId,
        permissionId
    ) {

        const response = await api.delete(
            `/matrix/users/${userId}/permissions/${permissionId}`
        );

        return response.data;
    },

};


export default UserMatrixService;