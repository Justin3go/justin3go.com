# postgreSQL

## 环境配置

首先确保你的电脑本地安装了`Docker`

项目根目录下创建`docker-compose.yml`文件

```yaml
version: '3'

services:
  db:
    image: postgres
    restart: always
    ports:
      -"5432:5432"    # 使用 PostgreSQL 的端口为前 5432，Docker 容器内部在后 5432 设置数据库
    environment:
      POSTGRES_PASSWORD: pass123
```

这时，它就会创建一个`PostgreSQL`数据库

此时我们就可以毫不费力的运行一个数据库环境`docker-compose up db -d`，`-d`代表分离模式运行我们的容器，`-db`代表只运行`db`中配置的环境，如果不传该参，将是整个 yaml 文件。

## 集成进`nest`(`typeORM`)

安装对应包：

```typescript
// npm i @nestjs/typeorm typeorm pg
```

然后导入：

```typescript
@Module({
  imports: [
    CoffeesModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'postgres',
      password: 'pass123',
      database: 'postgres',
      autoLoadEntities: true,  // 有助于自动加载模块，而不是指定实体数组
      synchronize: true,  // 同步，确保 TypeORM 实体每次运行应用时都会与数据库保持同步
        // ! 仅生产环境可用
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
```

## Entity（实体）

`Entity`表示`TypeScript`类和数据库之间的关系，使用`@Entity()`装饰的类。

```typescript
// coffee.entity.ts
import { Entity } from "typeorm";

@Entity('coffees')  // sql table === 'coffee' <默认为小写的类名>，或者传入你想要的表名
export class Coffee {
  id: number;
  name: string;
  brand: string;
  flavors: string[];
}
```

每个`Entity`类代表一个`SQL`表

为每一列赋上意义

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()  // sql table === 'coffee' <默认为小写的类名>，或者传入你想要的表名
export class Coffee {
  @PrimaryGeneratedColumn()  // 为 id 设置自增主键
  id: number;

  @Column()
  name: string;

  @Column()
  brand: string;

  // 这里的每一列(除 flavors)都是非空的
  @Column('json', {nullable: true})  // TypeORM 知道将 flavors 数组存储为 json
  flavors: string[];
}
```



```typescript
@Module({
  imports:[TypeOrmModule.forFeature([Coffee])],
  controllers: [CoffeesController],
  providers: [CoffeesService],
})
```

使用`forFeature`将`TypeORM`注册到此子模块中。

记住：我们在`AppModule`中会使用一次`forRoot`，注册实体时，所有其他模块都将使用`forFeature`

然后就可以看到数据库中生成了对应的表：

![image-20220425153138620](https://oss.justin3go.com/blogs/image-20220425153138620.png)

## Repository

`TypeORM`支持存储库设计模式，这意味着我们创建的每个实体都有自己的存储库。

```typescript
// coffees.service.ts 中删除这一部分

// 模拟一个假数据源进行 CRUD
private coffees: Coffee[] = [
    {
        id: 1,
        name: 'Shipwreck Roast',
        brand: 'Buddy Brew',
        flavors: ['chocolate', 'vanilla'],
    },
];
```

```typescript
// 添加这一部分
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm'; 

export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
  ){}
  // ...
}
```

## 修改 CURD

> 我们需要将其中的大多数方法更新为`async`与`await`

```typescript
  // CRUD
  findAll() {
    return this.coffeeRepository.find();
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne(id);
    if(!coffee){
      // throw new HttpException(`Coffee ${id} not found`, HttpStatus.NOT_FOUND);
      throw new NotFoundException(`Coffee ${id} not found`);  // 简化类
    }
    return coffee;
  }

  create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = this.coffeeRepository.create(createCoffeeDto);  // 创建对应实例
    return this.coffeeRepository.save(coffee);   // 保存入数据库中,返回一个期约
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    // preload 会首先查看数据库是否存在实体，存在则会更新，否则返回 undefined
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
    });
    if(!coffee){
      throw new NotFoundException(`Coffee ${id} not found`)
    }
    return this.coffeeRepository.save(coffee);   // 保存入数据库中,返回一个期约
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }
```

测试：

![image-20220425161417128](https://oss.justin3go.com/blogs/image-20220425161417128.png)

![image-20220425161426738](https://oss.justin3go.com/blogs/image-20220425161426738.png)

等...

## 关系

- 一对一`@OneToOne()`：主表的每一行在外部表都有且只有一个关联行；
- 一对多`@OneToMany()`，多对一`@ManyToOne()`：主表的每一行在外部表中都有一个或多个相关行；
- 多对多`@ManyToMany()`：主表中的每一行在外表都有许多相关的行，并且外表中的每条记录在主表中都有许多相关的行；

```typescript
// nest g class coffees/entities/flavor.entity --no-spec
```

将类名`FlavorEntity`==>`Flavor`，因为我们不希望数据库出现`Entity`这样的后缀。

然后修改 flavors 属性为多对多：

```typescript
// coffee.entity
@Entity()
export class Coffee {
 // ...
  @JoinTable()  // 该装饰器有助于指定关系的 owner 端，在这里是 coffee
  @ManyToMany(type=>Flavor, (flavor)=>flavor.coffees)  // 第二个参数为反向怎么指过来（关系的反面）
  flavors: string[];
}
```

```typescript
// flavor.entity
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Coffee } from './coffee.entity';

