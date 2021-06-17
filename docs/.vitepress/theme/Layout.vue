<script setup>
import DefaultTheme from 'vitepress/theme'
import Home from './components/Home.vue'
const { Layout } = DefaultTheme
</script>

<template>
  <Layout>
    <template #sidebar-top>
      My custom sidebar top content
    </template>
    <template #page-top>
      <div>HOME HERO</div>
    </template>
    <template #home-features>
      <Home />
    </template>
    <Content />
  </Layout>
</template>