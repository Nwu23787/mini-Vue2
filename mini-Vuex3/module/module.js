export default class Module {
    constructor(module) {
        this._raw = module
        this._children = {}
        this.state = module.state
    }

    getChild(key) {
        return this._children[key]
    }

    addChild(key, val) {
        this._children[key] = val
    }
}