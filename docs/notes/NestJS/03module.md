# module
## 准备

```javascript
// nest g module
```

## 将 coffee 相关封装到 module 中

```javascript
import { Module } from '@nestjs/common';
import { CoffeesController } from './coffees.controller';
import { CoffeesService } from './coffees.service';

@Module({
  controllers: [CoffeesController],
  providers: [CoffeesService],
})
// 这个装饰器提供了元数据，nest 用它来组织应用程序的结构
// 包含 controllers,exports,imports,providers
export class CoffeesModule {}
```

最初我们将 CoffeesController 和 CoffeesService 作为 AppModule 的一部分，现在我们需要删除那一部分，否则会被实例化两次

```javascript
// AppModule
@Module({
  imports: [CoffeesModule],
  controllers: [AppController],
  providers: [AppService],   
})
```

