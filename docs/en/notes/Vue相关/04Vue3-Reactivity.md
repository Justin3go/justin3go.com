# Vue3 Reactivity

## Reactivity

### 作用

- 学习 Vue3 的响应式原理；
- 提高调试能力；
- 使用响应式这个模块进行一些骚操作；
- 为 Vue 做贡献

### Vue 是如何知道更新这些模板的呢？

<img src="https://oss.justin3go.com/blogs/image-20220123102005969.png" alt="image-20220123102005969" style="zoom:80%;" />

当 price 发生改变，Vue 知道怎么更新这些模板。

<img src="https://oss.justin3go.com/blogs/image-20220123102240097.png" alt="image-20220123102240097" style="zoom:80%;" />

**JavaScript 并不会更新！**



### 自己实现一个响应式原理

基本思路：当价格或者数量更新时，让它再跑一次；

<img src="https://oss.justin3go.com/blogs/image-20220123113221300.png" alt="image-20220123113221300" style="zoom:80%;" />

```javascript
// effct 这个函数就是让 total 重新计算一次；
let effect = () => {total  = price * quantity}  // 缩短上述中间代码
```

```javascript
let dep = new Set()  // 去储藏 effect，保证不会添加重复值
```

<img src="https://oss.justin3go.com/blogs/image-20220123113709364.png" alt="image-20220123113709364" style="zoom:80%;" />

- 其中**track()**函数是添加这个数据；
- 而**trigger()**函数<触发函数>会遍历我们存的每一个 effect，然后运行它们；

<img src="https://oss.justin3go.com/blogs/image-20220123113835384.png" alt="image-20220123113835384" style="zoom:80%;" />

### 如何存储，让每个属性拥有自己的依赖

通常，我们的对象会有多个属性，每个属性都需要自己的 dep(依赖关系)，或者说 effect 的 Set；

<img src="https://oss.justin3go.com/blogs/image-20220126142931144.png" alt="image-20220126142931144" style="zoom:80%;" />

<img src="https://oss.justin3go.com/blogs/image-20220126142943696.png" alt="image-20220126142943696" style="zoom:80%;" />

- dep 就是一个 effect 集(Set)，这个 effect 集应该在值发生改变时重新运行；

<img src="https://oss.justin3go.com/blogs/image-20220126143323286.png" alt="image-20220126143323286" style="zoom:80%;" />

- 要把这些 dep 储存起来，且方便我们以后再找到它们，我们需要创建有一个 depsMap，它是一张存储了每个属性其 dep 对象的图；

- **使用对象的属性名作为键，比如数量和价格，值就是一个 dep(effects 集)**

- 代码实现：

 ```javascript
  const depsMap = new Map()
  
  function track(key) {
      // key 值就是刚才的价格或者数量
      let dep = depsMap.get(key);  // 找到属性的依赖
      if (!dep){  //如果没有，就创建一个
          depsMap.set(key, (dep = new Set()))
      }
      dep.add(effect)  // 添加 effect，注意 dep(Set)会去重
  }
 ```

 ```javascript
  function trigger(key) {
      let dep = depsMap.get(key) // 找到键值的依赖
      if (dep) {  // 如果存在，遍历并运行每个 effect
          dep.forEach(effect => {
              effect()
          })
      }
  }
 ```

 ```javascript
  // main
  let product = { price: 5, quantity: 2};
  let total = 0;
  let effect = () => {
      total = product.price * product.quantity;
  }
  // 存储 effect
  track('quantity')
  effect()
 ```

- 结果：

 <img src="https://oss.justin3go.com/blogs/image-20220126144609965.png" alt="image-20220126144609965" style="zoom:80%;" />

### 如果我们有多个响应式对象呢？

<img src="https://oss.justin3go.com/blogs/image-20220126145012663.png" alt="image-20220126145012663" style="zoom:80%;" />

之前的是这样：

<img src="https://oss.justin3go.com/blogs/image-20220126145115743.png" alt="image-20220126145115743" style="zoom:80%;" />

