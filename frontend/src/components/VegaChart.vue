<template>
    <div class="chart-metrics-wrapper">
        <!-- Chart rendering -->
        <div class="chart-container" ref="vis" v-if="sleepStore.sleepData.length"></div>
        <div v-else>No sleep data available.</div>

        <!-- Metric selector on the right -->
        <div class="metrics-section">
            <label v-for="metric in allMetrics" :key="metric" class="metric-label">
                <input type="checkbox" :value="metric" v-model="selectedMetrics" />
                {{ metric }}
            </label>
        </div>
    </div>

    <!-- Input group -->
    <div class="input-group-container">
      <label class="input-group">
        X-Axis Label:
        <input v-model="xAxisLabel" placeholder="e.g., Date" />
      </label>
      <label class="input-group">
        Y-Axis Label:
        <input v-model="yAxisLabel" placeholder="e.g., Minutes Slept" />
      </label>
      <label class="input-group">
        File Name:
        <input v-model="fileName" placeholder="Enter file name" />
      </label>
    </div>

</template>

<style scoped>
.chart-metrics-wrapper {
    display: flex;
    align-items: flex-start;
    gap: 2rem;
    width: 100%;
}

.chart-container {
    flex: 1;
    border: 1px solid #ccc;
}

.metrics-section {
    min-width: 200px;
    padding: 1rem;
    border: 1px solid #ccc;
    border-radius: 8px;
    background-color: #f9f9f9;
}

.metric-label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

/* input grp */
.input-group-container {
  margin-top: 2rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
}

.input-group {
  display: flex;
  flex-direction: column;
  font-size: 0.9rem;
  flex: 1;
  min-width: 200px;
}

.input-group input {
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  outline: none;
}

.input-group input:focus {
  border-color: #007bff;
}

</style>



<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import embed from 'vega-embed';
import { useSleepStore } from '@/stores/sleepStore';

const props = defineProps({
    fromDate: { type: String, required: false },
    toDate: { type: String, required: false },
    selectedRing: { type: String, required: false },
})

const sleepStore = useSleepStore();
sleepStore.loadFromStorage();

const xAxisLabel = ref('Date');
const yAxisLabel = ref('Minutes Slept');

// Editable filename (user can change this)
const fileName = ref('')

// Compute default filename based on props
const defaultFileName = computed(() => {
    const from = props.fromDate || 'start';
    const to = props.toDate || 'end';
    const ringId = props.selectedRing || 'ringId';
    return `${ringId}-${from}-${to}`;
});

const vis = ref(null);

const allMetrics = [
    'deep_sleep_duration',
    'rem_sleep_duration',
    'awake_time',
    'average_heart_rate',
    'average_breath',
    'efficiency',
    'latency',
    'light_sleep_duration',
    'total_sleep_duration'
];
const metricColorMap = {
    deep_sleep_duration: '#1f77b4',
    rem_sleep_duration: '#ff7f0e',
    awake_time: '#2ca02c',
    average_heart_rate: '#d62728',
    average_breath: '#9467bd',
    efficiency: '#8c564b',
    latency: '#e377c2',
    light_sleep_duration: '#7f7f7f',
    total_sleep_duration: '#17becf'
};

const selectedMetrics = ref([
    'deep_sleep_duration',
    'rem_sleep_duration',
    'total_sleep_duration'
]);


const vegaSpec = computed(() => ({
    $schema: 'https://vega.github.io/schema/vega-lite/v6.json',
    description: 'Sleep Metrics Over Time',
    width: 'container',
    data: {
        values: sleepStore.sleepData.length ? sleepStore.sleepData : []
    },
    selection: {
        dateRange: {
            type: 'interval',
            encodings: ['x'], // apply selection to x-axis (time)
            bind: 'scales'    // bind slider to axis
        }
    },
    transform: [
        {
            fold: selectedMetrics.value,
            as: ['metric', 'value']
        },
        {
            calculate: `(indexof(datum.metric, '_duration') == length(datum.metric) - length('_duration')) ? datum.value / 60 : datum.value`,
            as: 'valueAdjusted'
        }
    ],
    mark: 'line',
    encoding: {
        x: {
            field: 'day',
            type: 'temporal',
            title: xAxisLabel.value,
            axis: {
                format: '%b %d',
                labelAngle: -45  
            }
        },
        y: { 
            field: 'valueAdjusted', 
            type: 'quantitative', 
            title: yAxisLabel.value  
        },
        color: {
            field: 'metric',
            type: 'nominal',
            title: 'Metric',
            scale: {
                domain: selectedMetrics.value,
                range: selectedMetrics.value.map(metric => metricColorMap[metric])
            }
        },
        tooltip: [
            { field: 'day', type: 'temporal' },
            { field: 'metric', type: 'nominal' },
            { field: 'valueAdjusted', type: 'quantitative' }
        ]
    }
}));

const chartView = ref(null); // Store the Vega view object

function embedChart() {
    if (vis.value) {
        const plainSpec = JSON.parse(JSON.stringify(vegaSpec.value));
        embed(vis.value, plainSpec, 
            {            
                actions: {
                    export: true,
                    source: false,
                    editor: true,
                    compiled: false,
                    downloadFileName: fileName,
                    renderer: 'svg'
                } 
            })
            .then(({ view }) => {
                chartView.value = view;
            })
            .catch(err => console.error('Vega Embed Error:', err));
    }
}

onMounted(embedChart);

watch([selectedMetrics, xAxisLabel, yAxisLabel], () => {
    if (!chartView.value || !vis.value) return;

    const scrollY = window.scrollY;
    const scrollX = window.scrollX;

    const newSpec = JSON.parse(JSON.stringify(vegaSpec.value));

    embed(vis.value, newSpec,
        {
            actions: {
                export: true,
                source: false,
                editor: true,
                compiled: false,
                downloadFileName: fileName,
                renderer: 'svg'
            }
        })
        .then(({ view }) => {
            chartView.value = view;
            window.scrollTo(scrollX, scrollY);
        })
        .catch(console.error);
});

watch(
    () => [props.selectedRing, props.fromDate, props.toDate],
    () => {
        if (!fileName.value) {
            fileName.value = defaultFileName.value
        }
    },
    { immediate: true }
)
</script>
