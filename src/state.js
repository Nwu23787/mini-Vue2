import Dep from "./observe/dep"
import { observe } from "./observe/index"
import Watcher, { nextTick } from "./observe/watcher"

/**
 * 初始化状态，分发init
 * @param {Object} vm Vue 实例
 */
export function initState(vm) {
    const opts = vm.$options
    // 是否传入data
    if (opts.data) {
        initData(vm)
    }
    // 是否使用计算属性
    if (opts.computed) {
        initComputed(vm)
    }
    // 初始化 watch
    if (opts.watch) {
        initWatch(vm)
    }
}

/**
 * 初始化 watch 选项
 * @param {*} vm Vue实例
 */
function initWatch(vm) {
    let watch = vm.$options.watch

    // 取出 watch 中的每一个属性
    for (let key in watch) {
        const handler = watch[key] // 可能是数组、字符串、函数
        if (Array.isArray(handler)) {
            //如果是数组，则循环创建 watcher
            for (let i = 0; i < handler.length; i++) {
                createWatcher(vm, key, handler[i])
            }
        } else {
            createWatcher(vm, key, handler)
        }
    }
}

/**
 * 
 * @param {*} vm Vue 实例
 * @param {*} key 监听的属性
 * @param {*} handler 属性变化执行的回调
 * @returns 
 */
function createWatcher(vm, key, handler) {
    // 可能是字符串、函数
    if (typeof handler == 'string') {
        handler = vm[handler]
    }

    return vm.$watch(key, handler)
}

/**
 * 代理对象，非真正的 Proxy
 * @param {Object} vm Vue 实例
 * @param {String} target 要代理的属性
 * @param {String} key target的建
 */
function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
        get() {
            // 访问 vm[key] 就是在访问 vm._data[key]，即 vm[target][key]
            return vm[target][key]
        },
        set(newValue) {
            vm[target][key] = newValue
        }
    })
}

/**
 * 初始化 data 选项
 * @param {Object} vm Vue 实例
 */

function initData(vm) {
    let data = vm.$options.data
    // 判断 data 的类型，如果是函数，执行它，获得对象。要注意this问题，this应该是Vue实例
    data = typeof data === 'function' ? data.call(vm) : data

    vm._data = data
    // 对数据对象进行劫持
    observe(data)
    // 代理一层，方便用户访问
    for (let key in data) {
        proxy(vm, '_data', key)
    }
}

/**
 * 初始化处理 computed 选项
 * @param {*} vm Vue实例
 */
function initComputed(vm) {
    const computed = vm.$options.computed
    const wacthers = vm._computedWatchers = {} // 存储所有计算属性的 watcher，并保存到 vm 上
    // computed 中书写的可能是对象，也可能是函数
    for (let key in computed) {
        let userDef = computed[key]

        let fn = typeof userDef === 'function' ? userDef : userDef.get
        // 为每一个计算属性创建一个 watcher，每次调用 watcher 时，执行 get 方法获取最新值
        wacthers[key] = new Watcher(vm, fn, { lazy: true }) // new Watcher 默认会执行一次 fn，但 computed 默认是不初始化的，所以加入 lazy 配置项

        // 把 computed 中定义的变量挂载到 vm 上去
        defineComputed(vm, key, userDef)
    }
}

/**
 * 将 computed 中的属性挂载到 vm 上
 * @param {Object} target vm
 * @param {string} key 要挂载的属性
 * @param {Object} userDef 用户传入的计算属性对象
 */
function defineComputed(target, key, userDef) {
    const getter = typeof userDef === 'function' ? userDef : userDef.get
    const setter = userDef.set || (() => { })

    Object.defineProperty(target, key, {
        get: createComputedGetter(key),
        set: setter
    })
}

/**
 * 加入了缓存（脏值监测）的get方法
 * @param {string} key 计算属性变量名
 * @returns 加入了脏值监测机制的 get 方法
 */
function createComputedGetter(key) {
    return function () {
        // 获取到对应计算属性的watcher
        const watcher = this._computedWatchers[key]
        // 如果是脏值，那么重新执行用户定义的 get 方法，进行计算
        if (watcher.dirty) {
            // 是脏值
            watcher.evaluate()
        }
        if (Dep.target) {
            // 计算属性 watcher 出栈之后，如果还栈中还存在 watcher ，那么继续收集上层 watcher
            // 要让计算属性中的 watcher 所对应的响应式数据，也去收集渲染 watcher。换句话说就是，收集了计算属性 watcher 的数据，也必须收集当前的渲染 watcher，
            // 这样才能实现数据变化，页面自动重新渲染
            watcher.depend()
        }
        return watcher.value
    }
}


export function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick
    /**
     * $watch API
     * @param {string | function} exprOrFn 字符串或者函数
     * @param {Function} cb watch的回调函数
     */
    Vue.prototype.$watch = function (exprOrFn, cb) {
        // exprOrFn 变化直接执行 cd 回调
        new Watcher(this, exprOrFn, { user: true }, cb)
    }
}