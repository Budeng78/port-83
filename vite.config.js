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
            const jsDir = path.join(modulesPath, moduleName, 'Resources/assets/js');
            
            if (fs.existsSync(jsDir)) {
                const files = fs.readdirSync(jsDir);
                
                files.forEach(file => {
                    if (/\.(js|jsx|ts|tsx)$/.test(file)) {
                        inputs.push(`Modules/${moduleName}/Resources/assets/js/${file}`);
                    }
                });
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
    server: {
        watch: {
            ignored: ['**/storage/framework/views/**'],
        },
    },
});