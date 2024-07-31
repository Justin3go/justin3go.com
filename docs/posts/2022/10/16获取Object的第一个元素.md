---
title: 获取 Object 的第一个元素
date: 2022-10-16
tags: 
  - JavaScript
  - Object
  - 解构
  - ES6
---

# 获取 Object 的第一个元素

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇文章中，笔者探讨了如何从一个 JavaScript 对象中获取第一个元素。由于对象的属性是无序的，笔者指出，使用`Object.keys`和`for in`方法时，迭代的顺序并不总是符合预期。为了解释这一点，笔者总结了对象属性迭代的规律：

1. 数字或字符串形式的数字作为键时，按升序排序。
2. 普通字符串类型的键按定义顺序输出。
3. Symbols 与字符串类型的规则相同。
4. 如果存在三种类型的键，优先顺序为数字键 -> 字符串键 -> Symbol 键。

根据这些规则，笔者提出可以通过解构赋值的方式优雅地获取对象的第一个元素，从而满足实际业务需求。最后，文章附上了相关的参考链接，供读者深入了解对象属性的迭代顺序。

<!-- DESC SEP -->

---

> 目前遇到个业务需要获取 Object 中的第一个元素，具体背景这里不详细介绍，如果将数据改为数组的形式改动量较大，需要改接口定义层面，所以这里简单偷个懒

## Object 中的键值迭代是无序的

JS 基础中的知识，也经常在一些八股文中看到就是`Map`和`Object`中的区别之一就是 Object 中的属性是无序的，而 Map 中的属性是有序的，那我们如何保证我们通过`Object.keys`等方法和`for in`方法迭代的第一个属性是我们预期的第一个呢？

```ts
const sym = Symbol('foo')
const obj = {
    a: '123',
    b: '456',
    c: '789',
    1: '111',
    2: '222',
    3: '333',
}

console.log(Object.keys(obj));
console.log(Object.values(obj));
```
	[ '1', '2', '3', 'a', 'b', 'c' ]
	[ '111', '222', '333', '123', '456', '789' ]

可以看到这个顺序并不是我们实际定义的顺序，实际情况可能比上述情况更加复杂，所以一般来说都说 Obect 内部属性的顺序是无序的。

## Object 中的键值迭代是有规律的

这就需要我们我们去确定对象迭代的内部机制是什么，这里直接说结论，具体过程可以参考[这篇文章](https://www.stefanjudis.com/today-i-learned/property-order-is-predictable-in-javascript-objects-since-es2015/)和[这篇文章](https://juejin.cn/post/6932494622661083150)

1.  数字或者字符串类型的数字当作 key 时，输出是按照升序排序的
2.  普通的字符串类型的 key，就按照定义的顺序输出
3.  Symbols 也是和字符串类型的规则一样
4.  如果是三种类型的 key 都有，那么顺序是 1 -> 2 -> 3

我这里主要考虑我的业务场景，根据上述结论，也就是说我们只要 key 是字符串，那么其遍历顺序就是我们定义的顺序，这就符合我们的需求了

## 回到主题：获取第一个元素

最后，就是获取对象的第一个元素了，这里就不使用什么`for`循环再`break`了，这里可以直接使用解构优雅地获取：

```ts{6}
const obj = {
	a: '123',
	b: '234',
	c: '345',
}
const [ firstItem ] = Object.values(obj); // 这里
console.log(firstItem);

```
	123

## 参考

- https://juejin.cn/post/6932494622661083150
- https://www.stefanjudis.com/today-i-learned/property-order-is-predictable-in-javascript-objects-since-es2015/

