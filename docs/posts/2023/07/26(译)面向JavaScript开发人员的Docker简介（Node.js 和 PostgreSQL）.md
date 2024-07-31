---
title: (译)面向 JavaScript 开发人员的 Docker 简介（Node.js 和 PostgreSQL）
date: 2023-07-26
tags: 
  - Docker
  - JavaScript
  - Node.js
  - PostgreSQL
  - Dockerfile
  - Docker Compose
---

# (译)面向 JavaScript 开发人员的 Docker 简介（Node.js 和 PostgreSQL）

> ✨文章摘要（AI生成）

<!-- DESC SEP -->

笔者在这篇文章中介绍了 Docker 的基本概念及其对 JavaScript 开发者的价值，尤其是在构建 Node.js 和 PostgreSQL 全栈应用时的应用场景。文章强调了 Docker 通过容器化技术解决了开发环境一致性的问题，使得开发者能够在不同设备上快速部署应用，而无需担心依赖和版本不兼容的问题。

通过实际示例，笔者展示了如何创建一个 Node.js 应用程序，使用 Dockerfile 构建镜像，并通过 Docker Compose 来管理多容器应用，包括连接 PostgreSQL 数据库。文章还详细介绍了 Docker 的命令行操作、镜像和容器的管理，以及如何使用卷(VOL)实现文件同步，确保开发过程的高效性。

最后，笔者鼓励开发者深入学习 Docker，并利用其强大特性来简化开发环境的搭建与管理，从而提升开发效率与协作能力。

<!-- DESC SEP -->

## 译者注

