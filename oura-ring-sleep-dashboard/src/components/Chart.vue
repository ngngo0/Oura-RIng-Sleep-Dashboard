<template>
    <button @click="showExportModal = true" class="btn btn-export">
      Export Chart
    </button>

    <ChartExportModal
      v-if="showExportModal"
      :canvasRef="chartRef"
      :defaultFilename="defaultFilename"
      :chartConfig="chartConfig"
      @close="showExportModal = false"
    />

    <div class="metric-selector">
      <label v-for="metric in ['rem', 'deep', 'total', 'score']" :key="metric">
        <input
          type="checkbox"
          :value="metric"
          v-model="selectedMetrics"
        />
        {{ getMetricLabel(metric) }}
      </label>
    </div>
    <canvas ref="chartRef"></canvas>
</template>
<style scoped>
.metric-selector {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

</style>
<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSleepStore } from '@/stores/sleepStore'
import { Chart, registerables } from 'chart.js'
import type { ChartConfiguration, ChartType } from 'chart.js'

import ChartExportModal from './ChartExportModal.vue'

const props = defineProps<{
    chartType: ChartType,
    metric: 'rem' | 'deep' | 'total' | 'score'
}>()

Chart.register(...registerables)
const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const selectedMetrics = ref<string[]>(['rem'])

const sleepStore = useSleepStore()

// chart config 
const chartConfig = ref<ChartConfiguration | null>(null)

// Modal visibility
const showExportModal = ref(false)

// Default filename for export
const defaultFilename = ref(`my-chart-${new Date().toISOString().slice(0, 10)}`)

function getMetricData(metric: string, record: any): number {
    switch (metric) {
        case 'rem': return record.rem_sleep_duration / 60
        case 'deep': return record.deep_sleep_duration / 60
        case 'total': return record.total_sleep_duration / 60
        case 'score': return record.score
        default: return 0
    }
}

function getMetricLabel(metric: string): string {
    switch (metric) {
        case 'rem': return 'REM Sleep (minutes)'
        case 'deep': return 'Deep Sleep (minutes)'
        case 'total': return 'Total Sleep (minutes)'
        case 'score': return 'Sleep Score'
        default: return ''
    }
}

function createChartConfig(type: ChartType): ChartConfiguration {
    const labels = sleepStore.sleepData.map(r => r.day);

    const colors: Record<string, { border: string, background: string }> = {
        rem: { border: 'rgba(75, 192, 192, 1)', background: 'rgba(75, 192, 192, 0.2)' },
        deep: { border: 'rgba(54, 162, 235, 1)', background: 'rgba(54, 162, 235, 0.2)' },
        total: { border: 'rgba(255, 206, 86, 1)', background: 'rgba(255, 206, 86, 0.2)' },
        score: { border: 'rgba(255, 99, 132, 1)', background: 'rgba(255, 99, 132, 0.2)' },
    };

    const datasets = selectedMetrics.value.map(metric => ({
        label: getMetricLabel(metric),
        data: sleepStore.sleepData.map(r => getMetricData(metric, r)),
        borderColor: colors[metric].border,
        backgroundColor: colors[metric].background,
        fill: true,
        tension: 0.3,
        pointRadius: 3
    }));

    return {
        type,
        data: {
            labels,
            datasets,
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Minutes / Score'
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date'
                    }
                }
            }
        }
    };
}

onMounted(() => {
    if (chartRef.value) {
        chartConfig.value = createChartConfig(props.chartType)
        chartInstance = new Chart(chartRef.value, chartConfig.value)
    }
})

// Watch for sleepData changes
watch(() => sleepStore.sleepData, () => {
    if (!chartInstance) return
    chartInstance.data.labels = sleepStore.sleepData.map(r => r.day)
    chartInstance.data.datasets = selectedMetrics.value.map(metric => ({
        label: getMetricLabel(metric),
        data: sleepStore.sleepData.map(r => getMetricData(metric, r)),
        borderColor: chartInstance?.data.datasets.find(ds => ds.label === getMetricLabel(metric))?.borderColor || 'rgba(75, 192, 192, 1)',
        backgroundColor: chartInstance?.data.datasets.find(ds => ds.label === getMetricLabel(metric))?.backgroundColor || 'rgba(75, 192, 192, 0.2)',
        fill: true,
        tension: 0.3,
        pointRadius: 3
    }))
    chartInstance.update()
}, { deep: true })

// Watch for when the selected metrics change
watch(selectedMetrics, () => {
    if (chartRef.value && chartInstance) {
        chartInstance.destroy();
        chartInstance = new Chart(chartRef.value, createChartConfig(props.chartType));
    }
}, { deep: true })

// Watch for metric or chartType changes
watch(() => [props.metric, props.chartType], () => {
    if (chartRef.value && chartInstance) {
        chartInstance.destroy()
        chartInstance = new Chart(chartRef.value, createChartConfig(props.chartType))
    }
})
</script>