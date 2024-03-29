## 基于 vitepress 搭建的极简博客

*未完*
在线预览地址：https://blog.zhaojinxing.com

已完成

- [x] 文章列表渲染
- [x] 文章详情
- [x] 深色模式适配
- [x] 按标签分类
- [x] 按时间轴归档

待完成
- [ ] 文章列表分页
- [ ] 美化
- [ ] 暂时这些，想到什么再说

### Why

博客虽然不怎么写，但是写博客的东西却没少折腾。WordPress，HEXO 都瞎搞过，虽然可以选择的主题有很多，但总感觉并不是自己想要的。
后来发现了 vitepress，是基于 vite + vue3 的，内容可以很方便的进行定制。另一点 vue3 的稳定版也出来好久了，但实际开发项目中没机会用到，刚好在这里也可以折腾一下 vue3。

### How

直接按照官网的 [Get Start](https://vitepress.vuejs.org/guide/getting-started.html) 初始化项目。初始化后项目目录如下：
```
├── docs
|  ├── index.md
|  └── .vitepress
|     └── config.js
├── package.json
└── yarn.lock
```
然后在 `package.json` 中加入以下代码：
```json
"scripts": {
    "dev": "vitepress dev docs",
    "build": "vitepress build docs",
    "serve": "vitepress serve docs"
  }
```

运行 `yarn dev` 便可以启动项目了，但是默认配置作为一个博客网站肯定是不行的，最起码的导航、文章列表、归档、分类等功能还是要有的。在 `docs` 目录下新建两个文件夹： tags、archives，并分别在`docs/.vitepress/config.js` 配置如下：

```js
const getPages = require('./utils/pages')

const getConfig = async () => {
  let config = {
    lang: 'zh-CN',
    title: 'hello vitepress',
    description: '这里是描述',
    themeConfig: {
      pages: await getPages(),
      nav: [
        { text: '首页', link: '/' },
        { text: '归档', link: '/archives/' },
        { text: '分类', link: '/tags/' },
      ],
    },
  }
  return config
}

module.exports = getConfig()
```

这里的配置可以通过 vitepress 内置的 `useSiteData` 拿到，其中 `getPages` 函数是用来获取 `markdown` 文件的，实现如下：
```js
const fs = require('mz/fs')
const globby = require('globby')
const matter = require('gray-matter')

function rTime(date) {
  // new Date(undefined).toJSON() returns null
  const json_date = new Date(date || null).toJSON()
  return json_date.split('T')[0]
}

var compareDate = function (obj1, obj2) {
  return obj1.frontMatter.date < obj2.frontMatter.date ? 1 : -1
}

module.exports = async () => {
  // 不包含 README 文件
  const paths = await globby(['**.md', '!**/README.md'], {
    ignore: ['node_modules'],
  })
  let pages = await Promise.all(
    paths.map(async (item) => {
      const content = await fs.readFile(item, 'utf-8')
      const { data } = matter(content)
      data.date = rTime(data.date)
      return {
        frontMatter: data,
        regularPath: `${item.replace('.md', '.html').slice(4)}`,
        relativePath: item,
      }
    })
  )
  // 过滤掉 page 为 true 的 Markdown
  pages = pages.filter((item) => !item.frontMatter.page)

  pages.sort(compareDate)
  return pages
}
```

### 自定义布局

在 docs/.vitepress 目录下新建 theme 文件夹，在 theme 目录下新建入口文件 `index.js` 和布局组件 `Layout.vue`。index.js 内容如下：
```js
import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import Tags from './components/Tags.vue'
import Home from './components/Home.vue'
import Archives from './components/Archives.vue'
import './style/index.styl'

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app, route, siteData }) {
    app.component('Tags', Tags)
    app.component('Home', Home)
    app.component('Archives', Archives)
  },
}

```
其中 DefaultTheme 是 vitepress 内置的默认主题，我们在其之上进行扩展，Tags 为标签页组件，Archives 为归档组件，Home 为主页内容。这三个组件全局注册，接下来就可以在 markdown 文件中直接使用。比如在 `docs/index.md` 中：
```
---
page: true
home: true
date: 2021-01-03
title: 首页
describe: 首页
---

<Home />
```
这样 Home 组件的内容就会被渲染到首页中。Layout 为首页布局的组件，这里我直接使用默认的 Layout 结合其插槽进行了布局，如果想要更多的个性化定制，可以完全按照自己想要的样子来写，我的 Layout 内容如下：
```vue
<script setup>
import DefaultTheme from 'vitepress/theme'
import HomeHeader from './components/HomeHeader.vue'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero>
      <home-header />
    </template>
    <Content />
  </Layout>
</template>
```
其中 `<Content />` 组件是 vitepress 内置的组件，它将会渲染 `docs/index.md` 中的内容，`HomeHeader` 是首页自定义的头部内容，但是由于 vitepress 已经有了默认的 header，而且没有提供自定义的插槽，因此需要给默认的 header 加一个额外的样式 `display: none` 把它干掉，这样就可以自定义 header 了，在全局加上以下样式就可以了：
```stylus
.home
  header.home-hero:first-child
    display: none
```

这样就基本上完成了一个可以自定义首页，有标签页，有归档页的简单博客网站了。
