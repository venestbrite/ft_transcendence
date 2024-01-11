import Vue from 'vue'

declare module 'vue' {
  interface ComponentCustomProperties {
    $appState: { theme: string, darkTheme: boolean }
    $primevue: any
  }
}