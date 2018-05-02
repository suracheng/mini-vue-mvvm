class Watcher {
    constructor (vm, expr, cb) {
        this.vm = vm;
        this.expr = expr;
        this.cb = cb;
        
        // 先获取一下老的值
        this.value = this.get();

    }

    getVal (vm, expr) {
        expr = expr.split('.');
        return expr.reduce((prev, next) => {
            return prev[next];
        }, vm.$data);
    }

    get () {
        Dep.target = this;     // 将当前订阅者指向自己
        let value = this.getVal(this.vm, this.expr);  // 触发 getter，添加自己到属性订阅器中
        Dep.target = null;    // 添加完毕，重置
        return value;
    }

    // 对外暴露的方法
    update () {
        let newValue = this.getVal(this.vm, this.expr);
        let oldValue = this.value;
        if (newValue != oldValue) {
            this.cb(newValue); // 调用 watch 的 callback
        }
    }




}

/**
 * 观察者的目的 就是给需要变化的那个元素增加一个观察者，当数据变化后执行对应的变化
 * 用新值和老值进行比对， 如果大声变化 就调用更新方法
 * 
 */

// vm.$watch(vm, 'a', function () {}) 