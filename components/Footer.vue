<script lang="ts" setup>
import pkg from "../package.json";

const commitHash = (import.meta.env.VITE_COMMIT_REF || "").slice(0, 7);
const buildTime = new Date(
  parseInt(import.meta.env.VITE_APP_BUILD_TIME || "0")
).toLocaleDateString();
</script>

<template>
  <footer>
    <div class="container max-w-[1280px] mx-auto mt-12 p-4">
      <div
        class="text-center font-medium text-neutral-500 dark:text-neutral-500 space-y-1"
      >
        <a
          href="https://github.com/HoshinoSuzumi/ai_couplets"
          class="text-sm inline-flex items-center gap-1"
          target="_blank"
        >
          <span>&copy; Timothy Yin</span>
          <Icon name="tabler:brand-github" class="text-base" />
        </a>
        <span> | </span>
        <a
          href="https://bh8.ga"
          class="text-sm inline-flex items-center gap-1"
          target="_blank"
        >
          <span>个人主页</span>
        </a>
        <p class="text-xs">
          <a href="https://deepseek.com" class="text-blue-500" target="_blank">
            DeepSeek
          </a>
          提供强劲动力
        </p>
        <p v-if="commitHash && buildTime" class="text-xs space-x-1 pt-4">
          <span
            >版本: v{{ pkg.version }} (<a
              :href="`https://github.com/HoshinoSuzumi/ai_couplets/commit/${commitHash}`"
              class="border-b border-dashed border-neutral-500 dark:border-neutral-500 hover:border-neutral-400 dark:hover:border-neutral-400"
              target="_blank"
              >{{ commitHash || "unknown" }}</a
            >)</span
          >
          <span
            >构建于:
            {{ buildTime !== "1970/1/1" ? buildTime : "unknown" }}</span
          >
        </p>
        <p v-else class="text-xs pt-4">版本: v{{ pkg.version }}</p>
      </div>
    </div>
  </footer>
</template>

<style scoped></style>
