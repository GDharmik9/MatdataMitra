# 🚀 Cloud Run Deployment Guide

This guide explains how to deploy your MatdataMitra monorepo (both backend and frontend) to **Google Cloud Run** using the provided GitHub Actions workflow.

---

## 1. Why are we using Firebase?
You asked about the use of Firebase in this project. 
- **Firebase is ONLY used for Authentication (Google Sign-In).** 
- We are **not** using Firebase Hosting. Both the Next.js frontend and Express backend will run on **Google Cloud Run**.
- **The Catch:** For security, Google Sign-In only works on specific, trusted URLs. Once your frontend is deployed to Cloud Run, you **must** take the new Cloud Run URL and paste it into the Firebase Console under **Authentication -> Settings -> Authorized Domains**.

---

## 2. Google Cloud Setup (One-Time)

Before GitHub can deploy your code, you need to configure your Google Cloud project.

### Step A: Enable Required APIs
Open Google Cloud Console or run this in your terminal:
```bash
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
```

### Step B: Create an Artifact Registry
This is where your Docker images will be stored before deployment.
```bash
gcloud artifacts repositories create matdatamitra-repo \
  --repository-format=docker \
  --location=us-central1
```

### Step C: Create a Service Account Key
GitHub needs permission to access your Google Cloud project.
1. Go to **IAM & Admin -> Service Accounts** in GCP.
2. Create a new service account (e.g., `github-actions-deployer`).
3. Grant it the following roles:
   - `Cloud Run Admin`
   - `Artifact Registry Writer`
   - `Service Account User`
4. Click on the new service account, go to **Keys -> Add Key -> Create New Key** (JSON).
5. Download the JSON file (Keep this safe!).

---

## 3. GitHub Secrets Setup

Go to your GitHub Repository **Settings -> Secrets and variables -> Actions**, and add the following **Repository Secrets**:

| Secret Name | Value |
|-------------|-------|
| `GCP_PROJECT_ID` | Your Google Cloud Project ID (e.g., `matdatamitra-12345`) |
| `GCP_CREDENTIALS` | The **entire content** of the JSON key file you downloaded in Step C. |
| `GEMINI_API_KEY` | Your working Gemini API key from Google AI Studio. |
| `FIREBASE_API_KEY` | Your `NEXT_PUBLIC_FIREBASE_API_KEY` from your local `.env`. |

---

## 4. How to Deploy (Manual Trigger)

Because we configured the workflow to use `workflow_dispatch`, it **will not trigger on every small commit**. You have full control.

### Deployment Flow:
1. **Push your code:**
   ```bash
   git add .
   git commit -m "chore: setup deployment pipeline"
   git push origin main
   ```
2. **Deploy the Backend:**
   - Go to your GitHub repo -> **Actions** tab.
   - Click **Deploy to Google Cloud Run** on the left menu.
   - Click the **Run workflow** dropdown.
   - Select `backend` from the "Which service to deploy?" dropdown.
   - Wait for it to finish. **Copy the Backend URL** from the output logs.
3. **Add the Backend URL to Secrets:**
   - Go back to GitHub Secrets and add a new secret: `BACKEND_URL`. Paste the URL you just copied (e.g., `https://matdatamitra-backend-xxx.a.run.app`).
4. **Deploy the Frontend:**
   - Go back to the **Actions** tab.
   - Run the workflow again, but this time select `frontend`.
   - Wait for it to finish. **Copy the Frontend URL** from the logs.
5. **Whitelist in Firebase:**
   - Go to the Firebase Console -> Authentication -> Settings -> Authorized Domains.
   - Add your new Frontend URL.

You are now live! 🎉
