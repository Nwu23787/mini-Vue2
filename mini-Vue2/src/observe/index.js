import newProto from "./array"
import Dep from "./dep"

/**
 * 将传入的 data 对象使用 defineproperty 进行劫持
 * @param {Object} data  要实现响应式的对象
 * @returns {} 
 */
export function observe(data) {



    // 判断 data 是否需要劫持，非对象不劫持
    if (typeof data !== 'object' || typeof data == 'null') {
        return
    }

    // 判断 data 是否已经被监听过了
    if (data.__ob__) return data

    //通过observer类进行监听
    return new Observer(data)
}

class Observer {
    constructor(data) {
        // data 可能是对象或者数组，在这给 data 新增属性 dep，让他去收集依赖
        // 给每个对象都增加收集依赖功能
        this.dep = new Dep()

        // 把 data 对应的 Observer 实例添加到了 data 上，这样做的话，1 是可以通过监测是否存在_ob_属性来检测 data 是否已被监听过，2 是通过 _ob_ 可以访问到 walk 和 observerArray 以及其他的方法，便于其他地方使用
        // 必须把 _ob_ 设置为不可枚举属性才行，否则在递归遍历监听的时候会死循环
        Object.defineProperty(data, '__ob__', {
            value: this,
            enumerable: false
        })
        // 判断data是否为数组，数组不用进行每一项的劫持
        if (Array.isArray(data)) {
            // 通过修改data的原型，重写可以改变数组的方法
            data.__proto__ = newProto
            this.observerArray(data)
        } else {
            this.walk(data)
        }
    }
    // 遍历对象，进行劫持
    walk(data) {
        Object.keys(data).forEach(key => defineReactive(data, key, data[key]))
    }

    // 实现数组监测
    observerArray(data) {
        //  遍历数组，如果数组的子项是对象的话，要对这个对象进行劫持
        data.forEach(item => observe(item))
    }
}


/**
 * 递归解决数组嵌套，视图更新
 * @param {*} value 
 */
function dependArray(value) {
    for (let i = 0; i < value.length; i++) {
        let current = value[i]
        // 数组中的数组也要收集当前这个 watcher，数组中的数组值发生变化，当前组件也要刷新
        current.__ob__ && current.__ob__.dep.depend()
        if (Array.isArray(current)) {
            dependArray(current)
        }
    }

}


/**
 * 实现对象指定属性的劫持
 * @param {Object} target 被劫持的对象
 * @param {String} key 需要被劫持的属性
 * @param {*} value 被劫持属性当前的值
 */
export function defineReactive(target, key, value) {
    // 对属性值进行深层递归遍历
    let childOb = observe(value) // childOb.dep 用来收集依赖
    // 为每个属性绑定一个dep
    let dep = new Dep()
    // 闭包。对外暴露了 set 和 get 方法，从而使 value 值不会被回收
    Object.defineProperty(target, key, {
        // 访问属性的时候，触发get
        get() {
            if (Dep.target) {
                // 全局上存在 watcher，收集这个 watcher
                dep.depend()
                if (childOb) {
                    childOb.dep.depend()
                    if (Array.isArray(value)) {
                        dependArray(value)
                    }
                }
            }
            return value
        },
        // 修改属性的时候，触发set
        set(newValue) {
            if (newValue === value) return
            // 修改之后重新劫持，因为如果用户将值修改为对象，那么要对这个对象进行深度劫持
            observe(newValue)
            value = newValue
            // 修改了响应式数据之后，通知观察者更新
            dep.notify()
        }
    })
}