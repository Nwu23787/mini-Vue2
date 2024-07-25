export default class Module {
    constructor(module) {
        this._raw = module
        this._children = {}
        this.state = module.state
    }

    /**
     * 获取子模块
     * @param {String} key 子模块名称
     * @returns 子模块
     */
    getChild(key) {
        return this._children[key]
    }

    /**
     * 添加子模块
     * @param {String} key 子模块名称
     * @param {Object} val 子模块
     */
    addChild(key, val) {
        this._children[key] = val
    }

    /**
     * 遍历 mutations 中的方法，每次遍历执行传入的回调
     * @param {Function} cb 每次遍历需要执行的回调
     */
    forEachMutations(cb) {
        Object.keys(this._raw.mutations || {}).forEach(key => {
            cb(key, this._raw.mutations[key])
        })
    }


    /**
     * 遍历 actions 中的方法，每次遍历执行传入的回调
     * @param {Function} cb 每次遍历需要执行的回调
     */
    forEachActions(cb) {
        Object.keys(this._raw.actions || {}).forEach(key => {
            cb(key, this._raw.actions[key])
        })
    }


    /**
     * 遍历 getters，每次遍历执行传入的回调
     * @param {Function} cb 每次遍历需要执行的回调
     */
    forEachGetters(cb) {
        Object.keys(this._raw.getters || {}).forEach(key => {
            cb(key, this._raw.getters[key])
        })
    }

    
    /**
     * 遍历子模块，每次遍历执行传入的回调
     * @param {Function} cb 每次遍历需要执行的回调
     */
    forEachChildren(cb) {
        Object.keys(this._children).forEach(key => {
            cb(key, this._children[key])
        })
    }
}