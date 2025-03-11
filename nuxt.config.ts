// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  ssr: false,

  css: ['~/assets/css/main.css'],
  postcss: {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  },
  
  modules: [
    '@vuestic/nuxt'
  ],

  vuestic: {
    config: {
      components: {
        VaCard: {
          outlined: true
        }
      }
    }
  },

  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  app: {
    baseURL: '/formal-parser-ui/'
  }
})
