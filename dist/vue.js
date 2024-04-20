(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

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
        node.parent = currentParent;
        if (currentParent) currentParent.children.push(node);

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
      console.log(root);
    }

    // 编译模版，返回render方法
    function compileToFunction(template) {
      // 1. 将 template 模版转化成 AST 语法树
      parseHTML(template);

      // 2. 生成 render 方法
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
      // 闭包。对外暴露了 set 和 get 方法，从而使 value 值不会被回收
      Object.defineProperty(target, key, {
        // 访问属性的时候，触发get
        get: function get() {
          console.log('get', value);
          return value;
        },
        // 修改属性的时候，触发set
        set: function set(newValue) {
          console.log('set', newValue);
          if (newValue === value) return;
          // 修改之后重新劫持，因为如果用户将值修改为对象，那么要对这个对象进行深度劫持
          observe(newValue);
          value = newValue;
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
          if (template) {
            // 编译模版，获取 render
            var render = compileToFunction(template);
            opts.render = render;
          }
        }

        // 如果有模版，则编译成render；反之如果有render，则不必编译。模版和render函数最终都会被统一成render函数
      };
    }

    // Vue 实例的构造函数，options 为用户传入的选项（Vue2 的选项式API）
    function Vue(options) {
      // 初始化操作
      this._init(options);
    }
    initMixin(Vue); //将 _init 方法添加到 Vue 实例原型上，供 Vue 实例调用

    return Vue;

}));
//# sourceMappingURL=vue.js.map
