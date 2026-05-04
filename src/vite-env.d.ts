/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  readonly VITE_GIT_SHA: string;
  readonly VITE_IMAGE_REF: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
