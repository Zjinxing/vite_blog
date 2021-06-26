<script setup>
import DefaultTheme from 'vitepress/theme'
import HomeHeader from './components/HomeHeader.vue'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero>
      <home-header />
    </template>
    <Content />
  </Layout>
</template>