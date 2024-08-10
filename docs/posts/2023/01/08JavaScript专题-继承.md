---
title: JavaScript 专题-继承
date: 2023-01-08
tags: 
  - JavaScript
  - 继承
  - 原型链
  - 盗用构造函数
  - 组合式继承
  - 原型式继承
  - 寄生式继承
  - 寄生组合式继承
---

# JavaScript 专题-继承

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇关于 JavaScript 继承的文章中，笔者详细探讨了不同的继承实现方式及其优缺点。

首先，介绍了原型链继承的基本思想，指出其在共享引用值时的缺陷。接着，讨论了盗用构造函数的实现，这种方式避免了共享属性，但导致方法不能重用。随后，笔者结合两者优点提出组合式继承，虽然实现了属性和方法的灵活共享，但仍然调用了两次父类构造函数。接下来介绍了原型式继承和寄生式继承，它们各自的优缺点也被一一列举。最后，笔者提出了寄生式组合继承的解决方案，通过创建父类原型的副本，避免了不必要的构造函数调用，从而提升了效率。

整个文章旨在帮助读者深入理解 JavaScript 继承的复杂性与灵活性。

<!-- DESC SEP -->

> 此专题系列将对 JavaScript 重难点进行梳理，希望能融会贯通，加深印象，更进一步...

本章需要你比较熟悉原型链相关的知识，如果你还不熟悉或者略有忘记，可以看看我的往期文章（[JavaScript 专题-原型链](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/01/2JavaScript%E4%B8%93%E9%A2%98-%E5%8E%9F%E5%9E%8B%E9%93%BE.html)

## 各种方法整体认识

我们首先梳理一下各种继承实现的方法的进化史，这样更方便我们的记忆，从上往下都是上面有一定的缺点不能忍受，由此产生了对应下方的继承实现，最终寄生组合式继承结合上述优点成为最优的一种继承实现，包括后续官方 ES6 的继承 extends 也仅仅是这种实现的语法糖；

