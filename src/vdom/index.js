// 构造 VNode 的相关方法

// 创建元素节点的VNode，即 h()
export function createElement(vm, tag, data = {}, ...children) { // Vue 实例，标签名，属性，子节点
    if (data == null) {
        data = {}
    }
    let key = data.key
    if (key) delete data.key
    return vnode(vm, tag, key, data, children)
}

// 创建文本节点的VNode
export function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text)
}

// 创建 Vnode  的方法
function vnode(vm, tag, key, data, children, text) {
    // 返回创建的虚拟 DOM
    return {
        vm,
        tag,
        key,
        data,
        children,
        text
        // 事件、插槽、指令......
    }
}

// 和 AST 不一样，AST 只是语法层面的抽象，语法是什么样，AST节点就必须是什么样，不能人为添加一些属性
// 但是虚拟 DOM 是描述 dom 元素的，可以增加一些自定义的属性
// AST 是描述语言的
// 虚拟 DOM 是描述 DOM 的