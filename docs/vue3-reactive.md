---
title: 50+行代码模拟实现 vue3 reactive 响应式
date: 2021-06-06 20:43
tags:
  - vue
  - JavaScript
describe: vue3 已经出来很长时间了，相信大家都知道它是使用 `Proxy` 来实现的响应式，相关的源码在 `packages/reactivity` 目录下。作为一个技术栈以vue为主的开发者，了解相关源码还是有必要的。
---

## 50+行代码模拟实现 vue3 reactive 响应式

> vue3 已经出来很长时间了，相信大家都知道它是使用 `Proxy` 来实现的响应式，相关的源码在 `packages/reactivity` 目录下。作为一个技术栈以vue为主的开发者，了解相关源码还是有必要的。

先直接上代码：

```js
const targetMap = new WeakMap()
let activeEffect
const handlers = {
  get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver)
    track(target, key)
    return res
  },
  set(target, key, value) {
    const result = Reflect.set(target, key, value)
    trigger(target, key)
    return result
  },
}
function reactive(target) {
  if (!(typeof target === 'object' && target !== null)) {
    return target
  }
  return new Proxy(target, handlers)
}
function track(target, key) {
  if (!activeEffect) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if (!dep.has(activeEffect)) {
    dep.add(activeEffect)
  }
}
function trigger(target, key) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  const effects = depsMap.get(key) || new Set()
  effects.forEach((effect) => effect())
}
function effect(fn) {
  const effect = () => {
    try {
      activeEffect = effect
      return fn()
    } finally {
      activeEffect = null
    }
  }
  return effect()
}
```

以上代码就是按照vue3的响应式思想来实现了一个简单的响应式设计，那什么是响应式呢？这里放一张vue官方文档的截图，vue 给我们展示了一个 Excel 表格自动求和的例子。那么在 JavaScript 中就可以看做是改变了某个值就自动触发某个操作，在 vue 中就是改变了响应式的值，就自动触发相关组件的重新渲染。

<img src="https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/%E6%88%AA%E5%B1%8F2021-06-06%20%E4%B8%8B%E5%8D%884.12.25.png" alt="截屏2021-06-06 下午4.12.25" style="zoom: 50%;" />

那么上面的代码有没有实现响应式呢，我们来试一下：

```js
const o = reactive({ a: 1, b: 2, c: 3 })
effect(() => {
  console.log('o.a + o.b 的值为：', o.a + o.b)
})
```

以上代码执行结果如下：

![image-20210606163733103](https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/image-20210606163733103.png)

我们依次改变 `o.a,o.b,o.c` 的值看看会发生什么：

![image-20210606164221733](https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/image-20210606164221733.png)

我们看到，在改变 o.a 和 o.b 的值得时候，执行了 effect 函数，而在改变 o.c 的时候并没有执行，这是因为在 effect 的副作用函数中读取了 o.a 和 o.b 的值，而没有读取  o.c 的值，只有触发了 get 才会进行依赖收集，从而在值改变的时候执行相应的副作用函数。而在vue中也有同样的 effect 函数，在 `packages/runtime-core/src/renderer.ts` 中有一个 `setupRenderEffect` 函数，在这里调用了 effect 函数，因此当经过 reactive 包装过的对象有值改变的时候，就会触发组件的重新渲染。

```js
effect(function componentEffect() { /* ... */ })
```



以上只是模仿 vue 实现了一下响应式，如果你想了解 vue3 的响应式原理而看源码又觉得吃力，可以先看看这个简化版的，了解一下大致流程在看源码，可能会有点帮助。

实际上 vue 的 reactive 要比这复杂很多，比如有 effectStack 副作用函数执行栈用来保存不同函数执行时的 activeEffect，因为在实际开发中必然会出现组件嵌套的情况，因此也就会出现 effect(fn), fn 中有调用 effect 的情况，这样可以保证不同组件的 componentEffect 不会乱套；还有用于判断是否该进行依赖收集的变量 shouldTrack，以及 schedule 调度器等等。简单来说就是组件渲染时访问数据，进行依赖收集，当相关值改变时，派发通知，执行相应的副作用渲染函数，进而重新渲染相关组件。更详细的分析已经有很多大佬写过了，在这儿就不啰嗦了(主要是因为懒)。





