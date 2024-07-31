---
title: Nest 的 test 中的 best 是 Jest 框架
date: 2023-05-01
tags: 
  - 单元测试
  - Jest
  - Nest
  - Mock
  - 持续集成
---

# Nest 的 test 中的 best 是 Jest 框架

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇文章中，笔者分享了自己在五一假期期间为一个小系统补充单元测试的经验，特别是使用 Jest 框架进行测试的过程和技巧。

单元测试被定义为对软件系统中的最小可测试单元进行验证，笔者通过生动的比喻强调了单元测试的重要性，例如将其比作小学数学题的验算。文章详细介绍了单元测试的好处，如提高代码质量、可维护性和可读性，并阐述了单元测试的相关概念和覆盖率指标。

此外，笔者还提供了在 Nest 框架中配置 Jest 的具体步骤，以及如何使用 Mock 技术避免直接操作数据库。最后，笔者展示了如何在持续集成中自动化测试，确保代码质量。在整个过程中，笔者用轻松幽默的风格，鼓励读者重视单元测试的实践。

<!-- DESC SEP -->

## 前言

趁着五一放假，花了 3 天时间给自己之前做的一个小系统基本补完了单元测试，趁此机会>脑袋里对于单元测试的知识还算热乎，来输出一篇比较详细的关于单元测试的文章，以梳理知识，融汇贯通；如果对你有所帮助，当然最好不过🎉

标题是不是挺有趣的😀😀😀，不过`best`可能有待商榷，毕竟最高级这种单词还是不能随便乱用，下面先看运行截图：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230501082617.png)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230501082633.png)

嗯^~^，舒服了...

