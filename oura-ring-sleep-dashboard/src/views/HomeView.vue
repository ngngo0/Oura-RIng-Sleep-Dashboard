<template>
  <main>
    <!-- <TheWelcome /> -->
    <h1>Main Dashboard</h1>
    <form v-on:submit.prevent>
      <select v-model="selectedRing">
        <option value="all" selected> All Rings</option>
        <option v-for="ring in allRingData" v-key="ring.apiId">{{ ring.nickname }}</option>
      </select>
      <input id="fromDate" v-model="fromDate" type="date">
      <span> - </span>
      <input id="toDate" v-model="toDate" type="date" max="">
      <input type="submit" value="Send Request Sand" @click="formSubmit('sandbox')">
      <input type="submit" value="Send Request User" @click="formSubmit('user')">

    </form>
    <pre id="message"></pre>
    <button @click="getPersonalInfo">Get Personal Info</button>
    <pre id="personalInfo"></pre>
    <div>
      <button 
        @click="showModal = true" 
        :disabled="!sleepData || sleepData.length === 0" 
        :title="(!jsonData || jsonData.length === 0) ? 'Generate a CSV to enable export' : ''"
      >
        Export CSV
      </button>
      <CsvExportModal v-if="showModal" :jsonData="sleepData" @close="showModal = false" />
    </div>

  </main>
</template>
<style scoped>
  #message{
    max-height: 30vh;
    overflow-y:auto;
    max-width: 50vw;
  }
  button, input[type="submit"] {
  cursor: pointer;
  }
</style>
<script>
import CsvExportModal from './CsvExportModal.vue';

export default {
  components: { CsvExportModal },
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
      showModal: false
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

        document.getElementById('personalInfo').textContent = JSON.stringify(data, null, 2);
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