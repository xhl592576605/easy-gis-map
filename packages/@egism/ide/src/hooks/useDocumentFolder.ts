import { TreeDataItem } from 'ant-design-vue/lib/tree/Tree'
import { useAxios, } from '@vueuse/integrations/useAxios'
import { ref, watch, Ref } from 'vue'
interface Files extends TreeDataItem {
  name?: string,
  path?: string,
  extName?: string,
  children?: Array<Files>
}
export default () => {
  const getFolder = (folderPath: string): Ref<Files> => {
    const files = ref<Files>([])
    const { data, isFinished } = useAxios<Files>(folderPath)
    watch(isFinished, (newVal: boolean) => {
      newVal && (files.value = data.value?.children || [])
    })
    return files
  }
  const getCode = (filePath: string): Ref<string | undefined> => {
    const code = ref<string | undefined>(undefined)
    const { data, isFinished } = useAxios<string>(filePath, {
      headers: {
        'Content-Type': 'text/plain'
      }
    })
    watch(isFinished, (newVal: boolean) => {
      newVal && (code.value = data.value || '')
    })
    return code

  }

  const getLanguage = (extName: string) => {
    const language: any = {
      '.vue': 'vue',
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.json': 'json',
      '.html': 'html',
      '.md': 'markdown'
    }
    return language[extName]
  }
  return {
    getFolder,
    getCode,
    getLanguage
  }
}