---
title: elementUI el-table表格列排序的两种方法
date: 2018-11-15 21:05:24
tags:
  - vue
  - element-ui
---

第一种sort-method：这个属性接收一个方法作为排序依据，和Array.sort()表现一致。 先看一下纯数字组成的数组的排序：

```javascript
// 如果升序排序则
Array.sort(function(a, b) {
  return a - b
})
// 如果降序排序则
Array.sort(function(a, b) {
  return b - a
})
```

如果是对象组成的数组，需要按照对象的某个key的值进行排序，则可以按照下面的方式来进行

```js
Array.sort(function(obj1, obj2) {
  let val1 = obj1.key
  let val2 = obj2.key
  return val1 - val2
})
```



下面是在实例中的应用 HTML部分

```html
<el-table :data="tableData">
  <el-table-column 
    type="selection"></el-table-column>
  <el-table-column label="项目编号" prop="id"></el-table-column>
  <el-table-column label="项目名称" prop="name"></el-table-column>
  <el-table-column label="到期时间" :sortable="true" :sort-method="sortByDate">

  </el-table-column>
  <el-table-column label="赏金" prop="price"></el-table-column>
  <el-table-column label="操作">

</el-table-column>
</el-table>
```



JS部分

```js
export default {
  data() {
    return {
      tableData: [
        {
          type: '平面设计',
          id: '477760',
          name: 'logo设计',
          price: 10000,
          deadline: 1540260459981,    
          url: 'javascript:;',      
        },{
          type: '整站建设',
          id: '451534',
          name: '信息网站开发',
          price: 10000,
          deadline: 1544260459981,  
          url: 'javascript:;',      
        },{
          type: 'IOS',
          id: '789412',
          name: '信息网站开发',
          price: 10000,
          deadline: 1543260459981,  
          url: 'javascript:;',      
        },{
          type: 'UI设计',
          id: '564325',
          name: '信息网站开发',
          price: 10000,
          deadline: 1541260459981,  
          url: 'javascript:;',      
        },{
          type: 'VI设计',
          id: '458252',
          name: 'VI优化设计',
          price: 10000,
          deadline: 1545260459981,  
          url: 'javascript:;',      
        },{
          type: 'Android',
          id: '456782',
          name: 'Android开发',
          price: 10000,
          deadline: 1544860459981,
          url: 'javascript:;',      
        }
      ]
    }
  },
  filters: {
    deadline(value) {
      let now = new Date().getTime()
      if(value - now < 0) {
        return '已结束'
      } else {
        let date = new Date(value)
        let Y = date.getFullYear()
        let M = date.getMonth() + 1
        let D = date.getDate()
        return `${Y}-${M}-${D}`
      }
    }
  },
  methods: {
    sortByDate(obj1, obj2) {
      let val1 = obj1.deadline
      let val2 = obj2.deadline
      return val1 - val2
    }
  }
}
```



第二种方法为sort-by这个属性是指定数据按照哪个属性进行排序，比如上面的例子中如果要按照时间戳来排序可以直接把:sort-method="sortByDate"换成sort-by="deadline"就能达到同样的效果了，如果使用了sort-by就不能使用sort-method了，否则不会生效。   值得注意的一点是sort-method是属性不是方法，要写成":sort-method='sortfunc'"而不能写成"@sort-method='sortfunc'"，另外两个排序方法都需要将sortable设为true才能生效