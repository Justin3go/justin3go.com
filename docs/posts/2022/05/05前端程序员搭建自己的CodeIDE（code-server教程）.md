---
title: 前端程序员搭建自己的 CodeIDE（code-server 教程）
date: 2022-05-05
tags: 
  - CodeIDE
  - code-server
  - 前端
  - 编程
---

# 前端程序员搭建自己的 CodeIDE（code-server 教程）

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中详细介绍了如何在 Ubuntu 20 上搭建自己的 CodeIDE，使用 code-server 实现浏览器编程的便利。首先，通过官方链接下载 code-server，并在服务器上解压后即可运行。设置时需要注意`--port`和`--host`参数，以便允许远程访问。接着，笔者建议配置`config.yaml`文件以实现 HTTPS 访问，并提供了获取证书的方式。

为了管理代码服务器进程，笔者使用了 pm2 工具，同时也提到了解析域名的操作。此外，还分享了如何配置 VS Code 的插件和设置同步，甚至介绍了如何安装 JavaScript 版本的 Jupyter（ijavascript），以便在 Jupyter Notebook 中使用 JavaScript。最后，笔者提供了详细的视频教程，方便读者更直观地了解整个搭建过程。

<!-- DESC SEP -->

---

> 偶尔不能在自己电脑上写代码时，用用浏览器敲代码也挺方便；或者用平板刷刷算法题也挺有趣；测试 JavaScript 某一代码片段也不用在浏览器的控制台上打印输出了；
## 安装 code-server
我这里使用的是 ubuntu20，大家根据自己的系统下载对应的安装包即可，当然最好跟着我的教程来，这样出错了可能都是我踩过的坑，更容易解决，不然就是自己去折腾吧

1. 首先下载 code-server
官方地址如下：https://github.com/coder/code-server/releases 我这边根据我的需求下载的是这个：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029220158.png)
然后两种方式，一种是直接在服务器上下载它，不过我服务器没配 vpn，所以我采取的第二种方式，本地下载然后通过某些 ssh 工具上传服务器即可，都是一样的，结果就是服务器上多了这样一个文件就行，用自己喜欢的方式即可。

由于买的云服务器都是我一人使用，不用特别在乎一些用户权限等等，所以接下来的操作为了方便我都是在 root 用户下操作的，使用的 ssh 工具是 finalshell。

不是 root 的话先切换为 root 用户
```sh
sudo su root
```
然后上传(或直接下载)上述的`code-server-xxx-linux-amd64.tar.gz`文件

我这里放在了 download 文件夹下面`/root/download/code-server`根据你自己的习惯存放即可

解压：

```sh
tar -zxvf code-server-4.8.1-linux-amd64.tar.gz
```

然后其实就已经可以运行了(运行的是【code-server-4.8.1-linux-amd64（解压后的文件）/bin/code-server】)

```sh
./bin/code-server --port 8080 --host 0.0.0.0 --auth password

```
`--port`：Code Server 运行的端口，可以自己设置  

`--host 0.0.0.0`：允许任意 IP 的访问，必须加该字段，否者默认是 localhost，这样你就不能在本地访问远程运行的 code-server 了

这里先这样，后续直接在 yaml 文件里配置这些就不用输入后续这些一长串的参数了

然后在浏览器中打开对应的 ip:port 即可

当然，如果使用的云厂商的服务记得配置放行端口，并且如果 ubuntu 里配置了防火墙也记得放行端口或者关闭防火墙，否者无法访问（ubuntu 默认是关闭防火墙的，除非你自己之前配置过，这里就不详细介绍相关命令了，大家可以自行去搜搜相关命令）

## 额外配置
运行了上述命令之后，会生成一个默认的 config.yaml 文件，你可以通过运行后的输出信息得到；

修改其中的信息

```yaml
vim ~/.config/code-server/config.yaml // 一般来说都是在对应用户的这个目录下
```
这是我的相关配置

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029224316.png)

这里我同时也配置了 https 访问，毕竟有些代码来回传输不加密可不行

简单说说证书的获取，途径很多，选择自己合适的即可，我这里使用的是阿里云的免费证书：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029224839.png)

