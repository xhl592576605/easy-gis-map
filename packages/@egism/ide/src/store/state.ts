export interface State {
  code: string,
  complieCode: Array<string>,
  language: string,
  errors: (string | Error)[]
}

export const state: State = {
  code: '',
  complieCode: [],
  language: '',
  errors: []
}