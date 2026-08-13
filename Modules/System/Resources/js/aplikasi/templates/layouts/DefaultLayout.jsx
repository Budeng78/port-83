import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@Modules/Auth/Resources/js/aplikasi/context/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

import TopNavbar from './navbar/TopNavbar';
import SideNavbar from './navbar/SideNavbar';
import BottomNavbar from './navbar/BottomNavbar';


export default function DefaultLayout() {
    const { user, hasPermission } = useAuth();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 antialiased">
            <TopNavbar user={user} />

            <div className="flex flex-1 overflow-hidden">
                {!isMobile && (
                    <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
                        <SideNavbar 
                            isCollapsed={isCollapsed} 
                            setIsCollapsed={setIsCollapsed}
                            hasPermission={hasPermission} 
                        />
                    </aside>
                )}

                <main className="flex-1 overflow-y-auto bg-slate-50">
                    <div className="p-4 md:p-8 max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={location.pathname}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -5 }}
                                transition={{ duration: 0.15 }}
                            >
                                <Outlet context={{ user, hasPermission }} />
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {isMobile && <BottomNavbar hasPermission={hasPermission} />}

         
            
        </div>
    );
}