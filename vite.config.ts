import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  server: {
    host: '127.0.0.1',
  },
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'pinia'],
      resolvers: [ElementPlusResolver()],
      dts: 'src/auto-imports.d.ts',
    }),
    Components({
      resolvers: [ElementPlusResolver()],
      dts: 'src/components.d.ts',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-vue': ['vue', 'pinia', '@vueuse/core'],
          'vendor-fabric': ['fabric'],
          'vendor-ui': ['element-plus'],
          'vendor-utils': ['file-saver', 'tinycolor2', 'uuid', 'mitt', 'hotkeys-js', 'sortablejs'],
        },
      },
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: (source: string, filename: string) => {
          // Don't inject into variables.scss itself or files that already import variables
          if (filename.includes('variables.scss') || filename.includes('reset.scss') || filename.includes('global.scss') || filename.includes('theme.scss')) {
            return source
          }
          return `@use "@/styles/variables" as *;\n${source}`
        },
      },
    },
  },
})
