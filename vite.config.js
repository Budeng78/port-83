import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

/*
|--------------------------------------------------------------------------
| Dynamic Module Inputs
|--------------------------------------------------------------------------
|
| Mendeteksi entry point JS dan CSS dari setiap module.
|
| Convention:
|
| Modules/{Module}/Resources/js/app.jsx
| Modules/{Module}/Resources/css/app.css
|
*/

function getModuleInputs() {

    const inputs = [
        'resources/css/app.css',
        'resources/js/app.js',
    ];

    const modulesPath = path.resolve(
        import.meta.dirname,
        'Modules'
    );

    /*
    |--------------------------------------------------------------------------
    | Jika folder Modules tidak ada
    |--------------------------------------------------------------------------
    */

    if (!fs.existsSync(modulesPath)) {
        return inputs;
    }

    const modules = fs.readdirSync(modulesPath);

    modules.forEach((moduleName) => {

        const modulePath = path.join(
            modulesPath,
            moduleName
        );

        /*
        |--------------------------------------------------------------------------
        | Pastikan benar-benar directory
        |--------------------------------------------------------------------------
        */

        if (!fs.statSync(modulePath).isDirectory()) {
            return;
        }

        /*
        |--------------------------------------------------------------------------
        | Module React Entry
        |--------------------------------------------------------------------------
        |
        | Contoh:
        |
        | Modules/System/Resources/js/app.jsx
        | Modules/Auth/Resources/js/app.jsx
        |
        */

        const moduleJsPath = path.join(
            modulePath,
            'Resources/js/app.jsx'
        );

        if (fs.existsSync(moduleJsPath)) {

            inputs.push(
                `Modules/${moduleName}/Resources/js/app.jsx`
            );

        }

        /*
        |--------------------------------------------------------------------------
        | Module CSS Entry
        |--------------------------------------------------------------------------
        |
        | Contoh:
        |
        | Modules/System/Resources/css/app.css
        | Modules/Dashboard/Resources/css/app.css
        |
        */

        const moduleCssPath = path.join(
            modulePath,
            'Resources/css/app.css'
        );

        if (fs.existsSync(moduleCssPath)) {

            inputs.push(
                `Modules/${moduleName}/Resources/css/app.css`
            );

        }

    });

    return inputs;
}


/*
|--------------------------------------------------------------------------
| Vite Configuration
|--------------------------------------------------------------------------
*/

export default defineConfig({

    plugins: [

        /*
        |--------------------------------------------------------------------------
        | Laravel Vite
        |--------------------------------------------------------------------------
        */

        laravel({
            input: getModuleInputs(),
            refresh: true,
        }),

        /*
        |--------------------------------------------------------------------------
        | Tailwind CSS v4
        |--------------------------------------------------------------------------
        */

        tailwindcss(),

        /*
        |--------------------------------------------------------------------------
        | VitePWA
        |--------------------------------------------------------------------------
        */



        VitePWA({
            registerType: 'autoUpdate',

            manifest: {
                name: 'Prototype',
                short_name: 'Prototype',
                description: 'Aplikasi Prototype',
                theme_color: '#0f172a',
                background_color: '#f8fafc',
                display: 'standalone',
                start_url: '/',
                scope: '/',
                icons: [
                    {
                        src: '/icons/pwa-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: '/icons/pwa-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },

            workbox: {
                cleanupOutdatedCaches: true,
            },
        }),

    ],


    /*
    |--------------------------------------------------------------------------
    | Path Alias
    |--------------------------------------------------------------------------
    */

    resolve: {

        alias: {

            '@Modules': path.resolve(
                import.meta.dirname,
                'Modules'
            ),

            '@': path.resolve(
                import.meta.dirname,
                'resources/js'
            ),

        },

    },


    /*
    |--------------------------------------------------------------------------
    | Development Server
    |--------------------------------------------------------------------------
    */

    server: {

        watch: {

            ignored: [
                '**/storage/framework/views/**',
            ],

        },

        /*
        |--------------------------------------------------------------------------
        | Development dari komputer lain
        |--------------------------------------------------------------------------
        |
        | Aktifkan jika diperlukan:
        |
        | host: '0.0.0.0',
        | port: 5173,
        |
        */

        // host: '0.0.0.0',
        // port: 5173,

    },

});