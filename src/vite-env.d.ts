/// <reference types="vite/client" />

declare const __BUILD_TIME__: string;

interface ImportMetaEnv {
  readonly VITE_GIT_SHA: string;
  readonly VITE_IMAGE_REF: string;
  readonly VITE_NPM_REGISTRY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