> 本文为翻译文章；
> 原文链接：[Introduction to Docker for Javascript Developers (feat Node.js and PostgreSQL)](https://dev.to/alexeagleson/docker-for-javascript-developers-41me); 
> 原文作者：[Alex Eagleson](https://dev.to/alexeagleson)
> 免责声明：本文译者以 google 翻译+chatGPT 翻译全文，略作修正和提示，如遇不解，一切以原文为主，尊重原文。
> 译者：[Justin3go](https://justin3go.com/)

1. 技术无边界，边界都是人为定义划分的，包括前后端分离，也是为了解耦应用开发的复杂性，分为了两个领域交给不同的工程师来完成。
2. 当前形势，独立开发者越来越成为许多前端程序员理想的职业；想要独立开发一个应用，部署运维等都是必不可少的技能。
3. 而 Docker 已经成为部署中高频使用的工具之一，其拥有便利性、跨平台和可移植性、简化协作与持续集成等优秀特性

本文主要为前端开发人员介绍 Docker，通过构建一个包含前端和 PostgreSQL 数据库的全栈 Node.js 应用程序来了解 Docker 是什么以及它的用途，并且提供了相关的可运行代码跟随文章阅读。

其他：[我终于会用 Docker 了(nest+prisma+psotgresql+nginx+https)](https://justin3go.com/%E5%8D%9A%E5%AE%A2/2023/04/17%E6%88%91%E7%BB%88%E4%BA%8E%E4%BC%9A%E7%94%A8Docker%E4%BA%86(nest+prisma+psotgresql+nginx+https).html)

## 介绍

### 什么是 Docker？

[Docker](https://docs.docker.com/get-started/overview/)是一个工具，允许您将运行应用程序的环境与应用程序本身一起打包。并且只需额外增加一个`Dockerfile`文件即可完成该操作。

*译者注：可以理解为`makefile`，描述打包的流程*
  
它使用一种称为"容器"的概念来创建您的应用程序环境，这种容器比完整的虚拟机更轻量化（需要更少的资源）。这些容器被设计得极其便携，这意味着您可以快速在任何地方部署它们，并且通过简单地部署更多容器副本来快速扩展您的应用程序。

您只需在 Dockerfile 中定义您的环境需求（例如 Ubuntu 18、Node.js 等），每次在任何机器上启动您的容器时，它将完全重新创建那个环境。因此，您事先就知道不会遇到任何缺少依赖项或版本不正确的问题。

*译者注：解释一下最后一句话，即本地调试无问题后，在部署时服务器中运行也不会有这类问题*

确实，对于那些对开发世界还不太熟悉，并且尚未经历过 Docker 所解决问题的人来说，真正展示 Docker 的必要性可能是具有挑战性的。

这个教程旨在模拟您在工作环境中可能遇到的一些现实场景，并展示 Docker 如何帮助解决这些问题。

### 场景

我们将在此示例中复制两个常见的开发问题：

- 您公司的项目依赖于开发团队在其计算机上安装的较旧版本的工具（在我们的示例中为[Node.js ）](https://nodejs.org/en/)
- 我们希望使用开发人员本地计算机上的数据库副本轻松测试应用程序，而不要求他们安装数据库软件（在我们的例子中是 PostgreSQL）

如果您遵循本教程，您将在您的计算机上运行一个工作应用程序并查询 Postgres 数据库，而无需安装 Node.js 或 Postgres。您需要的唯一工具是 Docker。

这是可扩展的。

## 先决条件

本教程需要安装的唯一必备软件是 IDE（代码编辑器，我使用 VS Code）和 Docker。

安装 Docker 的方式取决于您运行的操作系统。[我在 Windows 11 上的 WSL2](https://docs.microsoft.com/en-us/windows/wsl/install-manual#step-2---check-requirements-for-running-wsl-2)上运行它，这是一次奇妙的体验。它在 Mac 和 Linux 上同样有效，您只需[按照操作系统的安装说明进行操作](https://www.docker.com/get-started)即可。

我推荐 Docker Desktop，它会给你一个很好的 GUI 来使用 Docker，但这不是必需的。本教程将完全通过命令行管理 Docker（尽管我可能使用 Docker Desktop 进行屏幕截图以显示正在发生的情况）。

我还建议也安装[Node.js。](https://nodejs.org/en/)从技术上讲，您_可以_不使用它，但在前几个步骤中，我们将在使用 Docker 之前在本地运行该应用程序。它还将有助于演示 Docker 如何修复我们的版本控制问题。

## 安装 Docker

安装 Docker 后，让我们确保它可以正常工作。当您输入：  

```shell
docker --version
```

您应该获得版本号（而不是“未找到”）。我的版本现在显示 20.10.11，但任何接近该数字的版本都应该可以正常工作。

[大多数容器都托管在名为 Docker Hub](https://hub.docker.com/)的服务上，包括我们将使用的容器。

让我们首先测试最简单的容器，称为`hello-world`.

## 创建容器

运行以下命令下载镜像`hello-world`：  

```shell
docker pull hello-world
```

这将从 Docker hub 中提取*镜像*。重要的是要确保术语正确，我们还没有创建_容器_。Docker 镜像是一*组有关如何创建容器的指令*。如果您熟悉 Web 开发，请将镜像（`image`）视为 HTML（蓝图），将容器（`container`）视为 DOM（结构）。

您可以在您的`Dockerfile`中为默认镜像指令添加额外的指令，我们很快就会介绍这些内容。

假设您收到类似的成功消息`Status: Image is up to date for hello-world:latest`，则您已准备好创建容器。  

```shell
docker run hello-world
```

如果成功，您将在终端中看到以下输出：  

```shell
Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/
```

恭喜！您已成功运行了您的第一个 Docker 容器！虽然如果您使用 Docker 桌面版，可以非常轻松地管理它，但现在让我们来看一下一些最常见的命令，以便在命令行上进行管理：

```shell
docker image ls

# OR

docker container ls
```

这个命令将显示您系统中当前所有的镜像或容器列表。由于 hello-world 容器在打印测试消息后就会停止运行，不会像运行 Web 应用程序的容器一样持续运行。您在容器列表中看不到它，但会在镜像列表中看到它。

镜像或容器的 ID 和名称都很重要，因为它们允许您在启动或停止时引用这些镜像/容器。

当您停止运行一个容器时，它并不会被删除。这是件好事！这意味着下次您需要时，只需快速启动它，而无需再次下载和安装。

在使用 Docker 时，当您更改内容或构建新版本时，这些镜像和容器有时会堆积起来。要快速删除所有旧/未使用的镜像和容器，您可以运行： 

```shell
docker image prune

# OR

docker container prune
```

如果现在这些内容对您来说似乎不太有用，不要担心，但请记住它们，因为您很可能在以后需要回头查阅这些内容。

## 创建 Node 应用程序

在我们深入了解 Docker 之前，让我们构建一个小型 Web 应用程序，以便帮助演示 Docker 的一些更高级特性。我们将构建一个使用 Node.js 和 Express 的简单 Web 服务器：

我已经创建了一个名为`docker-template`的新空目录，并在其中初始化了一个 NPM 仓库。

```shell
mkdir docker-template
cd docker-template
npm init
npm install express
```

`server.js`

```js
const express = require("express");
const app = express();
const port = 8080;

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200);
  res.send("<h1>Hello world</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
```

现在运行您的应用程序：

```shell
node server.js
```

然后访问[http://localhost:8080]()可以看到

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230726001657.png)
  
我们希望为这个项目启用一个额外的功能，即文件监视和在文件更改时自动重新加载服务器。

最简单的方法是使用一个名为[nodemon](https://www.npmjs.com/package/nodemon).的工具。

```
npm install nodemon --save-dev
```

`package.json`

```json
{
  "name": "server",
  "version": "1.0.0",
  "description": "",
  "main": "server.js",
  "scripts": {
    "start": "nodemon server.js"
  },
  "author": "me",
  "license": "ISC",
  "dependencies": {
    "express": "^4.17.2",
  },
  "devDependencies": {
    "nodemon": "^2.0.15"
  }
}
```

运行你的应用通过如下命令：

```shell
npm run start
```

在您的应用程序运行时尝试编辑 server.js 文件（将"hello world"修改为"hello world!!!!"或其他内容），并验证您的 Node 应用程序是否重新加载，并且在您点击刷新按钮时，浏览器中能看到更改的内容（文件监视不会自动触发浏览器刷新）。

一旦这一步骤完成，请继续进行下一步！

## 弃用该 Node 应用程序

  
这个部分有点意思。让我们有意将这个服务器变成一个旧项目。

我们将假设您正在运行最新版本的 Node（15 或更高版本）。您可以通过运行以下命令来检查：

```shell
node --version
```

  
我的输出是`v16.11.1`。如果您的版本旧于 15，您可以使用[NVM](https://github.com/nvm-sh/nvm#installing-and-updating)或者继续阅读。对于这一部分，并不需要在您的机器上安装特定版本的 Node。实际上，我们将在下一节中使用 Docker 来解决这个问题。

在 Node 15 中，一个破坏性的变更是[unhandled rejected promises](https://blog.logrocket.com/node-js-15-whats-new-and-how-the-developer-experience-has-improved/)。在 15 版本之前，如果一个 Javascript promise 被拒绝且没有被 catch 捕获，会产生一个警告，但程序会继续运行。但在 Node  v15 之后，未处理的 promise **会导致程序崩溃**。

因此，我们可以添加一些代码，使我们的服务器在 Node 15 之前的版本上正常工作，但在新版本的 Node 上则无法正常工作。

现在让我们来做这个操作：

`server.js`

```ts
// @ts-check

const express = require("express");
const app = express();
const port = 8080;

app.get("/", async (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.status(200);
  res.send("<h1>Hello world</h1>");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("good");
  }, 300);
  reject("bad");
});

myPromise.then(() => {
  console.log("this will never run");
});
```

上面的代码创建了一个始终被拒绝的新 Promise。它会在 Node.js v14 上运行（会有一个警告），但在 v15 及以上版本上会导致程序崩溃，并显示错误代码：'ERR_UNHANDLED_REJECTION'。

现在显然，我们可以简单地添加一个 catch 块（或完全删除该代码），但我们正在尝试复制一种情况：您正在处理一个较旧的代码库，并且可能没有这些选项可供选择。

假设由于某种原因，这个应用程序必须在 Node v14 或更早版本上运行才能正常工作。团队中的每个开发人员都必须准备好在该环境中操作... 但我们的公司也有一个在 Node v17 上运行的新应用程序！所以我们还需要那个环境。

而且，正好说起，还有其他一些工具使用版本 X！而我的机器上只有版本 Y！谁知道我的团队其他成员使用的是哪个版本，或者我将应用程序发送给测试的那个人又在用哪个版本。

怎么办！？

Docker 登场了！

*译者注：当然，你可以使用诸如`nvm`、`pnpm`等 node 版本工具来控制 node 版本，但：*

1. *与其让每个开发人员的电脑去适应该项目，不如一劳永逸，让该项目去适用不同的开发人员*
2. *并不是所有的环境都可以类似 node 非常方便的切换版本*

## 创建 Dockerfile 文件

使用 Docker，我们可以使用代码来生成我们应用程序运行的环境。我们将首先在 Docker Hub 上搜索 Node.js 的镜像。官方的 Node 镜像就被称为 [node](https://hub.docker.com/_/node)。

当您查看支持的标签时，您会发现有很多版本。就像您的计算机上有某个版本一样，几乎每个您想要的 Node 版本都有相应的 Docker 镜像。当然，Node 本身需要安装在某种操作系统上，因此这通常是标签的另一部分。

默认的 Node 镜像运行在[Debian](https://wiki.debian.org/DebianReleases)上，但最流行的版本之一运行在称为[Alpine Linux](https://alpinelinux.org/)的系统上。

Alpine Linux 之所以受欢迎，主要是因为它的体积很小，它是一个 Linux 发行版，旨在剔除除了最必要的部分以外的所有内容。这意味着在这个映像上运行和分发我们的应用程序将更快且更具成本效益（如果它满足我们的需求）。

对于我们的简单应用程序，它是合适的。

请记得，我们特别需要一个较旧版本的 Node（早于 v15，这样我们的应用程序才能正常运行而不崩溃），所以我将选择标记为`node:14-alpine3.12`的镜像。这是 Node v14 和 Alpine v3.12。

我们可以使用`docker pull node:14-alpine3.12`命令提前拉取这个镜像，就像我们之前用`hello-world`镜像那样，但这不是必需的。通过在我们的`Dockerfile`中添加它，Docker 将在我们的机器上找不到它时自动从 Docker Hub 拉取它。

现在，让我们在我们的项目根目录（与`server.js`文件同级）创建一个名为`Dockerfile`（无扩展名）的文件：

`Dockerfile`

```dockerfile
# select your base image to start with
FROM node:14-alpine3.12

# Create app directory
# this is the location where you will be inside the container
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
# copying packages first helps take advantage of docker layers
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

# Make this port accessible from outside the container
# Necessary for your browser to send HTTP requests to your Node app
EXPOSE 8080

# Command to run when the container is ready
# Separate arguments as separate values in the array
CMD [ "npm", "run", "start"]
```

我在 Dockerfile 中添加了很多注释，以帮助解释每个部分的作用。您可以在这里了解更多关于[Dockerfile](https://docs.docker.com/engine/reference/builder/)的内容，我强烈建议您浏览该页面，以熟悉可用的命令。

在我们继续之前，我想简要谈一下 Docker 的层级（`layers`）和缓存，因为它们是非常重要的主题！

## Docker 的层与缓存

  
对于像这样的简单 Dockerfile，一个常见的问题是：

> "为什么你在使用 COPY 命令两次？第一次 COPY 不是多余的吗？因为第二次 COPY 已经将整个目录复制了。"

实际上，答案是“不”，原因是由于 Docker 的一个最好的特性，即层（layers）。

每次使用 FROM、COPY、RUN 或 CMD 命令时，它都会创建另一个基于前一个层的镜像。该镜像可以被缓存，并且只有在发生变化时才需要重新创建。

因此，通过在`package-*.json`上创建一个特定的 COPY 命令，我们创建了一个层，该层基于在运行`npm install`之前的`package.json`文件内容。这意味着，除非我们更改 package.json，否则下一次构建 Docker 时，Docker 将使用缓存层，其中已经运行过`npm install`，我们就不必每次运行`docker build`时都安装所有的依赖项。这将节省大量时间。

接下来的 COPY 命令会检查我们项目目录中的每个文件，因此该图层将在任何文件更改时重新构建（基本上在我们应用程序中更新除 package.json 以外的任何内容时都会重新构建）。但这正是我们想要的。

这只是使用 Docker 时可以利用的效率之一，我鼓励您阅读[有关 Dockerfile 最佳实践的完整列表](https://docs.docker.com/develop/develop-images/dockerfile_best-practices/)。

## 构建应用容器

现在您的 Dockerfile 已创建，我们在构建之前只需要做最后一件事。

与您可能熟悉的`.gitignore`类似（用于防止将自动生成的文件和私人机密提交到公共存储库），Docker 有一个类似的概念，可以防止您不必要地复制容器不需要的文件。

现在让我们创建一个`.dockerignore`文件：

`.dockerignore`

```
node_modules
npm-debug.log
```

这两个都将在容器内生成，因此我们不想复制它们的本地版本。

此时我们已准备好构建。运行以下命令：

```shell
docker build . -t my-node-app
```

这将在当前目录`.`中构建 Dockerfile 描述的*镜像*，并为其命名为`my-node-app`. 完成后，您可以通过以下方式查看图像及其所有详细信息：

```shell
docker image ls
```

创建镜像后，我们现在准备使用镜像构建一个_容器来运行我们的*应用程序*：

```shell
docker run -p 3000:8080 --name my-node-app-container my-node-app
```

该命令告诉 Docker 使用我们的镜像来构建正在运行的容器。该`--name`标志让我们可以为容器命名（以便更容易识别和稍后停止/启动，否则名称将随机生成）。

我使用该名称`my-node-app-container`来将其与最后一个参数区分开来，最后一个参数是我们正在构建的镜像的名称 (`my-node-app`)。

我们使用该`-p`标志将主机（我们的计算机）环境的端口绑定到容器环境。

如果您还记得我们`EXPOSE 8080`在 Dockerfile 中写入的内容，那就是我们的应用程序运行的端口。上面的命令将我们机器上的端口 3000 映射到容器中的端口 8080。

_（请注意，如果您愿意，您可以映射相同的端口，例如 8080:8080，我们只是在本示例中将其混合以表明这是可能的）_

仔细检查您的容器是否已成功启动：

```shell
docker container ls
```

我的输出看起来像：

```
CONTAINER ID   IMAGE         COMMAND                  CREATED         STATUS         PORTS                    NAMES
b6523b2602e1   my-node-app   "docker-entrypoint.s…"   6 minutes ago   Up 6 minutes   0.0.0.0:3000->8080/tcp   my-node-app-container
```

我们可以看到容器已运行 X 分钟。这意味着我们的应用程序在端口 8080 上运行，我们可以使用端口 3000 访问我们机器上的该端口，因此打开浏览器访问[http://localhost:3000/]()以查看：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230726090100.png)

非常好！您已经创建了第一个自定义 Docker 映像和容器，并在其中运行了您自己的应用程序！

现在您已经设置了环境，接下来您可能想要做的事情之一自然就是更新您的应用程序。如果您更改`server.js`并保存文件，重新加载页面时是否会看到这些更改？

不，你不会。`server.js`该应用程序基于容器内部的副本运行，该副本与项目目录中的副本没有直接关系。有没有一种方法可以让我们以某种方式“连接”它们？

当然有，我们需要引入 Docker Volumes。

## 添加 Docker Volumes

[Docker 使用卷](https://docs.docker.com/storage/volumes/)的概念来允许您在运行的容器之间保存数据。

您可以想象您可能希望让您的应用程序保存一些数据，但根据 Docker 的工作方式，您的容器被设计为可以随意销毁和重新创建，即容器内部的数据会被清除。

使用卷的主要方法有两种。您可以提前创建一个并为其命名。默认情况下，这会将所有卷数据保存在该`/var/lib/docker/volumes`目录中（在 Linux 环境中，该目录可能不同，但在 Windows 上是相同的）。

可以使用以下命令要创建命名卷（在本教程中您不需要运行此命令，这只是一个示例）：

```shell
docker volume create my-named-volume
```

然后，您可以将容器中的任何目录映射到计算机上的该目录。您可以通过将`--volume`标志添加到`docker run`命令中来实现此目的，如下所示`--volume my-named-volume:/usr/src/app my-node-app`：

该示例会将容器中的工作目录映射到计算机上的 Docker 卷。然而，这对我们没有帮助，因为我们希望将特定目录（我们的项目目录）与容器中的目录同步，以便我们可以编辑项目中的文件并让它们在容器中更新。

我们也可以做到这一点。

首先，我们需要停止现有容器（没有卷），将其删除，然后**使用**该卷再次运行它：

```shell
docker container stop my-node-app-container

docker container rm my-node-app-container

docker run -p 3000:8080 --name my-node-app-container --volume  ${PWD}:/usr/src/app my-node-app
```

在大多数终端中，PWD 的意思是“打印工作目录”，因此它将把当前目录映射到`/usr/src/app`容器内的目录。这将实现我们在计算机上的项目和容器中的项目之间同步文件的目标。

由于我们已经在本教程前面设置了文件监视和重新加载`nodemon`，因此您现在应该能够`server.js`在容器运行时在项目目录中进行编辑（只需编辑 hello world 文本），然后刷新浏览器以查看更改。

就是这样！您现在拥有一个 Dockerized Node 应用程序，您可以在其中对计算机进行更改并查看容器内实时发生的更新。

至此，我们已经基本完成了对 Docker 本身的介绍。我们已经完成了第一个“场景”的实现，其中我们使用编码指令来重新创建我们的应用程序运行所需的环境。

我们现在需要解决第二个常见场景：为了正常运行，我们的应用程序依赖于其他服务，例如数据库。从技术上讲，我们可以在 Dockerfile 中添加安装数据库的指令，但这并不能真正模拟我们的应用程序部署的环境。

不能保证我们的 Node 应用程序和数据库会托管在同一台服务器上。实际上，这应该不太可能。不仅如此，我们不希望必须启动 Web 服务器来对数据库进行编辑，反之亦然。有没有一种方法可以仍然使用 Docker，但在多个相互依赖的服务之间创建一个分离？

Yes we can.

## 什么是 Docker-Compose

  
最好的解释是[用他们自己的话](https://docs.docker.com/compose/)：

> Compose 是一个用于定义和运行多容器 Docker 应用程序的工具。使用 Compose，您可以使用 YAML 文件配置应用程序的服务。然后，通过一个单一的命令，您可以根据您的配置创建并启动所有的服务。

这个过程是先使用 Dockerfile 为每个服务定义指令，然后使用 Docker Compose 将所有这些容器一起运行，并促进它们之间的网络通信。

在本教程中，我们将连接我们的 Node 应用程序到一个 PostgreSQL 数据库。在我们能够连接它们之前，当然需要先建立数据库容器。

## 添加数据库

与 Node 类似，Docker Hub 上有一个非常简单易用的[PostgreSQL](https://www.postgresql.org/)镜像。当然，还有 MySQL、Mongo、Redis 等等的镜像。如果您愿意，可以选择您喜欢的镜像替代（不过如果您对 Docker 还不太熟悉，我建议您暂时跟随本教程）。

我们在 Docker Hub 上搜索官方的[postgres](https://hub.docker.com/_/postgres)镜像。我们只需要最基本的配置，所以再次选择在 Alpine 上运行的版本。镜像`postgres:14.1-alpine`。

与我们的 Node 镜像不同，我们不需要复制任何文件或运行任何安装脚本，因此实际上我们不需要为我们的 PostgreSQL 安装创建一个 Dockerfile。虽然我们确实需要一些配置（例如密码和端口），但我们可以在即将创建的`docker-compose.yml`文件中管理这些配置。

所以除了决定使用哪个镜像之外，我们在创建配置文件之前实际上不需要做任何其他事情。

## 连接应用到该数据库

在创建 Docker Compose 配置文件来链接数据库容器之前，我们需要更新我们的应用程序以实际使用它。

我们的目标是创建一个带有一些非常简单数据（比如员工列表）的数据库，用一些示例数据查看它，然后使用我们的 Node 应用程序查询这些数据。

我们还将创建一个简单的前端来显示这些数据。

首先，我们需要安装 PostgreSQL 的 NPM 包：

```shell
npm install pg
```

接下来，我们将创建一个`.sql`文件，该文件将自动用一些示例数据填充我们的数据库，以便读取。在项目的根目录中创建以下文件：

`database-seed.sql`

```sql
CREATE TABLE employees
(
    id SERIAL,
    name text,
    title text,
    CONSTRAINT employees_pkey PRIMARY KEY (id)
);

INSERT INTO employees(name, title) VALUES
 ('Meadow Crystalfreak ', 'Head of Operations'),
 ('Buddy-Ray Perceptor', 'DevRel'),
 ('Prince Flitterbell', 'Marketing Guru');
```

（注意，我从"whimsical"设置的[随机名称生成器](https://www.behindthename.com/random/)中得到了这些"荒谬"的名字）

接下来，我们将更新我们的 Node 服务器来查询这些值。除此之外，我们还将使用`express.static`来提供整个目录，而不仅仅发送 HTML 字符串。这将允许我们同时提供一个 HTML 文件，以及一些 CSS 和 JavaScript，来创建一个完整的前端页面。

我们添加了注释来解释所有新的内容：

`server.js`

```js
// Import the postgres client
const { Client } = require("pg");
const express = require("express");
const app = express();
const port = 8080;

// Connect to our postgres database
// These values like `root` and `postgres` will be
// defined in our `docker-compose-yml` file
const client = new Client({
  password: "root",
  user: "root",
  host: "postgres",
});


// Serves a folder called `public` that we will create
app.use(express.static("public"));

// When a GET request is made to /employees
// Our app will return an array with a list of all
// employees including name and title
// this data is defined in our `database-seed.sql` file
app.get("/employees", async (req, res) => {
  const results = await client
    .query("SELECT * FROM employees")
    .then((payload) => {
      return payload.rows;
    })
    .catch(() => {
      throw new Error("Query failed");
    });
  res.setHeader("Content-Type", "application/json");
  res.status(200);
  res.send(JSON.stringify(results));
});

// Our app must connect to the database before it starts, so
// we wrap this in an IIFE (Google it) so that we can wait
// asynchronously for the database connection to establish before listening
(async () => {
  await client.connect();

  app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`);
  });
})();

const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("foo");
  }, 300);
  reject("oops");
});

myPromise.then(() => {
  console.log("hello");
});
```

在上面的代码更新中，您可以看到我们正在提供一个名为`public`的目录，而我们尚未创建这个目录。该目录将包含一个`index.html`文件，用作我们应用程序的漂亮前端页面。

## 添加前端内容

我们将首先创建`public`由 Node 应用程序提供服务的目录：

```shell
mkdir public
```

然后添加以下文件：

`public/index.html`

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Docker Template</title>
    <script src="script.js"></script>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <template>
      <div class="card">
        <img src="https://res.cloudinary.com/dqse2txyi/image/upload/v1639943067/blogs/docker-node/profile-picture_eav2ff.png" alt="Avatar" width="240px" />
        <div class="container">
          <h4>Placeholder</h4>
          <p>Placeholder</p>
        </div>
      </div>
    </template>
  </body>
</html>
```

我们的`index.html`文件利用员工卡的[HTML 模板。](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template)

`public/styles.css`

```css
body {
  padding: 12px;
  display: flex;
  flex-direction: row;
  column-gap: 24px;
}

.card {
  box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2);
  transition: 0.3s;
  border-radius: 5px;
  transition: 0.3s;
}

.card:hover {
  transform: scale(1.03);
}

.container {
  padding: 0 12px;
}

img {
  border-radius: 5px 5px 0 0;
}
```

上面`styles.css`是一些简单的 CSS，可以使员工卡模板看起来干净，并将它们在页面上排成一行。

`public/script.js`

```js
fetch("/employees")
  .then((response) => response.json())
  .then((data) => {
    data.forEach((employee) => {
      // Select the <template> we created in index.html
      const cardTemplate = document.querySelector('template');

      // Clone a copy of the template we can insert in the DOM as a real visible node
      const card = cardTemplate.content.cloneNode(true);

      // Update the content of the cloned template with the employee data we queried from the backend
      card.querySelector('h4').innerText = employee.name;
      card.querySelector('p').innerText = employee.title;

      // Append the card as a child with the employee data to the <body> element on our page
      document.body.appendChild(card);
    });
  });
```

当我们的应用程序加载时，`script.js`会被加载出来，其使用了浏览器[fetch API](https://developer.mozilla.org/en-US/docs/Web/API/fetch)来查询 node 服务器上的`/employees`路由，并从 PostgreSQL 数据库中获取员工信息。

返回后，它将遍历每个员工并克隆我们定义的 HTML 模板，`index.html`以使用该员工的`name`和制作自定义员工卡`title`。

唷！现在我们已经建立了应用程序并准备好从数据库中读取数据，我们终于准备好使用 Docker Compose 将 Node 容器和 PostgreSQL 容器连接在一起。

## 创建一个 Docker-Compose.yml 文件

有关 compose 的简要介绍，请参见[此处](https://docs.docker.com/compose/)，有关 compose 文件规范的更多详细信息，请参见[此处](https://github.com/compose-spec/compose-spec/blob/master/spec.md)。

我们将创建一个简单的`docker-compose.yml`文件来将我们的 Node 应用程序与我们的 PostgreSQL 数据库链接起来。让我们直接开始并在项目根目录中创建文件。我将使用大量注释来解释一切：

```yaml
version: '3.8'
services:
  # These are the configurations for our Node app
  # When Docker Compose starts this container it will automatically
  # use the Dockerfile in the directory to configure it
  app:
    build: .
    depends_on:
      # Our app does not work without our database
      # so this ensures our database is loaded first
      - postgres
    ports:
      - "8080:8080"
    volumes:
      # Maps our current project directory `.` to
      # our working directory in the container
      - ./:/usr/src/app/

  # This is the configuration for our PostgreSQL database container
  # Note the `postgres` name is important, in out Node app when we refer
  # to  `host: "postgres"` that value is mapped on the network to the 
  # address of this container.
  postgres:
    image: postgres:14.1-alpine
    restart: always
    environment:
      # You can set the value of environment variables
      # in your docker-compose.yml file
      # Our Node app will use these to connect
      # to the database
      - POSTGRES_USER=root
      - POSTGRES_PASSWORD=root
      - POSTGRES_DB=root
    ports:
      # Standard port for PostgreSQL databases
      - "5432:5432"
    volumes:
      # When the PostgreSQL container is started it will run any scripts
      # provided in the `docker-entrypoint-initdb.d` directory, this connects
      # our seed file to that directory so that it gets run
      - ./database-seed.sql:/docker-entrypoint-initdb.d/database-seed.sql
```

现在，有了该`docker-compose.yml`文件，我们终于准备好运行我们新的且经过高度改进的应用程序“套件”，其中包括后端、前端和数据库。

从项目的根目录中，您所要做的就是输入如下命令：

```shell
docker-compose up --build
```

*（请注意，该`--build`标志用于在运行时强制 Docker 重建映像，`docker-compose up`以确保捕获任何新更改。如果您只想重新启动尚未更改的现有容器，则可以忽略它）*

一旦激活，您终于可以对其进行测试了。在我们的`docker-compose.yml`配置中，我们将 post 8080 直接映射到 8080，因此请访问[http://localhost:8080]()查看：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230726102819.png)

有一个可爱的小悬停过渡！恭喜！

如果您使用 Docker 桌面 GUI 应用程序，您将有很多选项可以立即停止所有容器，或单独查看每个容器。如果您使用命令行，则可以使用以下简单命令停止两个容器（从项目根目录运行以获得上下文）：

```shell
docker-compose down
```

现在您已经有了一个完整的 Node.js 应用程序，并且捆绑了自己的 SQL 数据库。现在，您可以将其部署在安装了 Docker 的任何地方，并且您知道它会起作用（和本地一样成功运行），因为您已经定义了它运行所需的确切环境的所有参数。

## 添加 pgAdmin 面板

对于那些使用 PostgreSQL 的人来说，这是一个快速的小福利。将 pgAdmin 面板容器添加到此应用程序设置中非常简单。只需更新您的`docker-compose.yml`配置以包含以下内容：

`docker-compose.yml`

```yaml
version: '3.8'
services:
    app:
        build: .
        depends_on:
            # Our app does not work without our database
            # so this ensures our database is loaded first
            - postgres
        ports:
            - "8080:8080"
        volumes:
            # Maps our current project directory `.` to
            # our working directory in the container
            - ./:/usr/src/app/

    # This is the configuration for our PostgreSQL database container
    # Note the `postgres` name is important, in out Node app when we refer
    # to  `host: "postgres"` that value is mapped on the network to the 
    # address of this container.
    postgres:
        image: postgres:14.1-alpine
        restart: always
        environment:
            # You can set the value of environment variables
            # in your docker-compose.yml file
            # Our Node app will use these to connect
            # to the database
            - POSTGRES_USER=root
            - POSTGRES_PASSWORD=root
            - POSTGRES_DB=root
        ports:
            # Standard port for PostgreSQL databases
            - "5432:5432"
        volumes:
            # When the PostgresSQL container is started it will run any scripts
            # provided in the `docker-entrypoint-initdb.d` directory, this connects
            # our seed file to that directory so that it gets run
            - ./database-seed.sql:/docker-entrypoint-initdb.d/database-seed.sql

    pgadmin-compose:
        image: dpage/pgadmin4
        environment:
            PGADMIN_DEFAULT_EMAIL: "placeholder@example.com"
            PGADMIN_DEFAULT_PASSWORD: "fakepassword123!"
        ports:
            - "16543:80"
        depends_on:
            - postgres
```

请注意底部添加的 pgAdmin 面板配置。

当你`docker-compose up --build`现在运行并转到：

[http://localhost:16543/]()

您将看到 pgAdmin 面板。输入文件中的`PGADMIN_DEFAULT_EMAIL`和凭据以访问它。`PGADMIN_DEFAULT_PASSWORD``docker-compose.yml`

进入后点击`Add New Server`。

用于`General -> Name`选择一个名字。可以是任何你想要的。

选项卡上的`Connection`值必须与`docker-compose.yml`文件匹配：

- Host：`postgres`
- Username：`root`
- Password：`root`

现在您可以从左侧栏导航：

`Servers -> whatever-you-want -> Databases -> root -> Schemas -> public -> Tables -> employees`

右键单击`employees`查询工具：

```sql
SELECT * FROM employees;
```

然后你会看到你的数据：

![](https://oss.justin3go.com/blogs/Pasted%20image%2020230726103831.png)

## 一些有用的 Docker 命令

列出所有容器、映像、卷或网络，例如`docker image ls`.  

```
docker {container}/{image}/{volume}/{network} ls
```

删除容器、映像、卷或网络，其中 ID 是容器/映像/卷或网络的 ID。  

```
docker {container}/{image}/{volume}/{network} rm ID
```

在后台启动一个容器（作为守护进程）：  

```
docker run -d IMAGE_ID
```

查看容器的日志：  

```
docker container logs CONTAINER_ID
```

查看容器信息：  

```
docker container inspect CONTAINER_ID
```

在活动容器内打开 shell，以便您可以在其中运行终端命令。  

```
docker exec -it CONTAINER_ID /bin/sh
```

停止容器：  

```
docker container stop CONTAINER_ID
```

删除所有悬空/未使用的 Docker 数据（缓存层、不再使用的卷等）：  

```
docker system prune
```

您还可以将上述命令与特定类型一起使用，例如`docker container prune`.

## 最后

我希望您了解了为什么 Docker 是您工具箱中一个出色的工具，以及如何使用它来减少与设置开发环境相关的摩擦。值得庆幸的是，与 WAMP、MAMP 和 XAMPP 战斗的日子已经过去了（没有轻视这些应用程序，我知道如果配置正确，它们是很棒的工具）。

请记住，Docker 可以用来在许多不同开发人员的机器上创建基线标准开发环境。但它不仅仅是一个开发工具，Docker 还可以在生产中使用，通过简单地部署更多容器来简化通过增加流量来扩展应用程序的过程。

除了这里介绍的内容之外，还有很多东西需要学习，[Docker 文档](https://docs.docker.com/)是最好的起点。祝您 Docker 之旅一切顺利。