<template>
  <ul class="doc-list">
    <li v-for="doc in docList" :key="doc.frontMatter.title">
      <a :href="doc.regularPath">
        {{ doc.frontMatter.title }}
      </a>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'
import { useSiteData } from 'vitepress'

const siteDate = useSiteData()
const docList = computed(() =>
  siteDate.value.themeConfig.pages.filter((item) => item.frontMatter.title)
)
console.log({ docList })
</script>

<style scoped>
.doc-list {
  list-style: none;
}
</style>
