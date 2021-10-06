import { defineComponent, reactive, toRefs } from 'vue'
import './style/integrate.scss'
import fileTree from './fileTree'
import editor from './editor'
import preview from './preview'
import useRunCode from '../hooks/useRunCode'
export default defineComponent({
  name: 'integrate',
  components: { fileTree, editor, preview },
  setup: (props) => {

    let fileInfo = reactive({
      name: 'code.js',
      code: '// code \n// js 暂不支持，请选择文件夹中的文件 \n',
      language: 'javascript'
    })
    const onSlectFile = (_fileInfo: any) => {
      fileInfo = Object.assign(fileInfo, _fileInfo)
      const { run } = useRunCode()
      run(fileInfo.code, fileInfo.language, fileInfo.name)
    }

    return () => (
      <div class="integrate">
        <div class="head">
          <h3>egism</h3>
        </div>
        <div class="body">
          <div class="file-tree-container">
            <fileTree onSelectFile={onSlectFile}></fileTree>
          </div>
          <div class="editor-container">
            <editor name={fileInfo.name} code={fileInfo.code} language={fileInfo.language}></editor>
          </div>
          <div class="preview-container">
            <preview></preview>
          </div>
        </div>
        <div class="footer"><text>2021-2021 © egism</text></div>
      </div>
    )
  }
})