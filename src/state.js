import { observe } from "./observe/index"

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

