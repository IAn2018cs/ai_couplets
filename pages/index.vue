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
    const blob = await toBlob(cRef, {
      includeQueryParams: true,
    });
    const { copy, isSupported } = useClipboardItems();
    if (!isSupported.value) {
      alert("当前浏览器不支持复制图片到剪贴板");
      return;
    }
    if (blob) await copy([new ClipboardItem({ "image/png": blob })]);
    alert("已复制图片到剪贴板");
  } catch (e) {
    console.error(e);
    alert("复制失败，当前浏览器可能不支持复制图片");
  } finally {
    copingOrDownloading.value = false;
  }
};

const onDownloadClick = async () => {
  const cRef = coupletsComp.value?.coupletsRef;
  if (!cRef) return;
  copingOrDownloading.value = true;
  try {
    const blob = await toBlob(cRef, {
      includeQueryParams: true,
    });
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${couplet.value?.横批}_${couplet.value?.总结}_AI 对联.png`;
      a.click();
      URL.revokeObjectURL(url);
    }
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
  )}&couplets=${encodeURIComponent(JSON.stringify(couplet.value))}&blackText=${blackText.value}`;

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
  const p_blackText = params.get("blackText");

  if (p_prompt) input_prompt.value = p_prompt;
  if (p_couplets) couplet.value = JSON.parse(p_couplets);
  if (p_blackText) blackText.value = p_blackText === "true";
});
</script>

<template>
  <div class="container max-w-[1280px] mx-auto p-4">
    <Topbar class="mb-10" />

    <div class="flex flex-col sm:flex-row items-center gap-12">
      <div class="w-full sm:w-[600px] mx-auto">
        <SpringFestivalCouplets
          ref="couplets"
          :couplet="couplet!"
          :black-text="blackText"
        />
      </div>

      <div class="flex-1 w-full sm:w-[400px]">
        <div class="space-y-2">
          <textarea
            v-model="input_prompt"
            placeholder="你想生成什么主题的对联？"
            :maxlength="100"
            :rows="4"
            :disabled="generating"
          />
          <div class="space-y-4">
            <Button @click="onGenerateClick" :loading="generating" block>
              生成对联
            </Button>
            <div
              class="w-full h-[1px] bg-neutral-200/50 dark:bg-neutral-700/50"
            ></div>
            <div class="flex items-center justify-center gap-2 flex-wrap">
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
            <div
              class="w-full h-[1px] bg-neutral-200/50 dark:bg-neutral-700/50"
            ></div>
            <div class="grid grid-cols-3 gap-3">
              <Button soft @click="onShareClick" block>分享链接</Button>
              <Button
                soft
                @click="onCopyClick"
                :loading="copingOrDownloading"
                block
              >
                复制图片
              </Button>
              <Button
                soft
                @click="onDownloadClick"
                :loading="copingOrDownloading"
                block
              >
                下载图片
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