![](https://oss.justin3go.com/blogs/%E5%90%84%E7%A7%8D%E7%BB%A7%E6%89%BF%E5%AE%9E%E7%8E%B0%E6%96%B9%E5%BC%8F.png)

## 1.原型链方式

### 继承实现

基本思想就是通过原型链继承多个引用类型的属性和方法，关键语句就是将父类型作为子类型的原型：

```js{14}
function SuperType() {
  this.property = true;
}

SuperType.prototype.getSuperValue = function() {
  return this.property;
};

function SubType() {
  this.subproperty = false;
}

// 继承 SuperType
SubType.prototype = new SuperType();

SubType.prototype.getSubValue = function () {
  return this.subproperty;
};
let instance = new SubType();
console.log(instance.getSuperValue()); // true
```

这样`SuperType`实例中可以访问的所有属性和方法也会存在于`SubType.prototype`了

### 判断继承关系

**方式一：`instanceof`**

```js
console.log(subType instanceof SuperType) // true
```

**方式二：`isPrototypeOf()`**

```js
console.log(SuperType.prototype.isPrototypeOf(subType))  // true
```

### 缺点

- 主要问题出现在原型中包含引用值的时候，原型中包含的引用值会在所有实例间共享，即通过该方式实现的继承，如果父类包含引用值，该引用值就会在子类的所有实例中共享。
- 子类在实例化时不能给父类型的构造函数传参

## 2.盗用构造函数

### 继承实现

基本思路就是在子类构造函数中调用父类构造函数：

```js{7}
function SuperType() {
  this.colors = ["red", "blue", "green"];
}

function SubType() {
  //继承 SuperType
  SuperType.call(this);
}

let instance1 = new SubType();
instance1.colors.push("black");
console.log(instance1.colors); // "red, blue, green, black"
let instance2 = new SubType();
console.log(instance2.colors); // "red, blue, green"

```

这相当于新的`SubType`对象上运行了`SuperType()`函数中的所有初始化代码，结果就是子类的每个实例上都包含父类的属性。这种方法的优点是每个子类实例都有自己的属性副本，避免了引用类型属性被所有实例共享的问题。但缺点是没有继承原型，因此无法继承方法。在这里就是每个子实例都会拥有属于自己的`colors`属性，注意这与原型链实现的不同，原型链的方式是所有实例共享一个，而这里是为每个实例都新建了一个。

并且还有一个优点就是可以在子类构造函数中向父类构造函数传参

### 缺点

必须在构造函数中定义方法，因此函数不能重用，就是原型链的实现方式会导致我们不想要共享的属性（比如引用值）也跟着共享了，而盗用构造函数的实现方式会导致我们想要共享的通用方法也跟着都初始化了一次，就是实例化一次对象就初始化一次该方法。

## 3.组合式继承

### 继承实现

其实根据上述的缺点我们隐约就知道接下来的实现方式是什么样的了，就是组合式继承，上述两种继承实现方式明显就是相互补充的，所以这里结合他们从实现目的：我们可以根据需求做到有些属性或方法共享，而有些属性和方法不共享，具体哪些方法可以由我们自己决定。

> 这里的组合式继承就可以实现这样的效果：既可以把方法定义在原型上以实现重用，又可以让每个实例都有自己的属性。

```js{6,11-12,16-17}
function SuperType(name){
  this.name = name;
  this.colors = ["red", "blue", "green"];
}

SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType(name, age){
  // 继承属性
  SuperType.call(this, name);
  this.age = age;
}

// 继承方法
SubType.prototype = new SuperType();
SubType.prototype.sayAge = function() {
  console.log(this.age);
};

let instance1 = new SubType("Nicholas", 29);
instance1.colors.push("black");
console.log(instance1.colors);   // "red, blue, green, black"
instance1.sayName();               // "Nicholas";
instance1.sayAge();                // 29
let instance2 = new SubType("Greg", 27);
console.log(instance2.colors);   // "red, blue, green"
instance2.sayName();               // "Greg";
instance2.sayAge();                // 27
```

### 缺点

该实现方式基本达到了我们想要的目的，但还有一个致命的缺点就是：

调用了两次父类的构造函数：

1. `SuperType.call(this, name);`
2. `SubType.prototype = new SuperType();`

我们用白话描述一下这个过程：首先父类需要将方法写在原型上而不是作为自身的属性。然后通过盗用构造函数将所有的属性继承下来，最后通过原型链继承的方式将父类作为子类的原型，注意这里是将整个父类作为了子类的原型，并不是直接复制父类的原型。所以原型里面包含了父类的属性，即和子类的属性重复了，只不过这里是在原型，会被同名属性遮蔽而已，但也浪费了存储空间，增加了初始化的消耗

*关键就是我们通过原型链方式继承的时候使用的是整个父类的实例，导致子类的实例的原型上拥有了我们不需要共享的属性，这里其实就能想到一个基本的思路就是使用父类的原型赋值到子类的原型上，接下来详细讲一下这个继承实现方式。*

## 4.原型式继承

### 继承实现

**你可以简单地将这种方式理解为`1.原型链继承`的一个封装**，下面这个函数就是这种方式的关键思想：

```js
function object(o) {
	function F() {};
	F.prototype = o;
	return new F();
}
```

比如在 1.原型链方式中，我们是这样实现继承的：

```js
SubType.prototype = new SuperType();
let instance = new SubType();
```

而有了这个函数，我们就可以这样实现继承：

```js
let instance = object(new SuperType())
```

这种方式将原型赋值隐藏在了函数内部，方便开发者更加灵活地操作，其中关键的操作就是`object(o)`中的`o`参数不仅仅可以传入一个父对象的实例，还可以传入任何一个对象，**比如我们可以传入父对象的原型对象**，这样我们就可以非常方便地复制父对象地原型对象，这也是我们后面解决组合式继承缺点的关键一步

### 扩展

ES5 通过增加`Object.create()`方法将原型式继承的概念规范化了，这个函数可以传入两个参数，当只传入一个参数的时候，功能就和前面给的`object(o)`的代码效果相同了；

```js
let instance = Object.create(new SuperType())
```

*原型式继承非常适合不需要单独创建构造函数，但仍然需要在对象间共享信息的场合*

### 缺点

因为关键也是使用`1.原型链方式`实现的，所以缺点也是一样的，主要就是属性中包含的引用值始终会在相关对象间共享。

## 5.寄生式继承

### 继承实现

基本思路就是：创建一个实现继承的函数，以某种方式**增强对象**，然后返回这个对象。

就是比如我们使用前面的`let instance = object(new SuperType())`复制了父对象中的属性和方法，然后我们在此基础上增加一些我们需要自定义的一些新的属性和方法在`instance`上，这个操作就叫做增强这个对象，然后整个这种方式就是寄生式继承；

```js{1,3}
function createAnother(original){
  let clone = object(original);   // 通过调用函数创建一个新对象
  clone.sayHi = function() {      // 以某种方式增强这个对象
	console.log("hi");
  };
  return clone;              // 返回这个对象
}

// 使用该函数
let person = {
  name: "Nicholas",
  friends: ["Shelby", "Court", "Van"]
};
let anotherPerson = createAnother(person);
anotherPerson.sayHi();   // "hi"
```

### 缺点

注意我们在`createAnother()`函数中有一些自定义的方法，而这些方法在我们每次调用`createAnother()`函数创建一个新的实例的时候都会重新初始化一次，在这里就是上方代码中的第三行。

> 我们可以这样理解，通过寄生式继承这种方式的缺点其实和`2.盗用构造函数`的方式差不多，都是我们想要共享的方法也会跟着每次创建实例的时候都初始化一次。其实这里的`createAnother()`的效果和盗用构造函数是基本一致的

注意这里我们是在克隆对象本身上进行增强（添加方法），其实根据原型的知识，我们只需要在克隆的原型上添加我们想要共享的方法就可以了，当然具体实现稍微复杂一点，就是我们接下来要讲的终极解决方法`6.寄生式组合继承`

## 6.寄生式组合继承

在组合式继承中基本能达到我们预期中继承实现效果的目标，但是组合式继承存在一定的效率问题：就是父类构造函数始终会调用两次，一次是在创建子类原型时调用，另外一次就是在子类构造函数中调用，而现在的寄生式组合继承就是结合上面寄生式继承的思想来解决这个问题的。

基本思路就是：不通过调用父类构造函数给子类原型赋值，而是取得父类原型的一个副本。

```js
function inheritPrototype(subType, superType) {
	let prototype = object(superType.prototype); // 创建父类原型副本
	prototype.constructor = subType; // 增强对象，解决由于重写原型导致默认 constructor 丢失的问题 
	subType.prototype = prototype; // 将父类原型的副本赋值给子类原型
}
```

接下来，我们再稍微修改一下组合式继承的方式（结合上面寄生式的思想）就可以解决组合式继承的缺点了：

```js{10,13}
function SuperType(name) {
  this.name = name;
  this.colors = ["red", "blue", "green"];
}
SuperType.prototype.sayName = function() {
  console.log(this.name);
};

function SubType(name, age) {
  SuperType.call(this, name);
  this.age = age;
}
inheritPrototype(SubType, SuperType);
SubType.prototype.sayAge = function() {
  console.log(this.age);
};
```

这里就没有将整个父类赋值给子类的原型了，而仅仅是赋值了父类的原型给子类，最终这里只调用了一次`SuperType`构造函数，避免了`SubType.prototype`上不必要的属性。

## 参考

- 《JavaScript 高级程序设计》（第四版）
- https://juejin.cn/post/6844903696111763470
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

