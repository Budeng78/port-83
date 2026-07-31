import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../axios/axios.js';

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    // 1. Injeksi token langsung secara sinkron saat pertama kali file dimuat/dirender
    const token = localStorage.getItem('access_token');
    if (token && token !== 'undefined' && token !== 'null') {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user_data');
        if (savedUser && savedUser !== 'undefined' && savedUser !== 'null') {
            try {
                return JSON.parse(savedUser);
            } catch (e) { return null; }
        }
        return null;
    });

    const [loading, setLoading] = useState(false); // Ubah default loading jadi false agar tidak menahan render

    const login = (userData, token) => {
        if (userData.is_active === false) {
            return { success: false, message: 'Akun dinonaktifkan.' };
        }
        localStorage.setItem('access_token', token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        setUser(userData);
        return { success: true };
    };

    const updateUser = (newUserData) => {
        const updatedData = { ...user, ...newUserData };
        localStorage.setItem('user_data', JSON.stringify(updatedData));
        setUser(updatedData);
    };

    const logout = async () => {
        if (!confirm("Yakin ingin mengakhiri sesi prototype?")) return;

        try {
            await api.post('/logout');
        } catch (error) {
            console.warn("Server sudah melogout duluan atau koneksi terputus");
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('user_data');
            delete api.defaults.headers.common['Authorization'];
            setUser(null);
            window.location.replace("/");
        }
    };

    const hasPermission = (p) => {
        const perms = user?.extra_permissions || [];
        return Array.isArray(p) ? p.some(x => perms.includes(x)) : perms.includes(p);
    };

    return (
        <AuthContext.Provider value={{ 
            user, login, logout, hasPermission, updateUser,
            isAuthenticated: !!user, 
            loading 
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        return {
            user: null,
            login: () => {},
            logout: () => {},
            hasPermission: () => false,
            updateUser: () => {},
            isAuthenticated: false,
            loading: false,
        };
    }
    return context;
};