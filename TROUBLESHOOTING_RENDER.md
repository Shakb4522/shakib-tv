# Troubleshooting "Cannot GET /api/health" on Render

## Common Causes & Solutions

### 1. Check Render Logs (Most Important!)

1. Go to **Render Dashboard**
2. Click on your service: `shakib-tv`
3. Click **Logs** tab
4. Look for errors

**Common errors you might see:**
- `Error: Cannot find module 'mongoose'` → Dependencies not installed
- `MongoDB connection error` → Connection string issue
- `Port already in use` → Port configuration issue
- `Cannot find module './db'` → File path issue

### 2. Verify Build Succeeded

1. Go to **Render Dashboard** → Your Service
2. Check **Events** tab
3. Look for "Build succeeded" message
4. If build failed, check the error message

### 3. Check Environment Variables

1. Go to **Render Dashboard** → Your Service → **Environment**
2. Verify these exist:
   - `MONGODB_URI` (optional - app works without it)
   - `PORT` (Render sets this automatically)
   - `TMDB_API_KEY` (optional)

### 4. Verify Server is Running

In Render logs, you should see:
```
Server is running on http://localhost:3000
```

If you don't see this, the server isn't starting.

### 5. Test Basic Route First

Try accessing the root route:
```
https://shakib-tv.onrender.com/
```

If this works but `/api/health` doesn't, it's a routing issue.

### 6. Common Fixes

#### Fix 1: Rebuild Service
1. Render Dashboard → Your Service
2. Click **Manual Deploy** → **Clear build cache & deploy**

#### Fix 2: Check package.json
Make sure `start` script exists:
```json
"scripts": {
  "start": "node server.js"
}
```

#### Fix 3: Verify File Structure
Make sure these files exist in your repo:
- `server.js` (in root)
- `db.js` (in root)
- `package.json` (in root)
- `public/` folder

#### Fix 4: Check Node Version
Render might need a specific Node version. Add to `package.json`:
```json
"engines": {
  "node": "18.x"
}
```

### 7. Quick Test Commands

**Test if server responds at all:**
```bash
curl https://shakib-tv.onrender.com/
```

**Test health endpoint:**
```bash
curl https://shakib-tv.onrender.com/api/health
```

### 8. Debug Steps

1. **Check if code is deployed:**
   - Go to GitHub: https://github.com/Shakb4522/shakib-tv
   - Verify latest commit is there

2. **Check Render deployment:**
   - Render Dashboard → Your Service → Events
   - Should show latest deployment

3. **Check server logs:**
   - Look for any error messages
   - Check if server started successfully

4. **Test locally first:**
   ```bash
   npm start
   # Then visit: http://localhost:3000/api/health
   ```

### 9. If Still Not Working

**Create a simple test endpoint:**
Add this to `server.js` before other routes:
```javascript
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});
```

Then test: `https://shakib-tv.onrender.com/test`

If this works but `/api/health` doesn't, there's an issue with that specific route.

### 10. Contact Render Support

If nothing works:
1. Copy error logs from Render
2. Check Render status page
3. Contact Render support with your service URL and logs

## Quick Checklist

- [ ] Build succeeded in Render
- [ ] Server logs show "Server is running"
- [ ] No errors in Render logs
- [ ] Environment variables are set (if needed)
- [ ] Code is pushed to GitHub
- [ ] Root route (`/`) works
- [ ] Dependencies installed correctly

## Most Likely Issue

Based on "Cannot GET /api/health", the most common causes are:

1. **Server crashed on startup** (check logs for MongoDB errors)
2. **Build failed** (check Events tab)
3. **Routes not loading** (check if root `/` works)
4. **Port configuration** (Render should handle this automatically)

**Start by checking Render logs - that will tell you exactly what's wrong!**