这里 depsMap 是对每个属性进行存储，再上一层，我们需要对每个对象进行存储，其中每个对象包括了不同的属性，所以我们在这之上有用了一张表(Map)，来存储每个对象；

<img src="https://oss.justin3go.com/blogs/image-20220126145414088.png" alt="image-20220126145414088" style="zoom:80%;" />

Vue3 中这个图叫做**targetMap**，需要注意的是这个数据结构是 WeakMap<就是键值为空时会被垃圾回收机制清除，就是响应式对象消失后，这里面存的相关依赖也会被自动清除>

```javascript
const targetMap = new WeakMap();  // 为每个响应式对象存储依赖关系
// 然后 track()函数就需要首先拿到 targetMap 的 depsMap
function track(target, key) {
    let depsMap = targetMap.get(target);  // target 是响应式对象的名称，key 是对象中属性的名称
    if (!depsMap){  // 不存在则为这个对象创建一个新的 deps 图
        targetMap.set(target, (depsMap = new Map())
    };
    let dep = depsMap.get(key);  // 获取属性的依赖对象，和之前的一致了
    if(!dep){  //同样不存在就创建一个新的
        depsMap.set(key, (dep = new Set()))
    };
    dep.add(effect);
}
```

```javascript
function trigger(target, key){
    const depsMap = targetMap.get(target) // 检查对象是否有依赖的属性
    if(!depsMap){return}  // 如果没有则立即返回
    let dep = depsMap.get(key)  // 检查属性是否有依赖的关系
    // 如果有的话将遍历 dep，运行每个 effect
    if (dep){
        dep.forEach(effect => {effect()})
    }
}
```

```javascript
// main
let product = {price: 5, quantity: 2}
let total = 0
let effect = () => {
    total = product.price * product.quantity
}
track(product, "quantity")
effect()
```

运行：

<img src="https://oss.justin3go.com/blogs/image-20220126152655606.png" alt="image-20220126152655606" style="zoom: 67%;" />

### 总结

响应式就是在每次更新值的时候重新计算一次，但是由于某些依赖什么什么的，某些对象对应的属性会导致另外的变量变化，所以需要一些数据结构去记录这些变化，就形成了下面的这些表(Map, Set)

<img src="https://oss.justin3go.com/blogs/image-20220126152722481.png" alt="image-20220126152722481" style="zoom:80%;" />

但目前我们还没有办法让我们的 effect 自动重新运行，这将在后续讲到；

## 代理与反射

### 引入

> 上一部分我们使用 track()与 trigger()显式构造了响应式引擎，这部分我们希望其**自动**跟踪和触发；

需求：

- 访问了产品的属性或者说使用了 get 方法，就是我们想要调用 track 去保存 effect 的时候
- 产品的属性改变或者说使用了 set 方法，就是我们想要调用 trigger 来运行那些保存了的 effect

解决：

- Vue2 中，使用的是 ES5 中的 Object.defineProperty()去拦截 get 或 set;
- Vue3 中，使用的是 ES6 中的**代理和反射**去实现相同的效果；

### 代理与反射基础

通常我们会用三种方法获取某个对象中的属性：

- ```javascript
  let product = {price: 5, quantity: 2};
  product.quantity
  ```

- ```javascript
  product[quantity]
  ```

- ```javascript
  Reflect.get(product, ‘quantity’)
  ```

如下图所示，在打印的时候，调用顺序：它会先调用代理，简单来说就是一个对象委托，其中代理的第二个参数是一个处理函数，如下图所示我们可以在其中打印某字符串；

<img src="https://oss.justin3go.com/blogs/image-20220126160220363.png" alt="image-20220126160220363" style="zoom:80%;" />

下面直接完全更改了 get 的默认行为，通常我们仅仅需要在原始行为上添加某些代码，这时候就需要反射来调用原始的行为了；

