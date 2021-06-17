<template>
  <div class="tags">
    <h3 class="tags-title">{{ selectedTag }}</h3>
    <div class="tags-wrapper">
      <span
        v-for="tag in tags"
        :key="tag"
        class="tag-item"
        @click="selectTag(tag)"
      >
        #{{ tag }}
      </span>
    </div>
    <ul class="tags-art">
      <li v-for="art in selectedPages" :key="art.frontMatter.title">
        <a :href="art.regularPath" class="tags-art-link">
          <span class="art-title">{{ art.frontMatter.title }}</span>
          <span class="art-date">{{ art.frontMatter.date }}</span>
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import usePages from '../composables/usePages'

const pages = usePages()
const tags = reactive([])
pages.value.forEach((page) => {
  const pageTags = page.frontMatter.tags
  pageTags.forEach((tag) => {
    if (!tags.includes(tag)) {
      tags.push(tag)
    }
  })
})

const selectedPages = computed(() =>
  pages.value.filter((page) =>
    page.frontMatter.tags.includes(selectedTag.value)
  )
)

const selectedTag = ref('')
const selectTag = (tag) => {
  selectedTag.value = tag
}
</script>

<style lang="stylus" scoped>
.tags
  &-title
    margin: 20px auto
    height: 30px
  &-wrapper
    display: flex
    .tag-item
      position: relative
      padding: 5px 3px
      margin: 0 10px 10px 0
      color: var(--c-text)
      border-radius: 30px 5px 5px 30px
      cursor: pointer
      &::after
        position: absolute
        left: 50%
        bottom: 0
        content: ''
        width: 0
        height: 2px
        background: var(--c-brand)
        transform: translateX(-50%)
        transition: all 0.3s
      &:hover
        color: var(--c-brand)
        &::after
          width: 100%
  &-art
    &-link
      display: flex
      justify-content: space-between
      width: 100%
      text-decoration: none
      &:hover
        .art-title
          text-decoration: underline
      .art-date
        color: var(--c-text-lighter)
</style>
