// resources\js\aplikasi\components\modal\DevModal.jsx

import React, { useState, useEffect } from "react";

export default function DevModal() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Menangkap event 'open-dev-modal' yang dipicu dari navbar
    const handleOpen = () => setIsOpen(true);
    window.addEventListener('open-dev-modal', handleOpen);
    
    return () => window.removeEventListener('open-dev-modal', handleOpen);
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-[9999]">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full animate-in fade-in zoom-in duration-200">
        <h2 className="text-lg font-bold text-blue-600">🚧 Dalam Pengembangan</h2>
        <p className="mt-2 text-gray-600">
          Halaman ini belum tersedia. Fitur sedang disiapkan oleh tim.
        </p>
        <button
          onClick={() => setIsOpen(false)} // Hanya menutup modal, tidak navigasi
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 w-full"
        >
          Mengerti
        </button>
      </div>
    </div>
  );
}