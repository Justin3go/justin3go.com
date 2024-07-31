---
title: 自托管项目工具 plane 管理自己的 TodoList
date: 2023-09-29
tags: 
  - plane
  - TodoList
  - Django
  - Docker
  - HTTPS
---

# 自托管项目工具 plane 管理自己的 TodoList

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者最近发现了一个名为`plane`的开源项目管理工具，作为 Jira 的替代品，后端使用 Django 框架。经过简单的部署，笔者将其用于管理自己的 TodoList。部署过程相对简单，主要依赖 Docker，按照官方文档的指示进行操作，同时确保了 HTTPS 的安全性。

在配置 NGINX 时，笔者特别设置了不同的端口以避免冲突，并在`docker-compose.yml`文件中定义了服务的结构。通过配置 SSL 证书，笔者成功实现了 HTTP 到 HTTPS 的重定向。为了保持系统的优雅性，笔者选择了通过 NGINX 代理进行解耦，而不是直接修改`plane`的源代码。

在使用上，笔者将每年的计划视为一个项目，并利用标签和视图功能对 TodoList 进行分类和过滤。尽管`plane`仍存在一些 bug，笔者对其未来的改进充满期待，并希望在使用中找到更高效的管理方式。

<!-- DESC SEP -->

## 前言

前面一段时间发现了这个`plane`项目管理工具，号称 jira 的开源替代，然后看了看，这个项目的后端竟然是使用的 Django 框架，瞬间就对这个 plane 仓库产生了兴趣，于是就稍微折腾了一下，自部署了这个 plane 工具，作为自己的项目管理工具以及 TodoList 管理工具。

## 基本部署

首先项目里面的东西是非常重要的，且有些也比较隐私，所以 https 对于笔者来说是必不可少的。

