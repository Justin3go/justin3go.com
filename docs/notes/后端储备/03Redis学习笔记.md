# Redis 学习笔记

## Redis 安装

- 当前 redis 最新稳定版本是 4.0.9

- 当前 ubuntu 虚拟机中已经安装好了 redis，以下步骤可以跳过 最新稳定版本下载链接： http://download.redis.io/releases/redis-4.0.9.tar.gz

- step1:下载

  > wget http://download.redis.io/releases/redis-4.0.9.tar.gz

  ![img](https://oss.justin3go.com/blogs/%E4%B8%8B%E8%BD%BDredis.png)

- step2:解压

  > tar xzf redis-4.0.9.tar.gz

- step3:移动，放到 usr/local⽬录下

  > sudo mv ./redis-4.0.9 /usr/local/redis/

- step4:进⼊redis⽬录

  > cd /usr/local/redis/

- step5:生成

  > sudo make

  <img src="https://oss.justin3go.com/blogs/redismake.png" alt="img" style="zoom: 50%;" />

- step6:测试,这段运⾏时间会较⻓

  > sudo make test

  <img src="https://oss.justin3go.com/blogs/maketest.png" alt="img" style="zoom:50%;" />

- step7:安装,将 redis 的命令安装到/usr/local/bin/⽬录

  > sudo make install

- step8:安装完成后，我们进入目录/usr/local/bin 中查看

  > cd /usr/local/bin
  > ls -all

  ![img](https://oss.justin3go.com/blogs/p1_12.png)

  > - redis-server redis 服务器
  > - redis-cli redis 命令行客户端
  > - redis-benchmark redis 性能测试工具
  > - redis-check-aof AOF 文件修复工具
  > - redis-check-rdb RDB 文件检索工具

- step9:配置⽂件，移动到/etc/⽬录下

- 配置⽂件⽬录为/usr/local/redis/redis.conf

  > sudo cp /usr/local/redis/redis.conf /etc/redis/

- Mac 上安装 Redis:

  - 安装 Homebrew：

  > https://brew.sh/

  - 使用 brew 安装 Redis

  > https://www.cnblogs.com/cloudshadow/p/mac_brew_install_redis.html

## 配置

- Redis 的配置信息在/etc/redis/redis.conf 下。

- 查看

  > sudo vi /etc/redis/redis.conf

### 核心配置选项

- 绑定 ip：如果需要远程访问，可将此⾏注释，或绑定⼀个真实 ip

  > bind 127.0.0.1

- 端⼝，默认为 6379

  > port 6379

- 是否以守护进程运⾏

  - 如果以守护进程运⾏，则不会在命令⾏阻塞，类似于服务
  - 如果以⾮守护进程运⾏，则当前终端被阻塞
  - 设置为 yes 表示守护进程，设置为 no 表示⾮守护进程
  - 推荐设置为 yes

  > daemonize yes

- 数据⽂件

  > dbfilename dump.rdb

- 数据⽂件存储路径

  > dir /var/lib/redis

- ⽇志⽂件

  > logfile "/var/log/redis/redis-server.log"

- 数据库，默认有 16 个

  > database 16

- 主从复制，类似于双机备份。

  > slaveof

### 参考资料

redis 配置信息 http://blog.csdn.net/ljphilp/article/details/52934933

## 服务器端

- 服务器端的命令为 redis-server

- 可以使⽤help 查看帮助⽂档

  > redis-server --help

- 个人习惯

  > ps aux | grep redis 查看 redis 服务器进程
  > sudo kill -9 pid 杀死 redis 服务器
  > sudo redis-server /etc/redis/redis.conf 指定加载的配置文件

## 客户端

- 客户端的命令为 redis-cli

- 可以使⽤help 查看帮助⽂档

  > redis-cli --help

- 连接 redis

  > redis-cli

  <img src="https://oss.justin3go.com/blogs/%E8%BF%9E%E6%8E%A5redis.png" alt="img" style="zoom:50%;" />

- 运⾏测试命令

  > ping

  <img src="https://oss.justin3go.com/blogs/redis%E6%B5%8B%E8%AF%95%E8%BF%9E%E6%8E%A5.png" alt="img" style="zoom:50%;" />

- 切换数据库

- 数据库没有名称，默认有 16 个，通过 0-15 来标识，连接 redis 默认选择第一个数据库

  > select 10

  <img src="https://oss.justin3go.com/blogs/redis%E9%80%89%E6%8B%A9%E6%95%B0%E6%8D%AE%E5%BA%93.png" alt="img" style="zoom:50%;" />

## 数据结构

- redis 是 key-value 的数据结构，每条数据都是⼀个键值对

- 键的类型是字符串

- 注意：键不能重复

  ![img](https://oss.justin3go.com/blogs/p1_67.png)

- 值的类型分为五种：

  - 字符串 string
  - 哈希 hash
  - 列表 list
  - 集合 set
  - 有序集合 zset

## 数据操作行为

- 保存
- 修改
- 获取
- 删除

## string 类型

- 字符串类型是 Redis 中最为基础的数据存储类型，它在 Redis 中是二进制安全的，这便意味着该类型可以接受任何格式的数据，如 JPEG 图像数据或 Json 对象描述信息等。在 Redis 中字符串类型的 Value 最多可以容纳的数据长度是 512M。

## 保存

如果设置的键不存在则为添加，如果设置的键已经存在则修改

- 设置键值

  > set key value

- 例 1：设置键为 name 值为 itcast 的数据

  > set name itcast

  ![img](https://oss.justin3go.com/blogs/p1_15.png)

- 设置键值及过期时间，以秒为单位

  > setex key seconds value

- 例 2：设置键为 aa 值为 aa 过期时间为 3 秒的数据

  > setex aa 3 aa

  ![img](https://oss.justin3go.com/blogs/p1_16.png)

- 设置多个键值

  > mset key1 value1 key2 value2 ...

- 例 3：设置键为'a1'值为'python'、键为'a2'值为'java'、键为'a3'值为'c'

  > mset a1 python a2 java a3 c

  ![img](https://oss.justin3go.com/blogs/p1_17.png)

- 追加值

  > append key value

- 例 4：向键为 a1 中追加值' haha'

  > append 'a1' 'haha'

  ![img](https://oss.justin3go.com/blogs/p1_18.png)

  **......其他请自行搜索查看**

## 获取

- 获取：根据键获取值，如果不存在此键则返回 nil

  > get key

- 例 5：获取键'name'的值

  > get 'name'

- 根据多个键获取多个值

  > mget key1 key2 ...

- 例 6：获取键 a1、a2、a3'的值

  > mget a1 a2 a3

  ![img](https://oss.justin3go.com/blogs/mget.png)

## Python 交互

- 在桌面上创建 redis 目录
- 使用 pycharm 打开 redis 目录
- 创建 redis_string.py 文件

```python
from redis import *
if __name__=="__main__":
    try:
        #创建 StrictRedis 对象，与 redis 服务器建⽴连接
        sr=StrictRedis()

    except Exception as e:
        print(e)
```

### string-增加

- ⽅法 set，添加键、值，如果添加成功则返回 True，如果添加失败则返回 False
- 编写代码如下

```python
from redis import *
if __name__=="__main__":
    try:
        #创建 StrictRedis 对象，与 redis 服务器建⽴连接
        sr=StrictRedis()
        #添加键 name，值为 itheima
        result=sr.set('name','itheima')
        #输出响应结果，如果添加成功则返回 True，否则返回 False
        print(result)
    except Exception as e:
        print(e)
```

### string-获取

- ⽅法 get，添加键对应的值，如果键存在则返回对应的值，如果键不存在则返回 None
- 编写代码如下

```python
from redis import *
if __name__=="__main__":
    try:
        #创建 StrictRedis 对象，与 redis 服务器建⽴连接
        sr=StrictRedis()
        #获取键 name 的值
        result = sr.get('name')
        #输出键的值，如果键不存在则返回 None
        print(result)
    except Exception as e:
        print(e)
```

### string-修改

- ⽅法 set，如果键已经存在则进⾏修改，如果键不存在则进⾏添加
- 编写代码如下

```python
from redis import *
if __name__=="__main__":
    try:
        #创建 StrictRedis 对象，与 redis 服务器建⽴连接
        sr=StrictRedis()
        #设置键 name 的值，如果键已经存在则进⾏修改，如果键不存在则进⾏添加
        result = sr.set('name','itcast')
        #输出响应结果，如果操作成功则返回 True，否则返回 False
        print(result)
    except Exception as e:
        print(e)
```

### string-删除

- ⽅法 delete，删除键及对应的值，如果删除成功则返回受影响的键数，否则则返 回 0
- 编写代码如下

```python
from redis import *
if __name__=="__main__":
    try:
        #创建 StrictRedis 对象，与 redis 服务器建⽴连接
        sr=StrictRedis()
        #设置键 name 的值，如果键已经存在则进⾏修改，如果键不存在则进⾏添加
        result = sr.delete('name')
        #输出响应结果，如果删除成功则返回受影响的键数，否则则返回 0
        print(result)
    except Exception as e:
        print(e)
```

### 获取键

- ⽅法 keys，根据正则表达式获取键
- 编写代码如下

```python
from redis import *
if __name__=="__main__":
    try:
        #创建 StrictRedis 对象，与 redis 服务器建⽴连接
        sr=StrictRedis()
        #获取所有的键
        result=sr.keys()
        #输出响应结果，所有的键构成⼀个列表，如果没有键则返回空列表
        print(result)
    except Exception as e:
        print(e)
```

## 主从

- ⼀个 master 可以拥有多个 slave，⼀个 slave⼜可以拥有多个 slave，如此下去，形成了强⼤的多级服务器集群架构

- master 用来写数据，slave 用来读数据，经统计：网站的读写比率是 10:1

- 通过主从配置可以实现读写分离

  ![img](https://oss.justin3go.com/blogs/p1_5.png)

- master 和 slave 都是一个 redis 实例(redis 服务)

### 主从配置

##### 配置主

- 查看当前主机的 ip 地址

  > ifconfig

  ![ifconfig](https://oss.justin3go.com/blogs/p1_10.png)

- 修改 etc/redis/redis.conf 文件

  > sudo vi redis.conf
  > bind 192.168.26.128

- 重启 redis 服务

  > sudo service redis stop
  > sudo redis-server redis.conf

##### 配置从

- 复制 etc/redis/redis.conf 文件

  > sudo cp redis.conf ./slave.conf

- 修改 redis/slave.conf 文件

  > sudo vi slave.conf

- 编辑内容

  > bind 192.168.26.128
  > slaveof 192.168.26.128 6379
  > port 6378

- redis 服务

  > sudo redis-server slave.conf

- 查看主从关系

  > redis-cli -h 192.168.26.128 info Replication

  ![主从关系](https://oss.justin3go.com/blogs/p1_9.png)

### 数据操作

- 在 master 和 slave 分别执⾏info 命令，查看输出信息 进入主客户端

  > redis-cli -h 192.168.26.128 -p 6379

- 进入从的客户端

  > redis-cli -h 192.168.26.128 -p 6378

- 在 master 上写数据

  > set aa aa

  ![master 写数据](https://oss.justin3go.com/blogs/p1_56.png)

- 在 slave 上读数据

  > get aa

## 集群

- 之前我们已经讲了主从的概念，一主可以多从，如果同时的访问量过大(1000w),主服务肯定就会挂掉，数据服务就挂掉了或者发生自然灾难
- 大公司都会有很多的服务器(华东地区、华南地区、华中地区、华北地区、西北地区、西南地区、东北地区、台港澳地区机房)

### 集群的概念

- 集群是一组相互独立的、通过高速网络互联的计算机，它们构成了一个组，并以单一系统的模式加以管理。一个客户与集群相互作用时，集群像是一个独立的服务器。集群配置是用于提高可用性和可缩放性。 ![集群](https://oss.justin3go.com/blogs/p1_58.png)

当请求到来首先由负载均衡服务器处理，把请求转发到另外的一台服务器上。

### redis 集群

- 分类
  - 软件层面
  - 硬件层面
- 软件层面：只有一台电脑，在这一台电脑上启动了多个 redis 服务。

![软件层面](https://oss.justin3go.com/blogs/p1_7.png)

- 硬件层面：存在多台实体的电脑，每台电脑上都启动了一个 redis 或者多个 redis 服务。

![硬件层面](https://oss.justin3go.com/blogs/p1_6.png)

### 搭建集群

- 当前拥有两台主机 172.16.179.130、172.16.179.131，这⾥的 IP 在使⽤时要改为实际值

### 参考阅读

- redis 集群搭建 http://www.cnblogs.com/wuxl360/p/5920330.html
- [Python]搭建 redis 集群 http://blog.5ibc.net/p/51020.html

### 配置机器 1

- 在演示中，172.16.179.130 为当前 ubuntu 机器的 ip

- 在 172.16.179.130 上进⼊Desktop⽬录，创建 conf⽬录

- 在 conf⽬录下创建⽂件 7000.conf，编辑内容如下

  ```
  port 7000
  bind 172.16.179.130
  daemonize yes
  pidfile 7000.pid
  cluster-enabled yes
  cluster-config-file 7000_node.conf
  cluster-node-timeout 15000
  appendonly yes
  ```

- 在 conf⽬录下创建⽂件 7001.conf，编辑内容如下

  ```
  port 7001
  bind 172.16.179.130
  daemonize yes
  pidfile 7001.pid
  cluster-enabled yes
  cluster-config-file 7001_node.conf
  cluster-node-timeout 15000
  appendonly yes
  ```

- 在 conf⽬录下创建⽂件 7002.conf，编辑内容如下

  ```
  port 7002
  bind 172.16.179.130
  daemonize yes
  pidfile 7002.pid
  cluster-enabled yes
  cluster-config-file 7002_node.conf
  cluster-node-timeout 15000
  appendonly yes
  ```

- 总结：三个⽂件的配置区别在 port、pidfile、cluster-config-file 三项

- 使⽤配置⽂件启动 redis 服务

  ```
  redis-server 7000.conf
  redis-server 7001.conf
  redis-server 7002.conf
  ```

- 查看进程如下图 ![img](https://oss.justin3go.com/blogs/p1_59.png)

### 配置机器 2

- 在演示中，172.16.179.131 为当前 ubuntu 机器的 ip

- 在 172.16.179.131 上进⼊Desktop⽬录，创建 conf⽬录

- 在 conf⽬录下创建⽂件 7003.conf，编辑内容如下

  ```
  port 7003
  bind 172.16.179.131
  daemonize yes
  pidfile 7003.pid
  cluster-enabled yes
  cluster-config-file 7003_node.conf
  cluster-node-timeout 15000
  appendonly yes
  ```

- 在 conf⽬录下创建⽂件 7004.conf，编辑内容如下

  ```
  port 7004
  bind 172.16.179.131
  daemonize yes
  pidfile 7004.pid
  cluster-enabled yes
  cluster-config-file 7004_node.conf
  cluster-node-timeout 15000
  appendonly yes
  ```

- 在 conf⽬录下创建⽂件 7005.conf，编辑内容如下

  ```
  port 7005
  bind 172.16.179.131
  daemonize yes
  pidfile 7005.pid
  cluster-enabled yes
  cluster-config-file 7005_node.conf
  cluster-node-timeout 15000
  appendonly yes
  ```

- 总结：三个⽂件的配置区别在 port、pidfile、cluster-config-file 三项

- 使⽤配置⽂件启动 redis 服务

  ```
  redis-server 7003.conf
  redis-server 7004.conf
  redis-server 7005.conf
  ```

- 查看进程如下图 ![进程](https://oss.justin3go.com/blogs/p1_60.png)

### 创建集群

- redis 的安装包中包含了 redis-trib.rb，⽤于创建集群

- 接下来的操作在 172.16.179.130 机器上进⾏

- 将命令复制，这样可以在任何⽬录下调⽤此命令

  ```
  sudo cp /usr/share/doc/redis-tools/examples/redis-trib.rb /usr/local/bin/
  ```

- 安装 ruby 环境，因为 redis-trib.rb 是⽤ruby 开发的

  > sudo apt-get install ruby

- 在提示信息处输⼊y，然后回⻋继续安装 ![安装](https://oss.justin3go.com/blogs/p1_61.png)

- 运⾏如下命令创建集群

  ```
  redis-trib.rb create --replicas 1 172.16.179.130:7000 172.16.179.130:7001 172.16.179.130:7002 172.16.179.131:7003 172.16.179.131:7004 172.16.179.131:7005
  ```

- 执⾏上⾯这个指令在某些机器上可能会报错,主要原因是由于安装的 ruby 不是最 新版本!

- 天朝的防⽕墙导致⽆法下载最新版本,所以需要设置 gem 的源

- 解决办法如下

  ```
  -- 先查看⾃⼰的 gem 源是什么地址
  gem source -l -- 如果是 https://rubygems.org/ 就需要更换
  -- 更换指令为
  gem sources --add https://gems.ruby-china.org/ --remove https://rubygems.org/
  -- 通过 gem 安装 redis 的相关依赖
  sudo gem install redis
  -- 然后重新执⾏指令
  ```

  ![安装](https://oss.justin3go.com/blogs/p1_64.png)

  ```
  redis-trib.rb create --replicas 1 172.16.179.130:7000 172.16.179.130:7001 172.16.179.130:7002 172.16.179.131:7003 172.16.179.131:7004 172.16.179.131:7005
  ```

- 提示如下主从信息，输⼊yes 后回⻋ ![主从](https://oss.justin3go.com/blogs/p1_62.png)

- 提示完成，集群搭建成功

### 数据验证

- 根据上图可以看出，当前搭建的主服务器为 7000、7001、7003，对应的从服务器是 7004、7005、7002

- 在 172.16.179.131 机器上连接 7002，加参数-c 表示连接到集群

  > redis-cli -h 172.16.179.131 -c -p 7002

- 写⼊数据

  > set name itheima

- ⾃动跳到了 7003 服务器，并写⼊数据成功

- ![](https://oss.justin3go.com/blogs/p1_65.png)

- 在 7003 可以获取数据，如果写入数据又重定向到 7000(负载均衡) 

- ![p1_66](https://oss.justin3go.com/blogs/p1_66.png)

### 在哪个服务器上写数据：CRC16

- redis cluster 在设计的时候，就考虑到了去中⼼化，去中间件，也就是说，集群中 的每个节点都是平等的关系，都是对等的，每个节点都保存各⾃的数据和整个集 群的状态。每个节点都和其他所有节点连接，⽽且这些连接保持活跃，这样就保 证了我们只需要连接集群中的任意⼀个节点，就可以获取到其他节点的数据
- Redis 集群没有并使⽤传统的⼀致性哈希来分配数据，⽽是采⽤另外⼀种叫做哈希 槽 (hash slot)的⽅式来分配的。redis cluster 默认分配了 16384 个 slot，当我们 set⼀个 key 时，会⽤CRC16 算法来取模得到所属的 slot，然后将这个 key 分到哈 希槽区间的节点上，具体算法就是：CRC16(key) % 16384。所以我们在测试的 时候看到 set 和 get 的时候，直接跳转到了 7000 端⼝的节点
- Redis 集群会把数据存在⼀个 master 节点，然后在这个 master 和其对应的 salve 之间进⾏数据同步。当读取数据时，也根据⼀致性哈希算法到对应的 master 节 点获取数据。只有当⼀个 master 挂掉之后，才会启动⼀个对应的 salve 节点，充 当 master
- 需要注意的是：必须要 3 个或以上的主节点，否则在创建集群时会失败，并且当存 活的主节点数⼩于总节点数的⼀半时，整个集群就⽆法提供服务了

### Python 交互

- 安装包如下

  > pip install redis-py-cluster

- redis-py-cluster 源码地址 https://github.com/Grokzen/redis-py-cluster

- 创建⽂件 redis_cluster.py，示例码如下

```python
from rediscluster import *
if __name__ == '__main__':
  try:
    # 构建所有的节点，Redis 会使⽤CRC16 算法，将键和值写到某个节点上
    startup_nodes = [
        {'host': '192.168.26.128', 'port': '7000'},
        {'host': '192.168.26.130', 'port': '7003'},
        {'host': '192.168.26.128', 'port': '7001'},
    ]
    # 构建 RedisCluster 对象
    src=RedisCluster(startup_nodes=startup_nodes,decode_responses=True)
    # 设置键为 name、值为 itheima 的数据
    result=src.set('name','itheima')
    print(result)
    # 获取键为 name
    name = src.get('name')
    print(name)
  except Exception as e:
    print(e)
```


