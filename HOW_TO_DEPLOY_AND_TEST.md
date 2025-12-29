# How to Deploy & Test Your App

## Step 1: Push to GitHub

### If you already have a GitHub repository:

1. **Open terminal/command prompt** in your project folder
2. **Check if you have a git repository:**
   ```bash
   git status
   ```

3. **If not initialized, initialize git:**
   ```bash
   git init
   ```

4. **Add all files:**
   ```bash
   git add .
   ```

5. **Commit changes:**
   ```bash
   git commit -m "Add MongoDB integration"
   ```

6. **Add your GitHub repository (if not already added):**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
   Replace `YOUR_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub info

7. **Push to GitHub:**
   ```bash
   git push -u origin main
   ```
   (or `master` if that's your default branch)

### If you don't have a GitHub repository yet:

1. **Go to GitHub.com** and create a new repository
2. **Don't initialize with README** (you already have files)
3. **Copy the repository URL**
4. **Follow steps 3-7 above** using your new repository URL

## Step 2: Render Auto-Deploys

Once you push to GitHub:
- ✅ Render automatically detects the push
- ✅ Starts building your app
- ✅ Deploys it automatically
- ⏱️ Takes 2-5 minutes

**Check deployment status:**
- Go to Render Dashboard
- Click on your service
- Watch the "Events" or "Logs" tab
- Wait for "Deploy succeeded" message

## Step 3: Test the Health Endpoint

### Option A: Using Browser (Easiest)

1. **Get your Render app URL:**
   - It looks like: `https://your-app-name.onrender.com`
   - Find it in Render Dashboard → Your Service → Settings

2. **Open in browser:**
   ```
   https://your-app-name.onrender.com/api/health
   ```

3. **You should see:**
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2024-01-15T10:30:00.000Z"
   }
   ```

### Option B: Using curl (Terminal)

```bash
curl https://your-app-name.onrender.com/api/health
```

### Option C: Using Postman/Thunder Client

1. **Method:** GET
2. **URL:** `https://your-app-name.onrender.com/api/health`
3. **Send request**
4. **Check response**

## What the Response Means

### ✅ Success (Database Connected):
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
**Meaning:** Everything is working! MongoDB is connected.

### ⚠️ Database Not Connected:
```json
{
  "status": "ok",
  "database": "not connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```
**Meaning:** App is running but MongoDB connection failed. Check:
- Is `MONGODB_URI` set in Render environment variables?
- Is the connection string correct?
- Check Render logs for error messages

### ❌ Error Response:
```json
{
  "error": "Cannot GET /api/health"
}
```
**Meaning:** App might not be deployed yet or route doesn't exist. Check:
- Is deployment complete?
- Check Render logs

## Troubleshooting

### "Database not connected"

1. **Check Render Environment Variables:**
   - Go to Render Dashboard → Your Service → Environment
   - Verify `MONGODB_URI` exists and is correct

2. **Check Render Logs:**
   - Go to Render Dashboard → Your Service → Logs
   - Look for MongoDB connection errors
   - Should see: `✅ MongoDB connected successfully!`

3. **Verify MongoDB Atlas:**
   - Is your cluster running? (not paused)
   - Is IP whitelisted? (0.0.0.0/0 for testing)
   - Are username/password correct?

### "Cannot GET /api/health"

1. **Check if app is deployed:**
   - Render Dashboard → Your Service
   - Look for "Live" status

2. **Check build logs:**
   - Look for errors during build
   - Make sure `npm install` succeeded

3. **Verify server is running:**
   - Check logs for: `Server is running on http://localhost:3000`

## Quick Test Checklist

- [ ] Code pushed to GitHub
- [ ] Render shows "Deploy succeeded"
- [ ] Health endpoint returns `{"database": "connected"}`
- [ ] No errors in Render logs

## Next Steps After Success

Once health check works, you can test other endpoints:

1. **Add a favorite:**
   ```
   POST https://your-app.onrender.com/api/user/USER_ID/favorites
   Body: {
     "tmdb_id": 123,
     "media_type": "movie",
     "title": "Test Movie",
     "poster_path": "/test.jpg"
   }
   ```

2. **Get favorites:**
   ```
   GET https://your-app.onrender.com/api/user/USER_ID/favorites
   ```

## Need Help?

- Check Render logs for detailed error messages
- Verify MongoDB Atlas cluster is running
- Make sure connection string is correct in Render environment variables

