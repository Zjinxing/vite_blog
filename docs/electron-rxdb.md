---
title: electron 中引入 RxDB 本地数据库总结
date: 2019-11-10 21:39:23
tags:
  - rxdb
  - electron
describe: RxDB 是一个NoSQL的js数据库，可以为网页应用、electron应用、nodejs应用等添加本地数据库，近期开发在electron中用到了本地缓存，使用了这个数据库，这里总结一下。
---

RxDB 是一个NoSQL的js数据库，可以为网页应用、electron应用、nodejs应用等添加本地数据库，近期开发在electron中用到了本地缓存，使用了这个数据库，这里总结一下。

RxDB 文档地址： https://rxdb.info/

RxDB 仓库地址： https://github.com/pubkey/rxdb

### 安装和引用

```sh
npm i rxdb --save
```

或者使用 `yarn`

```sh
yarn add rxdb
```

如果没有安装过 `rxjs`, `rxjs` 也需要安装

```sh
npm i rxjs --save
```

或者

```sh
yarn add rxjs
```

在项目中使用

```js
// ES6
import RxDB from 'rxdb'

// CommonJS
const RxDB = require('rxdb')
```

### 数据库的创建

```js
const db = RxDB.create({
    name: 'databasename', // 数据库名称，必须
    adapter: 'adapter', // 适配器，必须
    password: 'password', // 密码，可选
    multiInstance: true,  // 可选，默认true
    queryChangeDetection: false, // 可选，默认false
})
```

`name` 是数据库名称，是一个唯一标识的字符串，`adapter` 根据使用环境选择相应的适配器，在electron中使用时，数据默认是存储在项目的根目录中的，项目打包后如果安装在了C盘可能会遇到没有权限写入数据的问题，如果想要改变数据的存储位置可以使用 `绝对路径 + name` 作为数据库的名称，数据会存储在相应的目录下，在 `electron` 中，我们可以使用 `getPath` 方法获取路径：

```js
const { app } = require('electron')
const dataPath = app.getPath('userData') // 可以获取程序的数据路径
```

打包后的程序安装后会在C盘目录 `users/username/AppData/Roaming/` 下生成一个应用程序的数据文件夹，通过 `app.getPath('userData')` 获取到的路径既是此路径，在此路径下我们的数据可以正常写入和修改。

### RxSchema

Schema 是用来定义你的数据结构的，可以在schema中指定哪一个字段作为主键，哪些字段作为索引，以及每个字段的类型，支持的类型有: `string, number, boolean, array, integer, object`, array 可以指定里边每一项的结构，object 可以指定每一个 key 的类型。定义如下一个 Schema，主键为 `id`, `name` 和 `age` 是必须项。需要注意的是主键不能以下滑线开头，否则会报错。

```js
const schema = {
  title: 'schema title',
  version: 0,
  description: 'a rxdb schema',
  type: 'object',
  properties: {
    id: {
      type: 'string',
      primary: 'string'
    },
    name: {
      type: 'string'
    },
    age: {
      type: 'number',
      min: 0,
      max: 120,
      index: true
    },
    skills: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          skillName: 'string'
        }
      }
    }
  },
  required: ['name', 'age']
};
```

### RxCollection

结构相同的数据存储在一起构成 `collection`, `collection` 中的每一项称为一个 `document`，RxDB 创建 `collection` 的方法如下：

```js
await rxdatabase.collection({
  name: 'collection1',
  schema: schema // schema 为上面的schema
})
```

要访问 `collection` 可以通过 `rxdatabase.collectionName` 来获取相应的 `collection`, 比如访问上面创建的 `collection` :

```js
const collection1 = rxdatabase.collection1
```

向 `collection` 中插入数据有四种方法，分别是: `insert(), bulkInsert(), upsert() atomicUpsert()` ，`insert` 方法向 `collection` 中插入一条数据，如果已经存在主键相同的数据，则会抛出一个错误，`bulkInert` 用于批量插入数据，当有很多数据时应使用此方法插入。官网文档介绍说此方法比多次调用 `insert` 要快上很多。`upsert` 方法插入数据时会检测有没有主键相同的数据，如果没有就直接插入一条新数据，如果已经存在主键相同的数据，则会覆盖掉原来的数据。`autoUpsert` 用于在很短的时间内对同一条数据多次覆盖写入。如果对同一主键的数据很短时间内进行了 `upsert` 操作，则可能会抛出一个 `409 Conflict` 的错误，这是因为进行 `upsert` 操作时上一个 `upsert` 操作还未结束。

### RxDB 数据查询

使用 `collection.find()` 可以构造处一个 `RxDBQuery` 。RxDB 使用 [mango-query-syntax](https://github.com/cloudant/mango) 查询语法，同时也支持链式查询。有以下查询操作：

- lt: 小于
- lte: 小于等于
- eq: 等于
- ne: 不等于
- gt: 大于
- gte: 大于等于
- in: 数组, 对应字段的值必须是其中之一
- nin: 数组，对应字段的值不能是数组中的任何一个
- and: 组合查询，必须满足其中的每一个条件
- or: 组合查询，满足其中之一的条件即可
- exists: 查询存在某个字段或不存在某个字段的数据
- sort: 排序查询，根据某个字段进行排序，"desc" 为降序，"asc" 为升序
- regex: 根据正则表达式查询结果

其中有一个坑是正则查询的时候，查询汉字表达式查不出任何结果，可能是一个bug，要查询汉字只能写成字符串形式，如下：

```js
const reg1 = /小明/
const reg2 = '小明'
const reg3 = /xiaoming/
const query1 = collection1.find().where('name').regex(reg1) // 查询不到任何结果！
const query1 = collection1.find().where('name').regex(reg2) // 结果为name包含 '小明' 的数据
const query1 = collection1.find().where('name').regex(reg3) // 结果为name包含 'xiaoming' 的数据
```

查询后执行 `exec()` 方法返回一个查询结果的 `Promise` :

```js
const query = collection.find()
const results = await query.exec()
console.log(results) // [RxDocument, RxDocument, RxDocument, ...]
```

`collection.findOne` 方法也是一种查询方法，与 `find` 不同的是 `findOne` 返回值不是一个数组，是一个 `document` .

### 对查询结果的操作

查询之后可对结果进行删除和修改等操作：

> 删除查询到的结果

```js
const query = collection1.find().where('age').lt(18)
await query.remove()
```

> 修改查询结果

```js
const query = collection1.find().where('age').lt(18)
await query.update({
  $inc: {
    age: 1 // 所有查询到的结果 age + 1
  }
})
// 或者修改值
await query.update({
  $set: {
    age: 18 // 将所有查询到的结果 age 改为 18
  }
})
```

*更多详情参见官网文档 https://rxdb.info/*