---
title: 小程序(uniapp)上传头像至 OSS(阿里云)--保姆级
date: 2023-04-05
tags: 
  - 小程序
  - uniapp
  - 阿里云
  - OSS
  - NestJS
  - GraphQL
  - TypeScript
---

# 小程序(uniapp)上传头像至 OSS(阿里云)--保姆级

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇博客中详细介绍了如何将用户头像上传至阿里云 OSS 的过程，特别是在微信小程序改版后，获取用户头像和昵称的必要性。整个流程主要包含五个步骤：

1. 使用微信组件获取用户选择的头像的临时路径；
2. 获取阿里云 OSS 的操作授权；
3. 配置后端服务生成临时授权的服务；
4. 上传文件至 OSS；
5. 将头像路径保存到数据库用户表中。

笔者提供了详细的代码示例和配置步骤，特别是如何使用 NestJS 与 GraphQL 进行后端服务的设置，以及如何通过环境变量安全管理阿里云的凭证。最后，笔者强调了小程序开发在用户体验中的重要性，并鼓励读者在遇到问题时进行讨论和交流。希望这篇**保姆级教程**能对开发者们有所帮助。

<!-- DESC SEP -->

## 前言

自[微信小程序改版](https://developers.weixin.qq.com/community/develop/doc/000cacfa20ce88df04cb468bc52801)以来，现在获取用户的头像和昵称就不能直接通过[wx.getUserInfo](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/user-info/wx.getUserInfo.html)获取了。而是需要用户主动在登录后填写自己的昵称和头像，微信只是提供一个一键填写的快捷操作让用户直接使用自己已有的微信昵称或头像。

如果是想做一个比较完善的小程序系统，那么头像昵称的修改可谓是每个带用户的小程序开发都需要经历的。

昵称还好，就是一个文本字符串，但是头像的话我们就需要上传至自己的服务器或者是一些云对象存储服务，这里我选择的是阿里云 OSS 服务，下面开始我的**保姆级教程**。

## 流程概览

![](https://oss.justin3go.com/blogs/%E5%BE%AE%E4%BF%A1%E5%B0%8F%E7%A8%8B%E5%BA%8F%E4%B8%8A%E4%BC%A0%E9%98%BF%E9%87%8C%E4%BA%91OSS%E6%97%B6%E5%BA%8F%E5%9B%BE.png)

如上是整个上传头像的一个时序图，总的来说有这五步:

1. 通过微信自带组件获取用户选择头像的临时文件路径
2. 获取对 OSS 的操作授权
3. 配置后端服务生成临时授权的服务
4. 获取授权并上传文件至 OSS
5. 将新的头像路径保存到数据库用户表中

好，接下来我们就以上述五步慢慢道来：

## 1. 获取头像临时路径

> 据描述：是要将 [button](https://developers.weixin.qq.com/miniprogram/dev/component/button.html) 组件 `open-type` 的值设置为 `chooseAvatar`，当用户选择需要使用的头像之后，可以通过 `bindchooseavatar` 事件回调获取到头像信息的临时路径。

所以笔者编写了如下代码：

```vue
// template
<button class="avatar-wrapper" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
	<uni-icons type="forward" size="30" color="#D3D3D3"></uni-icons>
</button>
```

```ts
// script
function onChooseAvatar(e: any) {
	console.log("choose avatar: ", e.detail);
	user.avatarUrl = e.detail.avatarUrl;
}
```

为了让`button`样式透明，所以`style`代码如下

```scss
.avatar-wrapper {
	padding-left: 0;
	padding-right: 0;
	height: 50px;
	line-height: 50px;
	background-color: transparent;
	border-color: transparent;
}

.avatar-wrapper::after {
	border: none;
}
```

这里笔者在`button`里面包裹了一个`icon`，因为我不想要`button`的样式，而仅仅用户点击`icon`就可以修改头像。

此时我们点击就可以获取头像的临时路径了：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405100333.png)

然后我们选择微信头像或者本地上传的图片后就可以出现如下的日志信息：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405100436.png)

到这里，我们这一步就已经完成了，已经获取到如上的头像临时路径了...

## 2. 获取 OSS 操作授权

这里假设你已经开通了[OSS 服务](https://oss.console.aliyun.com/overview) ，开通过程非常简单，毕竟花钱的过程一般来说都是非常简单的，一步到位🤬。这里就不过多赘述了。

如果你想要你的 OSS 服务拥有自己的专属域名以及 CDN 加速的话，可以查看我之间写的这篇文章--[CDN 实践配置+原理篇](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2022/13CDN%E5%AE%9E%E8%B7%B5%E9%85%8D%E7%BD%AE+%E5%8E%9F%E7%90%86%E7%AF%87.html#%E5%B8%B8%E8%A7%81%E7%9A%84oss%E9%85%8D%E7%BD%AE%E6%96%B9%E5%BC%8F)

首先我们[创建一个我们阿里云账号的子用户](https://ram.console.aliyun.com/users)，这个子用户我们后续会将它授权给我们的服务器，让我们的服务器操作该子用户，拥有其拥有的权限。你的就是我的🤭

**1）配置阿里云-访问控制**

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405103136.png)
![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405103159.png)

按照上述的流程点击创建后，就会出现如下页面，这里值得注意的是我们需要**保存**好其中的`accessKeyId`以及`accessKeySecret`

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405103406.png)
拥有这个 Id+Secret 相当于我们就拥有了这个用户的身份，就可以操作该身份具有的资源了，但是此时我们还没有赋予其任何权限，所以这里我们赋予其操作 OSS 的权限，尽量不要赋予过多的权限，做好权限收敛：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405104716.png)

当然，如果你有多个用户有同样的权限操作，也可以使用用户组进行管理，这里不展开了。

点击添加权限，选择`AliyunOSSFullAccess`

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405104844.png)

