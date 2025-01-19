<script lang="ts" setup>
import { toBlob, toPng } from "html-to-image";
import { useClipboardItems } from "@vueuse/core";
import { type Couplet } from "~/types";

useHead({
  title: "生成对联",
});

const { copy, copied } = useClipboard();

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
const blackText = ref(false);

const generating = ref(false);
const copingOrDownloading = ref(false);

const onGenerateClick = async () => {
  generating.value = true;
  useTrackEvent("search", {
    search_term: input_prompt.value || "No prompt",
  });
  const coup = await generateCouplet({
    prompt: input_prompt.value,
  });
  couplet.value = coup;
  generating.value = false;
  setTimeout(() => {
    // 冗余埋点
    useTrackEvent("generate_couplet", {
      prompt: input_prompt.value || "No prompt",
      couplet: [coup.横批, coup.上联, coup.下联, coup.总结].join(","),
    });
  }, 200);
};

const onCopyClick = async () => {
  const cRef = coupletsComp.value?.coupletsRef;
  if (!cRef) return;
  copingOrDownloading.value = true;
  try {
    const blob = await toBlob(cRef, { includeQueryParams: true });
    const { copy, isSupported } = useClipboardItems();
    if (!isSupported.value) {
      alert("当前浏览器不支持复制图片到剪贴板");
      return;
    }
    if (blob) await copy([new ClipboardItem({ "image/png": blob })]);
    alert("已复制图片到剪贴板");
  } catch (e) {
    console.error(e);
    alert("复制失败，请重试");
  } finally {
    copingOrDownloading.value = false;
  }
};

const onDownloadClick = async () => {
  const cRef = coupletsComp.value?.coupletsRef;
  if (!cRef) return;
  copingOrDownloading.value = true;
  try {
    const dataUrl = await toPng(cRef, { includeQueryParams: true });
    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${couplet.value?.横批}_${couplet.value?.总结}_AI 对联.png`;
    a.click();
  } catch (e) {
    console.error(e);
    alert("下载失败，请重试");
  } finally {
    copingOrDownloading.value = false;
  }
};

const onShareClick = async () => {
  const url = `我用 AI 对联生成器生成了一副对联，你也来试试吧！
「${couplet.value?.上联}，${couplet.value?.下联}」
  横批：${couplet.value?.横批}
${window.location.origin}/?prompt=${encodeURIComponent(
    input_prompt.value
  )}&couplets=${encodeURIComponent(JSON.stringify(couplet.value))}&invertFu=${
    invertFu.value
  }&invertCouplet=${invertCouplet.value}&blackText=${blackText.value}`;

  await copy(url);
  if (copied.value) {
    alert("已复制分享链接");
  }
  useTrackEvent("share", {
    method: "copy",
    content_type: "text",
    content_id: url,
  });
};

onMounted(() => {
  const params = new URLSearchParams(window.location.search);
  const p_prompt = params.get("prompt");
  const p_couplets = params.get("couplets");
  const p_invertFu = params.get("invertFu");
  const p_invertCouplet = params.get("invertCouplet");
  const p_blackText = params.get("blackText");

  if (p_prompt) input_prompt.value = p_prompt;
  if (p_couplets) couplet.value = JSON.parse(p_couplets);
  if (p_invertFu) invertFu.value = p_invertFu === "true";
  if (p_invertCouplet) invertCouplet.value = p_invertCouplet === "true";
  if (p_blackText) blackText.value = p_blackText === "true";
});
</script>

<template>
  <div class="container max-w-[1280px] mx-auto p-4">
    <Topbar class="mb-10" />

    <div class="px-0 sm:px-20">
      <SpringFestivalCouplets
        ref="couplets"
        :couplet="couplet!"
        :invert-fu="invertFu"
        :black-text="blackText"
        :first-line-on-right="invertCouplet"
      />

      <div class="mt-10">
        <div class="space-y-2">
          <textarea
            v-model="input_prompt"
            placeholder="你想生成什么主题的对联？"
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
              <div class="flex items-center gap-2">
                <label class="toggle">
                  <input v-model="blackText" type="checkbox" />
                  <span class="slider"></span>
                </label>
                <span class="text-neutral-500 dark:text-neutral-400">
                  {{ blackText ? "黑" : "黄" }}字
                </span>
              </div>
            </div>
            <div class="flex items-center gap-2 flex-col-reverse sm:flex-row">
              <Button soft @click="onShareClick">分享</Button>
              <Button
                soft
                :loading="copingOrDownloading"
                @click="onDownloadClick"
              >
                下载图片
              </Button>
              <Button soft :loading="copingOrDownloading" @click="onCopyClick">
                复制图片
              </Button>
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
