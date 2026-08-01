import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, User, LayoutGrid, X, ChevronRight } from 'lucide-react';
import api from '@modules/Auth/Resources/js/aplikasi/axios/axios.js'; // <-- PERBAIKAN: Gunakan instance kustom 'api'
import { useAuth } from '@modules/Auth/Resources/js/aplikasi/context/AuthContext';
import { DynamicIcon } from '../DynamicIcon';

/**
 * Komponen Rekursif untuk Bottom Navbar
 */
const BottomNavItem = ({ menu, pathname, toggleSubMenu, openSubMenus, closeAll }) => {
    const hasChild = Array.isArray(menu.children) && menu.children.length > 0;
    const isSubOpen = openSubMenus[menu.label];
    
    const isActive = pathname === menu.path || menu.children?.some(c => 
        c.path === pathname || (c.children && c.children.some(gc => gc.path === pathname))
    );

    return (
        <div className="overflow-hidden">
            <Link 
                to={hasChild ? '#' : menu.path} 
                onClick={(e) => {
                    if (hasChild) {
                        e.preventDefault();
                        toggleSubMenu(menu.label);
                    } else {
                        closeAll();
                    }
                }}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all active:scale-95 ${
                    isActive ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-600'
                }`}
            >
                <div className="flex items-center gap-3">
                    {/* Render Icon Dinamis dari Controller */}
                    {menu.icon && <DynamicIcon name={menu.icon} size={18} strokeWidth={isActive ? 2.5 : 2} />}
                    <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                        {menu.label}
                    </span>
                </div>
                {hasChild && (
                    <ChevronRight size={14} className={`transition-transform duration-300 ${isSubOpen ? 'rotate-90' : ''}`} />
                )}
            </Link>

            <AnimatePresence>
                {hasChild && isSubOpen && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="ml-6 border-l-2 border-slate-100 pl-4 mt-2 space-y-1"
                    >
                        {menu.children.map((child, ci) => (
                            <BottomNavItem 
                                key={ci} 
                                menu={child} 
                                pathname={pathname} 
                                toggleSubMenu={toggleSubMenu}
                                openSubMenus={openSubMenus}
                                closeAll={closeAll}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function BottomNavbar() {
    const [isOpen, setIsOpen] = useState(false);
    const { pathname } = useLocation();
    const { token } = useAuth(); // Token autentikasi
    const [menus, setMenus] = useState([]);
    const [openSubMenus, setOpenSubMenus] = useState({});

    // Ambil data menu dari Laravel Controller via API menggunakan instance 'api'
    useEffect(() => {
        api.get('/core/menus') // <-- PERBAIKAN: Gunakan api.get, interceptor menangani token otomatis
        .then(response => {
            setMenus(response.data.data || []);
        })
        .catch(error => {
            console.error("Gagal memuat menu bottom navbar:", error);
        });
    }, [token]);

    const closeAll = () => {
        setIsOpen(false);
        setOpenSubMenus({});
    };

    const toggleSubMenu = (label) => {
        setOpenSubMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        onClick={closeAll}
                        className="fixed inset-0 bg-slate-900/10 backdrop-blur-sm z-[998]"
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {isOpen && (
                    <motion.div 
                        initial={{ y: 15, opacity: 0, scale: 0.97 }}
                        animate={{ y: 0, opacity: 1, scale: 1 }}
                        exit={{ y: 15, opacity: 0, scale: 0.97 }}
                        className="fixed bottom-24 left-4 right-4 bg-white/90 backdrop-blur-2xl rounded-[2.5rem] p-6 z-[999] max-h-[70vh] overflow-y-auto shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-white/40 custom-scrollbar"
                    >
                        <div className="flex flex-col gap-2">
                            {menus.map((menu, i) => (
                                <BottomNavItem 
                                    key={i} 
                                    menu={menu} 
                                    pathname={pathname} 
                                    toggleSubMenu={toggleSubMenu}
                                    openSubMenus={openSubMenus}
                                    closeAll={closeAll}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <nav className="fixed bottom-6 left-6 right-6 z-[1000] md:hidden h-16">
                <div className="absolute inset-0 bg-white/80 backdrop-blur-2xl border border-white/50 rounded-[2.5rem] shadow-[0_10px_30px_rgba(0,0,0,0.08)]" />
                <div className="relative flex justify-around items-center h-full px-8">
                    <NavLink to="dashboard" className={({ isActive }) => `flex flex-col items-center transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        <Home size={20} strokeWidth={pathname === 'dashboard' ? 2.5 : 2} />
                    </NavLink>

                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center -mt-12 shadow-xl transition-all active:scale-90 ${isOpen ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}
                    >
                        {isOpen ? <X size={26} /> : <LayoutGrid size={26} />}
                    </button>

                    <NavLink to="/profile" className={({ isActive }) => `flex flex-col items-center transition-colors ${isActive ? 'text-slate-900' : 'text-slate-400'}`}>
                        <User size={20} strokeWidth={pathname === '/profile' ? 2.5 : 2} />
                    </NavLink>
                </div>
            </nav>
        </>
    );
}