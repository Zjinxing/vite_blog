---
title: 使用vue实现一个聊天输入框
date: 2019-9-28 22:35:25
tags:
  - vue
  - JavaScript
describe: 最近工作需要在产品中集成即时通讯功能，在聊天输入框的实现过程中踩了不少坑，在此记录一下
---

*最近工作需要在产品中集成即时通讯功能，在聊天输入框的实现过程中踩了不少坑，在此记录一下*

### 实现的功能

- 插入表情
- 插入图片
- `ctrl + enter` 换行
- `@` 提醒

### 预览地址

https://codesandbox.io/s/vue-template-fdn21

### 使用的第三方库

- twemoji：tweeter 的 emoji 库，用于实现表情的插入
- element-ui：部分样式使用element-ui实现

### 具体实现

#### 基本输入功能

> 由于需要在输入框中插入图片，因此使用普通的 textarea 文本输入框肯定难以实现了，因此考虑使用 `div + contenteditable` 来实现输入框。首先创建一个空的 `vue` 项目，在`components` 文件夹下新建`Editor.vue`， 基本的html 和 css 如下：

```vue
<template>
  <div ref="editor" class="editor">
    <div class="editor-tools"></div>
    <div ref="editorContent" contenteditable="true" class="editor-content"></div>
  </div>
</template>

<style lang="stylus" scoped>
.editor {
  position: relative;
  width: 100%;
  height: 100%;
  padding-top: 30px;
  text-align: left;
  border: 1px solid #acacac;
  border-radius: 3px;
  box-sizing: border-box;

  &-tools {
    position: absolute;
    display: flex;
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
    padding: 3px 5px;
  }

  &-content {
    width: 100%;
    min-width: 600px;
    height: 100%;
    min-height: 220px;
    padding: 3px 5px;
    outline: none;
  }
}
</style>
```

