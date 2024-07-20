function createComponent(vnode) {
    let i = vnode.data
    // 拿到组件的初始化方法并调用
    if ((i = i.hook) && (i = i.init)) {
        i(vnode)
    }
    if (vnode.componentInstance) {
        return true
    }
}

// 创建真实DOM
export function createElm(vnode) {
    // 将 VNode 解构
    let { tag, data, children, text } = vnode
    if (typeof tag === 'string') {
        // 传入的是标签，文本节点的tag为undefined
        // 如果传入的标签是一个组件
        if (createComponent(vnode)) {
            return vnode.componentInstance.$el
        }
        // 创建元素
        // ！！！把真实 DOM 挂载到 虚拟DOM 上！便于后续更新，比如修改了属性，就可以直接找到真实的dom进行更新，挂载在 el 属性上
        vnode.el = document.createElement(tag)

        // 更新元素属性
        patchProps(vnode.el, {}, data)

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
export function patchProps(el, oldProps = {}, props = {}) {
    let oldStyles = oldProps.style || {}
    let newStyles = props.style || {}

    // 循环旧的style样式，看看新的样式中是否还存在这个样式
    for (let key in oldStyles) {
        // 新的vnode中没有这个样式了，从el上删除这个样式
        if (!newStyles[key]) {
            el.style[key] = ''
        }
    }

    // 循环旧的属性,查看新的属性中是否还存在这个属性
    for (let key in oldProps) {
        if (!props[key]) {
            // 新的vnode中没有这个属性，从el上删除这个属性
            el.removeAttribute(key)
        }
    }

    // 用新的覆盖掉老的，上面两步处理是为了防止旧的属性中有需要删除的属性，而新的属性中没有
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
export function patch(oldVnode, newVnode) {
    // 没有传oldvnode，说明是组件的挂载

    if (!oldVnode) {
        return createElm(vnode)
    }
    const isRealElement = oldVnode.nodeType
    // console.log(document.getElementsByTagName('body'));
    // oldVnode = document.getElementById('app')

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
        return patchVnode(oldVnode, newVnode)
    }
}

/**
 * 判断两个虚拟节点是不是同一个（标签名和key相同就是同一个）
 * @param {*} vnode1 虚拟节点1
 * @param {*} vnode2 虚拟节点2
 * @returns 
 */
export function isSameVnode(vnode1, vnode2) {
    // if(!vnode1 && vnode2) return false
    return vnode1?.tag === vnode2?.tag && vnode1?.key === vnode2?.key
}


/**
 * 对比两个虚拟节点，并做相应的处理
    * @returns 真实dom
    */
function patchVnode(oldVnode, newVnode) {
    // 进行 diff 算法，更新
    // console.log(oldVnode, newVnode);

    if (!isSameVnode(oldVnode, newVnode)) {
        // 1. 外层节点不同，直接替换，不用比对了
        let el = createElm(newVnode)
        oldVnode.el.parentNode.replaceChild(el, oldVnode.el)
        return el

    }

    let el = newVnode.el = oldVnode.el; // 复用老节点的元素

    // 如果是文本,比较文本的内容(文本的tag都是undefined)
    if (!oldVnode.tag) {
        if (oldVnode.text !== newVnode.text) {
            // bug 修复 newVnode.textContent -> newVnode.text
            el.textContent = newVnode.text
        }
    }

    // 2. 两个节点相同（节点的 tag 和 key 相同），对比节点属性是否相同。没写 key 那 key 的值就是 undefined，也是一样的。（复用老节点，更新差异属性）
    patchProps(el, oldVnode.data, newVnode.data)

    // 3. 外层节点比对完成，比较他们的子节点
    let oldChildren = oldVnode.children || []
    let newChildren = newVnode.children || []

    // 有一边无子节点
    if (oldChildren.length > 0 && newChildren.length > 0) {
        // 完整的 diff，继续比较子节点
        updateChlidren(el, oldChildren, newChildren)
    } else if (newChildren.length > 0) {
        // 新的 vnode 有子节点，旧的没有，直接插入新的子节点
        mountChildren(el, newChildren)
    } else if (oldChildren.length > 0) {
        // 新的 vnode 没有子节点，旧的有，要删除旧的子节点
        unmountChildren(el)
    }

    return el
}


/**
 * 生成新的真实子节点，并将新的子节点挂载到原来的真实父DOM下
 * @param {object} el 挂载点，真实dom
 * @param {Array} newChildren 新的子节点，Vnode
 */
function mountChildren(el, newChildren) {
    for (let i = 0; i < newChildren.length; i++) {
        let child = newChildren[i]
        el.appendChild(createElm(child))
    }
}

/**
 * 删除真实DOM的所有子节点
 * @param {object} el 真实DOM
 */
function unmountChildren(el) {
    el.innerHTML = ''
}


function updateChlidren(el, oldChildren, newChildren) {

    // 双指针比较
    let oldStartIndex = 0
    let newStartIndex = 0
    let oldEndIndex = oldChildren.length - 1
    let newEndIndex = newChildren.length - 1

    let oldStartVnode = oldChildren[0]
    let newStartVnode = newChildren[0]

    let oldEndVnode = oldChildren[oldEndIndex]
    let newEndVnode = newChildren[newEndIndex]

    /**
     * 构造虚拟dom的映射表，key为vnode的key，value为vnode在数组中的索引
     * @param {Array} children 虚拟子节点数组
     * @returns {Object}    映射表
     */
    function makeIndexByKey(children) {
        let map = {}

        children.forEach((child, index) => {
            map[child.key] = index
        })

        return map
    }

    // 构造映射表
    let map = makeIndexByKey(oldChildren)


    // 循环比较
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {

        if (!oldStartVnode) {
            oldStartVnode = oldChildren[++oldStartIndex]
        } else if (!oldEndVnode) {
            oldEndVnode = oldChildren[--oldEndIndex]
        } else if (isSameVnode(oldStartVnode, newStartVnode)) {
            // 头头比较
            patchVnode(oldStartVnode, newStartVnode) // 是相同的节点，就递归比较子节点
            // 指针向中间移动
            oldStartVnode = oldChildren[++oldStartIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldEndVnode, newEndVnode)) {
            // 尾尾比较

            patchVnode(oldEndVnode, newEndVnode)
            oldEndVnode = oldChildren[--oldEndIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else if (isSameVnode(oldEndVnode, newStartVnode)) {
            // 交叉比对  头尾比对，类似abcd->dabc
            patchVnode(oldEndVnode, newStartVnode)
            el.insertBefore(oldEndVnode.el, oldStartVnode.el)
            oldEndVnode = oldChildren[--oldEndIndex]
            newStartVnode = newChildren[++newStartIndex]
        } else if (isSameVnode(oldStartVnode, newEndVnode)) {
            // 尾头比对
            patchVnode(oldStartVnode, newEndVnode)
            el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling)
            oldStartVnode = oldChildren[++oldStartIndex]
            newEndVnode = newChildren[--newEndIndex]
        } else {
            // 乱序，通过映射表查找
            // 通过新vnode的key去查找，如果发现key相同，则说明匹配成功，需要复用，取得需要复用节点在原oldChildren数组中的下标
            let moveIndex = map[newStartVnode.key]
            if (moveIndex !== undefined) {
                let moveVnode = oldChildren[moveIndex]

                // 移动老节点到合适的位置（开始指针的位置）
                el.insertBefore(moveVnode.el, oldStartVnode.el)

                // 将节点置空
                oldChildren[moveIndex] = undefined

                // 比较子节点
                patchVnode(moveVnode, newStartVnode)
            } else {
                // 在旧vnode中找不到匹配节点，直接创建新的dom然后插入
                el.insertBefore(createElm(newStartVnode), oldStartVnode.el)
            }

            newStartVnode = newChildren[++newStartIndex]
        }
    }

    // 循环完之后，如果还剩节点，则直接插入或删除
    // 新 vnode 有剩余，直接追加
    if (newStartIndex <= newEndIndex) {
        for (let i = newStartIndex; i <= newEndIndex; i++) {
            let childEl = createElm(newChildren[i])
            // 可能向前追加，也可能向后追加
            // el.appendChild(childEl)
            let anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null// 如果尾指针后面有元素，那么就向这个元素前面追加

            // !!! anchor 为 null 的时候会认为是 appendChild
            el.insertBefore(childEl, anchor)
        }
    }

    // 旧vnode有剩余需要删除
    if (oldStartIndex <= oldEndIndex) {
        for (let i = oldStartIndex; i <= oldEndIndex; i++) {
            // 处理空节点 undefined
            if (!oldChildren[i]) continue
            // 删除老的节点
            let childEl = oldChildren[i].el
            el.removeChild(childEl)
        }

    }
}