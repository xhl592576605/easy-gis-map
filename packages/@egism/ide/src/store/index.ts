import { createStore } from "vuex";
import { mutations } from "./mutations";
import { state, State } from "./state";

export const store = createStore<State>({
  state,
  mutations
})