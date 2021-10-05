import { store } from "../store"
import { MutationTypes } from "../store/constants"

export default () => {
  const codeCompile: any = {
    markdown: (code: string) => {
      return ['document.getElementById("content").innerHTML =marked(' + '`' + code + '`);']
    }
  }
  const run = (code: string, language: string) => {
    let compileStr = ''
    if (codeCompile[language]) {
      console.info(`${language} 编译中...`)
      compileStr = codeCompile[language](code)
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