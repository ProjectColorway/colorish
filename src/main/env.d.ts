/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly MAIN_VITE_AUTH_DISCORD_ID: string;
    readonly MAIN_VITE_AUTH_DISCORD_SECRET: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
