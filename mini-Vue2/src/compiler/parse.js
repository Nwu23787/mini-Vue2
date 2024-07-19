const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`

// 匹配 <xxx 开始的标签名，也就是开始标签的前半部分，最终匹配到的分组是开始标签的名字
const startTagOpen = new RegExp(`^<${qnameCapture}`)

// 匹配结束标签 </xxx> 最终匹配到的分组是结束标签的名字
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)

// 匹配标签上的属性，属性的第一个分组是属性的名称（key），第3 | 4 | 5 分组中有一个是他的值
const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/

// 匹配开始标签的结束部分的 比如 <span> 的>  和 <br/> 的 />
const startTagClose = /^\s*(\/?)>/

// 解析 html
export function parseHTML(html) {
    const ELEMENT_TYPE = 1 // 元素节点类型
    const TXET_TYPE = 3 // 文本节点类型

    let stack = [] // 栈，用于创建语法树时判断节点的父节点
    let currentParent = null; // 栈顶指针，指向栈中的最后一个节点 
    let root = null // 指向 AST 语法树的根节点

    // 创建语法树节点函数
    function createASTElement(tag, attrs) {
        return {
            tag,
            type: ELEMENT_TYPE,
            attrs,
            children: [],
            parent: null
        }
    }

    // 下面的三个方法都是用于生成抽象语法树的
    // 处理开始标签
    function start(tag, attrs) {
        // 遇到开始标签，入栈
        let node = createASTElement(tag, attrs)

        if (!root) root = node //还没有根AST节点，那么这个节点就是根节点

        // 栈中最后一个节点就是新节点的父节点
        if (currentParent) {
            node.parent = currentParent
            currentParent.children.push(node)
        }

        // 节点入栈
        stack.push(node)
        // 移动栈顶指针
        currentParent = node
    }

    // 处理文本标签
    function chars(text) {
        // 把空文本删掉，实际上源码中是会保存两个空格的，多于两个空格的就删掉了
        text = text.replace(/\s/g, '')
        // 文本标签不用入栈，他就是当前栈顶指针指向的那个开始节点的子节点
        text && currentParent.children.push({
            type: TXET_TYPE,
            text,
            parent: currentParent
        })
    }

    // 处理结束标签
    function end(tag) {
        // 遇到结束标签，弹出栈里的最后一个开始节点，并且更新 currentParent
        stack.pop()
        currentParent = stack[stack.length - 1]
    }

    // 删除html的前 n 位字符
    function advance(n) {
        html = html.substring(n)
    }
    // 解析开始标签
    function parseStarTag() {
        const start = html.match(startTagOpen) // 得到一个数组，以div为例：['<div','div']，没匹配到，start 为 null
        if (start) {
            // 匹配到了，返回开始标签的对象
            const match = {
                tagName: start[1],
                attrs: []
            }
            // 把匹配过的部分删掉，便于继续向后匹配
            advance(start[0].length)

            // 继续向后匹配，获得开始标签的属性，一直匹配到开始标签的结束位置
            let attr, end
            while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
                // 把匹配到的属性删掉
                if (attr) advance(attr[0].length)
                match.attrs.push({
                    name: attr[1],
                    value: attr[3] || attr[4] || attr[5] // 或的特性，找到第一个真值就不会再继续了
                })
            }
            // 把开始标签的结束位置删掉
            if (end) {
                advance(end[0].length)
            }

            return match
        } else {
            return false
        }
    }
    // html 一般是以 < 开头的，如果不是以 < 开头的，说明开头是一个文本节点
    while (html) {
        // 如果 textEnd 为 0，说明模版开头是一个标签（开始或结束标签未知）
        // 如果 textEnd 不是 0，说明模版开头是一段文本，textEnd 表示文本节点结束的位置
        let textEnd = html.indexOf('<')

        if (textEnd === 0) {
            //开头是标签，尝试匹配是否为开始标签
            const startTagMatch = parseStarTag()

            // 匹配到了开始标签，也把开始标签从html中删除掉了，需要进行下一轮的匹配了
            if (startTagMatch) {
                // 把开始标签交给生成语法树的函数处理
                start(startTagMatch.tagName, startTagMatch.attrs)
                continue
            }
            else {
                // 不是开始标签，那么匹配到的一定是结束标签
                const endTagMatch = html.match(endTag)
                if (endTagMatch) {
                    // 把结束标签交给生成语法树的函数处理
                    end(endTagMatch[1])
                    // 把匹配过的部分删除
                    advance(endTagMatch[0].length)
                    continue
                }
            }
        }

        // 处理文本节点
        if (textEnd > 0) {
            let text = html.substring(0, textEnd) // 截取文本节点的内容

            if (text) {
                // 把文本节点的内容交给生成语法树的函数处理
                chars(text)
                advance(text.length) // 把文本节点从 html 中删除
            }
        }
    }
    return root
}