---
title: PIXIJS 快速一览
date: 2023-05-09
tags: 
  - PIXIJS
  - 游戏开发
  - 动画效果
  - 前端开发
  - 渲染引擎
---

# PIXIJS 快速一览

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中介绍了 PIXIJS，一个快速、轻量、开源的渲染引擎，适合前端开发者用于创建小游戏和动画效果。文章强调 PIXIJS 并非一个完整的游戏开发框架，而是专注于图像和动画的呈现。笔者通过简单的示例代码说明了 PIXIJS 的基本构建块，包括应用舞台、精灵、容器和纹理等。

此外，笔者阐述了容器的角色，它帮助组织舞台中的对象，提供了遮罩和滤镜功能。对于图形的创建，笔者提供了示例代码，并提醒开发者在使用后注意卸载以避免内存泄漏。文章还提到交互和文本处理的基本知识，强调性能优化的重要性。最后，笔者鼓励读者通过实践来深化对 PIXIJS 的理解，并欢迎反馈以改进自己的学习。

<!-- DESC SEP -->

## 前言

还记得我们最开始选择计算机专业的时候，是多少人抱着做一个游戏的初心选择这个专业的。结果一进去就跟随大众方向做了软件开发，然后就没然后了。

所以，最近稍微空闲下来了，就想着自己做一个小游戏出来玩玩或者说练练手。自己作为前端开发，所以就没必要单独学习 Unity 或者说虚幻引擎这类的工具了。就直接找个 webGL 相关的游戏引擎来用用吧，然后我就发现了 PIXIJS，感觉不错，我们一起来学学它。

