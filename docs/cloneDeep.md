---
title: 实现一个深拷贝
date: 2021-07-01
tags:
  - JavaScript
describe: 我们在开发中经常会遇到需要使用深拷贝的场景，简单些的可能就直接用 JSON.parse(JSON.stringify(target)) 来实现，复杂点的可能会使用 lodash 的 cloneDeep，很少会自己去实现一个深拷贝。虽然知道使用递归去实现，但试过之后发现还是有许多需要注意的地方的。
---


## 实现一个深拷贝

> 我们在开发中经常会遇到需要使用深拷贝的场景，简单些的可能就直接用 JSON.parse(JSON.stringify(target)) 来实现，复杂点的可能会使用 lodash 的 cloneDeep，很少会自己去实现一个深拷贝。虽然知道使用递归去实现，但试过之后发现还是有许多需要注意的地方的。

### 借助 JSON 实现

这个很简单，一行代码就能实现：

```js
JSON.parse(JSON.stringify(target))
```

缺点也很明显，会忽略掉 function 和 undefined，正则表达式，Map，Set 等会变成空对象: `{}`，而且对象存在循环引用的时候会报错。但是如果确定要拷贝的目标对象不存在这些类型时用起来还是很方便的。

接下来看看第二种，递归实现

### 递归实现简单版本

由于对象的值还可以是对象，我们不能确定有多少层级，因此很容易想到使用使用递归实现：

```js
function cloneDeep(target) {
  if (typeof target === 'object') {
    const cloneTarget = Array.isArray(target) ? [] : {}
    const keys = Object.keys(target)
    for(let i = 0; i < keys.length; i++) {
      cloneTarget[keys[i]] = cloneDeep(target[keys[i]])
    }
    return cloneTarget
  }
  return target
}
```

以上代码很简单，判断如果目标是对象的话，再判断它是 Object 还是 Array，递归遍历其每一项，将值添加到新对象上，最后返回这个新对象，如果目标不是一个对象就直接返回。我们来试一下：

```js
const obj = { a: 1, b: 2, c: { d: 3, e: [4, { f: 5, : g: 6 }] } }
const cloneObj = cloneDeep(obj)
obj.c.e[1].f = '5'
console.log(cloneObj) // { a: 1, b: 2, c: { d: 3, e: [4, { f: 5, : g: 6 }] } }
```

可以看到，修改了原始 obj 其中的某个 key 的值，并没有影响到拷贝对象的值，说明是成功了的。但是这还是有许多问题的，并没有比 `JSON.parse(JSON.stringify())` 好到哪去，后者解决不了的问题，这个版本的 cloneDeep 同样存在。接下来我们先解决一个循环引用的问题。

### 解决循环引用的版本

我们先来看看用现有的方法拷贝循环引用的对象会发生什么：

```js
const obj = {a: 1, b: 2 }
obj.obj = obj
cloneDeep(obj)
```

控制台直接报错了：`Maximum call stack size exceeded` ，我们的代码陷入死循环了。

![image-20210630202529411](https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/image-20210630202529411.png)

那么该如何解决呢？其实也很简单，我们把拷贝过的值存起来，在拷贝的时候先判断是否已经拷贝过，如果有就直接取出来返回，没有再执行 cloneDeep 不就可以了。用流程图可以大概表示成这样：

<img src="https://cdn.jsdelivr.net/gh/Zjinxing/image-galary@master/blog/image-20210630212259142.png" alt="image-20210630212259142" style="zoom:67%;" />

对于上面的 obj，我们把它展开两层是这个样子的：

```json
{
  a: 1,
  b: 2,
  obj: {
    a: 1,
    b: 2,
    obj: {...}
  }
}
```

对它执行深拷贝那就是这样：obj 为对象 => 没有被拷贝过 => 创建一个空对象 cloneTarget 并保存 (obj -> cloneTarget) => obj.a 和 obj.b 的值添加到 cloneTarget 上 => obj.obj 为对象且已经拷贝过(obj === obj.obj) => 直接取出赋值 => 退出循环。

要使用对象作为key，很容易想到用 map 来实现，于是代码可以改进为这样：

