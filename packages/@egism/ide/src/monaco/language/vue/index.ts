import config from "./config"
import language from "./language"

const vue = {
  id: 'vue',
  extensions: ['.vue'],
  aliases: ['Vue', 'vuejs']
}
export default (monaco: any) => {
  monaco.languages.register(vue)
  monaco.languages.setMonarchTokensProvider(vue.id, language)
  monaco.languages.registerCompletionItemProvider(vue.id, {
    provideCompletionItems: () => {
      return { suggestions: { html5: true, angular1: true, ionic: true, javascript: true } }
    }
  })
  monaco.languages.setLanguageConfiguration(vue.id, config)
}

export {
  vue,
  config,
  language
}