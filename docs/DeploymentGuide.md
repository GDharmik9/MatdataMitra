# 🚀 Cloud Run Deployment Guide

This guide explains how to deploy your MatdataMitra monorepo to **Google Cloud Run**. 

Because your Google Cloud Organization blocks the creation of Service Account Keys (a very common corporate/university security policy), we will use the **Direct Cloud Build Method**. This method is actually much easier—it requires **no keys**, **no terminal commands**, and **no GitHub Secrets**.

---

## 1. Why are we using Firebase?
- **Firebase is ONLY used for Authentication (Google Sign-In).** 
- We are **not** using Firebase Hosting. Both the Next.js frontend and Express backend will run on **Google Cloud Run**.
- **The Catch:** For security, Google Sign-In only works on specific, trusted URLs. Once your frontend is deployed to Cloud Run, you **must** take the new Cloud Run URL and paste it into the Firebase Console under **Authentication -> Settings -> Authorized Domains**.

---

## 2. Deploying the Backend (No Keys Required)

We will link Google Cloud directly to your GitHub repository. Google Cloud will automatically build and deploy it whenever you push.

1. Go to the [Google Cloud Run Console](https://console.cloud.google.com/run).
2. Click **Create Service**.
3. Select **Continuously deploy from a repository** and click **Set up with Cloud Build**.
4. Connect your GitHub account and select your `MatdataMitra` repository. Click Next.
5. **Build Configuration:**
   - **Branch:** `^main$`
   - **Build Type:** Select `Dockerfile`
   - **Source location:** `/`
   - **Dockerfile location:** `apps/backend/Dockerfile`
   - Click **Save**.
6. **Service Settings:**
   - Name: `matdatamitra-backend`
   - Region: `us-central1` (or your preferred region)
   - Authentication: Select **Allow unauthenticated invocations**.
7. Expand the **Containers, Volumes, Networking, Security** section:
   - Go to the **Variables & Secrets** tab.
   - Add an Environment Variable: Name: `GEMINI_API_KEY`, Value: `<Your Gemini API Key>`
   - Add an Environment Variable: Name: `NODE_ENV`, Value: `production`
8. Click **Create** to deploy.
9. *Wait for the deployment to finish, and copy the new Backend URL.*

---

## 3. Deploying the Frontend

Repeat the exact same steps for the frontend, but change the Dockerfile and the Environment Variables:

1. Click **Create Service** in Cloud Run again.
2. Select **Continuously deploy from a repository** -> **Set up with Cloud Build** -> Select `MatdataMitra`.
3. **Build Configuration:**
   - **Build Type:** `Dockerfile`
   - **Source location:** `/`
   - **Dockerfile location:** `apps/frontend/Dockerfile`  <-- *Notice this is different!*
4. **Service Settings:**
   - Name: `matdatamitra-frontend`
   - Authentication: **Allow unauthenticated invocations**.
5. **Variables & Secrets Tab:**
   - Add `NEXT_PUBLIC_FIREBASE_API_KEY`: `<Your Firebase Key>`
   - Add `NEXT_PUBLIC_BACKEND_URL`: `<The URL you copied from Step 2>`
   - Add `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`: `matdatamitra.firebaseapp.com`
   - Add `NEXT_PUBLIC_FIREBASE_PROJECT_ID`: `matdatamitra`
   *(Note: Add all the `NEXT_PUBLIC_` keys from your `.env.local` file).*
6. Click **Create**.

---

## 4. Final Step: Whitelist in Firebase

1. Copy the Frontend URL from your newly deployed Cloud Run service.
2. Go to the **Firebase Console** -> **Authentication** -> **Settings** -> **Authorized Domains**.
3. Click **Add Domain** and paste your Frontend URL.

You are now live! 🎉
