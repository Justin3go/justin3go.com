---
title: TypeScript 入门
date: 2023-02-02
tags: 
  - TypeScript
  - JavaScript
  - 编程
  - 前端
  - 类型
---

# TypeScript 入门

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中详细介绍了 TypeScript 的基础知识及其使用方法，帮助初学者跨出学习的第一步。首先，笔者指导读者如何安装 TypeScript，并编写和编译简单的“Hello World”程序，强调 TypeScript 是 JavaScript 的超集，解决了 JavaScript 动态类型带来的问题。接着，笔者展示了如何通过`tsconfig.json`配置文件批量编译多个 TypeScript 文件，提升开发效率。

接下来的部分深入探讨了 TypeScript 的类型系统，包括基本类型、对象类型、数组、元组和枚举等，强调类型安全的重要性。笔者还介绍了类的概念，包括构造函数、继承、抽象类和接口，展示了如何利用 TypeScript 的特性提高代码的可读性和可维护性。最后，笔者提到泛型的使用，进一步提升了代码的灵活性。整篇文章旨在让读者快速上手 TypeScript，并为后续学习打下坚实基础。

<!-- DESC SEP -->

## 如何使用 TS 来输出你的 HelloWorld 呢？

> 这一步对于很多人来说是最简单的一步，也是最难的一步，说简单是因为这确确实实仅是入门的一步，就是一个环境配置，说难则是因为很多人无法跨出这一步，当你跨出这一步之后，你会发现后面的真的学得很快很快，现在，就让我们一起跨出这一步吧~

step1：安装 TS

```javascript
cnpm i -g typescript
// 查看是否安装成功，能输出对应的版本号就对了
tsc -v
```

step2：编写 TS 代码

```javascript
console.log('Hello TS');
```

有小伙伴就问，这也是 TS 的代码吗？这不是 JS 的代码吗？当然是，TypeScript 是 JavaScript 的超集，因为它扩展了 JavaScript，有 JavaScript 没有的东西，那么 JS 有的东西，它也是有的，你就放心使用吧~

<img src="https://oss.justin3go.com/blogs/image-20220312205404227.png" alt="image-20220312205404227" style="zoom: 25%;" />

step3：编译 TS 为 JS

TS 在浏览器中是无法运行的，它的出现只是为了弥补开发人员在编写 JS 代码的痛苦，就是无类型，这个在小型 demo 中是无法体现的，但一上升到大项目中，你会发现 JS 的 any 类型难以维护，这也是 TS 出现的原因，大家都知道 Vue3 是全部拿 TS 构建了，那么 Vue3+TS+...就是现在开发的一套可能是主流技术栈了，这也更加坚定了我们学习 TS 的原因！

