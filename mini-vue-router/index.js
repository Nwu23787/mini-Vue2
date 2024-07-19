import { install, Vue } from "./install"


class VueRouter {
    constructor(options) {
        let routes = options.router
    }
}

/**
 * 供 Vue.use 调用，Vue.use 会调用插件的 install 方法
 *  @params _Vue 传入的 Vue 构造函数
 */
VueRouter.install = install

export default VueRouter