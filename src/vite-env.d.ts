/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  readonly VITE_GIT_SHA: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
