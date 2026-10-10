/// <reference types="vite/client" />

interface ViteEnv {
  VITE_API_URL?: string;
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  env: ViteEnv;
}
