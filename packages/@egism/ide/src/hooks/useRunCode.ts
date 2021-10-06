import { store } from "../store"
import { MutationTypes } from "../store/constants"
import useSfcCompiler from "./useSfcCompiler"

export default () => {
  const codeCompile: any = {
    markdown: async (code: string) => {
      return ['document.getElementById("content").innerHTML =marked(' + '`' + code + '`);']
    },
    vue: async (code: string, name: string) => {
      const { compileFile } = useSfcCompiler()
      debugger
      const complied = await compileFile(code, name)
    }
  }
  const run = async (code: string, language: string, name: string) => {
    let compileStr = ''
    if (codeCompile[language]) {
      console.info(`${language} 编译中...`)
      compileStr = await codeCompile[language](code, name)
      console.info(`${language} 编译成功...`)
    }
    new Promise((resolve) => {
      if (store.state.language !== language) {
        // 更换语言 会重置预览的iframe的srcdoc 更换需要一定时间
        store.commit(MutationTypes.SET_LANGUAGE, language)
        setTimeout(() => {
          resolve(true)
        }, 1000)
      } else {
        resolve(true)
      }
    }).then(() => {
      store.commit(MutationTypes.SET_COMPLIE_CODE, compileStr)
      store.commit(MutationTypes.SET_CODE_INFO, code)
    })

  }
  return {
    run
  }
}