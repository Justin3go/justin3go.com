---
title: 你可能忽略的 10 种 JavaScript 快乐写法
date: 2023-02-23
tags: 
  - JavaScript
  - 编程技巧
  - 代码优化
  - 代码简洁
  - 代码美感
---

# 你可能忽略的 10 种 JavaScript 快乐写法

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中探讨了十种可能被开发者忽视的 JavaScript 编程技巧，这些技巧不仅提升代码的简洁性与可读性，还能有效提高开发者的幸福感。

文章首先强调了代码美感的重要性，接着提供了实用的代码片段和技巧，涵盖了数组去重、获取数组最后一个元素、对象与数组之间的转换、短路操作、默认值赋值、多条件判断优化等多个方面。笔者还分享了位运算、交换值、`replace()`和`sort()`的回调用法等高级技巧，鼓励读者分享自己认为优秀的代码片段。这些技巧的掌握不仅能提升开发效率，也能让编程变得更加愉悦。

总之，笔者希望通过这篇文章帮助读者发现和应用这些 JavaScript 的“快乐写法”。

<!-- DESC SEP -->

## 前言

- 代码的简洁、美感、可读性等等也许不影响程序的执行，但是却对人（开发者）的影响非常之大，甚至可以说是影响开发者幸福感的重要因素之一；
- 了解一些有美感的代码，不仅可以在一定程度上提高程序员们的开发效率，有些还能提高代码的性能，可谓是一举多得；

笔者至今难以忘记最开始踏入程序员领域时接触的一段`List`内嵌`for`的 Python 代码：

```python
array = [[16, 3, 7], [2, 24, 9], [4, 1, 12]]
row_min = [min(row) for row in array ]
print(row_min)
```

这可能就是动态语言非常优秀的一点，而 JavaScript 同样作为动态语言，其中包含的优秀代码片段也非常之多，比如我们通过 JavaScript 也可以非常轻松地实现上述的功能：

```JavaScript
const array = [[16, 3, 7], [2, 24, 9], [4, 1, 12]]
const row_min = array.map(item => Math.min(...item))
console.log(row_min)
```

能写出优秀的代码一直是笔者所追求的，以下为笔者在开发阅读过程积累的一些代码片段以及收集了互联网上一些优秀代码片段，希望对你有所帮助

## 概述

这里，考虑到有些技巧是大家见过的或者说是已经烂熟于心的，但总归有可能有些技巧没有留意过，为了让大家更加清楚的找到自己想要查阅的内容以查漏补缺，所以这里笔者贴心地为大家提供了一张本文内容的索引表，供大家翻阅以快速定位，如下：

|应用场景标题|描述|补充 1|补充 2|
|-|-|-|-|
|数组去重|略|通过内置数据解构特性进行去重`[] => set => []`|通过遍历并判断是否存在进行去重`[many items].forEach(item => (item <不存在于> uniqueArr) && uniqueArr.push(item))`|
|数组的最后一个元素|获取数组中位置最后的一个元素|使用`at(-1)`|略|
|数组对象的相关转换|略|对象到数组：`Object.entries()`|数组到对象：`Obecjt.fromEntries()`|
|短路操作|通过短路操作避免后续表达式的执行|`a 或 b`：a 真 b 不执行|`a 且 b`：a 假 b 不执行|
|基于默认值的对象赋值|通过对象解构合并进行带有默认值的对象赋值操作|`{...defaultData, ...data}`|略|
|多重条件判断优化|单个值与多个值进行对比判断时，使用`includes`进行优化|`[404,400,403].includes`|略|
|交换两个值|通过对象解构操作进行简洁的双值交换|[a, b] = [b, a]|略|
|位运算|通过位运算提高性能和简洁程度|略|略|
|`replace()`的回调|通过传入回调进行更加细粒度的操作|略|略|
|`sort()`的回调|通过传入回调进行更加细粒度的操作|根据字母顺序排序|根据真假值进行排序|

## 数组去重

这不仅是我们平常编写代码时经常会遇到的一个功能实现之一，也是许多面试官在考查 JavaScript 基础时喜欢考查的题目，比较常见的基本有如下两类方法：

**1）通过内置数据结构自身特性进行去重**

主要就是利用 JavaScript 内置的一些数据结构带有不包含重复值的特性，然后通过两次数据结构转换的消耗`[] => set => []`从而达到去重的效果，如下演示：

```js
const arr = ['justin1go', 'justin2go', 'justin2go', 'justin3go', 'justin3go', 'justin3go'];
const uniqueArr = Array.from(new Set(arr));
// const uniqueArr = [...new Set(arr)];
```

**2）通过遍历并判断是否存在进行去重**

白话描述就是：通过遍历每一项元素加入新数组，新数组存在相同的元素则放弃加入，伪代码：`[many items].forEach(item => (item <不存在于> uniqueArr) && uniqueArr.push(item))`

