import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('access_token');
        window.location.href = '/app/login';
    };

    return (
        <div className="min-h-screen bg-slate-100 flex font-['Instrument_Sans']">
            {/* Sidebar Samping */}
            <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
                <div className="h-16 flex items-center px-6 border-b border-slate-100">
                    <span className="text-xl font-extrabold italic text-blue-600">SWI Dashboard</span>
                </div>
                <nav className="flex-1 p-4 space-y-1">
                    <Link to="" className="block px-4 py-2.5 rounded-xl text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition">
                        Overview
                    </Link>
                    <Link to="users" className="block px-4 py-2.5 rounded-xl text-slate-700 font-semibold hover:bg-blue-50 hover:text-blue-600 transition">
                        Manajemen Pengguna
                    </Link>
                </nav>
                <div className="p-4 border-t border-slate-100">
                    <button 
                        onClick={handleLogout}
                        className="w-full py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition text-sm cursor-pointer"
                    >
                        Keluar Sistem
                    </button>
                </div>
            </aside>

            {/* Area Utama Konten */}
            <div className="flex-1 flex flex-col min-w-0">
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
                    <h2 className="font-bold text-slate-800 text-lg">Panel Utama Sistem</h2>
                    <div className="text-sm font-medium text-slate-500 italic">Node Primary PT SWI</div>
                </header>
                <main className="flex-1 p-6 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}