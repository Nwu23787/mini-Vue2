import { mergeOptions } from "./utils";



export function initGlobalAPI(Vue) {

    Vue.options = {}

    Vue.mixin = function (mixin) {
        // 合并原有的钩子和传进来的钩子
        this.options = mergeOptions(this.options, mixin)
        return this
    }

    //使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。手动创造组件
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
        // 保存用户传递的选项
        Sub.options = options

        return Sub
    }

}