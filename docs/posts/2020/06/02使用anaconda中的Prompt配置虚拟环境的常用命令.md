---
title: 使用 anaconda 中的 Prompt 配置虚拟环境的常用命令
date: 2020-06-02
tags: 
  - anaconda
  - conda
  - 虚拟环境
  - 命令行
---

# 使用 anaconda 中的 Prompt 配置虚拟环境的常用命令

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中总结了 Anaconda 中使用命令行配置虚拟环境的常用命令，以便于自己和他人在需要时快速查阅。首先，文章强调了换源的重要性，提供了查看和更改源的命令，以及国内常用镜像源的链接，如清华大学、阿里云等。此外，笔者还介绍了如何创建和激活虚拟环境的步骤，并提供了安装特定包及查看已安装包的命令。具体命令包括：

- 查看源：`conda config --show-sources`
- 创建虚拟环境：`conda create -n python37 python=3.7`
- 激活虚拟环境：`conda activate (你的环境名)`
- 查看虚拟环境列表：`conda env list`
- 查看当前环境中的包：`conda list`

这份总结为用户提供了便利，避免了每次都要搜索的麻烦。

<!-- DESC SEP -->

---

因为自己目前也记不到这么多命令，每次去配环境的时候都是问度娘复制粘贴，所以就总结了一下常用的 conda 命令，方便用的时候直接复制；

参考链接：1.[Windows 在命令行中使用 conda 命令创建删除虚拟环境_我才不会害羞的博客-CSDN 博客_conda 环境管理](https://blog.csdn.net/qq_45855805/article/details/102979213)

​         \2. [conda（anaconda）删除清华源，改回原源_甜甜圈 Sweet Donut 的博客-CSDN 博客_conda 删除清华源](https://blog.csdn.net/qinglingls/article/details/89363368) 

​         3.[conda 查看及添加镜像源_血雨腥风霜的博客-CSDN 博客_查看 conda 源](https://blog.csdn.net/weixin_41466947/article/details/107377071)

​         4.[conda 源，添加删除 - 程序员大本营](https://www.pianshen.com/article/30971024940/)   

​        （应该还有一些，不过找不到了）

## 1.每次都是速度限制，所以第一个就是：换源常用命令：

   查看源：**conda config --show-sources**

   换回默认源：conda config --remove-key channels

   国内的一些镜像源（有时候有些源会报错或者没有一些东西，需要换一下，相互补充）：    

​        阿里云 http://mirrors.aliyun.com/pypi/simple/ 

​        中国科技大学 [Simple Index](https://pypi.mirrors.ustc.edu.cn/simple/) 

​        豆瓣(douban) [Simple Index](http://pypi.douban.com/simple/) 

​       清华大学 [Simple Index](https://pypi.tuna.tsinghua.edu.cn/simple/) 

​       中国科学技术大学 [Simple Index](http://pypi.mirrors.ustc.edu.cn/simple/)

   这是添加清华源的方法（其他的类推）：

​       conda config --add channels [Index of /anaconda/pkgs/main/ | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/main/)

​       conda config --add channels [Index of /anaconda/pkgs/free/ | 清华大学开源软件镜像站 | Tsinghua Open Source Mirror](https://mirrors.tuna.tsinghua.edu.cn/anaconda/pkgs/free/)

​       conda config --add channels [Error](https://mirrors.tuna.tsinghua.edu.cn/anaconda/cloud/conda-forge/)

​       conda config --set show_channel_urls yes

   注：pip 临时使用这些源的方法：

   **临时使用（也可以永久使用，这里就不展开了，偏题了，可自行百度）：** 

   可以在使用 pip 的时候在后面加上-i 参数，指定 pip 源 

   eg: pip install scrapy -i [Simple Index](https://pypi.tuna.tsinghua.edu.cn/simple)

   删除某个源：

   conda config --remove channels ‘[main](https://repo.continuum.io/pkgs/main/)‘（删除有引号）

   如果遇到无法删除可以尝试先执行

   conda config --set show_channel_urls yes

   再执行

   conda config --remove channels ’[main](https://repo.continuum.io/pkgs/main/)‘

## 2.创建虚拟环境：

   创建虚拟环境：eg：创建一个名为 python37，Python 版本为 3.7 的 conda 虚拟环境：conda create -n python37 python=3.7（之后会出现选择安装一些基础包的情况，输入 y 就可以了）

   激活虚拟环境： conda activate (你的环境名) 这样你安装的那些东西才是安装在你所建的环境中；

   然后你就可以尽情地使用 conda 或 pip 安装你想要的包了:conda install ……  pip install …… pip install "本地下载好的包的路径 whl 文件"

   搜索想要安装包的版本： conda search pytorch

   查看你的虚拟环境：conda env list

   在当前激活的环境中查看所安装的包：conda list 

   