然后这里的 log 会调用 get 方法，而 get 方法在代理中有，所以就不会再往上找了，下图中箭头就停止了；

<img src="https://oss.justin3go.com/blogs/image-20220126160447599.png" alt="image-20220126160447599" style="zoom:80%;" />

在**代理中使用反射**我们需要额外增加一个参数(receiver 接收器传递到我们的 Relect 调用之中)，它保证了当我们的对象有继承自其他对象的值或者函数时，this 指针能正确地指向；

<img src="https://oss.justin3go.com/blogs/image-20220126160943979.png" alt="image-20220126160943979" style="zoom:80%;" />

然后，我们对 set 进行拦截：

<img src="https://oss.justin3go.com/blogs/image-20220126161218123.png" alt="image-20220126161218123" style="zoom:80%;" />

运行调用：

<img src="https://oss.justin3go.com/blogs/image-20220126161252986.png" alt="image-20220126161252986" style="zoom:80%;" />

### 封装

<img src="https://oss.justin3go.com/blogs/image-20220126163845367.png" alt="image-20220126163845367" style="zoom:80%;" />

输出：

<img src="https://oss.justin3go.com/blogs/image-20220126163905584.png" alt="image-20220126163905584" style="zoom:80%;" />

### 加入 track 和 trigger

然后我们回到原来的代码，我们需要调用 track 和 trigger：

回忆一下：

- track 的作用：将属性值(key)对应的 effect 加入到集合中；
- track 加入到 get：<结合下下方的总体运行流程>比如我定义了一个响应式对象，其中包含单价与数量两个属性，然后后面我定义了一个变量 total=product.price+product.quantity；这里就调用了 get，即 price 与 quantity 的变化会影响到 total 这个变量，get 中调用 track 将这个计算代码保存到集合中；
- trigger 的作用：把所有的 effect 函数重新运行一次；
- trigger 加入到 set：在每次值变化的时候，运行对应的 effect 函数，比如单价变化时(执行 set)，总价也会被 effect 函数重新计算；

<img src="https://oss.justin3go.com/blogs/image-20220126164110745.png" alt="image-20220126164110745" style="zoom:80%;" />

### 总体运行流程

<img src="https://oss.justin3go.com/blogs/image-20220126164732248.png" alt="image-20220126164732248" style="zoom:80%;" />



## ActiveEffect&Ref

> 上一部分中的 track 会去遍历 target<响应式对象>中的属性值，以及各种依赖，以确保当前的 effect 会被记录保存下来，但这并不是我们想要的，我们只应该在 effect 里调用追踪函数<就是只有在 effect 里面使用响应式对象的属性才会被保存记录下来，而不是在 effect 里面使用的，比如 log 一下就不会被记录保存，不会调用 track()函数去跟踪，这是我们需要实现的效果>；

首先我们引入了一个**activeEffect**变量，它是现在正在运行中的 effect(这也是 Vue3 解决这个问题的方法)

```javascript
let activeEffect = null
```

```javascript
function effect(eff){
    activeEffect = eff
    activeEffect()
    activeEffect = null
}
// 这个函数与直接调用传入的 eff 函数有什么区别，也就是多个 activeEffect 变量去保存有什么作用？<下面会用这个变量去判断一些东西>
// 配合下面的 if 来解决最开始的问题<避免遍历>
```

然后我们调用这个函数，这意味着我们不需要使用下面的 effect()函数了，因为它会在上述函数中的 activeEffect()步骤中被调用：

<img src="https://oss.justin3go.com/blogs/image-20220126174246881.png" alt="image-20220126174246881" style="zoom:80%;" />

现在我们需要更新追踪函数(track function)，让它去使用这个新的 activeEffect：

- 首先，我们只想在我们有 activeEffect 时运行这段代码：
- 当我们添加依赖时，我们要添加 activeEffect

<img src="https://oss.justin3go.com/blogs/image-20220126174725003.png" alt="image-20220126174725003" style="zoom:80%;" />

