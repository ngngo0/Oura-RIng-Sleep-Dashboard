<template>
    <canvas ref="chartRef"></canvas>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useSleepStore } from '@/stores/sleepStore'
import { Chart, registerables } from 'chart.js'
import type { ChartConfiguration, ChartType } from 'chart.js'
import ChartJsToImage from 'chartjs-to-image';


const props = defineProps<{
    chartType: ChartType,
    metric: 'rem' | 'deep' | 'total' | 'score'
}>()

Chart.register(...registerables)
const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null

const sleepStore = useSleepStore()

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
    const labels = sleepStore.sleepData.map(r => r.day)
    const data = sleepStore.sleepData.map(r => getMetricData(props.metric, r))

    return {
        type,
        data: {
            labels,
            datasets: [{
                label: getMetricLabel(props.metric),
                data,
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.3,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: props.metric === 'score' ? 'Score' : 'Minutes'
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
    }
}

onMounted(() => {
    if (chartRef.value) {
        chartInstance = new Chart(chartRef.value, createChartConfig(props.chartType))
    }
})

// Watch for sleepData changes
watch(() => sleepStore.sleepData, () => {
    if (!chartInstance) return
    chartInstance.data.labels = sleepStore.sleepData.map(r => r.day)
    chartInstance.data.datasets[0].data = sleepStore.sleepData.map(r => getMetricData(props.metric, r))
    chartInstance.update()
}, { deep: true })

// Watch for metric or chartType changes
watch(() => [props.metric, props.chartType], () => {
    if (chartRef.value && chartInstance) {
        chartInstance.destroy()
        chartInstance = new Chart(chartRef.value, createChartConfig(props.chartType))
    }
})
</script>
