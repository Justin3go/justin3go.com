---
title: 浅谈 NestJS 设计思想（分层、IOC、AOP
date: 2023-01-25
tags: 
  - NestJS
  - 设计模式
  - 分层
  - IOC
  - AOP
---

# 浅谈 NestJS 设计思想（分层、IOC、AOP

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中深入探讨了 NestJS 框架的设计思想，重点分析了分层架构、控制反转（IoC）和面向切面编程（AOP）。

首先，分层架构使得不同层次的逻辑清晰可分，便于维护和扩展，强调了 Service 层的必要性，以提高代码的复用性和模块化。其次，IoC 通过依赖注入的方式减少了类之间的紧耦合，使得系统更具灵活性，便于未来的修改和扩展。最后，AOP 通过在请求处理链中引入切面，简化了通用逻辑的管理，如日志记录和权限验证等。

这些设计思想相辅相成，提升了 NestJS 的可维护性和可扩展性，值得开发者在实际项目中深入理解和应用。

<!-- DESC SEP -->

---

> nestJS 用了有一定时间了，当初学习 node 后端选择的第一个 web 框架，这篇文章将对 NestJS 框架层面的几个重要概念进行梳理，希望能加深记忆，融汇贯通，更进一步，本文阅读需要对 nestJS 有一定使用经验。

## 分层

nestJS 经常被调侃为 srpingJS，所以这里参考 java 项目的[阿里分层规范](https://www.kancloud.cn/kanglin/java_developers_guide/539198)，其架构图如下：

> 图中默认上层依赖于下层，箭头关系表示可直接依赖，如：开放接口层可以依赖于 Web 层，也可以直接依赖于 Service 层，依此类推：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230125151727.png)

- **开放接口层**：可直接封装 Service 方法暴露成 RPC 接口；通过 Web 封装成 http 接口；进行网关安全控制、流量控制等。
- **终端显示层**：各个端的模板渲染并执行显示的层。当前主要是 velocity 渲染，JS 渲染，JSP 渲染，移动端展示等。
- **Web 层**：主要是对访问控制进行转发，各类基本参数校验，或者**不复用**的业务简单处理等。
- **Service 层**：相对具体的业务逻辑服务层。
- **Manager 层**：通用业务处理层，它有如下特征：
	1. 对第三方平台封装的层，预处理返回结果及转化异常信息；
	2. 对 Service 层通用能力的下沉，如缓存方案、中间件通用处理；
	3. 与 DAO 层交互，对多个 DAO 的组合复用。
- **DAO 层**：数据访问层，与底层 MySQL、Oracle、Hbase 等进行数据交互。
- **外部接口或第三方平台**：包括其它部门 RPC 开放接口，基础平台，其它公司的 HTTP 接口。

不同的业务场景，不同的应用大小，程序复杂度高低，可以灵活的增删上述某些结构。无论是 nest 还是 egg，官方 demo 里都没有明确提到 dao 层，直接在 service 层操作数据库了。这对于简单的业务逻辑没问题，如果业务逻辑变得复杂，service 层的维护将会变得非常困难。业务一开始一般都很简单，它一定会向着复杂的方向演化，如果从长远考虑，一开始就应该保留 dao 层，在 nestJS 中并未查看到相关规定，可根据开发者场景自行考虑。如下是 nestJS 的分层架构图：