作为前端，[学了它不仅可以做一个小游戏，以后做一些有意思的动画效果也可以用到它](https://pixijs.com/gallery/)，可谓是一举多得，该学！

> 注：本文为 PIXI 入门教程，不会深入

## 是什么

官网原文：[PixiJS 是什么](https://pixijs.io/guides/basics/what-pixijs-is.html)

笔者感觉的主要特点就是：

1. 快
2. 轻量
3. 开源

软件开发中一个非常重要的思想就是“小而美 ”，当然原话笔者忘了，这是现在笔者想到的最符合这个意思的一句话。

> 有所为，有所不为，即找准边界

就好比 UNIX 的文件系统的设计理念：

> 每个 Unix 文件都只是一系列字节的组合。文件内容的结构或组织方式只由处理它的程序决定，文件系统本身并不关心文件中的内容。这意味着任何程序都可以读取或写入任何文件。
>
> 每个 Unix 文件都只是一系列字节的组合。文件内容的结构或组织方式只由处理它的程序决定，文件系统本身并不关心文件中的内容。这意味着任何程序都可以读取或写入任何文件。

回到这里，PIXI 就只是一个渲染引擎，它既不是一个框架，也不是一个游戏动画库、音频库，就好比官网中说到：

> 如果您正在为您的下一个基于 Web 的项目寻找一个专注、快速和高效的渲染引擎，PixiJS 可能是一个非常合适的选择。
>
> 如果您需要一个完整的游戏开发框架，具有原生绑定和丰富的 UI 库，您可能需要探索其他选项。

那如何理解渲染引擎这个关键词呢？简单来说：就是负责将代码中描述的图像和动画内容呈现在屏幕上的工具。

## 最小的一个例子

```html
<!doctype html>
<html>
  <head>
    <script src="https://pixijs.download/release/pixi.min.js"></script>
  </head>
  <body>
    <script>
      // 创建应用并插入 DOM
      let app = new PIXI.Application({ width: 640, height: 360 });
      document.body.appendChild(app.view);

      // 创建图像对象并放入应用中
      let sprite = PIXI.Sprite.from('sample.png');
      app.stage.addChild(sprite);

      app.ticker.add((delta) => {
		// 动画处理，比如平移
      });
    </script>
  </body>
</html>
```

好，到现在你应该记住一个基本的 PIXI 例子应该有：

- [应用舞台(`app.stage`)](https://pixijs.io/guides/basics/scene-graph.html)
- [跳舞的精灵(如`sprite`)](https://pixijs.io/guides/basics/sprites.html)
- [音乐节奏(`ticker`)](https://pixijs.io/guides/basics/render-loop.html)

## 容器(Container)

当舞台中跳舞的人多了之后，分队(分组)就显得很有必要了。`Container`就是扮演这样一个角色。有了它，舞台中就形成了类似于 DOM 树的结构了，`app.stage`作为根节点。

> 几乎每种类型的显示对象也都派生自 `Container`

比如上述中的`sprite`也继承于它，但为什么不用`sprite`来分组呢？想想`sprite`还实现了许多特定领域的方法和属性，虽然也可以作为`container`来使用，但是不是成了炮弹打蚊子了呢？浪费！

除分组功能之外，`container`还有以下两个常见作用：

- 遮罩：PS 里面的蒙版，前端里面的`overflow: hidden`；值得注意的是，那些继承于`container`的对象肯定也有这个属性(功能)，比如`Graphics`创建几何图形作为几何遮罩等等；
- 滤镜：比如模糊效果，通过在容器上设置过滤器，容器包含的屏幕区域都会有这个滤镜效果。

## 纹理(Textures)

简单来说就是某片屏幕区域的像素源，比如常见的就是加载一个图像作为该屏幕的像素源。

加载过程：`Source Image` > `Loader` > `BaseTexture` > `Texture`

解释一下几个关键词：

`Loader`：提供了用于异步加载图像和音频文件等资源的工具，而后面两个听名字你应该就知道是啥关系了：

- `BaseTexture`是一个低级别的纹理数据源，它定义了一个纹理的加载和处理方式，并提供了一些用于控制纹理属性、缓存处理、加载管理和镜像等操作的方法。`BaseTexture`实例通常包含一张或多张纹理图像的数据信息，这些图像可以是来自于网络的 URL，也可以是 Canvas 画布或者图片资源等。
- 而`Texture`则是`BaseTexture`的高级封装，它包含一个或多个用于渲染的纹理，同时也具有基于`BaseTexture`的镜像、缩放、平移等变换操作。`Texture`类提供了许多有用的方法和属性，比如调整纹理的尺寸、获取纹理的 UV 贴图、设置填充模式等等。

```js
const baseTexture = PIXI.BaseTexture.from("./textures/game.png");
const texture = new PIXI.Texture(
  baseTexture,
  new PIXI.Rectangle(75, 0, 88, 100)
);
const sprite = new PIXI.Sprite(Texture);
```

注意：不常用的纹理记得手动卸载`destory()`。

## 图形(Graphics)

就是创建所谓直线、矩形、圆形、贝塞尔曲线能你能想到的图形；

```js
// 1. 先创建结构
let obj = new PIXI.Graphics();
obj.beginFill(0xff0000);
obj.drawRect(0, 0, 200, 100);

// 2. 后添加
app.stage.addChild(obj);
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230509102112.png)

[你可以在这里找到绘制这些图形的代码](https://pixijs.io/examples/#/graphics/simple.js)

同样需要注意卸载`destory()`，PIXI 并不会自动回收。

## 互动

> [DisplayObject](https://pixijs.download/release/docs/PIXI.DisplayObject.html)是引擎可以呈现的任何内容的核心类。它是精灵、文本、复杂图形、容器等的基类，并为这些对象提供许多通用功能。如移动、缩放、旋转和组合等

任何`DisplayObject`派生对象（`Sprite`、`Container` 等）都可以通过将其`interactive`属性设置为`true`来实现交互，比如对某个图片监听点击事件：

```js
let sprite = PIXI.Sprite.from('/some/texture.png'); sprite.on('pointerdown', (event) => { alert('clicked!'); });
```

默认情况下，PixiJS 使用交互式对象的边界矩形来确定鼠标或触摸事件是否“点击”了该对象。有时候，比如我们需要对一个复杂的图形创建点击区域，并只想记录该形状内的点击，就需要[DisplayObject 的 hitArea 属性](https://pixijs.download/release/docs/PIXI.AnimatedSprite.html#hitArea)

除此之外，你还可以通过`hitTest`在某一区域寻找可交互对象，用来做碰撞检测比较合适：

```js
let globalPt = new PIXI.Point(100,50);
let obj = app.renderer.plugins.interaction.hitTest(globalPt);
```

注意：前端中有事件捕获和事件冒泡等阶段，而这里也是树结构，所以如果您的容器或其他对象具有您知道永远不会交互的复杂子树，则可以将`interactiveChildren`属性设置为`false`，命中测试算法将在检查悬停和单击事件时跳过这些子树。

## 文本(Text)

没啥说的，就创建文本对象，然后文本对象有一些常见的样式属性，这对于前端程序员来说一点也不陌生。

官网中提到有一些注意的地方：

> 首先，更改现有文本字符串需要重新生成该文本的内部渲染，这是一个缓慢的操作，如果您每帧更改许多文本对象，可能会影响性能。如果您的项目需要同时在屏幕上显示大量经常更改的文本，请考虑使用 [PIXI.BitmapText 对象](https://pixijs.download/release/docs/PIXI.BitmapText.html)，该对象使用固定的位图字体，当文本更改时不需要重新生成。
> 
> 其次，缩放文本时要小心。将文本对象的比例设置为 > 1.0 将导致模糊/像素显示，因为文本不会以看起来清晰所需的更高分辨率重新呈现 - 它仍然与生成时的分辨率相同。为了解决这个问题，您可以改为以更高的初始尺寸和缩小比例进行渲染。这将使用更多内存，但会让您的文本始终看起来清晰明快。

## 最后

本文主要叙述了 PIXI 作为渲染引擎包含三种基本的要素：

1. 场景，根节点就是`app.stage`
2. 里面的对象，如`Container`、`Sprite`、`Graphics`、`Text`等等
3. 时间线`Ticker`，每一帧该做什么

本文没有讲述例子，但程序员的学习肯定少不了实践，官网这里有非常多了[入门教程示例](https://pixijs.io/examples/#/demos-basic/container.js)

好，没了，休息休息~

笔者目前也是作为 PIXI 的新手，如果上述中有一些理解不到位或者说错误的地方，欢迎友善指出

## 参考

- [PIXI 官网 Guides](https://pixijs.io/guides/)

