---
title: git 常用操作
date: 2022-02-04
tags: 
  - Git
  - 团队开发
  - 分支管理
  - rebase
  - reset
  - revert
  - cherry-pick
---

# git 常用操作

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

在这篇文章中，笔者总结了几种常用的 Git 操作，特别是在分支管理和提交合并方面的技巧。

首先，提到使用 `git rebase` 进行分支同步和合并多个提交，这种方式能有效减少冲突并保持提交历史的整洁。其次，介绍了 `git cherry-pick` 的使用，它允许从一个分支挑选特定的提交合并到另一个分支，避免了不必要的合并分叉。此外，笔者强调了 `git reset` 和 `git revert` 的区别，前者是直接回退到某个提交，而后者则是通过新增一个反向提交来恢复状态，确保安全性。最后，笔者提到使用标签（tag）来管理版本，方便在生产环境中进行版本控制和回退。这些操作和策略为开发者提供了灵活的版本管理方式。

<!-- DESC SEP -->

## 同步 master
+ 而如果 feat 分支有两个提交，然后直接`git rebase master`，就有可能需要处理两次冲突(假设 master 分支提交的与 feat 提交的在同一份文件中)，`git add .`,`git rebase --continue`,

## 合并多个 commit
+ git log --oneline
+ git rebase -i commitHash ：`commitHash`是 commitID，是需要合并的 commit 的前一个 commit 节点的 ID
+ git rebase -i head~2 ：合并最近两次提交
+ 最后记得使用 git push -f 强制推送，而不是使用 vscode 的同步代码，那个会先拉取。
+ rebase 的时候，修改冲突后的提交不是使用 commit 命令，而是执行 rebase 命令指定 --continue 选项。若要取消 rebase，指定 --abort 选项。
## cherry-pick
它的功能是把已经存在的 commit 进行挑选，然后重新提交。
（今天我记得就是我有分支被我弄乱了，因为我在开发的过程中同步拉取了远程的代码，所以顺序是我提交-->别人提交-->我提交）这时候，使用 check-pick 就很好的解决了合并提交记录的问题，当然，最好还是不要在开发分支的过程中同步远程 master 仓库。

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

## 其他
+ git amend：修改同一个分支最近提交的注解和内容
+ 在 revert 可以取消指定的提交内容。使用后面要提到的 rebase -i 或 reset 也可以删除提交。但是，不能随便删除已经发布的提交，这时需要通过 revert 创建要否定的提交。
+ 在 reset 可以遗弃不再使用的提交。执行遗弃时，需要根据影响的范围而指定不同的模式，可以指定是否复原索引或工作树的内容。
+ 在 rebase 指定 i 选项，您可以改写、替换、删除或合并提交。

