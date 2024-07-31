# service
## 准备

帮助我们将业务逻辑与控制器分开，将我们的业务逻辑分离为服务

```javascript
// 使用 nest g s
```

可以看到`app.module.ts`中多出了`providers: [AppService, CoffeesService], `其中的`CoffeesService`为新建的。

意味着对象之间可以创建各种关系，并且对象实例连接在一起的逻辑都可以由 Nest 运行时系统处理，而不是尝试自己创建和管理这种类型的依赖注入。

模拟假数据源：

```javascript
// ./entities/coffee.entity
export class Coffee {
  id: number;
  name: string;
  brand: string;
  flavors: string[];
}
```

```javascript
// coffees.service 中
import { Coffee } from './entities/coffee.entity';
```

## CRUD

```javascript
// coffees.service 中
@Injectable()
export class CoffeesService {
  // 模拟一个假数据源进行 CRUD
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'Shipwreck Roast',
      brand: 'Buddy Brew',
      flavors: ['chocolate', 'vanilla'],
    },
  ];
  // CRUD
  findAll() {
    return this.coffees;
  }

  findOne(id: string) {
    return this.coffees.find((item) => item.id === +id);
  }

  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
  }

  update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findOne(id);
    if (existingCoffee) {
      // update the existing entity
    }
  }

  remove(id: string) {
    const coffeeIndex = this.coffees.findIndex((item) => item.id === +id);
    if(coffeeIndex >= 0){
      this.coffees.splice(coffeeIndex, 1);
    }
  }
}
```

我们之前在 controller 里面没有做任何操作，这里将 CRUD 操作加入其中：

```javascript
// coffees.controller 中
@Get(':id')
findOne(@Param('id') id: string) {
    // 选择传入某个字符串
    return this.coffeeService.findOne(id);  // 使用 service 中的方法替换之前写的空方法
    // return `this action return ${id} coffee`;
}
```

其他的类似......

## 处理错误

为常见的场景抛出不同的状态码

```javascript
findOne(id: string) {
    const coffee = this.coffees.find((item) => item.id === +id);
    if(!coffee){
        throw new HttpException(`Coffee ${id} not found`, HttpStatus.NOT_FOUND);
    }
    return coffee;
}
```

```json
// fa
{
    "statusCode": 404,
    "message": "Coffee 2 not found",
    "error": "Not Found"
}
```

简化：

```javascript
throw new NotFoundException(`Coffee ${id} not found`);  // 简化类
```

当你出现其他异常时，nest 会帮助你返回 500

```javascript
throw 'A random error';
```

```json
// 返回
{
    "statusCode": 500,
    "message": "Internal server error"
}
```