![](https://oss.justin3go.com/blogs/nestjs%E5%88%86%E5%B1%82.png)

对于 Web 层：在 nestJS 中，如果使用 restful 风格，就是 controller；如果使用 graphql 规范，就是 resolver...对于同一个业务逻辑，我们可以使用不同的接口方式暴露出去。

经常被问到和提起的问题就是**为什么需要有 service 层**：
- 首先 service 作用就是在里面编写业务逻辑代码，一般来说，都是为了增加代码复用率，实现高内聚，低耦合等...
- 体现在这里的好处就是上述提到的同一段业务代码可以使用不同的接口方式暴露出去，或者可以在一个 service 内调用其他 service，而非在一个接口函数里面调用另外一个内部接口，这是极其不优雅的。
- 当然，老生常谈的就是不同功能目的的代码分开写方便维护管理等等

> 有关 nestJS 实战入门可以参考我之前写的[这一系列文章](https://justin3go.com/%E7%9F%A5%E8%AF%86%E5%BA%93/NestJS/01controller.html)或者[官方链接](https://docs.nestjs.com/first-steps)

## IOC(Inversion of Control)

中文为控制反转，是[面向对象程序设计](https://zh.wikipedia.org/wiki/%E9%9D%A2%E5%90%91%E5%AF%B9%E8%B1%A1%E7%A8%8B%E5%BA%8F%E8%AE%BE%E8%AE%A1)的一种设计原则，下面简单认识一下为什么需要 IOC，IOC 有什么好处，简单来说就是减少了固定性，通过外部传参进行控制内部本身固定的一些变量，如下例子：

在我们的代码中，经常会出现一个类依赖于另外一个类的情况，比如这样：

```ts
class Dog {}

class Person {
  private _pet

  constructor () {
    this._pet = new Dog()
  }
}

const xiaoming = new Person()
```

在上述例子中：
- `Person`类固定依赖于`Dog`类，如果后续`Person`想要依赖于其他宠物类，是无法轻易修改的。
- 并且如果`Dog`类有所变化，比如其属性颜色染成了黑色，`Person`类也会直接受到影响。

IOC 的思想就是将类的依赖动态注入，以解决上述两个问题：

```ts
class Dog {}

class Person {
  private _pet

  constructor (pet) {
    this._pet = pet
  }
}

const xiaohei = new Dog()
const xiaoming = new Bird(xiaohei) // 将实例化的 dog 传入 person 类
```

这样，我们就实现了类的控制反转，同时，我们需要有一个容器来维护各个对象实例，当用户需要使用实例时，容器会自动将对象实例化给用户，这部分通常由框架处理，结合 nestJS 框架进行理解的话可以参考我之前写的这篇笔记--[nestJS 原理细节](https://justin3go.com/%E7%9F%A5%E8%AF%86%E5%BA%93/NestJS/06%E5%8E%9F%E7%90%86%E7%BB%86%E8%8A%82.html)或者[官方文档](https://docs.nestjs.com/fundamentals/custom-providers)

这种动态注入的思想叫做**依赖注入**（DI, Dependency Injection），它是 `IoC` 的一种应用形式。

## AOP(Aspect Oriented Programming)

中文为面向切面编程。当一个请求打过来时，一般会经过 Controller（控制器）、Service（服务）、Repository（数据库访问） 的链路。当我们不使用 AOP 时，需要添加一些通用逻辑时（如日志记录、权限守卫、异常处理等等），就需要在每段请求逻辑中编写相关代码。

AOP 就是在所有请求外面包裹一层切面，所有请求都会经过这个切面，然后我们就可以把上述的通用逻辑放在这个结构里，如下图：

![](https://oss.justin3go.com/blogs/AOP.png)

在 nestJS 中实现 AOP 的方式有很多，比如（excepion filter、pipes、guards、interceptors），相关介绍可参考我之前的这篇笔记--[更多模块](https://justin3go.com/%E7%9F%A5%E8%AF%86%E5%BA%93/NestJS/08%E6%9B%B4%E5%A4%9A%E6%A8%A1%E5%9D%97.html#%E5%9F%BA%E6%9C%AC)或者[官方文档](https://docs.nestjs.com/exception-filters)

## 最后

这些思想架构都需要长期的经验体会才更深，我开发经验不足，更多是参考网上的文章和自己非常浅薄的经验进行理解，如有理解错误，欢迎友善指出...

## 参考
- [nestJS 官方文档](https://docs.nestjs.com/)
- [nestJS 原理细节](https://justin3go.com/%E7%9F%A5%E8%AF%86%E5%BA%93/NestJS/06%E5%8E%9F%E7%90%86%E7%BB%86%E8%8A%82.html)
- [什么是 AOP 和 IoC](https://hentaicracker.github.io/2020/aopioc.html)
- [Nest.js 的 AOP 架构的好处，你感受到了么？](https://juejin.cn/post/7076431946834214925#heading-8)
- [java 为什么要分为 service 层，dao 层，controller 层？](https://www.zhihu.com/question/431911268)
- [mvc 与三层结构终极区别](https://blog.csdn.net/csh624366188/article/details/7183872)
-  [nest 后端开发实战（二）——分层](https://segmentfault.com/a/1190000016992060)
- [Web 开发的历史发展技术演变](https://segmentfault.com/a/1190000023740835)
- [Java 项目如何分层](https://xie.infoq.cn/article/e50e460c9723825aea4851c06)
- [阿里巴巴 java 开发手册](https://www.kancloud.cn/kanglin/java_developers_guide/539198)

