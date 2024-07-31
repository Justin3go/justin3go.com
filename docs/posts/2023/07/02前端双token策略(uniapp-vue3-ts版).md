---
title: 前端双 token 策略(uniapp-vue3-ts 版)
date: 2023-07-02
tags: 
  - uniapp
  - Vue 3
  - TypeScript
  - JWT
  - Pinia
  - GraphQL
---

# 前端双 token 策略(uniapp-vue3-ts 版)

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇文章中，笔者探讨了前端双 token 策略的实现，特别是在使用 uniapp 和 Vue 3 的环境下。

双 token 策略主要通过`access token`和`refresh token`来降低 JWT 泄露的风险，确保用户体验流畅。

具体流程包括：

1. 首先检查`access token`是否过期，若未过期则直接使用；
2. 若已过期，则检查`refresh token`的有效性，若有效则请求新的`access token`并更新存储；
3. 若`refresh token`也过期，则需要用户重新登录。

为了实现这一策略，笔者提供了一系列通用函数和拦截器代码，确保在每次请求中自动处理 token 的状态。此外，文章还介绍了如何实现`atob`函数，以便解码 JWT 并获取相关信息。通过这些实现，双 token 策略的应用不仅提升了安全性，还优化了用户体验。

<!-- DESC SEP -->

## 前言

