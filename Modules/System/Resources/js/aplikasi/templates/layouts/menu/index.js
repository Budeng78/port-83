// Modules/System/Resources/js/aplikasi/templates/layouts/menu/index.js

// 1. Secara otomatis memuat semua file yang berawalan 'menu_' di folder ini
const menuModules = import.meta.glob('./menu_*.js', { eager: true });

/**
 * Mengambil dan menggabungkan seluruh menu dari semua file modul secara otomatis
 */
export const getAllMenus = () => {
    let combinedMenus = [];

    // Loop semua file menu yang ditemukan oleh Vite
    Object.values(menuModules).forEach((module) => {
        if (module.default && Array.isArray(module.default)) {
            combinedMenus = [...combinedMenus, ...module.default];
        }
    });

    // Menghapus duplikasi menu berdasarkan 'path' (jika ada menu yang sama di beberapa file)
    const uniqueMenus = Array.from(
        new Map(combinedMenus.map(item => [item.path, item])).values()
    );

    return uniqueMenus;
};

/**
 * Mendapatkan menu yang sudah difilter berdasarkan hak akses (permission) user
 * @param {Object} user - Objek user yang sedang login
 * @param {Function} hasPermissionFn - Fungsi pengecekan permission dari AuthContext
 */
export const getDynamicMenus = (user, hasPermissionFn) => {
    const rawMenus = getAllMenus();

    // Jika Super Admin, langsung berikan semua menu
    if (user?.roles?.includes('Super Admin') || user?.is_super_admin) {
        return rawMenus;
    }

    // Filter menu berdasarkan permission yang dimiliki user
    return rawMenus.filter(menu => {
        if (!menu.permission) return true; // Jika menu tidak butuh permission khusus, tampilkan
        
        // Pengecekan menggunakan fungsi hasPermission dari AuthContext
        return hasPermissionFn ? hasPermissionFn(menu.permission) : false;
    });
};