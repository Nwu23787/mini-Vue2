// 合并策略
const strats = {}
const LIFECYCLE = [
    'beforeCreated',
    'created',
    'beforeMounted',
    'mounted',
    'beforeUpdate',
    'update',
    'beforeDestroy',
    'destroyed'
]
LIFECYCLE.forEach(hook => {
    strats[hook] = function (parent, child) {
        // hook 的合并策略
        if (child) {
            if (parent) {
                // 新旧都有，合并，拼接在一起
                return parent.concat(child)
            } else {
                // 旧的里面没有，将传入的新的包装成数组
                return [child]
            }
        } else {
            // 新的没有，不用合并
            return p
        }
    }
});

// 将子组件和父组件建立关系，利用原型链，通过 child 可以找到 parent
strats.components = function (parent, child) {
    const res = Object.create(parent)


    if (child) {
        for (let key in child) {
            res[key] = child[key]
        }
    }

    return res
}


// 合并两个对象，合并mixin时用到
export function mergeOptions(parent, child) {
    const options = {}


    // 合并老的，其实就是将{create:fn()} => {create:[fn]}，数组化
    for (let key in parent) {
        mergeField(key)
    }

    for (let key in child) {
        if (!parent.hasOwnProperty(key)) {
            // 不合并已经合并过的属性
            mergeField(key)
        }
    }

    // 合并options，优先后传入的mixin
    function mergeField(key) {
        if (strats[key]) {
            // 有相应的策略，按照策略合并
            options[key] = strats[key](parent[key], child[key])
        } else {
            // 策略模式，针对不同的属性采取不同的合并策略
            options[key] = child[key] || parent[key]
        }

    }

    return options
}