---
title: 超详细的前端程序员 git 指北
date: 2022-10-14
tags: 
  - Git
  - 团队开发
  - 分支管理
  - rebase
  - reset
  - revert
  - cherry-pick
---

# 超详细的前端程序员 git 指北

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇博客中深入探讨了如何高效使用 Git 进行团队开发，特别是从创建分支到合并代码的整个流程。

首先，笔者强调了 Git 在团队开发中的重要性，并通过一个示例演示了从创建仓库、分支管理到合并请求的具体步骤。接下来，笔者详细介绍了如何创建功能分支、提交代码、合并多个提交以及解决合并冲突的技巧。特别是在处理合并请求时，如何使用`rebase`来同步最新代码并解决冲突是一个重点。最后，笔者还概述了`reset`与`revert`命令的不同，以及如何使用`cherry-pick`选择性地合并提交。

整篇文章以实用为导向，旨在帮助开发者掌握 Git 的核心使用技巧，提升团队协作的效率。

<!-- DESC SEP -->

---

> git 是团队开发必备工具之一，本期教程我们从一个开发人员开发新功能，然后合并到主分支上的一整个流程进行演示讲解，而不是仅仅告诉你这个命令的作用是什么，区别是什么，毕竟程序员始终得贯穿“学以致用”这条硬道理，最后再对不同的常见命令及逆行讲解。

## 一个 git 小 demo

这是这个例子要演示的整体节点图，接下来的 demo 就是按照如下流程进行演示的

![](https://oss.justin3go.com/blogs/git_demo%E4%BE%8B%E5%AD%90.png)

注：`preonline => main` 这里没有画出来，理论上和`feat_login => preonline`一致也会进行一次`fast-forward merge` 

### step1：开始

> 为了方便理解，这里我们不深入 git 的原理，它是如何追踪的，它是如何在多个分支中切换的这些都不谈，本篇文章的目的也主要是带大家真正会使用 git，真正成为我们手上的工具

首先这里我在 github 创建了一个仓库来演示这个过程：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115173556.png)

然后我们克隆这个仓库，当然前提是你已经安装了 git 并配置了基本信息：

```sh
git clone git@github.com:Justin3go/test-git.git
```

运行效果如下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115191425.png)

目前，这个项目只有`main`一个分支，但一般来说，一个线上项目至少都会还有一个`preonline`的分支，当然，具体到各个项目可能主要分支情况又不一样，这里介绍一种比较常见的情况，后续遇到不同的分支结构类比并参考`contributing.md`这类文档开发就应该没什么问题了。

所以我们简单创建一个基本结构，多创建一个`preonline`分支：该分支的作用就是所有其他功能分支就只能合并进入`preonline`分支，没什么问题之后才会合入`main`分支进行上线；

```sh
git checkout -b preonline  # 创建并切换分支
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115192356.png)

### step2：开发分支

接下来我们就可以开发分支了，一般来说，看大家团队自己的规范，比如要求所有开发分支必须以`dev`作为前缀，而还有些是要求以分支具体情况作为分支名，比如`feat_init`、`fix_some_bug`、`style_botton`等等，这和我们平常的`commit`信息的前缀是一致的，而具体来说有如下的前缀：

-   `build`：表示构建，发布版本可用这个
-   `ci`：更新 CI/CD 等自动化配置
-   `chore`：杂项，其他更改
-   `docs`：更新文档
-   `feat`：常用，表示新增功能
-   `fix`：常用：表示修复 bug
-   `perf`：性能优化
-   `refactor`：重构
-   `revert`：代码回滚
-   `style`：样式更改
-   `test`：单元测试更改

比如我们现在需要新增一个登录功能，我们就创建我们自己的分支：

```sh
git checkout main  # 切换到主分支
git checkout -b feat_login  # 创建并切换到我们自己的分支
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115194749.png)

然后我们就可以进行开发了：

**首先我先开发完了基本上所有的功能，下面是我新增的代码，然后准备提交**

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115195139.png)

基本来说，你可以直接使用 vscode 的可视化命令，也可以使用如下的`git`命令进行操作

```sh
git add .  # 暂存所有更改的文件
```
![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115195322.png)

