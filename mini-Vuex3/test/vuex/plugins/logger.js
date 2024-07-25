export default function logger(store) {
    /**
     * 去除对象的响应式
     * @param {Object} obj 响应式对象
     * @returns Objec 去除了响应式的对象
     */
    function delObserve(obj) {
        return JSON.parse(JSON.stringify(obj))
    }
    // 保存执行前的状态
    let preState = delObserve(store.state)

    store.subscribe(function (mutation, state) {
        let nextState = delObserve(state)
        const date = new Date()
        const time = `${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.${date.getMilliseconds()}`
        let collapsedStr = `mutation ${mutation.type} @ ${time}`
        console.groupCollapsed(collapsedStr)
        console.log('%c prev state', 'color: #9E9E9E; font-weight: bold', preState)
        console.log('%c mutation', 'color: #03A9F4; font-weight: bold', mutation)
        console.log('%c next state', 'color: #4CAF50; font-weight: bold', nextState)
        console.groupEnd()

        preState = nextState
    })
}
