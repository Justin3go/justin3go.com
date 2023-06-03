# 获取Object的第一个元素

> 目前遇到个业务需要获取Object中的第一个元素，具体背景这里不详细介绍，如果将数据改为数组的形式改动量较大，需要改接口定义层面，所以这里简单偷个懒

## Object中的键值迭代是无序的

JS基础中的知识，也经常在一些八股文中看到就是`Map`和`Object`中的区别之一就是Object中的属性是无序的，而Map中的属性是有序的，那我们如何保证我们通过`Object.keys`等方法和`for in`方法迭代的第一个属性是我们预期的第一个呢？

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

可以看到这个顺序并不是我们实际定义的顺序，实际情况可能比上述情况更加复杂，所以一般来说都说Obect内部属性的顺序是无序的。

## Object中的键值迭代是有规律的

这就需要我们我们去确定对象迭代的内部机制是什么，这里直接说结论，具体过程可以参考[这篇文章](https://www.stefanjudis.com/today-i-learned/property-order-is-predictable-in-javascript-objects-since-es2015/)和[这篇文章](https://juejin.cn/post/6932494622661083150)

1.  数字或者字符串类型的数字当作key时，输出是按照升序排序的
2.  普通的字符串类型的key，就按照定义的顺序输出
3.  Symbols也是和字符串类型的规则一样
4.  如果是三种类型的key都有，那么顺序是 1 -> 2 -> 3

我这里主要考虑我的业务场景，根据上述结论，也就是说我们只要key是字符串，那么其遍历顺序就是我们定义的顺序，这就符合我们的需求了

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

