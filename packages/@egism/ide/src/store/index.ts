import { InjectionKey } from "vue";
import { createStore, Store, useStore as baseUseStore } from "vuex";
import { mutations } from "./mutations";
import { state, State } from "./state";

export const key: InjectionKey<Store<State>> = Symbol()

export const store = createStore<State>({
  state,
  mutations
})
export const useStore = () => baseUseStore(key)