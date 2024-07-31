---
title: 在 uniapp 中使用 GraphQL 的一些探索
date: 2023-11-14
tags: 
  - uniapp
  - GraphQL
  - Vue
  - Villus
  - fetch
  - setup
---

# 在 uniapp 中使用 GraphQL 的一些探索

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中分享了在 uniapp 中使用 GraphQL 的探索过程。首先提到，虽然 GraphQL 在 nest.js 等服务端应用中有丰富的资料，但在 uniapp 的技术栈中相对匮乏。因此，笔者介绍了如何利用一个名为 Villus 的小库来实现与 Vue 的响应式结合，简化 GraphQL 的使用。

接着，笔者详细说明了如何将 Villus 的 fetch 请求替换为 uni.request，以适配 uniapp 的网络请求方式。通过创建 setup.ts 文件并重写 fetch，成功实现了 uniapp 中 GraphQL 的请求功能。此外，笔者还建议将 GraphQL 查询字符串单独封装，提高代码的可读性和管理性，并展示了如何在组件中实际使用这些封装好的查询。

最后，笔者希望能为国内的 uniapp 与 GraphQL 结合提供一些参考，并期待与读者的讨论。

<!-- DESC SEP -->

## 前言

前面做了一个小程序，[传送门](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/05/07%E4%B8%A4%E4%B8%AA%E5%A4%9A%E6%9C%88%E6%8D%A3%E9%BC%93%E4%BA%86%E4%B8%80%E4%B8%AA%E5%81%A5%E5%BA%B7%E7%B1%BB%E5%B0%8F%E7%A8%8B%E5%BA%8F.html)，最近正在重构这个小程序，线上的暂时不能访问，敬请期待！

其中使用了 GraphQL 的技术，对于服务端如 nest.js 应用程序对于 GraphQL 的支持以及相关资料都非常丰富，这里就不细谈了；但是关于国内技术栈 uniapp 对于 graphQL 的资料就相对来说比较少了。

所以这里简单谈谈我在 uniapp 这个 client 中是如何使用 GraphQL 的。当然，请注意标题《探索》二字，这并不是最佳实践，如果你有更好的写法，也欢迎讨论~

其他：如果你对 GraphQL 一无所知，关于 GraphQL 是什么，有什么好处，可以瞧瞧我之前写的这篇文章--[了解 API 相关范式（RPC、REST、GraphQL）](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/01/28%E4%BA%86%E8%A7%A3API%E7%9B%B8%E5%85%B3%E8%8C%83%E5%BC%8F(RPC%E3%80%81REST%E3%80%81GraphQL).html)

> 此文章基于 vue3/vite 版
## 使用 Villus

