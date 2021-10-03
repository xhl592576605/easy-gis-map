import { MutationTree } from "vuex";
import { MutationTypes } from "./constants";
import { State } from "./state";

export const mutations: MutationTree<State> = {
  [MutationTypes.SET_CODE_INFO](state: State, code: string): void {
    state.code = code
  },
  [MutationTypes.SET_COMPLIE_CODE](state: State, compileCode: string): void {
    state.complieCode = compileCode
  },
  [MutationTypes.SET_LANGUAGE](state: State, language: string): void {
    state.language = language
  }
}