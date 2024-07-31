# 虚拟 DOM

## 虚拟 DOM 层的一些好处

- 它让组件的渲染逻辑完全从真实 DOM 中解耦
- 更直接地去重用框架的运行在其他环境中
- Vue 运行第三方开发人员创建自定义渲染解决方案，目标不仅仅是浏览器，也包括 IOS 和 Android 等原生环境
- 也可以使用 API 创建自定义渲染器直接渲染到 WebGL,而不是 DOM 节点
- 提供了以编程方式构造、检查、克隆以及操作所需的 DOM 操作的能力

## 渲染函数

> 模板会完成你要做的事，在 99%的情况下你只需写出 HTML 就好了，有时候需要做一些更可控的事情，这种情况下，需要编写一个渲染函数，所以渲染函数是什么样子的呢？

### Vue2 API

```javascript
// 这是组件定义中的一个选项，相比于提供一个 template 选项，你可以为组件提供一个渲染函数，在 Vue2 中，你会得到 h 参数直接作为渲染函数的参数，可以用它创造 vnode
render(h) {
    // vnode 接收的第一个参数是 type
    return h('div', {
        // 第二个参数是一个对象，包含 vnode 上的所有数据或属性；
        // Vue2 中的 API 比较冗长，必须指明传递给节点的绑定类型，如果要绑定属性，你必须把它嵌套在 attrs 对象下，如果要绑定时事件侦听器，你得把它绑定在 on 下面
        attrs: {
            id: 'foo'
        },
        on: {
            click: this.onClick
        }
        // 第三个参数是这个 vnode 的子节点，直接传递一个字符串是一个方便的 API 去表明此节点只包含文本子节点，但它也可以是数组，包含跟多的子节点，这个数组可以嵌套跟多的嵌套 h 调用
    }, 'hello')
}
```

### Vue3 API

- Flat props structure(扁平的 props 结构)
- Globally imported  \`h\` helper(全局导入 h)
  - 因为 Vue2 的 h 需要连续传递，所以设置为全局变量

```javascript
import {h} from 'vue'

render(){
    // 当你调用 h 时，第二个参数现在总是一个扁平的对象，你可以直接给它传递一个属性；
    // 任何带 on 的都会自动绑定为一个监听器，所以不必考虑太多嵌套的问题
    // 大多数时候你也不必考虑是应将其作为 attribute 绑定，还是 DOM 属性绑定，因为 Vue 将智能地找到最好方法
    // 实际上，检查这个 key 是否存在，在原生 DOM 中作为属性，如果存在，我们会将其设置为 property,如果不存在，我们将其设置为一个 attribute
    return h('div', {
        id: 'foo'
        onClick: this.onClick
    }, 'hello')
}
```

## 什么时候去使用渲染函数

### 静态结构的写法

```javascript
import {h} from 'vue'

const App = {
    render(){
        return h('div', {
            id: 'hello'
        })
    }
}
```

```html
上述代码最终会得到类似于以下的代码：
<div id=hello></div>
在最终的 dom 里面
```

然后，你可以给它嵌套更多的嵌套子元素

```javascript
const App = {
    render(){
        return h('div', {
            id: 'hello'
        }, [
            h('span', 'world')
        ])
    }
}
```

```html
上述代码最终会得到类似于以下的代码：
<div id=hello><span>world</span></div>
在最终的 dom 里面
```

### 使用 v-if

```javascript
// 使用是三目表达式或者普通的 if-else，是一样的
const App = {
    render(){
        // v-if="ok"
        return this.ok
            ? h('div', {id: 'hello'}, [h('span', 'world')])
        :this.otherCondition
            ?h('p', 'other branch')
        :h('span')
    }
}
```

### 使用 v-for

```javascript
import {h} from 'vue'

const App = this: {
    render()
    // v-for
    return this.list.map(item => {
        return h('div', {key: item.id}, item.text)
    })
}
```

### 处理插槽

```javascript
import {h} from 'vue'

