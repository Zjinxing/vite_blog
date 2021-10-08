import { defineComponent } from 'vue'
import './index.styl'
import usePages from '../../composables/usePages'

export default defineComponent({
  name: 'Home',
  setup() {
    const artList = usePages()
    return () => (
      <ul class="article-list">
        {artList.value.map(art => <li key={art.frontMatter.title} class="article">
          <a href={art.regularPath}>
            <div class="article-header">
              <h3 class="article-title ellipsis">
                {art.frontMatter.title}
              </h3>
              <span class="article-date">{art.frontMatter.date}</span>
            </div>
            <div class="article-describe">
              {art.frontMatter.describe}
            </div>
          </a>
        </li>)}
      </ul>
    )
  }
})