const getPages = require('./utils/pages')

const getConfig = async () => {
  let config = {
    lang: 'zh-CN',
    title: 'hello vitepress',
    themeConfig: {
      pages: await getPages(),
      nav: [
        { text: '首页', link: '/' },
        { text: '归档', link: '/archives/' },
        { text: '分类', link: '/tags/' },
      ],
    },
  }
  return config
}

module.exports = getConfig()