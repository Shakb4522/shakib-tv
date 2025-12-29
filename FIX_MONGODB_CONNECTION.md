# Fix MongoDB Connection Issue

## Current Status
✅ Server is running
✅ Health endpoint works
❌ MongoDB not connected

## Step 1: Check Render Environment Variables

1. Go to **Render Dashboard**
2. Click your service: `shakib-tv`
3. Go to **Environment** tab
4. Check if `MONGODB_URI` exists

**If it doesn't exist:**
- Click "+ Add" button
- KEY: `MONGODB_URI`
- VALUE: Your MongoDB connection string (see Step 2)

## Step 2: Get Your MongoDB Connection String

### If you already have MongoDB Atlas:

1. Go to https://cloud.mongodb.com
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select **Node.js** driver
5. Copy the connection string

It looks like:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### Add Database Name:

Add `/shakibtv` before the `?`:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shakibtv?retryWrites=true&w=majority
```

### Replace Placeholders:

- Replace `<username>` with your MongoDB username
- Replace `<password>` with your MongoDB password
- Keep the cluster address as is

**Example:**
```
mongodb+srv://shakibtv:MyPassword123@cluster0.abc123.mongodb.net/shakibtv?retryWrites=true&w=majority
```

## Step 3: Add to Render

1. In Render Environment tab
2. Add or update `MONGODB_URI`
3. Paste your complete connection string
4. Click **Save, rebuild, and deploy**

## Step 4: Check Render Logs

After deployment:

1. Go to **Logs** tab in Render
2. Look for one of these messages:

**✅ Success:**
```
✅ MongoDB connected successfully!
```

**❌ Error:**
```
❌ MongoDB connection error: ...
```

### Common Errors:

**"Authentication failed"**
- Wrong username or password
- Check MongoDB Atlas → Database Access → Verify user exists

**"Connection timeout"**
- IP not whitelisted
- Go to MongoDB Atlas → Network Access → Add IP: `0.0.0.0/0`

**"Invalid connection string"**
- Check format is correct
- Make sure no extra spaces
- Verify database name is added

## Step 5: Test Again

After deployment completes:

1. Visit: `https://shakib-tv.onrender.com/api/health`
2. Should now show:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "..."
}
```

## If You Don't Have MongoDB Yet

### Create Free MongoDB Atlas Account:

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up (free)
3. Create cluster (Free M0 tier)
4. Wait 2-3 minutes for cluster to be ready
5. Follow steps above to get connection string

### Quick Setup:

1. **Database Access:**
   - Add user: `shakibtv`
   - Generate password (save it!)
   - Set permissions: Read and write

2. **Network Access:**
   - Add IP: `0.0.0.0/0` (allow from anywhere)

3. **Get Connection String:**
   - Connect → Connect your application
   - Copy string and add database name

## Troubleshooting

### Still showing "not connected"?

1. **Check Render logs** for specific error message
2. **Verify connection string** format is correct
3. **Test connection string locally:**
   - Create `.env` file with `MONGODB_URI=...`
   - Run `npm start` locally
   - Check if it connects

### Connection String Format Checklist:

- ✅ Starts with `mongodb+srv://`
- ✅ Has username and password (no `<` or `>`)
- ✅ Has cluster address
- ✅ Has database name before `?`
- ✅ Has `?retryWrites=true&w=majority` at end
- ✅ No extra spaces or line breaks

### Password Special Characters:

If your password has special characters like `@`, `#`, `%`:
- URL-encode them, OR
- Use a password without special characters

## Quick Reference

**Connection String Template:**
```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Render Environment Variable:**
```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shakibtv?retryWrites=true&w=majority
```

## Next Steps After Connection Works

Once you see `"database": "connected"`:

1. ✅ MongoDB is ready
2. ✅ You can use all API endpoints
3. ✅ Collections will auto-create when you use them
4. ✅ Test adding a favorite or watch history

