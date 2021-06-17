---
title: js实现快速排序和冒泡排序
date: 2018-12-14 00:49:49
tags:
  - JavaScript
---

1、冒泡排序
------

### 原理

冒泡排序是对数组进行循环，比较相邻的两个元素的大小，如果前面的比后面的大，则交换两个元素。比如一个数组[4,2,7,3,1,5,6]，第一次比较第0项和第1项，4和2，4比2大，则4和2交换位置，第二次比较第1项和第2项，此时第2项已经是4了，4和7比较，7大，则位置不变，第三次比较第2项和第3项，7比3大，则7和3交换位置……这样第一次循环结束后最大的值就排到了最后一项，也就是7排到了最后。然后开始第二次循环，第二次循环时就不用比较第5项和第6项了，因为上次循环结束后，第6项已经是最大的7了，第二次循环比第一次循环的比较次数就少了一次。这样循环6次之后就完成了排序。写成js就是下面这样：

```js
let array = [4, 2, 7, 3, 1, 5, 6]
function bubbleSort(arr) {
    for(let i = 0; i < arr.length - 1; i++){
        for(let j = 0; j < arr.length - i -1; j++) {
            if(arr[j] > arr[j + 1]) {
                let temp = arr[j]
                arr[j] = arr[j + 1]
                arr[j + 1] = temp
            }
        }
    }
    return arr
}
bubbleSort(array) // [1,2,3,4,5,6,7]
```

2、快速排序
------

### 原理

快速排序和二分查找原理比较类似。快速排序使用了递归的方法，首先判断数组长度，如果小于等于1则直接返回数组。否则先从数组中选出一个元素，这个数字可以是数组中的任意一个元素，然后声明两个空数组，比较数组中的每一项和选出的元素大小，比选出元素小的放如一个数组，比选出元素小的放入另一个数组，这样数组就被分成了3部分，较小的一部分，被选中元素和较大的一部分，然后再对两个数组进行同样的操作。比如\[4, 2, 7, 3, 1, 5, 6\]，假设选中的数字是4，则数组就被分成了\[2,3,1\]、4、\[7,5,6\]，直到被分割的数组长度都等1的时候也就完成了排序。

```js
let array = [4, 2, 7, 3, 1, 5, 6]
function quickSort(arr) {
    if(arr.length <= 1) {
        return arr
    }
    let mIndex = Math.floor(Math.random() * arr.length) // 生成一个随机数，范围0到arr.length-1
    let m = arr.splice(mIndex, 1) // 取出数组中的此项
    let left = []
    let right = []
    for(let i = 0; i < arr.length; i++) {
        if(arr[i]  < m) {
            left.push(arr[i])
        } else  {
            right.push(arr[i])
        }
    }
    return quickSort(left).concat(m, quickSort(right))
}
quickSort(array) // [1,2,3,4,5,6,7]
```



 

另外再加一个和排序无关的
------------

最近遇到的一个面试题，要求生成一个6位数密码，要求有5个数字，一个小写字母。这个需要用到ascii码转字符，当时没想到ascii转字符的方法，就写了一个包含所有小写字母的数组……

```js
function password() {
    let arr = [] // 声明一个空数组，用于存放密码
    let num = function() {
        return Math.floor(Math.random() * 10) // 生成一个0到9的随机数
    }
    // 先存入5个数字进去
    for(let i = 0; i < 5; i++) {
        arr.push(num())
    }
    let ascii = Math.floor(Math.random() * 26) + 97 // 生成一个97到122的随机数（a-z的ascii码）
    let char = String.fromCharCode(ascii) // 将ascii码转为字符
    let index = Math.floor(Math.random() * arr.length)
    arr.splice(index, 0, char) // 将小写字母随机选一个位置插入到数组中
    return arr.join("") // 将数组转为字符串并返回
}
```