@Entity()
export class Flavor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @ManyToMany(type => Coffee, coffee => coffee.flavors)
  coffees: Coffee[];  // 由于 Coffee 是这种关系的所有者，我们不必再次使用@JoinTable
}

```

最后，`coffees.module`中注册新建的类

```typescript
@Module({
  imports:[TypeOrmModule.forFeature([Coffee, Flavor])],
  controllers: [CoffeesController],
  providers: [CoffeesService],
})
```

效果，数据库多出一张`Flavor`表以及一张关系表：

![image-20220425170326978](https://oss.justin3go.com/blogs/image-20220425170326978.png)

![image-20220425170339119](https://oss.justin3go.com/blogs/image-20220425170339119.png)

## 查询数据

<img src="https://oss.justin3go.com/blogs/image-20220425170624686.png" alt="image-20220425170624686" style="zoom: 80%;" />

现在就没有查到与之关联的 Flavor 关系了，因为默认情况下是不会直接加载关系的。

修改：

```typescript
// coffees.service
findAll() {
    return this.coffeeRepository.find({
        relations: ['flavors']
    });
}

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne(id, {
      relations: ['flavors']
    });
	// ...
  }
```

## 级联插入

首先在关系内部将`Casecade`属性设置为`true`

```typescript
// coffee.entity 中
@ManyToMany((type) => Flavor, (flavor) => flavor.coffees, {cascade: true})
```

> 我们也可以将级联限制为仅插入或仅更新：true==>[‘insert’]

其他部分

在此之前，我们首先需要将`Flavor Respository`注入到`CoffeesService`

```typescript
// coffee.service
// 1
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,
    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,
  ) {}
    // ...
```

然后修改创建和更新的方法

```typescript
// 2.
 // 先定义创建 flavor 的方法
  private async preloadFlavorByName(name: string): Promise<Flavor> {
    const existingFlavor = await this.flavorRepository.findOne({ name });
    if (existingFlavor) {
      return existingFlavor;
    }
    return this.flavorRepository.create({ name });
  }
```

```typescript
// 3.
  async create(createCoffeeDto: CreateCoffeeDto) {
    // 1 创建
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((name) => this.preloadFlavorByName(name)),
    );
    // 2 结合
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    }); // 创建对应实例
    return this.coffeeRepository.save(coffee); // 保存入数据库中,返回一个期约
  }
```

```typescript
  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
      // 有则使用，无则创建
    const flavors = updateCoffeeDto.flavors && 
    (await Promise.all(
      updateCoffeeDto.flavors.map(name=>this.preloadFlavorByName(name)),
    ))
    // preload 会首先查看数据库是否存在实体，存在则会更新，否则返回 undefined
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
      flavors,
    });
    if (!coffee) {
      throw new NotFoundException(`Coffee ${id} not found`);
    }
    return this.coffeeRepository.save(coffee); // 保存入数据库中,返回一个期约
  }