```sh
git commit -m "feat: 完成登录功能" # 提交并添加提交信息
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115195443.png)


**然后我们点击分布分支就会在远程仓库里面创建一个一样的分支： **


![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115195616.png)

**然后走查的时候产品经理说 button 样式不对，所以你继续进行修改：**

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115195821.png)

**然后你接着和之前一样提交代码`git add .`，`git commit -m "style: login button color"`，再然后就是你就需要推送到远程分支了`git push`**

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115200121.png)

### step3：合并多次提交

前面一小节的内容几乎都是在自己的分支上操作，所以都是一些比较简单的命令，接下来就是要和团队对齐了，比如一般来说为了最后主分支上的 commit 信息简洁和可读性，每个功能分支上面的多个 commit 都需要合并成一个 commit，比如我们刚才的`feat_login`分支就有两个 commit，所以现在我们进行合并：

```sh
git rebase HEAD~2 # 合并最近两次提交
```

> 这里还是先将整个流程走完，某些经典命令比如这里的`rebase`的详细使用指南可以查看后续的章节

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115202023.png)

然后我们修改其中的提交信息如下：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115202308.png)
这里发现我这里的 git 默认使用的是 nano 编辑器，但我比较熟悉 vim，所以设置一下 git 的默认编辑器：

```sh
git config --global core.editor vim
```

之后修改信息为如下这个样子然后`esc wq`保存退出就可以了：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115202858.png)

再然后我们输入`git log --oneine`查看提交信息就可以发现修改成功了，如下图，之前的两次提交合并成为了一次提交：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115203200.png)

### step4：同步 preonline 分支

在团队开发时，大家基本都并行开发，每周基本都有几个需求会在同一个项目中进行修改，不可避免的就是在提交合并请求时（github 叫做`pull request` ，gitlab 叫做`merge request`）这里简称为`MR`，需要同步最新的代码，如果有冲突，还需要解决冲突，之后才能提交`MR`

为了演示，我直接在 github 上面修改了`preonline`分支上的内容如下，假设是其他人进行了开发，并在我们之前合并到了`preonline`

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115214947.png)

然后我们在本地先拉取最新的`preonline`分支

```sh
git pull
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115215136.png)

然后我们就需要切换到自己的分支进行同步操作了

