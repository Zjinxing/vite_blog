---
title: 使用 js 裁剪 png 图片的透明边框
date: 2022-05-29 19:15:50
tags:
  - JavaScript
describe: 最近开发中遇到一个图片裁剪的需求，具体就是对 png 格式的图片进行处理，如果图片四周有透明部分，则对图片进行裁剪，仅保留有内容的矩形区域。查阅相关资料后使用 canvas 实现了该功能。
---

## 使用 js 裁剪 png 图片的透明边框

> 最近开发中遇到一个图片裁剪的需求，具体就是对 png 格式的图片进行处理，如果图片四周有透明部分，则对图片进行裁剪，仅保留有内容的矩形区域。查阅相关资料后使用 canvas 实现了该功能。



首先我们知道图片是由一个个的像素点组成的，要想裁剪周围的透明边框，我们需要找到不透明区域的边界在什么位置，具体来说就是水平和垂直方向上从哪个位置开始出现不透明的像素点，又是到哪个位置以后不再出现不透明的像素点，这样水平方向和垂直方向开始结束的位置所围成的矩形区域就是我们需要裁剪的区域了。而 canvas 刚好能帮助我们实现该判断。



假设我们有一张宽为 w, 高为 h 的需要裁剪图片，首先需要创建一个 canvas 元素，并获取canvas 上下文，然后使用 canvas 的 getImageData api 获取图片信息。

```js
const canvas = document.createElement('canvas')
canvas.width = w
canvas.height = h
const ctx = canvas.getContext('2d')
ctx.drawImage(img, 0, 0, w, h)
const imgData = ctx.getImageData(0, 0, w, h)
```

`imgData` 中有一个 `data` 属性，它是一个 Uint8ClampedArray, 类数组结构，每四个元素表示一个像素点信息，即像素点的 RGBA 值，所以可以看成一个 `[rgbargbargba...]` 这样的数组。如下图，每个格子代表一个像素点的话，data 就是一个从第一个 rgba 一直到最后一个 rgba 的数组，其中 a 代表的是当前像素点的 alpha 通道，即透明度。因此可以通过遍历每一个像素点来确认裁剪的边界。

![](https://cdn.jsdelivr.net/gh/Zjinxing/image-galary/blog/截屏2022-05-29%2017.50.56.png)

 

通过以下方法找出边界：

```js
let x = 0, // 开始出现像素点的 x 坐标
    y = 0, // 开始出现像素点的 y 坐标
    maxX = 0, // 最后出现像素点的 x 坐标
    maxY = 0 // 最后出现像素点的 y 坐标
let freezedY = false


for(let i = 0; i < h; i++) {
    // 像素行循环
    let rowOpacity = true // 用于判断当前行是否全是透明
    for(let j = 0; j < w; j++) {
        // 循环第 i 行像素点的每一列
        const alpha = imgData.data[(i * w + j) * 4 + 3]
        if(alpha > 0) {
            // 当前像素点不透明
            if (x === 0) {
                x = j
            } else {
                x = Math.min(x, j) // 取最小的 x 坐标
            }
            maxX = Math.max(maxX, j) // 结束取最大的 y 坐标
            rowOpacity = false
        }
    }
    // 一行循环完毕，更新 y 坐标
    if (rowOpacity) {
        // 一行循环完毕且尚未遇到有不透明像素的行，y++
        if(!freezedY) {
            y++
        }
    } else {
        freezedY = true
        maxY = i
    }
}

const width = maxX - x // 裁剪区宽度
const height = maxY - y // 裁剪区高
```

这样就获取到了裁剪区的坐标及宽高，然后我们新建一个 canvas，就可以把裁剪部分保存下来了：

```js
const rectImgData = ctx.getImageData(x, y, width, height) // 裁剪区数据
const canvas1 = document.createElement('canvas')
canvas1.width = width
canvas1.height = height
const ctx1 = canvas1.getContext('2d')
ctx1.putImageData(rectImgData, 0, 0)
const base64Img = canvas1.toDataURL('image/png')
```

这样就获取到了裁剪区域的 base64 数据了，可以根据需要把他保存到本地或者是展示在页面中。
