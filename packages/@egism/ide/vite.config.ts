import fs from 'fs'
import path from 'path'
import { defineConfig, Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import ViteComponents, { AntDesignVueResolver } from 'vite-plugin-components'

export default defineConfig({
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
    })]
  })],
  resolve: {
    alias: {
      'vue': 'vue/dist/vue.esm-bundler.js',// 定义vue的别名，如果使用其他的插件，可能会用到别名*
      '@vue/compiler-sfc': '@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js'
    }
  },
  optimizeDeps: {
    exclude: ['consolidate']
  }
})

function copyVuePlugin(): Plugin {
  return {
    name: 'copy-vue',
    generateBundle() {
      const filePath = path.resolve(
        __dirname,
        '../vue/dist/vue.runtime.esm-browser.js'
      )
      if (!fs.existsSync(filePath)) {
        throw new Error(
          `vue.runtime.esm-browser.js not built. ` +
          `Run "yarn build vue -f esm-browser" first.`
        )
      }
      this.emitFile({
        type: 'asset',
        fileName: 'vue.runtime.esm-browser.js',
        source: fs.readFileSync(filePath, 'utf-8')
      })
    }
  }
}
