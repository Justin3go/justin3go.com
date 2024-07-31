---
title: Nest 如何实现带身份验证的 GraphQL 订阅 Subscription
date: 2023-04-23
tags: 
  - Nest.js
  - GraphQL
  - 订阅
  - 身份验证
  - WebSocket
---

# Nest 如何实现带身份验证的 GraphQL 订阅 Subscription

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中分享了在 Nest.js 中实现带身份验证的 GraphQL 订阅功能的步骤与配置。

- 首先，推荐使用`graphql-redis-subscriptions`替代默认的`PubSub`，以支持生产环境的多机部署。
- 接着，通过创建`PubsubModule`并配置 Redis 连接，笔者详细展示了如何在`App.module`中整合身份验证模块和 GraphQL 模块。
- 随后，笔者提供了`GqlConfigService`的实现，重点在于如何在`onConnect`中进行 WebSocket 身份验证，并将用户信息附加到上下文中。为了确保接口的安全性，笔者自定义了 JWT 身份验证装饰器和用户实体装饰器。
- 最后，笔者在一个 Resolver 中演示了如何使用这些配置，确保只有经过身份验证的用户才能进行订阅和相关操作。整体而言，文章内容详实，适合需要实现 GraphQL 订阅的开发者参考。

<!-- DESC SEP -->

## 前言

最近在用 nest+graphql 做一个消息推送的功能，但发现相关资料真的好少，不仅官网文档没有详细介绍，社区中也少有人讨论，如下是笔者的一些配置，供大家参考，希望对你有所帮助。

## 1. 安装`graphql-redis-subscriptions`

在 Nest 官方文档中，我们可以看到这样一句话：

