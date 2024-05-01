import Dep from "./dep";

let id = 0;

class Watcher {
    // vm watcher 对应的组件的实例，fn 组件对应的渲染函数
    constructor(vm, fn, options) {
        // 使用 id 来区分不同组件的 watcher
        this.id = id++
        // 把渲染函数绑定watcher到实例上，调用getter即可重新渲染，更新视图
        this.getter = fn
        // 标记是否是一个渲染watcher
        this.renderWatcher = options
        // 收集 watcher 对应的 dep
        this.deps = []
        // 使用 set 保存 deps 中所有 dep 的id，便于去重操作
        this.depsId = new Set()
        // 调用
        this.get()
    }

    // 渲染函数
    get() {
        // 在渲染开始之前，把 watcher 挂载到全局，也就是 Dep 类上（静态属性）
        Dep.target = this
        this.getter();
        // 渲染结束，把全局的 watcher 卸载
        Dep.target = null
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
        this.get()
    }

}

export default Watcher