const App = {
    render(){
        const slot = this.$slot.default
        ?this.$slots.default()
        :[]
    }

}
```

### 例子

假设我们有一个堆栈组件，一些用户界面库可能会有这种情况吗，堆栈组件时布局组件

```vue
<Stack size="4">
        <div>hello</div>
    <Stack size="4">
        <div>hello</div>
        <div>hello</div>
    </Stack>
</Stack>

<div class="stack">
    <div class="mt-4">
		<div>hello</div>
    </div>
    <div class="mt-4">
        <div class="stack">
            <div class="mt-4">
 				<div>hello</div>                 
            </div> 
        </div>
    </div>
</div>
<script>
import {h} from 'vue'
const Stack = {
    render(){
        const slot = this.$slots.default
        ?this.$slots.default()
        :[]
    // 所有内容放进 stack 类中
    return h('div', { class: 'stack'}, slot.map(child =>{
        return h('div', {class: `mt-${this.$props.size}`},[
            child
        ])
    }))
        
    }
}
</script>

```

实际使用：

```vue
<script src="https://unpkg.com/vue@next"></script>
<style>
    .mt-4{
     	margin:10px;   
    }
</style>
<div id="app">
</div>

<script>
const {h,createApp} = Vue

// 使用渲染函数生成的 Stack 组件
const Stack = {
    render(){
        const slot = this.$slots.default
        ?this.$slots.default()
        :[]
    // 所有内容放进 stack 类中
    return h('div', { class: 'stack'}, slot.map(child =>{
        return h('div', {class: `mt-${this.$props.size}`},[
            child
        ])
    }))
        
    }
}
// 使用 Stack 组件
const App = {
    components: {
        Stack
    },    
    template: `    
    <Stack size="4">
    	<div>hello</div>
        <Stack size="4">
            <div>hello</div>
            <div>hello</div>
        </Stack>
    </Stack>`
}

createApp(App).mount('#app')
</script>
```

效果：

![image-20220130145638296](https://oss.justin3go.com/blogs/image-20220130145638296.png)

### 经验：什么时候使用 render

- 当你意识到你想表达的逻辑使用 JavaScript 更容易表达，而不是模板语法
- 当你创作可重用的功能组件时更常见，要跨多个应用程序共享或者组织内部共享
- 你主要在编写特性组件，模板通常是有效的方式
- 模板的好处是更简单，优化通过编译器优化，尤其当你有很多标记的时候
- 它更容易让设计师接管组件并用 CSS 设置样式 

## 创造一个 mount 函数

一些假设让例子更简单：

- 一切都是一个元素
- 调用参数总是一样的顺序（tag, props, children），所以下面有如果你没有任何的属性，你需要在那里传入 null 参数

```html
<div id="app">
    
</div>

<script>
function h(tag, props, children){
    return {
        tag,
        props,
        children
    }
}

// mount 会接收我们所说的 vnode，contianer 是 DOM 元素
function mount(vnode, container){
    // 中间的 vnode.el 是为了后续实现 patchh
    const el = vnode.el= document.createElement(vnode.tag)  // 这给了我们实际的节点对应于虚拟节点
    // props: 如果有，我们需要迭代这些属性把它们分别放在元素上作为 DOM 的 property 或 attribute
    if(vnode.props){
        // 这里为了简单，就假设一切都是 attribute
        for (const key in vnode.props){
            const value= vnode.props[key]
            el.setAttribute(key, value)
        }
    }
    
    // children: 假设这个参数是一个虚拟节点数组或者是一个字符串
    if(vnode.children){
        if(typeof vnode.children === 'string'){
            el.textContent = vnode.children
        }else{
            vnode.children.forEach(child => {
                mount(child, el)
            })
        }
    }
    // 把它插入容器
    container.appendChild(el)
}
    
const vdom = h('div', {class: 'red'},[
    h('span', null, ['hello'])
])

