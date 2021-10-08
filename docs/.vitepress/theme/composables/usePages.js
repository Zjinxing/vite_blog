import { useData } from 'vitepress'
import { computed } from 'vue'

export default function usePages() {
  const siteData = useData()
  const pages = siteData.site.value.themeConfig.pages
  return computed(() => pages)
}
