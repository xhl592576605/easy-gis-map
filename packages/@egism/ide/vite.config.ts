import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteComponents, { AntDesignVueResolver } from 'vite-plugin-components';



// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js' // 定义vue的别名，如果使用其他的插件，可能会用到别名
    }
  },
  plugins: [vue({
    template: {
      compilerOptions: {
        comments: true
      }
    }
  }), vueJsx(), ViteComponents({
    customComponentResolvers: [AntDesignVueResolver({
      importStyle: 'css',
      importCss: true
    })],
  })]
})
