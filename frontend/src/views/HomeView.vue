<template>
  <main class="dashboard-container">
    <h1>Main Dashboard</h1>

    <form @submit.prevent class="filter-form">
      <select v-model="selectedRing" class="input-select">
        <option disabled value="">Select a Ring</option>
        <option
          v-for="ring in allRingData"
          :key="ring.id"
          :value="ring"
          :disabled="!ring.PAT"
        >
          {{ ring.nickname }} <span v-if="!ring.PAT">(no PAT)</span>
        </option>
      </select>

      <div class="date-inputs">
        <input id="fromDate" v-model="fromDate" type="date" class="input-date" />
        <span class="date-separator">–</span>
        <input id="toDate" v-model="toDate" type="date" class="input-date" />
      </div>

      <div class="form-buttons">
        <input
          type="submit"
          value="Send Request Sand"
          @click="formSubmit('sandbox')"
          class="btn btn-primary"
        />
        <input
          type="submit"
          value="Send Request User"
          @click="formSubmit('user')"
          class="btn btn-primary"
        />
      </div>
    </form>
    <div class="action-buttons">
      <label>
        <button @click="showResults = !showResults" type="button" class="btn btn-toggle">
          {{ showResults ? 'Hide' : 'Show' }} Results
        </button>
      </label>
      <pre id="message" class="message-area" v-show="showResults">{{ rawJsonMsg }}</pre>

      <button @click="togglePersonalInfo" class="btn btn-toggle">
        {{ showPersonalInfo ? 'Hide' : 'Get' }} Personal Info
      </button>
      <pre id="personalInfo" class="info-area" v-if="showPersonalInfo && personalInfo">{{
        personalInfo
      }}</pre>
    </div>

    <div class="export-buttons">
      <button
        @click="showModal = true"
        :disabled="!sleepData || sleepData.length === 0"
        :title="!sleepData || sleepData.length === 0 ? 'Generate data to enable export' : ''"
        class="btn btn-export"
      >
        Export CSV
      </button>

      <CsvExportModal
        v-if="showModal"
        :jsonData="sleepData"
        :toDate="toDate"
        :fromDate="fromDate"
        :selectedRing="ringNick"
        @close="showModal = false"
      />

      <button
        @click="showJsonModal = true"
        :disabled="!sleepData || sleepData.length === 0"
        :title="!sleepData || sleepData.length === 0 ? 'Generate data to enable export' : ''"
        class="btn btn-export"
      >
        Export JSON
      </button>

      <JsonExportModal
        v-if="showJsonModal"
        :jsonData="sleepData"
        :toDate="toDate"
        :fromDate="fromDate"
        :selectedRing="ringNick"
        @close="showJsonModal = false"
      />
    </div>

    <ChartsComponent
      v-if="showChart"
      :toDate="toDate"
      :fromDate="fromDate"
      :selectedRing="ringNick"
    />
  </main>
</template>

<script>
import CsvExportModal from './CsvExportModal.vue'
import JsonExportModal from './JsonExportModal.vue'

// For charts
import { useSleepStore } from '@/stores/sleepStore'
import ChartsComponent from '@/components/Charts.vue'

// For fetching users
import axios from 'axios'
import { useToastStore } from '@/stores/toast'

