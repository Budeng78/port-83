import React from 'react';
import { Outlet } from 'react-router-dom';

import TopNavbar from '../templates/navbar/TopNavbar';
import SideNavbar from '../templates/navbar/SideNavbar';

export default function DefaultLayout() {

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-slate-50 antialiased">

            {/* =====================================================
                TOP NAVBAR
            ===================================================== */}

            <TopNavbar />

            {/* =====================================================
                BODY
            ===================================================== */}

            <div className="flex flex-1 min-h-0 overflow-hidden">

                {/* =================================================
                    SIDEBAR
                ================================================= */}

                <SideNavbar />

                {/* =================================================
                    MAIN CONTENT
                ================================================= */}

                <main className="flex-1 min-w-0 overflow-y-auto bg-slate-50">

                    <div className="min-h-full">

                        <Outlet />

                    </div>

                </main>

            </div>

        </div>
    );
}