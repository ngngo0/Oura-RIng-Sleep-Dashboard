<template>
    <div>
        <div class="charts-controls">
            <button @click="addChart" class="btn btn-secondary" style="background-color: green;">
                Add Chart
            </button>
            <button @click="removeChart" class="btn btn-secondary" :disabled="charts.length === 1">
                Remove Chart
            </button>
        </div>

        <div class="charts-container">
            <div v-for="chart in charts" :key="chart.id" class="chart-wrapper">
                <label>
                    Select Metric:
                    <select v-model="chart.metric" class="input-select">
                        <option value="rem">REM Sleep</option>
                        <option value="deep">Deep Sleep</option>
                        <option value="total">Total Sleep</option>
                        <option value="score">Sleep Score</option>
                    </select>
                </label>
                <ChartComponent :chartType="chartType" :metric="chart.metric" />
            </div>
        </div>
    </div>
</template>

<script>
import ChartComponent from '@/components/Chart.vue';

export default {
    name: 'Charts',
    components: { ChartComponent },
    props: {
        chartType: {
            type: String,
            default: 'line'
        },
        show: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            charts: [
                { id: 1, metric: 'rem' }
            ]
        };
    },
    methods: {
        addChart() {
            const newId = this.charts.length ? Math.max(...this.charts.map(c => c.id)) + 1 : 1;
            this.charts.push({ id: newId, metric: 'rem' });
        },
        removeChart() {
            if (this.charts.length > 1) {
                this.charts.pop();
            }
        }
    }
};
</script>

<style scoped>
.charts-container {
    display: flex;
    flex-wrap: wrap;
    gap: 2rem;
    justify-content: center;
    margin-top: 2rem;
}

.chart-wrapper {
    width:1000px;
    height:500px;
}

.charts-controls {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
    margin-bottom: 2rem;
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

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
  margin-bottom: 1rem;
}

.btn-secondary:hover {
  background-color: #565e64;
}

.btn:disabled {
  background-color: #c0c0c0;
  cursor: not-allowed;
}

.btn-export {
  background-color: #28a745;
  color: white;
}

.btn-export:hover:not(:disabled) {
  background-color: #1e7e34;
}

</style>