```

此时你创建 coffee 对象时，没有对应的 flavors 选项会自动创建入库；

## 分页查询

生成对应的数据传输对象

```typescript
//  nest g class common/dto/pagination-query.dto --no-spec
```

将那些不与特定域相联系的，可以被多个控制器重复使用的放`common`这个文件夹下。

```typescript
// pagination-query.dto
import { Type } from 'class-transformer';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()  // 缺失或者未定义将抛出错误
  @IsPositive()  // 检查为正数
  @Type(() => Number)  // 确保传入的值被解析为数字
  limit: number;

  @IsOptional()
  @Type(() => Number)
  offset: number;
}
```

当然，关于` @Type(() => Number)`你可以全局配置如下：

```typescript
// main.ts 中
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
	//...
    transformOptions: {
      enableImplicitConversion: true,  // 这里设置了你就不需要@Type 了
    },
  }));
  await app.listen(3000);
}
```

现在我们将`findAll()`方法签名中给那个`paginationQuery`参数设置为我们新的`DTO`类型

```typescript
// coffees.controller
@Get('flavors')
findAll(@Query() paginationQuery:PaginationQueryDto) {
    return this.coffeeService.findAll(paginationQuery);
}
```

```typescript
// coffees.service
findAll(paginationQuery: PaginationQueryDto) {
    const { limit, offset } = paginationQuery;
    return this.coffeeRepository.find({
        relations: ['flavors'],
        skip: offset,
        take: limit,
    });
}
```



## 事务

> 当我们想要在某函数调用完成之后并存储该事件，这是对数据库的两项操作，为了保证一致性，我们需要用到事务。

先生成对应的实体

```typescript
// nest g class events/entities/event.entity  --no-spec
```

然后添加一些列

```typescript
import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Event {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  type: string;

  @Column()
  name:string;

  @Column('json')
  payload: Record<string, any>;  // 存储 event payload 的通用列
}
```

同样的你需要添加到`TypeORM forFeature()`中

```typescript
@Module({
  imports:[TypeOrmModule.forFeature([Coffee, Flavor, Event])],
    // ...
```

为`Coffee`实体添加一列

```typescript
  @Column({default: 0})
  recommendations: number;
```

回到`coffees.service`中把所有的东西放在一起

为了创建事务，我们将使用`TypeORM`中的`Connection`对象，使用传统方式将`Connection`注入到我们的`CoffeeService`构造函数中，无需任何装饰器。

```typescript
@Injectable()
export class CoffeesService {
  constructor(
	// ...
    private readonly connection: Connection,
  ) {}
```

现在我们就可以创建我们的第一个事务，并将其命名为`recommend`

```typescript
async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner(); // 创建 queryRunner

    await queryRunner.connect(); // 连接数据库
    await queryRunner.startTransaction(); // 开始事务
    try {
        coffee.recommendations++;

        const recommendEvent = new Event();
        recommendEvent.name = 'recommend_coffee';
        recommendEvent.type = 'coffee';
        recommendEvent.payload = { coffeeId: coffee.id };

        await queryRunner.manager.save(coffee);
        await queryRunner.manager.save(recommendEvent);

        await queryRunner.commitTransaction();
    } catch (err) {
        await queryRunner.rollbackTransaction();  // 回滚
    } finally {
        await queryRunner.release();
    }
}
```

这样我们就实现了对数据库的多个操作，确保它们只有在一切都成功的情况下才会发生。

## 索引

假设一个非常常见的搜索请求就是：根据名称检索一个事件。

我们可以使用`@index()`装饰器在对应的`name`上定义一个索引。

```typescript
  @Index()
  @Column()
  name:string;
```

更高级的情况下，我们可能想要定义包含多个列的复合索引，我们可以将`@index()`装饰器添加到`Event`类本身，并在装饰器内传递一个列名数组作为参数。

```typescript
@Index(['name', 'type'])
@Entity()
export class Event {
	// ...
}
```

索引就是空间换事件可以帮助我们的应用程序快速查找和有效访问。

## 迁移

一种增量更新数据库的模式与应用程序保持同步的方法，同时保留数据库的现有信息。

迁移类与我们的 Nest 应用程序源代码是分开的，这是因为它们的生命周期由`TypeORM CLI`维护，由于迁移为`Nest`之外，我们无法利用依赖注入和其他`Nest`特定功能进行数据库迁移。在创建新的迁移之前，我们需要创建一个新的`TypeORM`配置文件并正确设置我们的数据库连接

根目录中创建`ormconfig.js`

```javascript
module.exports = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'pass123',
  database: 'postgres',
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/migrations/*.js'],
  cli:{
    migrationsDir: 'src/migrations',
  },
};
```

开始迁移：

```typescript
// npx typeorm migration:create -n CoffeeRefactor
```

npx 可以让我们使用可执行包而不用安装它们。

与`synchronize: true,`的区别就是生产环境使用的和开发环境使用的，因为不使用迁移而直接修改列名的话会删除该列的全部数据。

```typescript
// 迁移的记录如下
import {MigrationInterface, QueryRunner} from "typeorm";

export class CoffeeRefactor1650897347302 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }  // 指示需要更改的内容以及如何更改的内容

    public async down(queryRunner: QueryRunner): Promise<void> {
    }  // 是我们要撤销或回滚任何这些更改的地方，万一我们的迁移出现问题，需要一个退出策略。

}
```

当我们将`name`===>`title`我们需要这样做：

```typescript
    public async up(queryRunner: QueryRunner): Promise<void> {
        `ALTER TABLE "coffee" RENAME COLUMN "name" TO "title"`
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        `ALTER TABLE "coffee" RENAME COLUMN "title" TO "name"`
    }
```

测试：

```typescript
// npm run build
// npx typeorm migration:run
```

![image-20220425224932380](https://oss.justin3go.com/blogs/image-20220425224932380.png)

恢复我们的更改

```typescript
// npx typeorm migration:revert
```

![image-20220425225041426](https://oss.justin3go.com/blogs/image-20220425225041426.png)

当然`npx typeorm migration:create -n`会自动对比你的实体与数据库中的，自动生成对应的迁移命令`alter table`等。

### 



