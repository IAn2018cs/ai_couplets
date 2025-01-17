<script lang="ts" setup>
import { toBlob, toPng } from "html-to-image";
import { useClipboardItems } from "@vueuse/core";
import { type Couplet } from "~/types";

useHead({
  title: "生成对联",
});

const { generateCouplet } = useCoupletGenerator();

const couplet = ref<Couplet | null>({
  上联: "春风送暖花千树",
  下联: "瑞雪迎祥福满门",
  横批: "吉祥如意",
  总结: "福",
});

const coupletsComp = useTemplateRef("couplets");

const input_prompt = ref("");
const invertFu = ref(false);
const invertCouplet = ref(false);

const generating = ref(false);

const onGenerateClick = async () => {
  generating.value = true;
  const coup = await generateCouplet({
    prompt: input_prompt.value,
  });
  couplet.value = coup;
  generating.value = false;
};

const onCopyClick = async () => {
  const cRef = coupletsComp.value?.coupletsRef;
  if (!cRef) return;
  const blob = await toBlob(cRef, { quality: 1 });
  const { copy } = useClipboardItems();
  await copy([new ClipboardItem({ "image/png": blob! })]);
  alert("已复制图片到剪贴板");
};

const onDownloadClick = () => {
  const cRef = coupletsComp.value?.coupletsRef;
  if (!cRef) return;
  toPng(cRef).then((dataUrl) => {
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${couplet.value?.横批}_${couplet.value?.总结}_AI 对联.png`;
    a.click();
  });
};
</script>

<template>
  <div class="container max-w-[1280px] mx-auto p-4">
    <Topbar class="mb-10" />

    <div class="px-0 sm:px-20">
      <SpringFestivalCouplets
        ref="couplets"
        :couplet="couplet!"
        :invert-fu="invertFu"
        :first-line-on-right="invertCouplet"
      />

      <div class="mt-10">
        <div class="space-y-2">
          <textarea
            v-model="input_prompt"
            placeholder="你想生成什么主题、风格的对联？"
            :rows="4"
            :disabled="generating"
          />
          <div class="flex w-full justify-between gap-2">
            <div class="flex items-center gap-4 flex-col-reverse sm:flex-row">
              <div class="flex items-center gap-2">
                <label class="toggle">
                  <input v-model="invertFu" type="checkbox" />
                  <span class="slider"></span>
                </label>
                <span class="text-neutral-500 dark:text-neutral-400">
                  反转福字
                </span>
              </div>
              <div class="flex items-center gap-2">
                <label class="toggle">
                  <input v-model="invertCouplet" type="checkbox" />
                  <span class="slider"></span>
                </label>
                <span class="text-neutral-500 dark:text-neutral-400">
                  反转对联
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-col-reverse sm:flex-row">
              <Button soft @click="onDownloadClick">下载图片</Button>
              <Button soft @click="onCopyClick">复制图片</Button>
              <Button :loading="generating" @click="onGenerateClick">
                生成对联
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <Footer />
  </div>
</template>

<style>
/* Button */
button {
  @apply px-4 py-2 bg-amber-500 text-white rounded-md font-medium;
  @apply hover:bg-amber-600;
}

button.soft {
  @apply bg-amber-100/10 text-amber-500;
  @apply hover:bg-amber-100/20;
}

button:disabled {
  @apply bg-neutral-200 text-neutral-500 cursor-not-allowed dark:bg-neutral-800 dark:text-neutral-400;
}

/* Toggle */
.toggle {
  position: relative;
  display: inline-block;
  @apply h-6 w-10;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle input:checked + .slider {
  @apply bg-amber-500;
}

.toggle input:checked + .slider:before {
  @apply bg-white dark:bg-neutral-50 translate-x-4;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: 0.4s;
  border-radius: 34px;
  @apply bg-neutral-300 dark:bg-neutral-700;
}

.slider:before {
  content: "";
  @apply absolute w-4 h-4 left-1 bottom-1 bg-neutral-50 dark:bg-neutral-400 rounded-full duration-300;
}

/* Textarea */
textarea {
  @apply w-full p-2 bg-neutral-100 dark:bg-neutral-800 rounded-md outline-none text-neutral-900 dark:text-neutral-100;
  @apply focus:ring-2 focus:ring-amber-500;
}

textarea:disabled {
  @apply bg-neutral-200 dark:bg-neutral-800/50 text-neutral-500 dark:text-neutral-400;
}
</style>
