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

    forEachMutations(cb) {
        Object.keys(this._raw.mutations || {}).forEach(key => {
            cb(key, this._raw.mutations[key])
        })
    }

    forEachActions(cb) {
        Object.keys(this._raw.actions || {}).forEach(key => {
            cb(key, this._raw.actions[key])
        })
    }

    forEachGetters(cb) {
        Object.keys(this._raw.getters || {}).forEach(key => {
            cb(key, this._raw.getters[key])
        })
    }

    forEachChildren(cb) {
        Object.keys(this._children).forEach(key => {
            cb(key, this._children[key])
        })
    }
}