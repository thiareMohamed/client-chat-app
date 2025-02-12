// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-02-11',
  devtools: { enabled: true },
  modules: ['@nuxt/ui', '@nuxtjs/tailwindcss', 'nuxt-twemoji', 'nuxt-graphql-client'],
  tailwindcss: {
    exposeConfig: true,
    viewer: true,
  },
  twemoji: {
    expiresIn: 3.154e+7
  },
  vite: {
    server: {
      allowedHosts: [
        '21f2-41-208-179-36.ngrok-free.app',
        '*.ngrok-free.app'
      ]
    }
  },
  runtimeConfig: {
    public: {
      GQL_HOST: 'http://localhost:3002/graphql'
    }
  }
})