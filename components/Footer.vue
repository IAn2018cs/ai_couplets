<script lang="ts" setup>
import pkg from "../package.json";
</script>

<template>
  <footer>
    <div class="container max-w-[1280px] mx-auto mt-12 p-4">
      <div
        class="text-center font-medium text-neutral-500 dark:text-neutral-500 space-y-1"
      >
        <p class="text-sm inline-flex items-center gap-1 justify-center">
          <a
            href="https://github.com/HoshinoSuzumi/ai_couplets"
            class="inline-flex items-center gap-1"
            target="_blank"
          >
            <span>&copy; Timothy Yin</span>
            <Icon name="tabler:brand-github" class="text-base" />
          </a>
          <span> | </span>
          <a href="https://deepseek.com" class="text-blue-500" target="_blank">DeepSeek</a>
          <span>提供强劲动力</span>
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
