---
title: Git 多账户配置
date: 2021-10-08 22:48:50
tags:
  - git
describe: 对于我们开发人员来说已经是必不可少的工具了，几乎每一个开发者都在GitHub上有一个账号，但是工作的时候一般都是内网的 Gitlab，这就不可避免的需要在不同的账号之前切换，每次都 git config 的话会很麻烦，如果你不知道怎么一劳永逸的解决账号切换的问题，那就往下看看吧。
---

## Git 多账户配置

> Git 对于我们开发人员来说已经是必不可少的工具了，几乎每一个开发者都在GitHub上有一个账号，但是工作的时候一般都是内网的 Gitlab，这就不可避免的需要在不同的账号之前切换，每次都 git config 的话会很麻烦，如果你不知道怎么一劳永逸的解决账号切换的问题，那就往下看看吧。

### 方案一：单个仓库配置

我们在配置 git 的时候，如果加上 `--global` 参数，说明是全局配置，相应的配置会体现在 ~/.gitconfig 文件的变动上，如果不加则是对单个项目的配置。比如在某个仓库下执行：

```sh
git config user.name USER
git config user.email EMAIL
```

这样则会为当前仓库配置一个不同于全局配置的用户，虽然这样可以切换账号，但是只对当前仓库生效，每次从远端克隆一个仓库都要根据不同情况判断是不是需要更改用户，很不方便。

### 方案二：根据工作区配置

从 git 2.13.0 开始，git 的配置文件开始支持 conditional includes 的配置，我们可以用这一点实现不同目录不同配置。

首先在用户目录下创建两个文件，分别对应个人配置和工作配置

```sh
touch ~/.gitconfig-work ~/.gitconfig-personal
```

<img src="https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/%E6%88%AA%E5%B1%8F2021-09-27%20%E4%B8%8B%E5%8D%8811.45.49.png" alt="截屏2021-09-27 下午11.45.49" style="zoom: 67%;" />

然后在编辑 `.gitconfig` 文件，在其中加入以下配置：

```bash
[includeIf "gitdir:/path/to/work/directory/"]
  path = ~/.gitconfig-work
[includeIf "gitdir:/path/to/personal/directory"]
  path = ~/.gitconfig-personal
```

然后我们在 work 目录下初始化一个仓库，然后进入这个仓库，在终端输入以下命令查看配置是否成功：

```bash
git config --show-origin --get user.name
```

![image-20211008215553896](https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/image-20211008215553896.png)

可以看到我们的配置是来自 `.gitconfig-work`  文件的，说明配置已经生效了，以后工作相关的项目就放到 work 目录下，个人的项目放到 personal 目录下，就不用对每个仓库进行单独配置了，这是不是就方便多了。

