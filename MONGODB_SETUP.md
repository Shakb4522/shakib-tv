# MongoDB Setup Guide for ShakibTV

This guide will help you set up MongoDB database for your ShakibTV app deployed on Render.

## 🎯 Quick Overview

Your app now supports:
- ✅ **Favorites/My List** - Save movies and TV shows
- ✅ **Watch History** - Track what users have watched
- ✅ **Continue Watching** - Resume where users left off

## 📋 Step-by-Step Setup

### 1️⃣ Choose a MongoDB Provider

**Recommended: MongoDB Atlas** (Free tier, 512MB storage)
- Go to https://www.mongodb.com/cloud/atlas
- Sign up for free
- Create a new cluster (Free M0 tier)

**Other Options:**
- Render MongoDB (if available)
- Railway MongoDB
- DigitalOcean MongoDB
- Any MongoDB 4.4+ compatible database

### 2️⃣ Create MongoDB Cluster

1. **Sign up/Login** to MongoDB Atlas
2. **Create a new cluster:**
   - Choose **FREE** (M0) tier
   - Select a cloud provider and region closest to you
   - Click **Create Cluster**

3. **Wait for cluster to be created** (2-3 minutes)

### 3️⃣ Configure Database Access

1. Go to **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Choose:
   - **Authentication Method**: Password
   - **Username**: `shakibtv` (or your choice)
   - **Password**: Generate secure password (save it!)
   - **Database User Privileges**: Read and write to any database
4. Click **Add User**

### 4️⃣ Configure Network Access

1. Go to **Network Access** (left sidebar)
2. Click **Add IP Address**
3. For Render deployment:
   - Click **Allow Access from Anywhere** (0.0.0.0/0)
   - Or add Render's IP ranges
4. Click **Confirm**

### 5️⃣ Get Connection String

1. Go to **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Select:
   - **Driver**: Node.js
   - **Version**: 5.5 or later
5. Copy the connection string:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### 6️⃣ Configure Environment Variables

#### On Render:

1. Go to your **Render Dashboard**
2. Select your **Web Service**
3. Go to **Environment** tab
4. Add this variable:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shakibtv?retryWrites=true&w=majority
```

**Important:** Replace:
- `username` with your database username
- `password` with your database password
- `cluster0.xxxxx` with your cluster address
- Add database name: `/shakibtv` before the `?`

5. Click **Save Changes**
6. Render will automatically redeploy

#### Local Development:

1. Create `.env` file in project root:
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shakibtv?retryWrites=true&w=majority
   TMDB_API_KEY=your_tmdb_api_key
   PORT=3000
   ```

2. Restart your server:
   ```bash
   npm start
   ```

### 7️⃣ Verify Setup

1. **Check health endpoint:**
   ```
   GET https://your-app.onrender.com/api/health
   ```
   
   Should return:
   ```json
   {
     "status": "ok",
     "database": "connected",
     "timestamp": "2024-..."
   }
   ```

2. **Check server logs:**
   - Should see: `✅ MongoDB connected successfully!`

3. **Test an endpoint:**
   ```bash
   # Add a favorite (replace userId with actual user ID)
   POST /api/user/USER_ID/favorites
   Body: {
     "tmdb_id": 123,
     "media_type": "movie",
     "title": "Test Movie",
     "poster_path": "/test.jpg"
   }
   ```

## 🔌 API Endpoints

### Favorites (My List)

**Get user's favorites:**
```
GET /api/user/:userId/favorites
```

**Add to favorites:**
```
POST /api/user/:userId/favorites
Body: {
  "tmdb_id": 123,
  "media_type": "movie",
  "title": "Movie Title",
  "poster_path": "/path.jpg",
  "backdrop_path": "/backdrop.jpg"
}
```

**Remove from favorites:**
```
DELETE /api/user/:userId/favorites/:tmdbId/:mediaType
```

**Check if favorite:**
```
GET /api/user/:userId/favorites/check/:tmdbId/:mediaType
```

### Watch History

**Get watch history:**
```
GET /api/user/:userId/watch-history
```

