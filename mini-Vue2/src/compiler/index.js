import { parseHTML } from "./parse"



// 匹配双花括号 {{value}}
const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g

// 将 template 模版转化成 AST 语法树

function genProps(attrs) {
    let str = ``
    for (let i = 0; i < attrs.length; i++) {
        let attr = attrs[i]
        if (attr.name === 'style') {
            // 单独处理style属性，因为要将这个属性封装成对象
            let obj = {}
            attr.value.split(';').forEach(item => {
                let [key, value] = item.split(':')
                obj[key] = value
            })
            attr.value = obj
        }
        str += `${attr.name}:${JSON.stringify(attr.value)},`
    }
    return `{${str.slice(0, -1)}}`
}

// 生成某一子节点的字符串参数
const genChild = (item) => {
    if (item.type === 1) {
        // 是元素节点，直接调用codegen生成
        return codegen(item)
    } else {
        // 是文本节点
        // 判断文本里面有没有变量，就是 {{}}
        let text = item.text
        if (!defaultTagRE.test(text)) {
            // 是纯文本节点
            return `_v(${JSON.stringify(text)})`
        } else {
            // 文本中有变量
            let tokens = [] //  保存截取的结果
            let match
            defaultTagRE.lastIndex = 0 // 上面test了，将指针归位
            let lastIndex = 0 // 用于截取非变量文本
            while (match = defaultTagRE.exec(text)) { // exec 方法，遇到满足正则的字符串就返回一次
                let index = match.index
                // 如果这次匹配到结果的开始位置和上一次匹配结束的位置不同，说明这两个位置中间有一个非变量的纯文本
                if (index > lastIndex) {
                    tokens.push(JSON.stringify(text.slice(lastIndex, index)))
                }
                // 匹配变量的结果
                tokens.push(`_s(${match[1].trim()})`) //去掉{{}} 中的空格

                // 移动 lastIndex，保存上一次匹配的最后位置
                lastIndex = index + match[0].length
            }

            // 循环结束之后，还要判断一次有没有剩余的纯文本
            if (lastIndex < text.length) {
                // 说明上一次匹配之后，还剩余了文本，那么这个文本一定不是变量
                tokens.push(JSON.stringify(text.slice(lastIndex)))
            }
            return `_v(${tokens.join('+')})`
        }
    }
}

// 生成所有子节点的字符串参数
const genChildren = (children) => {
    return children.map(item => genChild(item))
}

function codegen(ast) {
    let children = genChildren(ast.children)
    let code = `_c('${ast.tag}',${ast.attrs.length > 0 ? genProps(ast.attrs) : 'null'}${ast.children.length ? `,${children}` : ''})`
    // console.log(code);
    return code
}


// 编译模版，返回render方法
export function compileToFunction(template) {
    // 1. 将 template 模版转化成 AST 语法树
    let ast = parseHTML(template)

    // 2. 生成 render 方法

    let code = codegen(ast)

    code = `with(this){
        return ${code}
    }` // 使用 with，改变变量的取值位置，让函数中的变量都向vm上去取值

    let render = new Function(code) // 使用 new Function 生成 render 函数

    return render
}