<template>
  <main class="dashboard-container">
    <h1>Main Dashboard</h1>

    <form @submit.prevent class="filter-form">
      <select v-model="selectedRing" class="input-select">
        <option value="all" selected>All Rings</option>
        <option v-for="ring in allRingData" :key="ring.apiId">{{ ring.nickname }}</option>
      </select>

      <div class="date-inputs">
        <input id="fromDate" v-model="fromDate" type="date" class="input-date" />
        <span class="date-separator">–</span>
        <input id="toDate" v-model="toDate" type="date" class="input-date" />
      </div>

      <div class="form-buttons">
        <input type="submit" value="Send Request Sand" @click="formSubmit('sandbox')" class="btn btn-primary" />
        <input type="submit" value="Send Request User" @click="formSubmit('user')" class="btn btn-primary" />
      </div>
    </form>

    <pre id="message" class="message-area"></pre>

    <button @click="getPersonalInfo" class="btn btn-secondary">
      Get Personal Info
    </button>
    <pre id="personalInfo" class="info-area" v-if="personalInfo">{{ personalInfo }}</pre>

    <div class="export-buttons">
      <button @click="showModal = true" :disabled="!sleepData || sleepData.length === 0"
        :title="(!sleepData || sleepData.length === 0) ? 'Generate data to enable export' : ''" class="btn btn-export">
        Export CSV
      </button>

      <CsvExportModal v-if="showModal" :jsonData="sleepData" @close="showModal = false" />

      <button @click="showJsonModal = true" :disabled="!sleepData || sleepData.length === 0"
        :title="(!sleepData || sleepData.length === 0) ? 'Generate data to enable export' : ''" class="btn btn-export">
        Export JSON
      </button>

      <JsonExportModal v-if="showJsonModal" :jsonData="sleepData" @close="showJsonModal = false" />
    </div>
  </main>
</template>
<style scoped>
.dashboard-container {
  max-width: 900px;
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
  background-color: #c0c0c0;
  cursor: not-allowed;
}

.message-area,
.info-area {
  background-color: #f4f4f4;
  padding: 1rem;
  border-radius: 6px;
  min-height: 4rem;
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
  font-family: monospace;
  color: #444;
  max-height: 40vh;
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
</style>
<script>
import CsvExportModal from './CsvExportModal.vue';
import JsonExportModal from './JsonExportModal.vue';

export default {
  components: { CsvExportModal, JsonExportModal },
  data() {
    return {
      fromDate: '2025-04-18',
      toDate: '',
      selectedRing: 'all',
      allRingData: [
        { nickname: 'Ring1', email: 'aaaaaa@gmail.com', notes: '', apiId: 1 },
        { nickname: 'Ring2', email: 'bbbbbb@gmail.com', notes: '', apiId: 2 }
      ],
      sleepData: [], // Load this from your API or static JSON
      showModal: false,
      showJsonModal: false,
      personalInfo: '',
    };
  },
  methods: {
    async formSubmit(reqType) {
      let url = reqType ==='sandbox' ? 'http://127.0.0.1:3000/api/getSleepDataSand': 'http://127.0.0.1:3000/api/getSleepData' ;
      const queryParams = [];

      if (this.fromDate) {
        queryParams.push(`start_date=${encodeURIComponent(this.fromDate)}`);
      }

      if (this.toDate) {
        queryParams.push(`end_date=${encodeURIComponent(this.toDate)}`);
      }

      if (queryParams.length > 0) {
        url += '?' + queryParams.join('&');
      }

      try {
        const response = await fetch(url);
        this.sleepData = await response.json();
        //barGraph(data); // assumes barGraph is globally available
        //lineGraph(data); // assumes lineGraph is globally available
        document.getElementById('message').textContent = JSON.stringify(this.sleepData, null, 2);
      } catch (error) {
        console.error('Error fetching sleep data:', error);
      }
    },
    async getPersonalInfo(){
      let url = 'http://127.0.0.1:3000/api/getPersonalInfo';

      try {
        const response = await fetch(url);
        const data = await response.json();

        this.personalInfo = JSON.stringify(data, null, 2);
      } catch (error) {
        console.error('Error fetching personal info:', error);
      }
    },
     exportCsv() {

      // Extract headers (all unique keys, including nested keys flattened)
      const flatten = (obj, prefix = '') =>
        Object.keys(obj).reduce((acc, k) => {
          const pre = prefix.length ? prefix + '.' : '';
          if (typeof obj[k] === 'object' && obj[k] !== null) {
            Object.assign(acc, flatten(obj[k], pre + k));
          } else {
            acc[pre + k] = obj[k];
          }
          return acc;
        }, {});

      // Flatten all objects and get all unique headers
      const flatData = this.sleepData.map(item => flatten(item));
      const headers = [...new Set(flatData.flatMap(item => Object.keys(item)))];

      // Build CSV string
      const csvRows = [];
      csvRows.push(headers.join(',')); // header row

      flatData.forEach(item => {
        const row = headers.map(field => {
          const val = item[field] !== undefined ? item[field] : '';
          return `"${String(val).replace(/"/g, '""')}"`; // escape quotes
        });
        csvRows.push(row.join(','));
      });

      const csvString = csvRows.join('\n');

      // Download CSV
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'data.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
};
</script>