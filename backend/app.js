import dotenv from 'dotenv';
dotenv.config();              // loads dotenv to process.env

// Importing the Oura API SDK
import { Oura } from "oura_api";

// imports for lowdb
import { Low } from 'lowdb'
import { JSONFile } from 'lowdb/node'
import { userSchema } from './userSchema.js'
import { validateUser } from './validation.js';
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { encrypt, decrypt } from './utils/cryptoUtils.js';

// oura sandbox set up 
const ouraSandboxClient = new Oura({ useSandbox: true });

// oura pat setup
const accessToken = process.env.PAT_SECRET_KEY;
const oura = new Oura(accessToken);

import express from 'express';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json()); // <-- This line is required to parse JSON bodies


// Define the adapter and database
const __dirname = dirname(fileURLToPath(import.meta.url));

const file = join(__dirname, 'db.json')
const adapter = new JSONFile(file)
const db = new Low(adapter,{ users: [] })

// Read data from JSON file, this will set db.data content
await db.read()

// If db.json doesn't exist, db.data will be null
// Set default data
// db.data = db.data || { posts: [] } // Node < v15.x
db.data ||= { users: [] }             // Node >= 15.x


// id/email/notes/API Ring information

if (db.data.users.length === 0) {
  db.data.users = [
    { "id": 1, "nickname": "user1", "email": "user1@example.com", "notes": "First user" },
    { "id": 2, "nickname": "user2", "email": "user2@example.com", "notes": "Second user" },
    { "id": 3, "nickname": "user3", "email": "user3@example.com", "notes": "Third user" },
    { "id": 4, "nickname": "user4", "email": "user4@example.com", "notes": "Fourth user" },
    { "id": 5, "nickname": "user5", "email": "user5@example.com", "notes": "Fifth user" },
    { "id": 6, "nickname": "user6", "email": "user6@example.com", "notes": "Sixth user" },
    { "id": 7, "nickname": "user7", "email": "user7@example.com", "notes": "Seventh user" },
    { "id": 8, "nickname": "user8", "email": "user8@example.com", "notes": "Eighth user" },
    { "id": 9, "nickname": "user9", "email": "user9@example.com", "notes": "Ninth user" },
    { "id": 10, "nickname": "user10", "email": "user10@example.com", "notes": "Tenth user" }
  ];
  await db.write();
}
// DATABASE OPERATIONS

// GET /users
app.get('/users', (req, res) => {
  const usersWithDecryptedPATs = db.data.users.map(user => {
    let decryptedPAT = '';
    try {
      decryptedPAT = user.PAT ? decrypt(user.PAT) : '';
    } catch (e) {
      console.warn(`Failed to decrypt PAT for user ${user.id}:`, e.message);
      decryptedPAT = '[invalid or unencrypted]';  // optional fallback
    }

    return {
      ...user,
      PAT: decryptedPAT,
    };
  });

  res.json(usersWithDecryptedPATs);
});


// GET /users/:id
app.get('/users/:id', (req, res) => {
  const user = db.data.users.find(u => u.id === parseInt(req.params.id))
  if (!user) return res.status(404).json({ error: 'User not found' })
  const userToReturn = { ...user, PAT: decrypt(user.PAT) };
  res.json(userToReturn);
})

// PATCH/UPDATE to edit user details by id
app.patch('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id); // Get user ID from URL

  // Find the user in the database
  const user = db.data.users.find((user) => user.id === userId);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const { nickname, email, notes, PAT } = req.body;

  // Only update nickname if it's non-empty and provided
  if (nickname && nickname.trim() !== '') {
    user.nickname = nickname;
  }

  // Email can be cleared
  if (req.body.hasOwnProperty('email')) {
    user.email = email; // May be empty string
  }

  // Notes can be cleared
  if (req.body.hasOwnProperty('notes')) {
    user.notes = notes; // May be empty string
  }

  // PAT can be cleared or encrypted
  if (req.body.hasOwnProperty('PAT')) {
    user.PAT = PAT ? encrypt(PAT) : ''; // Clear if empty
  }

  await db.write();
  res.json(user);
});


// POST /users create new user
app.post('/users', async (req, res) => {
  const user = req.body

  if (!isValidUser(user)) {
    return res.status(400).json({ error: 'Invalid user format' })
  }

  const exists = db.data.users.some(u => u.id === user.id)
  if (exists) {
    return res.status(409).json({ error: 'User with this ID already exists' })
  }

  db.data.users.push(user)
  await db.write()
  res.status(201).json(user)
})

// DELETE /users/:id (Generalized clear user data, keeping the id intact)
app.delete('/users/:id', async (req, res) => {
  const userId = parseInt(req.params.id);
  const user = db.data.users.find(u => u.id === userId);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Clear all fields except for 'id'
  Object.keys(user).forEach(key => {
    if (key !== 'id') {
      user[key] = '';  // You can also use null or other placeholder values if needed
    }
  });

  // Save the delted data
  await db.write();
  
  res.status(200).json({
    message: 'User fields cleared successfully',
    user: {
      id: user.id,    // Keep the original id
      ...user         // Spread the rest of the fields (which are now cleared)
    }
  });
});


// OURA API 
app.get('/api/getSleepDataSand', async (req, res) => {
  try {
    const { start_date, end_date } = req.query;
    console.log(start_date, end_date);
    const finalStartDate = start_date || '2025-04-01';
    const finalEndDate = end_date || new Date().toISOString().split('T')[0];
    const json = await ouraSandboxClient.fetchData(`sleep?start_date=${finalStartDate}&end_date=${finalEndDate}`);
    res.json(json);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch sleep data" });
  }
});

app.get('/api/getSleepData', async (req, res) => {
  try {
    // 1. Validate
    if (!userId) return res.status(400).json({ error: "Missing userId" });

    // 2. Lookup user and decrypt PAT
    const user = db.data.users.find(u => u.id === parseInt(userId));
    if (!user || !user.PAT) return res.status(404).json({ error: "User or PAT not found" });

    const decryptedPAT = decrypt(user.PAT);

    // 3. Create new Oura instance
    const oura = new Oura(decryptedPAT);

    const { start_date, end_date } = req.query;
    console.log(start_date, end_date);
    const finalStartDate = start_date || '2025-04-01';
    const finalEndDate = end_date || new Date().toISOString().split('T')[0];

    const json = await oura.fetchData(`sleep?start_date=${finalStartDate}&end_date=${finalEndDate}`);
    res.json(json);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "Failed to fetch sleep data" });
  }
});

app.get('/api/getPersonalInfo', async(req,res) =>{
  try{
    const personalInfo = await oura.getPersonalInfo();
    res.json(personalInfo);
  } catch (error){
    console.error("Error loading personal info:", error);
    res.status(500).json({error: "Failed to load personal data"});
  }
});

// user preferences
app.get('/preferences', async(req, res)=>{
  try{
    const { preferenceName } = req.body;

  }catch{
    
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});


// const accessToken = "YOUR_PERSONAL_ACCESS_TOKEN";
// const oura = new Oura(accessToken);

// // Wrapping the async code inside an async function
// async function fetchPersonalInfo() {
//   try {
//     const personalInfo = await oura.getPersonalInfo();
//     console.log(personalInfo);
//   } catch (err) {
//     console.error("Error fetching personal info:", err);
//   }
// }

// fetchPersonalInfo();