```js
function cloneDeep(target, m = new Map()) {
  if (typeof target === 'object') {
    if (m.has(target)) {
      return m.get(target)
    }
    const cloneTarget = Array.isArray(target) ? [] : {}
    m.set(target, cloneTarget)
    const keys = Object.keys(target)
    for(let i = 0; i < keys.length; i++) {
      cloneTarget[keys[i]] = cloneDeep(target[keys[i]], m)
    }
    return cloneTarget
  }
  return target
}
```

```js
const obj = {a: 1, b: 2 }
obj.obj = obj
cloneDeep(obj)
```

再次尝试循环拷贝，可以看到问题已经解决了。但出仍然还有其他问题，我们知道，在 JavaScript 中，当 `typeof target === 'object'` 时，具体的类型并不仅仅只有 Object 和 Array，比如正则表达式、Map、Set等，这样的话我们上面的方法就会返回空对象，因此要进行更为详细的类型判断。

### 加入其它类型对象的改进版

我们先写出来一个获取类型的方法：

```js
const getType = target => Object.prototype.toString.call(target).slice(8, -1)
```

我们调用这个 getType 方法的时候，可能有以下的返回值：

```js
"Number", "String", "Boolean", "Undefined", "Null", "Symbol", "BigInt", "Object", "Array", "RegExp", "Map", "Set", "Function"
```

接下来我们对其它类型的 Object 进行处理

#### 正则表达式的处理

对于正则表达式，我们可以通过 RegExp.prototype.source 拿到正则文本，RegExp.prototype.flags 拿到标志参数，有了这两项就可以拷贝这个正则了：

```js
  const { source, flags } = reg
  cloneTarget = new RegExp(source, flags)
```

#### Map 和 Set 的处理

对于 Map 我们只要新建一个 Map 对其递归处理就可以了

```js
const cloneTarget = new Map()
target.forEach((value, key) => {
  cloneTarget.add(key, cloneDeep(value, m))
})
```

对于 Set：

```js
const cloneTarget = new Set()
target.forEach(value => {
  cloneTarget.add(cloneDeep(value, m))
})
```

#### Function 类型的处理

对于 Function 类型的处理，我们可以调用 toString 方法将函数转为字符串，在利用 eval 来得到拷贝的函数，处理如下：

```js
const funcString = target.toString()
const cloneTarget = eval(`(() => ${funcString})()`)
cloneTarget.prototype = target.prototype // 原型指向原函数的原型
```

加入以上几种类型的处理之后，我们的最终版本如下：

```js
const getType = target => Object.prototype.toString.call(target).slice(8, -1)

function cloneDeep(target, m = new Map()) {
  const targetType = getType(target)
  let cloneTarget
  switch (targetType) {
    case 'Number':
    case 'String':
    case 'Boolean':
    case 'Undefined':
    case 'Null':
    case 'Symbol':
    case 'BigInt':
      return target
    case 'Object':
    case 'Array':
      // 这里通过构造函数合并了对象和数组的情况
      cloneTarget = new target.constructor()
      break
    case 'RegExp':
      const { source, flags } = target
      cloneTarget = new RegExp(source, flags)
      break
    case 'Map':
      cloneTarget = new Map()
      target.forEach((value, key) => {
        cloneTarget.set(key, cloneDeep(value, m))
      })
      break
    case 'Set':
      cloneTarget = new Set()
      target.forEach(value => {
        cloneTarget.add(cloneDeep(value, m))
      })
      break;
    case 'Function':
      const funcString = target.toString()
      cloneTarget = eval(`(() => ${funcString})()`)
      cloneTarget.prototype = target.prototype // 原型指向原函数的原型
      break
    default:
      return target
  }
  if (cloneTarget) {
    if (m.has(target)) {
      return m.get(target)
    }
    m.set(target, cloneTarget)
    const keys = Object.keys(target)
    for(let i = 0; i < keys.length; i++) {
      cloneTarget[keys[i]] = cloneDeep(target[keys[i]], m)
    }
    return cloneTarget
  }
}
```

### 最后

到这里我们已经实现了一个深拷贝的函数了，其中解决了循环引用，函数拷贝，以及 Map 、Set 、正则表达式等多种类型的拷贝。

如果有什么错误，欢迎指出。