然后下载其中的证书后上传到服务器中对应的文件夹即可

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029224927.png)

你可以从我上面的`config.yaml`配置中看到我服务器里证书密钥的放置位置，这个完全凭喜好放置。

此时你就可以直接输入`./code-server`运行了，使用的就是 config 里面的默认参数了。

## pm2 启动&域名解析

然后我们将其使用 pm2 管理起来，或者你直接`nohup <command> &`挂起该进程也可以。

这里简单使用 pm2 管理如下：

```sh
npm i -g pm2
echo './code-server' > start_code_server.sh
pm2 start start_code_server.sh
```
pm2 的其他常用命令和其他操作这里就不一一介绍了[官网](https://pm2.keymetrics.io/docs/usage/quick-start/)

运行后输入`pm2 list`如下

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029225931.png)

之后，你就可以在浏览器中随时访问你的 codeIDE 了，当然，我还解析了个子域名给 ip 地址，这个直接在对应的云服务厂商上操作即可（这里不详细介绍域名解析操作，自己在界面点点试试就可以了）：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029230302.png)

然后输入 ip:port 或者自己的域名就可以了

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029230553.png)

## 简单配置 vscode
当然，初始不是上述这个界面，还需要对 vscode 进行一定的配置，这个真就看大家习惯了，自己喜欢什么插件就配置什么插件就行了。

我这里暂时只安装了这些插件：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029231614.png)

简单摘要几点： 

[官方 FAQ](https://coder.com/docs/code-server/latest/FAQ#how-can-i-reuse-my-vs-code-configuration)
### How do I use my own extensions marketplace?

If you own a marketplace that implements the VS Code Extension Gallery API, you can point code-server to it by setting `$EXTENSIONS_GALLERY`. This corresponds directly with the `extensionsGallery` entry in in VS Code's `product.json`.

For example, to use the legacy Coder extensions marketplace:

```bash
export EXTENSIONS_GALLERY='{"serviceUrl": "https://extensions.coder.com/api"}'
```

Though you can technically use Microsoft's marketplace in this manner, we strongly discourage you from doing so since this is [against their Terms of Use](https://coder.com/docs/code-server/latest/FAQ#why-cant-code-server-use-microsofts-extension-marketplace).

For further information, see [this discussion](https://github.com/microsoft/vscode/issues/31168#issue-244533026) regarding the use of the Microsoft URLs in forks, as well as [VSCodium's docs](https://github.com/VSCodium/vscodium/blob/master/DOCS.md#extensions--marketplace).
### How can I reuse my VS Code configuration?

You can use the [Settings Sync](https://marketplace.visualstudio.com/items?itemName=Shan.code-settings-sync) extension for this purpose.

Alternatively, you can also pass `--user-data-dir ~/.vscode` or copy `~/.vscode` into `~/.local/share/code-server` to reuse your existing VS Code extensions and configuration.

## 安装 JavaScript 版的 jupyter（ijavascript）
为了在 jupyter-notebook 中使用 JavaScript，需要安装对应的 Node.js 内核，这里我使用的是[ijavascript](https://github.com/n-riesco/ijavascript)

根据官方文档安装即可，我这里使用的是 ubuntu20，node16 出现了一定问题，通过该 issue 中的回答即可解决：https://github.com/n-riesco/ijavascript/issues/270

主要就是要先安装`libzmq3-dev`

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221029231956.png)

目前我只遇到这一个问题，如果大家有其他问题，自行搜索和查看下 issue 中的其他回答吧

最后你应该就能得到我上述的页面了

![](https://oss.justin3go.com/blogs/demo.gif)

## 详细视频教程

<iframe 
  src="//player.bilibili.com/player.html?aid=304716403&bvid=BV1rP411w7YZ&cid=878395274&page=1"
  scrolling="no"
  border="0"
  frameborder="0"
  framespacing="0"
  allowfullscreen="true"
  width="100%"
  height="500px"
  sandbox="allow-top-navigation allow-same-origin allow-forms allow-scripts"
>
</iframe>

