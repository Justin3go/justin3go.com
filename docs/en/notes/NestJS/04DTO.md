# DTO

## 准备

简介：用于封装数据并将其从一个应用程序发送到另一个应用程序，帮助我们定义系统内的接口或输入和输出

```javascript
// nest g class coffees/dto/create-coffee.dto --no-spec
```

## 基础

确保 POST 等传递的对象是我们约定的对象结构

```typescript
// create-coffee.dto.ts
export class CreateCoffeeDto {
  // id 一般由数据库自动生成，所以不传
  name: string;
  brand: string;
  flavors: string[];
}
```

然后就可以在`controller`中修改所有用到`body`的对象

```typescript
@Post()
create(@Body() body) {
    return body;
}
//----修改为----
@Post()
create(@Body() createCoffeeDto:CreateCoffeeDto) {
    return this.coffeeService.create(createCoffeeDto);
}
// 这样我们就有了完整的类型检查
```

`Dto`的另一个最佳实践就是使用`readonly`

```typescript
export class CreateCoffeeDto {
  readonly name: string;
  readonly brand: string;
  readonly flavors: string[];
}
```

同样的，生成用于更新操作的`dto`

```javascript
//  nest g class coffees/dto/update-coffee.dto --no-spec
```

更新的区别就是我们希望对象中的属性是可选的

```typescript
export class UpdateCoffeeDto {
  readonly name?: string;
  readonly brand?: string;
  readonly flavors?: string[];
}
```

然后在`PATCH`中修改

```typescript
@Patch(':id')
update(@Param('id') id: string, @Body() updateCoffeeDto:UpdateCoffeeDto) {
    return this.coffeeService.update(id, updateCoffeeDto);
}
```

## 验证传入的请求(ValidationPipe)

1. 首先全局引入这个对象：

```typescript
// main.ts 中
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe());  // 这里
  await app.listen(3000);
}
bootstrap();
```

2. 然后安装：

```typescript
// npm i class-validator class-transformer

```

3. 在`DTO`中添加规则

```typescript
import { IsString } from 'class-validator';

export class CreateCoffeeDto {
  @IsString()
  readonly name: string;

  @IsString()
  readonly brand: string;

  @IsString({each: true})  // each:true 代表期望的是一个字符串数组
  readonly flavors: string[];
}
// 它还有很多其他有用的规则，请查看文档
```

## 测试

此时，如果我们请求的数据不符合我们的规则，就会返回 400

```typescript
POST http://localhost:3000/coffees
```

```typescript
{
    "name":"Shipwreak Roast"
}
// 返回
{
    "statusCode": 400,
    "message": [
        "brand must be a string",
        "each value in flavors must be a string"
    ],
    "error": "Bad Request"
}
```

```typescript
{
    "name":"Shipwreak Roast",
    "brand":"Buddy Brew",
    "flavors":[1,2]
}
// 返回
{
    "statusCode": 400,
    "message": [
        "each value in flavors must be a string"
    ],
    "error": "Bad Request"
}
```

```typescript
{
    "name":"Shipwreak Roast",
    "brand":"Buddy Brew",
    "flavors":["caramel"]
}
// 返回
201 Created
```

## 修改 UpdateCoffeeDto

但是此时我们会发现代码基本和`create`的一致，所以多余了

`nest`提供了`mapped-types`帮助我们快速执行这些类型的常见转换

```typescript
// update-coffee.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateCoffeeDto } from './create-coffee.dto';
// PartialType 代表所有参数可选
export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto){}
```

然后`PATCH http://localhost:3000/coffees/1`

```typescript
{
    "name":"Shipwreak Roast"
}
// 返回
200 OK
```

## 白名单

过滤掉不应由方法处理程序接收的属性

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
}));
```

假设我们希望用户在创建新咖啡时将无效属性传递给我们的`CoffeesController`的`POST`请求，此配置可以确保那些无效的属性自动剥离和删除

```typescript
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
}));
```

添加这个选项可以抛出异常并告诉我们哪个属性是多余的。

```typescript
  @Post()
  create(@Body() createCoffeeDto:CreateCoffeeDto) {
    console.log(createCoffeeDto instanceof CreateCoffeeDto);  // false
    return this.coffeeService.create(createCoffeeDto);
  }
```

## transform

我们发现传递过来的对象并不是`CreateCoffeeDto`的实例，为此设置`transform`选项

```typescript
// main.ts
app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
}));
```

`console.log(createCoffeeDto instanceof CreateCoffeeDto); `这里就会变为`true`；

还可以进行一些基础类型如 bool、number、string 的转换

```typescript
@Get(':id')
findOne(@Param('id') id: string) {
    return this.coffeeService.findOne(id);
}
// id 在路由中会是字符串，这里我们直接设置为 number，它就会自动转换为 number
@Get(':id')
findOne(@Param('id') id: number) {
    return this.coffeeService.findOne(id);
}
```

简单来说设置了这个选项就会将网络传递过来的参数自动转换为我们期望的数据类型，这个会对性能有一定的影响，请确保它是有效的。