**Add to watch history:**
```
POST /api/user/:userId/watch-history
Body: {
  "tmdb_id": 123,
  "media_type": "tv",
  "title": "TV Show",
  "poster_path": "/path.jpg",
  "season_number": 1,
  "episode_number": 5,
  "progress_percent": 75
}
```

### Continue Watching

**Get continue watching list:**
```
GET /api/user/:userId/continue-watching
```

**Update continue watching:**
```
POST /api/user/:userId/continue-watching
Body: {
  "tmdb_id": 123,
  "media_type": "tv",
  "title": "TV Show",
  "poster_path": "/path.jpg",
  "season_number": 1,
  "episode_number": 5,
  "progress_percent": 75
}
```

**Remove from continue watching:**
```
DELETE /api/user/:userId/continue-watching/:tmdbId/:mediaType
```

## 🐛 Troubleshooting

### ❌ "MongoDB connection error"

**Solutions:**
- ✅ Check connection string is correct
- ✅ Verify username and password are correct
- ✅ Ensure IP address is whitelisted (0.0.0.0/0 for testing)
- ✅ Check cluster is running (not paused)
- ✅ Verify database name in connection string

### ❌ "Authentication failed"

**Solutions:**
- ✅ Verify username and password
- ✅ Check special characters in password are URL-encoded
- ✅ Ensure user has read/write permissions

### ❌ "Connection timeout"

**Solutions:**
- ✅ Check network access settings
- ✅ Verify IP whitelist includes Render's IPs
- ✅ Try "Allow Access from Anywhere" temporarily

### ❌ "Works locally but not on Render"

**Solutions:**
- ✅ Double-check `MONGODB_URI` in Render environment variables
- ✅ Ensure connection string includes database name
- ✅ Check Render logs for detailed error messages
- ✅ Verify environment variable is saved (not just typed)

### ❌ "Database name not found"

**Solutions:**
- ✅ MongoDB Atlas creates databases automatically
- ✅ Make sure database name is in connection string: `/shakibtv`
- ✅ Collections will be created automatically on first use

## 📊 Database Collections

Collections are created automatically when first used:

1. **users** - User accounts (for future auth)
2. **favorites** - User's saved movies/TV shows
3. **watchhistories** - Complete watch history
4. **continuewatchings** - Quick access to resume watching

## 🔒 Security Notes

- ✅ Never commit `.env` file to Git
- ✅ Use strong database passwords
- ✅ Restrict IP access in production (don't use 0.0.0.0/0)
- ✅ Use environment variables, never hardcode credentials
- ✅ Enable MongoDB Atlas authentication
- ✅ Consider adding authentication before using user endpoints

## 🚀 Next Steps

1. **Add Authentication:**
   - Implement user login/register
   - Add JWT tokens
   - Protect user endpoints

2. **Frontend Integration:**
   - Add "Add to My List" button
   - Show continue watching on homepage
   - Display watch history

3. **Optimize:**
   - Add indexes for better performance
   - Implement caching
   - Add pagination for large lists

## 📚 Resources

- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [Render Environment Variables](https://render.com/docs/environment-variables)

## ✅ Checklist

- [ ] Created MongoDB Atlas account
- [ ] Created cluster (Free M0 tier)
- [ ] Created database user
- [ ] Whitelisted IP addresses (0.0.0.0/0 for testing)
- [ ] Got connection string
- [ ] Set `MONGODB_URI` in Render
- [ ] Tested health endpoint
- [ ] Verified server logs show connection success
- [ ] Tested API endpoints

## 💡 Pro Tips

1. **Free Tier Limits:**
   - 512MB storage (enough for thousands of users)
   - Shared CPU/RAM
   - Perfect for development and small apps

2. **Connection String Format:**
   ```
   mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
   ```

3. **Automatic Collections:**
   - MongoDB creates collections automatically
   - No need to create tables manually
   - Just start using the API!

4. **MongoDB Atlas Dashboard:**
   - Monitor database usage
   - View collections and documents
   - Check performance metrics

---

**Need help?** Check server logs on Render dashboard for detailed error messages.