如果你的项目属于 Vue+GraphQL，也许你就可以试试这个[小而美的库`Villus`](https://villus.logaretm.com/guide/overview/)

这个库和 Vue 的响应式结合得非常好，对 Vue 熟悉的话使用起来也较为优雅，比如官网中的这个例子使用查询：

```html
<template>
  <div>
    <div v-if="data">
      <pre>{{ data }}</pre>
    </div>
  </div>
</template>
<script setup>
import { useQuery } from 'villus';
const { data } = useQuery({
  query: '{ posts { title } }',
});
</script>
```

值得注意的是，`data`变量就已经被封装成了响应式，所以你可以很方便地在 template 中使用它。

## 更改 villus 的网络请求方式为 uni.request

由于 Uniapp 等小程序中使用的都是自己的网络请求方法，比如封装的`uni.request`，这里我们需要使用`uni.request`替换其中的 fetch 插件，大致过程如下：

![](https://oss.justin3go.com/blogs/villus-fetch.png)

具体来说，我们在某个文件夹下（比如我是 src/graphql）中创建一个 setup.ts，这里参考了[这篇文章](https://rea.ink/blogs/frontend/uni-app-graphql.html)的相关逻辑：

```ts
import { createClient, fetch } from "villus";

type Methods =
  | "OPTIONS"
  | "GET"
  | "HEAD"
  | "POST"
  | "PUT"
  | "DELETE"
  | "TRACE"
  | "CONNECT";

// 此处重写 fetch，请求采用 UniAPP 提供的 uni.request
const fetchPlugin = fetch({
  fetch(url, options) {
    return new Promise((resolve, reject) => {
      uni.request({
        url: url.toString(),
        method: options?.method as Methods,
        data: options?.body as any,
        header: options?.headers,

        success(res) {
          resolve({
            ok: true,
            status: res.statusCode,
            headers: res.header,
            text: async () => JSON.stringify(res.data),
            json: async () => res.data,
          } as Response);
        },
        fail(e) {
          reject(e);
        },
      });
    });
  },
});

export const apolloClient = createClient({
  url: `${import.meta.env.VITE_SERVER_IP}/graphql`,
  use: [fetchPlugin],
});
```

此时，关于在 uniapp 中使用 villus 相对于 web 方便使用的特殊逻辑就处理完成了

## 稍微封装一下

平常我们在使用 axios 请求时，基本都会将 api 字符串单独提出来放在一个文件夹如`src/apis/`之类的。这里我们也将需要使用到的 graphql 字符串单独提出来，放在我们之前创建的文件夹`src/graphql`下。当然，你可以根据自己的习惯进行自定义。

针对每一个模块，我都单独建立了一个文件`graphql-XXX.ts`，比如用户模块就是`graphql-user.ts`，都放置于`src/graphql/`下。

其中的文件内容就是关于 graphql 的查询字符串，比如：

```ts
// graphql-user.ts

import gql from "graphql-tag";

export const refreshToken = gql`
  mutation refreshToken($token: JWT!) {
    refreshToken(token: $token) {
      accessToken
      refreshToken
    }
  }
`;

// 更多...
```

然后为了方便其他文件导入，我又在`src/graphql/`下新建了一个`index.ts`文件：

```ts
import * as home from "./graphql-home";
import * as questionnaire from "./graphql-questionnaire";
import * as analyze from "./graphql-analyze";
import * as user from "./graphql-user";
// ...

/* how to use
import GQL from "@/graphql"
const curGQL = GQL.home.listAsOwner
**/
export default {
  home,
  questionnaire,
  analyze,
  user,
};
```

这里你也可以选择直接`export * from "./graphql-home";`这样，但是由于可能不容模块的查询字符串存在命名冲突，所以选择了上述方式导出，这样就有了一个命名空间，使用其他就是上方注释的部分：

```ts
import GQL from "@/graphql"
const curGQL = GQL.home.listAsOwner
```

## 示例

好的，写了这么多，接下来就开始在实际需求中使用上述封装的部分，比如这样一个查询数量并展示的组件就是这么写的：

```html
    class="analytics-count-container uni-white-bg uni-shadow-sm uni-radius-lg"
  >
    <uni-row>
      <uni-col :span="14">
        <image
          class="img"
          style="width: 100%"
          mode="widthFix"
          :src="countLeft"
        ></image>
      </uni-col>
      <uni-col :span="10">
        <view class="label uni-mt-8 uni-primary-dark">
          <view class="top">已填写</view>
          <view class="bottom uni-mt-4">{{ count }}</view>
        </view>
      </uni-col>
    </uni-row>
  </view>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { countLeft } from "../const/img-url";
import { useQuery } from "villus";
import GQL from "@/graphql";

const { data, execute: _execute } = useQuery({ query: GQL.home.countAsFriend });

const count = computed(() => data.value?.me.countAsFriend ?? "--");
</script>
```

关键代码就是：

```ts
const { data, execute: _execute } = useQuery({ query: GQL.home.countAsFriend });
const count = computed(() => data.value?.me.countAsFriend ?? "--");
```

> `_execute`是我自定义的 eslint 规则：下划线开头的变量定义但未使用不会报错，因为这里可能父组件会调用这个方法，所以解构了这个变量

## 最后

好了，大功告成，正如标题所说，这些是笔者在 uniapp 中使用 graphql 的一些探索，国内关于 graphql 的资料较少，结合 uniapp 资料就更少了，希望对你有所帮助，也希望大家不吝赐教。