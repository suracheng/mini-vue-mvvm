class Observer {
    constructor (data) {
        this.observer(data);
    }

    observer (data) { // { message: 'hello world' }
        // 要对 data 数据将原有的属性改成 set 和 get 的形式
        if (!data || typeof data !== 'object') return;

        // 要将数据一一劫持 先获取到 data 的 key 和 value
        // Object.keys 不会遍历到原型链上的属性
        Object.keys(data).forEach( key => {
            // 对数据添加  getter 和 setter 进行数据劫持
            this.defineReactive(data, key, data[key]);

            // 递归深度劫持
            this.observer(data[key]);
        } )
    }

    // 定义响应式 , 对数据添加  getter 和 setter 进行数据劫持
    defineReactive (obj, key, value) {
        let that = this;
        let dep = new Dep(); // 每个变化的数据 ，都会对应一个数组 这个数组是存放所有更新的操作
        Object.defineProperty(obj, key, {
            enumerable: true,   // 可枚举
            configurable: true, // 属性可配置

            // 取值的时候获取
            get () {
                Dep.target && dep.addSub(Dep.target);
                return value;
            },

            set (newVal) {
                // 当给 data 属性中设置值的时候 更改获取属性的值
                if (newVal !== value) {
                    // 这里的 this 不是实例
                    // console.log('xxxxxthis', this, that); 
                    that.observer(newVal); // 如果是对象继续劫持
                    value = newVal;
                    dep.notify(); // 通知所有人 数据更新了
                }
            }

        });
    }

}


// 发布订阅
class Dep {
    constructor () {
        // 订阅的数组
        this.subs = [];
    }

    addSub (watcher) {
        this.subs.push(watcher);
    }   

    notify () {
        this.subs.forEach( watcher => watcher.update() )
    }
}