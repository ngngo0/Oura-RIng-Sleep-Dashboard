<template>
    <div class="modal-overlay" @click.self="$emit('close')">
        <div class="modal-content">
            <h2>JSON Preview</h2>

            <section class="content-wrapper">
                <!-- JSON Preview -->
                <div class="json-rows">
                    <div v-for="(row, index) in filteredData" :key="row.id || index"
                        :class="{ 'highlight-flash': flashingRowIndex === index }">
                        <pre>{{ JSON.stringify(row, null, 2) }}</pre>
                    </div>
                </div>

                <!-- Toggles + Filename -->
                <div class="column-toggles">
                    <!-- Filename input -->
                    <div class="filename-input-group">
                        <label for="filename-input">Filename:</label>
                        <div class="filename-wrapper">
                            <input id="filename-input" type="text" v-model="filename" placeholder="e.g. sleep-data" />
                            <span class="extension">.json</span>
                        </div>
                    </div>

                    <!-- Column toggles -->
                    <h3>Toggle Fields</h3>
                    <div v-for="col in columns" :key="col" class="toggle-item">
                        <label>
                            <input type="checkbox" :checked="visibleColumns.includes(col)"
                                @change="toggleColumn(col, $event.target.checked)" />
                            {{ col }}
                        </label>
                    </div>
                </div>
            </section>

            <div class="modal-buttons">
                <button @click="exportJson" :disabled="!filteredData.length || !filename.trim()">
                    Download JSON
                </button>
                <button @click="$emit('close')">Close</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        jsonData: {
            type: Array,
            required: true,
        },
    },
    data() {
        return {
            filename: "sleep-data",
            visibleColumns: [],
            flashingRowIndex: null,
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
    },
    watch: {
        jsonData: {
            immediate: true,
            handler(newData, oldData) {
                if (!oldData || !oldData.length) {
                    // First load: initialize visibleColumns with all keys of first row if any
                    if (newData.length) {
                        this.visibleColumns = Object.keys(newData[0]);
                    }
                    return;
                }

                // flashing added rows
                const oldIds = new Set(oldData.map(r => r.id));
                const addedIndex = newData.findIndex(r => !oldIds.has(r.id));

                if (addedIndex !== -1) {
                    this.flashingRowIndex = addedIndex;
                    setTimeout(() => {
                        this.flashingRowIndex = null;
                    }, 1500);
                }
            },
        },
    },

    methods: {
        toggleColumn(col, checked) {
            if (checked) {
                if (!this.visibleColumns.includes(col)) {
                    const originalIndex = this.columns.indexOf(col);
                    const newVisible = [...this.visibleColumns];
                    let insertAt = newVisible.findIndex(
                        (c) => this.columns.indexOf(c) > originalIndex
                    );
                    if (insertAt === -1) insertAt = newVisible.length;
                    newVisible.splice(insertAt, 0, col);
                    this.visibleColumns = newVisible;

                    // Flash the first row as an example when column is re-added
                    this.flashingRowIndex = 0;

                    // Clear flash after 1.5 seconds
                    setTimeout(() => {
                        this.flashingRowIndex = null;
                    }, 1500);
                }
            } else {
                this.visibleColumns = this.visibleColumns.filter((c) => c !== col);
            }
        },
        exportJson() {
            const fullFilename = this.filename.trim() + ".json";
            const blob = new Blob([JSON.stringify(this.filteredData, null, 2)], {
                type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", fullFilename);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        },
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

.content-wrapper {
    display: flex;
    gap: 1.5rem;
    flex-grow: 1;
    overflow: hidden;
    min-width: 0;
}

.json-rows {
    flex-grow: 1;
    overflow: auto;
    border: 1px solid #ddd;
    border-radius: 4px;
    background: #f9f9f9;
    padding: 1rem;
    font-family: monospace;
    white-space: pre-wrap;
    word-wrap: break-word;
    min-width: 300px;
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
        background-color: #d6e9ff;
        /* very light blue */
    }

    100% {
        background-color: transparent;
    }
}

.highlight-flash {
    animation: subtleFlash 1.5s ease forwards;
}
</style>
