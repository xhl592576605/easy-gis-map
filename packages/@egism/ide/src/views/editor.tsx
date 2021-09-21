import { defineComponent, ref, watch } from 'vue'
import editorItem from '../components/editor-item'
import useRunCode from '../hooks/useRunCode'
import './style/editor.scss'


export default defineComponent({
  name: 'editor',
  components: { editorItem },
  props: {
    name: {
      type: String
    },
    code: {
      type: String
    },
    language: {
      type: String
    }
  },
  setup: (props) => {
    const oldCode = ref<string>(props.code || '')
    const code = ref<string>(props.code || '')
    const newCode = ref<string>(props.code || '')

    watch(() => props.code, (newVal) => {
      oldCode.value = newVal as string
      code.value = newVal as string
    })
    const runCode = () => {
      const { run } = useRunCode()
      run(newCode.value)
    }
    const restore = () => {
      code.value = oldCode.value
    }
    const onCodeChange = (_code: string) => {
      newCode.value = _code
    }

    const language = ref<string>(props.language || '')
    watch(() => props.language, (newVal) => {
      language.value = newVal as string
    })
    return () => (
      <div class='editor'>
        <div class='editor-head'>
          <div class='file-name'>{props.name}</div>
          <div class='btn btn-text' onClick={runCode}>运行</div>
          <div class='btn btn-text' onClick={restore}>还原</div>
        </div>
        <div class='editor-body'>
          <editor-item v-model={[code.value, 'code']} language={language.value}></editor-item>
        </div>
      </div >
    )
  }
})
