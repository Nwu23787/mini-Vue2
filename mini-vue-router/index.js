import createMatcher from "./create-matcher"
import hashHistory from "./history/hash";
import HTML5History from "./history/html5";
import { install, Vue } from "./install"


/**
 * 用于向钩子对应的回调队列中添加回调函数
 * @param {Array} list 回调队列
 * @param {Function} fn 要添加的回调函数
 * @returns 返回一个删除刚加入的这个回调的函数
 */
function registerHook(list, fn) {
    list.push(fn) // 加入回调队列

    // 返回一个删除刚加入的这个回调的函数
    return () => {
        const i = list.indexOf(fn)
        if (i > -1) list.splice(i, 1)
    }
}


class VueRouter {
    constructor(options) {
        this.options = options

        // 钩子对应的回调队列
        this.beforeHooks = []
        this.resolveHooks = []
        this.afterHooks = []

        let routes = options.routes || []

        // 创建路由匹配器与路由映射表，即相关方法
        this.mathcer = createMatcher(routes)

        // 默认 hash 路由
        let mode = options.mode || 'hash'

        switch (mode) {
            case 'history':
                this.history = new HTML5History(this)
                break;
            case 'hash':
                this.history = new hashHistory(this)
                break
            case 'abstract':
                throw new Error('not support the abstract mode')
                break
            default:
                throw new Error(`invaild mode ${mode}`)
                break;
        }

    }

    init(app) {
        let history = this.history

        // 根据路径，渲染对应组件

        // 初渲染时初始化页面，根据当前路径匹配组件
        history.transitionTo(history.getCurrentLocation(), () => {
            // 初始化完成之后，监听路由变化
            history.setupListeners()
        })

        // 每次路由跳转时需要调用的回调函数，在每次调用后更新 _route 的值
        history.listen((newRoute) => {
            app._route = newRoute
        })

    }

    /**
     * 根据路径寻找路由对象
     * @param {string} location 路由路径
     * @returns 路由对象
     */
    match(location) {
        return this.mathcer.match(location)
    }

    /**
     * 根据路由地址跳转
     * @param {string} location 路由地址  
     */
    push(location) {
        this.history.transitionTo(location, () => {
            this.history.push(location)
        })
    }

    beforeEach(cb) {
        return registerHook(this.beforeHooks, cb)
    }

    beforeResolve(cb) {
        return registerHook(this.resolveHooks, cb)
    }

    afterEach(cb) {
        return registerHook(this.afterHooks, cb)
    }

}

/**
 * 供 Vue.use 调用，Vue.use 会调用插件的 install 方法
 *  @params _Vue 传入的 Vue 构造函数
 */
VueRouter.install = install

export default VueRouter