![](https://oss.justin3go.com/blogs/QQ%E5%9B%BE%E7%89%8720230501082945.jpg)

虽然还有一点小瑕疵，但是不伤大雅，下面细细道来...

## 单元测试的好处

### 什么是单元测试

首先谈谈单元测试的定义，它是什么，了解它才能知道它的优点有哪些塞：单元测试是一种软件测试方法，它对软件系统中的最小可测试单元进行测试，通常是函数或者方法。

来，我们一起来理解一下这个定义：

- 好比我们小学做数学题，每做完一题之后是不是需要验算一次，才能放心地做下一道题，这就是单元测试，以一道题目作为一个单元进行测试；
- 而当我们做完整张试卷的时候，通常也要花 20 分钟去对整张卷子再检查一遍，甚至不止一遍，才能放心交卷。
- 虽然最后一次的全部检查一次虽然很有必要，毕竟是要交付了嘛；但是很多时候也是在进行重复性的工作，至少笔者以前做试卷是这样的：把每一次的验算方法再做一遍，才能心安...

试卷中当然只能手算，但程序中却可以有很大的优化，这也是计算机的优势之一——自动化。

这得益于"算法"中的一个性质-`确定性(Definiteness)`，这意味着我们编写了一个函数，我们可以清晰的知道这个函数每个步骤运行之后最终的结果，也就是同一个输入用例，程序的输出预期都是一样。

![](https://oss.justin3go.com/blogs/%E7%AE%97%E6%B3%95%E4%B8%AD%E7%9A%84%E7%A1%AE%E5%AE%9A%E6%80%A7%E6%BC%94%E7%A4%BA.png)

我们学 C 语言课程的时候，是不是要写一个`helloWorld()`函数，写完之后我们是不是要运行才能知道我们写得对不对是吧。而一个软件系统就是由非常多的“`helloWorld()`”这种函数单元组成的。

- 此时我们就不可能再手动地去`console.log(helloWorld(case1))`之类的重复性工作，就需要自动化的单元测试了，以方便我们再每一次交付的时候，非常放心地知道之前做的每一道题都没有问题；
- 甚至说很多题目都是有关联的，比如第一小题错了，整道大题都得不了分了。软件系统中的每一个程序之间的关联依赖更为复杂，很多时候即使 99%的代码单元都没问题，那 1%的错误代码也可能导致整个系统崩溃。

这里其实也简单谈了谈单元测试的必要性了，下面就详细谈谈单元测试的好处

### 提高代码质量

不经过测试的代码，你自己能放心吗？答案是否定的。

在编写单元测试的时候，会给我们再一次思考该函数单元的逻辑的机会。如果按照先写代码，再写测试用例的流程来说：

- 在写函数单元代码的时候，我们可能更多的是作为一个局里人；而在写测试的时候，我们就成为了一个旁观者，在阅读、思考、评判“另一个自己”写的代码。
- 就好比生成式对抗网络(GAN)的基本思想——**对抗**，它的主要结构包括一个生成器和一个判别器。此时“写代码的自己”就是生成器，而“写测试的自己”就是判别器。效果自然非常不错。

“左脚踩右脚”还真能上天

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230501111816.png)

🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣

### 提高代码可维护性

这一点主要得益于“自动化”这个特性，它不需要我们重复为以前的代码编写测试用例，一次编写基本可以在后续一直使用。

具体来说：

- 一个软件系统通常是非常复杂的，代码之间的关联依赖可能非常高，在不对所有函数单元进行测试的前提下，你很难放心你的新增代码是否有影响到其他的部分，让其它的函数单元不能正常运行。
- 特别是作为螺丝钉的打工人，对整个软件系统还不是很熟悉的时候，很难保证自己新增的改动是否有影响到其他部分，这时候单元测试给与我们的`PASS`是非常让人放心的。

### 提高代码可读性及团队协作

一句经典的话“代码是写给人看的，给机器的是二进制”。

单元测试是从另一个角度描述了对应代码的逻辑，并且其中`describe()`和`it()`通常也包含非常可读的注释（这里笔者习惯 it 这种风格，但道理都是一样的），比如：

```ts
  describe('helloWorld', () => {
    it('should return "Hello World!"', () => {
      expect(appResolver.helloWorld()).toBe('Hello World!');
    });
  });
```

这样我们是不是就知道了这个函数是返回`Helli World`字符串的作用的。当函数单元的逻辑比较复杂时，也通常会对应着非常多的测试用例，通过阅读这些测试用例，我们就可以非常清楚的了解到该函数单元的设计者当时是怎么思考这个函数对应的功能（什么样的输入对应什么样的输出）

团队协作中非常重要的一点就是沟通，这是不是跟注释和技术文档的作用一样，提高了沟通效率，以及当团队换人的时候，新人也能快速上手🙃🙃🙃

## 单元测试相关概念

### 单元测试的任务

首先，单元测试越早越好！

然后，如下是我们编写单元测试需要做的事情：

1. **模块接口测试**：比如函数作为一个模块，它的输入输出就是它的接口；面向对象中，也可以一个类作为一个模块单元，那么此时它的构造函数以及`public`属性和方法就是所谓的接口。简单来说就是该模块单元与其他模块交互的地方。
2. **模块局部数据结构测试**：保证临时存储在模块内的程序执行过程完整、正确
3. **模块边界条件测试**：采用边界值分析技术
4. **模块中所有独立执行通路测试**：保证模块中每条语句至少执行一次
5. **模块中的各条错误处理通路测试**

### 单元测试覆盖率

单元测试覆盖率（Unit Test Coverage）是一种衡量软件测试质量的指标，它表示测试用例覆盖代码中的哪些部分。以下是单元测试覆盖率的相关概念：

- **语句覆盖率（Statement Coverage）**：语句覆盖率是指测试用例执行时覆盖了代码中的哪些语句。如果一个语句被至少一个测试用例执行过，那么它就被认为是被覆盖的。语句覆盖率越高，表示测试用例覆盖的代码越多，测试质量越高。
- **分支覆盖率（Branch Coverage）**：分支覆盖率是指测试用例执行时覆盖了代码中的哪些分支。如果一个分支被至少一个测试用例执行过，**该分支的取真和取假条件都执行过**，那么它就被认为是被覆盖的。分支覆盖率越高，表示测试用例覆盖的代码分支越多，测试质量越高。
- **条件覆盖率（Condition Coverage）**：条件覆盖率是指测试用例执行时覆盖了代码中的哪些条件。如果一个条件被至少一个测试用例执行过，**并且覆盖了该条件的所有可能取值**，那么它就被认为是被覆盖的。条件覆盖率越高，表示测试用例覆盖的代码条件越多，测试质量越高。
- **路径覆盖率（Path Coverage）**：路径覆盖率是指测试用例执行时覆盖了代码中的哪些路径。路径是指代码执行的所有可能序列。如果**一个路径被至少一个测试用例执行过**，那么它就被认为是被覆盖的。路径覆盖率越高，表示测试用例覆盖的代码路径越多，测试质量越高。

第一点就不谈了，二三四可能大家还有一点混淆，这里简单解释一下：

比如我们的函数单元中有这样两个分支条件：

```js
function fn(A, B, C, D){
	if(A && B) {
		console.log('A && B...')
	}
	if(C || D) {
		console.log('C || D...')
	}
}
```

画个流程图，更加清晰的观察这个函数单元的逻辑，如下：

![](https://oss.justin3go.com/blogs/%E5%88%86%E6%94%AF%E8%A6%86%E7%9B%96%E6%9D%A1%E4%BB%B6%E8%A6%86%E7%9B%96%E8%B7%AF%E5%BE%84%E8%A6%86%E7%9B%96%E6%BC%94%E7%A4%BA.png)

**1）分支覆盖**

使其分支覆盖的测试用例可以是：

- 测试用例 1：`A = true; B = true; C = true; D = false`，此时`A && B = true; C || D = true`即所有分支都全部执行；
- 测试用例 2：`A = false; B = true; C = false; D = false`，此时`A && B = false; C || D = false`即所有分支都没执行；

这样，每个分支都有被执行的情况以及不被执行的情况，此时已经达到了分支覆盖；

**2）条件覆盖**

- 分支覆盖是使其`if(整体条件)`中的`整体条件`取真一次，取假一次就可以了，即以分支为一个粒度；
- 而条件覆盖是使其`if(条件 1、条件 2...)`中的所有条件都要取真取假一次，即以分支中每个单独条件为一个粒度；

使其条件覆盖的测试用例可以是：

- 测试用例 1：`A = true; B = true; C = true; D = true`，即所有条件都为真；
- 测试用例 2：`A = false; B = false; C = false; D = false`，即所有条件都为假；

3）路径覆盖

上述两种覆盖方式没有如下执行情况：

- 分支 1 执行，分支 2 不执行；
- 分支 1 不执行，分支 1 执行；

即一个达到路径覆盖的测试用例应该包含如下情况：

|分支 1|分支 2|
|-|-|
|执行|执行|
|执行|不执行|
|不执行|执行|
|不执行|不执行|

笔者认为，这些虽然是规范，指标，但仅仅作为参考和流程化使用。好的单测用例应该是只要这个函数单元对应的测试用例只要执行通过了，那么这个函数就一定没有任何问题，这才是终极目标。

## Nest 中配置 Jest

你可以先看看这里[Nest 官方文档-单元测试](https://docs.nestjs.com/fundamentals/testing#installation)

然后你可以在 package.json 里面进行一些单测的自定义配置，如下是笔者的单测配置：

```json
{
	// 略...
  "jest": {
    "moduleFileExtensions": [
      "js",
      "json",
      "ts"
    ],
    "rootDir": ".",
    "moduleNameMapper": {
      "^src/(.*)$": "<rootDir>/src/$1"
    },
    "testRegex": ".*\\.spec\\.ts$",
    "transform": {
      "^.+\\.(t|j)s$": "ts-jest"
    },
    "collectCoverageFrom": [
      "**/*.service.ts",
      "**/utils/*.ts",
      "!**/*.interface.ts",
      "!**/gql-config.service.ts",
      "!**/node_modules/**"
    ],
    "coverageDirectory": "../coverage",
    "testEnvironment": "node"
  },
}
```

其中有两点值得提一下：

1. `testRegex`：代表哪些为测试文件，当你`npm run test`或者`jest`时，会执行这些被识别的测试文件，通常在 nest 就是`XX.spec.ts`为测试文件；
2. `collectCoverageFrom`：代表单测覆盖率会考虑哪些文件，当你`npm run test:cov`（自定义脚本）或者`jest --coverage`时，会考虑识别的文件并形成单元测试覆盖率报告；

这里笔者由于业务逻辑是全部写在 Service 层里面，关于分层的作用，可以查看笔者之前写的这篇文章——[浅谈 NestJS 设计思想（分层、IOC、AOP）](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/01/25%E6%B5%85%E8%B0%88NestJS%E8%AE%BE%E8%AE%A1%E6%80%9D%E6%83%B3.html)

所以为了一定程度减少工作量，这里笔者仅对 Service 文件进行考虑单元测试，`Controller`层以及`Resolver`层基本都是透传，暂不考虑单测；

然后由于`utils/`下的文件一般都是工具函数，所以也一定要进行单元测试，而`!`符号代表不匹配哪些文件，比如`.interface.ts`后缀的文件是 nest 中的类型文件，所以不需要在单测覆盖中考虑

最后，请根据自己的实际情况进行配置，这里仅供参考，详细配置项可见[Jest 官网文档-配置](https://jestjs.io/docs/configuration)

## Jest 中 Mock Prisma

[Prisma](https://www.prisma.io/)是笔者在 Nest 应用中使用的一个 ORM 框架，一般来说，在执行单测的时候，不应该执行数据库操作和外部请求的一些操作，原因如下：

- 单元测试应该专注于测试代码本身，而不是依赖于外部资源或环境。执行数据库操作和外部请求操作会使单元测试变得复杂和不可靠，因为这些操作可能会受到外部环境的影响，例如网络连接、数据库状态等等。
- 执行数据库操作和外部请求操作还会导致单元测试变得缓慢和不可重复。
	- 如果测试依赖于外部资源，那么测试的速度会变得很慢，因为需要建立连接、读取数据等等。
	- 如果测试依赖于外部资源，那么测试的结果可能会受到外部资源的影响，例如数据库中的数据、网络连接等等，这会导致测试结果不可重复。

再来理解一下，就一句话：**对自己编写的业务代码负责就行了**。

所以这里我们需要 mock Prisma 的操作以避免对数据库的操作，[Prisma 的官方推荐](https://www.prisma.io/docs/guides/testing/unit-testing#example-unit-tests)是如下配置：

先安装：

```shell
npm install jest-mock-extended@2.0.4 --save-dev
```

然后我们就可以这样编写单元测试代码：

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { UpdateUserInput } from './dto/update-user.input';
import { PrismaService } from 'nestjs-prisma';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: DeepMockProxy<PrismaClient>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, PrismaService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(UsersService);
    prisma = module.get(PrismaService);
  });

  describe('updateUser', () => {
    it('return new user', () => {
      const userId = '1';
      const newUserData: UpdateUserInput = { nickName: 'Justin3go' };

      prisma.user.update.mockResolvedValueOnce('a new user entity' as any);

      expect(service.updateUser(userId, newUserData)).resolves.toBe(
        'a new user entity'
      );
    });
  });
});
```

## Jest 编写单测用例

得益于 Jest 的各个函数命名非常规范，你自己`dot`一下，根据 IDE 的提示基本就知道怎么做了，具体看看[Jest 文档](https://jestjs.io/docs/getting-started)

没啥说的，贴一部分代码仅供参考：

这部分代码的作用是小程序登录注册，以及使用 JWT 进行授权的`Auth.service`

```ts
// auth.service.ts
import { PrismaService } from 'nestjs-prisma';
import { User } from '@prisma/client';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Token } from './models/token.model';
import { SecurityConfig } from 'src/common/configs/config.interface';
import {
  code2SessionAPI,
  code2SessionParamsI,
  code2SessionResI,
  code2SessionTimeout,
} from 'src/common/apis/wechat.api';
import { HttpService } from '@nestjs/axios';
import { catchError, lastValueFrom, map, of, timeout } from 'rxjs';
import { LoginAndAutoSignUpInput } from './dto/loginAndAutoSignUp.input';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly httpService: HttpService
  ) {}

  async loginAndAutoSignUp(data: LoginAndAutoSignUpInput): Promise<Token> {
    const { code } = data;
    const code2SessionRes: code2SessionResI = await this.code2Session(code);
    const { session_key, openid, errmsg } = code2SessionRes ?? {};
    if (!session_key || !openid) {
      throw new Error(`Wechat login failed: ${errmsg || 'null'}`);
    }
    // find user
    let user = await this.prisma.user.findUnique({
      where: { openId: openid },
    });
    // sign up
    if (!user) {
      // create user
      user = await this.prisma.user.create({
        data: {
          openId: openid,
        },
      });
    }
    return this.generateTokens({
      userId: user.id,
    });
  }

  // 小程序登录
  async code2Session(code: string): Promise<code2SessionResI> {
    const appid = this.configService.get<string>('APP_ID');
    if (!appid) {
      throw new Error('you should add <APP_ID=XXX> in .env file');
    }
    const secret = this.configService.get<string>('APP_SECRET');
    if (!secret) {
      throw new Error('you should add <APP_SECRET=XXX> in .env file');
    }
    const params: code2SessionParamsI = {
      appid,
      secret,
      js_code: code,
      grant_type: 'authorization_code',
    };
    const res = await lastValueFrom(
      this.httpService
        .get(code2SessionAPI, {
          params,
        })
        .pipe(
          map((res) => res.data),
          timeout(code2SessionTimeout),
          catchError((error) => of(`Bad HttpService: ${error}`))
        )
    );
    return res;
  }

  validateUser(userId: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  getUserFromToken(token: string): Promise<User | null> {
    const decodeToken = this.jwtService.decode(token);
    const id = decodeToken && decodeToken['userId'];
    return this.prisma.user.findUnique({ where: { id } });
  }

  generateTokens(payload: { userId: string }): Token {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  private generateAccessToken(payload: { userId: string }): string {
    return this.jwtService.sign(payload);
  }

  private generateRefreshToken(payload: { userId: string }): string {
    const securityConfig = this.configService.get<SecurityConfig>('security');
    return this.jwtService.sign(payload, {
      secret: this.configService.get('JWT_REFRESH_SECRET'),
      expiresIn: securityConfig?.refreshIn,
    });
  }

  refreshToken(token: string) {
    try {
      const { userId } = this.jwtService.verify(token, {
        secret: this.configService.get('JWT_REFRESH_SECRET'),
      });

      return this.generateTokens({
        userId,
      });
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}

```

单测代码`auth.service.spec.ts`：

```ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from 'nestjs-prisma';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HttpModule, HttpService } from '@nestjs/axios';
import { Observable } from 'rxjs';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: DeepMockProxy<PrismaClient>;
  let jwt: JwtService;
  let config: ConfigService;
  let http: HttpService;

  beforeEach(async () => {
    // https://stackoverflow.com/questions/63208308/how-to-fix-axios-instance-token-at-index-0-is-available-in-the-module-context
    const module: TestingModule = await Test.createTestingModule({
      imports: [HttpModule],
      providers: [AuthService, PrismaService, JwtService, ConfigService],
    })
      .overrideProvider(PrismaService)
      .useValue(mockDeep<PrismaClient>())
      .compile();

    service = module.get(AuthService);
    prisma = module.get(PrismaService);
    jwt = module.get(JwtService);
    config = module.get(ConfigService);
    http = module.get(HttpService);
  });

  describe('loginAndAutoSignUp()', () => {
    it('Wechat login failed, throw Error', () => {
      service.code2Session = jest.fn().mockReturnValue({});
      expect(service.loginAndAutoSignUp({ code: '<code>' })).rejects.toThrow();
    });

    it('sign up, should execute prisma.user.create()', async () => {
      service.code2Session = jest.fn().mockReturnValue({
        session_key: '<session_key>',
        openid: '<openid>',
      });
      service.generateTokens = jest.fn().mockReturnValue('<generateTokens>');
      prisma.user.findUnique.mockResolvedValueOnce(null as any);
      prisma.user.create.mockResolvedValueOnce({ id: '<id>' } as any);
      await service.loginAndAutoSignUp({ code: '<code>' });
      expect(prisma.user.create).toHaveBeenCalled();
    });

    it('login, correct returns', async () => {
      service.code2Session = jest.fn().mockReturnValue({
        session_key: '<session_key>',
        openid: '<openid>',
      });
      service.generateTokens = jest.fn().mockReturnValue('<generateTokens>');
      prisma.user.findUnique.mockResolvedValueOnce({ id: '<id>' } as any);
      expect(service.loginAndAutoSignUp({ code: '<code>' })).resolves.toBe(
        '<generateTokens>'
      );
    });
  });

  describe('code2Session()', () => {
    it('no appid, throw Error', () => {
      config.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'APP_ID') {
          return null;
        } else if (key === 'APP_SECRET') {
          return '<APP_SECRET>';
        }
      });
      expect(service.code2Session('<code>')).rejects.toThrow();
    });
    it('no app secret, throw Error', () => {
      config.get = jest.fn().mockImplementation((key: string) => {
        if (key === 'APP_ID') {
          return '<APP_ID>';
        } else if (key === 'APP_SECRET') {
          return null;
        }
      });
      expect(service.code2Session('<code>')).rejects.toThrow();
    });
    it('should return res', () => {
      config.get = jest.fn().mockReturnValue('<env>');
      const observable = new Observable((observer) => {
        observer.next('final res');
        observer.complete();
      });
      http.get = jest.fn().mockReturnValue({
        pipe: jest.fn().mockReturnValue(observable),
      });
      expect(service.code2Session('<code>')).resolves.toBe('final res');
    });
  });

  describe('validateUser()', () => {
    it('should returns', () => {
      prisma.user.findUnique.mockResolvedValueOnce('user' as any);
      expect(service.validateUser('userId')).resolves.toBe('user');
    });
  });

  describe('getUserFromToken()', () => {
    it('jwt decode null, not throw', () => {
      jwt.decode = jest.fn().mockReturnValue(null);
      prisma.user.findUnique.mockResolvedValueOnce('user' as any);
      expect(service.getUserFromToken('<token>')).resolves.not.toThrow();
    });
  });

  describe('generateTokens()', () => {
    it('should returns Object', () => {
      config.get = jest.fn().mockReturnValue('<env>');
      jwt.sign = jest
        .fn()
        .mockReturnValueOnce('<accessToken>')
        .mockReturnValueOnce('<refreshToken>');
      expect(service.generateTokens({ userId: '<userId>' })).toEqual({
        accessToken: '<accessToken>',
        refreshToken: '<refreshToken>',
      });
    });
  });

  describe('refreshToken()', () => {
    it('verify fail, throw Error', () => {
      jwt.verify = jest.fn().mockReturnValue(null);
      config.get = jest.fn().mockReturnValue('<env>');
      service.generateTokens = jest.fn().mockReturnValue('<token>');
      try {
        service.refreshToken('<token>');
      } catch (err) {
        expect(err).toEqual(new UnauthorizedException());
      }
    });

    it('verify success, returns token', () => {
      jwt.verify = jest.fn().mockReturnValue({ userId: '<userId>' });
      config.get = jest.fn().mockReturnValue('<env>');
      service.generateTokens = jest.fn().mockReturnValue('<token>');

      expect(service.refreshToken('<token>')).toBe('<token>');
    });
  });
});

