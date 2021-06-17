---
title: IntersectionObserver 之无限滚动
date: 2019-12-11 22:44:08
tags:
  - JavaScript
describe: 最近的一个开发需求中需要实现一个双向的无限滚动，即列表加载后列表顶部不是第一条数据，而是中间的某一条数据，向上滚动到顶部时，加载之前的数据，向下滚动到底部时，加载之后的数据。首先想到的是使用 `vue-infinite-loading` 组件，因为之前实现单向的无限滚动已经在项目中使用过，试过之后结果发现并不能满足双向无限滚动，于是便自己动手实现了。首先想到的是通过监听 `scroll` 事件实现，后来发现一个非常适合用于无限滚动的 API： `IntersectionObserver` ，于是改用 `IntersectionObserver` 来实现了。
---

*最近的一个开发需求中需要实现一个双向的无限滚动，即列表加载后列表顶部不是第一条数据，而是中间的某一条数据，向上滚动到顶部时，加载之前的数据，向下滚动到底部时，加载之后的数据。首先想到的是使用 `vue-infinite-loading` 组件，因为之前实现单向的无限滚动已经在项目中使用过，试过之后结果发现并不能满足双向无限滚动，于是便自己动手实现了。首先想到的是通过监听 `scroll` 事件实现，后来发现一个非常适合用于无限滚动的 API： `IntersectionObserver` ，于是改用 `IntersectionObserver` 来实现了。*

#### 语法

使用方法非常简单：

```js
const observer = new IntersectionObserver(callback, options)
```

`IntersectionObserver` 为浏览器原生的一个构造函数(IE: 为啥我没有？)。接收两个参数，`callback` 回调函数和 `options` 配置选项，其中第二个参数 `options` 为可选参数。

`callback` 回调函数有两个参数：

- `entries`

  一个 `IntersectionObserverEntry` 对象的数组

- observer

  被调用的 `IntersectionObserver` 实例

`options` 有三个可配置选项：

- `root`

  被监听元素的父元素或祖先元素，被监听元素与其交叉达到阈值时将会触发回调函数，默认为 `document`

- `rootMargin`

  计算交叉值时添加至根边界的一组偏移量，类型为字符串类型，默认为 “0px 0px 0px 0px”，语法和CSS 中的 margin 基本一致。

- `threshold`

  规定监听目标元素与 `root` 元素交叉的比例值，可以是一个 0 到1.0 之间的一个具体数值，也可以是一组 0 到 1.0 之间的数值组成的数组，默认为 0.0

#### 方法

```js
// 开始观察
observer.observe(element)
// 停止观察
observer.unobserve(element)
// 关闭观察器
observer.disconnect()
```

#### 实现双向无限滚动

通过在列表顶部和底部各添加一个 `li` 元素，当向上滚动，顶部的 `li` 元素出现时，则从列表顶部插入一定量的数据，当向下滚动至底部的 `li` 元素出现时，则从列表底部插入一定量的数据。从顶部插入数据的时候有一点需要处理的是：插入数据后，列表直接就到了顶部，因此需要多一步操作，通过 `scrollTop` 将列表的位置设为触发加载时的位置，代码如下：

```vue
<template>
    <ul ref="container">
        <li class="top"></li>
        <li v-for="item in list">{{ item }}</li>
        <li class="bottom"></li>
    </ul>
</template>

<script>
    export default {
        data() {
            return {
                list: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5],
                observer: null
            }
        },
        mounted() {
            const root = this.$refs.container
            const observer = new IntersectionObserver(this.loadMore, {
              root,
              threshold: 0
            });
            this.$refs.container.scrollTop = 200;
            observer.observe(document.querySelector(".top")); // 观察顶部的元素
            observer.observe(document.querySelector(".bottom")); // 观察底部的元素
            this.observer = observer;
        },
        beforeDestroy() {
            this.observer.disconnect();
            this.observer = null;
        },
        methods: {
            loadMore(entries, observer) {
            const [entry] = entries;
            const { target } = entry;

            if (target.className.includes("top")) {
                const elHeight = this.$refs.container.scrollHeight;
                console.log(elHeight);
                const arr0 = this.list[0];
                this.list.unshift(arr0 - 5, arr0 - 4, arr0 - 3, arr0 - 2, arr0 - 1);
                this.$nextTick(() => {
                    const newEl = this.$refs.container;
                    console.log(newEl.scrollHeight);
                      this.$refs.container.scrollTop = newEl.scrollHeight - elHeight;
                });
              }
            if (target.className.includes("bottom")) {
                const arrLast = this.list[this.list.length - 1];
                this.list.push(
                  arrLast + 1,
                  arrLast + 2,
                  arrLast + 3,
                  arrLast + 4,
                  arrLast + 5
                );
              }
            }
        }
    }
</script>
```

相对于监听 `scroll` 事件，使用 `IntersectionObserver` 不会频繁触发回调，因此不用担心性能问题，也不用去写节流函数。除了用于无限滚动，`IntersectionObserver` 还可用于图片的懒加载，动画的触发等场景

*在线体验demo：https://codesandbox.io/s/infinite-scroll-6y6w3*