得益于 docker 的优势，部署起来非常简单，基本上根据[官方文档](https://docs.plane.so/self-hosting)的自托管教程来就行，不过第一步笔者是直接 clone 的整个仓库，因为还是想学习一下，如果你只是单纯的想部署，不想管其中的代码，则可以按照官方文档的那些参数进行 clone，笔者的命令如下：

```shell
git clone git@github.com:makeplane/plane.git
```

然后运行其中的`setup.sh`文件，由于笔者是使用的 https，所以命令如下：

```shell
./setup.sh https://plane.justin3go.com
```

然后根据其提示进行输入即可...

最后，配置根目录下的环境变量，比如：

1. 如果需要发送邮件，记得配置邮箱
2. pg 的账号密码最好改一下
3. `ENABLE_SIGNUP`笔者是设置的`0`，不允许注册，因为是自用
4. 反正根据自己情况配置即可，默认的配置也行，大不了不满意再改就是

然后运行如下命令即可

```
docker compose -f docker-compose-hub.yml up
```
## https->nginx 相关配置

非常值得注意的是，`NGINX_PORT`需要设置为另外一个端口，因为笔者这里是在同一台机器上部署两个 nginx，其中一个 nginx 来作为 https 的代理转发，比如笔者设置为`NGINX_PORT=8888`，此时项目结构为这样的：

![](https://oss.justin3go.com/blogs/https_plane%E7%9A%84nginx%E7%BB%93%E6%9E%84.png)

这里同样笔者还是使用 docker 安装的 https_nginx，在`/root/work/nginx`目录中进行操作：

该目录结构为：

```
nginx
├─ cert
│  ├─ plane.justin3go.com.key
│  └─ plane.justin3go.com.pem
├─ conf.d
│  └─ default.conf
├─ docker-compose.yml
├─ dockerReset.sh
└─ logs
   ├─ access.log
   └─ error.log
```

cert 下的文件就不多说了，就是自己去 ssl 那里下载的相关证书文件

conf.d 文件如下，做了以下操作：

1. 监听 443 端口，设置 ssl，并代理转发到 8888 端口
2. 监听 80，重定向到 443

```
server {
    listen 443 ssl http2;
    server_tokens off;

    # 修改为自己的域名
    server_name plane.justin3go.com;

    # ssl 证书存放位置
    ssl_certificate /etc/nginx/cert/plane.justin3go.com.pem;
    ssl_certificate_key /etc/nginx/cert/plane.justin3go.com.key;
    ssl_session_timeout 5m;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE:ECDH:AES:HIGH:!NULL:!aNULL:!MD5:!ADH:!RC4;
    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;
    ssl_prefer_server_ciphers on;

    root /www/data/;
    access_log /var/log/nginx/access.log;

    client_max_body_size 4M;

    location / {
        proxy_pass http://plane.justin3go.com:8888/;       
    }
}
server {
    listen 80;

    root /www/data/;
    #请填写绑定证书的域名
    server_name plane.justin3go.com; 
    #把 http 的域名请求转成 https
    return 301 https://plane.justin3go.com$request_uri; 
}
```

docker-compose.yml 文件如下：

```yaml
version: '3.8'
services:
  nginx:
    image: nginx:stable-alpine      # 指定服务镜像
    container_name: nginx_https    # 容器名称
    restart: always                 # 重启方式
    ports:                          # 映射端口
      - "80:80"
      - "443:443"
    volumes:                        # 挂载数据卷
      - /etc/localtime:/etc/localtime
      - /root/work/nginx/conf.d:/etc/nginx/conf.d
      - /root/work/nginx/logs:/var/log/nginx
      - /root/work/nginx/cert:/etc/nginx/cert
```

dockerReset.sh 是一个非常简单的 docker 命令的脚本文件，看自己的情况是否需要：

```shell
# 关闭容器
docker-compose stop || true;
# 删除容器
docker-compose down || true;
# 对空间进行自动清理
docker system prune -a -f
docker compose up -d
# 查看日志
# docker logs plane-proxy;
```

上述 nginx-https 配置笔者也会全部上传到[这个仓库](https://github.com/Justin3go/nginx-https-template)中，方便使用，如果大家需要的话。

最后，运行如下命令即可：

```shell
sudo chmod +x ./dockerReset.sh
# run shell script
./dockerReset.sh
```

注：需要先运行 plane 的 docker 镜像，再运行这边 nginx-https 的 docker 镜像，因为 plane 那边的会有条命令删除 default.conf 文件，所以先后顺序不能调换。
## 部署杂谈

其实你也可以直接更改 plane 项目中的 docker-compose-hub.yml 文件，将其中的 proxy 部分改为 docker-compose.yml 中的 proxy 部分并修改为上述的 https 配置，这也是笔者最开始部署的时候采用的方法，不过由于更改了 plane 项目的源代码，不太优雅，所以就再增加了一个 nginx 代理进行解耦。
## plane 基本介绍

你可以在[这个链接](https://docs.plane.so/workspaces)中看到 plane 的核心概念，这里就不过多介绍了，基本上就是平常大家接触的那些概念，并且文档也非常清晰。

## 作为自己的 TodoList

让 plane 作为项目管理工具大家应该都轻车熟路了，而这里笔者将其作为个人的 TodoList 管理工具，基本思路如下：

每一年的计划作为一个项目，比如几个月后还会有个人规划 2024 之类的：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929150755.png)

通过 labels 来区分规划中的不同分类：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151014.png)

views 来过滤视图：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151117.png)

当然，更多功能结合 todolist 的方式笔者也还在探索中，比如通过 cycle 作为我的一天计划之类的，iusse 视图也有甘特图，日历图之类的展示方式，也非常方便：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151343.png)

以及展板之类的统计图，一年之后来看应该会有所感概：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151439.png)

## 最后

管理项目和管理自己其实有异曲同工之妙，希望能找到一种合理的方式使用这个 Plane 工具；

值得一提的是，plane 目前还有不少 bug，比如项目背景图不能修改，网站图标不显示之类的，这个 iusse 里面也有，期待其变得更好，当然，如果有精力也可以试试贡献代码。


