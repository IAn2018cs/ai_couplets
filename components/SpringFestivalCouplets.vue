<script lang="ts" setup>
import type { Couplet } from "~/types";

defineProps({
  couplet: {
    type: Object as PropType<Couplet>,
  },
  blackText: {
    type: Boolean,
    default: false,
  },
});

const coupletsRef = ref<HTMLElement | null>(null);
defineExpose({ coupletsRef });
</script>

<template>
  <div
    :class="`${blackText ? 'text-black' : 'text-amber-300'}`"
    class="flex flex-col items-center MaShanZheng"
    ref="coupletsRef"
  >
    <!-- 横批 -->
    <div
      contenteditable
      class="couplets text-4xl sm:text-5xl font-bold px-3 py-2 mb-12 relative overflow-hidden"
    >
      <span

        >{{ couplet?.横批 }}</span
      >
    </div>

    <div class="flex justify-between items-center w-full">
      <!-- 左联 -->
      <div
        contenteditable
        class="couplets text-vertical text-4xl sm:text-5xl text-center px-3 py-4"
      >
        {{ couplet?.上联 }}
      </div>

      <!-- 福字 -->
      <div
        class="relative couplets w-20 h-20 sm:w-24 sm:h-24 transform transition-transform duration-500 overflow-hidden diamond-fu"
        style="transform: rotate(45deg)"
      >
        <span
          class="absolute inset-0 flex justify-center items-center font-bold text-5xl sm:text-7xl transform -rotate-45"
        >
          福
        </span>
      </div>

      <!-- 右联 -->
      <div
        contenteditable
        class="couplets text-vertical text-4xl sm:text-5xl text-center px-3 py-4"
      >
        {{ couplet?.下联 }}
      </div>
    </div>
  </div>
</template>

<style scoped>
.couplets {
  background-blend-mode: multiply;
  background-image: url("/pattern/paper.png");
  background-size: cover;
  @apply bg-[#ee3f4d] rounded-sm tracking-widest;
}

.text-vertical {
  writing-mode: vertical-rl;
  text-orientation: upright;
}

.text-rtl {
  direction: rtl;
  unicode-bidi: bidi-override;
}

.diamond-fu {
  @apply rounded-sm;
  /* box-shadow: 0 0 0 8px #e82c3b, 0 0 0 12px #fde047; */
}

/* Fonts */
.ZhiMangXing {
  font-family: "Zhi Mang Xing", cursive;
}

.MaShanZheng {
  font-family: "Ma Shan Zheng", cursive;
}
</style>
