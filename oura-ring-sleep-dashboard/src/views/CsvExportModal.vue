<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <h2>CSV Preview</h2>

            <section class="content-wrapper">
                <!-- Table container with scroll -->
                <div class="table-container">
                <table class="csv-table">
                  <thead>
                    <tr>
                      <th
                        v-for="col in visibleColumns"
                        :key="col"
                      >
                        {{ col }}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(row, i) in filteredData" :key="i">
                      <td
                        v-for="col in visibleColumns"
                        :key="col"
                        :class="{ 'highlight-flash': highlightedColumn === col }"
                      >
                        {{ row[col] }}
                      </td>
                    </tr>
                  </tbody>
                </table>
                </div>

                <!-- Column toggles -->
                <div class="column-toggles">
                    <!-- Filename input -->
                    <div class="filename-input-group">
                        <label for="filename-input">Filename:</label>
                        <div class="filename-wrapper">
                            <input id="filename-input" type="text" v-model="filename" placeholder="e.g. sleep-data" />
                            <span class="extension">.csv</span>
                        </div>
                    </div>
                    
                    <!-- Column toggles -->

                    <h3>Toggle Columns</h3>
                    <div v-for="col in columns" :key="col" class="toggle-item">
                      <label>
                        <input
                          type="checkbox"
                          :checked="visibleColumns.includes(col)"
                          @change="toggleColumn(col, $event.target.checked)"
                        />
                        {{ col }}
                      </label>
                    </div>
                </div>
            </section>

            <div class="modal-buttons">
                <button @click="exportCsv" :disabled="!filteredData.length || !filename.trim()">
                    Download CSV
                </button>
                <button @click="$emit('close')">Close</button>
            </div>
        </div>
    </div>
</template>

<script>
import Papa from "papaparse";

export default {
    props: {
        jsonData: {
            type: Array,
            required: true,
        },
        fromDate: { type: String, required: false },
        toDate: { type: String, required: false },
        selectedRing: { type: String, required: false },
    },
    data() {
        return {
            visibleColumns: [],
            highlightedColumn: null,  // track the column to highlight

        };
    },
    computed: {
        columns() {
            if (!this.jsonData.length) return [];
            return Object.keys(this.jsonData[0]);
        },
        filteredData() {
            return this.jsonData.map((row) => {
                const filteredRow = {};
                this.visibleColumns.forEach((col) => {
                    filteredRow[col] = row[col];
                });
                return filteredRow;
            });
        },
        filename() {
            const from = this.fromDate || 'start';
            const to = this.toDate || 'end';
            const ringId = this.selectedRing || 'ringId';
            return `${ringId}-${from}-${to}`;
        }
    },
    watch: {
        jsonData: {
            immediate: true,
            handler(newData) {
                if (newData.length) {
                    this.visibleColumns = Object.keys(newData[0]);
                }
            }
        }, 
        visibleColumns(newVal) {
            console.log("Visible columns:", newVal);
        }
    },
    
    methods: {
        exportCsv() {
            const csv = Papa.unparse(this.filteredData);
            const fullFilename = this.filename.trim() + ".csv";

            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.setAttribute("download", fullFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
        // Model adds the elements to the end, and we want at the same index
        toggleColumn(col, checked) {
            if (checked) {
                if (!this.visibleColumns.includes(col)) {
                    const originalIndex = this.columns.indexOf(col);
                    const newVisible = [...this.visibleColumns];
                    let insertAt = newVisible.findIndex(c => this.columns.indexOf(c) > originalIndex);
                    if (insertAt === -1) insertAt = newVisible.length;
                    newVisible.splice(insertAt, 0, col);
                    this.visibleColumns = newVisible;

                    // Set the highlighted column for flashing
                    this.highlightedColumn = col;

                    // Remove highlight after 1 second
                    setTimeout(() => {
                        this.highlightedColumn = null;
                    }, 1000);
                }
            } else {
                this.visibleColumns = this.visibleColumns.filter(c => c !== col);
            }
        }


    },
};
</script>

<style scoped>
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
}

.modal-content {
    background: white;
    padding: 1.5rem 2rem;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    max-width: 90vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.filename-input-group {
  margin-bottom: 1.5rem;
  display: flex;
  flex-direction: column;
}

.filename-wrapper {
  display: flex;
  align-items: center;
  margin-top: 0.25rem;
}

.filename-wrapper input[type="text"] {
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px 0 0 4px;
  width: 100%;
  outline: none;
}

.filename-wrapper input[type="text"]:focus {
  border-color: #007bff;
}

.extension {
  background-color: #f1f1f1;
  padding: 0.4rem 0.6rem;
  border: 1px solid #ccc;
  border-left: none;
  border-radius: 0 4px 4px 0;
  font-size: 1rem;
  color: #555;
  white-space: nowrap;
}


.content-wrapper {
    display: flex;
    gap: 1.5rem;
    flex-grow: 1;
    overflow: hidden;
    min-width: 0;
}

.table-container {
    flex-grow: 1;
    overflow: auto;
    min-width: 0;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.csv-table {
    border-collapse: collapse;
    width: 100%;
    min-width: 600px;
}

.csv-table thead {
    background-color: #007bff;
    color: white;
    position: sticky;
    top: 0;
    z-index: 2;
}

.csv-table th,
.csv-table td {
    border: 1px solid #ddd;
    padding: 0.5rem 1rem;
    white-space: nowrap;
    word-break: break-word;
    text-align: left;
}

.column-toggles {
    width: 220px;
    flex-shrink: 0;
    overflow-y: auto;
    border-left: 1px solid #ddd;
    padding-left: 1rem;
}

.toggle-item {
    margin-bottom: 0.5rem;
}

.modal-buttons {
    margin-top: 1rem;
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    flex-shrink: 0;
}

button {
    background-color: #007bff;
    border: none;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 600;
    transition: background-color 0.2s ease;
}

button:hover {
    background-color: #0056b3;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

button:last-child {
    background-color: #6c757d;
}

button:last-child:hover {
    background-color: #565e64;
}
@keyframes subtleFlash {
  0% {
    background-color: #d6e9ff; /* very light blue */
  }
  100% {
    background-color: transparent;
  }
}

.highlight-flash {
  animation: subtleFlash 1.5s ease forwards;
}

</style>
