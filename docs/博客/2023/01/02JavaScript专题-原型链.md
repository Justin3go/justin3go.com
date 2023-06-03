# JavaScript专题-原型链

> 此专题系列为又一次重新阅读了《高程4》后，对JavaScript重难点进行了梳理，希望能融会贯通，加深印象，更进一步...

## 原型定义

> 这里通过多方面对原型进行描述，因为其实大家多多少少都接触过原型相关的知识，不理解可能只需要某句话就能点破，希望对你有所帮助。

**原型`prototype`其实就是每个构造函数的一个内置属性**，或者说每个函数都有这样一个属性，毕竟所有函数都可以做构造函数，当然箭头函数除外，那只是JS简化一些写法的机制，与普通函数有一定区别。任何时候我们在创建一个普通函数时，都会按照特定的规则为这个函数创建一个`prototype`属性，所以我们可以访问它。

```js
function Person(name) {
    console.log('exec...');
    this.name = name
}

Person.prototype.city = 'Beijing'

Person.prototype.skill = function(){
    console.log('coding...');
}

```

**这个`prototype`属性是一个对象**，这个原型对象上的属性和方法都可以被对应的构造函数创建的实例所共享，这点也是原型最重要的性质之一。

```js
const p1 = new Person('Justin3go');
const p2 = new Person('XXX');

console.log(p1.name, p2.name);
console.log(p1.city, p2.city);
p1.skill();
p2.skill();
```
	exec... 
	exec... 
	Justin3go XXX 
	Beijing Beijing
	coding...
	coding...

> **值得注意**的是，实例并没有`prototype`属性，只有构造函数拥有该属性。如果你了解`new`操作符的过程的话可能对此比较清楚，它只是在实例化的过程中会把构造函数的`prototype`赋值给实例的一个内部特性指针`[[Prototype]]`上，然后浏览器会在每个实例对象上暴露`__proto__`执行访问操作。后续ES6才规范了`Object.getPrototype()`方法访问原型

我们可以把原型对象作为每个相关实例的上层作用域，通俗来说就是实例上没有的变量名，会往上层作用域找，这里就是先找的自己的原型对象里面是否包含该变量名；既然是作用域，当实例上包含和原型同名的方法或属性时，访问的就只会是实例自己定义的了，这就是常说的覆盖。

这个原型对象中除了自定义的属性和方法，还有就是一个特殊的属性叫做`constructor`，其指向构造函数。这样，所有的实例都可以访问该属性从而获取自己的构造函数了

## 深入理解原型

这里我们再来梳理一下这个过程：

1. 首先我们创建了一个构造函数想要去生成一些实例对象
2. JS会自动给这个构造函数生成一个原型对象
3. 然后我们基于原型的特性把想要共享的属性和方法添加到了构造函数的原型上
4. 之后我们实例化的时候会将构造函数的原型对象赋值给实例对象中的内部指针，注意赋值不是复制，只是指向，实例和构造函数的原型都是一个
5. 然后我们访问实例对象中的属性，发现实例本身没有，就会自动去找原型上的

![](https://oss.justin3go.com/blogs/%E5%8E%9F%E5%9E%8B%E9%93%BEdemo%E7%9A%84%E6%89%A7%E8%A1%8C%E8%BF%87%E7%A8%8B.png)

然后在这个例子中，我们再来梳理一下关于构造函数、实例、原型的一个关系，下面这个图就可以非常清晰明了的表达了：

![](https://oss.justin3go.com/blogs/%E6%9E%84%E9%80%A0%E5%87%BD%E6%95%B0_%E5%AE%9E%E4%BE%8B_%E5%8E%9F%E5%9E%8B%E7%9A%84%E5%85%B3%E7%B3%BB.png)

## 原型链

在JavaScript中，我们都知道每个对象都有一个`[[Prototype]]`指针指向其原型对象，而原型对象也是对象，所以原型对象也包含一个`[[Prototype]]`指针指向更上一层的原型对象。这就是形成我们常说的原型链的基础。

![](https://oss.justin3go.com/blogs/%E5%8E%9F%E5%9E%8B%E9%93%BE.png)

我们再简化一下这张图，让你对链的加深一下记忆：

![](https://oss.justin3go.com/blogs/%E5%8E%9F%E5%9E%8B%E9%93%BE%E7%AE%80%E7%89%88.png)

## 关于原型对象中的`constructor`属性

这里说说我们经常见到的一个问题就是为什么不要使用对象的`constructor`属性来判断该对象属于哪类：

```js
const arr1 = new Array();
console.log(arr1.constructor === Array);

function Person(){};
const p1 = new Person();
console.log(p1.constructor === Person);
```
	true
	true

`constructor`虽然可以拿来判断类型，但是不是百分百准确的，比如如果创建一个对象来改变它的原型，`constructor`就不能用来判断数据类型了

```js
function Person(){};
Person.prototype = {
	skill: function(){
		console.log('coding...');
	},
	city: "beijing"
	
}
const p1 = new Person();
console.log(p1.constructor === Person);
console.log(p1.constructor);
```
	false
	[Function: Object]

这是因为我们是以对象字面量`{}`来直接对原型进行赋值的，而之前是通过点操作符增加属性的，前者是完全覆盖，所以原型改变了，而`{}`是`Object()`的简化方式，所以此时该原型的`constructor`就等于`Object`了，所以这里就是`false`了

## 参考
- 《JavaScript高级程序设计》(第4版)
- https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Inheritance_and_the_prototype_chain

