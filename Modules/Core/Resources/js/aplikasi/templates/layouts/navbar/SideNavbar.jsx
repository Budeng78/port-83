import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronDown} from 'lucide-react';
import api from '@modules/Auth/Resources/js/aplikasi/axios/axios.js'; // <-- PERBAIKAN 1: Gunakan instance kustom 'api', bukan 'axios' mentah
import { useAuth } from '@modules/Auth/Resources/js/aplikasi/context/AuthContext';
import { DynamicIcon } from '../DynamicIcon';

/**
 * Komponen Rekursif untuk menangani level menu (Anak, Cucu, dst)
 */
const SidebarItem = ({ item, pathname, toggleSubMenu, openMenus, isCollapsed }) => {
    const hasChildren = item.children && item.children.length > 0;
    const isOpen = openMenus[item.label];
    
    // Cek status aktif untuk highlight
    const isActive = pathname === item.path;
    const isChildActive = item.children?.some(child => 
        child.path === pathname || (child.children && child.children.some(c => c.path === pathname))
    );

    return (
        <div className="relative">
            <NavLink 
                to={hasChildren ? '#' : item.path} 
                onClick={(e) => hasChildren && (e.preventDefault(), toggleSubMenu(item.label))}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl transition-all 
                    ${(isActive || isChildActive) ? 'bg-slate-50 text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}
            >
                <div className="flex items-center gap-3">
                    {/* Render Icon Dinamis dari Controller */}
                    {item.icon && <DynamicIcon name={item.icon} size={18} strokeWidth={(isActive || isChildActive) ? 2.5 : 2} />}
                    {!isCollapsed && (
                        <span className={`text-[13px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                            {item.label}
                        </span>
                    )}
                </div>
                {hasChildren && !isCollapsed && (
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
                )}
            </NavLink>

            <AnimatePresence>
                {hasChildren && isOpen && !isCollapsed && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden ml-4 mt-1 border-l border-slate-100"
                    >
                        {item.children.map((child, idx) => (
                            <SidebarItem 
                                key={idx} 
                                item={child} 
                                pathname={pathname} 
                                toggleSubMenu={toggleSubMenu}
                                openMenus={openMenus}
                                isCollapsed={isCollapsed}
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function SideNavbar({ isCollapsed, setIsCollapsed }) {
    const { pathname } = useLocation();
    const { token } = useAuth(); // Token autentikasi
    const [menus, setMenus] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openMenus, setOpenMenus] = useState({});

    // Ambil data menu dari Laravel Controller via API menggunakan instance 'api'
    useEffect(() => {
        api.get('/core/menus') // <-- PERBAIKAN 2: Gunakan api.get, interceptor akan otomatis menyisipkan Bearer token
        .then(response => {
            setMenus(response.data.data || []);
            setLoading(false);
        })
        .catch(error => {
            console.error("Gagal memuat menu:", error);
            setLoading(false);
        });
    }, [token]);

    // Auto-expand menu jika sedang aktif
    useEffect(() => {
        const newOpenMenus = {};
        menus.forEach(item => {
            const checkActive = (i) => {
                if (i.path === pathname) return true;
                if (i.children) return i.children.some(checkActive);
                return false;
            };
            if (checkActive(item)) {
                newOpenMenus[item.label] = true;
            }
        });
        setOpenMenus(prev => ({ ...prev, ...newOpenMenus }));
    }, [pathname, menus]);

    const toggleSubMenu = (label) => {
        if (isCollapsed) {
            setIsCollapsed(false);
            setOpenMenus({ [label]: true });
            return;
        }
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    if (loading) {
        return <div className="p-6 text-slate-400 text-xs">Memuat menu...</div>;
    }

    return (
        <div className="flex flex-col h-full py-6 relative select-none bg-white">
            <button 
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-white border border-slate-100 rounded-full p-1.5 shadow-sm hover:bg-slate-900 hover:text-white transition-all z-[40]"
            >
                {isCollapsed ? <ChevronRight size={10} strokeWidth={3} /> : <ChevronLeft size={10} strokeWidth={3} />}
            </button>

            <div className="flex-1 px-4 space-y-8 overflow-y-auto custom-scrollbar">
                <div className="space-y-2">
                    
                </div>

                <div className="space-y-1">
                    {menus.map((item, idx) => (
                        <SidebarItem 
                            key={idx} 
                            item={item} 
                            pathname={pathname} 
                            toggleSubMenu={toggleSubMenu}
                            openMenus={openMenus}
                            isCollapsed={isCollapsed}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}