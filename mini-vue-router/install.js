export let Vue

export function install(_Vue) {
    Vue = _Vue // 将传入的 Vue 构造函数挂载到全局上

    // 要让所有 Vue 组件都可以访问到路由信息 router
    Vue.mixin({
        beforeCreate() {
            // 将 router 信息保存在 Vue 根实例上，通过共享 Vue 根实例的方式，来共享 router
            if (this.$options.router) {
                // 如果当前实例上的 options 上有 router，说明这一定是 Vue 根实例
                this._routerRoot = this // 保存当前的根实例
                this._router = this.$options.router // 将路由信息保存到根实例上

                // 初始化路由
                this._router.init(this)
            } else {
                // 如果当前组件实例没有 $options.router 属性，那么就将他的父组件的 _routerRoot 值作为该组件的 _routerRoot，以此来实现共享 Vue 根实例
                this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
            }
        }
    })

    Object.defineProperty(Vue.prototype, '$router', {
        get() {
            // 代理一层，不通过 this._routerRoot.router 来访问路由，而是通过 this.$router 的便捷方式
            return this._routerRoot && this._routerRoot._router
        }
    })

    // 定义 <router-link> 全局组件
    Vue.component('router-link', {
        props: {
            to: { type: String, required: true },
            tag: { type: String, default: 'a' }
        },
        methods: {
            handler() {
                // 跳转 to 对应的路由
                this.$router.push(this.to)
            }
        },
        render() {
            // this.$slots 获取到所有的插槽
            return <this.tag onClick={this.handler}>{this.$slots.default}</this.tag>
        }
    })

    // 定义 <router-view> 全局组件
    Vue.component('router-view', {
        render() {
            // this.$slots 获取到所有的插槽
            return <div>router-view</div>
        }
    })
}