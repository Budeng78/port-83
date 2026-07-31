import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

/**
 * Fungsi untuk memindai entry point secara dinamis di dalam folder Modules
 */
function getModuleInputs() {
    const inputs = ['resources/css/app.css', 'resources/js/app.js'];
    const modulesPath = path.resolve(__dirname, 'Modules');

    if (fs.existsSync(modulesPath)) {
        const modules = fs.readdirSync(modulesPath);
        
        modules.forEach(moduleName => {
            if (moduleName === '.' || moduleName === '..') return;

            const modulePath = path.join(modulesPath, moduleName);
            if (!fs.statSync(modulePath).isDirectory()) return;

            // 1. Cek keberadaan entry point JavaScript/React
            const moduleAppPath = path.join(modulePath, 'Resources/js/app.jsx');
            if (fs.existsSync(moduleAppPath)) {
                inputs.push(`Modules/${moduleName}/Resources/js/app.jsx`);
            }

            // 2. Cek keberadaan file CSS khusus modul (jika ada)
            const moduleCssPath = path.join(modulePath, 'Resources/css/app.css');
            if (fs.existsSync(moduleCssPath)) {
                inputs.push(`Modules/${moduleName}/Resources/css/app.css`);
            }
        });
    }

    return inputs;
}

export default defineConfig({
    plugins: [
        laravel({
            input: getModuleInputs(),
            refresh: true,
            fonts: [
                bunny('Instrument Sans', {
                    weights: [400, 500, 600],
                }),
            ],
        }),
        tailwindcss(),
    ],
    resolve: {
        alias: {
            '@modules': path.resolve(import.meta.dirname, 'Modules'),
            '@': path.resolve(import.meta.dirname, 'resources/js'),
        },
    },
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});