```sh
git checkout feat_login
git rebase preonline  # 同步最新的：将自己新开发的提交变基到最新的 preonline 分支上
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115215525.png)

很好，我们遇到冲突了，我们点击在合并编辑器中打开，你也可以直接在这里操作，不过我喜欢好看一点的合并编辑器：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115215809.png)

然后就需要你手动选择要合并的代码，这里你要和别人商量一下要谁的登录页，这个例子可能不太好，现实中一般不会两个人开发同一个按钮，这里仅仅为了演示。

然后你点击`accept`其中一个，最后点接受合并就可以了

继续刚才的`rebase`操作，在此之前你可能还需要`git add .`一下

```sh
git add .
git rebase --continue
```

> 如果你在处理完冲突后不想继续当前的`rebase`操作了，比如冲突处理错了等等，你可以`git rebase --abort`

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115220146.png)

还要记得`git push`一下，本地推送到远程，并且需要`-f`参数，因为我们修改了以前的提交的信息，注意由于这是在我们自己的分支上操作，所以`-f`是可行的。

```sh
git push -f
```

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115220451.png)

之后我们在 github 上面操作，去提交`MR`

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115220619.png)

然后项目的负责人或者核心成员就可以对你的代码进行`CR`了（`code review`）

![](https://oss.justin3go.com/blogs/Pasted%20image%2020221115220742.png)

`CR`完成之后，就是项目负责人同意合并请求，你的代码就成功合并到了`preonline`，不同项目有不同的周期，等到上线当天，`preonline`里面的代码就会被项目负责人合并到`main`分支上完成上线。

## `git log`介绍

查看提交信息，一般会用`git log --oneline`简略查看之前的提交；

[官网快速入口](https://git-scm.com/docs/git-log)

[git log 的使用](https://www.jianshu.com/p/0805b5d5d893)

## 撤回提交之`reset`与`revert`

开发中频繁使用 git 拉取推送代码，难免会有误操作。这个时候不要慌，git 支持绝大多数场景的撤回方案，我们来总结一下。

撤回主要是两个命令：`reset` 和 `revert`

#### git reset

reset 命令的原理是根据 `commitId` 来恢复版本。因为每次提交都会生成一个 commitId，所以说 reset 可以帮你恢复到历史的任何一个版本。

> 这里的版本和提交是一个意思，一个 commitId 就是一个版本

reset 命令格式如下：

```sh
git reset [option] [commitId]
```

比如，要撤回到某一次提交，命令是这样：

```sh
git reset --hard cc7b5be
```

上面的命令，commitId 是如何获取的？通过之前介绍的`git log`命令即可查看

这里的 option 用的是 `--hard`，其实共有 3 个值，具体含义如下：

-   `--hard`：撤销 commit，撤销 add，删除工作区改动代码
-   `--mixed`：默认参数。撤销 commit，撤销 add，还原工作区改动代码
-   `--soft`：撤销 commit，不撤销 add，还原工作区改动代码

除了使用 commitId 恢复，git reset 还提供了恢复到上一次提交的快捷方式：

```sh
git reset --soft HEAD^
```

`HEAD^` 表示上一个提交，可多次使用。

其实平日开发中最多的误操作是这样：刚刚提交完，突然发现了问题，比如提交信息没写好，或者代码更改有遗漏，这时需要撤回到上次提交，修改代码，然后重新提交。

这个流程大致是这样的：

```sh
# 1. 回退到上次提交
git reset HEAD^
# 2. 修改代码...
...
# 3. 加入暂存
git add .
# 4. 重新提交
git commit -m 'fix: ***'
```

针对这个流程，git 还提供了一个更便捷的方法：

```sh
git commit --amend
```

这个命令会直接修改当前的提交信息。如果代码有更改，先执行 `git add`，然后再执行这个命令，比上述的流程更快捷更方便。

reset 还有一个非常重要的特性，就是**真正的后退一个版本**。

什么意思呢？比如说当前提交，你已经推送到了远程仓库；现在你用 reset 撤回了一次提交，此时本地 git 仓库要落后于远程仓库一个版本。此时你再 push，远程仓库会拒绝，要求你先 pull。

如果你需要远程仓库也后退版本，就需要 `-f` 参数，强制推送，这时本地代码会覆盖远程代码。

#### git revert

revert 与 reset 的作用一样，都是恢复版本，但是它们两的实现方式不同。

简单来说，reset 直接恢复到上一个提交，工作区代码自然也是上一个提交的代码；而 revert 是新增一个提交，但是这个提交是使用上一个提交的代码。

因此，它们两恢复后的代码是一致的，区别是一个新增提交（revert），一个回退提交（reset）。

正因为 revert 永远是在新增提交，因此本地仓库版本永远不可能落后于远程仓库，可以直接推送到远程仓库，故而解决了 reset 后推送需要加 `-f` 参数的问题，提高了安全性。

说完了原理，我们再看一下使用方法：

```sh
git revert -n [commitId]
```

## `git rebase`介绍

[官网快速入口](https://git-scm.com/docs/git-rebase)

常见操作：

- `git rebase -i head~2`：合并最近两次提交
- `git rebase -i head~3`：合并最近三次提交
- `git rebase -i [commitId]`：合并`[commitId]`之前的所有提交，不包括`[commitId]`对应的提交
- `git rebase master`：同步到主分支：将我在功能分支新的提交尝试提交到最新的`master`分支上

基本原理：

![](https://oss.justin3go.com/blogs/rebase%E5%8E%9F%E7%90%86%E5%9B%BE.png)

如上图：

- 我在`历史提交 3`部分创建了功能分支并开发新增了两个提交
- 其他人在主分支上提交了新的代码`更新提交 1`与`更新提交 2`
- 我们本地拉取最新的`master`分支
- 然后我们在我们自己的功能分支上`git rebase master` 就可以得到图中下半部分

[逐步操作演示可参考](https://juejin.cn/post/6844903600976576519)

## `git merge`介绍

将两个或多个开发历史合并在一起

[官网入口](https://git-scm.com/docs/git-merge)

基本原理：

![](https://oss.justin3go.com/blogs/merge%E5%8E%9F%E7%90%86%E5%9B%BE.png)

`merge`会将功能提交和更新提交合并并创建一个新的提交，会有更丰富的提交信息。当然，这个“丰富”在某些情况又可以称为“杂乱”，具体用什么看大家自己的团队规范了。

## `git cherry-pick`介绍

这个命令非常好用并且简单，它的功能是把已经存在的 commit 进行挑选，然后重新提交

例子：

在`master`的基础上，`test`进行了 2 次提交，`normal`进行了 1 次提交。现在想把`test`的第 2 次提交
（仅仅是第 2 次提交，不包含第 1 次提交）和`normal`的第 1 次提交合并到 master 分支，直接 merge 分支是行不通的，这样会把两个分支的全部提交都合并到`master`，用`cherry-pick`即可完美的解决问题， 如果`normal`第一次提交的`SHA-1`值是`9b47dd`，`test`第二次提交的值是`dd4e49`，执行如下命令即可把这两个提交合并到`master`

```sh
git cherry-pick 9b47dd dd4e49
```

如果有冲突，则需要修改冲突文件，然后添加修改文件到暂存区，命令如下：

```sh
git add main.js
```

最后执行

```sh
git cherry-pick --continue
```
cherry-pick 后

最后要说明的是：

-   执行完`git cherry-pick --continue`后不需要 commit 了，该命令会自动提交
-   `git cherry-pick --abort`可以放弃本次`cherry-pick`
-   `git cherry-pick 9b47dd dd4e49`和`git cherry-pick dd4e49 9b47dd`这两个的结果可能会**不一样**，**顺序很重要**


## 其他快捷操作

[通过`git alias`简化命令](https://git-scm.com/book/zh/v2/Git-%E5%9F%BA%E7%A1%80-Git-%E5%88%AB%E5%90%8D)

https://github.com/commitizen/cz-conventional-changelog

## 最后

本篇文章对原理并没有研究，仅仅演示了使用，并且对一些细节部分也没有一一演示验证，如有理解错误，欢迎友善指出🎉

## 参考

- https://git-scm.com/docs
- https://juejin.cn/post/7024043015794589727
- https://backlog.com/git-tutorial/cn/stepup/stepup1_5.html
- https://juejin.cn/post/7064134612129644558
- https://juejin.cn/post/6844903521993621511
- https://juejin.cn/post/6844903600976576519

