import Dep, { popTarget, pushTarget } from "./dep";

let id = 0;

class Watcher {
    // vm watcher 对应的组件的实例，fn 组件对应的渲染函数
    constructor(vm, exprOrFn, options, cb) {
        // 使用 id 来区分不同组件的 watcher
        this.id = id++

        if (typeof exprOrFn === 'string') {
            // exprOrFn 若为字符串，改成函数
            this.getter = function () {
                return vm[exprOrFn]
            }
        } else {
            // 把渲染函数绑定watcher到实例上，调用getter即可重新渲染，更新视图
            this.getter = exprOrFn
        }


        // 标记是否是一个渲染watcher
        this.renderWatcher = options
        // 收集 watcher 对应的 dep
        this.deps = []
        // 使用 set 保存 deps 中所有 dep 的id，便于去重操作
        this.depsId = new Set()
        // 是否为懒 watcher
        this.lazy = options.lazy
        //计算属性的缓存值
        this.dirty = this.lazy
        // 初始化调用
        this.value = this.lazy ? undefined : this.get()
        // 记录 vm
        this.vm = vm
        // 记录回调
        this.cb = cb
        // 判断是不是用户自己创建的 watcher，也就是 watch 对应的 watcher
        this.user = options.user
    }

    // 执行传入的回调函数
    get() {
        // 在渲染开始之前，把 watcher 挂载到全局，也就是 Dep 类上（静态属性）
        pushTarget(this)
        let value = this.getter.call(this.vm);
        // 渲染结束，把当前的 watcher 出栈
        popTarget()
        return value
    }

    // 计算属性求值
    evaluate() {
        // 获取到用户定义的 get 方法的返回值
        this.value = this.get()
        this.dirty = false
    }
    // 计算属性用，让每一个计算属性的依赖收集上层 watcher
    depend() {
        for (let i = this.deps.length - 1; i >= 0; i--) {
            this.deps[i].depend(this)
        }
    }

    // 给 watch 添加 dep
    addDep(dep) {
        // 要判断这个 dep 是否已经被记录，防止重复记录
        let id = dep.id
        if (!this.depsId.has(id)) {
            // id 不存在与 depsId 中，则这个 dep 没有被 watcher 收集过
            this.deps.push(dep)
            this.depsId.add(id)
            // 让 dep 收集 watcher
            dep.addSub(this)
        }
    }

    // 更新视图
    update() {
        // 如果是计算属性依赖的值发生变化，标志脏值，下次取值会重新计算
        if (this.lazy) {
            this.dirty = true
        } else {
            // 把当前的 watcher 暂存在队列中
            queueWatcher(this)
        }
    }

    // 执行渲染逻辑
    run() {
        let oldValue = this.value
        let newValue = this.get()
        if (this.user) {
            this.cb.call(this.vm, oldValue, newValue)
        }
    }

}
// 缓存 watcher 队列
let queue = []
// 去重的辅助对象，源码中没用 set，用的是对象
let has = []
// 防抖
let pending = false

// 刷新 watcher 队列
function flushSchedulerQueue() {
    // 拷贝一份queue，如果在更新的过程中产生了新的 watcher，会加入到 queue 队列中，下一次清空队列时才执行，不会在这一次执行
    let flushQueue = queue.slice(0)
    queue = []
    has = {}
    pending = false
    flushQueue.forEach(item => item.run())
}

function queueWatcher(watcher) {
    // 通过判断watcher的id进行去重，避免同一个组件多次刷新
    const id = watcher.id
    if (!has[id]) {
        // 没有重复
        queue.push(watcher)
        has[id] = true
        // 在第一次加入 watcher 之后，就会将刷新队列的任务加入
        if (!pending) {
            nextTick(flushSchedulerQueue);
            pending = true
        }
    }
}


// nextTick 的任务排队
let callbacks = []
// 防抖
let waiting = false
// 清空调度队列
function flushCallbacks() {
    let cds = callbacks.slice(0)
    waiting = false
    callbacks = []
    cds.forEach(cb => cb())
}

// nextTick 优雅降级
let timerFunc;
if (Promise) {
    timerFunc = () => {
        Promise.resolve().then(flushCallbacks)
    }
} else if (MutationObserver) {
    let observer = new MutationObserver(flushCallbacks)
    let textNode = document.createTextNode(1)
    observer.observe(textNode, {
        characterData: true
    })
    timerFunc = () => {
        textNode.textContent = 2
    }
} else if (setImmediate) {
    timerFunc = () => {
        setImmediate(flushCallbacks)
    }
} else {
    timerFunc = () => {
        setTimeout(flushCallbacks, 0);
    }
}

export function nextTick(cb) {
    callbacks.push(cb)
    if (!waiting) {
        timerFunc()
        waiting = true
    }
}
export default Watcher