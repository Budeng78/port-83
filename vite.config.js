import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import react from '@vitejs/plugin-react';
import { nodePolyfills } from '@blocksquaredev/vite-plugin-node-polyfills';
import path from 'path';

export default defineConfig({

    plugins: [

        laravel({
            input: [
                'resources/css/app.css',
                'Modules/Platform/Dashboard/Resources/js/app.jsx',
            ],
            refresh: true,
        }),

        react(),

        tailwindcss(),

        /*
        |--------------------------------------------------------------------------
        | Node Polyfills
        |--------------------------------------------------------------------------
        |
        | MQTT.js digunakan di browser melalui WebSocket.
        | mqtt@4.3.7 masih menggunakan beberapa Node core module
        | seperti events, url, stream, dll.
        |
        */

        nodePolyfills({
            include: [
                'buffer',
                'events',
                'process',
                'stream',
                'string_decoder',
                'util',
                'url',
            ],

            globals: {
                Buffer: true,
                global: true,
                process: true,
            },

            protocolImports: true,
        }),

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

    server: {
        host: '0.0.0.0',

        port: 5173,

        hmr: {
            host: '192.168.3.253',
            port: 5173,
        },

        watch: {
            ignored: [
                '**/storage/framework/views/**',
            ],
        },
    },

});