import Vue from 'vue'
import persists from '../../vuex/plugins/persists'
import Vuex from '../../vuex'
import logger from '../../vuex/plugins/logger'

Vue.use(Vuex)


const store = new Vuex.Store({
  strict: true,
  plugins: [
    persists, // 使用持久化插件
    logger // 使用日志插件
  ],
  state: {
    baseCount: 1
  },
  getters: {
    numberGetter(state) {
      return state.baseCount + 1
    }
  },
  mutations: {
    increment(state, payload) {
      state.baseCount += payload
    }
  },
  actions: {
    add(store, payload) {
      store.state.baseCount += payload
    }
  },
  modules: {
    a: {
      namespaced: true,
      state: {
        anumber: 10
      },
      modules: {
        c: {
          namespaced: true,
          state: {
            name: 'ccc'
          },
          mutations: {
            increment(state, payload) {
              console.log(123);
              state.name += payload
            },
          },
          actions: {
            add(state, payload) {
              setTimeout(() => {
                state.commit('a/c/increment', payload)
              }, 1000);
            }
          },
        }
      }
    },
    b: {
      state: {
        bnumber: 18
      },
      getters: {
        num(state) {
          return state.count + 5
        }
      },
    }
  }
})

store.registerModule(['b', 'e'], {
  namespaced: true,
  state: {
    enumber: 520
  },
  mutations: {
    increment(state,payload) {
      return state.enumber+=payload
    }
  }
})

export default store