**2）配置阿里云-OSS-细化授权**

然后我们继续对 OSS 进行细化配置：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405105255.png)

**3）配置阿里云-OSS-跨域访问**

如果你的 OSS 之前已经可以访问了，这里就不需要配置了，如果是第一次配置，那么记得还要对 OSS 进行跨域访问的配置，这也是很多网友出现 403 的主要原因。

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405105820.png)

好，此时我们就拥有了一个有效的`AccesssKeyId`和`AccessKeySecret`l 了

## 3. 配置服务器

这里我使用的是服务端签名，你也可以使用客户端签名临时凭证。并且我这里使用的后端技术栈是`NestJS + GraphQl`，如果你是其他技术栈，可以参考[原官方文档](https://help.aliyun.com/document_detail/92883.html)进行自定义

**0）安装**

```sh
npm i crypto-js @types/crypto-js
```

**1）`/src/utils/oss.interface.ts`**

```ts
export interface MpUploadOssHelperOptions {
  // 阿里云账号 AccessKey
  accessKeyId: string;
  // 阿里云账号 AccessId
  accessKeySecret: string;
  // 限制参数的生效实践，单位为小时，默认值为 1
  timeout?: number;
  // 限制上传文件大小，单位为 MB，默认值为 10
  maxSize?: number;
}
```

**2）`/src/utils/oss.ts`**

```ts
import * as crypto from 'crypto-js';
import { MpUploadOssHelperOptions } from './oss.interface';

// 详见：https://help.aliyun.com/document_detail/92883.html
export class MpUploadOssHelper {
  private accessKeyId: string;
  private accessKeySecret: string;
  private timeout: number;
  private maxSize: number;

  constructor(options: MpUploadOssHelperOptions) {
    this.accessKeyId = options.accessKeyId;
    this.accessKeySecret = options.accessKeySecret;
    // 限制参数的生效时间，单位为小时，默认值为 1。
    this.timeout = options.timeout || 1;
    // 限制上传文件的大小，单位为 MB，默认值为 10。
    this.maxSize = options.maxSize || 10;
  }

  createUploadParams() {
    const policy = this.getPolicyBase64();
    const signature = this.signature(policy);
    return {
      OSSAccessKeyId: this.accessKeyId,
      policy: policy,
      signature: signature,
    };
  }

  getPolicyBase64() {
    const date = new Date();
    // 设置 policy 过期时间。
    date.setHours(date.getHours() + this.timeout);
    const srcT = date.toISOString();
    const policyText = {
      expiration: srcT,
      conditions: [
        // 限制上传文件大小。
        ['content-length-range', 0, this.maxSize * 1024 * 1024],
      ],
    };
    const buffer = Buffer.from(JSON.stringify(policyText));
    return buffer.toString('base64');
  }

  signature(policy) {
    return crypto.enc.Base64.stringify(
      crypto.HmacSHA1(policy, this.accessKeySecret)
    );
  }
}
```


**3）`src/oss/models/oss.model.ts`**

```ts
import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Oss {
  @Field()
  OSSAccessKeyId: string;

  @Field()
  policy: string;

  @Field()
  signature: string;
}
```

**4）`src/oss/oss.module.ts`**

```ts
import { Module } from '@nestjs/common';
import { OssService } from './oss.service';
import { OssResolver } from './oss.resolver';

@Module({
  providers: [OssService, OssResolver],
})
export class OssModule {}
```

**5）`src/oss/oss.service.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { MpUploadOssHelper } from 'src/utils/oss';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OssService {
  constructor(private readonly configService: ConfigService) {}

  getPostObjectParams() {
    const mpHelper = new MpUploadOssHelper({
      accessKeyId: this.configService.get<string>('ACCESS_KEY_ID'),
      accessKeySecret: this.configService.get<string>('ACCESS_KEY_SECRET'),
      timeout: 1,
      maxSize: 1,
    });

    // 生成参数
    const params = mpHelper.createUploadParams();

    return params;
  }
}
```

注意：这里我是通过环境变量获取的`ID`和`KEY`，环境变量的使用可参考[这篇文章](https://docs.nestjs.com/techniques/configuration#configuration)

**6）`src/oss/oss.resolve.ts`或者`src/oss/oss.controller.ts`**

这里就体现了 service 作为业务层的作用了，无论我们是想使用 GraphQL，还是使用 REST API 暴露接口，都可以非常灵活的替换，如下是 GraphQL 的代码：

```ts
import { UseGuards } from '@nestjs/common';
import { Resolver, Query } from '@nestjs/graphql';
import { GqlAuthGuard } from 'src/auth/gql-auth.guard';
import { Oss } from './models/oss.model';
import { OssService } from './oss.service';

@Resolver()
export class OssResolver {
  constructor(private readonly ossService: OssService) {}

  @UseGuards(GqlAuthGuard)
  @Query(() => Oss)
  getPostObjectParams() {
    return this.ossService.getPostObjectParams();
  }
}
```

演示：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405112525.png)

## 4. 上传文件至 OSS

如下代码，这里使用的是 GraphQL 请求的接口，如果你是使用的 REST API，基本流程也是一样的：

```ts
async function uploadAvatar(filePath: string) {
	// 1. 请求服务端签名凭证
	const { execute } = useQuery({ query: getPostObjectParamsGQL });
	uni.showLoading({ title: "正在请求上传凭证中..." });
	const { error, data } = await execute();
	if (error) {
		uni.showToast({
			title: `上传头像失败: ${error}`,
			icon: "error",
			duration: 2000,
		});
		throw new Error(`上传头像失败: ${error}`);
	}

	// 2. 上传图片至 oss
	const { OSSAccessKeyId, policy, signature } = data?.getPostObjectParams || {};

	const imgType = filePath.split(".").pop();
	const key = `wxmp/${userData?.id}.${imgType}`;
	uni.showLoading({ title: "正在上传图片中..." });
	const ossRes = await uniUploadFile({
		url: ossHost, // 开发者服务器的 URL。
		filePath,
		name: "file", // 必须填 file。
		formData: {
			key,
			policy,
			OSSAccessKeyId,
			signature,
		},
	});
	uni.hideLoading();

	return ossHost + "/" + key;
}
```

上述代码我是以用户的 uid 重命名图片文件的，就是 key 这个属性值，你也可以自定义你自己的文件命名方式。

演示：

![](https://oss.justin3go.com/blogs/%E5%B0%8F%E7%A8%8B%E5%BA%8F%E5%A4%B4%E5%83%8F%E4%B8%8A%E4%BC%A0OSS%E6%BC%94%E7%A4%BA.gif)

然后 OSS 中就可以查看到这张图片了：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405121314.png)

## 5. 保存数据库用户表

这一步其实就很简单了，也没什么参考价值，就是请求 API，然后保存到数据库就可以了，具体代码就不贴了，如下是效果：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230405121454.png)
## 最后

小程序的开发几乎是程序员的必备操作，自带流量，前期非常好用，不过就是开发文档确实看着不舒服，平台改版我们也需要跟着改版...

然后用户登录以及自定义头像都是小程序们非常常见的操作，这里演示一下过程希望对你有所帮助，如果有操作不当，欢迎在评论区中友善指出..

![](https://oss.justin3go.com/blogs/QQ%E5%9B%BE%E7%89%8720230405121919.jpg)

## 参考

- [微信开放文档-获取头像昵称](https://developers.weixin.qq.com/miniprogram/dev/framework/open-ability/userProfile.html)
- [阿里云开发文档-微信小程序直传实践](https://help.aliyun.com/document_detail/92883.html)
- [NestJS 官方文档-环境变量配置](https://docs.nestjs.com/techniques/configuration#configuration)

