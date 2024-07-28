---
title: 看看openai发布会
date: 2023-11-08
tags: 
  - openai
  - GPT-4 Turbo
  - API
  - Assistant
  - GPTs
---

# 看看openai发布会

> 摘要

<!-- DESC SEP -->

笔者在这篇文章中探索了如何在uniapp中使用GraphQL，尤其是结合Vue和Vite的环境。首先，笔者提到使用了一个名为`Villus`的库，它与Vue的响应式特性结合良好，使得GraphQL查询的使用变得优雅。接着，笔者详细介绍了如何将`Villus`的默认网络请求方式替换为uniapp的`uni.request`，以适应小程序的环境，并提供了具体的代码示例。

此外，笔者还建议将GraphQL查询字符串封装到单独的文件中，以便于管理和维护，展示了如何创建一个组织良好的模块结构。最后，通过一个实际的组件示例，笔者展示了如何应用上述封装的GraphQL查询，强调了在国内技术栈中关于GraphQL的学习和实践的重要性。这些探索希望能为其他开发者提供参考和帮助。

<!-- DESC SEP -->
# 看看openai发布会
## GPT-4 Turbo

### 上下文长度

- GPT-4最高支持8k，某些情况能高达32k
- 而GPT-4 Turbo支持128K token，相当于300页标准书

### 更多的控制

- 调用API更加容易：JSON模式的新功能，确保模型将使用有效的JSON进行响应
- 更好的函数调用，可以同时调用多个函数：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020231107183414.png)

- 可再现输出：你可以传递一个C参数，它就会建立模型返回一致的输出，给与你对模型行为更高程度的控制权
- 在API中查看日志（未来几周会推出）

### 更好的世界知识

- 检索功能，可以从外部文件中带来知识
- GPT-4 Turbo训练的数据截至2023年4月

### 新模态

- Dolly 3，GPT-4 Turbo with Vision和新的文本转语音模型都有了API
- GPT-4 Turbo现在可以通过API接受图像作为输入，输出韦标题、分类、分析等
- 有6种预设声音，较为自然

### 定制

- 允许微调16K的3.5
- GPT-4微调进入申请阶段

### 速率限制

可在API账户设置中申请更改速率限制和配额

### 价格

> 他们承诺不使用来自API的数据进行训练


定价：比GPT-4的输入词便宜3倍，输出词便宜两倍

![](https://oss.justin3go.com/blogs/Pasted%20image%2020231107194203.png)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020231107194223.png)

速度：GPT-4 Turbo变得更快了

chatGPT网页版有优化：无下拉选项，根据你的需求自动选择

## GPTs

GPTs是chatGPT的定制版本，用于特定目的，你可以构建一个GPT，一个自定义版本的chatGPT对于几乎任何事情，结合如下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020231107195327.png)

- 结合计算机学科进行教学
- canvas设计
- 6000个应用的集成，通过GPT来决定调用哪个应用

有意建造GPT商城（类似于应用商店）

## Assistant API

- 不必自己处理长对话历史
- 内置检索、代码解释器等
- GPT-4 Turbo的一些优势

![](https://oss.justin3go.com/blogs/Pasted%20image%2020231107211209.png)

[更多](https://platform.openai.com/docs/assistants/overview)
## 其他

其他资料：https://zw73xyquvv.feishu.cn/wiki/Km3pw96e6i3X8ok3NqHcVT0InEh

[课代表总结](https://twitter.com/Crypto_QianXun/status/1721796113873895671)：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020231108082738.png)