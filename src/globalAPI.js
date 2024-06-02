import { mergeOptions } from "./utils";



export function initGlobalAPI(Vue) {

    Vue.options = {}

    Vue.mixin = function (mixin) {
        // 合并原有的钩子和传进来的钩子
        this.options = mergeOptions(this.options, mixin)
        return this
    }

}