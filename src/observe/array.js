    // 重写数组中可以改变数组的7个方法，并返回重写后的原型对象
    let oldProto = Array.prototype
    // 不可以直接修改数组的原型，通过类似于子类重写的方式，使 newProto 的原型指向原来数组的原型，在 newProto 上重写方法不会影响到原数组原型
    let newProto = Object.create(oldProto)

    const methods = [
        'push',
        'pop',
        'shift',
        'unshift',
        'reverse',
        'sort',
        'splice'
    ]

    methods.forEach(method => {
        newProto[method] = function (...args) {
            // 调用原有原型上的相同方法，但要注意this问题
            const res = oldProto[method].call(this, ...args)
            // 获取到新增的元素
            let newNode = undefined
            // 对于新增元素的方法，必须给新增的元素添加监听
            if (method === 'push' || method === 'unshift') {
                newNode = args
            } else if (method === 'splice') {
                // spilce 的参数除掉前两个参数之后，才是新增的元素
                newNode = args.slice(2)
            }

            if (newNode) {
                this.__ob__.observerArray(newNode)
            }
            
            // 通知对应 watcher ，数组发生了变化
            this.__ob__.dep.notify()

            return res
        }

    })

    export default newProto

