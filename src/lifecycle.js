import Watcher from "./observe/watcher"
import { createElement, createTextVNode } from "./vdom/index"

// 创建真实DOM
function createElm(vnode) {
    // 将 VNode 解构
    let { tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        // 传入的是标签，文本节点的tag为undefined
        // 创建元素
        // ！！！把真实 DOM 挂载到 虚拟DOM 上！便于后续更新，比如修改了属性，就可以直接找到真实的dom进行更新
        vnode.el = document.createElement(tag)

        // 更新元素属性
        patchProps(vnode.el, data)

        // 创建子DOM
        children.forEach((item) => {
            // 挂载子DOM
            vnode.el.appendChild(createElm(item))
        })
    } else {
        vnode.el = document.createTextNode(text)
    }
    return vnode.el
}

// 处理属性
function patchProps(el, props) {
    for (let key in props) {
        // 单独处理style
        if (key === 'style') {
            for (let styleName in props.style) {
                el.style[styleName] = props.style[styleName]
            }
        } else {
            el.setAttribute(key, props[key])
        }
    }
}

/**
 * 接收两个参数
 * 1. 初渲染：第一个参数为真实的 DOM 对象，第二个参数为 VNode，则根据第二个参数，生成真实 DOM，替换第一个 DOM 对象
 * 2. 更新：第一个参数 和 第二个参数都为 VNode，则比较两者 vnode差异，更新真实 dom
 * @param {Object} oldVnode 一个 VNode 或者是一个真实的 DOM 对象
 * @param {Object} newVnode 新的 VNode
 */
function patch(oldVnode, newVnode) {
    const isRealElement = oldVnode.nodeType
    // console.log(document.getElementsByTagName('body'));
    // oldVnode = document.getElementById('app')
    // debugger

    if (isRealElement) {
        // 对象上有 nodeType 属性，则为真实 DOM
        const elm = oldVnode

        const parentElm = elm.parentNode // 获取到老节点的父节点，便于后面删除和新增（即替换）操作

        // 创建真实 dom
        let newElm = createElm(newVnode)

        // 先把新 DOM 插入到老DOM的后面，然后再删除老DOM，这样可以保证新DOM替换了老DOM
        parentElm.insertBefore(newElm, elm.nextSibling)
        parentElm.removeChild(elm)
        // oldVnode = newElm;

        // return newElm
    } else {
        // 进行 diff 算法，更新
    }
}

export function initLifeCycle(Vue) {
    // 生成 Vnode 节点
    Vue.prototype._c = function () {
        return createElement(this, ...arguments)
    }

    // 处理文本节点
    Vue.prototype._v = function () {
        return createTextVNode(this, ...arguments)
    }

    // 处理变量
    Vue.prototype._s = function (name) {
        if (typeof name === 'object') {
            return JSON.stringify(name) // 如果变量是对象，json序列化之后再返回
        }
        return name
    }

    // 挂载 render 函数到实例上
    Vue.prototype._render = function () {
        return this.$options.render.call(this) // 调用生成的render或者是传入的render，call 用于将this指向vm，使render内的变量向vm上取值
    }

    // 挂载 update 函数到实例上
    Vue.prototype._update = function (vnode) {
        this.$el = document.getElementById('app')
        const el = this.$el
        // 传入两个参数，第一个参数是真实 dom，第二个参数是虚拟 dom，patch 会按照 vnode 创建一个真实 dom，替换掉我们传入的 el
        return patch(el, vnode) // patch 更新 或者 初始化渲染 方法
    }

}

export function mountComponent(vm, el) {
    // 将 el 对应的真实 dom 挂载到 vm 上，便于后面获取
    vm.$el = el
    // // 1. 调用 render 方法，获得虚拟 DOM
    // let vnode = vm._render()
    // console.log(vnode);

    // // 2. 根据虚拟 DOM，生成真实 DOM
    // vm._update(vnode)


    const updateComponent = () => {
        // 1. 调用 render 方法，获得虚拟 DOM
        let vnode = vm._render()

        // 2. 根据虚拟 DOM，生成真实 DOM
        vm._update(vnode)
    }
    const w = new Watcher(vm, updateComponent, true)

}