<!-- ChartExportModal.vue -->
<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <h2>Export Chart</h2>

            <div class="export-options">
                <label>
                    Filename:
                    <input v-model="filename" placeholder="e.g. sleep-chart" />
                </label>

                <label>
                    Format:
                    <select v-model="format">
                        <option value="png">PNG</option>
                        <option value="pdf">PDF</option>
                        <option value="svg">SVG</option>
                    </select>
                </label>
            </div>

            <div class="modal-buttons">
                <button @click="exportChart" :disabled="!filename.trim()">Download</button>
                <button @click="$emit('close')">Cancel</button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import jsPDF from 'jspdf'
import C2S from 'canvas-to-svg'
import { Chart } from 'chart.js'
import type { ChartConfiguration } from 'chart.js'

const props = defineProps<{
    canvasRef: HTMLCanvasElement | null,
    defaultFilename: string,
    chartConfig: ChartConfiguration
}>()

const emit = defineEmits(['close'])
const filename = ref(props.defaultFilename)
const format = ref<'png' | 'pdf' | 'svg'>('png')

function downloadUrl(url: string, name: string) {
    const a = document.createElement('a')
    a.href = url
    a.download = name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

function exportChartToSVG(config: ChartConfiguration, filename: string) {
    if (!config || !config.options) return

    const width = 800
    const height = 400
    const ctx = new C2S(width, height)

    try {
        new Chart(ctx as any, {
            ...config,
            options: {
                ...config.options,
                responsive: false,
                animation: false,
            },
            plugins: []  // Disable plugins that may rely on real DOM
        })

        setTimeout(() => {
            const svg = ctx.getSerializedSvg()
            const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
            const url = URL.createObjectURL(blob)
            downloadUrl(url, filename.endsWith('.svg') ? filename : `${filename}.svg`)
            URL.revokeObjectURL(url)
        }, 100)
    } catch (err) {
        console.error('Failed to export chart to SVG:', err)
    }
}


function exportChart() {
    const name = filename.value.trim() || 'chart'

    if (format.value === 'png' && props.canvasRef) {
        const url = props.canvasRef.toDataURL('image/png')
        downloadUrl(url, name + '.png')
    } else if (format.value === 'pdf' && props.canvasRef) {
        const url = props.canvasRef.toDataURL('image/png')
        const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [props.canvasRef.width, props.canvasRef.height] })
        pdf.addImage(url, 'PNG', 0, 0, props.canvasRef.width, props.canvasRef.height)
        pdf.save(name + '.pdf')
    } else if (format.value === 'svg') {
        exportChartToSVG(props.chartConfig, name)
    }

    emit('close')
}
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content {
    background: white;
    border-radius: 8px;
    padding: 1.5rem;
    width: 320px;
    box-sizing: border-box;
}

.content-wrapper {
    margin-top: 1rem;
    margin-bottom: 1.5rem;
}

.filename-input-group {
    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
}

.filename-wrapper {
    display: flex;
    align-items: center;
}

.filename-wrapper input {
    flex-grow: 1;
    padding: 0.4rem 0.6rem;
    font-size: 1rem;
    border: 1px solid #ccc;
    border-radius: 4px 0 0 4px;
    outline-offset: 1px;
}

.filename-wrapper .extension {
    background: #e9ecef;
    padding: 0.4rem 0.6rem;
    border: 1px solid #ccc;
    border-left: none;
    border-radius: 0 4px 4px 0;
    font-family: monospace;
    user-select: none;
}

.modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

.btn {
    cursor: pointer;
    font-weight: 600;
    border-radius: 5px;
    border: none;
    padding: 0.5rem 1.25rem;
    transition: background-color 0.3s ease;
    user-select: none;
}

.btn-export {
    background-color: #28a745;
    color: white;
}

.btn-export:hover:not(:disabled) {
    background-color: #1e7e34;
}

.btn-export:disabled {
    background-color: #c0c0c0;
    cursor: not-allowed;
}

.btn-secondary {
    background-color: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background-color: #565e64;
}</style>
