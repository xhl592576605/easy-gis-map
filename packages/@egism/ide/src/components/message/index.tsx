import { defineComponent, ref, watch, Transition } from 'vue'
import { CompilerError } from '@vue/compiler-sfc'
import './style/index.scss'
export default defineComponent({
  name: 'message',
  props: {
    err: {
      type: [String, Error]
    },
    warn: {
      type: [String, Error]
    }
  },
  setup: (props, ctx) => {
    const dismissed = ref(false)
    watch(
      () => [props.err, props.warn],
      () => {
        dismissed.value = false
      }
    )

    const formatMessage = (err: string | Error | undefined): string => {
      if (typeof err === 'string') {
        return err
      } else {
        let msg = err?.message || ''
        const loc = (err as CompilerError)?.loc
        if (loc && loc.start) {
          msg = `(${loc.start.line}:${loc.start.column}) ` + msg
        }
        return msg
      }
    }
    return () => (
      <Transition name="fade">
        <pre>
          {formatMessage(props.err || props.warn)}
        </pre>
      </Transition >
    )
  }
})
