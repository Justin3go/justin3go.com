# 认识 Cargo

> 此笔记记录于[Rust Course](https://course.rs/)，大多数为其中的摘要，少数为笔者自己的理解
## 简介

和 node 中的 npm 类似，`cargo` 提供了一系列的工具，从项目的建立、构建到测试、运行直至部署，为 Rust 项目的管理提供尽可能完整的手段。同时，与 Rust 语言及其编译器 `rustc` 紧密结合。

## 创建

```shell
$ cargo new world_hello
$ cd world_hello
```

该项目的结构和配置文件都是由 `cargo` 生成，意味着**我们的项目被 `cargo` 所管理**

`cargo` 默认就创建 `bin` 类型的项目，顺便说一句，Rust 项目主要分为两个类型：`bin` 和 `lib`，前者是一个可运行的项目，后者是一个依赖库项目。

## 运行

有两种方式可以运行项目：

1. `cargo run`
2. 手动编译和运行项目

`cargo run` == `cargo build` + `./target/debug/world_hello`

`debug` 字段表示：我们运行的是 `debug` 模式，在这种模式下，**代码的编译速度会非常快**，可是福兮祸所伏，**运行速度就慢了**. 原因是，在 `debug` 模式下，Rust 编译器不会做任何的优化，只为了尽快的编译完成，让你的开发流程更加顺畅。

如果需要发布，则需要添加`--release`参数，就和前端中`dev`与`build`的区别类似。

```shell
cargo run --release
cargo build --release
```

## cargo check

作用：当项目大了后，`cargo run` 和 `cargo build` 不可避免的会变慢，`cargo check`可以以更快的方式来验证代码的正确性

## Cargo.toml 和 Cargo.lock

> 类比 npm 中 package.json 与 lock

- `Cargo.toml` 是 `cargo` 特有的**项目数据描述文件**。它存储了项目的所有元配置信息，如果 Rust 开发者希望 Rust 项目能够按照期望的方式进行构建、测试和运行，那么，必须按照合理的方式构建 `Cargo.toml`。
- `Cargo.lock` 文件是 `cargo` 工具根据同一项目的 `toml` 文件生成的**项目依赖详细清单**，因此我们一般不用修改它，只需要对着 `Cargo.toml` 文件撸就行了。

> 什么情况下该把 `Cargo.lock` 上传到 git 仓库里？很简单，当你的项目是一个可运行的程序时，就上传 `Cargo.lock`，如果是一个依赖库项目，那么请把它添加到 `.gitignore` 中。


在 `Cargo.toml` 中，主要通过各种依赖段落来描述该项目的各种依赖项：

- 基于 Rust 官方仓库 `crates.io`，通过版本说明来描述
- 基于项目源代码的 git 仓库地址，通过 URL 来描述
- 基于本地项目的绝对路径或者相对路径，通过类 Unix 模式的路径来描述

```
[dependencies]
rand = "0.3"
hammer = { version = "0.5.0"}
color = { git = "https://github.com/bjz/color-rs" }
geometry = { path = "crates/geometry" }
```

## 下载依赖很慢

### 开启命令行或者全局翻墙

经常有同学反馈，我明明开启翻墙了，但是下载依然还是很慢，无论是命令行中下载还是 VSCode 的 rust-analyzer 插件自动拉取。

事实上，翻墙工具默认开启的仅仅是浏览器的翻墙代理，对于命令行或者软件中的访问，并不会代理流量，因此这些访问还是通过正常网络进行的，自然会失败。

因此，大家需要做的是在你使用的翻墙工具中 `复制终端代理命令` 或者开启全局翻墙。由于每个翻墙软件的使用方式不同，因此具体的还是需要自己研究下。以我使用的 `ClashX` 为例，点击 `复制终端代理命令` 后，会自动复制一些 `export` 文本，将这些文本复制到命令行终端中，执行一下，就可以自动完成代理了。

```shell
export https_proxy=http://127.0.0.1:7890 http_proxy=http://127.0.0.1:7890 all_proxy=socks5://127.0.0.1:7891
```
### 使用国内镜像

为了使用 `crates.io` 之外的注册服务，我们需要对 `$HOME/.cargo/config.toml` ($CARGO_HOME 下) 文件进行配置，添加新的服务提供商，有两种方式可以实现：增加新的镜像地址和覆盖默认的镜像地址。

**首先是在 `crates.io` 之外添加新的注册服务**，在 `$HOME/.cargo/config.toml` （如果文件不存在则手动创建一个）中添加以下内容：

```
[registries]
ustc = { index = "https://mirrors.ustc.edu.cn/crates.io-index/" }
```

这种方式只会新增一个新的镜像地址，因此在引入依赖的时候，需要指定该地址，例如在项目中引入 `time` 包，你需要在 `Cargo.toml` 中使用以下方式引入:

```
[dependencies]
time = { registry = "ustc" }
```

**在重新配置后，初次构建可能要较久的时间**，因为要下载更新 `ustc` 注册服务的索引文件，由于文件比较大，需要等待较长的时间。

此处有两点需要注意：

1. cargo 1.68 版本开始支持稀疏索引，不再需要完整克隆 crates.io-index 仓库，可以加快获取包的速度，如：

`[source.ustc] registry = "sparse+https://mirrors.ustc.edu.cn/crates.io-index/"`

2. cargo search 无法使用镜像

#### [字节跳动](https://course.rs/first-try/slowly-downloading.html#%E5%AD%97%E8%8A%82%E8%B7%B3%E5%8A%A8)

最大的优点就是不限速，当然，你的网速如果能跑到 1000Gbps，我们也可以认为它无情的限制了你，咳咳。

```
[source.crates-io]
replace-with = 'rsproxy'

[source.rsproxy]
registry = "https://rsproxy.cn/crates.io-index"

# 稀疏索引，要求 cargo >= 1.68
[source.rsproxy-sparse]
registry = "sparse+https://rsproxy.cn/index/"

[registries.rsproxy]
index = "https://rsproxy.cn/crates.io-index"

[net]
git-fetch-with-cli = true

```

### 覆盖默认的镜像地址

事实上，我们更推荐第二种方式，因为第一种方式在项目大了后，实在是很麻烦，全部修改后，万一以后不用这个镜像了，你又要全部修改成其它的。

而第二种方式，则不需要修改 `Cargo.toml` 文件，**因为它是直接使用新注册服务来替代默认的 `crates.io`**。

在 `$HOME/.cargo/config.toml` 添加以下内容：

```
[source.crates-io]
replace-with = 'ustc'

[source.ustc]
registry = "git://mirrors.ustc.edu.cn/crates.io-index"

```

首先，创建一个新的镜像源 `[source.ustc]`，然后将默认的 `crates-io` 替换成新的镜像源: `replace-with = 'ustc'`。
