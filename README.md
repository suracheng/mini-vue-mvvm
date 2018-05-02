## vue 源码分析
#### vue 双向数据绑定 => object.defineProperty 数据劫持 + 发布订阅模式监听数据的变化 更新渲染试图
- compile   模版编译
- watcher   数据监听 更新试图
- observer  数据劫持
- mvvm      负责整合


1. 实现一个数据监听器Observer，能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者 
2. 实现一个指令解析器Compile，对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数 
3. 实现一个Watcher，作为连接Observer和Compile的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图 
4. mvvm入口函数，整合以上三者

> [参考文档](https://github.com/DMQ/mvvm/blob/master/readme.md#_2)


