import { defineStore } from 'pinia'
import type { SleepRecord } from '@/types/sleep'

export const useSleepStore = defineStore('sleep', {
  state: () => ({
    sleepData: [] as SleepRecord[],
  }),
  actions: {
    setSleepData(data: SleepRecord[]) {
      this.sleepData = data
    }
  }
})