测试(添加更多的变量或对象)

当 product.price = 10 的时候，很明显上面的两个 effect 都会运行；

<img src="https://oss.justin3go.com/blogs/image-20220126175001415.png" alt="image-20220126175001415" style="zoom:80%;" />

运行结果：

<img src="https://oss.justin3go.com/blogs/image-20220126175110881.png" alt="image-20220126175110881" style="zoom:80%;" />

我们会发现当使用 salePrice 计算总数时，它会停止工作：

<img src="https://oss.justin3go.com/blogs/image-20220126195329134.png" alt="image-20220126195329134" style="zoom:80%;" />

因为在这种情况下，当销售价格确定时，需要重新计算总数，这是不可能的，因为 salePrice 并不是响应式的<salePrice 的变化并不会导致 total 重新计算>；

<img src="https://oss.justin3go.com/blogs/image-20220126195539657.png" alt="image-20220126195539657" style="zoom:80%;" />

**如何实现：**

我们会发现这是一个使用 Ref 的好地方；

```javascript
let salePrice = ref(0)
```

Ref 接受一个值并返回一个响应的、可变的 Ref 对象，Ref 对象只有一个“.value”属性，它指向内部的值，

![image-20220126201713062](https://oss.justin3go.com/blogs/image-20220126201713062.png)

**现在我们考虑如何定义 Ref()**

1.我们可以简单的使用 reactive，将键 value 设置为初始值：

```javascript
function ref(intialValue) {
    return reactive({value: intialValue})
}
```

2.<Vue3 中的解决方法>JavaScript 中的计算属性：

这里会使用到**对象访问器**：对象访问器是获取或设置值的函数<getter 和 setter>

<img src="https://oss.justin3go.com/blogs/image-20220126202347266.png" alt="image-20220126202347266" style="zoom:80%;" />

接下来使用对象访问器来定义 Ref：

```javascript
function ref(raw) {
    const r = {
        get value(){
            track(r, 'value')  // 在这里调用 track 函数
            return raw
        }
        set value(newVal){
            raw = newVal
            trigger(r, 'value')  // 在这里调用 trigger 函数
        }
    return r
    }
}
```

下面来测试一下是否正常：

<img src="https://oss.justin3go.com/blogs/image-20220126220152532.png" alt="image-20220126220152532" style="zoom:80%;" />

当更新 quantity 时，total 会变；当更新 price 时，total 也会随着 salePrice 改变。

<img src="https://oss.justin3go.com/blogs/image-20220126220437673.png" alt="image-20220126220437673" style="zoom:80%;" />

**有个疑问：**就是在实际使用 Vue3 的时候，只有 reactive 与 ref，并没有看到定义 effect，所以 track 中加入的 effect 是哪来的？就是源码中应该还对 effect 进行了一些封装或者什么其他操作?

## Compute&Vue3-Source

> 也许我们这里的销售价格和总价应该使用计算属性

<img src="https://oss.justin3go.com/blogs/image-20220126220849545.png" alt="image-20220126220849545" style="zoom:80%;" />

我们应该如何定义计算方法呢？

> 计算属性或计算值和 reactive 与 Ref 是非常相似--依赖的属性变化了，结果就跟着变化...

- 创建一个响应式引用，称为 result；
- 在 effect 中运行 getter，因为我们需要监听响应值，然后把其(getter)赋值于 result.value；
- 返回结果

<img src="https://oss.justin3go.com/blogs/image-20220126221344846.png" alt="image-20220126221344846" style="zoom:80%;" />

- 下面是实际代码：

- ```javascript
  function computed(getter) {
      let result = ref()
      effect(() => (result.value = getter()))
      return result
  }
  ```

- 测试结果如下：

- <img src="https://oss.justin3go.com/blogs/image-20220126221641178.png" alt="image-20220126221641178" style="zoom:80%;" />

对比 Vue2 的响应式：

> 在 Vue2 中，我们在创建了一个响应式对象之后，是无法再添加新的响应式属性，这里明显是更为强大的；
>
> <img src="https://oss.justin3go.com/blogs/image-20220126221907530.png" alt="image-20220126221907530" style="zoom:80%;" />
>
> 因为这个名字不是响应式的，Vue2 中，get 和 set 钩子是被添加到各个属性下的，所以当我们要增加新的属性时，还需要做其他事情：
>
> <img src="https://oss.justin3go.com/blogs/image-20220126222133614.png" alt="image-20220126222133614" style="zoom:80%;" />

但是，现在使用了代理，意味着我们可以添加新属性，然后它们会自动变成响应式

<img src="https://oss.justin3go.com/blogs/image-20220126222318450.png" alt="image-20220126222318450" style="zoom:80%;" />

查看源码：

<img src="https://oss.justin3go.com/blogs/image-20220126222741056.png" alt="image-20220126222741056" style="zoom:80%;" />



## Q&A

### 问题一

> 在 Vue2 中，我们会调用 depend 去保存代码(函数)，并用 notify 去跑保存了的代码(函数)；但在 Vue3 中，我们调用的是 track 和 trigger，原因？
>
> <img src="https://oss.justin3go.com/blogs/image-20220127100144427.png" alt="image-20220127100144427" style="zoom:80%;" />

- 根本上，它们仍然做的是同样的事；一个更大的区别是当你给它们取名字的时候，depend 和 notify 是与所有者(Dep，一个依赖实例)相关的动词，可以说是一个依赖实例被依赖或者说它正在通知它的订阅者(subcribers)
- 在 Vue3 中，我们对依赖的关系的实现做了一点变更，从技术上讲已经没有 Dep 类了，deopend 和 notify 的逻辑现在被抽离到两个独立函数(track 和 trigger)里，当我们调用 track 和 trigger 时，它们更像是在跟踪什么而不是什么东西被依赖(a.b-->b.call(a))

### 问题二

> 在 Vue2 中，我们有一个独立的 Dep 类；在 Vue3 的时候，我们只有一个 Set，为什么做出这样的改变？
>
> <img src="https://oss.justin3go.com/blogs/image-20220127103447967.png" alt="image-20220127103447967" style="zoom:80%;" />

- Vue2 中的 Dep 类更容易让我们思考依赖关系作为一个对象有着某种行为
- 但在 Vue3 中，我们抽离 depend 和 notify 到 track 和 trigger，现在是两个独立的功能，那么类本身就只剩下一个集合了，这时候，再用一个类去封装这个 Set 类本身就是没有意义的了，所以可以直接去声明它，而不是让一个对象去做；
- 性能的原因，这个类真的就不需要了

### 问题三

> 你是如何得到这个解决方案的(Vue3 中处理响应式的方法)?
>
> <img src="https://oss.justin3go.com/blogs/image-20220127104725587.png" alt="image-20220127104725587" style="zoom:80%;" />

- 在 ES5 中使用 getter 与 setter 中的时候，当你遍历对象上的键时(forEach)，会自然有一个小小的闭包为属性存储关联的 Dep;
- 在 Vue3 中，使用 Proxy 之后，Proxy 的处理函数会直接接收目标和键，你并没有得到真正的闭包为每个属性存储关联依赖项；
- 我们需要的时给定一个目标对象和一个该对象上的键，我们如何始终找到对应的依赖实例，唯一的办法就是把它们分到两个不同等级的嵌套图；
- targetMap 的名字就来自于 Proxy

### 问题四

> 定义 Ref 的时候可以，可以通过返回一个 reactive 去定义 Ref，这种方法与 Vue3 源码中使用对象访问器去实现它有什么不同？
>
> <img src="https://oss.justin3go.com/blogs/image-20220127105552236.png" alt="image-20220127105552236" style="zoom:80%;" />

- 首先根据 Ref 的定义应该只暴露一个属性(值本身)，但是如果使用了 reactive，从技术上来说，你会给他附加一些新的属性，这就违背了 Ref 的目的；
- ref 只能为包装一个内部值，不应该被当作一个一般的响应式对象；
- isRef 检查，返回的 ref 对象实际上有一些特殊的东西，让我们知道它实际上是一个 Ref，而不是一个 reactive，这在很多情况下是必要的；
- 性能问题，因为响应式做了更多的事，不仅仅是我们在 Ref 中做的事情，当你试图创建一个响应式对象时，我们需要检查一下是不是已经有对应符合的响应式副本，检查它是否有一个只读副本，当你创建响应式对象时，会有很多额外的工作要做，在这里使用一个对象字面量去创建一个 ref 会更节省性能

### 问题五

> 使用反射和代理去添加属性有什么其他的好处
>
> <img src="https://oss.justin3go.com/blogs/image-20220127110700023.png" alt="image-20220127110700023" style="zoom:80%;" />

- 当我们使用代理的时候，所谓的响应式转换会变成懒加载；
- 在 Vue2 中，当我们进行转换的时候，我们必须尽快完成转换，因为当你将对象传递给 Vue2 的响应式，我们必须遍历所有的键并当场转换。以后当他们被访问时，它们已经被转换了；
- 但是对于 Vue3，当你调用 reactive 时，对于一个对象，我们所做的就是返回一个代理对象，仅在需要转换时嵌套对象(当你需要访问它的时候)，这就类似于懒加载；
- 这样，如果你的 app 有一个庞大的对象列表，但是对于分页，你只是渲染页面的前面 10 个，也就是只有前面 10 个必须经过响应式转换，可以为启动应用程序来说节省许多的时间；

## 源码

```javascript
// packages\reactivity\src\baseHandlers.ts
const get = /*#__PURE__*/ createGetter()
const shallowGet = /*#__PURE__*/ createGetter(false, true)
const readonlyGet = /*#__PURE__*/ createGetter(true)
const shallowReadonlyGet = /*#__PURE__*/ createGetter(true, true)

const set = /*#__PURE__*/ createSetter()
const shallowSet = /*#__PURE__*/ createSetter(true)
```

### createGetter

```javascript
// packages\reactivity\src\baseHandlers.ts
function createGetter(isReadonly = false, shallow = false) {
    // 有 isReadonly 版本与 shallow 版本
    // isReadonly 允许你只创建只读的对象，可以读取和跟踪但是不能改变
    // shallow 意味着当把一个对象放进另外一个对象时作为嵌套属性，它不试图把它转换为响应式的
  return function get(target: Target, key: string | symbol, receiver: object) {
    if (key === ReactiveFlags.IS_REACTIVE) {
      return !isReadonly
    } else if (key === ReactiveFlags.IS_READONLY) {
      return isReadonly
    } else if (key === ReactiveFlags.IS_SHALLOW) {
      return shallow
    } else if (
      key === ReactiveFlags.RAW &&
      receiver ===
        (isReadonly
          ? shallow
            ? shallowReadonlyMap
            : readonlyMap
          : shallow
          ? shallowReactiveMap
          : reactiveMap
        ).get(target)
    ) {
      return target
    }

    const targetIsArray = isArray(target)
	
    // (1)
    if (!isReadonly && targetIsArray && hasOwn(arrayInstrumentations, key)) {
      return Reflect.get(arrayInstrumentations, key, receiver)
    }

    const res = Reflect.get(target, key, receiver)

    if (isSymbol(key) ? builtInSymbols.has(key) : isNonTrackableKeys(key)) {
      return res
    }

    if (!isReadonly) {
      track(target, TrackOpTypes.GET, key)  // 真正执行的代码
    }

    if (shallow) {
      return res
    }
	// 如果你在响应式对象中嵌套了 Ref，当你访问时，它会自动拆封。
    if (isRef(res)) {
      // ref unwrapping - does not apply for Array + integer key.
      const shouldUnwrap = !targetIsArray || !isIntegerKey(key)
      return shouldUnwrap ? res.value : res
    }
	// 确保只有当它是一个对象时才转换它
    if (isObject(res)) {
      // Convert returned value into a proxy as well. we do the isObject check
      // here to avoid invalid value warning. Also need to lazy access readonly
      // and reactive here to avoid circular dependency.
      return isReadonly ? readonly(res) : reactive(res)
    }

    return res
  }
}
```



```javascript
const arrayInstrumentations = /*#__PURE__*/ createArrayInstrumentations()

function createArrayInstrumentations() {
  const instrumentations: Record<string, Function> = {}
  // instrument identity-sensitive Array methods to account for possible reactive
  // values
  ;(['includes', 'indexOf', 'lastIndexOf'] as const).forEach(key => {
    instrumentations[key] = function (this: unknown[], ...args: unknown[]) {
      const arr = toRaw(this) as any
      for (let i = 0, l = this.length; i < l; i++) {
        track(arr, TrackOpTypes.GET, i + '')
      }
      // we run the method using the original args first (which may be reactive)
      const res = arr[key](...args)
      if (res === -1 || res === false) {
        // if that didn't work, run it again using raw values.
        return arr[key](...args.map(toRaw))
      } else {
        return res
      }
    }
  })
  // instrument length-altering mutation methods to avoid length being tracked
  // which leads to infinite loops in some cases (#2137)
  ;(['push', 'pop', 'shift', 'unshift', 'splice'] as const).forEach(key => {
    instrumentations[key] = function (this: unknown[], ...args: unknown[]) {
      pauseTracking()
      const res = (toRaw(this) as any)[key].apply(this, args)
      resetTracking()
      return res
    }
  })
  return instrumentations
}
```

我们有一个数组(响应式数组)，当访问嵌套在里面的东西时，得到的是原始数据的响应式版本

```javascript
// 一种边缘案例
const obj = {}
const arr = reactive([obj])
const reactiveObj = arr[0]
// 比较对象与响应式对象
obj === reactiveObj  // is false
```

这个造成的问题就是如果使用 indexOf 查找 obj<如果没有做数组检测仪(1)的话就会导致这个问题>

```javascript
const obj = {}
const arr = reactive([obj])
arr.indexOf(obj)  // -1
```

### createSetter

```javascript
// packages\reactivity\src\baseHandlers.ts
function createSetter(shallow = false) {
  return function set(
    target: object,
    key: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    let oldValue = (target as any)[key]
    // 用户不能对只读属性进行操作
    // isRef(oldValue) && !isRef(value)检测是否在设置属性
    if (isReadonly(oldValue) && isRef(oldValue) && !isRef(value)) {
      return false
    }
    if (!shallow && !isReadonly(value)) {
      if (!isShallow(value)) {
        value = toRaw(value)
        oldValue = toRaw(oldValue)
      }
      if (!isArray(target) && isRef(oldValue) && !isRef(value)) {
        oldValue.value = value
        return true
      }
    } else {
      // in shallow mode, objects are set as-is regardless of reactive or not
    }

    const hadKey =
      isArray(target) && isIntegerKey(key)
        ? Number(key) < target.length
        : hasOwn(target, key)
    const result = Reflect.set(target, key, value, receiver)
    // don't trigger if target is something up in the prototype chain of original
    if (target === toRaw(receiver)) {
        // 如果没有键就添加
      if (!hadKey) {
        trigger(target, TriggerOpTypes.ADD, key, value)
      } else if (hasChanged(value, oldValue)) {
        trigger(target, TriggerOpTypes.SET, key, value, oldValue)
      }
    }
    return result
  }
}
```

使用 delete 去删除键：

```javascript
function deleteProperty(target: object, key: string | symbol): boolean {
  const hadKey = hasOwn(target, key)
  const oldValue = (target as any)[key]
  const result = Reflect.deleteProperty(target, key)
  if (result && hadKey) {
    trigger(target, TriggerOpTypes.DELETE, key, undefined, oldValue)
  }
  return result
}
```

### track

```javascript
// packages\reactivity\src\effect.ts
export function track(target: object, type: TrackOpTypes, key: unknown) {
  if (!isTracking()) {
      // 一些内部标志，某些情况下不应该被跟踪(1)
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = createDep()))
  }
	// 这个就是那个 effect
  const eventInfo = __DEV__
    ? { effect: activeEffect, target, type, key }
    : undefined
	// (2)
  trackEffects(dep, eventInfo)
}
```

(1)

```javascript
export function isTracking() {
  return shouldTrack && activeEffect !== undefined
}
// activeEffect 意味着 track 无论怎样都会被调用，如果响应式对象刚刚被访问，没有任何当前运行的效果，但它还是会被调用
```

(2)

```javascript
export function trackEffects(
  dep: Dep,
  debuggerEventExtraInfo?: DebuggerEventExtraInfo
) {
  let shouldTrack = false
  if (effectTrackDepth <= maxMarkerBits) {
    if (!newTracked(dep)) {
      dep.n |= trackOpBit // set newly tracked
      shouldTrack = !wasTracked(dep)
    }
  } else {
    // Full cleanup mode.
    shouldTrack = !dep.has(activeEffect!)
  }

  if (shouldTrack) {
    dep.add(activeEffect!)
    // 这是一种双向关系在 dep 与 effect 之间 is many-to-many
            //我们需要跟踪这一切做清理工作
    activeEffect!.deps.push(dep)
    if (__DEV__ && activeEffect!.onTrack) {
      activeEffect!.onTrack(
        Object.assign(
          {
            effect: activeEffect!
          },
          debuggerEventExtraInfo
        )
      )
    }
  }
}
```

### trigger

清理集合时，必须触发(trigger)所有与之相关的 effects

```javascript
// packages\reactivity\src\effect.ts
export function trigger(
  target: object,
  type: TriggerOpTypes,
  key?: unknown,
  newValue?: unknown,
  oldValue?: unknown,
  oldTarget?: Map<unknown, unknown> | Set<unknown>
) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    // never been tracked
    return
  }

  let deps: (Dep | undefined)[] = []
  if (type === TriggerOpTypes.CLEAR) {
    // collection being cleared
    // trigger all effects for target
    deps = [...depsMap.values()]
  } else if (key === 'length' && isArray(target)) {
    depsMap.forEach((dep, key) => {
      if (key === 'length' || key >= (newValue as number)) {
        deps.push(dep)
      }
    })
  } else {
    // schedule runs for SET | ADD | DELETE
    if (key !== void 0) {
      deps.push(depsMap.get(key))
    }

    // also run for iteration key on ADD | DELETE | Map.SET
    switch (type) {
      case TriggerOpTypes.ADD:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        } else if (isIntegerKey(key)) {
          // new index added to array -> length changes
          deps.push(depsMap.get('length'))
        }
        break
      case TriggerOpTypes.DELETE:
        if (!isArray(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
          if (isMap(target)) {
            deps.push(depsMap.get(MAP_KEY_ITERATE_KEY))
          }
        }
        break
      case TriggerOpTypes.SET:
        if (isMap(target)) {
          deps.push(depsMap.get(ITERATE_KEY))
        }
        break
    }
  }

  const eventInfo = __DEV__
    ? { target, type, key, newValue, oldValue, oldTarget }
    : undefined

  if (deps.length === 1) {
    if (deps[0]) {
      if (__DEV__) {
        triggerEffects(deps[0], eventInfo)
      } else {
        triggerEffects(deps[0])
      }
    }
  } else {
    const effects: ReactiveEffect[] = []
    for (const dep of deps) {
      if (dep) {
        effects.push(...dep)
      }
    }
    if (__DEV__) {
      triggerEffects(createDep(effects), eventInfo)
    } else {
      triggerEffects(createDep(effects))
    }
  }
}
```


