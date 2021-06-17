---
title: 给你的 web 应用添加推送功能
date: 2019-07-23 21:53:20
tags:
  - JavaScript
  - 浏览器
describe: 通过 service-worker 实现网站的离线推送
---

### 给你的 web 应用添加推送功能

*如果你经常浏览 Facebook 或者 YouTube 等网站，你可能会发现，有时候并没有打开网站，却收到了网站的推送，像下面这样：*

![屏幕快照 2019-07-21 10.20.27.png](https://i.loli.net/2019/07/22/5d34ffdb157bb79694.png)

**屏幕快照 2019-07-21 10.20.27.png**



这是如何做到的呢？这其实是利用了 service worker 和 浏览器的 Notification 功能，但为什么国内的网站几乎很少见到呢？因为推送是通过浏览器厂商下发的，chrome 浏览器占据着市场的大部分份额，而得益于我们强大的 GFW，在国内添加这个功能就显得吃力不讨好了。不过在 Firefox 和 EDGE 浏览器上还是可以的，尤其是 EDGE 浏览器，win10 下即使浏览器关闭了也能收到推送(微软亲儿子的原因？)。

#### 1. Service Worker

那什么是 service worker 呢？MDN 上的介绍为：*Service workers 本质上充当 Web 应用程序与浏览器之间的代理服务器，也可以在网络可用时作为浏览器和网络间的代理。它们旨在（除其他之外）使得能够创建有效的离线体验，拦截网络请求并基于网络是否可用以及更新的资源是否驻留在服务器上来采取适当的动作。他们还允许访问推送通知和后台同步 API。* 我们这里主要用到的就是 service worker 的推送通知功能。

#### 2. 发送通知的过程

大致流程如下



![屏幕快照 2019-07-22 21.53.20.png](https://i.loli.net/2019/07/22/5d35bfe56904257934.png)

**屏幕快照 2019-07-22 21.53.20.png**



##### 2.1.注册 service worker

通过 npm 包 register-service-worker 来注册 service worker，当然你也可以自己写。以在 vue 中使用为例：

在 src 目录下新建文件 registerServiceWorker.js

在 public 目录下新建文件 `sw.js`

```javascript
import { register } from 'register-service-worker'
register(`${process.env.BASE_URL}sw.js`, {
  async ready(registration) {
    console.log('Service worker is active.')
    const userSubscription = await registration.pushManager.getSubscription()
    if (userSubscription !== null) {
      console.log('用户已订阅')
    } else {
      // 发起订阅
    }
  }
})
```

这样便完成了 service worker 的注册，但现在我们的 service worker 还是空的，因为 sw.js 里还没有任何东西

##### 2.2 发起订阅

发起订阅首先需要一对秘钥，私钥存在服务端，公钥发给客户端，用来生成 subscription，本例中我们通过 web-push 库来生成公私密钥对

```js
// 发起订阅，首先请求本地启动的node服务，取得publicKey
const result = await fetch('http://localhost:3333/api/appKey')
const { publicKey } = await result.json()
```

获取的`publicKey`为 base64 编码，不能直接使用，需要将其转为 Uint8Array，通过以下函数将其转为 Uint8Array:

```js
function urlBase64ToUint8Array(base64String) {
  var padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  var base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  var rawData = window.atob(base64)
  var outputArray = new Uint8Array(rawData.length)
  for (var i = 0, max = rawData.length; i < max; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}
```

接下来调用 subscribe 方法来生成 subscription：

```js
const subscription = await registration.pushManager.subscribe({
  userVisibleOnly: true,
  applicationServerKey: urlBase64ToUint8Array(publicKey)
})
// 将订阅信息发送到服务器存储
fetch('http://localhost:3333/api/subscribe', {
  method: 'POST',
  body: JSON.stringify(subscription),
  headers: new Headers({
    'Content-Type': 'application/json'
  })
})
  .then(res => {
    console.log(res.json())
  })
  .catch(err => console.log(err))
```

然后再 main.js 里引入 registerServiceWorker.js。至此，我们已经订阅完成，并将订阅信息发送到服务器了，在 chrome 的调试工具中打开 application，选择 service worker 已经可以看到我们注册的 service worker 了, firefox 浏览器通过在地址栏输入 about:serviceworkers 来查看



![屏幕快照 2019-07-22 23.33.05.png](https://i.loli.net/2019/07/22/5d35d73d3cc5c95634.png)

**屏幕快照 2019-07-22 23.33.05.png**



##### 2.3 sw.js 监听 push

接下来我们要在注册的 sw.js 中监听 push 事件，通过 sw.js 来显示系统通知

```js
// sw.js
// 监听推送事件
self.addEventListener('push', event => {
  console.log('service worker 收到推送信息')
  console.log(`推送内容为："${event.data.text()}"`)
  const title = 'PUSH TEST'
  const options = {
    body: '收到一条通知'
  }
  event.waitUntil(self.registration.showNotification(title, options))
})
// 监听通知点击事件
self.addEventListener('notificationclick', event => {
  console.log('点击了通知')
  event.notification.close()
  event.waitUntil(clients.openWindow('http://www.baidu.com'))
})
```

现在我们就可以通过 Chrome 调试工具来测试推送了，点击 push 就能收到一条推送了



![屏幕快照 2019-07-22 23.43.44.png](https://i.loli.net/2019/07/22/5d35d9ff3f3d753008.png)

**屏幕快照 2019-07-22 23.43.44.png**



#### 3. 服务端代码

以下是简单的 nodejs 服务端代码，在本地运行后就可以通过 postman 掉接口的形式来测试推送。经测试，Firefox 和 EDGE 能收到 postman 调接口发起的推送，Chrome 浏览器直接就超时了。

app.js

```js
// app.js
const Koa = require('koa')
const cors = require('koa2-cors')
const koaBody = require('koa-body')

const app = new Koa()
const router = require('./router')

app.use(cors())

app.use(koaBody())

app.use(router.pushRouter.routes())

app.listen(3333)
```

router.js

```js
const webpush = require('web-push')
const Router = require('koa-router')
const { insert, query } = require('../lib/query')

const pushRouter = new Router({
  prefix: '/api'
})

pushRouter.get('/appkey', async (ctx, next) => {
  // 使用 webpush 生成密钥对，并保存到数据库
  const vapidKeys = webpush.generateVAPIDKeys()
  const sql = 'insert into `keys` (publicKey,privateKey) VALUES(?,?)'
  try {
    const addParams = [vapidKeys.publicKey, vapidKeys.privateKey]
    await insert(sql, addParams)
  } catch (err) {
    console.log(err)
  }
  ctx.body = {
    publicKey: vapidKeys.publicKey
  }
  console.log('appKey')
})

pushRouter.post('/subscribe', async (ctx, next) => {
  const data = ctx.request.body
  const { subscription, publicKey } = data
  const queryId = 'select id from `keys` where publicKey=' + `'${publicKey}'`
  const [result] = await query(queryId)
  const { id } = result
  const sql =
    'INSERT INTO `subscription` (id,publicKey,`subscription`) VALUES(?,?,?)'
  const addParams = [id, `${publicKey}`, subscription]
  try {
    await insert(sql, addParams)
    ctx.body = {}
  } catch (err) {
    console.log(err)
    ctx.body = err
  }
})

pushRouter.get('/send', async (ctx, next) => {
  const querySql = 'SELECT * FROM subscription'
  const result = await query(querySql)
  // 取出数据库中存的所有subscription，进行push推送
  for (let item of result) {
    const { publicKey, subscription } = item
    const { privateKey } = (await query(
      'SELECT privateKey FROM `keys` WHERE publicKey=' + `'${publicKey}'`
    ))[0]
    console.log(publicKey, privateKey, subscription)
    webpush.setVapidDetails('mailto:urlOrEmailaddress', publicKey, privateKey)

    webpush
      .sendNotification(JSON.parse(subscription), 'test')
      .then(result => {
        console.log(result)
      })
      .catch(err => {
        console.log(err)
      })
  }
})

module.exports = {
  pushRouter
}
```

数据库查询与插入

```js
const mysql = require('mysql')

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '123456',
  database: 'test'
})

connection.connect()

const insert = (sql, addParams) => {
  return new Promise((resolve, reject) => {
    connection.query(sql, addParams, (err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

const query = sql => {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        reject(err)
      }
      resolve(result)
    })
  })
}

module.exports = {
  insert,
  query
}
```