```

这里是用的`describe it`风格，仅供参考学习，如有错误，欢迎友善指正，我会及时修改...

VSCode 安装`Jest Runner`插件，运行如上单元测试截图如下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230501162511.png)

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230501162550.png)

## CI 中增加单测

为了在提交代码后在 Github 自动执行单元测试，以达到持续集成中的自动化测试的目的，笔者增加了如下配置：

根目录下`/.github/workflows/ci.yml`：

```yaml
name: Node.js CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    strategy:
      matrix:
        node-version: [14, 16]

    steps:
      - uses: actions/checkout@v2
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v2
        with:
          node-version: ${{ matrix.node-version }}
          cache: 'npm'
      - run: npm install
      - run: npm run lint
      - run: npm run build
      - run: npm test

```

当然，实际情况不同也需自行修改，如果是 Github，可以参考如下文档进行自定义——[GitHub Actions 快速入门](https://docs.github.com/zh/actions/quickstart) 

## 最后

祝各位程序🐒们五一快乐，争取劳动节可以不劳动/(ㄒoㄒ)/~~

![](https://oss.justin3go.com/blogs/QQ%E5%9B%BE%E7%89%8720230501162211.jpg)

## 参考

- [Testing a NestJS Service that uses Prisma without actually accessing the database](https://stackoverflow.com/questions/70228893/testing-a-nestjs-service-that-uses-prisma-without-actually-accessing-the-databas)
- [How to fix AXIOS_INSTANCE_TOKEN at index [0] is available in the Module context](https://stackoverflow.com/questions/63208308/how-to-fix-axios-instance-token-at-index-0-is-available-in-the-module-context)
- [软件测试中条件覆盖，路径覆盖，语句覆盖，分支覆盖的区别](https://blog.51cto.com/u_15127626/3703456)

