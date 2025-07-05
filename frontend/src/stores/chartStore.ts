import { defineStore } from 'pinia'

export const useChartStore = defineStore('chart', {
  state: () => ({
    labels: [] as string[],
    data: [] as number[],
  }),
  actions: {
    updateChart(labels: string[], data: number[]) {
      this.labels = labels
      this.data = data
    },
  },
})
