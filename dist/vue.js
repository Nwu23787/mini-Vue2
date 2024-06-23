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
    code = "with(this){\n        return ".concat(code, "\n    }"); // 使用 with，改变变量的取值位置，让函数中的变量都向vm上去取值

    var render = new Function(code); // 使用 new Function 生成 render 函数

    return render;
  }

  // 合并策略
  var strats = {};
  var LIFECYCLE = ['beforeCreated', 'created', 'beforeMounted', 'mounted', 'beforeUpdate', 'update', 'beforeDestroy', 'destroyed'];
  LIFECYCLE.forEach(function (hook) {
    strats[hook] = function (parent, child) {
      // hook 的合并策略
      if (child) {
        if (parent) {
          // 新旧都有，合并，拼接在一起
          return parent.concat(child);
        } else {
          // 旧的里面没有，将传入的新的包装成数组
          return [child];
        }
      } else {
        // 新的没有，不用合并
        return p;
      }
    };
  });

  // 合并两个对象，合并mixin时用到
  function mergeOptions(parent, child) {
    var options = {};

    // 合并老的，其实就是将{create:fn()} => {create:[fn]}，数组化
    for (var key in parent) {
      mergeField(key);
    }
    for (var _key in child) {
      if (!parent.hasOwnProperty(_key)) {
        // 不合并已经合并过的属性
        mergeField(_key);
      }
    }

    // 合并options，优先后传入的mixin
    function mergeField(key) {
      if (strats[key]) {
        // 有相应的策略，按照策略合并
        options[key] = strats[key](parent[key], child[key]);
      } else {
        // 策略模式，针对不同的属性采取不同的合并策略
        options[key] = child[key] || parent[key];
      }
    }
    return options;
  }

  function initGlobalAPI(Vue) {
    Vue.options = {};
    Vue.mixin = function (mixin) {
      // 合并原有的钩子和传进来的钩子
      this.options = mergeOptions(this.options, mixin);
      return this;
    };

    //使用基础 Vue 构造器，创建一个“子类”。参数是一个包含组件选项的对象。手动创造组件
    Vue.extend = function (options) {
      // 返回的子类
      function Sub() {
        var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
        // 初始化子类
        this._init(options);
      }

      // 子类继承父类,new Sub 的时候，会执行init方法
      Sub.prototype = Object.create(Vue.prototype);
      // create 继承会改变子类的constractor
      Sub.prototype.constructor = Sub;
      // 保存用户传递的选项
      Sub.options = options;
      return Sub;
    };
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
  var stack = [];

  /**
   * watcher 入栈
   * @param {Object} this watcher 
   */
  function pushTarget(watcher) {
    stack.push(watcher);
    Dep.target = watcher; // 全局记录
  }

  /**
   * watcher 出栈
   * @param {Object} this watcher 
   */
  function popTarget() {
    stack.pop();
    Dep.target = stack[stack.length - 1];
  }

  var id = 0;
  var Watcher = /*#__PURE__*/function () {
    // vm watcher 对应的组件的实例，fn 组件对应的渲染函数
    function Watcher(vm, exprOrFn, options, cb) {
      _classCallCheck(this, Watcher);
      // 使用 id 来区分不同组件的 watcher
      this.id = id++;
      if (typeof exprOrFn === 'string') {
        // exprOrFn 若为字符串，改成函数
        this.getter = function () {
          return vm[exprOrFn];
        };
      } else {
        // 把渲染函数绑定watcher到实例上，调用getter即可重新渲染，更新视图
        this.getter = exprOrFn;
      }

      // 标记是否是一个渲染watcher
      this.renderWatcher = options;
      // 收集 watcher 对应的 dep
      this.deps = [];
      // 使用 set 保存 deps 中所有 dep 的id，便于去重操作
      this.depsId = new Set();
      // 是否为懒 watcher
      this.lazy = options.lazy;
      //计算属性的缓存值
      this.dirty = this.lazy;
      // 初始化调用
      this.value = this.lazy ? undefined : this.get();
      // 记录 vm
      this.vm = vm;
      // 记录回调
      this.cb = cb;
      // 判断是不是用户自己创建的 watcher，也就是 watch 对应的 watcher
      this.user = options.user;
    }

    // 执行传入的回调函数
    return _createClass(Watcher, [{
      key: "get",
      value: function get() {
        // 在渲染开始之前，把 watcher 挂载到全局，也就是 Dep 类上（静态属性）
        pushTarget(this);
        var value = this.getter.call(this.vm);
        // 渲染结束，把当前的 watcher 出栈
        popTarget();
        return value;
      }

      // 计算属性求值
    }, {
      key: "evaluate",
      value: function evaluate() {
        // 获取到用户定义的 get 方法的返回值
        this.value = this.get();
        this.dirty = false;
      }
      // 计算属性用，让每一个计算属性的依赖收集上层 watcher
    }, {
      key: "depend",
      value: function depend() {
        for (var i = this.deps.length - 1; i >= 0; i--) {
          this.deps[i].depend(this);
        }
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
        // 如果是计算属性依赖的值发生变化，标志脏值，下次取值会重新计算
        if (this.lazy) {
          this.dirty = true;
        } else {
          // 把当前的 watcher 暂存在队列中
          queueWatcher(this);
        }
      }

      // 执行渲染逻辑
    }, {
      key: "run",
      value: function run() {
        var oldValue = this.value;
        var newValue = this.get();
        if (this.user) {
          this.cb.call(this.vm, oldValue, newValue);
        }
      }
    }]);
  }(); // 缓存 watcher 队列
  var queue = [];
  // 去重的辅助对象，源码中没用 set，用的是对象
  var has = [];
  // 防抖
  var pending = false;

  // 刷新 watcher 队列
  function flushSchedulerQueue() {
    // 拷贝一份queue，如果在更新的过程中产生了新的 watcher，会加入到 queue 队列中，下一次清空队列时才执行，不会在这一次执行
    var flushQueue = queue.slice(0);
    queue = [];
    has = {};
    pending = false;
    flushQueue.forEach(function (item) {
      return item.run();
    });
  }
  function queueWatcher(watcher) {
    // 通过判断watcher的id进行去重，避免同一个组件多次刷新
    var id = watcher.id;
    if (!has[id]) {
      // 没有重复
      queue.push(watcher);
      has[id] = true;
      // 在第一次加入 watcher 之后，就会将刷新队列的任务加入
      if (!pending) {
        nextTick(flushSchedulerQueue);
        pending = true;
      }
    }
  }

  // nextTick 的任务排队
  var callbacks = [];
  // 防抖
  var waiting = false;
  // 清空调度队列
  function flushCallbacks() {
    var cds = callbacks.slice(0);
    waiting = false;
    callbacks = [];
    cds.forEach(function (cb) {
      return cb();
    });
  }

  // nextTick 优雅降级
  var timerFunc;
  if (Promise) {
    timerFunc = function timerFunc() {
      Promise.resolve().then(flushCallbacks);
    };
  } else if (MutationObserver) {
    var observer = new MutationObserver(flushCallbacks);
    var textNode = document.createTextNode(1);
    observer.observe(textNode, {
      characterData: true
    });
    timerFunc = function timerFunc() {
      textNode.textContent = 2;
    };
  } else if (setImmediate) {
    timerFunc = function timerFunc() {
      setImmediate(flushCallbacks);
    };
  } else {
    timerFunc = function timerFunc() {
      setTimeout(flushCallbacks, 0);
    };
  }
  function nextTick(cb) {
    callbacks.push(cb);
    if (!waiting) {
      timerFunc();
      waiting = true;
    }
  }

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
      // ！！！把真实 DOM 挂载到 虚拟DOM 上！便于后续更新，比如修改了属性，就可以直接找到真实的dom进行更新，挂载在 el 属性上
      vnode.el = document.createElement(tag);

      // 更新元素属性
      patchProps(vnode.el, {}, data);

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
  function patchProps(el) {
    var oldProps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var props = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var oldStyles = oldProps.style || {};
    var newStyles = props.style || {};

    // 循环旧的style样式，看看新的样式中是否还存在这个样式
    for (var key in oldStyles) {
      // 新的vnode中没有这个样式了，从el上删除这个样式
      if (!newStyles[key]) {
        el.style[key] = '';
      }
    }

    // 循环旧的属性,查看新的属性中是否还存在这个属性
    for (var _key in oldProps) {
      if (!props[_key]) {
        // 新的vnode中没有这个属性，从el上删除这个属性
        el.removeAttribute(_key);
      }
    }

    // 用新的覆盖掉老的，上面两步处理是为了防止旧的属性中有需要删除的属性，而新的属性中没有
    for (var _key2 in props) {
      // 单独处理style
      if (_key2 === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(_key2, props[_key2]);
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

      // 先把新 DOM 插入到老DOM的后面，然后再删除老DOM，这样可以保证新DOM替换了老DOM
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm);
      // oldVnode = newElm;

      // return newElm
    } else {
      return patchVnode(oldVnode, newVnode);
    }
  }

  /**
   * 判断两个虚拟节点是不是同一个（标签名和key相同就是同一个）
   * @param {*} vnode1 虚拟节点1
   * @param {*} vnode2 虚拟节点2
   * @returns 
   */
  function isSameVnode(vnode1, vnode2) {
    // if(!vnode1 && vnode2) return false
    return (vnode1 === null || vnode1 === void 0 ? void 0 : vnode1.tag) === (vnode2 === null || vnode2 === void 0 ? void 0 : vnode2.tag) && (vnode1 === null || vnode1 === void 0 ? void 0 : vnode1.key) === (vnode2 === null || vnode2 === void 0 ? void 0 : vnode2.key);
  }

  /**
   * 对比两个虚拟节点，并做相应的处理
      * @returns 真实dom
      */
  function patchVnode(oldVnode, newVnode) {
    // 进行 diff 算法，更新
    // console.log(oldVnode, newVnode);

    if (!isSameVnode(oldVnode, newVnode)) {
      // 1. 外层节点不同，直接替换，不用比对了
      var _el = createElm(newVnode);
      oldVnode.el.parentNode.replaceChild(_el, oldVnode.el);
      return _el;
    }
    var el = newVnode.el = oldVnode.el; // 复用老节点的元素

    // 如果是文本,比较文本的内容(文本的tag都是undefined)
    if (!oldVnode.tag) {
      if (oldVnode.text !== newVnode.text) {
        // bug 修复 newVnode.textContent -> newVnode.text
        el.textContent = newVnode.text;
      }
    }

    // 2. 两个节点相同（节点的 tag 和 key 相同），对比节点属性是否相同。没写 key 那 key 的值就是 undefined，也是一样的。（复用老节点，更新差异属性）
    patchProps(el, oldVnode.data, newVnode.data);

    // 3. 外层节点比对完成，比较他们的子节点
    var oldChildren = oldVnode.children || [];
    var newChildren = newVnode.children || [];

    // 有一边无子节点
    if (oldChildren.length > 0 && newChildren.length > 0) {
      // 完整的 diff，继续比较子节点
      updateChlidren(el, oldChildren, newChildren);
    } else if (newChildren.length > 0) {
      // 新的 vnode 有子节点，旧的没有，直接插入新的子节点
      mountChildren(el, newChildren);
    } else if (oldChildren.length > 0) {
      // 新的 vnode 没有子节点，旧的有，要删除旧的子节点
      unmountChildren(el);
    }
    return el;
  }

  /**
   * 生成新的真实子节点，并将新的子节点挂载到原来的真实父DOM下
   * @param {object} el 挂载点，真实dom
   * @param {Array} newChildren 新的子节点，Vnode
   */
  function mountChildren(el, newChildren) {
    for (var i = 0; i < newChildren.length; i++) {
      var child = newChildren[i];
      el.appendChild(createElm(child));
    }
  }

  /**
   * 删除真实DOM的所有子节点
   * @param {object} el 真实DOM
   */
  function unmountChildren(el) {
    el.innerHTML = '';
  }
  function updateChlidren(el, oldChildren, newChildren) {
    console.log(oldChildren, newChildren);

    // 双指针比较
    var oldStartIndex = 0;
    var newStartIndex = 0;
    var oldEndIndex = oldChildren.length - 1;
    var newEndIndex = newChildren.length - 1;
    var oldStartVnode = oldChildren[0];
    var newStartVnode = newChildren[0];
    var oldEndVnode = oldChildren[oldEndIndex];
    var newEndVnode = newChildren[newEndIndex];

    /**
     * 构造虚拟dom的映射表，key为vnode的key，value为vnode在数组中的索引
     * @param {Array} children 虚拟子节点数组
     * @returns {Object}    映射表
     */
    function makeIndexByKey(children) {
      var map = {};
      children.forEach(function (child, index) {
        map[child.key] = index;
      });
      return map;
    }

    // 构造映射表
    var map = makeIndexByKey(oldChildren);
    console.log(map);

    // 循环比较
    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      // console.log(oldStartVnode,newStartVnode);
      // debugger

      if (!oldStartVnode) {
        oldStartVnode = oldChildren[++oldStartIndex];
      } else if (!oldEndVnode) {
        oldEndVnode = oldChildren[--oldEndIndex];
      } else if (isSameVnode(oldStartVnode, newStartVnode)) {
        // 头头比较
        patchVnode(oldStartVnode, newStartVnode); // 是相同的节点，就递归比较子节点
        // 指针向中间移动
        oldStartVnode = oldChildren[++oldStartIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldEndVnode, newEndVnode)) {
        // 尾尾比较

        patchVnode(oldEndVnode, newEndVnode);
        oldEndVnode = oldChildren[--oldEndIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else if (isSameVnode(oldEndVnode, newStartVnode)) {
        // 交叉比对  头尾比对，类似abcd->dabc
        patchVnode(oldEndVnode, newStartVnode);
        el.insertBefore(oldEndVnode.el, oldStartVnode.el);
        oldEndVnode = oldChildren[--oldEndIndex];
        newStartVnode = newChildren[++newStartIndex];
      } else if (isSameVnode(oldStartVnode, newEndVnode)) {
        // 尾头比对
        patchVnode(oldStartVnode, newEndVnode);
        el.insertBefore(oldStartVnode.el, oldEndVnode.el.nextSibling);
        oldStartVnode = oldChildren[++oldStartIndex];
        newEndVnode = newChildren[--newEndIndex];
      } else {
        // 乱序，通过映射表查找
        // 通过新vnode的key去查找，如果发现key相同，则说明匹配成功，需要复用，取得需要复用节点在原oldChildren数组中的下标
        var moveIndex = map[newStartVnode.key];
        if (moveIndex !== undefined) {
          var moveVnode = oldChildren[moveIndex];

          // 移动老节点到合适的位置（开始指针的位置）
          el.insertBefore(moveVnode.el, oldStartVnode.el);

          // 将节点置空
          oldChildren[moveIndex] = undefined;

          // 比较子节点
          patchVnode(moveVnode, newStartVnode);
        } else {
          // 在旧vnode中找不到匹配节点，直接创建新的dom然后插入
          el.insertBefore(createElm(newStartVnode), oldStartVnode.el);
        }
        newStartVnode = newChildren[++newStartIndex];
      }
    }

    // 循环完之后，如果还剩节点，则直接插入或删除
    // 新 vnode 有剩余，直接追加
    if (newStartIndex <= newEndIndex) {
      for (var i = newStartIndex; i <= newEndIndex; i++) {
        var childEl = createElm(newChildren[i]);
        // 可能向前追加，也可能向后追加
        // el.appendChild(childEl)
        var anchor = newChildren[newEndIndex + 1] ? newChildren[newEndIndex + 1].el : null; // 如果尾指针后面有元素，那么就向这个元素前面追加

        // !!! anchor 为 null 的时候会认为是 appendChild
        el.insertBefore(childEl, anchor);
      }
    }

    // 旧vnode有剩余需要删除
    if (oldStartIndex <= oldEndIndex) {
      for (var _i = oldStartIndex; _i <= oldEndIndex; _i++) {
        // 处理空节点 undefined
        if (!oldChildren[_i]) continue;
        // 删除老的节点
        var _childEl = oldChildren[_i].el;
        el.removeChild(_childEl);
      }
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
      var vm = this;
      this.$el = document.getElementById('app');
      var el = this.$el;

      // 保存上一次渲染的vnode到vm上
      var preVnode = vm._vnode;
      if (preVnode) {
        // 之前渲染过，传递上一次的vnode
        vm.$el = patch(preVnode, vnode);
      } else {
        //第一次渲染，传真实的el
        vm.$el = patch(el, vnode);
      }
      vm._vnode = vnode; // 将组件第一次产生的vnode保存到实例上
      // 传入两个参数，第一个参数是真实 dom，第二个参数是虚拟 dom，patch 会按照 vnode 创建一个真实 dom，替换掉我们传入的 el
      // return vm.$el = patch(el, vnode) // patch 更新 或者 初始化渲染 方法
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

      // 2. 根据虚拟 DOM，生成真实 DOM
      vm._update(vnode);
    };
    new Watcher(vm, updateComponent, true);
  }

  /**
   * 调用并执行vm上的钩子方法
   * @param {Object} vm Vue实例
   * @param {Array} hook vm的钩子方法
   */
  function callHook(vm, hook) {
    var handlers = vm.$options[hook];
    if (handlers) {
      handlers.forEach(function (fn) {
        fn.call(vm);
      });
    }
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

      // 通知对应 watcher ，数组发生了变化
      this.__ob__.dep.notify();
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
      // data 可能是对象或者数组，在这给 data 新增属性 dep，让他去收集依赖
      // 给每个对象都增加收集依赖功能
      this.dep = new Dep();

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
   * 递归解决数组嵌套，视图更新
   * @param {*} value 
   */
  function dependArray(value) {
    for (var i = 0; i < value.length; i++) {
      var current = value[i];
      // 数组中的数组也要收集当前这个 watcher，数组中的数组值发生变化，当前组件也要刷新
      current.__ob__ && current.__ob__.dep.depend();
      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  /**
   * 实现对象指定属性的劫持
   * @param {Object} target 被劫持的对象
   * @param {String} key 需要被劫持的属性
   * @param {*} value 被劫持属性当前的值
   */
  function defineReactive(target, key, value) {
    // 对属性值进行深层递归遍历
    var childOb = observe(value); // childOb.dep 用来收集依赖
    // 为每个属性绑定一个dep
    var dep = new Dep();
    // 闭包。对外暴露了 set 和 get 方法，从而使 value 值不会被回收
    Object.defineProperty(target, key, {
      // 访问属性的时候，触发get
      get: function get() {
        if (Dep.target) {
          // 全局上存在 watcher，收集这个 watcher
          dep.depend();
          if (childOb) {
            childOb.dep.depend();
            if (Array.isArray(value)) {
              dependArray(value);
            }
          }
        }
        return value;
      },
      // 修改属性的时候，触发set
      set: function set(newValue) {
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
    // 是否使用计算属性
    if (opts.computed) {
      initComputed(vm);
    }
    // 初始化 watch
    if (opts.watch) {
      initWatch(vm);
    }
  }

  /**
   * 初始化 watch 选项
   * @param {*} vm Vue实例
   */
  function initWatch(vm) {
    var watch = vm.$options.watch;

    // 取出 watch 中的每一个属性
    for (var key in watch) {
      var handler = watch[key]; // 可能是数组、字符串、函数
      if (Array.isArray(handler)) {
        //如果是数组，则循环创建 watcher
        for (var i = 0; i < handler.length; i++) {
          createWatcher(vm, key, handler[i]);
        }
      } else {
        createWatcher(vm, key, handler);
      }
    }
  }

  /**
   * 
   * @param {*} vm Vue 实例
   * @param {*} key 监听的属性
   * @param {*} handler 属性变化执行的回调
   * @returns 
   */
  function createWatcher(vm, key, handler) {
    // 可能是字符串、函数
    if (typeof handler == 'string') {
      handler = vm[handler];
    }
    return vm.$watch(key, handler);
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
   * 初始化处理 computed 选项
   * @param {*} vm Vue实例
   */
  function initComputed(vm) {
    var computed = vm.$options.computed;
    var wacthers = vm._computedWatchers = {}; // 存储所有计算属性的 watcher，并保存到 vm 上
    // computed 中书写的可能是对象，也可能是函数
    for (var key in computed) {
      var userDef = computed[key];
      var fn = typeof userDef === 'function' ? userDef : userDef.get;
      // 为每一个计算属性创建一个 watcher，每次调用 watcher 时，执行 get 方法获取最新值
      wacthers[key] = new Watcher(vm, fn, {
        lazy: true
      }); // new Watcher 默认会执行一次 fn，但 computed 默认是不初始化的，所以加入 lazy 配置项

      // 把 computed 中定义的变量挂载到 vm 上去
      defineComputed(vm, key, userDef);
    }
  }

  /**
   * 将 computed 中的属性挂载到 vm 上
   * @param {Object} target vm
   * @param {string} key 要挂载的属性
   * @param {Object} userDef 用户传入的计算属性对象
   */
  function defineComputed(target, key, userDef) {
    typeof userDef === 'function' ? userDef : userDef.get;
    var setter = userDef.set || function () {};
    Object.defineProperty(target, key, {
      get: createComputedGetter(key),
      set: setter
    });
  }

  /**
   * 加入了缓存（脏值监测）的get方法
   * @param {string} key 计算属性变量名
   * @returns 加入了脏值监测机制的 get 方法
   */
  function createComputedGetter(key) {
    return function () {
      // 获取到对应计算属性的watcher
      var watcher = this._computedWatchers[key];
      // 如果是脏值，那么重新执行用户定义的 get 方法，进行计算
      if (watcher.dirty) {
        // 是脏值
        watcher.evaluate();
      }
      if (Dep.target) {
        // 计算属性 watcher 出栈之后，如果还栈中还存在 watcher ，那么继续收集上层 watcher
        // 要让计算属性中的 watcher 所对应的响应式数据，也去收集渲染 watcher。换句话说就是，收集了计算属性 watcher 的数据，也必须收集当前的渲染 watcher，
        // 这样才能实现数据变化，页面自动重新渲染
        watcher.depend();
      }
      return watcher.value;
    };
  }
  function initStateMixin(Vue) {
    Vue.prototype.$nextTick = nextTick;
    /**
     * $watch API
     * @param {string | function} exprOrFn 字符串或者函数
     * @param {Function} cb watch的回调函数
     */
    Vue.prototype.$watch = function (exprOrFn, cb) {
      // exprOrFn 变化直接执行 cd 回调
      new Watcher(this, exprOrFn, {
        user: true
      }, cb);
    };
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
      debugger;
      // 将用户选项挂载到 Vue 实例上，便于其他地方使用
      vm.$options = mergeOptions(this.constructor.options, options); // mergeOPtions，合并当前传入的options和Vue的全局options（也就是我们混入的mixin的options）

      // beforeCreated 生命周期
      callHook(vm, 'beforeCreated');

      // 初始化状态（data、computed、props等等）
      initState(vm);

      // created 生命周期
      callHook(vm, 'created');

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
  initStateMixin(Vue);
  initGlobalAPI(Vue);

  return Vue;

}));
//# sourceMappingURL=vue.js.map
