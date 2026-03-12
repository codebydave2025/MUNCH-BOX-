# Deploying MunchBox to Vercel

This project is optimized for deployment on Vercel. 

### ✅ Build Success
The project has been tested with `npm run build` and all TypeScript/Linting checks pass.

### 🌐 Image Handling
We have configured `next.config.ts` to allow images from any external URL. Remote images are set to `unoptimized` to ensure they load correctly on serverless environments without additional configuration.

### 💾 Data Persistence Note
**Important:** This project currently uses local JSON files (`menu.json`, `users.json`, `orders.json`) for data storage. 

*   **On Vercel (Production):** The file system is read-only.
    *   The app will **Read** your initial menu and user data perfectly.
    *   **Writes** (Adding items, placing orders, signing up) will work in the UI, but the data will be **temporary**. It will reset when the Vercel serverless function restarts.
*   **Recommendation:** For a production-ready store with permanent storage, we recommend connecting a database like **MongoDB**, **Supabase (PostgreSQL)**, or **Firebase**.

### 🚀 How to Host
1. Push your code to a **GitHub** repository.
2. Connect your repository to **Vercel**.
3. Vercel will automatically detect Next.js and deploy the site!