![image-20220313092140181](https://oss.justin3go.com/blogs/image-20220313092140181.png)

![image-20220312205955891](https://oss.justin3go.com/blogs/image-20220312205955891.png)

```javascript
tsc .\01_Hello.ts   // 编译刚写的 TS 文件
```

之后会生成同名的 JS 文件，好了，现在，你可以运行你的第一句 TS 代码吧~

## 项目中如何编译多个 TS 文件呢？

> 上述的编译方式只能编译一个文件，多个文件难道需要我们一步步执行命令？这对于几乎成为主流的 TS 来说怎么可能会有如此低效率的编译方式，现在，让我们学习一下多个文件的编译方式：

```javascript
 tsc --init  // 首先你需要使用这个命令初始化一个 tsconfig.json 文件
```

之后我们就可以在这个文件里面控制对我们整个项目中多个文件的编译方式了，哈~再也不用每个文件都执行一次 tsc+hello.ts 了[doge]

下面我列举了一些比较常用的 tsconfig.json 的配置信息，大家可以根据自己需要进行配置，也可以查看[官网文档](https://www.typescriptlang.org/docs/handbook/tsconfig-json.html)，点进官方文档之前记得给本篇文章点个赞支持一下哦，别过去了就回不来了😚；

```json
{
  /*
  配置文件，根据该配置进行编译
  "include": []-->哪些配置文件需要被编译
  '*'表示任意文件
  '**'表示任意目录
  */
  "include": [
    "*"
, "src/*"  ],
  // 不包含
  "exclude": [

  ],
  // "extends": "" --> 继承于某个配置文件
  // "files": [?] //文件，不能是目录
  "compilerOptions": {
    // 编译为 ES 的版本
    "target": "ES3",
    // 指定要使用的模块化方案
    "module": "es2015",
    // "lib": []-->指定项目中需要用到的库-->一般不需要设置
    "outDir": "./dist",  //编译后的存放目录
    // 将代码合并到为一个文件-->如果和 ing 多个模块，module-->system|amd
    // "outFile": "./dist/app.js"
    // 是否对 js 文件进行编译
    "allowJs": false,
    // 是否检查 js 代码符合规范
    "checkJs": false,
    // 是否移除注释
    "removeComments": false,
    // 不生成编译后的文件
    "noEmit": false,
    // 当有错误的时候就不生成编译后的文件
    "noEmitOnError": false,
    // 所有严格模式的总开关
    "strict": false,
    // 严格模式-->性能更好
    "alwaysStrict": true,
    // 不允许隐式的 any 类型
    "noImplicitAny": true,
    // 不允许不明确类型的 this
    "noImplicitThis": true,
    /*
    function fn(this: window){
      alert(this)
    }
    */
    // 严格地检查空值-->比如某些获取 dom 元素
    "strictNullChecks": false
  }
}
```

然后记得终端输入下方命令就可以对整个项目中的多个文件进行编译和监控了

```javascript
tsc -w
```

到这里，你已经跨出了学习 TS 中最难的一步了，接下来面对你的将是`康庄大道=======>success`

![image-20220312212008138](https://oss.justin3go.com/blogs/image-20220312212008138.png)

当然还有其他方式来控制整个项目对 TS 的编译方式，比如在 webpack 中的配置可能是这样的（这里就不过多赘述了，大家初始学习的话可以跳过这方面的知识，明白前两种编译方式就可以应对接下来的知识，后续你在编写大型项目中根据自己的需求再在网上找对应的配置就可以，毕竟知识的海洋是无限的，有些东西需要深入了解，但有些东西又得不求甚解，很多时候做一样东西你不一定会其中的技术栈，然后你再学-->使用，技术是学不完的，按需学习感觉才是这个时代的主流，当然，程序员的核心素质除外，这个挖再深都对你好处很大）：

![image-20220312213258704](https://oss.justin3go.com/blogs/image-20220312213258704.png)

```json
// tsconfig.json 中
{
  "compilerOptions": {
    "module": "ES2015",
    "target": "ES2015",
    "strict": true
  }
}
```

```json
// package.json 中
{
  "devDependencies": {
    "ts-loader": "^9.2.6",
    "typescript": "^4.5.2",
    "webpack": "^5.65.0",
    "webpack-cli": "^4.9.1"
  },
  "scripts": {
    "build": "webpack"
  }
}

```

```js
// webpack.config.js 中
// 引入一个拼接路径的包
const path = require('path');

// webpack 中所有的配置信息
module.exports = {
  // 入口文件
  entry: "./src/index.ts",
  // 指定输出文件所在目录
  output: {
    // 指定目录
    path: path.resolve(__dirname, 'dist'),
    // 打包以后的文件名
    filename: "bundle.js"
  },
  // 指定 webpack 打包时要使用的模块
  module:{
    // 指定加载的规则
    rules: [{
      // test 指定的是规则生效的文件
      test: /\.ts$/,
      // 要使用的 loader
      use: 'ts-loader',
      exclude:/node-modules/
    }]
  }
}
```

好了，刚才突然就想感叹一下，接下来我们一起走这条康庄大道吧

![image-20220312213502936](https://oss.justin3go.com/blogs/image-20220312213502936.png)

## 认识类型

> 类型是 typescript 中最重要的概念，毕竟人家就叫**type**script

TS 中是如何声明一个类型的呢？记住下面的格式：

```ts
let a: number;
```

上面的代码又和我们平常书写的 JS 有什么不同的？

JS 中，我们输入如下的代码，不会报错：

```javascript
let a;
a = 'this is string';
a = 1234;
a = true;
```

但是在 TS 中，不同类型的值是不能相互赋值的，否则将会报错，这个报错也是我们选择 TS 的重要原因，JS 是动态类型语言，很多时候你都不会发现你的类型搞错了，编译器也不会给你报错，当这个错误影响到项目运行的时候，你又找不到，昂~

![image-20220312214238578](https://oss.justin3go.com/blogs/image-20220312214238578.png)

在初入计算机领域时，我们最怕的就是编写的代码被编译器提示报错，但是现在，我们更怕的是生产环境中报错，编译器最好多报一点错，因为编译器的提示真的太好解决了，就像你的坐姿，在小时候写字的时候是最好纠正的，但现在，害>程序员的腰酸背痛！

下方的代码中，编译器会提示报错：

```javascript
let a: number;
// a = 'hello' --> 报错
```

```javascript
let b: string;
b = "hello";  // 这样才行
```

当然你也可以这样`let a: any;`，然后你也可以像 JS 那样赋值，千万不要这么做，除非万不得已，否则就违背了 TS 的初衷，对了，如果声明对象不指定类型`let a;`也会导致隐式的`any`类型，永远记得不要这么做🈲

除此之外，你也可以给函数的形参和返回值做类型的声明：

```javascript
function sum_ts(a:number, b:number):number {
	return a + b;
}
```

回想一下，js 中的函数是不考虑参数的类型以及个数的，它的个数只是表面的个数，就算你不声明形参个数，你仍然可以给 JS 的函数传任意的参数个数，毕竟 JS 函数可以使用**`arguments`** 这个类数组对象进行访问，这就导致很多时候你想编写一个万用的函数，需要考虑到是否收集剩余参数，而其他开发者在使用这个函数的时候也不能很清楚的知道这个函数的输入输出，这就完全违背了封装的思想-->拿来就用！

所以，好好学一下 TS 吧~ (*^_^*)

## 深入类型

### 基本类型介绍

就是 JS 中的八种类型，你还记得吗？

**😀面试官：**说一说 ES6 中的八种数据类型？

**❓我：**JavaScript 共有八种数据类型，分别是 Undefined、Null、Boolean、Number、String、Object、Symbol、BigInt。

😀**面试官：**哪两种类型是新增的？说一说你对它们的了解？

**❓我：**其中 Symbol 和 BigInt 是 ES6 中新增的数据类型：

- Symbol 代表创建后独一无二且不可变的数据类型，它主要是为了解决可能出现的全局变量冲突的问题，可以很好地隔离用户数据与程序状态。
- BigInt 是一种数字类型的数据，它可以表示任意精度格式的整数，使用 BigInt 可以安全地存储和操作大整数，即使这个数已经超出了 Number 能够表示的安全整数范围。

![image-20220312220857718](https://oss.justin3go.com/blogs/image-20220312220857718.png)

TS 中的基础类型也是这八种，写成 TS 的格式的话就是如下代码：

```javascript
let str: string = "justin3go";
let num: number = 20;
let bool: boolean = false;
let u: undefined = undefined;
let n: null = null;
let obj: object = {justin: 3};
let big: bigint = 100n;
let sym: symbol = Symbol("justin3go"); 
```

TS 难吗，不难，难的是 JS！

![image-20220312221231737](https://oss.justin3go.com/blogs/image-20220312221231737.png)

当然还有一些需要注意的地方，下面将详细阐述：

1. 使用字面量形式进行类型声明：

   ```javascript
   let a1: 10;
   a1 = 10;
   // a1 = 20 --> 报错
   ```

   ```javascript
   // 作用：
   let b1: "male" | "female";   // 这样 b1 就只能在这两个字符串中选了
   // 记得：现在做的限制是对以后的回馈，后续写代码才会更加的方便。
   //--------------------------分界线--------------------------------------
   // 联合类型
   let c1: boolean | string;
   ```

2. 关于 TS 中的任意类型：

   ```javascript
   // any-->和 js 一样关闭类型检测
   let d1: any;
   // 注：声明变量如果不指定类型，默认为隐式的 any
   let e1;
   // 赋值
   let s1: string;
   //any 可以赋值给任意类型，同时导致 s1 也变为 any 类型了
   s1 = d1;
   ```

   ```javascript
   // 但是 unknown 就不一样-->实际上就是一个类型安全的 any,不能直接赋值给其他的变量
   let g1: unknown;
   g1 = 10;
   g1 = true;
   g1 = "hello";
   // s1 = g1 --> 此时 g1 赋值会报错，不能赋值
   if (typeof g1 === "string") {
   	s1 = g1; //这种就不会报错
   }
   //--------------------------分界线----------------------------------
   // 当你确认 g1 就是字符串，一定要赋值的话，可以这么做：
   // 类型断言-->我知道它就是字符串
   s1 = g1 as string;
   s1 = <string>g1;
   ```

3. 关于函数中的空值：

   ```javascript
   // 空值
   function fn1(): void {
   	// return 123 报错
   	return;  // 对
   }
   // 没有值-->表示永远不会返回结果，空也不返回(return;也不行)
   function fn2(): never {
   	//作用：可以用来指定专门的函数报错 
   	throw new Error("error");
   }
   ```

### 对象类型介绍

#### 定义对象的结构

刚才，我们一起学习了八种基本类型，其中有一种叫做`let obj: object;`，我们可以对其这样赋值：

```javascript
// let obj: object;
obj = {};
obj = function () {};
```

所以一般也不会使用 object，因为 js 中一切都是对象，相当于没有限制，一般这样使用，主要是声明里面的属性，之后使用结构就必须一摸一样：

```javascript
let b2: { name: string };
// b2 = {} --> 这种就会报错：因为需要且仅需要一个 name 属性
// b2 = {name: "孙悟空", age: 18}  -->error
b2 = { name: "孙悟空" };
```

但是，偶尔我们也许需要部分结构是固定的，还有一些 key 值不确定，这时候，我们可以使用`？`来实现这种表示：

```javascript
// ？代表这个属性有和没有都是可以的
let c2: { name: string; age?: number };  
```

如果需要需要 name 这一个属性，其他的属性无所谓，我们可以这么做：

```javascript
let d2: { name: string; [propName: string]: any };  // 代表必须包含 name 属性就可以了
d2 = { name: "猪八戒", xixi: "xixi", haha: "haha" };
```

既然对象可以提前定义其结构，那么理所当然函数也是可以提前定义其结构以及返回值的

![image-20220313081751269](https://oss.justin3go.com/blogs/image-20220313081751269.png)

限制函数结构的语法：

```javascript
let e2: (a: number, b: number) => number;
```

#### 数组

1. 我们可以使用`string[]`来表示字符串数组；

   ```ts
   let l2: string[];
   l2 = ["a", "b", "c"];
   ```

2. 还可以使用`Array<string>`来表示

   ```ts
   let i2: Array<string>;
   ```

#### 元组

> 元组：相当于固定长度的数组-->效率比较高

```ts
let h: [string, string];
h = ["haha", "xixi"];
```

#### 枚举

> 枚举：把所有的情况列举出来

```ts
enum Gender {
	Male,
	Feamle,
}
let j2: { name: string; gender: Gender };
j2 = {
	name: "悟空",
	gender: Gender.Feamle,
};
```

学一样东西必不可少的就是提问，新技术的出现必定是为了解决某一类问题，带有一定目的的，所以这种类型有什么好处吗？

![image-20220313082623000](https://oss.justin3go.com/blogs/image-20220313082623000.png)

其实上面的例子已经解释得非常清楚了，就是让某些标识符有语义。怎么理解这句话呢，比如如果没有该类型，我们表示男女一般会使用 01 来表示，那到底 0 是男还是 1 是男呢，当然 01 都可能是男/(ㄒoㄒ)/~~

![image-20220313083003251](https://oss.justin3go.com/blogs/image-20220313083003251.png)

开个玩笑，所以枚举就是为了解决这类问题的，它让我们在编程的时候更加方便地知道性别这个类包含哪种类型，简单来说是下面几点：

- 实际上这个值在转的时候就会转为 0，1
- 与直接 0，1 比较更容易辨识
- 与直接字符串比较更节约存储

然后，再补充一些小知识：

```javascript
// & 表示且
let g: { name: string } & { age: number };
// g = {name: "悟空"} --> 报错
```

```javascript
// 类型的别名
type myType = 1 | 2 | 3 | 4 | 5;
let k2: myType;
let h2: myType;
```

到这里，你几乎已经完成 TS 学习的一半了，是不是非常简单，接下来的内容如何小伙伴接触过 java、C++这种面向对象的语言，可能理解起来非常简单，接下来的知识就是 TS 中另外一个非常重要的概念**类**

![image-20220313083814386](https://oss.justin3go.com/blogs/image-20220313083814386.png)

## 类

> 当然，如果你熟悉 JS 中类的语法，对于接下来的理解也会非常简单

### 简介

还是和之前`hello world`一样，我们先来手写定义一个类，然后实例化这个类，认识一下它，一回生，二回熟嘛，知识也是这样的：

```javascript
// 使用 class 定义
class Person {
  // 实例属性
  name: string = "孙悟空";
  // 只读属性
  readonly gender:boolean = true;
  // 在属性前使用 static 关键字可以定义类属性（静态属性）
  static age: number = 18;
  sayHello(params:string):void {
    console.log('Hello!',params)
  }
}
```

```javascript
const per = new Person();
console.log(per.name);  //通过实例访问（duxier）
console.log(Person.age);  //通过对象名访问
```

是不是真的就没什么特别之处，学习成本超低的好吗，动起来动起来！

### 构造函数

这部分也可以说和 JS 中 ES6 语法的构造函数一模一样：

```javascript
class Dog {
	name: string;
	age: number;
	constructor(name: string, age: number) {
		this.name = name;
		this.age = age;
	}

	bark() {
		alert("汪汪汪!");
	}
}
```

### 继承

也是差不多的：

```javascript
class animal {
    name: string;
    age: number;
    constructor(name: string, age: number) {
        this.name = name;
        this.age = age;
    }

    sayHello() {
        console.log("动物在叫~");
    }
}
//共有的代码写在父类之中
class Dog extends animal {
    run(){
        console.log("旺仔再跑");
    }
}
class Cat extends animal {}
```

然后继承都来了，`super`关键字自然不会缺席

![image-20220313084913690](https://oss.justin3go.com/blogs/image-20220313084913690.png)

```javascript
	class Animal {
		name: string;
		age: number;
		constructor(name: string, age: number) {
			this.age = age;
			this.name = name;
		}
		sayHello() {
			console.log("动物在叫~");
		}
	}
	class Dog extends Animal {
		sayHello(): void {
      //调用父类的方法
			super.sayHello();
		}
	}
  // 用在添加属性后构造函数中
  class Cat extends Animal {
    color:string;
    constructor(name:string, age:number, color:string){
      super(name, age)
      this.color = color
    }
  }
```

当然，super 再在 JS 中是有一些限制的，这里默认是认为你们已经熟悉了 JS 了，还没熟悉的赶快去熟悉，来学什么 TS 呢？[推荐阅读红宝书的 p260]

### 抽象类

再回想一下，JS 中有抽象类吗？没有。能实现抽象类吗？可以：通过`new.target`的判断来判断是非常容易实现的：

```javascript
class animal {
  constructor(){
    console.log(new.target);  // 表示 new 关键字后面跟着的类型
    if(new.target === animal){
      throw new Error('xx 不能被实例化')
    }
  }
}
```

此时，你就不能直接实例化这个类了，只能通过继承，然后实例化其子类是没有问题的。

到这里，你可能会说别人其他语言都有`abstract`关键字使用，为什么我 JS 还要自己手动判断呢？似乎一点也不优雅！

![image-20220313090238262](https://oss.justin3go.com/blogs/image-20220313090238262.png)

于是 TS 中引入了`abstract`关键字，可以非常方便地帮助我们定义抽象基类：

除此之外，在 JS 中定义抽象方法也需要在构造器中多增加一个判断--this 下是否有某方法，没有就抛出异常，而这里 TS 的`abstract`关键字也可以使用在抽象方法上，非常方便

```ts
  // 不能用来创建对象，这个类就是用来被别人继承的
  // 抽象类中可以去添加抽象方法
  abstract class animal{  // 1
    name: string;
    constructor(name:string){
      this.name = name
    }
    abstract sayHello():void;  // 2
  }
```

### 接口

```ts
type myType = {
    name: string;
    age: number;
};
//接口就是用来定义一个类结构的
// 可以当作类型声明去使用
// 区别是重新再写一个 myInterface 不会报错，结果是合并
interface myInterface {
    name: string;
    age: number;
}
// 接口可以在定义类的时候限制结构
// 接口中所有的属性都不能有实际的值
// 接口只定义对象的结构而不考虑实际值
// 所有的方法都是抽象方法

// 去实现一个接口
class Mycalss implements myInterface {
    name: string;
    age: number;
    constructor(name: string, age: number) {
        this.age = age;
        this.name = name;
    }
}
```

### 属性的封装

再想一下，我们实现一个私有变量有多麻烦，用闭包实现仅在内部作用域能访问该变量，即私有化，然后再使用 weakmap 解决闭包导致的垃圾回收的问题，当然 ES6 中的#也可以非常方便的添加私有变量，而这里 TS 中的`private`似乎更符合我们在其他语言中见识的一致。

```javascript
//属性可以任意修改将会导致对象中的数据变得非常不安全
class Person {
    // pubulic 默认值，可以在任何地方修改
    // private：只能在内部修改,当前类,子类也不行
    // protected: 只能在当前类和当前类的子类中使用
    public _name: string;
private _age: number;

constructor(name:string, age:number){
    this._name = name;
    this._age = age;
}
// getName(){
//   return this.name
// }
// setName(value:string){
//   this.name = value
// }

//ts 中设置 getter 方法的方式
get name(){
    return this._name
}
}
// 其他地方就可以这样调用 name 属性
const per= new Person("1",1)
console.log(per.name);
```

最后，在补充一个泛型的概念，这个就和 C++中的泛型几乎一致，就是写函数时可以不定参数的类型，使用函数时在确定参数的类型：

C++中是这样的`vector<int> test`：向量中存储的类型是 int，`vector<string> test`：向量中存储的类型是 string

TS 中是这样使用的：

```ts
// 在定义函数或者是类时，如果遇到类型不明确就可以使用泛型
function fn<T>(a: T): T{
  return a;
}
//这样可以避免使用 any，同时保证我的参数以及返回值的类型时相同的
//使用
//可以直接使用具有泛型的函数
fn(10);
//指定泛型
fn<string>('hello')
```

最后最后，写作不易，支持一下哦~

![image-20220313092028334](https://oss.justin3go.com/blogs/image-20220313092028334.png)



