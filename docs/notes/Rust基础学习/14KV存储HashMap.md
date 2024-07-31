# KV 存储 HashMap

> 此笔记记录于[Rust Course](https://course.rs/)，大多数为其中的摘要，少数为笔者自己的理解
## 创建 HashMap

### 使用`new`方法创建

```rust
use std::collections::HashMap;

// 创建一个 HashMap，用于存储宝石种类和对应的数量
let mut my_gems = HashMap::new();

// 将宝石类型和对应的数量写入表中
my_gems.insert("红宝石", 1);
my_gems.insert("蓝宝石", 2);
my_gems.insert("河边捡的误以为是宝石的破石头", 18);
// 类型：HashMap<&str,i32>
```

使用 `HashMap` 需要手动通过 `use ...` 从标准库中引入到我们当前的作用域中来。之前使用另外两个集合类型 `String` 和 `Vec` 时，我们是否有手动引用过？答案是 **No**，因为 `HashMap` 并没有包含在 Rust 的 [`prelude`](https://course.rs/appendix/prelude.html) 中

所有的集合类型都是动态的，意味着它们没有固定的内存大小，因此它们底层的数据都存储在内存堆上，然后通过一个存储在栈中的引用类型来访问。同时，跟其它集合类型一致，`HashMap` 也是内聚性的，即所有的 `K` 必须拥有同样的类型，`V` 也是如此

> 使用 `HashMap::with_capacity(capacity)` 创建指定大小的 `HashMap`，避免频繁的内存分配和拷贝，提升性能

### 使用迭代器和`collect`方法创建

在实际使用中，不是所有的场景都能 `new` 一个哈希表后，然后悠哉悠哉的依次插入对应的键值对，而是可能会从另外一个数据结构中，获取到对应的数据，最终生成 `HashMap`

Rust 为我们提供了一个非常精妙的解决办法：先将 `Vec` 转为迭代器，接着通过 `collect` 方法，将迭代器中的元素收集后，转成 `HashMap`：

```rust
fn main() {
    use std::collections::HashMap;

    let teams_list = vec![
        ("中国队".to_string(), 100),
        ("美国队".to_string(), 10),
        ("日本队".to_string(), 50),
    ];

    let teams_map: HashMap<_,_> = teams_list.into_iter().collect();
    
    println!("{:?}",teams_map)
}
```

`into_iter` 方法将列表转为迭代器，接着通过 `collect` 进行收集，不过需要注意的是，`collect` 方法在内部实际上支持生成多种类型的目标集合，因此我们需要通过类型标注 `HashMap<_,_>` 来告诉编译器：请帮我们收集为 `HashMap` 集合类型，具体的 `KV` 类型，麻烦编译器您老人家帮我们推导

## 所有权转移

`HashMap` 的所有权规则与其它 Rust 类型没有区别：

- 若类型实现 `Copy` 特征，该类型会被复制进 `HashMap`，因此无所谓所有权
- 若没实现 `Copy` 特征，所有权将被转移给 `HashMap` 中，如下代码：

```rust
fn main() {
    use std::collections::HashMap;

    let name = String::from("Sunface"); // 没有 Copy 特征
    let age = 18;

    let mut handsome_boys = HashMap::new();
    handsome_boys.insert(name, age); // name 的所有权转移

    println!("因为过于无耻，{}已经被从帅气男孩名单中除名", name); // 报错，因为所有权已经被转移了
    println!("还有，他的真实年龄远远不止{}岁", age);
}
```

- **如果你使用引用类型放入 HashMap 中**，请确保该引用的生命周期至少跟 `HashMap` 活得一样久：

```rust
fn main() {
    use std::collections::HashMap;

    let name = String::from("Sunface");
    let age = 18;

    let mut handsome_boys = HashMap::new();
    handsome_boys.insert(&name, age);

    std::mem::drop(name); // 通过 `drop` 函数手动将 `name` 字符串从内存中移除
    println!("因为过于无耻，{:?}已经被除名", handsome_boys); // 报错
    println!("还有，他的真实年龄远远不止{}岁", age);
}
```

## 查询 HashMap

通过 `get` 方法可以获取元素：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

let team_name = String::from("Blue");
let score: Option<&i32> = scores.get(&team_name);
```

- `get` 方法返回一个 `Option<&i32>` 类型：当查询不到时，会返回一个 `None`，查询到时返回 `Some(&i32)`
- `&i32` 是对 `HashMap` 中值的借用，如果不使用借用，可能会发生所有权的转移

如果我们想直接获得值类型的 `score` 该怎么办，答案简约但不简单:

```rust
let score: i32 = scores.get(&team_name).copied().unwrap_or(0);
```

通过循环的方式依次遍历 `KV` 对：

```rust
use std::collections::HashMap;

let mut scores = HashMap::new();

scores.insert(String::from("Blue"), 10);
scores.insert(String::from("Yellow"), 50);

for (key, value) in &scores {
    println!("{}: {}", key, value);
}
```

## 更新 HashMap 中的值

```rust
fn main() {
    use std::collections::HashMap;

    let mut scores = HashMap::new();

    scores.insert("Blue", 10);

    // 覆盖已有的值
    let old = scores.insert("Blue", 20);
    assert_eq!(old, Some(10));

    // 查询新插入的值
    let new = scores.get("Blue");
    assert_eq!(new, Some(&20));

    // 查询 Yellow 对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(5);
    assert_eq!(*v, 5); // 不存在，插入 5

    // 查询 Yellow 对应的值，若不存在则插入新值
    let v = scores.entry("Yellow").or_insert(50);
    assert_eq!(*v, 5); // 已经存在，因此 50 没有插入
}
```

场景：查询某个 `key` 对应的值，若不存在则插入新值，若存在则对已有的值进行更新，例如在文本中统计词语出现的次数：

```rust
use std::collections::HashMap;

let text = "hello world wonderful world";

let mut map = HashMap::new();
// 根据空格来切分字符串(英文单词都是通过空格切分)
for word in text.split_whitespace() {
    let count = map.entry(word).or_insert(0);
    *count += 1;
}

println!("{:?}", map);
```

有两点值得注意：

- `or_insert` 返回了 `&mut v` 引用，因此可以通过该可变引用直接修改 `map` 中对应的值
- 使用 `count` 引用时，需要先进行解引用 `*count`，否则会出现类型不匹配

## 哈希函数

你肯定比较好奇，为何叫哈希表，到底什么是哈希。

先来设想下，如果要实现 `Key` 与 `Value` 的一一对应，是不是意味着我们要能比较两个 `Key` 的相等性？例如 "a" 和 "b"，1 和 2，当这些类型做 `Key` 且能比较时，可以很容易知道 `1` 对应的值不会错误的映射到 `2` 上，因为 `1` 不等于 `2`。因此，一个类型能否作为 `Key` 的关键就是是否能进行相等比较，或者说该类型是否实现了 `std::cmp::Eq` 特征。

> f32 和 f64 浮点数，没有实现 `std::cmp::Eq` 特征，因此不可以用作 `HashMap` 的 `Key`。

若一个复杂点的类型作为 `Key`，我们就需要通过哈希函数把 `Key` 计算后映射为哈希值，然后使用该哈希值来进行存储、查询、比较等操作。

[高性能三方库](https://course.rs/basic/collections/hashmap.html#%E9%AB%98%E6%80%A7%E8%83%BD%E4%B8%89%E6%96%B9%E5%BA%93)




