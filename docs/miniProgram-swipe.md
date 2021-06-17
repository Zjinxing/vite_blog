---
title: 微信小程序判断上下左右滑动方向
date: 2018-08-25 10:57:17
tags:
  - 小程序
describe: 最近在看微信小程序开发，发现小程序本身提供的好像没有左滑，右滑，上滑，下滑等事件，但是需要用的时候也可以简单的实现，只需要通过touchstart和touchend配合就可以了。
---

最近在看微信小程序开发，发现小程序本身提供的好像没有左滑，右滑，上滑，下滑等事件，但是需要用的时候也可以简单的实现，只需要通过touchstart和touchend配合就可以了。下面是简单的代码实现

```html
<view class="container" bindtouchstart='swipeStart' bindtouchend='swipeEnd'></view>
```



```js
page({
  swipeStart: function(e) {
    this.data.startX = e.changedTouches[0].pageX
    this.data.startY = e.changedTouches[0].pageY
  }, 
  swipeEnd: function(e) {
    console.log(e)
    this.data.endX = e.changedTouches[0].pageX
    this.data.endY = e.changedTouches[0].pageY

    let dX = this.data.endX - this.data.startX
    let dY = this.data.endY - this.data.startY

    if(Math.abs(dX) > Math.abs(dY)) {
      if(dX > 0) {
        console.log("向右滑动了")
      }else {
        console.log("向左滑动")
      }
    } else {
      if(dY > 0) {
        console.log("向下滑动")
      } else {
        console.log("向上滑动")
      }
    }
  }
})
```



touchstart和touchend事件会接受一个event参数，event内有一个changedTouches数组，里边保存着事件触发时的坐标，通过计算touchend时的坐标和touchstart时的坐标就可以很容易的判断出滑动的方向了