> **NOTE** `PubSub` is a class that exposes a simple `publish` and `subscribe API`. Read more about it [here](https://www.apollographql.com/docs/graphql-subscriptions/setup.html). Note that the Apollo docs warn that the default implementation is not suitable for production (read more [here](https://github.com/apollographql/graphql-subscriptions#getting-started-with-your-first-subscription)). Production apps should use a `PubSub` implementation backed by an external store (read more [here](https://github.com/apollographql/graphql-subscriptions#pubsub-implementations)).

简单来说就是阿波罗自带的`pubsub`并不推荐用户生产环境，主要原因就是不支持多台机器，目前比较主流的方案就是使用`graphql-redis-subscriptions`，所以，我们先从这里开始...

1）安装

```shell
npm i graphql-redis-subscriptions
```

2）docker-compose.yml 增加 redis 配置，你也可以根据自己的需求自定义：

```yaml
  redis:
    container_name: redis
    image: 'redis:alpine'
    ports:
      - 6379:${REDIS_PORT}

```

## 2. 新增 PubSub 文件

```shell
nest g mo pubsub 
```

然后在生成的文件中进行修改，如下是笔者修改该文件的内容：

```ts
import { Global, Module } from '@nestjs/common';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ConfigService, ConfigModule } from '@nestjs/config';

export const PUB_SUB = 'PUB_SUB';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: PUB_SUB,
      inject: [ConfigService],
      useFactory: (configService: ConfigService) =>
        new RedisPubSub({
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        }),
    },
  ],
  exports: [PUB_SUB],
})
export class PubsubModule {}

```

## 3. App.module 中配置

```ts
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [config] }),
    PrismaModule.forRoot({
      isGlobal: true,
      prismaServiceOptions: {
        middlewares: [loggingMiddleware(new Logger('PrismaMiddleware'))], // configure your prisma middleware
      },
    }),

    AuthModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      imports: [AuthModule],
      driver: ApolloDriver,
      useClass: GqlConfigService, // 下面有
      inject: [AuthService],
    }),
    ]
    // 略...
})
```

其中`AuthModule`是做身份验证的模块，因为笔者使用的是 JWT 方案，后续会使用该`AuthService`进行用户信息的解析。

## 4. 新增`GqlConfigService`配置

我是在`app.module`同级目录新增了`gql-config.service.ts`这个文件，注意其中的`subscriptions: {...}`和`context`配置就可以了，其他的都是一些常见的配置，自己根据官网自定义，如下是文件内容：

```ts
import { GraphqlConfig } from './common/configs/config.interface';
import { ConfigService } from '@nestjs/config';
import { ApolloDriverConfig } from '@nestjs/apollo';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlOptionsFactory } from '@nestjs/graphql';
import { ApolloServerPluginLandingPageLocalDefault } from 'apollo-server-core';
import { AuthService } from 'src/auth/auth.service';

@Injectable()
export class GqlConfigService implements GqlOptionsFactory {
  constructor(
    private configService: ConfigService,
    private authService: AuthService
  ) {}
  createGqlOptions(): ApolloDriverConfig {
    const graphqlConfig = this.configService.get<GraphqlConfig>('graphql');
    return {
      // schema options
      autoSchemaFile: graphqlConfig.schemaDestination || './src/schema.graphql',
      sortSchema: graphqlConfig.sortSchema,
      buildSchemaOptions: {
        numberScalarMode: 'integer',
      },
      // subscription
      subscriptions: {
        'graphql-ws': {
          // websocket 身份校验，并附带 user
          onConnect: async (context: any) => {
            const { connectionParams, extra } = context;
            // user validation will remain the same as in the example above
            // when using with graphql-ws, additional context value should be stored in the extra field
            const authorization = connectionParams?.Authorization;
            const token = authorization?.split(' ')?.pop();
            try {
              const user = await this.authService.getUserFromToken(token);
              extra.user = user;
              extra.headers = { authorization };
            } catch (err) {
              throw new UnauthorizedException();
            }
            return context;
          },
        },
      },
      debug: graphqlConfig.debug,
      playground: graphqlConfig.playgroundEnabled,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
      context: ({ req, extra }) => ({
        req,
        extra,
      }),
    };
  }
}
```

在这里，我将 token 提取并解析成一个完整的用户对象，并挂载到了 extra 对象上方便后续使用。

## 5. 修改身份校验装饰器

笔者这里使用的 JWT 身份校验是`@nestjs/passport`，然后自定义了一个装饰器用户接口的身份校验，带上该装饰器就必须是登录的用户，否则则是所有用户都可以请求该接口：

```ts
// src/auth/gql-auth.guard.ts
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class GqlAuthGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    const ctx = GqlExecutionContext.create(context).getContext();
    return ctx.req || ctx.extra; // ws 的也装载 headers 供 JWT 校验
  }
}
```

## 6.修改用户实体装饰器

这个装饰器的作用是获取用户实体信息，装饰在参数上，这两个装饰器后续会简单介绍如何使用：

```ts
// src/common/user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const UserEntity = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = GqlExecutionContext.create(ctx).getContext();
    return context?.req?.user || context?.extra?.user;
  }
);
```

## 可以使用了（演示）

这里，我在其中一个`resolve.ts`文件中进行简单演示：

```ts
// 略..
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { PUB_SUB } from 'src/pubsub/pubsub.module';

enum SUBSCRIPTION_EVENTS {
  haveWritten = 'haveWritten',
}


@Resolver(() => User2questionnaire)
export class User2questionnaireResolver {
  constructor(
    private prisma: PrismaService,
    private readonly user2questionnaireService: User2questionnaireService,
    @Inject(PUB_SUB) private readonly pubSub: RedisPubSub
  ) {}

  @UseGuards(GqlAuthGuard) // 携带 UseGuards 这个装饰器就必须包含登录态才能请求这个接口
  @Subscription(() => User2questionnaire)
  haveWritten(@UserEntity() user: User) {  // 不用传入 user,就可以直接使用 user 相关参数
    return this.pubSub.asyncIterator(
      `${SUBSCRIPTION_EVENTS.haveWritten}.${user.id}` // 每个用户各包含动态事件
    );
  }
// 略...
  @UseGuards(GqlAuthGuard)
  @Mutation(() => User2questionnaire)
  async write(@UserEntity() user: User, @Args('data') data: CreateU2QInput) {
    const newU2Q = await this.user2questionnaireService.create(user, data);
    // pub
    const { ownerId, friendId } = data;
    // 自己填写就不进行通知
    if (ownerId !== friendId) {
      this.pubSub.publish(`${SUBSCRIPTION_EVENTS.haveWritten}.${ownerId}`, {
        haveWritten: newU2Q,
      });
    }
    return newU2Q;
  }
```

然后我们在对应的阿波罗 playground 就可以先订阅，会出现 listening 消息，然后在写问卷出发写入事件，对应就会通知到刚订阅的位置了，这里就不演示了，我的演示需要两个用户，较复杂

## 最后

上述配置仅供参考，基本上都是笔者自己逐步摸索出来的，并没有在任何官方文档中找到对应的肯定的配置描述，所以不一定是最佳实践，请根据自己的需求自行修改。

## 参考

- https://github.com/nestjs/docs.nestjs.com/issues/394

