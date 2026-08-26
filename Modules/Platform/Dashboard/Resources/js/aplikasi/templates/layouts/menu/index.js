// Modules/System/Resources/js/aplikasi/templates/layouts/menu/index.js

/*
|--------------------------------------------------------------------------
| MENU MASTER
|--------------------------------------------------------------------------
|
| File menu_*.js berfungsi sebagai MASTER DEFINISI MENU aplikasi.
|
| Contoh:
|
| menu_dashboard.js
| menu_system.js
| menu_administration.js
| menu_produksi.js
|
| File-file tersebut TIDAK menentukan apakah menu boleh tampil
| kepada user tertentu.
|
| Hak tampil user ditentukan oleh userMenus dari backend.
|
*/


/*
|--------------------------------------------------------------------------
| LOAD ALL MENU MODULES
|--------------------------------------------------------------------------
*/

const menuModules = import.meta.glob(
    './menu_*.js',
    {
        eager: true,
    }
);


/*
|--------------------------------------------------------------------------
| GET ALL MASTER MENUS
|--------------------------------------------------------------------------
|
| Menggabungkan seluruh menu dari:
|
| menu_*.js
|
| kemudian menghilangkan duplikasi berdasarkan path.
|
*/

export const getAllMenus = () => {

    let combinedMenus = [];


    Object.values(menuModules).forEach(
        (module) => {

            if (
                module?.default &&
                Array.isArray(module.default)
            ) {

                combinedMenus = [
                    ...combinedMenus,
                    ...module.default,
                ];

            }

        }
    );


    /*
    |--------------------------------------------------------------------------
    | REMOVE DUPLICATE
    |--------------------------------------------------------------------------
    */

    const uniqueMenus = Array.from(

        new Map(

            combinedMenus

                .filter(
                    menu => menu?.path
                )

                .map(
                    menu => [
                        menu.path,
                        menu,
                    ]
                )

        ).values()

    );


    /*
    |--------------------------------------------------------------------------
    | SORT
    |--------------------------------------------------------------------------
    |
    | Jika menu memiliki order, gunakan order.
    |
    */

    uniqueMenus.sort(
        (a, b) => {

            const orderA =
                Number(a?.order ?? 0);

            const orderB =
                Number(b?.order ?? 0);

            return orderA - orderB;

        }
    );


    return uniqueMenus;
};


/*
|--------------------------------------------------------------------------
| GET MENU BY PATH
|--------------------------------------------------------------------------
|
| Digunakan untuk mencocokkan menu dari backend
| dengan definisi menu frontend.
|
*/

export const getMenuByPath = (
    path
) => {

    const menus =
        getAllMenus();


    return menus.find(
        menu =>
            menu?.path === path
    ) ?? null;
};


/*
|--------------------------------------------------------------------------
| GET MENUS BY PATH
|--------------------------------------------------------------------------
|
| Menerima daftar path yang diberikan backend.
|
| Contoh:
|
| [
|     '/dashboard',
|     '/users',
|     '/assignments'
| ]
|
*/

export const getMenusByPaths = (
    paths = []
) => {

    if (
        !Array.isArray(paths)
    ) {
        return [];
    }


    const pathSet =
        new Set(paths);


    return getAllMenus().filter(
        menu =>
            pathSet.has(
                menu?.path
            )
    );
};


/*
|--------------------------------------------------------------------------
| GET USER MENUS
|--------------------------------------------------------------------------
|
| INI YANG AKAN DIGUNAKAN OLEH TEMPLATE.
|
| Backend memberikan userMenus.
|
| Contoh:
|
| userMenus = [
|     {
|         id: "...",
|         path: "/dashboard",
|         label: "Dashboard"
|     },
|     {
|         id: "...",
|         path: "/users",
|         label: "Users"
|     }
| ]
|
| Kita gunakan backend sebagai sumber keputusan akses.
|
| File menu_*.js tetap menjadi sumber metadata/UI frontend.
|
*/

