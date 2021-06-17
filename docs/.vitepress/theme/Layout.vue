<script setup>
import DefaultTheme from 'vitepress/theme'
import Home from './components/Home.vue'
import HomeHeader from './components/HomeHeader.vue'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #home-hero>
      <home-header />
    </template>
    <template #home-features>
      <Home />
    </template>
    <Content />
  </Layout>
</template>