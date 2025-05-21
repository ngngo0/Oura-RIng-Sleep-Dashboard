<template>
  <section class="settings">
    <h1>This is a settings page</h1>
    <ul>

      <li v-for="user in users" :key="user.id" class="user-container" @click="user.isEditing = true">
        <div v-if="!user.isEditing">
          <p>Id: {{ user.id }} and Nickname: {{ user.nickname }} </p>
        </div>

        <form v-else @blur="!user.isEditing" @submit.prevent="updateUser(user)">
            <label for="nickname">Nickname:</label>
            <br>
            <input 
              type="text" 
              id="nickname" 
              v-model="user.nickname" 
            />
            <br>
            <label for="email">Email:</label>
            <br>
            <input 
              type="email" 
              id="email" 
              v-model="user.email" 
            />
            <br>
            <label for="notes">Notes:</label>
            <br>
            <textarea 
              id="notes" 
              v-model="user.notes" 
            ></textarea>
            <br>
            <button type="submit">Save</button>        
        </form>
      </li>
    </ul>
  </section>
</template>

<style scoped>
@media (min-width: 1024px) {
  .settings {
    min-height: 100vh;
    align-items: center;
  }
  input{
    padding:5px;
    width: 100%;
  }
  textarea{
    width: 100%;
    height: 4rem;
  }
  button{
    width:100%;
  }
  
  ul{
    list-style: none;
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
    padding: 1rem;
    li{
      display: flex;
      justify-content: center;
      align-items: center;
      flex: 1 1 calc(50% - 1rem); /* 2 columns with spacing */
      box-sizing: border-box;
      border: 1px solid #ccc;
      border-radius: 8px;
      background: #f9f9f9;
      min-width: 250px;
      border: black solid;
      cursor: pointer;
      padding:1rem;
    }
  }
}
</style>

<script>
// Import axios for making HTTP requests
import axios from 'axios';

export default {
  data() {
    return {
      users: [],  // This will store the fetched users
    };
  },
  mounted() {
    this.fetchUsers();  // Call fetchUsers when component is mounted
  },
  methods: {
    async fetchUsers() {
      try {
        // Make a GET request to the Express API
        const response = await axios.get('http://localhost:3000/users');
        this.users = response.data.map(user => ({
          ...user,
          isEditing: false
        }));  // Store the response data in users
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    },
     // Method to send the PATCH request to the backend
    async updateUser(user) {
      console.log(user.id)
      // Send the PATCH request to update user data
      try {
        await axios.patch(`http://localhost:3000/users/${user.id}`, {
          nickname: user.nickname,
          email: user.email,
          notes: user.notes
        });
        console.log('User updated:', user.id);
        alert('User updated successfully!');
      } catch (error) {
        console.error('Error updating user:', error);
        alert('Failed to update user.');
      }
    },
  }
};
</script>