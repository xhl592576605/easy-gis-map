import { defineComponent, onMounted, ref, watch } from 'vue'
import useMonaco from '../../hooks/useMonaco'
import './style/index.scss'
export default defineComponent({
  name: 'editor-item',
  props: {
    code: {
      type: String,
    },
    language: {
      type: String,
    }
  },
  emits: ['update:code'],
  setup: (props, ctx) => {
    const editorItem = ref<HTMLDivElement | null>(null)
    const { config, init, onDidChangeModelContent, setModel, setCode, getCode } = useMonaco()
    onMounted(() => {
      config()
      init(editorItem.value as HTMLDivElement, props.language, props.code)
        .then(() => {
          onDidChangeModelContent((code) => {
            if (props.code !== code) {
              ctx.emit('update:code', code)
            }
          })
        })
    })

    watch(() => props.language, (newVal) => {
      setModel(props.code as string, newVal as string)
    })
    watch(() => props.code, (newVal,) => {
      const sourceCode = getCode();
      (newVal !== sourceCode) && setCode(newVal as string)
    })
    return () => (
      <div class='editor-item' ref={editorItem}></div>
    )
  }
})
