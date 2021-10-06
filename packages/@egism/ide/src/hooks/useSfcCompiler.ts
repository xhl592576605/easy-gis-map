import * as defaultCompiler from '@vue/compiler-sfc'
import { BindingMetadata, SFCDescriptor } from "@vue/compiler-sfc"
import { useStore } from 'vuex'
import { MutationTypes } from '../store/constants'

export default () => {
  const store = useStore()
  const MAIN_FILE = 'App.vue'
  const COMP_IDENTIFIER = `__sfc__`
  /**
    * The default SFC compiler we are using is built from each commit
    * but we may swap it out with a version fetched from CDNs
    */
  let SFCCompiler: typeof defaultCompiler = defaultCompiler

  const compileFile = async (code: string, filename: string) => {
    if (!code.trim() || !filename.endsWith('.vue')) {
      store.commit(MutationTypes.SET_ERRORS, [])
      return
    }
    let compiled = {
      js: '',
      ssr: '',
      css: ''
    }
    const id = await hashId(filename)

    const { errors, descriptor } = SFCCompiler.parse(code, {
      filename,
      sourceMap: true
    })

    if (errors.length) {
      store.commit(MutationTypes.SET_ERRORS, errors)
      return
    }

    if (
      descriptor.styles.some(s => s.lang) ||
      (descriptor.template && descriptor.template.lang)
    ) {
      store.commit(MutationTypes.SET_ERRORS, [
        `lang="x" pre-processors for <template> or <style> are currently not ` +
        `supported.`
      ])
      return
    }

    const scriptLang =
      (descriptor.script && descriptor.script.lang) ||
      (descriptor.scriptSetup && descriptor.scriptSetup.lang)
    if (scriptLang && scriptLang !== 'ts') {
      store.commit(MutationTypes.SET_ERRORS, [`Only lang="ts" is supported for <script> blocks.`])
      return
    }

    const hasScoped = descriptor.styles.some(s => s.scoped)
    let clientCode = ''
    let ssrCode = ''

    const appendSharedCode = (code: string) => {
      clientCode += code
      ssrCode += code
    }

    const clientScriptResult = await doCompileScript(descriptor, id, false)
    if (!clientScriptResult) {
      return
    }

    const [clientScript, bindings] = clientScriptResult
    clientCode += clientScript


    // script ssr only needs to be performed if using <script setup> where
    // the render fn is inlined.
    if (descriptor.scriptSetup) {
      const ssrScriptResult = await doCompileScript(descriptor, id, true)
      if (ssrScriptResult) {
        ssrCode += ssrScriptResult[0]
      } else {
        ssrCode = `/* SSR compile error: ${store.state.errors[0]} */`
      }
    } else {
      // when no <script setup> is used, the script result will be identical.
      ssrCode += clientScript
    }


    // template
    // only need dedicated compilation if not using <script setup>
    if (descriptor.template && !descriptor.scriptSetup) {
      const clientTemplateResult = doCompileTemplate(
        descriptor,
        id,
        bindings,
        false
      )
      if (!clientTemplateResult) {
        return
      }
      clientCode += clientTemplateResult

      const ssrTemplateResult = doCompileTemplate(descriptor, id, bindings, true)
      if (ssrTemplateResult) {
        // ssr compile failure is fine
        ssrCode += ssrTemplateResult
      } else {
        ssrCode = `/* SSR compile error: ${store.state.errors[0]} */`
      }
    }

    if (hasScoped) {
      appendSharedCode(
        `\n${COMP_IDENTIFIER}.__scopeId = ${JSON.stringify(`data-v-${id}`)}`
      )
    }

    if (clientCode || ssrCode) {
      appendSharedCode(
        `\n${COMP_IDENTIFIER}.__file = ${JSON.stringify(filename)}` +
        `\nexport default ${COMP_IDENTIFIER}`
      )
      compiled.js = clientCode.trimStart()
      compiled.ssr = ssrCode.trimStart()
    }

    // styles
    let css = ''
    for (const style of descriptor.styles) {
      if (style.module) {
        store.commit(MutationTypes.SET_ERRORS, [`<style module> is not supported in the playground.`])
        return
      }

      const styleResult = await SFCCompiler.compileStyleAsync({
        source: style.content,
        filename,
        id,
        scoped: style.scoped,
        modules: !!style.module
      })
      if (styleResult.errors.length) {
        // postcss uses pathToFileURL which isn't polyfilled in the browser
        // ignore these errors for now
        if (!styleResult.errors[0].message.includes('pathToFileURL')) {
          store.commit(MutationTypes.SET_ERRORS, styleResult.errors)
        }
        // proceed even if css compile errors
      } else {
        css += styleResult.code + '\n'
      }
    }
    if (css) {
      compiled.css = css.trim()
    } else {
      compiled.css = '/* No <style> tags present */'
    }
    // clear errors
    store.commit(MutationTypes.SET_ERRORS, [])
    return compiled
  }

  const doCompileScript = async (
    descriptor: SFCDescriptor,
    id: string,
    ssr: boolean = false): Promise<[string, BindingMetadata | undefined] | undefined> => {
    if (descriptor.script || descriptor.scriptSetup) {
      try {
        const compiledScript = SFCCompiler.compileScript(descriptor, {
          id,
          refSugar: true,
          inlineTemplate: true,
          templateOptions: {
            ssr,
            ssrCssVars: descriptor.cssVars
          }
        })
        let code = ''
        if (compiledScript.bindings) {
          code += `\n/* Analyzed bindings: ${JSON.stringify(
            compiledScript.bindings,
            null,
            2
          )} */`
        }
        code +=
          `\n` +
          SFCCompiler.rewriteDefault(compiledScript.content, COMP_IDENTIFIER)

        if ((descriptor.script || descriptor.scriptSetup)!.lang === 'ts') {
          code = (await import('sucrase')).transform(code, {
            transforms: ['typescript']
          }).code
        }

        return [code, compiledScript.bindings]
      } catch (e: any) {
        store.commit(MutationTypes.SET_ERRORS, [e.stack.split('\n').slice(0, 12).join('\n')])
        return
      }
    } else {
      return [`\nconst ${COMP_IDENTIFIER} = {}`, undefined]
    }
  }

  const doCompileTemplate = (
    descriptor: SFCDescriptor,
    id: string,
    bindingMetadata: BindingMetadata | undefined,
    ssr: boolean = false) => {
    const templateResult = SFCCompiler.compileTemplate({
      source: descriptor.template!.content,
      filename: descriptor.filename,
      id,
      scoped: descriptor.styles.some(s => s.scoped),
      slotted: descriptor.slotted,
      ssr,
      ssrCssVars: descriptor.cssVars,
      isProd: false,
      compilerOptions: {
        bindingMetadata
      }
    })
    if (templateResult.errors.length) {
      store.commit(MutationTypes.SET_ERRORS, templateResult.errors)
      // store.errors = templateResult.errors
      return
    }

    const fnName = ssr ? `ssrRender` : `render`

    return (
      `\n${templateResult.code.replace(
        /\nexport (function|const) (render|ssrRender)/,
        `$1 ${fnName}`
      )}` + `\n${COMP_IDENTIFIER}.${fnName} = ${fnName}`
    )
  }

  const hashId = async (filename: string) => {
    const msgUint8 = new TextEncoder().encode(filename) // encode as (utf-8) Uint8Array
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8) // hash the message
    const hashArray = Array.from(new Uint8Array(hashBuffer)) // convert buffer to byte array
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('') // convert bytes to hex string
    return hashHex.slice(0, 8)
  }

  return {
    MAIN_FILE,
    COMP_IDENTIFIER,
    compileFile
  }
}