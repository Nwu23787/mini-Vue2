let id = 0

class Dep {
    constructor() {
        this.id = id++
        // 用于收集数据对应的 watcher
        this.subs = []
    }

    // 将 dep 传递给 watcher，进行去重
    depend() {
        // this.subs.push(Dep.target)
        Dep.target.addDep(this)
    }

    // 给 dep 收集对应的 watcher 依赖
    addSub(watcher) {
        this.subs.push(watcher)
    }

    // 数据更新后，通知 watcher 更新
    notify() {
        this.subs.forEach(watcher => watcher.update())
    }
}

Dep.target = null


let stack = []

/**
 * watcher 入栈
 * @param {Object} this watcher 
 */
export function pushTarget(watcher) {
    stack.push(watcher)
    Dep.target = watcher // 全局记录
}

/**
 * watcher 出栈
 * @param {Object} this watcher 
 */
export function popTarget() {
    stack.pop()
    Dep.target = stack[stack.length - 1]
}
export default Dep