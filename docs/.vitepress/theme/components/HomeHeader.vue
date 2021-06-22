<template>
  <header class="home-hero">
    <h1 class="title">WelCome!</h1>
    <img :src="HeaderImg" alt="" class="home-hero__bg" />
  </header>
</template>

<script setup>
import { ref } from 'vue'
import HeaderImg from '../../images/header_img.png'
</script>

<style lang="stylus" scoped>
.home-hero
  position: relative
  max-width: 900px
  max-height: 225px
  height 20vw
  margin: 0 auto 25px auto
  .title
    position: absolute
    left: 50%
    bottom: -35px
    text-align: center
    margin: 0
    transform: translateX(-50%)
  .description
    text-align: center
  &__bg
    position: absolute
    top: 0
    left: 50%
    height: 100%
    max-height: 225px
    transform: translateX(-50%)
</style>