const vueJsx = require('@vitejs/plugin-vue-jsx')
const getPages = require('./utils/pages')

const getConfig = async () => {
  let config = {
    lang: 'zh-CN',
    title: 'hello vitepress',
    description: '这里是描述',
    themeConfig: {
      pages: await getPages(),
      nav: [
        { text: '首页', link: '/' },
        { text: '归档', link: '/archives/' },
        { text: '分类', link: '/tags/' },
        { text: '关于', link: '/about/' },
      ],
    },
  }
  return config
}

module.exports = getConfig()
