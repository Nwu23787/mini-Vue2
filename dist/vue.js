(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _iterableToArrayLimit(r, l) {
    var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
    if (null != t) {
      var e,
        n,
        i,
        u,
        a = [],
        f = !0,
        o = !1;
      try {
        if (i = (t = t.call(r)).next, 0 === l) {
          if (Object(t) !== t) return;
          f = !1;
        } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
      } catch (r) {
        o = !0, n = r;
      } finally {
        try {
          if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return;
        } finally {
          if (o) throw n;
        }
      }
      return a;
    }
  }
  function _toPrimitive(t, r) {
    if ("object" != typeof t || !t) return t;
    var e = t[Symbol.toPrimitive];
    if (void 0 !== e) {
      var i = e.call(t, r || "default");
      if ("object" != typeof i) return i;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return ("string" === r ? String : Number)(t);
  }
  function _toPropertyKey(t) {
    var i = _toPrimitive(t, "string");
    return "symbol" == typeof i ? i : i + "";
  }
  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }
  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }
  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }
  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }
  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;
    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
    return arr2;
  }
  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");

  // 匹配 <xxx 开始的标签名，也就是开始标签的前半部分，最终匹配到的分组是开始标签的名字
  var startTagOpen = new RegExp("^<".concat(qnameCapture));

  // 匹配结束标签 </xxx> 最终匹配到的分组是结束标签的名字
  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>"));

  // 匹配标签上的属性，属性的第一个分组是属性的名称（key），第3 | 4 | 5 分组中有一个是他的值
  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;

  // 匹配开始标签的结束部分的 比如 <span> 的>  和 <br/> 的 />
  var startTagClose = /^\s*(\/?)>/;

  // 解析 html
  function parseHTML(html) {
    var ELEMENT_TYPE = 1; // 元素节点类型
    var TXET_TYPE = 3; // 文本节点类型

    var stack = []; // 栈，用于创建语法树时判断节点的父节点
    var currentParent = null; // 栈顶指针，指向栈中的最后一个节点 
    var root = null; // 指向 AST 语法树的根节点

    // 创建语法树节点函数
    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        attrs: attrs,
        children: [],
        parent: null
      };
    }

    // 下面的三个方法都是用于生成抽象语法树的
    // 处理开始标签
    function start(tag, attrs) {
      // 遇到开始标签，入栈
      var node = createASTElement(tag, attrs);
      if (!root) root = node; //还没有根AST节点，那么这个节点就是根节点

      // 栈中最后一个节点就是新节点的父节点
      if (currentParent) {
        node.parent = currentParent;
        currentParent.children.push(node);
      }

      // 节点入栈
      stack.push(node);
      // 移动栈顶指针
      currentParent = node;
    }

    // 处理文本标签
    function chars(text) {
      // 把空文本删掉，实际上源码中是会保存两个空格的，多于两个空格的就删掉了
      text = text.replace(/\s/g, '');
      // 文本标签不用入栈，他就是当前栈顶指针指向的那个开始节点的子节点
      text && currentParent.children.push({
        type: TXET_TYPE,
        text: text,
        parent: currentParent
      });
    }

    // 处理结束标签
    function end(tag) {
      // 遇到结束标签，弹出栈里的最后一个开始节点，并且更新 currentParent
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    // 删除html的前 n 位字符
    function advance(n) {
      html = html.substring(n);
    }
    // 解析开始标签
    function parseStarTag() {
      var start = html.match(startTagOpen); // 得到一个数组，以div为例：['<div','div']，没匹配到，start 为 null
      if (start) {
        // 匹配到了，返回开始标签的对象
        var match = {
          tagName: start[1],
          attrs: []
        };
        // 把匹配过的部分删掉，便于继续向后匹配
        advance(start[0].length);

        // 继续向后匹配，获得开始标签的属性，一直匹配到开始标签的结束位置
        var attr, _end;
        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          // 把匹配到的属性删掉
          if (attr) advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5] // 或的特性，找到第一个真值就不会再继续了
          });
        }
        // 把开始标签的结束位置删掉
        if (_end) {
          advance(_end[0].length);
        }
        return match;
      } else {
        return false;
      }
    }
    // html 一般是以 < 开头的，如果不是以 < 开头的，说明开头是一个文本节点
    while (html) {
      // 如果 textEnd 为 0，说明模版开头是一个标签（开始或结束标签未知）
      // 如果 textEnd 不是 0，说明模版开头是一段文本，textEnd 表示文本节点结束的位置
      var textEnd = html.indexOf('<');
      if (textEnd === 0) {
        //开头是标签，尝试匹配是否为开始标签
        var startTagMatch = parseStarTag();

        // 匹配到了开始标签，也把开始标签从html中删除掉了，需要进行下一轮的匹配了
        if (startTagMatch) {
          // 把开始标签交给生成语法树的函数处理
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } else {
          // 不是开始标签，那么匹配到的一定是结束标签
          var endTagMatch = html.match(endTag);
          if (endTagMatch) {
            // 把结束标签交给生成语法树的函数处理
            end(endTagMatch[1]);
            // 把匹配过的部分删除
            advance(endTagMatch[0].length);
            continue;
          }
        }
      }

      // 处理文本节点
      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 截取文本节点的内容

        if (text) {
          // 把文本节点的内容交给生成语法树的函数处理
          chars(text);
          advance(text.length); // 把文本节点从 html 中删除
        }
      }
    }
    return root;
  }

  // 匹配双花括号 {{value}}
  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g;

  /* 语法树结构
      元素节点结构
   {
       tag: 'div', // 标签名
       type: 1, // 节点类型：1 元素节点 3 文本节点
       attrs: [{ name: 'id', value: 'app' }], // 属性数组
       parent: null, // 父节点，根节点的父节点wei null
       children: [  // 节点下的子节点
           {}, {}
       ]
   }

      文本节结构
   {
      type: 3,
      text,
      parent: currentParent
   }
   */

  // 将 template 模版转化成 AST 语法树

  function genProps(attrs) {
    var str = "";
    var _loop = function _loop() {
      var attr = attrs[i];
      if (attr.name === 'style') {
        // 单独处理style属性，因为要将这个属性封装成对象
        var obj = {};
        attr.value.split(';').forEach(function (item) {
          var _item$split = item.split(':'),
            _item$split2 = _slicedToArray(_item$split, 2),
            key = _item$split2[0],
            value = _item$split2[1];
          obj[key] = value;
        });
        attr.value = obj;
      }
      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    };
    for (var i = 0; i < attrs.length; i++) {
      _loop();
    }
    return "{".concat(str.slice(0, -1), "}");
  }

  // 生成某一子节点的字符串参数
  var genChild = function genChild(item) {
    if (item.type === 1) {
      // 是元素节点，直接调用codegen生成
      return codegen(item);
    } else {
      // 是文本节点
      // 判断文本里面有没有变量，就是 {{}}
      var text = item.text;
      if (!defaultTagRE.test(text)) {
        // 是纯文本节点
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // 文本中有变量
        var tokens = []; //  保存截取的结果
        var match;
        defaultTagRE.lastIndex = 0; // 上面test了，将指针归位
        var lastIndex = 0; // 用于截取非变量文本
        while (match = defaultTagRE.exec(text)) {
          // exec 方法，遇到满足正则的字符串就返回一次
          var index = match.index;
          // 如果这次匹配到结果的开始位置和上一次匹配结束的位置不同，说明这两个位置中间有一个非变量的纯文本
          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }
          // 匹配变量的结果
          tokens.push("_s(".concat(match[1].trim(), ")")); //去掉{{}} 中的空格

          // 移动 lastIndex，保存上一次匹配的最后位置
          lastIndex = index + match[0].length;
        }

        // 循环结束之后，还要判断一次有没有剩余的纯文本
        if (lastIndex < text.length) {
          // 说明上一次匹配之后，还剩余了文本，那么这个文本一定不是变量
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }
        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  };

  // 生成所有子节点的字符串参数
  var genChildren = function genChildren(children) {
    return children.map(function (item) {
      return genChild(item);
    });
  };
  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : 'null').concat(ast.children.length ? ",".concat(children) : '', ")");
    // console.log(code);
    return code;
  }

  // 编译模版，返回render方法
  function compileToFunction(template) {
    // 1. 将 template 模版转化成 AST 语法树
    var ast = parseHTML(template);
    console.log(ast);

    // console.log(ast);
    // 2. 生成 render 方法

    // 目标：把AST语法树组装成下面这样的语法
    // _c 生成元素节点
    // _v 生成文本节点
    // _s 处理变量
    // render(){
    // return _c('div', { id: 'app', style: { "color": 'red' } }, _v(_s(name) + 'hello'), _v('span', null, _v('text1')))
    // }

    var code = codegen(ast);
    console.log(code);
    code = "with(this){\n        return ".concat(code, "\n    }"); // 使用 with，改变变量的取值位置，让函数中的变量都向vm上去取值

    var render = new Function(code); // 使用 new Function 生成 render 函数

    return render;
  }

  var id$1 = 0;
  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);
      this.id = id$1++;
      // 用于收集数据对应的 watcher
      this.subs = [];
    }

    // 将 dep 传递给 watcher，进行去重
    return _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // this.subs.push(Dep.target)
        Dep.target.addDep(this);
      }

      // 给 dep 收集对应的 watcher 依赖
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }

      // 数据更新后，通知 watcher 更新
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);
  }();
  Dep.target = null;

  var id = 0;
  var Watcher = /*#__PURE__*/function () {
    // vm watcher 对应的组件的实例，fn 组件对应的渲染函数
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);
      // 使用 id 来区分不同组件的 watcher
      this.id = id++;
      // 把渲染函数绑定watcher到实例上，调用getter即可重新渲染，更新视图
      this.getter = fn;
      // 标记是否是一个渲染watcher
      this.renderWatcher = options;
      // 收集 watcher 对应的 dep
      this.deps = [];
      // 使用 set 保存 deps 中所有 dep 的id，便于去重操作
      this.depsId = new Set();
      // 调用
      this.get();
    }

    // 渲染函数
    return _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 在渲染开始之前，把 watcher 挂载到全局，也就是 Dep 类上（静态属性）
        Dep.target = this;
        this.getter();
        // 渲染结束，把全局的 watcher 卸载
        Dep.target = null;
      }

      // 给 watch 添加 dep
    }, {
      key: "addDep",
      value: function addDep(dep) {
        // 要判断这个 dep 是否已经被记录，防止重复记录
        var id = dep.id;
        if (!this.depsId.has(id)) {
          // id 不存在与 depsId 中，则这个 dep 没有被 watcher 收集过
          this.deps.push(dep);
          this.depsId.add(id);
          // 让 dep 收集 watcher
          dep.addSub(this);
        }
      }

      // 更新视图
    }, {
      key: "update",
      value: function update() {
        this.get();
      }
    }]);
  }();

  // 构造 VNode 的相关方法

  // 创建元素节点的VNode，即 h()
  function createElement(vm, tag) {
    var data = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    // Vue 实例，标签名，属性，子节点
    if (data == null) {
      data = {};
    }
    var key = data.key;
    if (key) delete data.key;
    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }
    return vnode(vm, tag, key, data, children);
  }

  // 创建文本节点的VNode
  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  // 创建 Vnode  的方法
  function vnode(vm, tag, key, data, children, text) {
    // 返回创建的虚拟 DOM
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
      // 事件、插槽、指令......
    };
  }

  // 和 AST 不一样，AST 只是语法层面的抽象，语法是什么样，AST节点就必须是什么样，不能人为添加一些属性
  // 但是虚拟 DOM 是描述 dom 元素的，可以增加一些自定义的属性
  // AST 是描述语言的
  // 虚拟 DOM 是描述 DOM 的

  // 创建真实DOM
  function createElm(vnode) {
    // 将 VNode 解构
    var tag = vnode.tag,
      data = vnode.data,
      children = vnode.children,
      text = vnode.text;
    if (typeof tag === 'string') {
      // 传入的是标签，文本节点的tag为undefined
      // 创建元素
      // ！！！把真实 DOM 挂载到 虚拟DOM 上！便于后续更新，比如修改了属性，就可以直接找到真实的dom进行更新
      vnode.el = document.createElement(tag);

      // 更新元素属性
      patchProps(vnode.el, data);

      // 创建子DOM
      children.forEach(function (item) {
        // 挂载子DOM
        vnode.el.appendChild(createElm(item));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }
    return vnode.el;
  }

  // 处理属性
  function patchProps(el, props) {
    for (var key in props) {
      // 单独处理style
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
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
  function patch(oldVnode, newVnode) {
    var isRealElement = oldVnode.nodeType;
    // console.log(document.getElementsByTagName('body'));
    // oldVnode = document.getElementById('app')
    // debugger

    if (isRealElement) {
      // 对象上有 nodeType 属性，则为真实 DOM
      var elm = oldVnode;
      var parentElm = elm.parentNode; // 获取到老节点的父节点，便于后面删除和新增（即替换）操作

      // 创建真实 dom
      var newElm = createElm(newVnode);
      console.log(newElm);

      // 先把新 DOM 插入到老DOM的后面，然后再删除老DOM，这样可以保证新DOM替换了老DOM
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      // oldVnode = newElm;

      // return newElm
    }
  }
  function initLifeCycle(Vue) {
    // 生成 Vnode 节点
    Vue.prototype._c = function () {
      return createElement.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    // 处理文本节点
    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    // 处理变量
    Vue.prototype._s = function (name) {
      if (_typeof(name) === 'object') {
        return JSON.stringify(name); // 如果变量是对象，json序列化之后再返回
      }
      return name;
    };

    // 挂载 render 函数到实例上
    Vue.prototype._render = function () {
      return this.$options.render.call(this); // 调用生成的render或者是传入的render，call 用于将this指向vm，使render内的变量向vm上取值
    };

    // 挂载 update 函数到实例上
    Vue.prototype._update = function (vnode) {
      this.$el = document.getElementById('app');
      var el = this.$el;
      // 传入两个参数，第一个参数是真实 dom，第二个参数是虚拟 dom，patch 会按照 vnode 创建一个真实 dom，替换掉我们传入的 el
      return patch(el, vnode); // patch 更新 或者 初始化渲染 方法
    };
  }
  function mountComponent(vm, el) {
    // 将 el 对应的真实 dom 挂载到 vm 上，便于后面获取
    vm.$el = el;
    // // 1. 调用 render 方法，获得虚拟 DOM
    // let vnode = vm._render()
    // console.log(vnode);

    // // 2. 根据虚拟 DOM，生成真实 DOM
    // vm._update(vnode)

    var updateComponent = function updateComponent() {
      // 1. 调用 render 方法，获得虚拟 DOM
      var vnode = vm._render();
      console.log(vnode);

      // 2. 根据虚拟 DOM，生成真实 DOM
      vm._update(vnode);
    };
    var w = new Watcher(vm, updateComponent, true);
    console.log(w);
  }

  // 重写数组中可以改变数组的7个方法，并返回重写后的原型对象
  var oldProto = Array.prototype;
  // 不可以直接修改数组的原型，通过类似于子类重写的方式，使 newProto 的原型指向原来数组的原型，在 newProto 上重写方法不会影响到原数组原型
  var newProto = Object.create(oldProto);
  var methods = ['push', 'pop', 'shift', 'unshift', 'reverse', 'sort', 'splice'];
  methods.forEach(function (method) {
    newProto[method] = function () {
      var _oldProto$method;
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }
      // 调用原有原型上的相同方法，但要注意this问题
      var res = (_oldProto$method = oldProto[method]).call.apply(_oldProto$method, [this].concat(args));
      // 获取到新增的元素
      var newNode = undefined;
      // 对于新增元素的方法，必须给新增的元素添加监听
      if (method === 'push' || method === 'unshift') {
        newNode = args;
      } else if (method === 'splice') {
        // spilce 的参数除掉前两个参数之后，才是新增的元素
        newNode = args.slice(2);
      }
      if (newNode) {
        this.__ob__.observerArray(newNode);
      }
      return res;
    };
  });

  /**
   * 将传入的 data 对象使用 defineproperty 进行劫持
   * @param {Object} data  要实现响应式的对象
   * @returns {} 
   */
  function observe(data) {
    // 判断 data 是否需要劫持，非对象不劫持
    if (_typeof(data) !== 'object' || typeof data == 'null') {
      return;
    }

    // 判断 data 是否已经被监听过了
    if (data.__ob__) return data;

    //通过observer类进行监听
    return new Observer(data);
  }
  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);
      // 把 data 对应的 Observer 实例添加到了 data 上，这样做的话，1 是可以通过监测是否存在_ob_属性来检测 data 是否已被监听过，2 是通过 _ob_ 可以访问到 walk 和 observerArray 以及其他的方法，便于其他地方使用
      // 必须把 _ob_ 设置为不可枚举属性才行，否则在递归遍历监听的时候会死循环
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false
      });
      // 判断data是否为数组，数组不用进行每一项的劫持
      if (Array.isArray(data)) {
        // 通过修改data的原型，重写可以改变数组的方法
        data.__proto__ = newProto;
        this.observerArray(data);
      } else {
        this.walk(data);
      }
    }
    // 遍历对象，进行劫持
    return _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }

      // 实现数组监测
    }, {
      key: "observerArray",
      value: function observerArray(data) {
        //  遍历数组，如果数组的子项是对象的话，要对这个对象进行劫持
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);
  }();
  /**
   * 实现对象指定属性的劫持
   * @param {Object} target 被劫持的对象
   * @param {String} key 需要被劫持的属性
   * @param {*} value 被劫持属性当前的值
   */
  function defineReactive(target, key, value) {
    // 对属性值进行深层递归遍历
    observe(value);
    // 为每个属性绑定一个dep
    var dep = new Dep();
    // 闭包。对外暴露了 set 和 get 方法，从而使 value 值不会被回收
    Object.defineProperty(target, key, {
      // 访问属性的时候，触发get
      get: function get() {
        if (Dep.target) {
          // 全局上存在 watcher，收集这个 watcher
          dep.depend();
        }
        return value;
      },
      // 修改属性的时候，触发set
      set: function set(newValue) {
        console.log('set', newValue);
        if (newValue === value) return;
        // 修改之后重新劫持，因为如果用户将值修改为对象，那么要对这个对象进行深度劫持
        observe(newValue);
        value = newValue;
        // 修改了响应式数据之后，通知观察者更新
        dep.notify();
      }
    });
  }

  /**
   * 初始化状态，分发init
   * @param {Object} vm Vue 实例
   */
  function initState(vm) {
    var opts = vm.$options;
    // 是否传入data
    if (opts.data) {
      initData(vm);
    }
  }

  /**
   * 代理对象，非真正的 Proxy
   * @param {Object} vm Vue 实例
   * @param {String} target 要代理的属性
   * @param {String} key target的建
   */
  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        // 访问 vm[key] 就是在访问 vm._data[key]，即 vm[target][key]
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  /**
   * 初始化 data 选项
   * @param {Object} vm Vue 实例
   */

  function initData(vm) {
    var data = vm.$options.data;
    // 判断 data 的类型，如果是函数，执行它，获得对象。要注意this问题，this应该是Vue实例
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data;
    // 对数据对象进行劫持
    observe(data);
    // 代理一层，方便用户访问
    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  /**
   * 定义 _init 初始化 Vue 方法，并将其挂载到 Vue 实例的原型上，供 Vue 实例调用
   * @param {Object} Vue Vue 实例 
   * @returns {Void}
   */
  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      // this 就是 Vue 实例，经常写 this 太烦，又容易混淆 this，取别名
      var vm = this;
      // 将用户选项挂载到 Vue 实例上，便于其他地方使用
      vm.$options = options;

      // 初始化状态（data、computed、props等等）
      initState(vm);

      // 挂载数据，也就是将数据解析（或者说挂载）到 el 指定的 dom 上
      if (options.el) {
        vm.$mount(options.el);
      }
    };
    Vue.prototype.$mount = function (el) {
      var vm = this;
      // 获取 el 对应的真实 dom
      el = document.querySelector(el);
      var opts = vm.$options;
      if (!opts.render) {
        // 没有传 render 选项
        var template;
        if (!opts.template && el) {
          // 没有传入模版，但传入了el，那么就去找 el 指定的模版
          // 获取到 el 对应的 HTML 结构，也就是模版
          template = el.outerHTML;
        } else {
          if (el) {
            // 传入了模版和 el
            template = opts.template;
          }
        }
        if (template && el) {
          // 编译模版，获取 render
          var render = compileToFunction(template);
          opts.render = render;
        }
      }
      // 如果有模版，则编译成render；反之如果有render，则不必编译。模版和render函数最终都会被统一成render函数
      // console.log(opts.render);

      mountComponent(vm, el); //得到了render 函数之后，执行组件的挂载
    };
  }

  // Vue 实例的构造函数，options 为用户传入的选项（Vue2 的选项式API）
  function Vue(options) {
    // 初始化操作
    this._init(options);
  }
  initMixin(Vue); //将 _init 方法添加到 Vue 实例原型上，供 Vue 实例调用
  initLifeCycle(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
