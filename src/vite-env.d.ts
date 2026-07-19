/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** '1' | 'true' → приложение стартует в ДЕМО-режиме */
  readonly VITE_DEMO_MODE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