至于上述的`<不存在于>`操作，可以是各种各样的方法，比如再开一个`for`循环判断新数组是否有相等的，或者说利用一些数组方法判断，如[indexOf](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/indexOf)、[includes](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/includes)、[filter](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/filter)、[reduce](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/reduce)等等

```js
const arr = ['justin1go', 'justin2go', 'justin2go', 'justin3go', 'justin3go', 'justin3go'];
const uniqueArr = [];
arr.forEach(item => {
	// 或者!uniqueArr.includes(item)
	if(uniqueArr.indexOf(item) === -1){
		uniqueArr.push(item)
	}
})
```

结合`filter()`，判断正在遍历的项的 index，是否是原始数组的第一个索引：

```js
const arr = ['justin1go', 'justin2go', 'justin2go', 'justin3go', 'justin3go', 'justin3go'];
const uniqueArr = arr.filter((item, index) => {
	return arr.indexOf(item, 0) === index;
})
```

结合`reduce()`，prev 初始设为`[]`，然后依次判断`cur`是否存在于`prev`数组，如果存在则加入，不存在则不动：

```js
const arr = ['justin1go', 'justin2go', 'justin2go', 'justin3go', 'justin3go', 'justin3go'];
const uniqueArr = arr.reduce((prev,cur) => prev.includes(cur) ? prev : [...prev,cur],[]);
```


## 数组的最后一个元素