## 优秀文章
- [猴子都能懂的 git 入门](https://backlog.com/git-tutorial/cn/stepup/stepup1_5.html)
- [如何优雅解决 git 中冲突](https://juejin.cn/post/7064134612129644558)
- [Git 提交历史的修改删除合并](https://juejin.cn/post/6844903521993621511)
- [使用 git rebase 合并多次 commit](https://juejin.cn/post/6844903600976576519)
- **[前端架构师的 git 功力，你有几成火候？](https://juejin.cn/post/7024043015794589727)**

## 摘录
总结下合并规则：

-   develop -> (merge) -> dev-*
-   dev-* -> (cherry-pick) -> develop
-   develop -> (rebase) -> staging
-   staging -> (rebase) -> release

### 为什么合并到 develop 必须用 cherry-pick？

使用 merge 合并，如果有冲突，会产生分叉；`dev-*` 分支多而杂，直接 merge 到 develop 会产生错综复杂的分叉，难以理清提交进度。

而 cherry-pick 只将需要的 commit 合并到 develop 分支上，且不会产生分叉，使 git 提交图谱（git graph）永远保持一条直线。

再有，模块开发分支完成后，需要将多个 commit 合为一个 commit，再合并到 develop 分支，避免了多余的 commit，这也是不用 merge 的原因之一。

### 为什么合并到 staging/release 必须用 rebase？

rebase 译为变基，合并同样不会产生分叉。当 develop 更新了许多功能，要合并到 staging 测试，不可能用 cherry-pick 一个一个把 commit 合并过去。因此要通过 rebase 一次性合并过去，并且保证了 staging 与 develop 完全同步。

release 也一样，测试通过后，用 rebase 一次性将 staging 合并过去，同样保证了 staging 与 release 完全同步。
### 误操作的撤回方案

开发中频繁使用 git 拉取推送代码，难免会有误操作。这个时候不要慌，git 支持绝大多数场景的撤回方案，我们来总结一下。

撤回主要是两个命令：`reset` 和 `revert`

#### git reset

reset 命令的原理是根据 `commitId` 来恢复版本。因为每次提交都会生成一个 commitId，所以说 reset 可以帮你恢复到历史的任何一个版本。

> 这里的版本和提交是一个意思，一个 commitId 就是一个版本

reset 命令格式如下：

```sh
$ git reset [option] [commitId]
复制代码
```

比如，要撤回到某一次提交，命令是这样：

```sh
$ git reset --hard cc7b5be
复制代码
```

上面的命令，commitId 是如何获取的？很简单，用 `git log` 命令查看提交记录，可以看到 commitId 值，这个值很长，我们取前 7 位即可。

这里的 option 用的是 `--hard`，其实共有 3 个值，具体含义如下：

-   `--hard`：撤销 commit，撤销 add，删除工作区改动代码
-   `--mixed`：默认参数。撤销 commit，撤销 add，还原工作区改动代码
-   `--soft`：撤销 commit，不撤销 add，还原工作区改动代码

这里要格外注意 `--hard`，使用这个参数恢复会删除工作区代码。也就是说，如果你的项目中有未提交的代码，使用该参数会直接删除掉，不可恢复，慎重啊！

除了使用 commitId 恢复，git reset 还提供了恢复到上一次提交的快捷方式：

```sh
$ git reset --soft HEAD^
复制代码
```

`HEAD^` 表示上一个提交，可多次使用。

其实平日开发中最多的误操作是这样：刚刚提交完，突然发现了问题，比如提交信息没写好，或者代码更改有遗漏，这时需要撤回到上次提交，修改代码，然后重新提交。

这个流程大致是这样的：

```sh
# 1. 回退到上次提交
$ git reset HEAD^
# 2. 修改代码...
...
# 3. 加入暂存
$ git add .
# 4. 重新提交
$ git commit -m 'fix: ***'
```

针对这个流程，git 还提供了一个更便捷的方法：

```sh
$ git commit --amend
```

这个命令会直接修改当前的提交信息。如果代码有更改，先执行 `git add`，然后再执行这个命令，比上述的流程更快捷更方便。

reset 还有一个非常重要的特性，就是**真正的后退一个版本**。

什么意思呢？比如说当前提交，你已经推送到了远程仓库；现在你用 reset 撤回了一次提交，此时本地 git 仓库要落后于远程仓库一个版本。此时你再 push，远程仓库会拒绝，要求你先 pull。

如果你需要远程仓库也后退版本，就需要 `-f` 参数，强制推送，这时本地代码会覆盖远程代码。

注意，`-f` 参数非常危险！如果你对 git 原理和命令行不是非常熟悉，切记不要用这个参数。

那撤回上一个版本的代码，怎么同步到远程更安全呢？

方案就是下面要说的第二个命令：`git revert`

#### git revert

revert 与 reset 的作用一样，都是恢复版本，但是它们两的实现方式不同。

简单来说，reset 直接恢复到上一个提交，工作区代码自然也是上一个提交的代码；而 revert 是新增一个提交，但是这个提交是使用上一个提交的代码。

因此，它们两恢复后的代码是一致的，区别是一个新增提交（revert），一个回退提交（reset）。

正因为 revert 永远是在新增提交，因此本地仓库版本永远不可能落后于远程仓库，可以直接推送到远程仓库，故而解决了 reset 后推送需要加 `-f` 参数的问题，提高了安全性。

说完了原理，我们再看一下使用方法：

```sh
$ git revert -n [commitId]
复制代码
```

掌握了原理使用就很简单，只要一个 commitId 就可以了。

### Tag 与生产环境

git 支持对于历史的某个提交，打一个 tag 标签，常用于标识重要的版本更新。

目前普遍的做法是，用 tag 来表示生产环境的版本。当最新的提交通过测试，准备发布之时，我们就可以创建一个 tag，表示要发布的生产环境版本。

比如我要发一个 `v1.2.4` 的版本：

```sh
$ git tag -a v1.2.4 -m "my version 1.2.4"
复制代码
```

然后可以查看：

```sh
$ git show v1.2.4

> tag v1.2.4
Tagger: ruims <2218466341@qq.com>
Date:   Sun Sep 26 10:24:30 2021 +0800

my version 1.2.4
复制代码
```

最后用 git push 将 tag 推到远程：

```sh
$ git push origin v1.2.4
复制代码
```

**这里注意**：tag 和在哪个分支创建是没有关系的，tag 只是提交的别名。因此 commit 的能力 tag 均可使用，比如上面说的 `git reset`，`git revert` 命令。

当生产环境出问题，需要版本回退时，可以这样：

```sh
$ git revert [pre-tag]
# 若上一个版本是 v1.2.3，则：
$ git revert v1.2.3
复制代码
```

在频繁更新，commit 数量庞大的仓库里，用 tag 标识版本显然更清爽，可读性更佳。

再换一个角度思考 tag 的用处。

上面分支管理策略的部分说过，release 分支与生产环境代码同步。在 CI/CD（下面会讲到）持续部署的流程中，我们是监听 release 分支的推送然后触发自动构建。

那是不是也可以监听 tag 推送再触发自动构建，这样版本更新的直观性是不是更好？

