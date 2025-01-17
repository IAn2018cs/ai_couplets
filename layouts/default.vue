<script lang="ts" setup>
useHead({
  titleTemplate: "%s - AI 对联生成器",
  meta: [
    {
      name: "description",
      content: "AI 对联生成器，生成春节对联。",
    },
    {
      name: "keywords",
      content: "对联, 春节对联, 对联生成器, AI 对联",
    }
  ],
})
</script>

<template>
  <slot />
</template>

<style>
body {
  @apply bg-white dark:bg-neutral-900;
}
</style>
