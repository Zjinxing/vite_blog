import { useSiteData } from 'vitepress'
import { computed } from 'vue'

export default function usePages() {
  const siteData = useSiteData()
  const pages = siteData.value.themeConfig.pages
  return computed(() => pages)
}
