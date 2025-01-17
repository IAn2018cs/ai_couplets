export const useCoupletGenerator = () => {
  return {
    generateCouplet: async (options: { prompt: string }) => {
      try {
        return await $fetch("/api/generate", {
          query: options,
        });
      } catch (e) {
        console.error(e);
        return {
          上联: "网络断线心慌慌",
          下联: "请求失败意茫茫",
          横批: "网事难成",
          总结: "寄",
        };
      }
    },
  };
};