export default {
  components: { CsvExportModal, JsonExportModal, ChartsComponent },
  setup() {
    const sleepStore = useSleepStore()
    return { sleepStore }
  },
  data() {
    return {
      fromDate: '2025-04-18',
      selectedRing: null,
      allRingData: [
        { nickname: 'Ring1', email: 'aaaaaa@gmail.com', notes: '', apiId: 1 },
        { nickname: 'Ring2', email: 'bbbbbb@gmail.com', notes: '', apiId: 2 },
      ],
      sleepData: [], // Load this from your API or static JSON
      showModal: false,
      showJsonModal: false,

      // chart variables
      showChart: false, // controls chart display
      selectedMetric: 'rem', // default metric
      charts: [{ id: 1, metric: 'rem' }],

      showResults: false, // toggle show results
      showPersonalInfo: false, //toggle personal info
      rawJsonMsg: '', // json msg
      personalInfo: '',
    }
  },
  methods: {
    async fetchUsers() {
      const toast = useToastStore()
      try {
        // Make a GET request to the Express API
        const response = await axios.get('http://localhost:3000/users')
        this.allRingData = response.data

        const savedRingId = localStorage.getItem('selectedRingId')
        if (savedRingId) {
          const match = this.allRingData.find(r => r.id === parseInt(savedRingId))
          if (match) {
            this.selectedRing = match
          }
        }

      } catch (error) {
        console.error('Error fetching users:', error)
        toast.show('Failed to fetch users.', 'error')
      }
    },
    async formSubmit(reqType) {
      const toast = useToastStore()

      let url =
        reqType === 'sandbox'
          ? 'http://127.0.0.1:3000/api/getSleepDataSand'
          : 'http://127.0.0.1:3000/api/getSleepData'
      const queryParams = []

      const ringId = this.selectedRing?.id
      console.log(this.selectedRing)
      if (!ringId) {
        toast.show('No ring selected','error')
        return
      }
      queryParams.push(`ring_id=${encodeURIComponent(ringId)}`)

      if (this.fromDate) {
        queryParams.push(`start_date=${encodeURIComponent(this.fromDate)}`)
      }

      if (this.toDate) {
        queryParams.push(`end_date=${encodeURIComponent(this.toDate)}`)
      }

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&')
      }
      try {
        const response = await fetch(url)
        this.sleepData = await response.json()

        this.sleepStore.setSleepData(this.sleepData) // Update the Pinia sleep store
        this.showChart = true // Show the chart component
        this.rawJsonMsg = JSON.stringify(this.sleepData, null, 2)
        localStorage.setItem('sleepData', JSON.stringify(this.sleepData))
      } catch (error) {
        console.error('Error fetching sleep data:', error)
        toast.show('Error fetching sleep data:', 'error')
        this.rawJsonMsg = 'Error fetching data'
        this.sleepData = []
        this.showChart = false
      }
    },
    async getPersonalInfo() {
      let url = 'http://127.0.0.1:3000/api/getPersonalInfo'
      url += `?ring_id=${ encodeURIComponent(this.selectedRing?.id) }`
      try {
        const response = await fetch(url)
        const data = await response.json()

        this.personalInfo = JSON.stringify(data, null, 2)
      } catch (error) {
        console.error('Error fetching personal info:', error)
        toast.show('Error fetching personal info. Click Show Personal Info again.', 'error')
      }
    },
    async togglePersonalInfo() {
      this.showPersonalInfo = !this.showPersonalInfo

      if (this.showPersonalInfo && !this.personalInfo) {
        await this.getPersonalInfo()
      }
    },
    exportCsv() {
      // Extract headers (all unique keys, including nested keys flattened)
      const flatten = (obj, prefix = '') =>
        Object.keys(obj).reduce((acc, k) => {
          const pre = prefix.length ? prefix + '.' : ''
          if (typeof obj[k] === 'object' && obj[k] !== null) {
            Object.assign(acc, flatten(obj[k], pre + k))
          } else {
            acc[pre + k] = obj[k]
          }
          return acc
        }, {})

      // Flatten all objects and get all unique headers
      const flatData = this.sleepData.map((item) => flatten(item))
      const headers = [...new Set(flatData.flatMap((item) => Object.keys(item)))]

      // Build CSV string
      const csvRows = []
      csvRows.push(headers.join(',')) // header row

      flatData.forEach((item) => {
        const row = headers.map((field) => {
          const val = item[field] !== undefined ? item[field] : ''
          return `"${String(val).replace(/"/g, '""')}"` // escape quotes
        })
        csvRows.push(row.join(','))
      })

      const csvString = csvRows.join('\n')

      // Download CSV
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      link.href = URL.createObjectURL(blob)
      link.setAttribute('download', 'data.csv')
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    },
    addChart() {
      const newId = this.charts.length ? Math.max(...this.charts.map((c) => c.id)) + 1 : 1
      this.charts.push({ id: newId, metric: 'rem' })
    },
    removeChart() {
      if (this.charts.length > 1) {
        this.charts.pop()
      }
    },
  },
  mounted() {
    this.fetchUsers()
    this.sleepStore.loadFromStorage()

    if (Array.isArray(this.sleepStore.sleepData) && this.sleepStore.sleepData.length > 0) {
      this.sleepData = this.sleepStore.sleepData
      this.rawJsonMsg = JSON.stringify(this.sleepData, null, 2)
      this.showChart = true
    }
  },
  computed: {
    toDate() {
      return new Date().toISOString().slice(0, 10)
    },
    ringNick() {
      return this.selectedRing?.nickname || '';
    }
  },
  watch: {
    selectedRing(newVal) {
      if (newVal && newVal.id != null) {
        localStorage.setItem('selectedRingId', newVal.id);
      } else {
        localStorage.removeItem('selectedRingId'); // Optional: clear when no ring selected
      }
    }

  },
}
</script>

<style scoped>
.input-select option:disabled {
  color: #9ca3af; /* Tailwind gray-400 */
  background-color: #f3f4f6; /* Tailwind gray-100 */
}

.dashboard-container {
  margin: 2rem auto;
  padding: 1rem 2rem;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  color: #333;
}

h1 {
  text-align: center;
  margin-bottom: 1.5rem;
  font-weight: 700;
  font-size: 2rem;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}

.input-select {
  padding: 0.5rem 0.75rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
  min-width: 150px;
}

.date-inputs {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.input-date {
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border-radius: 5px;
  border: 1px solid #ccc;
}

.date-separator {
  font-weight: 600;
  font-size: 1.25rem;
  color: #555;
}

.form-buttons {
  display: flex;
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
  background: #e8e8e8;
  color: #999;
  cursor: not-allowed;
  border: 1px solid #d0d0d0;
}

.message-area,
.info-area {
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 6px;
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
  font-family: monospace;
  color: #444;
  max-height: 40vh;
  max-width: 60vw;
  overflow-y: auto;
}

.export-buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-export {
  background-color: #28a745;
  color: white;
}

.btn-export:hover:not(:disabled) {
  background-color: #1e7e34;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}

.btn-toggle {
  background-color: #dee2e6;
  color: #333;
  border: 1px solid #ccc;
}

.btn-toggle:hover {
  background-color: #cfd4d8;
}

/* Chart css*/

.charts-container {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  margin-top: 2rem;
}

.chart-wrapper {
  width: 400px;
}

.charts-controls {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  margin-bottom: 2rem;
}
</style>
