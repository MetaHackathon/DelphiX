import { vitePlugin as remix } from "@remix-run/dev";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

declare module "@remix-run/node" {
  interface Future {
    v3_singleFetch: true;
  }
}

export default defineConfig({
  plugins: [
    remix({
      future: {
        v3_fetcherPersist: true,
        v3_relativeSplatPath: true,
        v3_throwAbortReason: true,
        v3_singleFetch: true,
        v3_lazyRouteDiscovery: true,
      },
    }),
    tsconfigPaths(),
  ],
  optimizeDeps: {
    include: ['pdfjs-dist', 'react-pdf-highlighter-extended'],
    esbuildOptions: {
      target: 'esnext'
    }
  },
  ssr: {
    noExternal: ['@radix-ui/react-scroll-area'],
    external: ['react-pdf-highlighter-extended', 'pdfjs-dist'],
  },
  resolve: {
    alias: {
      'react-pdf-highlighter-extended': 'react-pdf-highlighter-extended/dist/esm/index.js'
    }
  },
  build: {
    target: 'esnext'
  }
});
