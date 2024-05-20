import { compileToFunction } from "./compiler/index"
import { initMixin } from "./init"
import { initLifeCycle } from "./lifecycle"
import Watcher, { nextTick } from "./observe/watcher"
import { initStateMixin } from "./state"
import { createElm, patch } from "./vdom/patch"

// Vue 实例的构造函数，options 为用户传入的选项（Vue2 的选项式API）
function Vue(options) {
    // 初始化操作
    this._init(options)
}

initMixin(Vue) //将 _init 方法添加到 Vue 实例原型上，供 Vue 实例调用
initLifeCycle(Vue)
initStateMixin(Vue)


// 测试用代码
let render1 = compileToFunction(`<ul key="a" style="color:red">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
</ul>`)
let render2 = compileToFunction(`<ul key="a" style="color:black;background:yellow">
    <li key="a">a</li>
    <li key="b">b</li>
    <li key="c">c</li>
    <li key="d">d</li>
</ul>`)
let vm1 = new Vue({
    data: {
        name: 'zs'
    }
})

let preVnode = render1.call(vm1)
// console.log(preVnode);

let el = createElm(preVnode)

document.body.appendChild(el)





let vm2 = new Vue({
    data: {
        name: '666'
    }
})

let nextVnode = render2.call(vm2)
// console.log(nextVnode);
let newEl = createElm(nextVnode)

setTimeout(() => {
    patch(preVnode, nextVnode)
    // el.parentNode.replaceChild(newEl, el)
}, 1000);




export default Vue