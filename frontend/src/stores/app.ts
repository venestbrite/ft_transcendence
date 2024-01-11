import { defineStore } from 'pinia'

export const useAppStore = defineStore({
  id: 'app',
  state: () => ({
    darkTheme: true
  }),
  getters: {
    isDark: (state) => state.darkTheme,
    themeColor: (state) => state.darkTheme ? "dark" : "light"
  },
  actions: {
    setTheme() {
      this.darkTheme = !this.darkTheme;
    }
  }
})
