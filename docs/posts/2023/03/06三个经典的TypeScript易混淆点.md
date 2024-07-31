---
title: 三个经典的 TypeScript 易混淆点
date: 2023-03-06
tags: 
  - TypeScript
  - interface
  - type
  - never
  - unknown
  - any
---

# 三个经典的 TypeScript 易混淆点

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在本文中探讨了 TypeScript 中的三个经典易混淆点，这些问题不仅在开发中常见，也是面试官常考的内容。

- 首先，笔者详细解析了`interface`与`type`的区别，强调在可用`interface`的情况下优先使用它，因为`interface`支持合并类型，而`type`则无法扩展。
- 接着，笔者介绍了`never`类型的定义与应用，指出它用于表示不会返回的函数，能帮助编译器进行类型检查，提升代码的安全性。
- 最后，笔者对`unknown`与`any`进行了比较，指出`unknown`是“顶级类型”，而`any`则放弃了类型检查，可能导致类型错误。

通过这些分析，笔者希望帮助读者更好地理解 TypeScript 的高级用法。

<!-- DESC SEP -->

## 前言

- **本文会讲什么**：主要讲解 TypeScript 在开发过程中的易混淆点，当然也同样是面试官常考的几个题目
- **本文不会讲什么**：本文并不是又大又全的 TypeScript 学习教程，不会讲那些基础知识、简单概念等，比如 JS 的内置类型这类。所以如果你是新手玩家，最好先去做一下新手任务出了新手村再这里

![](https://oss.justin3go.com/blogs/QQ%E5%9B%BE%E7%89%8720230306194345.jpg)

## 你知道 interface 与 type 有什么区别吗

官网这里有[较为详细的介绍](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)，并且提到一句类似于最佳实践的话：

> For the most part, you can choose based on personal preference, and TypeScript will tell you if it needs something to be the other kind of declaration. If you would like a heuristic, use `interface` until you need to use features from `type`.

简单来说就是能用`interface`就用`interface`，除非 Typescript 提醒你了或者是`interface`根本实现不了这个功能。

具体来说它们有如下重要的区别

### 主要区别

`type`定义之后就不能重新添加新的属性；而`interface`则是始终可以扩展的；即仅`inyterface`支持合并类型

这里简单叙述一下官网中的例子：

```ts
interface Window {
  title: string
}  
// 这步是 OK 的，`ts: TypeScriptAPI`就合并进入了之前定义的 Window 这个接口
interface Window {
  ts: TypeScriptAPI
}

const src = 'const a = "Hello World"';
window.ts.transpileModule(src, {});
```

而基于已经定义的`type`继续添加新的字段就会`Error`

```ts
type Window = {
  title: string
}  
type Window = {
  ts: TypeScriptAPI
}  
 // Error: Duplicate identifier 'Window'.
```

### 其他区别：`interface`的限制

前面提到能使用`interface`的时候就使用`interface`，除了`interface`实现不了你想要的功能的时候。那本小节就描述一下`interface`又有什么限制：

**不能直接操作基本类型（如`string`、`number`这些）**

比如如下代码放在编译器中就会报错，因为`extends`了`string`这个基本类型：

```ts
interface X extends string {  // error
 // ...
}
```

而`type`则可以，如下是大家可能经常使用的操作：

```ts
type stringAlias = string;  // ok
type StringOrNumber = string | number;  // ok
```

### 本章小节

- `interface > type`：合并类型
- `type > interface`：操作基本类型

当然，基于已有知识如`JavaScript`进行联想，你可以简单理解为`type == const`，`interface == class`。这种理解也许有点片面，不过仅仅是为了方便记忆...

## 你知道 never 类型是用来干什么的吗

### 定义

故名思义，`never`是一种表示永远不会出现的类型，那什么是永远不会出现的类型呢，比如当一个函数陷入无限循环或者抛出异常时，我们就可以把这个函数的返回类型定义为`never`

如：

```ts
function throwError(message: string): never {
  throw new Error(message);
}
```

注：`never` 类型仅能被赋值给另外一个 `never`

### 应用场景 1

对于平常开发中，`never`相对来说可能是使用的较少的了。更多人可能只是知道其定义，但不知道其场景/作用。

**第一个场景就是前面举例提到的定义无返回的函数的返回类型**。当然，除了上述中抛出异常会导致函数无返回，还有种形式是产生了无限循环导致代码执行不到终点：

```ts
function infiniteLoop(): never {
  while (true) {
    console.log("justin3go.com");
  }
}
```

我们可以思考一下：**没有`never`时会导致什么坏情况出现**

总的来说，`never`可以帮助 TypeScript 编译器更好地理解这个函数的行为，并在代码中进行类型检查。

例如，下面这个函数会抛出一个异常，表示输入的值不是一个有效的数字：

```ts
function parseNumber(value: string): number {
  const result = Number(value);
  if (isNaN(result)) {
    throw new Error(`${value} is not a valid number.`);
  }
  return result;
}
```

如果我们尝试调用上述这个 `parseNumber()` ，但是传递了一个无效的字符串参数，TypeScript 编译器无法识别这个函数会抛出一个异常（此时是假设的没有`never`类型）。而此时它会将函数的返回类型设置为 `number`，这会导致一些类型检查错误。

比如一个大型系统中我们调用这个通用函数时，而仅仅看到了 TS 的提示说这个函数返回的是一个`number`，然后你就非常笃定其返回值是一个`number`，于是就基于这个`number`类型做了许多特别的操作，哦豁，后续很可能出现偶发性 bug。

而当有了`never`类型，我们就可以设置为这样：

```ts
function parseNumber(value: string): never | number {
  const result = Number(value);
  if (isNaN(result)) {
    throw new Error(`${value} is not a valid number.`);
  }
  return result;
}
```

现在，如果我们尝试调用 `parseNumber` 函数并传递一个无效的字符串参数，TypeScript 编译器会正确地推断出函数会抛出一个异常，并根据需要执行类型检查。**这可以在我们编写更安全、更健壮的代码时提供非常好的帮助。**

### 应用场景 2

在 TypeScript 中，`never` 类型可以**用作类型保护**。因为如果一个变量的类型为 `never`，则可以确定该变量不可能有任何值。例如下方这个经典例子：

```ts
function assertNever(x: never): never {
  throw new Error("Unexpected object: " + x);
}

function getValue(x: string | number): string {
  if (typeof x === "string") {
    return x;
  } else if (typeof x === "number") {
    return x.toString();
  } else {
    return assertNever(x);
  }
}
```

这里，我们在最后一个分支使用`never`类型做了兜底，如果不使用`never`，这里 TS 检查就可能报错，因为最后一个分支没有返回与函数返回值为`string`相互冲突：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230306231122.png)

