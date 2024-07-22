// 基础路由

/**
 * 根据当前路由路径，获取其所有父级的路由对象。比如 /a/b/c，
 * matched中就会顺序保存路由 /a、/a/b、/a/b/c对应的路由对象
 * @param {object} record 当前路由对象
 * @param {string} location 当前路由路径
 * @returns {
 * }
 */
function createRoute(record, location) {
    let matched = []
    if (record) {
        while (record) {
            matched.unshift(record)
            record = record.parent
        }
    }

    return {
        path: location,
        matched
    }
}

/**
 * 顺序执行某个回调队列
 * @param {Array} queue 回调队列
 * @param {object} from 来着哪个路由
 * @param {object} to 去往哪个路由
 * @param {function} cb 队列执行完成之后的回调 
 */
function runQueue(history, queue, to, from, cb) {
    function next(index) {
        if (index >= queue.length) return cb()
        let hook = queue[index]
        hook && hook(from, to, (args) => {
            if (args) {
                let path = typeof args === 'object' ? args.path : args
                if (path) {
                    return history.push(path)

                }
            } else {
                next(index + 1)
            }
        })
    }
    next(0)
}

class history {
    constructor(router) {
        this.router = router

        this.current = createRoute(null, '/')
    }

    transitionTo(location, callback) {

        let record = this.router.match(location)

        let route = createRoute(record, location)

        let queue = this.router.beforeHooks
        // 跳转的路径和匹配结果一致
        if (location === this.current.path && route.matched.length === this.current.matched.length) {
            // 拦截重复跳转
            return
        }

        // 执行前置路由守卫
        runQueue(this, queue, route, this.current, () => {

            // 每次跳转，都要更新 current
            this.current = route
            if (callback) callback()

            // 更新 _route 的值
            this.cb && this.cb(route)

            let afterQueue = this.router.afterHooks

            // 执行后置路由守卫
            runQueue(this, afterQueue, route, this.current, () => { })

        })


    }

    listen(cb) {
        this.cb = cb
    }
}

export default history