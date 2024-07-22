import routerLink from './components/link'
import routerView from './components/view'
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

                // 将 current 对象定义为响应式，并挂载到根实例上，可以通过 this._routerRoot._route 拿到
                Vue.util.defineReactive(this, '_route', this._router.history.current)
            } else {
                // 如果当前组件实例没有 $options.router 属性，那么就将他的父组件的 _routerRoot 值作为该组件的 _routerRoot，以此来实现共享 Vue 根实例
                this._routerRoot = (this.$parent && this.$parent._routerRoot) || this
            }
        }
    })

    Object.defineProperty(Vue.prototype, '$router', {
        get() {
            // 代理一层，不通过 this._routerRoot._router 来访问路由，而是通过 this.$router 的便捷方式
            return this._routerRoot && this._routerRoot._router
        }
    })

    Object.defineProperty(Vue.prototype, '$route', {
        get() {
            // 代理一层，不通过 this._routerRoot._route 来访问路由，而是通过 this.$route 的便捷方式
            return this._routerRoot && this._routerRoot._route
        }
    })


    // 定义 <router-link> 全局组件
    Vue.component('router-link', routerLink)

    // 定义 <router-view> 全局组件
    Vue.component('router-view', routerView)
}