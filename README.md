# How to start

## For dev
Go into backend folder:
`node app.js`

Go into oura folder
`npm run dev`

## 🔐 How to Set Up a Oura API Personal Access Token (PAT)
Follow these steps to get your token so this app can access the sleep and readiness data of that ring:

### ✅ Step 1: Setup Ring + Create an Oura Ring Account
1. Download the Oura app from the App Store or Google Play.

2. Pair the ring and create an account through the mobile app. This links the ring to the Oura Cloud account.

### ✅ Step 2: Login into the Oura Account
> Note: Instead of a password, they send a code to the email
1) Go to: https://cloud.ouraring.com

2) Log in with the same email used at account creation.

### ✅ Step 4: Create Your Personal Access Token
1) Visit this page:
 https://cloud.ouraring.com/personal-access-tokens

2) Click the “Generate Personal Access Token” button.

3) Give your token a name (e.g., “Sleep Dashboard”) and click Generate.

4) Copy the token that appears — you won’t be able to see it again!

### ✅ Step 5: Add the Token to the App
1) Open the app

2) Click Settings

3) Click on the correct Ring on the left and click edit

4) Paste the PAT in

5) Click Save

### Thank you!
https://github.com/Pinta365/oura_api?tab=readme-ov-file
Made my life easier!