<template>
  <div class="archivew">归档</div>
</template>

<script setup>
import { toRaw, computed } from 'vue'
import usePages from '../composables/usePages'

const pages = usePages()
console.log(toRaw(pages.value))
const archivesData = computed(() => {
  const result = new Map()
  const rawPageData = toRaw(pages.value)
  for(let page of rawPageData) {
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