### 与`void`的区别

刚才那个例子其实我们这样避免报错（当然并不推荐，这里仅仅为了引入`void`）:

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230306231600.png)

- 这样，就不会报错了，因为`void`表示该函数没有返回值，所以`string | void`1 兼容了所有的分支情况，但是这里非常不推荐这么做，正确的做法还是`assertNever`那个例子
- 原因是如果我们对这个函数按照参数类型正确传递参数，是不可能走到最后一个分支的，所以也就没必要单独在`或一个 void`了，这样反而会误解这个函数的意思，增加操作；
- 此时使用抛出异常这个`never`类型就可以既避免该函数的返回值检查，又可以做一个兜底，在后续确实传参错误的时候抛出异常以避免执行后续的代码

所以，那`void`和`never`的区别是啥？

- `void`：整个函数都正确执行完了，只是没有返回值
- `never`：函数根本没有执行到返回的那一步

### 本章小节

`never`是一种表示永远不会出现的类型，主要在以下两种场景中使用：

1. 无法执行到终点的函数的返回类型应设置为`never`
2. 可以用作类型保护

其中，无法执行到终点 与 在终点不返回是两个意思。这也是`never`与`void`的主要区别。

## 你知道 unknown 和 any 之间的区别吗

### 概括

首先你可以将`unknown`理解为 TS 认可的一种类型，它确确实实是 TS 内置的一种类型；而`any`你可以理解为它是为了兼容`JavaScript`而出现的一种类型，与其说是兼容`JavaScript`，不如说是兼容那些不太会`TypeScript`的程序员。当然，有时候项目赶工确实很着急那也没办法...

### `unknown`简述

`unknown`表示一种不确定的类型，即编译器无法确定该变量的类型，因此无法对该变量执行任何操作。通常情况下，`unknown`类型的变量需要进行类型检查或者类型断言后才能使用。例如：

```ts
let userInput: unknown;
let userName: string;

userInput = 5;
userInput = 'hello';

// 需要进行类型检查
if (typeof userInput === 'string') {
  userName = userInput;
}

// 或者需要进行类型断言
userName = userInput as string;
```

### `any`简述

`any`表示任意类型，即该变量可以是任何类型。使用`any` 类型会关闭 TypeScript 的类型检查，因此使用 "any" 类型时需要小心，因为它会导致代码中的类型错误难以被发现。例如：

```ts
let userInput: any;
let userName: string;

userInput = 5;
userInput = 'hello';

// 没有类型检查
userName = userInput;
```

### 区别呢？

> `unknown`与`any`的最大区别是：
> 
> `unknown` 是 `top type` (任何类型都是它的 `subtype`) , 而 `any` 既是 `top type`, 又是 `bottom type` (它是任何类型的 `subtype` ) , 这导致 `any` 基本上就是放弃了任何类型检查。
> 
> 因为`any`既是`top type`, 又是 `bottom type`，所以任何类型的值可以赋值给`any`，同时`any`类型的值也可以赋值给任何类型。但`unknown` 只是 `top type`，任何类型的值都可以赋值给它，但它只能赋值给`unknown`和`any`，因为只有它俩是`top type`。

上述话语原文：[any 和 unknown](https://juejin.cn/post/7003171767560716302#heading-9)

## 最后

本篇文章由于是几个经典的问题，所以我结合了 chatgpt 与其他的一些文章进行参考，如下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230306204709.png)

其他两个问题也相继问了一下，有些帮助，但也仅此而已；这里疑惑的是我既然参考了它的回答，那我该不该引用它呢？如果引用它，那它的知识又来自于互联网，它自己却没有注明知识来源处...

![](https://oss.justin3go.com/blogs/QQ%E5%9B%BE%E7%89%8720230306235244.jpg)

最后最后，如本文有理解错误，欢迎各位友善指出。

## 参考

- [TypeScript 高级用法](https://juejin.cn/post/6926794697553739784)
- [总结 TypeScript 在项目开发中的应用实践体会](https://juejin.cn/post/6970841540776329224)
- [重学 TypeScript](https://juejin.cn/post/7003171767560716302#heading-9)
- [TS 官网-differences-between-type-aliases-and-interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html#differences-between-type-aliases-and-interfaces)
- [Never](https://jkchao.github.io/typescript-book-chinese/typings/neverType.html#%E7%94%A8%E4%BE%8B%EF%BC%9A%E8%AF%A6%E7%BB%86%E7%9A%84%E6%A3%80%E6%9F%A5)

