// 构造 VNode 的相关方法

// 判断是否为html的原始标签
const isReservedTag = (tag) => {
    return ['a', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'img', 'li', 'ul', 'button', 'b', 'br', 'dt', 'em', 'hr', 'label', 'ol', 'script', 'title', 'var'].includes(tag)
}

// 创建元素节点的VNode，即 h()
export function createElement(vm, tag, data = {}, ...children) { // Vue 实例，标签名，属性，子节点
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) delete data.key

    // 如果是html的原生标签
    if (isReservedTag(tag)) {
        // 创建原生标签的虚拟节点
        return vnode(vm, tag, key, data, children)
    } else {
        // 这个标签代表的是一个组件，创建组件的虚拟节点
        let Ctor = vm.$options.components[tag]

        //Ctor可能是组件的Sub类，也可能是组件的templae选项
        return createComponentVnode(vm, tag, key, data, children, Ctor)
    }
}

// 创建组件虚拟节点
function createComponentVnode(vm, tag, key, data, children, Ctor) {
    // 判断 Ctor 是不是对象
    if (typeof Ctor === 'object') {
        Ctor = vm.$options._base.extend(Ctor);
    }

    data.hook = {
        // 组件创建真实节点时调用
        init(vnode) {
            // 拿到组件的构造函数,创建实例,并将实例挂载到vnode上
            let instance = vnode.componentInstance = new vnode.componentOptions.Ctor
            // 挂载组件
            instance.$mount()
        }
    }

    return vnode(vm, tag, key, data, children, null, {
        Ctor
    })
}

// 创建文本节点的VNode
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// 创建 Vnode  的方法
function vnode(vm, tag, key, data, children, text, componentOptions) {
    // 返回创建的虚拟 DOM
    return {
        vm,
        tag,
        key,
        data,
        children,
        text,
        componentOptions // 组件的构造函数
        // 事件、插槽、指令......
    }
}
