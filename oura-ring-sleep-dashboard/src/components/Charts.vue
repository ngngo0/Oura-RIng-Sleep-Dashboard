<template>
    <div>
        <div class="charts-controls">
            <button @click="addChart" class="btn btn-secondary" >
                Add Chart
            </button>
            <button @click="removeChart" class="btn btn-secondary" :disabled="charts.length === 1">
                Remove Chart
            </button>
        </div>

        <div class="charts-container">
            <div v-for="chart in charts" :key="chart.id" class="chart-wrapper">
                <VegaComponent :fromDate="fromDate" :toDate="toDate" :selectedRing="selectedRing"/>
            </div>
        </div>

    </div>
</template>

<script>
import VegaComponent from '@/components/VegaChart.vue';

export default {
    name: 'Charts',
    components: { VegaComponent },
    props: {
        fromDate: { type: String, required: false },
        toDate: { type: String, required: false },
        selectedRing: { type: String, required: false },
    },
    data() {
        return {
            charts: [
                { id: 1 }
            ]
        };
    },
    methods: {
        addChart() {
            const newId = this.charts.length ? Math.max(...this.charts.map(c => c.id)) + 1 : 1;
            this.charts.push({ id: newId});
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
  background-color:  #28a745;
  color: white;
  margin-bottom: 1rem;
}

.btn-secondary:hover {
  background-color: #1e7e34;
}

.btn:disabled {
  background: #E8E8E8;
  color: #999;
  cursor: not-allowed;
  border: 1px solid #D0D0D0;
}

.btn-green {
  background-color: #28a745;
  color: white;
}

.btn-green:hover:not(:disabled) {
  background-color: #1e7e34;
}

</style>
