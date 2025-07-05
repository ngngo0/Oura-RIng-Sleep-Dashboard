<template>
  <section class="settings">
    <div class="split-container">
      <!-- User List Panel -->
      <div class="user-list-panel">
        <div class="panel-header">
          <h3>Rings</h3>
        </div>
        <ul class="user-list">
          <li
            v-for="user in users"
            :key="user.id"
            class="user-item"
            :class="{ selected: selectedUser && selectedUser.id === user.id }"
            @click="selectUser(user)"
          >
            <div class="user-avatar">
              {{ user.nickname.charAt(0).toUpperCase() }}
            </div>
            <div class="user-info">
              <p class="user-nickname">{{ user.nickname }}</p>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- User Details Panel -->
      <div class="user-details-panel">
        <div v-if="!selectedUser" class="no-selection">
          <p>Select a user to view details</p>
        </div>

        <div v-else class="user-details">
          <div class="details-header">
            <div class="user-header-info">
              <div class="large-avatar">
                {{ selectedUser.nickname.charAt(0).toUpperCase() }}
              </div>
              <h2>{{ selectedUser.nickname }}</h2>
            </div>
            <button type="button" class="edit-toggle-btn" @click="toggleEdit">
              {{ isEditing ? 'Cancel' : 'Edit' }}
            </button>
          </div>

          <div class="details-content">
            <form v-if="isEditing" @submit.prevent="updateUser(selectedUser)">
              <div class="form-field">
                <label for="PAT">PAT:</label>
                <input id="PAT" type="text" v-model="selectedUser.PAT" />
              </div>

              <div class="form-field">
                <label for="nickname">Nickname:</label>
                <input id="nickname" type="text" v-model="selectedUser.nickname" />
              </div>

              <div class="form-field">
                <label for="email">Email:</label>
                <input id="email" type="email" v-model="selectedUser.email" />
              </div>

              <div class="form-field">
                <label for="notes">Notes:</label>
                <textarea id="notes" v-model="selectedUser.notes"></textarea>
              </div>

              <div class="form-actions">
                <button type="submit" class="save-btn">Save Changes</button>
              </div>
            </form>

            <div v-else>
              <div class="form-field">
                <label>PAT:</label>
                <p class="field-value">{{ selectedUser.PAT || 'Not set' }}</p>
              </div>

              <div class="form-field">
                <label>Nickname:</label>
                <p class="field-value">{{ selectedUser.nickname }}</p>
              </div>

              <div class="form-field">
                <label>Email:</label>
                <p class="field-value">{{ selectedUser.email }}</p>
              </div>

              <div class="form-field">
                <label>Notes:</label>
                <p class="field-value">{{ selectedUser.notes || 'No notes' }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import '/src/assets/base.css';

.split-container {
  display: flex;
  height: 90vh;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
}

/* User List Panel */
.user-list-panel {
  width: 33.333%;
  border-right: 1px solid #e5e7eb;
  display: flex;
  flex-direction: column;
}

.panel-header {
  padding: 1.5rem;
  background: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
}

.panel-header h3 {
  margin: 0;
  font-weight: 600;
  color: #374151;
}

.user-list {
  list-style: none;
  padding: 0;
  margin: 0;
  flex: 1;
  overflow-y: auto;
}

.user-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
  border-bottom: 1px solid #f3f4f6;
}

.user-item:hover {
  background: #f9fafb;
}

.user-item.selected {
  background: var(--vt-c-primary-lightest);
  border-right: 3px solid var(--color-primary);
}

.user-avatar {
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-right: 0.75rem;
  flex-shrink: 0;
}

.user-info {
  flex: 1;
  min-width: 0;
}

.user-nickname {
  margin: 0 0 0.25rem 0;
  font-weight: 600;
  color: #374151;
  font-size: 1rem;
}

.user-email {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* User Details Panel */
.user-details-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.no-selection {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #6b7280;
  font-style: italic;
}

.user-details {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.details-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.user-header-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.large-avatar {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: var(--color-primary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1.25rem;
}

.details-header h2 {
  margin: 0;
  color: #374151;
  font-size: 1.25rem;
}

.edit-toggle-btn {
  padding: 0.5rem 1rem;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
}

.edit-toggle-btn:hover {
  background: var(--btn-primary-hover);
}

.details-content {
  width: 70vw;
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

/* Unified Field Styles */
.form-field {
  margin-bottom: 1.5rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #374151;
  font-size: 0.875rem;
}

.form-field input,
.form-field textarea,
.form-field .field-value {
  overflow: auto;
  margin: 0;
  width: 100%;
  font-size: 0.875rem;
  font-family: inherit;
  font-weight: 400;
  line-height: 1.6;
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  box-sizing: border-box;
}

.form-field input:focus,
.form-field textarea:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-field textarea {
  height: 6rem;
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  margin-top: 2rem;
}

.save-btn {
  padding: 0.75rem 1.5rem;
  background: #10b981;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.2s;
}

.save-btn:hover {
  background: #059669;
}

/* Responsive Design */
@media (max-width: 768px) {
  .split-container {
    flex-direction: column;
    height: auto;
  }

  .user-list-panel {
    width: 100%;
    height: 300px;
  }

  .user-details-panel {
    min-height: 400px;
  }
}
</style>

<script>
// Import axios for making HTTP requests
import axios from 'axios'
import { useToastStore } from '@/stores/toast'

export default {
  data() {
    return {
      users: [], // This will store the fetched users
      selectedUser: null, // Currently selected user
      isEditing: false, // Whether we're in edit mode
    }
  },
  mounted() {
    this.fetchUsers() // Call fetchUsers when component is mounted
  },
  methods: {
    async fetchUsers() {
      const toast = useToastStore()
      try {
        // Make a GET request to the Express API
        const response = await axios.get('http://localhost:3000/users')
        this.users = response.data
        // Auto-select first user if available
        if (this.users.length > 0 && !this.selectedUser) {
          this.selectedUser = { ...this.users[0] }
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.show('Failed to fetch users.', 'error')
      }
    },

    selectUser(user) {
      // Cancel editing when switching users
      this.isEditing = false
      // Create a copy to avoid direct mutation
      this.selectedUser = { ...user }
    },

    toggleEdit() {
      if (this.isEditing) {
        // If canceling edit, restore original data
        const originalUser = this.users.find((u) => u.id === this.selectedUser.id)
        if (originalUser) {
          this.selectedUser = { ...originalUser }
        }
      }
      this.isEditing = !this.isEditing
    },

    // Method to send the PATCH request to the backend
    async updateUser(user) {
      const toast = useToastStore()
      // Send the PATCH request to update user data
      try {
        await axios.patch(`http://localhost:3000/users/${user.id}`, {
          PAT: user.PAT,
          nickname: user.nickname,
          email: user.email,
          notes: user.notes,
        })

        // Update the user in the users array
        const userIndex = this.users.findIndex((u) => u.id === user.id)
        if (userIndex !== -1) {
          this.users[userIndex] = { ...user }
        }

        // Exit edit mode
        this.isEditing = false
        toast.show('User updated successfully!', 'success')
      } catch (error) {
        console.error('Error updating user:', error)
        toast.show('Failed to update user.', 'error')
      }
    },
  },
}
</script>
