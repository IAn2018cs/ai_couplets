// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },
  modules: [
    "@nuxtjs/tailwindcss",
    "@pinia/nuxt",
    "pinia-plugin-persistedstate",
    "@nuxt/fonts",
    "@vueuse/nuxt",
    "@nuxtjs/seo",
    "@nuxt/image",
    "@nuxt/icon",
    "nuxt-gtag",
  ],
  gtag: {
    id: "G-0FNJ9942NH",
  },
});