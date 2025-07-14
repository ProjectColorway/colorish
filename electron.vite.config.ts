
import { resolve } from 'path';
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite';
import react from '@vitejs/plugin-react';
// @ts-ignore
import tailwindcss from '@tailwindcss/vite';
import PluginObject from 'babel-plugin-react-compiler';

// @ts-ignore
export default defineConfig(({ command, mode }) => {
    // @ts-ignore
    const env = loadEnv(mode);
    return {
        main: {
            resolve: {
                alias: {
                    '@main': resolve('src/main')
                }
            },
            plugins: [externalizeDepsPlugin()]
        },
        preload: {
            plugins: [externalizeDepsPlugin()]
        },
        renderer: {
            resolve: {
                alias: {
                    '@renderer': resolve('src/renderer/src'),
                    '@components': resolve('src/renderer/src/components'),
                    '@api': resolve('src/renderer/src/api')
                }
            },
            plugins: [[PluginObject], react(), tailwindcss()]
        }
    };
});
