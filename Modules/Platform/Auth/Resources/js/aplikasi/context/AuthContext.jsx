import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';

import api from '@Modules/Platform/System/Resources/js/aplikasi/axios/axios.js';


export const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {

    // =====================================================
    // RESTORE TOKEN
    // =====================================================

    const [token, setToken] = useState(() => {

        return localStorage.getItem(
            'access_token'
        );

    });


    // =====================================================
    // RESTORE USER
    // =====================================================

    const [user, setUser] = useState(() => {

        const savedUser =
            localStorage.getItem('user_data');


        if (
            !savedUser ||
            savedUser === 'undefined' ||
            savedUser === 'null'
        ) {

            return null;

        }


        try {

            return JSON.parse(savedUser);

        } catch (error) {

            console.warn(
                'Gagal membaca user_data:',
                error
            );

            return null;

        }

    });


    // =====================================================
    // USER NAVIGATION MENUS
    // =====================================================

    const [
        userMenus,
        setUserMenus
    ] = useState([]);


    // =====================================================
    // MENU LOADING
    // =====================================================

    const [
        menusLoading,
        setMenusLoading
    ] = useState(false);


    // =====================================================
    // RESTORE AUTHORIZATION HEADER
    // =====================================================

    useEffect(() => {

        if (
            token &&
            token !== 'undefined' &&
            token !== 'null'
        ) {

            api.defaults.headers.common[
                'Authorization'
            ] = `Bearer ${token}`;

        } else {

            delete api
                .defaults
                .headers
                .common
                .Authorization;

        }

    }, [token]);


    // =====================================================
    // LOGIN
    // =====================================================

    const login = (
        userData,
        accessToken
    ) => {

        if (
            userData?.is_active === false
        ) {

            return {
                success: false,
                message: 'Akun dinonaktifkan.',
            };

        }


        // -----------------------------------------------
        // STORAGE
        // -----------------------------------------------

        localStorage.setItem(
            'access_token',
            accessToken
        );


        localStorage.setItem(
            'user_data',
            JSON.stringify(userData)
        );


        // -----------------------------------------------
        // AXIOS
        // -----------------------------------------------

        api.defaults.headers.common[
            'Authorization'
        ] = `Bearer ${accessToken}`;


        // -----------------------------------------------
        // STATE
        // -----------------------------------------------

        setToken(accessToken);

        setUser(userData);

        /*
        |--------------------------------------------------
        | Bersihkan menu lama.
        | Menu baru akan dimuat oleh useEffect setelah
        | token + user berubah.
        |--------------------------------------------------
        */

        setUserMenus([]);


        return {
            success: true,
        };

    };


    // =====================================================
    // LOAD USER NAVIGATION MENUS
    // =====================================================

    const loadUserMenus = async () => {

        /*
        |--------------------------------------------------
        | Tidak ada session
        |--------------------------------------------------
        */

        if (
            !token ||
            !user?.id
        ) {

            setUserMenus([]);

            return;

        }


        setMenusLoading(true);


        try {

            /*
            |--------------------------------------------------
            | PLATFORM / SYSTEM
            |--------------------------------------------------
            |
            | Endpoint navigasi user:
            |
            | GET /api/system/user-menus
            |
            | Controller:
            |
            | Modules\Platform\System\
            | Http\Controllers\
            | UserNavigationMenuController
            |
            | Endpoint ini menggunakan auth()->user()
            | sehingga TIDAK perlu mengirim user.id.
            |
            */

            const response =
                await api.get(
                    '/system/user-menus'
                );


            /*
            |--------------------------------------------------
            | RESPONSE
            |--------------------------------------------------
            |
            | {
            |     success: true,
            |     data: [...]
            | }
            |
            */

            const menus =
                Array.isArray(
                    response?.data?.data
                )
                    ? response.data.data
                    : [];


            /*
            |--------------------------------------------------
            | SIMPAN
            |--------------------------------------------------
            */

            setUserMenus(menus);



        } catch (error) {

            console.error(
                '[AuthContext] Gagal memuat User Navigation Menu:',
                error
            );


            setUserMenus([]);

        } finally {

            setMenusLoading(false);

        }

    };


    // =====================================================
    // LOAD MENU SAAT LOGIN / RESTORE SESSION
    // =====================================================

    useEffect(() => {

        if (
            token &&
            user?.id
        ) {

            loadUserMenus();

        } else {

            setUserMenus([]);

        }

    }, [
        token,
        user?.id,
    ]);


    // =====================================================
    // REFRESH USER MENU
    // =====================================================

    const refreshUserMenus = async () => {

        await loadUserMenus();

    };


    // =====================================================
    // UPDATE USER
    // =====================================================

    const updateUser = (
        newUserData
    ) => {

        const updatedUser = {
            ...user,
            ...newUserData,
        };


        localStorage.setItem(
            'user_data',
            JSON.stringify(updatedUser)
        );


        setUser(updatedUser);

    };


    // =====================================================
    // PERMISSION
    // =====================================================

    const hasPermission = (
        permission
    ) => {

        const permissions =
            user?.extra_permissions || [];


        if (
            Array.isArray(permission)
        ) {

            return permission.some(
                item =>
                    permissions.includes(item)
            );

        }


        return permissions.includes(
            permission
        );

    };


    // =====================================================
    // LOGOUT
    // =====================================================

    const logout = async () => {

        if (
            !window.confirm(
                'Yakin ingin mengakhiri sesi prototype?'
            )
        ) {

            return;

        }


        try {

            await api.post('/logout');

        } catch (error) {

            console.warn(
                'Server sudah melogout duluan atau koneksi terputus'
            );

        } finally {

            localStorage.removeItem(
                'access_token'
            );

            localStorage.removeItem(
                'user_data'
            );


            delete api
                .defaults
                .headers
                .common
                .Authorization;


            setToken(null);

            setUser(null);

            setUserMenus([]);


            window.location.replace('/');

        }

    };


    // =====================================================
    // CONTEXT
    // =====================================================

    return (

        <AuthContext.Provider
            value={{

                // -----------------------------------------
                // USER
                // -----------------------------------------

                user,

                token,


                // -----------------------------------------
                // AUTHENTICATION
                // -----------------------------------------

                login,

                logout,

                updateUser,

                isAuthenticated:
                    !!user,


                // -----------------------------------------
                // USER NAVIGATION MENU
                // -----------------------------------------

                userMenus,

                menusLoading,

                loadUserMenus,

                refreshUserMenus,


                // -----------------------------------------
                // PERMISSION
                // -----------------------------------------

                hasPermission,


                // -----------------------------------------
                // GENERAL
                // -----------------------------------------

                loading: false,

            }}
        >

            {children}

        </AuthContext.Provider>

    );

};


// =========================================================
// HOOK
// =========================================================

export const useAuth = () => {

    const context =
        useContext(AuthContext);


    if (!context) {

        return {

            user: null,

            token: null,

            userMenus: [],

            menusLoading: false,

            login: async () => ({
                success: false,
            }),

            logout: async () => {},

            updateUser: () => {},

            loadUserMenus: async () => {},

            refreshUserMenus: async () => {},

            hasPermission: () => false,

            isAuthenticated: false,

            loading: false,

        };

    }


    return context;

};