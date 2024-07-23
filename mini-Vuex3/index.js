import install from "./install"
import ModuleCollection from "./module/module-collection";

class Store {
    constructor(options) {
        // 由于 modules 嵌套，需要预处理这些模块，获取模块间的父子关系。即模块收集
        this._modules = new ModuleCollection(options)
    }
}


export default { Store, install }