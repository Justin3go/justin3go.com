# Vue3 是如何运行的

##  Dom 操作介绍

![image-20220129100001122](https://oss.justin3go.com/blogs/image-20220129100001122.png)

```javascript
let item = document.getElementsByTagName("h1")[0];
// 进行更新操作
item.textContent = "New Heading"
```

## Virtual DOM

搜索和更新数千个 DOM 节点很明显会变慢，这就是 Vue 和其他类似框架的作用----Virtual DOM

![image-20220129100552930](https://oss.justin3go.com/blogs/image-20220129100552930.png)

Virual Node 是一个 JavaScript 对象，Vue 知道如何使用这些 Virtual Node 并挂载待 DOM 上，它会更新我们在浏览器上看到的内容，每个 VNode 对应一个 DOM 节点，Vue 通过寻找更新 VNode 最小的更新数量，然后再将最优策略施加到实际 DOM 中，从而减少 DOM 操作，提高性能

还有一步<一个渲染函数>：

![image-20220129101003422](https://oss.justin3go.com/blogs/image-20220129101003422.png)

当组件改变时，Render 函数将重新运行，它将创建另一个虚拟节点，然后发送旧的 VNode 和新的 VNode 到 Vue 中进行比较，并以最高效的方式在我们的网页上更新；

![image-20220129101347615](https://oss.justin3go.com/blogs/image-20220129101347615.png)

可以将 Virtual DOM 与 actual DOM 类比为蓝图与实际建筑的关系：

- 当我更改 29 楼的一些数据<家具的布局>
- 我可以拆除 29 楼的一切，重头开始；
- 我还可以创建新的蓝图对比旧的蓝图，并进行更新以尽可能减少工作量

## Vue3 三个核心模块

- Reactive Module
  - 跟踪、观察变化并作出相应的改变
- Compiler Module
  - 获取 HTML 模板并将它们编译成渲染函数
  - 浏览器可以只接收渲染函数
- Render Module
  - Render Phase
  - Mount Phase
  - Patch Phase

![image-20220129111119209](https://oss.justin3go.com/blogs/image-20220129111119209.png)

## 一个简单组件的执行

- 首先编译模块将 HTML 转换为一个渲染函数


- <img src="https://oss.justin3go.com/blogs/image-20220129111603732.png" alt="image-20220129111603732" style="zoom:67%;" />

- 然后初始化响应式对象使用响应式模块：


- <img src="https://oss.justin3go.com/blogs/image-20220129111735770.png" alt="image-20220129111735770" style="zoom:67%;" />

- 渲染模块中，我们进入渲染阶段，调用 render 函数，它引用了响应对象，我们现在观察这个响应对象的变化，render 函数返回一个虚拟 DOM 节点


- <img src="https://oss.justin3go.com/blogs/image-20220129111954115.png" alt="image-20220129111954115" style="zoom:67%;" />

- 挂载阶段调用 mount 函数，使用虚拟 DOM 节点创建 web 界面


- <img src="https://oss.justin3go.com/blogs/image-20220129112042885.png" alt="image-20220129112042885" style="zoom:67%;" />

- 最后，如果我们的响应对象发生任何变化，渲染器再次调用 render 函数，创建一个新的虚拟 DOM 节点，新旧发送补丁函数中，按需更新我们的网页


- <img src="https://oss.justin3go.com/blogs/image-20220129112301023.png" alt="image-20220129112301023" style="zoom:67%;" />


