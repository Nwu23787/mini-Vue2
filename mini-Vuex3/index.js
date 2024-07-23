import { install } from "vuex";
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
    // 是根模块
    // 将 mutations 中的方法安装到根实例上，维护成数组，同名的方法放在同一个数组中
    rootModule.forEachMutations((key, val) => {
        store._mutations[key] = (store._mutations[key] || [])
        store._mutations[key].push((payload) => {
            val(rootModule.state, payload)
        })
    })

    // 将 actions 中的方法安装到根实例上，维护成数组，同名的方法放在同一个数组中
    rootModule.forEachActions((key, val) => {
        store._actions[key] = (store._actions[key] || [])
        store._actions[key].push((payload) => {
            val(rootModule.state, payload)
        })
    })

    // 计算属性不用维护成一个数组，计算属性不能重名
    rootModule.forEachGetters((key, val) => {
        if (store._warppedGetters[key]) {
            // 计算属性重名报错
            throw new Error(`duplicate getter key '${key}'`)
        }
        store._warppedGetters[key] = () => {
            return val(rootModule.state)
        }
    })

    // 如果存在子模块，递归处理
    rootModule.forEachChildren((key, val) => {
        installModule(store, rootState, path.concat(key), val)
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

    }
}


export default { Store, install }