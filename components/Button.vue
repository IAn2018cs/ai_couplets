<script lang="ts" setup>
defineProps({
  soft: Boolean,
  disabled: Boolean,
  loading: Boolean,
});
</script>

<template>
  <button :class="{ soft, disabled, loading }" :disabled="disabled || loading">
    <slot></slot>
    <Icon v-if="loading" name="svg-spinners:90-ring-with-bg" class="text-lg" />
  </button>
</template>

<style scoped>
button {
  @apply px-4 py-2 bg-amber-500 text-white rounded-md font-medium flex items-center gap-1 select-none transition-all duration-300;
  @apply hover:bg-amber-600;
}

button.soft {
  @apply bg-amber-100/10 text-amber-500;
  @apply hover:bg-amber-100/20;
}

button:disabled {
  @apply bg-neutral-200 text-neutral-500 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-400;
}

button.loading {
  @apply cursor-wait;
}
</style>
