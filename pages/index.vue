<script lang="ts" setup>
import { toBlob, toPng } from "html-to-image";
import { useClipboardItems } from "@vueuse/core";
import { type Couplet } from "~/types";

useHead({
  title: "生成对联",
});

const { copy, copied } = useClipboard();
const { isSupported: isClipItemsSupported } = useClipboardItems();

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
const replaceFu = ref(true);

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
      skipFonts: true,
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
    const dataUrl = await toPng(cRef, {
      includeQueryParams: true,
      skipFonts: true,
    });
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
  }&invertCouplet=${invertCouplet.value}&blackText=${blackText.value}&reFu=${
    replaceFu.value
  }`;

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
  const p_replaceFu = params.get("reFu");

  if (p_prompt) input_prompt.value = p_prompt;
  if (p_couplets) couplet.value = JSON.parse(p_couplets);
  if (p_invertFu) invertFu.value = p_invertFu === "true";
  if (p_invertCouplet) invertCouplet.value = p_invertCouplet === "true";
  if (p_blackText) blackText.value = p_blackText === "true";
  if (p_replaceFu) replaceFu.value = p_replaceFu === "true";
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
          :invert-fu="invertFu"
          :black-text="blackText"
          :first-line-on-right="invertCouplet"
          :replace-fu="replaceFu"
        />
      </div>

      <div class="flex-1">
        <div class="space-y-2">
          <textarea
            v-model="input_prompt"
            placeholder="你想生成什么主题的对联？"
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
            <div class="flex items-center justify-between gap-2 flex-wrap">
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
                  <input v-model="replaceFu" type="checkbox" />
                  <span class="slider"></span>
                </label>
                <span class="text-neutral-500 dark:text-neutral-400">
                  替换福字
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
            <div
              class="w-full h-[1px] bg-neutral-200/50 dark:bg-neutral-700/50"
            ></div>
            <div class="grid grid-cols-2 gap-3">
              <Button soft @click="onShareClick" block>分享链接</Button>
              <Button
                v-if="isClipItemsSupported"
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
                class="sm:col-span-2"
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
body {
  background-image: url("data:image/svg+xml,<svg id='patternId' width='100%' height='100%' opacity='0.035' xmlns='http://www.w3.org/2000/svg'><defs><pattern id='a' patternUnits='userSpaceOnUse' width='75' height='74.82' patternTransform='scale(1) rotate(0)'><rect x='0' y='0' width='100%' height='100%' fill='%23ffffff00'/><path d='M0 0v5.19A5.19 5.19 0 0 0 5.19 0Zm69.81 0A5.19 5.19 0 0 0 75 5.19V0ZM37.5 32.22a5.19 5.19 0 0 0-5.19 5.19 5.19 5.19 0 0 0 5.19 5.19 5.19 5.19 0 0 0 5.19-5.2 5.19 5.19 0 0 0-5.19-5.18zM0 69.63v5.19h5.19A5.19 5.19 0 0 0 0 69.63zm75 0a5.19 5.19 0 0 0-5.19 5.19H75z'  stroke-width='1' stroke='none' fill='hsla(47,80.9%,61%,1)'/><path d='M18.9 0c0 13.34 17.13 23.85 17.86 24.3.03 0 .05.01.08.03l.06.03.05.01a.8.8 0 0 0 .46 0l.05-.01.06-.03.08-.04c.73-.44 17.86-10.95 17.86-24.29h-1.62c0 7.92-6.88 15.01-11.9 19.14 3.12-4.4 6.85-11.3 6.85-19.14h-1.62c0 8.64-4.97 16.26-8.09 20.19A78.2 78.2 0 0 0 41.9 0h-1.62c0 9.15-1.97 17.14-3.1 20.95A76.67 76.67 0 0 1 34.08 0h-1.62c0 8.46 1.65 15.95 2.82 20.2C32.16 16.26 27.2 8.64 27.2 0h-1.62c0 7.85 3.73 14.74 6.86 19.14C27.4 15 20.53 7.92 20.53 0ZM0 13v3.46c1.13 3.8 3.1 11.8 3.1 20.95 0 9.15-1.97 17.14-3.1 20.95v3.46a.8.8 0 0 0 .23-.04l.05-.01.06-.03.08-.04c.73-.44 17.86-10.95 17.86-24.29S1.15 13.56.42 13.11c-.03 0-.05-.01-.08-.03l-.06-.03-.05-.01A.82.82 0 0 0 .02 13H0zm75 0h-.02a.79.79 0 0 0-.2.04l-.06.01-.06.03-.08.04c-.73.44-17.86 10.95-17.86 24.3 0 13.33 17.13 23.84 17.86 24.28l.08.04.06.03.05.01a.8.8 0 0 0 .23.04v-3.47a76.69 76.69 0 0 1-3.1-20.94c0-9.15 1.97-17.13 3.1-20.94zM1.9 17.21c3.12 3.93 8.09 11.55 8.09 20.2 0 8.64-4.97 16.26-8.09 20.19a78.18 78.18 0 0 0 2.82-20.2c0-8.45-1.65-15.94-2.82-20.19zm71.2.01a78.15 78.15 0 0 0-2.82 20.19c0 8.46 1.65 15.95 2.82 20.2-3.12-3.93-8.09-11.55-8.09-20.2 0-8.64 4.97-16.26 8.09-20.19zM4.75 18.27c5.03 4.13 11.9 11.22 11.9 19.14S9.79 52.42 4.76 56.55c3.13-4.4 6.86-11.3 6.86-19.14 0-7.85-3.73-14.74-6.86-19.14zm65.5 0c-3.13 4.4-6.86 11.3-6.86 19.14 0 7.85 3.73 14.74 6.86 19.14-5.03-4.13-11.9-11.22-11.9-19.14s6.87-15.01 11.9-19.14zM37.18 50.41h-.02a.8.8 0 0 0-.2.04l-.06.01-.06.03-.08.04c-.73.44-17.86 10.95-17.86 24.29h1.62c0-7.93 6.88-15.01 11.9-19.14-3.12 4.4-6.85 11.3-6.85 19.14h1.62c0-8.64 4.97-16.26 8.09-20.2a78.14 78.14 0 0 0-2.82 20.2h1.62c0-9.15 1.97-17.14 3.1-20.95 1.13 3.8 3.1 11.8 3.1 20.95h1.62a78.2 78.2 0 0 0-2.82-20.2c3.12 3.93 8.09 11.54 8.09 20.2h1.62c0-7.85-3.73-14.74-6.86-19.14 5.03 4.13 11.9 11.22 11.9 19.14h1.63c0-13.34-17.13-23.85-17.86-24.3-.03 0-.05-.01-.08-.03l-.06-.03-.05-.01a.82.82 0 0 0-.21-.04h-.02z'  stroke-width='1' stroke='none' fill='hsla(4.1,89.6%,58.4%,1)'/></pattern></defs><rect width='800%' height='800%' transform='translate(0,-0.64)' fill='url(%23a)'/></svg>");
}

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
