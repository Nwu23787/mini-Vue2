export let Vue

class Store {
    constructor(options) {
        let state = options.state
        let getters = options.getters
        let mutations = options.mutations
        let actions = options.actions

        this.getters = {}
        this.mutations = options.mutations
        this.actions = options.actions

        const computed = {}

        Object.keys(getters).forEach(key => {

            computed[key] = () => {
                return getters[key](this.state)
            }

            // 代理，取 getter 时返回 computed 的值
            Object.defineProperty(this.getters, key, {
                get: () => {
                    console.log('this', this);
                    return this._vm[key]
                }
            })
        })

        this._vm = new Vue({
            data: {
                // 将 state 存放在 vue 的 data 中，目的是为其添加响应式
                // 添加 $ 是为了不让 vue 将 state 直接代理到 vm 上，不希望用户可以直接这样访问到 state
                $$state: state
            },
            // 用于实现计算属性
            computed,
        })



    }

    // 取 state 时需要向 vm 上去取
    get state() {
        return this._vm._data.$$state
    }

    // 通过 commit 调用 mutations
    commit = (funcName, payload) => {
        this.mutations[funcName](this.state, payload)
    }

    // 通过 dispatch 调用 actions
    dispatch = (funcName, payload) => {
        this.actions[funcName](this, payload)
    }
}

const install = (_Vue) => {
    Vue = _Vue
    Vue.mixin({
        // 保证每一个实例上都挂载上 $store，让每个组件共享
        beforeCreate() {
            if (this.$options.store) {
                // 如果 vue 实例上的选项中传入了 store，那一定是根实例
                this.$store = this.$options.store
            } else {
                if (this.$parent && this.$parent.$store) {
                    // 若当前 vue 实例没有被传入 store，则非根节点
                    this.$store = this.$parent.$store // 向父节点取 $store
                }
            }
        }
    })
}

export default { Store, install }