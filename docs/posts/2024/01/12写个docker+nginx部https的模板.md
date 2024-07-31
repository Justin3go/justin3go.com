---
title: 写个 docker+nginx 部 https 的模板
date: 2024-01-12
tags: 
  - docker
  - nginx
  - https
  - shell
  - deploy
---

# 写个 docker+nginx 部 https 的模板

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中分享了一个基于`nginx + docker`的`https`模板，旨在简化国内用户自建小网站的部署过程。考虑到国内缺乏便捷的免费部署平台，笔者创建了一个易于使用的模板和相应的脚本，以便快速实现`https`反向代理。

使用该模板的基本步骤包括：

1. 克隆模板项目到本地。
2. 替换证书文件为自己的证书。
3. 运行脚本以替换域名。
4. 根据需要修改`docker-compose.yml`中的根目录。
5. 启动 Docker 容器。

最后，笔者建议使用`docker ps`命令检查容器状态，并查看`nginx`日志以确保服务正常运行。总的来说，这个模板为用户提供了一个快速、方便的方式来部署`https`网站。

<!-- DESC SEP -->

## 背景

有时候想部署一个给国内朋友使用的小网站，但是国内又没有像国外那些免费好用的部署平台，所以就只能自己搭建，自己搭建又每次避开不了 nginx 反代实现 https 这一步，所以就简单写了个模板以及 shell 脚本，方便自己每次快速部署。
## 简介

[模板地址](https://github.com/Justin3go/nginx-https-template)，一个基于`nginx + docker`的`https`模板，可以快速部署`https`网站🚀🚀🚀

> 你至少并且也只需要拥有 docker 环境，[# 如何在 Ubuntu 20.04 上安装和使用 Docker](https://zhuanlan.zhihu.com/p/143156163)

基本流程：

![](https://oss.justin3go.com/blogs/nginx_https.png)

## 使用该模板

1. 进入你的`repos`目录，可以为任意目录（不过后续可能要稍做修改），这里以`/root/repos/`为例，如果没有`repos`目录，可以创建一个。然后`clone`本项目

```shell
cd /root/repos/
```

```shell
git clone https://github.com/Justin3go/nginx-https-template.git
cd nginx-https-template

```

2. 替换`cert/`下的证书为你的证书，格式为`your-domain.key`和`your-domain.pem`，比如我的域名是`justin3go.com`，那么我的证书就是`justin3go.com.key`和`justin3go.com.pem`

3. 运行脚本`./scripts/replace-domain.sh --domain=your-domain`

```shell
sudo chmod -R +x ./scripts # 设置脚本权限
./scripts/replace-domain.sh --domain=your-domain # 运行脚本替换域名
```

> 注意：默认`https`转发的是`80`端口，如果你的网站不是`80`端口，需要修改`/conf.d/default.conf`中的`proxy_pass`为你的端口

4. 如果在第一步中你使用的自定义目录，则修改`docker-compose.yml`中的根目录为你的目录，默认为`/root/repos/`

5. 启动容器

```shell
./scripts/run.sh
```

## 接下来

- 你可以使用`docker ps`命令查看容器是否正常运行
- 以及使用`tail -n 1000 logs/access.log`和`tail -n 1000 logs/error.log`查看`nginx`运行日志


