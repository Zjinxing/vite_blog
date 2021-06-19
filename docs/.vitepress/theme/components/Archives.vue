<template>
  <div class="archives">归档</div>
  <div v-for="year in archivesData" :key="year" class="archives-year">
    <h2>{{ year[0] }}</h2>
    <ul>
      <li v-for="art in year[1]" :key="art.title">
        <a :href="art.regularPath" class="art-link">
          <span class="ellipsis">{{ art.title }}</span>
          <span>{{ art.date.slice(5) }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { toRaw, computed } from 'vue'
import usePages from '../composables/usePages'

const pages = usePages()
console.log(toRaw(pages.value))
const archivesData = computed(() => {
  const result = new Map()
  const rawPageData = toRaw(pages.value)
  for (let page of rawPageData) {
    const { frontMatter, regularPath } = page
    const { date, title } = frontMatter
    const year = date.split('-')[0]
    let yearSet = result.get(year)
    if (!yearSet) {
      result.set(year, (yearSet = new Set()))
    }
    yearSet.add({ title, date, regularPath })
  }
  return result
})
</script>

<style lang="stylus" scoped>
.archives
  &-year
    .art-link
      display: flex
      justify-content: space-between
      width: 100%
      span:first-child
        flex: 1
      span:nth-of-type(2)
        color: var(--c-text-lighter)
        width: 42px
</style>