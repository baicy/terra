// Plugins
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import Fonts from 'unplugin-fonts/vite'
import Layouts from 'vite-plugin-vue-layouts'
import Vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import Vuetify, { transformAssetUrls } from 'vite-plugin-vuetify'
import UnoCSS from 'unocss/vite'

// Utilities
import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/terra',
  plugins: [
    VueRouter({
      dts: 'src/typed-router.d.ts'
    }),
    Layouts(),
    AutoImport({
      imports: [
        'vue',
        {
          'vue-router/auto': ['useRoute', 'useRouter']
        }
      ],
      dts: 'src/auto-imports.d.ts',
      eslintrc: {
        enabled: true
      },
      vueTemplate: true
    }),
    Components({
      dts: 'src/components.d.ts'
    }),
    Vue({
      template: { transformAssetUrls }
    }),
    UnoCSS(),
    // https://github.com/vuetifyjs/vuetify-loader/tree/master/packages/vite-plugin#readme
    Vuetify({
      autoImport: true,
      styles: {
        configFile: 'src/styles/settings.scss'
      }
    }),
    Fonts({
      google: {
        families: [
          {
            name: 'Roboto',
            styles: 'wght@100;300;400;500;700;900'
          }
        ]
      }
    })
  ],
  define: { 'process.env': {} },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
    extensions: ['.js', '.json', '.jsx', '.mjs', '.ts', '.tsx', '.vue']
  },
  server: {
    port: 3000,
    proxy: {
      '/mh/': {
        target: 'https://terra-historicus.hypergryph.com/api/comic/',
        changeOrigin: true,
        rewrite: (path) => path.replace(/\/mh/, '')
      }
    }
  },
  css: {
    preprocessorOptions: {
      sass: {
        api: 'modern-compiler'
      }
    }
  }
})
