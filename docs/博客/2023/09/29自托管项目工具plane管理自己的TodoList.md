# 自托管项目工具plane管理自己的TodoList

## 前言

前面一段时间发现了这个`plane`项目管理工具，号称jira的开源替代，然后看了看，这个项目的后端竟然是使用的Django框架，瞬间就对这个plane仓库产生了兴趣，于是就稍微折腾了一下，自部署了这个plane工具，作为自己的项目管理工具以及TodoList管理工具。

## 基本部署

首先项目里面的东西是非常重要的，且有些也比较隐私，所以https对于笔者来说是必不可少的。

得益于docker的优势，部署起来非常简单，基本上根据[官方文档](https://docs.plane.so/self-hosting)的自托管教程来就行，不过第一步笔者是直接clone的整个仓库，因为还是想学习一下，如果你只是单纯的想部署，不想管其中的代码，则可以按照官方文档的那些参数进行clone，笔者的命令如下：

```shell
git clone git@github.com:makeplane/plane.git
```

然后运行其中的`setup.sh`文件，由于笔者是使用的https，所以命令如下：

```shell
./setup.sh https://plane.justin3go.com
```

然后根据其提示进行输入即可...

最后，配置根目录下的环境变量，比如：

1. 如果需要发送邮件，记得配置邮箱
2. pg的账号密码最好改一下
3. `ENABLE_SIGNUP`笔者是设置的`0`，不允许注册，因为是自用
4. 反正根据自己情况配置即可，默认的配置也行，大不了不满意再改就是

然后运行如下命令即可

```
docker compose -f docker-compose-hub.yml up
```
## https->nginx相关配置

非常值得注意的是，`NGINX_PORT`需要设置为另外一个端口，因为笔者这里是在同一台机器上部署两个nginx，其中一个nginx来作为https的代理转发，比如笔者设置为`NGINX_PORT=8888`，此时项目结构为这样的：

![](https://oss.justin3go.com/blogs/https_plane%E7%9A%84nginx%E7%BB%93%E6%9E%84.png)

这里同样笔者还是使用docker安装的https_nginx，在`/root/work/nginx`目录中进行操作：

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

cert下的文件就不多说了，就是自己去ssl那里下载的相关证书文件

conf.d文件如下，做了以下操作：

1. 监听443端口，设置ssl，并代理转发到8888端口
2. 监听80，重定向到443

```
server {
    listen 443 ssl http2;
    server_tokens off;

    # 修改为自己的域名
    server_name plane.justin3go.com;

    # ssl证书存放位置
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
    #把http的域名请求转成https
    return 301 https://plane.justin3go.com$request_uri; 
}
```

docker-compose.yml文件如下：

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

dockerReset.sh是一个非常简单的docker命令的脚本文件，看自己的情况是否需要：

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

上述nginx-https配置笔者也会全部上传到[这个仓库](https://github.com/Justin3go/nginx-https-template)中，方便使用，如果大家需要的话。

最后，运行如下命令即可：

```shell
sudo chmod +x ./dockerReset.sh
# run shell script
./dockerReset.sh
```

注：需要先运行plane的docker镜像，再运行这边nginx-https的docker镜像，因为plane那边的会有条命令删除default.conf文件，所以先后顺序不能调换。
## 部署杂谈

其实你也可以直接更改plane项目中的docker-compose-hub.yml文件，将其中的proxy部分改为docker-compose.yml中的proxy部分并修改为上述的https配置，这也是笔者最开始部署的时候采用的方法，不过由于更改了plane项目的源代码，不太优雅，所以就再增加了一个nginx代理进行解耦。
## plane基本介绍

你可以在[这个链接](https://docs.plane.so/workspaces)中看到plane的核心概念，这里就不过多介绍了，基本上就是平常大家接触的那些概念，并且文档也非常清晰。

## 作为自己的TodoList

让plane作为项目管理工具大家应该都轻车熟路了，而这里笔者将其作为个人的TodoList管理工具，基本思路如下：

每一年的计划作为一个项目，比如几个月后还会有个人规划2024之类的：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929150755.png)

通过labels来区分规划中的不同分类：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151014.png)

views来过滤视图：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151117.png)

当然，更多功能结合todolist的方式笔者也还在探索中，比如通过cycle作为我的一天计划之类的，iusse视图也有甘特图，日历图之类的展示方式，也非常方便：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151343.png)

以及展板之类的统计图，一年之后来看应该会有所感概：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230929151439.png)

## 最后

管理项目和管理自己其实有异曲同工之妙，希望能找到一种合理的方式使用这个Plane工具；

值得一提的是，plane目前还有不少bug，比如项目背景图不能修改，网站图标不显示之类的，这个iusse里面也有，期待其变得更好，当然，如果有精力也可以试试贡献代码。


