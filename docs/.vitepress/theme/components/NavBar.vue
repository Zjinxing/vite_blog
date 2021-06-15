<template>
  <div class="nav"></div>
</template>

<script setup>
import { computed } from 'vue'
import { useSiteData } from "vitepress";
const siteData = useSiteData()

console.log({ siteData })

</script>
