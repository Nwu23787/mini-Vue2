import { compileToFunction } from "./compiler/index"
import { callHook, mountComponent } from "./lifecycle"
import { initState } from "./state"
import { mergeOptions } from "./utils"

/**
 * 定义 _init 初始化 Vue 方法，并将其挂载到 Vue 实例的原型上，供 Vue 实例调用
 * @param {Object} Vue Vue 实例 
 * @returns {Void}
 */
export function initMixin(Vue) {
    Vue.prototype._init = function (options) {
        // this 就是 Vue 实例，经常写 this 太烦，又容易混淆 this，取别名
        const vm = this


        // 将用户选项挂载到 Vue 实例上，便于其他地方使用
        vm.$options = mergeOptions(this.constructor.options, options) // mergeOPtions，合并当前传入的options和Vue的全局options（也就是我们混入的mixin的options）

        // beforeCreated 生命周期
        callHook(vm, 'beforeCreated')

        // 初始化状态（data、computed、props等等）
        initState(vm)

        // created 生命周期
        callHook(vm, 'created')


        // 挂载数据，也就是将数据解析（或者说挂载）到 el 指定的 dom 上
        if (options.el) {
            vm.$mount(options.el)
        }
    }

    Vue.prototype.$mount = function (el) {
        const vm = this
        // 获取 el 对应的真实 dom
        el = document.querySelector(el)
        let opts = vm.$options
        if (!opts.render) {
            // 没有传 render 选项
            let template
            if (!opts.template && el) {
                // 没有传入模版，但传入了el，那么就去找 el 指定的模版
                // 获取到 el 对应的 HTML 结构，也就是模版
                template = el.outerHTML
            } else {
                // 传入了模版
                template = opts.template
            }
            if (template) {
                // 编译模版，获取 render
                const render = compileToFunction(template)
                opts.render = render
            }
        }
        // 如果有模版，则编译成render；反之如果有render，则不必编译。模版和render函数最终都会被统一成render函数

        mountComponent(vm, el) //得到了render 函数之后，执行组件的挂载
    }
}

