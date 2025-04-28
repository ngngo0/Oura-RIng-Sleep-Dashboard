// // Importing the Oura API SDK
 const { Oura } = require("oura_api");

const ouraSandboxClient = new Oura({ useSandbox: true });

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3000;

app.use(cors());

app.get('/api/getSleepData', async (req, res) => {
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


app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
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