![微信截图_20190928121434.png](https://i.loli.net/2019/09/28/4MabvKACJ92ld6X.png)

#### 插入 emoji

根据 `twemoji` 的文档，我们可以用 `twemoji.parse()` 方法将 `emoji` 的 utf-16 编码码解析为 `twemoji` 提供的 `emoji` 图片，所以首先需要取得需要使用的表情的 utf-16编码，`twemoji.convert.fromCodePoint()` 提供了一个将 `hex`编码转为 `utf-16` 的方法，而这个库中的图片都是以 `emoji` 对应的 `hex` 编码命名的，因此我们可以通过 `nodejs` 简单的批量获取我们所需要的emoji编码:

1. 从 `twemoji` 库中下载需要的图片，放到一个文件夹中，命名 `images`

2. 然后新建一个文件夹，将 `images` 文件夹放到新建的文件夹中

3. 在新建的文件夹中执行 `yarn add twemoji` 命令，安装 `twemoji`

4. 新建 `app.js` 文件，内容如下：

   ```js
   const fs = require('fs');
   const folder = './images';
   const nameArr = [];
   const twemoji = require('twemoji');
   
   fs.readdir(folder, (err, files) => {
     files.forEach(file => {
       const name = file.split('.')[0];
       const code = twemoji.convert.fromCodePoint(name);
       nameArr.push(`"${code}"`);
     });
     console.log(nameArr.length, nameArr);
     const data = `{"emojiArr": [${nameArr}]}`;
     fs.writeFile('./emoji.json', data, err => {
       if (err) {
         throw err;
       }
       console.log('write complete');
     });
   });
   ```

5. 运行 `app.js` 将得到一个 `emoji.json` 文件，这就是我们输入`emoji` 需要用到的。

然后回到我们的项目中，在 `main.js` 添加一个自定义指令：

```js
Vue.directive('emoji', {
  inserted(el) {
    el.innerHTML = twemoji.parse(el.innerHTML)
  },
})
```

然后将 `emoji.json` 放到项目中，在`components` 下创建一个 `Emoji.vue` 文件：

```vue
<!---- Emoji 表情 ----->
<template>
  <div class="emoji-wrapper">
    <span v-emoji v-for="item in emojiArr" :key="item" class="emoji-item" @click="selectEmoji(item)">{{ item }}</span>
  </div>
</template>

<script>
import { emojiArr } from '../assets/emoji.json'

export default {
  data() {
    return {
      emojiArr,
    }
  },
  methods: {
    selectEmoji(code) {
      this.$emit('select-emoji', code)
    },
  },
}
</script>

<style lang="stylus" scoped>
.emoji-wrapper {
  display: flex;
  flex-wrap: wrap;
  width: 390px;
  height: 300px;
  padding: 0;
  overflow-y: scroll;

  .emoji-item {
    cursor: pointer;

    & >>> img {
      width: 32px;
      height: 32px;
      padding: 3px;
    }
  }
}
</style>
```

接下来就可以在 `Editor.vue` 中使用 `emoji` 了。有一点需要注意的是：在选择 `emoji` 的时候要保持输入框不失去焦点，还有@提醒的时候也是，因此在输入框获取焦点的时候需要监听`mousedown`事件，如果是选择`emoji` 或者是@成员时则需要阻止输入框失去焦点，当输入框失去焦点时再移除事件监听。

插入 `emoji` 的方法：

```js
onSelectEmoji(code) {
      const el = this.$refs.editorContent
      el.focus() // 防止输入框没有焦点时表情被插入到其他位置，因此在此处先获取焦点
      const sel = window.getSelection()
      const range = sel.getRangeAt(0)
      const textNode = document.createTextNode(code)
      range.insertNode(textNode)
      sel.removeAllRanges()
      range.collapse()
      sel.addRange(range)
    },
```

`getSelection()` 方法获取的是一个对象，表示用户选择的文本范围或光标的当前位置，它代表页面中的文本选区，`getRangeAt` 获取的是一个`Range`，当我们点击emoji时，以emoji的编码创建一个文本节点，再讲此文本节点插入到range中，再将range添加到selection中便完成了表情的插入。

#### ctrl + enter 换行的实现

既然是使用的 `div` 标签实现的输入框，换行首先想到的是插入一个 `<br />` 标签，但是实现的时候却发现需要按两次 `ctrl + enter` 才能实现换行，检查元素发现两个 `br`, 一个在第一行末尾，另一个在第二行，后来在插入`br` 标签后，又在`br`后插入一个`\u00a0` 的空格，然后再执行 `delete` 命令实现换行，代码如下：

```js
// ctrl + enter 换行
    lineBreak() {
      const selection = window.getSelection()
      const range = selection.getRangeAt(0)
      const br = document.createElement('br')
      const textNode = document.createTextNode('\u00a0')
      range.insertNode(br)
      range.collapse(false)
      range.insertNode(textNode)
      range.selectNodeContents(textNode)
      selection.removeAllRanges()
      selection.addRange(range)
      document.execCommand('delete')
    },
```

#### @提醒的实现

微信中的@提醒在插入后如果删除的话是整体删除的，这里的实现方案是在用户选中@的成员后，创建一个canvas，通过canvas将文字转为图片，替换掉 `@` 符号以及 `@` 符号之后的文字，实现的核心代码如下：

```js
insertMention(name, id) {
      const sel = document.getSelection()
      const range = sel.getRangeAt(0)
      console.log(range)
      // 删除@符号后的字符的方法
      this.deleteMentionChar(range)
      const el = this.$refs.editorContent
      const { fontSize, fontFamily, color } = getComputedStyle(el)
      const canvas = document.createElement('canvas')
      const width = parseInt(fontSize, 10) * (name.length + 1) + 6
      const height = parseInt(fontSize, 10) + 6
      canvas.width = width
      canvas.height = height
      this.getHighRes(canvas) // 这里是一个处理高分辨率屏幕下图片模糊的转换方法
      const ctx = canvas.getContext('2d')
      ctx.textBaseline = 'top'
      ctx.font = `${fontSize} ${fontFamily}`
      ctx.fillStyle = color
      ctx.fillText(`@${name}`, 3, 3)
      ctx.save()
      const dataURL = canvas.toDataURL()
      const img = document.createElement('img')
      img.src = dataURL
      // 给img标签添加自定义属性，方便取得被@成员的id
      img.setAttribute('data-name', `@${name}`)
      img.setAttribute('data-id', id)
      img.style.verticalAlign = 'middle'
      img.width = width
      img.height = height
      sel.removeAllRanges()
      range.insertNode(img)
      range.collapse()
      sel.addRange(range)
      this.memberListVisible = false
    },
```

@提醒另外一个需要注意的地方是@列表出现的位置，因此需要在输入@符号之后获取光标在屏幕上的位置，将成员列表显示在正确的位置。因此需要监听`@` 的键盘事件，监听到`@`输入，计算光标位置:

```
// 输入@字符获取光标相对父元素的位置
    onMention() {
      const el = this.$refs.editor
      const sel = document.getSelection()
      const range = sel.getRangeAt(0)
      const [rect] = range.getClientRects()
      const [content] = el.getClientRects()
      const left = rect.x - content.x
      const top = rect.y - content.y
      const memberListEle = this.$refs.memberList
      memberListEle.style.left = `${left}px`
      memberListEle.style.top = `${top + 19}px`
      this.memberListVisible = true
    },
```

首先我们通过`range.getClientRects()` 光标相对于窗口的位置，然后在获取输入框相对于屏幕的位置，这样就能获取到光标相对于输入框的位置，就能正确定位成员列表需要显示的位置了。

#### 效果图及demo 预览

效果图

![111111.gif](https://i.loli.net/2019/09/28/WnlVGgRHPKX8Odp.gif)

更多细节及在线demo预览详见 https://codesandbox.io/s/vue-template-fdn21