import { defineStore } from 'pinia'

type ToastType = 'success' | 'error' | 'info'

interface ToastState {
  message: string
  type: ToastType
  visible: boolean
  timeoutId: number | null
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    message: '',
    type: 'success',
    visible: false,
    timeoutId: null,
  }),

  actions: {
    show(message: string, type: ToastType = 'success', duration = 3000) {
      this.message = message
      this.type = type
      this.visible = true

      if (this.timeoutId) {
        clearTimeout(this.timeoutId)
      }

      this.timeoutId = window.setTimeout(() => {
        this.visible = false
        this.timeoutId = null
      }, duration)
    },
  },
})
