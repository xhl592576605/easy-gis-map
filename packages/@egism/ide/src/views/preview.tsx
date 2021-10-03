import { defineComponent, onMounted, onUnmounted, ref, watchEffect, WatchStopHandle } from 'vue'
import message from '../components/message'
import { PreviewProxy, srcdoc } from '../preview'
import './style/preview.scss'
export default defineComponent({
  name: 'preview',
  components: { message },
  setup: () => {
    const container = ref()
    const runtimeError = ref()
    const runtimeWarning = ref()

    let sandbox: HTMLIFrameElement
    let proxy: PreviewProxy
    let stopUpdateWatcher: WatchStopHandle

    // 创建容器
    const createSandbox = () => {
      if (sandbox) {
        // clear prev sandbox
        proxy.destroy()
        stopUpdateWatcher()
        container.value.removeChild(sandbox)
      }

      sandbox = document.createElement('iframe')
      sandbox.setAttribute(
        'sandbox',
        [
          'allow-forms',
          'allow-modals',
          'allow-pointer-lock',
          'allow-popups',
          'allow-same-origin',
          'allow-scripts',
          'allow-top-navigation-by-user-activation'
        ].join(' ')
      )

      let importMap: Record<string, any>
      try {
        importMap = JSON.parse(`{}`)
      } catch (e: any) {
        return
      }

      if (!importMap.imports) {
        importMap.imports = {}
      }
      const sandboxSrc = srcdoc.default.replace(
        /<!--IMPORT_MAP-->/,
        JSON.stringify(importMap)
      )
      sandbox.srcdoc = sandboxSrc
      container.value.appendChild(sandbox)

      proxy = new PreviewProxy(sandbox, {
        on_fetch_progress: (progress: any) => {
          // pending_imports = progress;
        },
        on_error: (event: any) => {
          const msg =
            event.value instanceof Error ? event.value.message : event.value
          if (
            msg.includes('Failed to resolve module specifier') ||
            msg.includes('Error resolving module specifier')
          ) {
            runtimeError.value =
              msg.replace(/\. Relative references must.*$/, '') +
              `.\nTip: add an "import-map.json" file to specify import paths for dependencies.`
          } else {
            runtimeError.value = event.value
          }
        },
        on_unhandled_rejection: (event: any) => {
          let error = event.value
          if (typeof error === 'string') {
            error = { message: error }
          }
          runtimeError.value = 'Uncaught (in promise): ' + error.message
        },
        on_console: (log: any) => {
          if (log.duplicate) {
            return
          }
          if (log.level === 'error') {
            if (log.args[0] instanceof Error) {
              runtimeError.value = log.args[0].message
            } else {
              runtimeError.value = log.args[0]
            }
          } else if (log.level === 'warn') {
            if (log.args[0].toString().includes('[Vue warn]')) {
              runtimeWarning.value = log.args
                .join('')
                .replace(/\[Vue warn\]:/, '')
                .trim()
            }
          }
        },
        on_console_group: (action: any) => {
          // group_logs(action.label, false);
        },
        on_console_group_end: () => {
          // ungroup_logs();
        },
        on_console_group_collapsed: (action: any) => {
          // group_logs(action.label, true);
        }
      })

      sandbox.addEventListener('load', () => {
        proxy.handle_links()
      })
    }

    const updatePreview = async () => {
      // @ts-ignore
      if (import.meta.env.PROD) {
        console.clear()
      }
      runtimeError.value = null
      runtimeWarning.value = null
      try {

        await proxy.eval([
        ])
      } catch (e: any) {
        runtimeError.value = (e as Error).message
      }
    }

    onMounted(createSandbox)
    onUnmounted(() => {
      proxy.destroy()
      stopUpdateWatcher = watchEffect(updatePreview)
    })
    return () => (
      <div class='preview'>
        <div class="preview-iframe-container" ref={container}></div>
        <message err={runtimeError} />
        {!runtimeError ? <message warn={runtimeWarning} /> : ''}
      </div>
    )
  }
})