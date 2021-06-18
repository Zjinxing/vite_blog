import DefaultTheme from 'vitepress/theme'
import Layout from './Layout.vue'
import Tags from './components/Tags.vue'
import Archives from './components/Archives.vue'
import './style/index.styl'

export default {
  ...DefaultTheme,
  Layout,
  enhanceApp({ app, route, siteData }) {
    app.component('Tags', Tags)
    app.component('Archives', Archives)
  },
}