mount(vdom, document.getElementById())
// n1 是旧的虚拟 DOM，之前的快照，n2 是新的虚拟 DOM，是我们现在想要展示在界面的部分
// patch 需要找出最小数量它需要执行的 DOM 操作
function patch(n1, n2){
	...    
}
const vdom2 = h('div', {class: 'green'},[
    h('span', null, ['changed'])
])

patch(vdom, vdom2)

</script>
```

我们渲染了原始组件，把它变成了虚拟 DOM，当一个响应式属性被更新的时候，触发了重新渲染，重新生成了另一个表示形式的虚拟 DOM，然后新旧比较。

## 创建 patch 函数

```html
<div id="app">
    
</div>

<script>
function h(tag, props, children){
    return {
        tag,
        props,
        children
    }
}
function mount(vnode, container){
    const el = vnode.el= document.createElement(vnode.tag)
    if(vnode.props){
        for (const key in vnode.props){
            const value= vnode.props[key]
            el.setAttribute(key, value)
        }
    }
    if(vnode.children){
        if(typeof vnode.children === 'string'){
            el.textContent = vnode.children
        }else{
            vnode.children.forEach(child => {
                mount(child, el)
            })
        }
    }
    container.appendChild(el)
}
    
const vdom = h('div', {class: 'red'},[
    h('span', null, ['hello'])
])

mount(vdom, document.getElementById())
// n1 是旧的虚拟 DOM，之前的快照，n2 是新的虚拟 DOM，是我们现在想要展示在界面的部分
// patch 需要找出最小数量它需要执行的 DOM 操作
function patch(n1, n2){
    // 这里仅讨论相同类型需要做的工作
    if(n1.tag === n2.tag){
        // 中间这部是为了在以后的更新中成为未来的快照
        const el = n2.el = n1.el
        // props 
        // 这里不讨论 n1,n2 的 props 是否为空的四种分支情况
        const oldProps = n1.props || {}
        const newProps = n2.props || {}
        for(const key in newProps){
            const oldValue = oldProps[key]
            const newValue = newProps[key]
            // 只有在实际变化后才会调用，以最小化实际 DOM API 的调用
            if(newValue !== oldValue){
                // 旧的没有，set 会添加，旧的有 key，set 会替换
                el.setAttribute(key, newValue)
            }
        }
        // 接下来讨论 key 不在 newProps 中的时候
        for (const key in oldProps){
            if(!(key in oldProps)){
                el.removeAttribute(key)
            }
        }
        
        // children
        const oldChildren= n1.children
        const newChildren = n2.children
        if(typeof newChildren === 'string'){
            if(typeof oldChildren === 'string'){
                if(newChildren !== oldChildren){
                    el.textContent = newChildren
                }
            }else{
                // 使用文本直接覆盖现有的 DOM 节点并丢弃它们
                el.textContent = newChildren
            }
        }else{  // newC 是 arr 的情况
            if(typeof oldChildren === 'string'){
                el.innreHTML = ''  // 清理，然后这个元素变为空元素
                // 加入
                newChildren,forEach(child => {
                    mount(child, el)
                })
            }else{  // 都是数组的情况
                const commonLength = Math.min(oldChildren.length, newChildren.length)
                for (let i = 0; i < commonLength; i++){
                    patch(oldChildren[i], newChildren[i])
                }
                if(newChildren.length > oldChildren.length){
                    mount(child, el)
                }else if(newwChildren.length < oldChildren.length){
                    oldChildren.slice(newChildren.length).forEach(child => {
                        el.removeChild(child.)
                    })
                }
            }
        }
    }else{
        // repalce
    }
}
const vdom2 = h('div', {class: 'green'},[
    h('span', null, ['changed'])
])

patch(vdom, vdom2)

</script>
```

props:

可以看到，patch 函数做了相当大的工作，遍历了两个对象，但是有了编译器，给了我们很多的提示，完全跳过这一部分是可能的；

children:

Vue 内部比较数组的一种模式

- 键模式：当你使用 v-for 并提供一个 key，key 作为节点位置的提示

  ![image-20220131104733552](https://oss.justin3go.com/blogs/image-20220131104733552.png)


