import { defineComponent } from 'vue'
import './style/integrate.scss'
import fileTree from './fileTree'
import editor from './editor'
import preview from './preview'
export default defineComponent({
  name: 'integrate',
  components: { fileTree, editor, preview },
  setup() {

    const file = {
      name: '111.html',
      code: '<div>111/div>',
      language: 'html'
    }
    return () => (
      <div class="integrate">
        <div class="head">
          <h3>egism</h3>
        </div>
        <div class="body">
          <div class="file-tree">
            <fileTree></fileTree>
          </div>
          <div class="editor-container">
            <editor name={file.name} code={file.code} language={file.language}></editor>
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