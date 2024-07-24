import install, { Vue } from "./install";
import ModuleCollection from "./module/module-collection";

/**
 * 
 * @param {Store} store store实例
 * @param {Object} rootState 根 state
 * @param {Array} path 模块路径
 * @param {Module} rootModule 当前模块
 */
function installModule(store, rootState, path, rootModule) {
    if (path.length > 0) {
        // 是子模块，需要将子模块的 state 挂在父模块的 state 上
        // 找父模块
        let parent = rootState
        path.slice(0, -1).forEach(key => {
            // 按照 path 一层层去寻找父级
            parent = parent[key]
        })
        // 将子模块的 state 挂载到父模块的 state 上
        parent[path[path.length - 1]] = rootModule.state
    }

    let namespaced = store._modules.getNamespaced(path)

    // 将 mutations 中的方法安装到根实例上，维护成数组，同名的方法放在同一个数组中
    rootModule.forEachMutations((key, val) => {
        store._mutations[namespaced + key] = (store._mutations[namespaced + key] || [])
        store._mutations[namespaced + key].push((payload) => {
            val(rootModule.state, payload)
        })
    })

    // 将 actions 中的方法安装到根实例上，维护成数组，同名的方法放在同一个数组中
    rootModule.forEachActions((key, val) => {
        store._actions[namespaced + key] = (store._actions[namespaced + key] || [])
        store._actions[namespaced + key].push((payload) => {
            val(store, payload)
        })
    })

    // 计算属性不用维护成一个数组，计算属性不能重名
    rootModule.forEachGetters((key, val) => {
        if (store._warppedGetters[namespaced + key]) {
            // 计算属性重名报错
            throw new Error(`duplicate getter key '${key}'`)
        }
        store._warppedGetters[namespaced + key] = () => {
            return val(rootModule.state)
        }
    })

    // 如果存在子模块，递归处理
    rootModule.forEachChildren((key, val) => {
        installModule(store, rootState, path.concat(key), val)
    })
}

function resetStoreVM(store, state) {
    const computed = {}
    store.getters = {}

    // 将 getters 添加给 computed
    Object.keys(store._warppedGetters).forEach(key => {
        computed[key] = () => {
            return store._warppedGetters[key](state)
        }

        // 代理，取 getter 时返回 computed 的值
        Object.defineProperty(store.getters, key, {
            get: () => {
                return store._vm[key]
            }
        })
    })

    store._vm = new Vue({
        data: {
            // 将 state 存放在 vue 的 data 中，目的是为其添加响应式
            // 添加 $ 是为了不让 vue 将 state 直接代理到 vm 上，不希望用户可以直接这样访问到 state
            $$state: state
        },
        // 用于实现计算属性
        computed,
    })

}

class Store {
    constructor(options) {
        // 由于 modules 嵌套，需要预处理这些模块，获取模块间的父子关系。即模块收集
        this._modules = new ModuleCollection(options)

        this._mutations = Object.create(null)
        this._actions = Object.create(null)
        this._warppedGetters = Object.create(null)
        // state
        const state = this._modules.root.state
        // 安装模块
        installModule(this, state, [], this._modules.root)

        // 注意此时 state 并不在 store 实例上
        // 创建 vue 实例，并将 state 放置在 data 中，getters 放置在 computed 中
        resetStoreVM(this, state)


    }

    // 通过 commit 调用 mutations
    commit = (funcName, payload) => {
        this._mutations[funcName].forEach(fn => fn.call(this, payload))
    }

    // 通过 dispatch 调用 actions
    dispatch = (funcName, payload) => {
        this._actions[funcName].forEach(fn => fn.call(this, payload))
    }

    // 取 state 时需要向 vm 上去取
    get state() {
        return this._vm._data.$$state
    }



}


export default { Store, install }