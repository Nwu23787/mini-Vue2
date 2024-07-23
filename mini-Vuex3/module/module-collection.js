import Module from "./module"

// 收集模块间的父子关系，形成树形结构
export default class ModuleCollection {
    // 参考 AST 语法树的生成，通过栈来匹配模块间的父子关系
    constructor(options) {
        this.root = null
        this.register([], options)
    }

    /**
     * 递归构建模块父子关系
     * @param {Array} path 路径，记录了模块从根模块到该模块的路径
     * @param {Object} options 模块
     */
    register(path, rootModule) {
        // _raw 用于保存原本的模块
        let newModule = new Module(rootModule)

        if (!this.root) {
            // root 无值，当前模块是根模块，根模块不可能是其他模块的子模块
            this.root = newModule
        } else {
            // 不是根模块，需要维护模块间的父子关系
            // 通过 path 找当前模块的父模块是谁，从根模块 root 开始找
            let parent = this.root
            path.slice(0, -1).forEach(key => {
                // 按照 path 一层层去寻找父级
                parent = parent.getChild(key)
            })
            // 找到了父级模块，将子模块添加给父级模块
            parent.addChild(path[path.length - 1], newModule)
        }

        if (rootModule.modules) {
            // 如果传入的模块有 modules 选项，需要递归处理子模块
            Object.keys(rootModule.modules).forEach(key => {
                this.register(path.concat(key), rootModule.modules[key])
            })
        }
    }
}