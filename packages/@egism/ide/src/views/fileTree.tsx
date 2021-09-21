import { defineComponent, watch } from 'vue'
import './style/fileTree.scss'
import ATree from 'ant-design-vue/lib/tree'
import { TreeDataItem, SelectEvent } from 'ant-design-vue/lib/tree/Tree'
import useDocumentFolder from '../hooks/useDocumentFolder'

export default defineComponent({
  name: 'file-tree',
  components: { ATree },
  props: {
    foldPath: {
      type: String,
      default: 'config/folder.json'
    }
  },
  emits: ['select-file'],
  setup: (props, ctx) => {
    const { getFolder, getCode, getLanguage } = useDocumentFolder()
    const treeData = getFolder(props.foldPath as string)
    const onSelect = (_selectedKeys: (number | string)[], selectedEvent: SelectEvent) => {
      const { selectedNodes = [] } = selectedEvent
      if (selectedNodes.length === 0) {
        return
      }
      const selectedNode = selectedNodes[0]
      const { props } = selectedNode || {}
      if (props.isDir) {
        return
      }
      const code = getCode(props.path)
      const unWatch = watch(code, (newVal: string | undefined) => {
        ctx.emit('select-file', {
          ...props,
          code: newVal,
          language: getLanguage(props.extName)
        })
        unWatch()
      })
    }
    return () => (
      <div class='fileTree'>
        <ATree showIcon treeData={treeData.value as TreeDataItem[]} onSelect={onSelect}>
          {{
            fileIcon: ({ iconClass }: { iconClass: string }) => (
              <svg class="icon-file icon" aria-hidden="true">
                <use xlinkHref={iconClass}></use>
              </svg>)
          }}
        </ATree>
      </div>
    )
  }
})