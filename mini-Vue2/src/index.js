import { initGlobalAPI } from "./globalAPI"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import { initStateMixin } from "./state"

// Vue 实例的构造函数，options 为用户传入的选项（Vue2 的选项式API）
function Vue(options) {
    // 初始化操作
    this._init(options)
}

initMixin(Vue) //将 _init 方法添加到 Vue 实例原型上，供 Vue 实例调用
initLifeCycle(Vue)
initStateMixin(Vue)
initGlobalAPI(Vue)

export default Vue