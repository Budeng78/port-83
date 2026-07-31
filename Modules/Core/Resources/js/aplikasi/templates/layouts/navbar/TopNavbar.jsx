import React, { useState, useRef, useEffect } from 'react';
import { 
    Bell, User, Settings, LogOut, Shield 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@modules/Auth/Resources/js/aplikasi/context/AuthContext';
import api from '@modules/Auth/Resources/js/aplikasi/axios/axios.js'; // <-- PERBAIKAN: Gunakan instance kustom 'api'

import LogoWartono from '../../components/logo_mc-wartono.png'; 

export default function TopNavbar() {
    const { user, logout } = useAuth(); 
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleLogoutClick = async () => {
        setIsOpen(false);
        await logout();    
    };

    const goToProfile = () => {
        setIsOpen(false);
        navigate('/profil');
    };

    return (
        <nav className="w-full h-16 bg-gradient-to-r from-[#081a4d] via-[#1e3a8a] to-[#3b82f6] flex items-center justify-between px-4 md:px-8 z-[1020] sticky top-0 shadow-lg border-b border-white/10">
            <div className="flex items-center gap-4">
                <img src={LogoWartono} alt="logo" className="h-10 w-auto object-contain" />
                <div className="hidden md:block h-8 w-[1px] bg-white/20 mx-2"></div>
                <h1 className="hidden md:block text-xl font-black text-white uppercase italic tracking-tighter">
                    pt. sukun wartono indonesia
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <button className="p-2 text-white/80 hover:text-white transition-colors relative">
                    <Bell size={22} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full"></span>
                </button>

                <div className="relative" ref={dropdownRef}>
                    <button 
                        onClick={() => setIsOpen(!isOpen)}
                        className="flex items-center gap-3 p-1 rounded-2xl hover:bg-white/10 transition-all"
                    >
                        <div className="text-right hidden md:block">
                            <p className="text-sm font-black text-white lowercase leading-none">
                                {user?.name || 'master admin prototype'}
                            </p>
                            <p className="text-[10px] text-blue-200 font-bold lowercase mt-1 tracking-widest">
                                {user?.role || 'super-admin'}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg">
                            <User size={20} className="text-[#081a4d] stroke-[3]" />
                        </div>
                    </button>

                    <AnimatePresence>
                        {isOpen && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                            >
                                <div className="p-4 border-b border-slate-50">
                                    <p className="text-[10px] font-bold text-slate-400 lowercase">email address</p>
                                    <p className="text-sm font-black text-slate-800 lowercase truncate">
                                        {user?.email || 'admin@system.com'}
                                    </p>
                                </div>
                                <div className="p-2 space-y-1">
                                    <button onClick={goToProfile} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-blue-600 rounded-xl transition-all">
                                        <Settings size={18} /> pengaturan akun
                                    </button>

                                    <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 px-3 py-2.5 text-sm font-bold text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                        <LogOut size={18} /> keluar sistem
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </nav>
    );
}