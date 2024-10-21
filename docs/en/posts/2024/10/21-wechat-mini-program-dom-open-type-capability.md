---
title: 微信小程序为DOM无缝增加open-type开放能力
date: 2024-10-21
tags: 
  - 微信小程序
  - Vue Mini
  - 开放能力
  - CSS
  - 事件处理
---
# 微信小程序为DOM无缝增加open-type开放能力

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇文章中，笔者分享了在开发微信小程序时，如何通过CSS技巧实现`button`和`cell`组件的协同工作。由于微信小程序出于安全考虑，无法通过JS模拟点击，因此必须在界面上使用`button`组件来调用开放能力，比如打开意见反馈页面。为了解决样式统一的问题，笔者将`button`嵌套在`cell`中，并通过CSS隐藏`button`的默认样式。

然而，这样的做法导致`cell`的点击反馈消失，因为事件被`button`捕获。经过分析，笔者借助`pointer-events`属性，使得`button`不捕获鼠标事件，而其内部的`cell`组件可以正常响应点击。最终，笔者成功实现了既能打开反馈页面，又保留了`cell`的点击反馈效果的功能。这种方法有效地结合了样式与功能，为开发者提供了实用的解决方案。

<!-- DESC SEP -->

## 前言

最近在尝试 Vue Mini 这个框架，来开发一个小程序，祝我成功（因为半途而废的项目真的太多太多了）

期间遇到一个场景，就是需要用户点击`cell`单元格组件时调用微信小程序提供的开放能力。比如，点击`cell`时打开意见反馈的页面。
## 遇到的问题 - 必须存在的Button

首先，微信小程序为了安全起见，是不支持JS模拟点击的操作的，即我是无法通过JS来打开意见反馈的功能。这也很好理解，因为比如用户手机号、头像等隐私信息如果可以通过JS来获取，那么你只要一登录该小程序，你的信息就被拿完了，而你却浑然不知。

所以，页面上是必须存在`button`组件的，这里简单解释一下，微信小程序提供的能力都是放在`button`组件上的，比如刚才的意见反馈页面的打开，就只需要在`button`组件上加上`open-type="feedback"`即可，更多开放能力可以参考[微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/component/button.html)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020241021152722.png)

但是为了页面统一，笔者这里是使用的`cell`，而这里又需要`button`，有没有办法让其共存呢，即样式展示的`cell`，而点击效果是触发的`button`。当然有，这里是本文接下来要讲到的。

## 解决问题 - CSS隐藏Button

既然提到样式，很容易的想到使用CSS来解决，我们先找个位置放上这个`button`，这里笔者使用`button`套用`cell`组件，像下面这样：

```html
<button open-type="feedback" >
	<t-cell title="意见反馈" leftIcon="chat-message" hover arrow />
</button>
```

此时页面的效果如下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020241021154639.png)

可以看到携带了一些`button`组件的自带样式，比如左右`padding`，`border`之类的，这里我们去除`button`自带的默认样式：

```html
<button class="no-style-btn" open-type="feedback" >
	<t-cell title="意见反馈" leftIcon="chat-message" hover arrow />
</button>
```

```css
.no-style-btn {
  padding: 0;
  border-radius: 0;
}

.no-style-btn::after {
  display: none;
}
```

这是现在的效果：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020241021160054.png)

## 新的问题 - 消失的Cell点击反馈

也支持点击跳转到意见反馈的页面了，看着没效果，但是稍微注意一下就会发现此时点击`cell`组件的点击反馈消失了，之前是会有这个置灰效果的（这里用上面的`cell`点击做演示）：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020241021160242.png)

## 分析问题 - 事件未传递给Cell

通过绑定`button`和`cell`组件打印日志：

```html
<button class="no-style-btn" open-type="feedback" bind:tap="handleBtnTap" >
	<t-cell title="意见反馈" leftIcon="chat-message" hover arrow bind:tap="handleCellTap" />
</button>
```

我们可以清楚的看到我们在点击意见反馈时，`handleCellTap`根本没有触发，这也很好理解，事件被父元素的button给捕获了，自然不会传递给下面的子组件`cell`。

## 解决问题 - `pointer-events`自定义事件触发

这里笔者稍微问了一个Claude，它给出了`pointer-events`方法来解决，简单来说，就是让`button`不进行事件捕获，让`cell`来捕获事件，然后通过事件冒泡的机制，自动向上传递。

最终其实就这三句代码：

```css
.no-style-btn {
  padding: 0;
  border-radius: 0;
  pointer-events: none; /* 让按钮不捕获鼠标事件 */
}

.no-style-btn > view {
  pointer-events: auto; /* 让按钮内的元素捕获鼠标事件 */
}

.no-style-btn::after {
  display: none;
}
```

此时我们的意见反馈`cell`也有了对应的点击反馈，同时也能触发 open-type 的开放能力了：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020241021161142.png)