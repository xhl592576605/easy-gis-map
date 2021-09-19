
import { defineComponent } from 'vue'
import integrate from './views/integrate'
export default defineComponent({
  name: 'App',
  components: { integrate },
  render: () => (<integrate></integrate>)
})