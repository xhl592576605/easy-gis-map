import loader from '@monaco-editor/loader'
let monaco: any
let editor: any
export default () => {
  const init = async (el: HTMLDivElement, language: string = 'javascript', code: string = '// code \n') => {
    monaco = await loader.init()
    editor = monaco.editor.create(el, {
      language,
      value: code,
      wordWrap: 'on', // 代码超出换行
      theme: 'vs-dark', // 主题
      fontSize: 18,
      fontFamily: 'MonoLisa, monospace',
    })
    return editor
  }
  const config = () => {
    loader.config({
      'vs/nls': {
        availableLanguages: { '*': 'zh-cn' }
      }
    })
  }
  // 设置model
  const setModel = (code: string, language: string) => {
    const oldModel = editor.getModel()
    if (oldModel) {
      oldModel.dispose();
    }
    const newModel = monaco.editor.createModel(code, language)
    editor.setModel(newModel)
  }

  // 获取model
  const getModel = () => {
    return editor.getModel()
  }

  const setCode = (code: string) => {
    const model = getModel()
    model.setValue(code)
  }
  const getCode = () => {
    const model = getModel()
    return model.getValue()
  }
  // 监听编辑事件
  const onDidChangeModelContent = (callBack: (code: string) => void) => {
    editor.onDidChangeModelContent(() => {
      const code = editor.getValue()
      callBack(code)
    })
  }

  // 监听失焦事件
  const onDidBlurEditorText = (callBack: (code: string) => void) => {
    editor.onDidBlurEditorText(() => {
      const code = editor.getValue()
      callBack(code)
    })
  }

  return {
    init,
    config,
    setModel,
    getModel,
    setCode,
    getCode,
    onDidChangeModelContent,
    onDidBlurEditorText
  }
}