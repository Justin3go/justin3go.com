# openAPI

## 简介

openAPI 规范是一种与语言无关的定义格式，用于描述 RESTful API。Open API 文档允许我们描述我们整个 API，包括：

- 可用的操作和端点；
- 操作参数：每个操作的输入输出；
- 认证方法；
- 联系信息、许可、使用条款和其他信息；

## 安装

```typescript
// npm i @nestjs/swagger swagger-ui-express // 如果你切换为了 fastify，则安装 fastify-swagger
```

## 基本

```typescript
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
// ...

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
// ...

  const options = new DocumentBuilder()
    .setTitle('Iluvcoffee')
    .setDescription('Coffee application')
    .setVersion('1.0')
    .build();
  
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);   // 第一个参数为路由路径

  await app.listen(3000);
}
bootstrap();
```

## 插件使用

虽然上述可以生成最基本的 api 文档，但是我们会发现没有请求正文的期望等信息：

![image-20220503135210499](https://oss.justin3go.com/blogs/image-20220503135210499.png)

我们的应用程序代码实际上有一个专用的 DTO 类，它代表此端点的输入 API，但是这还不足以自动生成 openAPI。Typescript 的元数据反射系统有几个限制，比如确定一个类包含哪些属性，或者识别给定属性是可选的还是必须的。其中一些约束可以在编译时解决，Nest 提供了一个插件来增强 Typescript 编译过程，以减少我们需要创建的样板代码数量来解决这个问题。这个插件是可选的，如果你愿意，你可以手动声明所有的 swagger 装饰器。最好还是**在需要覆盖插件提供的基本功能的某个地方添加特定的装饰器。**

使用这个插件：

```typescript
// nest-cli.json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
      // 这里开始
  "compilerOptions": {
    "deleteOutDir": true,
    "plugins": ["@nestjs/swagger/plugin"]
  }
}
```

然后重新打开 swagger，我们就可以发现其反映了`CreateCoffeeDto`及其所有属性：

![image-20220503140428126](https://oss.justin3go.com/blogs/image-20220503140428126.png)

但是`UpdateCoffeeDto`却还是不能正常反映出来：

![image-20220503140648741](https://oss.justin3go.com/blogs/image-20220503140648741.png)

让我们打开该 Dto 文件：

```typescript
import {PartialType} from '@nestjs/mapped-types';
import { CreateCoffeeDto } from './create-coffee.dto';

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto){

}
```

改为：

```typescript
import {PartialType} from '@nestjs/swagger';  // 这里，它会实现相同的功能并且将每个属性标记会可选的。
import { CreateCoffeeDto } from './create-coffee.dto';

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto){

}
```

然后就有了对应的反映。

## @ApiProperty()

> 定义实例值并添加属性描述

```typescript
// create-coffee.dto
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateCoffeeDto {
  @ApiProperty({description: 'The name of a coffee.'})
  @IsString()
  readonly name: string;

  @ApiProperty({description: 'The brand of a coffee.'})
  @IsString()
  readonly brand: string;

  @ApiProperty({example: []})
  @IsString({each: true})
  readonly flavors: string[];
}
```

然后就可以看到对应的描述和和示例了：

![image-20220503142018782](https://oss.justin3go.com/blogs/image-20220503142018782.png)

## @ApiResponse()

> 添加响应示例

```typescript
// coffees.controller

// @ApiResponse({status: 403, description: 'Forbidden.'})  // 或者下面这种
@ApiForbiddenResponse({description: 'Forbidden.'})
@Public()
@Get()
findAll(@Protocol() protocol, @Query() paginationQuery: PaginationQueryDto) {
    console.log(protocol);
    return this.coffeeService.findAll(paginationQuery);
}
```

然后我们就可以看到对应的路由上多了一种响应示例：

![image-20220503142826315](https://oss.justin3go.com/blogs/image-20220503142826315.png)

## 标签

为一组资源添加标签，这样就可以将端点的相关集分组和组织在一起。

```typescript
@ApiTags('coffees')
@Controller('coffees')
export class CoffeesController {
	// ...
}
```

<img src="https://oss.justin3go.com/blogs/image-20220503143953700.png" alt="image-20220503143953700" style="zoom:50%;" />



