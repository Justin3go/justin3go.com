---
title: IntersectionObserver 实现横竖滚动自适应懒加载
date: 2022-05-07
tags: 
  - IntersectionObserver
  - 懒加载
  - 横竖滚动
  - 自适应
---

# IntersectionObserver 实现横竖滚动自适应懒加载

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇文章中，笔者分享了如何使用`IntersectionObserver`实现横竖滚动的懒加载功能，特别是在使用`vitepress`编写个人网站时遇到的需求。由于组件中可能存放大量图片，懒加载显得尤为重要。`IntersectionObserver` API 允许我们监测元素与视窗的交叉状态，从而决定何时加载该元素。

文章详细介绍了`IntersectionObserver`的构造方法及其方法，包括`observe`、`unobserve`等。笔者的思路是，首先观察容器的可见性，如果容器可见，则开始观察其中图片的可见性，这样便实现了竖向懒加载和横向懒加载的结合。通过示例代码，笔者展示了如何在`onMounted`生命周期钩子中设置这些观察器，并在图片进入视口时加载它们，最终实现了流畅的懒加载效果。

<!-- DESC SEP -->

## 前言

这几天使用`vitepress`[编写个人网站的时候](https://juejin.cn/post/7160499086271971364)，编写了一个存放图片的组件，理所当然的，这个组件应该实现图片懒加载，并且由于这个组件存放的图片可以是非常多的，所以实现懒加载就显得极为重要了，但是由于我实现这个组件的方式有点特别，是用盒子的背景图来存放图片的，并且支持横向滚动，所以大致搜索了下了解到了`IntersectionObserver`这个 api 非常适合我用来实现这个功能（缺点就是兼容性可能差点）；

## IntersectionObserver 简要介绍
直接来到[MDN](https://developer.mozilla.org/zh-CN/docs/Web/API/IntersectionObserver)

介绍的比较简单，当然这个 api 使用起来也简单，但是实现的功能却可以非常丰富，这篇文章就仅仅介绍其可以实现的一种功能就是横竖滚动懒加载。

这个 api 的原理就是观察目标元素与其祖先元素或顶级文档视窗交叉状态，所以在我的例子中竖向滚动懒加载就是观察组件容器与根元素的交叉状态，而横向滚顶就是观察组件图片项与组件容器的交叉状态，这里简单提一下思路，后续通过代码详细介绍具体实现。

回到这个 api，要想使用这个 api，首先我们得使用它提供得构造器创建一个`IntersectionObserver`对象
```js
const io = new IntersectionObserver(callback, options)
```
这个对象接收两个参数：
- callback: 当其监听到目标元素的可见部分穿过了一个或多个阈 (thresholds)时，会执行指定的回调函数。
- options: 一些选项，比如指定 root 是谁

然后这个对象有如下几个方法供我们使用：

```js
IntersectionObserver.disconnect()  // 使 IntersectionObserver 对象停止监听工作。
IntersectionObserver.observe()  // 使 IntersectionObserver 开始监听一个目标元素。
IntersectionObserver.takeRecords()  // 返回所有观察目标的 IntersectionObserverEntry 对象数组。
IntersectionObserver.unobserve()  // 使 IntersectionObserver 停止监听特定目标元素。
```

下面是官方给的一个示例：

```js
// 无限滚动的功能（footer 出现在了视口中就加载 10 个项）
var intersectionObserver = new IntersectionObserver(function(entries) {
  // If intersectionRatio is 0, the target is out of view
  // and we do not need to do anything.
  if (entries[0].intersectionRatio <= 0) return; 

  loadItems(10);
  console.log('Loaded new items');
});
// start observing
intersectionObserver.observe(document.querySelector('.scrollerFooter'));

```

其中`entries`是一个数组，每个成员都是一个[`IntersectionObserverEntry`](https://developer.mozilla.org/en-US/docs/Web/API/IntersectionObserverEntry)对象，我们每次`.observe(element)`时，`entries`里就会多一个对应的项，相当于如果我们要观察多个目标元素，就需要在回调函数里进行统一处理。
介绍两个我们要用的`IntersectionObserverEntry`对象属性：
-   `target`：被观察的目标元素，是一个 DOM 节点对象
-  `intersectionRatio`：目标元素的可见比例，即`intersectionRect`占`boundingClientRect`的比例，完全可见时为`1`，完全不可见时小于等于`0`

## many-pictures 组件介绍
这是我自己编写的一个小组件，用来存放多张图片的容器，下面是它的样子

![demo-many-pictures](https://oss.justin3go.com/blogs/demo-many-pictures.gif)

目前在多个容器同时使用的话动画上会有卡顿，后续优化，但不妨碍我们讲解懒加载这个功能的实现。

可以看到如果我们在同一个页面中使用多次这个组件，或者这个组件放在其他内容的下面，初始加载消耗的实现就会特别大，比如我们这个页面使用了 100 个这个容器，就需要在页面初始时加载这个用户看不见的容器，这显然是不可行的，这就是我们平常所见的图片懒加载

如果我们这里使用`windows.onscroll`的那种懒加载方法的话，虽然可以，但是这是个全局方法，我并不是很想在我这个局部组件中使用它，而且它还需要进行节流操作，每次还要去获取图片距离顶部的高度，视窗的高度，滚动的距离等等，比较麻烦

而使用这个新的 api 的话一切都迎刃而解了...

其次，我们可以看到每个容器中也可以容纳多张图片，当这个容器中容纳了 100 张图片的时候，在这个容器加载的时候，就需要加载这个容器中包含的所有的 100 张图片，即使用户看不见右边没显示的图片，这显然是不合理的，所以这就是我们将要做的横向滚动懒加载

## 自适应懒加载实现

所以，到现在，我们手头上有了`IntersectionObserver`这个工具，然后需求就是实现容器的竖向懒加载和图片的横向懒加载。

确定思路：我们首先观察容器与视窗是否有交叉（是否显示给了用户），如果显示了就开始加载这个容器，这个加载容器的意思就是开始观察图片，然后就是观察图片与这个容器是否有交叉，如果有，就加载这个图片
![](https://oss.justin3go.com/blogs/lazy.png)
思路有了，代码就简单了，下面贴了对应代码的实现，当然你也可以直接访问这个组件实现的 github 链接查看所有的代码([源码链接](https://github.com/Justin3go/many-pictures))
```ts
onMounted(() => {
  if (props.lazy) {
    // 图片
    const ioImg = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio <= 0) return; // 是否出现在了可视区域
          const option = entry.target;
          // 图片链接放在这个属性上的
          const imgUrl = option.getAttribute("data-img");
          option.setAttribute("style", `background-image: url(${imgUrl})`);
          ioImg.unobserve(option);
        });
      },
      {
        root: mark.value, // 横向懒加载
      }
    );
    // 容器
    const ioContainer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.intersectionRatio <= 0) return;
        const container = entry.target;
        const list = container.querySelectorAll(".option");
        list.forEach((item) => {
          ioImg.observe(item);
        });
        isLoad.value = true;
        ioContainer.unobserve(container);
      });
    });
    ioContainer.observe(mark.value);
  } else {
    const list: NodeListOf<Element> = mark.value.querySelectorAll(".option");
    list.forEach((item) => {
      const imgUrl = item.getAttribute("data-img");
      item.setAttribute("style", `background-image: url(${imgUrl})`);
    });
  }
});
```
最后，效果图如下：
![demo-many-pictures](https://oss.justin3go.com/blogs/demo-many-pictures.gif)


