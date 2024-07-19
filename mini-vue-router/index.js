export let Vue

class VueRouter {
    constructor(options) {

    }
}

/**
 * 供 Vue.use 调用，Vue.use 会调用插件的 install 方法
 *  @params _Vue 传入的 Vue 构造函数
 */
VueRouter.install = function (_Vue) {
    Vue = _Vue // 将传入的 Vue 构造函数挂载到全局上
    console.log('install');
}

export default VueRouter