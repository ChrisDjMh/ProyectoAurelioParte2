/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  // Agrega aquí otras variables si tienes más en tu archivo .env
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}