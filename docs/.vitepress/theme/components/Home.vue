<template>
  <ul class="article-list">
    <li v-for="art in artList" :key="art.frontMatter.title" class="article">
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
import usePages from '../composables/usePages'

const artList = usePages()
</script>

<style lang="stylus" scoped>
.article-list
  list-style: none;
  width: 100%;
  max-width: 650px;
  margin: 0 auto;

.article
  padding: 25px 10px 15px 10px;
  margin-bottom: 10px;
  border-bottom: 1px solid var(--c-divider-light);
  transition: all 0.2s
  &-describe
    color: var(--c-text-light)
  &-header
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 10px
  &-date
    color: var(--c-text-lighter)
  &:hover
    transform: scale(1.03)
    box-shadow: 5px 5px 10px #3eaf7c66;

.article-list
  a
    text-decoration: none;

.article-title
  margin: 0;
</style>
