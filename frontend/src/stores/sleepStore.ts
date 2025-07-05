import { defineStore } from 'pinia'
import type { SleepRecord } from '@/types/sleep'

export const useSleepStore = defineStore('sleep', {
  state: () => ({
    sleepData: [] as SleepRecord[],
  }),
  actions: {
    setSleepData(data: SleepRecord[]) {
      this.sleepData = data
      localStorage.setItem('sleepData', JSON.stringify(data))
    },
    loadFromStorage() {
      const saved = localStorage.getItem('sleepData')
      if (saved) {
        this.sleepData = JSON.parse(saved)
      }
    },
  },
})
