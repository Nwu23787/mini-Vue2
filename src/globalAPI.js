import { mergeOptions } from "./utils";



export function initGlobalAPI(Vue) {

    Vue.options = {
        _base: Vue
    }

    Vue.mixin = function (mixin) {
        // 合并原有的钩子和传进来的钩子
        this.options = mergeOptions(this.options, mixin)
        return this
    }

    //使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。手动创造组件。返回一个组件的构造函数
    Vue.extend = function (options) {

        // 返回的子类
        function Sub(options = {}) {
            // 初始化子类
            this._init(options)
        }

        // 子类继承父类,new Sub 的时候，会执行init方法
        Sub.prototype = Object.create(Vue.prototype)
        // create 继承会改变子类的constractor
        Sub.prototype.constructor = Sub
        // 保将用户传递的参数和全局的Vue.options 合并
        Sub.options = mergeOptions(Vue.options, options)

        return Sub
    }

    // 存储全局组件，将组件的构造函数统一挂载到全局上去
    Vue.options.components = {}
    Vue.component = function (id, definition) {
        // definition 可能为对象或者 Vue.extend 函数，需要统一
        definition = typeof definition === 'function' ? definition : Vue.extend(definition)
        Vue.options.components[id] = definition
    }

}