前面写了一篇详细介绍[JWT 相关的文章](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/02/19%E6%94%BE%E5%BC%83Cookie-Session%EF%BC%8C%E6%8B%A5%E6%8A%B1JWT%EF%BC%9F.html)，其中提到了 JWT 中使用[双 token 的作用](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/02/19%E6%94%BE%E5%BC%83Cookie-Session%EF%BC%8C%E6%8B%A5%E6%8A%B1JWT%EF%BC%9F.html#%E5%8F%8Ctoken%E4%BD%9C%E7%94%A8)，这里简单回顾一下：

> 简单来说也是为了减轻 JWT 被泄露而造成的影响，具体来说分为`refresh token`和`access token`

| |access token|refresh token|
|-|-|-|
|有效时长|较短(如半小时)|较长(如一天)|
|作用|验证用户是否有操作权限|获取 access token|
|什么时候使用|每次需要用户登录态时传递该 token|access token 失效时使用|

> 这样做的好处就是：
> 
> 1. `access token`频繁传输，泄露风险较大，所以将其有效期设为较短可以有效降低泄露而造成的影响，比如此时攻击方最多伪装你半个小时;
> 2. `access token`存在时间较短，需要频繁获取新的，为了降低用户登录次数，提高用户体验，使用`refresh token`调用相关接口获取最新的`access token`。
> 3. `refresh token`存在时间长，泄露后影响较大，所以只有在`access token`失效时才传递，所以并不会频繁传输，即泄露风险较小
> 
> 主要就是兼顾泄露 token 的风险与泄露 token 的影响

由此可以看出双 token 的实现是很有必要的，所以本文将从前端角度介绍一下相关的策略，当后端有如下接口时：

1. 登录成功后返回`accessToken`与`refreshToken`
2. 携带`refreshToken`调用刷新 Token 的接口返回`accessToken`与`refreshToken`

> 由于笔者使用的是`GraphQL`接口，担心有些读者可能没有使用过，所以上面仅用文字描述接口

## 策略概述

![](https://oss.justin3go.com/blogs/%E5%8F%8Ctoken%E7%AD%96%E7%95%A5%E5%89%8D%E7%AB%AF.png)

1. 发起一个正常请求，如获取用户的资料详情
2. 检查`accessToken`是否过期，这里是通过其中的`expire`字段，后续会详细谈到
3. 如果没有过期，则直接在`header`上添加该字段，就可以表明自己的身份了，从而正常请求

4. 如果已经过期，则判断`refreshToken`是否过期
5. 如果`refreshToken`没有过期，则携带该`token`进行`refresh`请求，获取新的双`token`并保存
6. 携带新的`accessToken`进行请求

7. 如果已经过期，则要求用户重新登录

为了实现上述策略，我们先准备几个通用函数，比如获取`token`中的`expire`字段、保存`token`等通用函数

## 实现浏览器的 atob 函数

简单介绍一下`atob`函数，它是用来解码`base64`字符串的，因为为了方便网络传输，JWT 是进行了`base64`编码的，所以想要获取 JWT 中携带的相关信息，就需要先使用`atob`解码。

但是在微信小程序中，你可以发现在微信开发工具中可以调用该`atob`函数，但到真机演示的时候就无法调用了，会显示`atob`不存在，所以这里我们需要自实现一个`atob`函数，比如在`/utils/base64.ts`文件中：

```ts
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

export function atob(input: string) {
  var str = (String (input)).replace (/[=]+$/, ''); // #31: ExtendScript bad parse of /=
  if (str.length % 4 === 1) {
    throw new Error ("'atob' failed: The string to be decoded is not correctly encoded.");
  }
  for (
    // initialize result and counters
    var bc = 0, bs, buffer, idx = 0, output = '';
    // get next character
    buffer = str.charAt (idx++); // eslint-disable-line no-cond-assign
    // character found in table? initialize bit storage and add its ascii value;
    // @ts-ignore
    ~buffer && (bs = bc % 4 ? bs * 64 + buffer : buffer,
      // and if not first of each 4 characters,
      // convert the first 8 bits to one ascii character
      bc++ % 4) ? output += String.fromCharCode (255 & bs >> (-2 * bc & 6)) : 0
  ) {
    // try to find character in table (0-63, not found => -1)
    buffer = chars.indexOf (buffer);
  }
  return output;
}
```

> 如上函数改写自[该仓库的代码实现](https://github.com/davidchambers/Base64.js/blob/master/base64.js)

如下是该函数的调用效果演示：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230702103328.png)

当然前提是后端返回的 JWT 是包含了该字段的，该字段也是[规范](https://jwt.io/introduction)中的字段，赶紧叫你的后端加上该字段吧，又不麻烦\[doge\]：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230702103603.png)

## 实现操作 token 的通用函数

同样是在`utils/auth.ts`文件中，逻辑非常简单，如下：

```ts
import { atob } from "./base64";

// 在 auth.js 中定义设置和获取 token 的方法
export function getToken(accessOrRefreshKey: "accessToken" | "refreshToken"): string {
	return uni.getStorageSync(accessOrRefreshKey);
}

export function setToken(accessOrRefreshKey: "accessToken" | "refreshToken", value: string) {
	return uni.setStorageSync(accessOrRefreshKey, value);
}
// 清除双 token
export function clearToken() {
	uni.removeStorageSync("accessToken");
	uni.removeStorageSync("refreshToken");
}

// 获取过期时间，token 需要符合 JWT 格式且有 exp 属性
export function getExpireInPayload(token: string): number {
	if(!token) return -1; // 所有时间戳都会大于-1，即没有 token 也算过期，做相应的过期处理，如跳转登录
	const parts = token.split(".");
	const payload = JSON.parse(atob(parts[1]));
	return Number(payload.exp);
}
```

## 拦截器实现该策略

然后，我们就可以使用 uniapp 自带的 request 拦截器实现该双 token 策略，基本逻辑就和概述中描述的逻辑是一致的，可以参考着查看以下代码，`main.ts`中：

```ts
let inRefresh = false;
// 请求拦截器
uni.addInterceptor("request", {
	async invoke(request) {
		uni.showLoading({ title: "正在请求中..." });
		const meStore = useMeStore();
		// meStore.inLogin 是 pinia 中判断当前请求是否为登录请求
		if (meStore.inLogin || inRefresh) return request;

		const timestamp = Math.ceil(+new Date().getTime() / 1000); //获取当前的时间戳

		// 1. access 部分
		const accessToken = getToken("accessToken"); // 获取身份验证令牌
		const expInAccessToken = getExpireInPayload(accessToken);
		// accessToken 未过期，直接加入请求头请求
		if (timestamp < expInAccessToken) {
			request.header.Authorization = `Bearer ${accessToken}`;
			return request;
		}

		// 2. refresh 部分
		const refreshToken = getToken("refreshToken");
		const expInRefreshToken = getExpireInPayload(refreshToken);
		// refreshToken 未过期，刷新 Token
		if (timestamp < expInRefreshToken) {
			const { execute } = useMutation(refreshTokenGQL);
			inRefresh = true; // 避免递归栈溢出
			const { data, error } = await execute({ token: refreshToken });
			inRefresh = false;
			console.log("refresh data: ", data);
			console.log("refresh error: ", error);
			// save
			const { accessToken: newAccessToken, refreshToken: newRefreshToken } = data?.refreshToken || {};
			request.header.Authorization = `Bearer ${newAccessToken}`;
			setToken("accessToken", newAccessToken);
			setToken("refreshToken", newRefreshToken);
		} else {
			// refreshToken 过期，需要重新登录
			uni.reLaunch({
				url: "/pages/me/index",
				success: () => {
					uni.showToast({
						title: "登录凭证无效",
						icon: "error",
						duration: 2000,
					});
				},
			});
		}
		return request;
	},
	fail(err) {
		uni.showToast({
			title: `网络请求错误`,
			icon: "error",
			duration: 2000,
		});
	},
	complete() {
		// showLoading 需要每次请求前手动添加，因为里面有可自定义的 title
		uni.hideLoading();
	},
});
```

## 最后

上述代码在[该仓库](https://github.com/Justin3go/xiaoyou-mp/blob/main/src/utils/base64.ts)中都全部存在，欢迎查看