export const getUserMenus = (
    userMenus = []
) => {

    if (
        !Array.isArray(userMenus)
    ) {
        return [];
    }


    const masterMenus =
        getAllMenus();


    /*
    |--------------------------------------------------------------------------
    | INDEX MASTER MENU
    |--------------------------------------------------------------------------
    */

    const masterByPath =
        new Map(
            masterMenus
                .filter(
                    menu => menu?.path
                )
                .map(
                    menu => [
                        menu.path,
                        menu,
                    ]
                )
        );


    /*
    |--------------------------------------------------------------------------
    | MERGE BACKEND + FRONTEND
    |--------------------------------------------------------------------------
    |
    | Backend menentukan menu mana yang boleh tampil.
    |
    | Frontend menyediakan:
    |
    | - component/icon
    | - children
    | - metadata
    | - konfigurasi UI
    |
    */

    const result =
        userMenus
            .filter(
                menu =>
                    menu &&
                    menu.path
            )
            .map(
                backendMenu => {

                    const frontendMenu =
                        masterByPath.get(
                            backendMenu.path
                        );


                    /*
                    |--------------------------------------------------------------------------
                    | BACKEND SEBAGAI SUMBER AKSES
                    |--------------------------------------------------------------------------
                    */

                    if (
                        !frontendMenu
                    ) {

                        /*
                        | Jika menu ada di database
                        | tetapi belum ada di frontend,
                        | kita tetap boleh mengembalikannya.
                        |
                        | Ini berguna ketika menu baru
                        | ditambahkan dari backend.
                        */

                        return {
                            ...backendMenu,
                        };

                    }


                    /*
                    |--------------------------------------------------------------------------
                    | MERGE
                    |--------------------------------------------------------------------------
                    |
                    | Backend didahulukan untuk field akses.
                    | Frontend melengkapi metadata UI.
                    |
                    */

                    return {
                        ...frontendMenu,
                        ...backendMenu,
                    };

                }
            );


    /*
    |--------------------------------------------------------------------------
    | SORT
    |--------------------------------------------------------------------------
    */

    result.sort(
        (a, b) => {

            const orderA =
                Number(a?.order ?? 0);

            const orderB =
                Number(b?.order ?? 0);

            return orderA - orderB;

        }
    );


    return result;
};


/*
|--------------------------------------------------------------------------
| LEGACY COMPATIBILITY
|--------------------------------------------------------------------------
|
| Untuk sementara kalau ada component lama yang masih memanggil:
|
| getDynamicMenus(user, hasPermission)
|
| kita tidak langsung menghapus function tersebut.
|
| Tetapi jangan lagi digunakan sebagai sumber menu utama.
|
| Function ini hanya mengambil menu master.
|
*/

export const getDynamicMenus = (
    user,
    hasPermissionFn
) => {

    /*
    |--------------------------------------------------------------------------
    | DEPRECATED
    |--------------------------------------------------------------------------
    |
    | Jangan gunakan hasPermission untuk menentukan
    | menu navigasi baru.
    |
    | Gunakan:
    |
    | getUserMenus(userMenus)
    |
    */

    console.warn(
        'getDynamicMenus() sudah deprecated. ' +
        'Gunakan getUserMenus(userMenus).'
    );


    /*
    |--------------------------------------------------------------------------
    | FALLBACK
    |--------------------------------------------------------------------------
    |
    | Untuk sementara kita tetap dukung behavior lama
    | agar component yang belum dimigrasikan tidak langsung rusak.
    |
    */

    const rawMenus =
        getAllMenus();


    if (
        user?.roles?.includes(
            'Super Admin'
        )
        ||
        user?.is_super_admin
    ) {

        return rawMenus;

    }


    return rawMenus.filter(
        menu => {

            if (
                !menu?.permission
            ) {

                return true;

            }


            return hasPermissionFn
                ? hasPermissionFn(
                    menu.permission
                )
                : false;

        }
    );
};