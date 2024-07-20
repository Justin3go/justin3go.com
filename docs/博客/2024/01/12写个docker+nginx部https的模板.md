# 写个docker+nginx部https的模板

封面：

![](https://oss.justin3go.com/blogs/%E6%88%91%E5%86%99%E4%BA%86%E4%B8%80%E4%B8%AAnginx%E9%83%A8%E7%BD%B2https%E7%9A%84%E6%95%99%E7%A8%8B%E5%8D%9A%E5%AE%A2%EF%BC%8C%E8%AF%B7%E4%B8%BA%E6%88%91%E7%94%9F%E6%88%90%E4%B8%80%E4%B8%AA%E5%8D%9A%E5%AE%A2%E5%B0%81%E9%9D%A2%E5%9B%BE_0.png)
## 背景

有时候想部署一个给国内朋友使用的小网站，但是国内又没有像国外那些免费好用的部署平台，所以就只能自己搭建，自己搭建又每次避开不了nginx反代实现https这一步，所以就简单写了个模板以及shell脚本，方便自己每次快速部署。
## 简介

[模板地址](https://github.com/Justin3go/nginx-https-template)，一个基于`nginx + docker`的`https`模板，可以快速部署`https`网站🚀🚀🚀

> 你至少并且也只需要拥有docker环境，[# 如何在 Ubuntu 20.04 上安装和使用 Docker](https://zhuanlan.zhihu.com/p/143156163)

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


