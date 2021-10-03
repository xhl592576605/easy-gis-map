import { store } from "../store"
import { MutationTypes } from "../store/constants"

export default () => {
  const codeCompile: any = {
    markdown: (code: string) => { }
  }
  const run = (code: string, language: string) => {
    let compileStr = ''
    if (codeCompile[language]) {
      console.info(`${language} 编译中...`)
      compileStr = codeCompile[language](code)
    }
    store.commit(MutationTypes.SET_CODE_INFO, code)
    store.commit(MutationTypes.SET_COMPLIE_CODE, compileStr)
    store.commit(MutationTypes.SET_LANGUAGE, language)
  }
  return {
    run
  }
}