对于获取数组的最后一个元素，可能平常见得多的就是`arr[arr.length - 1]`，我们其实可以使用[`at()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Array/at)方法进行获取

```js
const arr = ['justin1go', 'justin2go', 'justin3go'];
console.log(arr.at(-1)) // 倒数第一个值
console.log(arr.at(-2)) // 倒数第二个值
console.log(arr.at(0)) // 正数第一个  
console.log(arr.at(1)) // 正数第二个
```

> 注：node14 应该是不支持的，目前笔者并不建议使用该方法，但获取数组最后一个元素是很常用的，就应该像上述语法一样简单...

## 数组对象的相互转换

- 相信大家比较熟悉的是**从对象转换为数组**的几种方法如：[`Object.keys()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)、[`Object.values()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/values)、[`Object.entries`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/entries)；
- 但其实还可以通过[`Object.fromEntries()`](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/fromEntries)将一个**特定数组转换回对象**：

```js
    const entryified = [
        ["key1", "justin1go"],
        ["key2", "justin2go"],
        ["key3", "justin3go"]
    ];

    const originalObject = Object.fromEntries(entryified);
    console.log(originalObject);
```

## 短路操作

被合理运用的短路操作不仅非常的优雅，还能减少不必要的计算操作

**1）基本介绍**

主要就是`||`或操作、`&&`且操作当第一个条件（左边那个）已经能完全决定整个表达式的值的时候，编译器就会跳过该表达式后续的计算

- 或操作`a || b`：该操作只要有一个条件为真值时，整个表达式就为真；即`a`为真时，`b`不执行；
- 且操作`a && b`：该操作只要有一个条件为假值时，整个表达式就为假；即`a`为假时，`b`不执行；

**2）实例**

网络传输一直是前端的性能瓶颈，所以我们在做一些判断的时候，可以通过短路操作减少请求次数：

```js
const nextStep = isSkip || await getSecendCondition();
if(nextStep) {
	openModal();
}
```

还有一个经典的代码片段：

```js
function fn(callback) {
	// some logic
	callback && callback()
}
```

## 基于默认值的对象赋值

- 很多时候，我们在封装一些函数或者类时，会有一些配置参数。
- 但这些配置参数通常来说会给出一个默认值，而这些配置参数用户是可以自定义的
- 除此之外，还有许许多多的场景会用到的这个功能：基于默认值的对象赋值。

```js
function fn(setupData) {
	const defaultSetup = {
		email: "justin3go@qq.com",
		userId: "justin3go",
		skill: "code",
		work: "student"
	}
	return { ...defaultSetup, ...setupData }
}

const testSetData = { skill: "sing" }
console.log(fn(testSetData))
```

如上`{ ...defaultSetup, ...setupData }`就是后续的值会覆盖前面`key`值相同的值。

## 多重条件判断优化

```js
if(condtion === "justin1go" || condition === "justin2go" || condition === "justin3go"){
	// some logic
}
```

如上，当我们对同一个值需要对比不同值的时候，我们完全可以使用如下的编码方式简化写法并降低耦合性：

```js
const someConditions = ["justin1go", "justin2go", "justin3go"];
if(someConditions.includes(condition)) {
	// some logic
}
```

## 交换两个值

一般来说，我们可以增加一个临时变量来达到交换值的操作，在 Python 中是可以直接交换值的：

```python
a = 1
b = 2
a, b = b, a
```

而在 JS 中，也可以通过解构操作交换值；

```JS
let a = 1;
let b = 2;
[a, b] = [b, a]
```

简单理解一下：

- 这里相当于使用了一个数组对象同时存储了 a 和 b，该数组对象作为了临时变量
- 之后再将该数组对象通过解构操作赋值给 a 和 b 变量即可

同时，还有种比较常见的操作就是交换数组中两个位置的值：

```js
const arr = ["justin1go", "justin2go", "justin3go"];
[arr[0], arr[2]] = [arr[2], arr[0]]
```

## 位运算

关于位运算网上的讨论参差不齐，有人说位运算性能好，简洁；也有人说位运算太过晦涩难懂，不够易读，这里笔者不发表意见，仅仅想说的是尽量在使用位运算代码的时候写好注释！

下面为一些常见的位运算操作，[参考链接](https://juejin.cn/post/6844903568906911752)

**1 ) 使用&运算符判断一个数的奇偶**

```js
// 偶数 & 1 = 0
// 奇数 & 1 = 1
console.log(2 & 1)    // 0
console.log(3 & 1)    // 1
```

**2 ) 使用`~, >>, <<, >>>, |`来取整**

```js
console.log(~~ 6.83)    // 6
console.log(6.83 >> 0)  // 6
console.log(6.83 << 0)  // 6
console.log(6.83 | 0)   // 6
// >>>不可对负数取整
console.log(6.83 >>> 0)   // 6
```

**3 ) 使用`^`来完成值交换**

```js
var a = 5
var b = 8
a ^= b
b ^= a
a ^= b
console.log(a)   // 8
console.log(b)   // 5
```

**4 ) 使用`&, >>, |`来完成 rgb 值和 16 进制颜色值之间的转换**

```js
/**
 * 16 进制颜色值转 RGB
 * @param  {String} hex 16 进制颜色字符串
 * @return {String}     RGB 颜色字符串
 */
  function hexToRGB(hex) {
    var hexx = hex.replace('#', '0x')
    var r = hexx >> 16
    var g = hexx >> 8 & 0xff
    var b = hexx & 0xff
    return `rgb(${r}, ${g}, ${b})`
}

/**
 * RGB 颜色转 16 进制颜色
 * @param  {String} rgb RGB 进制颜色字符串
 * @return {String}     16 进制颜色字符串
 */
function RGBToHex(rgb) {
    var rgbArr = rgb.split(/[^\d]+/)
    var color = rgbArr[1]<<16 | rgbArr[2]<<8 | rgbArr[3]
    return '#'+ color.toString(16)
}
// -------------------------------------------------
hexToRGB('#ffffff')               // 'rgb(255,255,255)'
RGBToHex('rgb(255,255,255)')      // '#ffffff'
```

## `replace()`的回调函数

之前写过一篇文章介绍了它，这里就不重复介绍了，[F=>传送](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2022/15JavaScript%E5%9F%BA%E7%A1%80-replace%E6%96%B9%E6%B3%95%E7%9A%84%E7%AC%AC%E4%BA%8C%E4%B8%AA%E5%8F%82%E6%95%B0.html)

## `sort()`的回调函数

`sort()`通过回调函数返回的正负情况来定义排序规则，由此，对于一些不同类型的数组，我们可以自定义一些排序规则以达到我们的目的：

- 数字升序：`arr.sort((a,b)=>a-b)`
- 按字母顺序对字符串数组进行排序：`arr.sort((a, b) => a.localeCompare(b))`
- 根据真假值进行排序：

```js
const users = [
  { "name": "john", "subscribed": false },
  { "name": "jane", "subscribed": true },
  { "name": "jean", "subscribed": false },
  { "name": "george", "subscribed": true },
  { "name": "jelly", "subscribed": true },
  { "name": "john", "subscribed": false }
];

const subscribedUsersFirst = users.sort((a, b) => Number(b.subscribed) - Number(a.subscribed))
```

## 最后

- 个人能力有限，并且代码片段这类东西每个人的看法很难保持一致，不同开发者有不同的代码风格，这里仅仅整理了一些笔者自认为还不错的代码片段；
- 可能互联网上还存在着许许多多的优秀代码片段，笔者也不可能全部知道；
- 所以，如果你有一些该文章中没有包含的优秀代码片段，就不要藏着掖着了，分享出来吧~

同时，如本文有所错误，望不吝赐教，友善指出🤝

Happy Coding!🎉🎉🎉

## 参考

- [15 Killer 🗡 JS techniques you've probably never heard of 🔈🔥](https://dev.to/ironcladdev/15-killer-js-techniques-youve-probably-never-heard-of-1lgp)
- [JS 奇巧淫技大杂烩(更新中)⏲👇](https://juejin.cn/post/7040359790400241694)
- [20 个提升效率的 JS 简写技巧](https://juejin.cn/post/7041068640094912548)
- [8 techniques to write cleaner JavaScript code](https://dev.to/codewithahsan/8-techniques-to-write-cleaner-javascript-code-369e)
- [34 JavaScript Optimization Techniques to Know in 2021](https://dev.to/patelatit53/34-javascript-optimization-techniques-to-know-in-2021-57d)
- [位运算符在 JS 中的妙用](https://juejin.cn/post/6844903568906911752)

