import PreviewProxy from "./previewProxy"
import markdown from './srcdoc/markdown.html?raw'
import defaultHtml from './srcdoc/default.html?raw'
const srcdoc:any = {
  markdown,
  default: defaultHtml
}

export {
  PreviewProxy,
  srcdoc
}