class Compile {
    constructor (el, vm) {
        this.el = this.isElementNode(el) ? el : document.querySelector(el);
        this.vm = vm;

        if (this.el) { // 如果可以获取到这个元素 做编译处理
            
            // 1. 先把真实的 dom 移到内存中 fragment
            let fragment = this.node2Fragment(this.el);

            // 2. 编译 => 提取想要的元素节点 v-model 和 文本节点 {{}}
            this.compile(fragment); // 编译模版
            
            // 3. 把编译好的 fragment 塞到页面中去
            this.el.appendChild(fragment);
        }

    }


    /* 核心方法 */
    // 需要将 el 中的内容全部放到内存中去
    node2Fragment (el) {
        let fragment = document.createDocumentFragment();
        let firstChild;

        while (firstChild = el.firstChild) {
            fragment.appendChild(firstChild);
        }
        return fragment; // 内存中的节点
    }

    compile (fragment) {
        // 需要递归循环拿到每一层的子节点
        let childNodes = fragment.childNodes;
        Array.from(childNodes).forEach( node => {
            if (this.isElementNode(node)) {
                // 如果是元素节点, 编译元素节点
                this.compileElement(node);
                // 还需要继续深入检查
                this.compile(node);
            } else {
                // 文本节点 {{xxx}}  编译文本
                this.compileText(node);
            }
        } );
    }

    // 编译元素节点
    compileElement (node) {
        // 规定：指令以 v-xxx 命名
        // 如 <span v-text="content"></span> 中指令为 v-text
        let attrs = node.attributes; // 获取指定节点的属性集合  如 {0: v-text, v-text: v-text, length: 1}

        Array.from(attrs).forEach( attr => {
            // 判断属性是不是包含 v-
            let attrName = attr.name; // attr => v-text='song'
            if (this.isDirective(attrName)) { // 判断包不包含 v- 指令
                // 取出对应的值放入到节点中
                let expr = attr.value;   //  message
                let [, type] = attrName.split('-');
                // CompileUtil['text'](node, this.vm, expr);
                CompileUtil[type](node, this.vm, expr);
            }

        } )
    }

    // 编译文本节点 {{xxx}}
    compileText (node) {
        let expr = node.textContent; // 取出文本中的内容

        let reg = /\{\{([^}]+)\}\}/g;
        if (reg.test(expr)) {
            CompileUtil['text'](node, this.vm, expr);
        }
    }


    /** 专门写一些辅助方法 */
    isElementNode (node) {
        return node.nodeType === 1;
    }
    // 判断是不是指令
    isDirective (name) {
        return name.includes('v-');
    }

}

// 指令处理集合
CompileUtil = {
    // 获取实例上对应的数据
    getVal (vm, expr) {
        expr = expr.split('.');
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    },

    // 获取编译文本后的结果
    getTextVal (vm, expr) {
        return expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            return this.getVal(vm, arguments[1].trim());
        });
    },

    setval (vm, expr, value) {
        expr = expr.split('.');
        // 
        return expr.reduce( (prev, next, currentIndex) => {
            if (currentIndex === (expr.length - 1) ) {
                prev[next] = value;
            }
            return prev[next]
        } , vm.$data);
    },

    // 文本处理
    text (node, vm, expr) {
        let updateFn = this.updater['textUpdater'];
        // 'message.a' => [message, a]
        let value = this.getTextVal(vm,expr);

        expr.replace(/\{\{([^}]+)\}\}/g, (...arguments) => {
            new Watcher(vm, arguments[1].trim(), (newValue) => {
                // 如果数据变化了， 文本节点需要重新获取依赖的数据更新文本中的内容 
                updateFn && updateFn(node, this.getTextVal(vm, newValue));
            })
        });

        
        updateFn && updateFn(node, value);
    },

    // 输入框处理
    modal (node, vm, expr) {
        let updateFn = this.updater['modelUpdater'];

        // 这里应该加一个监控， 数据变化了应该调用 watcher 的 callback
        new Watcher(vm, expr, (newValue) => {
            // 当值变化后回调用 cb 将新的值传递过来（默认不调用， 调用 update 时才会执行）
            updateFn && updateFn(node, this.getVal(vm, expr));
        });
        node.addEventListener('input', (e) => {
            let newValue = e.target.value;
            this.setval(vm, expr, newValue);
        });
        updateFn && updateFn(node, this.getVal(vm, expr));
    },

    updater : {
        // 文本更新
        textUpdater (node, value) {
            node.textContent = value;
        },

        // 输入框更新
        modelUpdater (node, value) {
            node.value = value;
        }
    }

}