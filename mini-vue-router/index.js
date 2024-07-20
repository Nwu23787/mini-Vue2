import createMatcher from "./create-matcher"
import { install, Vue } from "./install"



class VueRouter {
    constructor(options) {
        console.log(options);
        let routes = options.routes || []

        // 创建路由匹配器与路由映射表，即相关方法
        this.mathcer = createMatcher(routes)
    }
}

/**
 * 供 Vue.use 调用，Vue.use 会调用插件的 install 方法
 *  @params _Vue 传入的 Vue 构造函数
 */
VueRouter.install = install

export default VueRouter