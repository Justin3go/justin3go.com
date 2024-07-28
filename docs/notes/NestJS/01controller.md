# controller
## 准备

> 最开始生成项目使用的是nest-cli生成

```javascript
// nest g co  创建新的controller
// nest g co --no-spec  创建的controller不需要测试文件
// nest g co modules/abc  将创建的controller放入特定文件夹下
// --dry-run  查看CLI的模拟输出，实际不会创建任何文件
```

## 初始时

```javascript
@Controller('coffees')
export class CoffeesController {}
```

这里的coffee字符将我们的应用程序的/coffee url绑定到了这个控制器上，此时如果直接像 `http://localhost:3000/coffees` 请求会404，因为我们还没有在这个控制器中设置一个GET路由

## GET请求

### 基本

nest为常见的HTTP请求方法提供了装饰器在@nestjs/common中

```javascript
@Get()
findAll() {
    return 'This action returns all coffees';
}
```

现在请求 `http://localhost:3000/coffees` 就会返回上述的字符串了

此时我们想**为这个特定的请求添加嵌套URL**的话就只需要为每个装饰器添加你想要的参数(字符串就可以了)

```javascript
@Get('flavors')  // 这里也可以使用通配符，具体查看官方文档
findAll() {
    return 'This action returns all coffees';
}
```

### 包含动态参数

```javascript
@Get(':id')
findOne(@Param() params){
    // 传入整个参数对象
    return `this action return ${params.id} coffee`;
}
```

```javascript
@Get(':id')
findOne(@Param('id') id: string) {
    // 选择传入某个字符串
    return `this action return ${id} coffee`;
}
```

## POST请求

- 用于获取request.body的装饰器：@Body
-  如果自定义修改返回状态码呢：@HttpCode()装饰器
-  nest还包含一个HttpStatus()装饰器，方便我们无需记住所有状态编号

```javascript
@HttpCode(HttpStatus.GONE)
@Post()
create(@Body() body) {
    // 同样如果想传递一部分的话而不是整个body的话就可以像上面一样@Body('name') name
    return body;
}
```

**如果要访问如express的底层响应对象，我们可以使用@Res()装饰器**

```javascript
@Get('flavors')
findAll(@Res() response) {
    response.status(200).send('This action returns all coffees');
}
```

这种方法更灵活，但是缺点主要是你失去了与nest标准相应处理的nest功能的兼容性，如拦截器和HttpCode等，也会更难测试，建议响应时尽可能使用Nest标准方法

## 其他常见请求

```javascript
@Patch(':id')
update(@Param('id') id: string, @Body() body) {
    return `this action return ${id} coffee`;
}
```

```javascript
@Delete(':id')
delete(@Param('id') id: string) {
    return `this action return ${id} coffee`;
}
```

## 分页查询

- Nest有一个有用的装饰器，用于获取所有或特定部分的查询参数：@Query
- 请求的是由加上参数?limit=200&offset=20就可以了

```javascript
@Get('flavors')
findAll(@Query() paginationQuery) {
    const { limit, offset } = paginationQuery;
    return `This action returns all coffees, Limit:${limit}, Offest:${offset}`;
}
```









