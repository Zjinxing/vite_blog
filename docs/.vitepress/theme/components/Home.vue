<template>
  <ul class="article-list">
    <li v-for="art in artList" :key="art.frontMatter.title"  class="article">
      <a :href="art.regularPath">
        <div class="article-header">
          <h3 class="article-title">
            {{ art.frontMatter.title }}
          </h3>
          <span class="article-date">{{ art.frontMatter.date }}</span>
        </div>
        <div class="article-describe">
          {{ art.frontMatter.describe }}
        </div>
      </a>
    </li>
  </ul>
</template>

<script setup>
import { computed } from 'vue'
import { useSiteData } from 'vitepress'

const siteDate = useSiteData()
const artList = computed(() =>
  siteDate.value.themeConfig.pages.filter((item) => item.frontMatter.title)
)
</script>

<style scoped>
.article-list {
  list-style: none;
  width: 650px;
  margin: 0 auto;
}
.article {
  padding-bottom: 15px;
  margin-bottom: 15px;
  border-bottom: 1px solid #ccc;
}
.article-list a {
  text-decoration: none;
}
.article-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}
.article-title {
  margin: 0;
}
</style>
