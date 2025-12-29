# MongoDB Quick Start 🚀

## 1. Create MongoDB Database

**MongoDB Atlas (Free):**
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free
3. Create cluster (Free M0 tier)
4. Wait 2-3 minutes for cluster to be ready

## 2. Configure Access

1. **Database Access:**
   - Add new user: `shakibtv`
   - Generate password (save it!)
   - Set permissions: Read and write

2. **Network Access:**
   - Add IP: `0.0.0.0/0` (Allow from anywhere)
   - Or add Render's specific IPs

## 3. Get Connection String

1. Click **Connect** on your cluster
2. Choose **Connect your application**
3. Copy connection string:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

4. **Add database name:**
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shakibtv?retryWrites=true&w=majority
   ```

## 4. Set on Render

Go to Render Dashboard → Your Service → Environment → Add:

```
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/shakibtv?retryWrites=true&w=majority
```

**Replace:**
- `username` = your database username
- `password` = your database password  
- `cluster0.xxxxx` = your cluster address

## 5. Deploy & Test

1. Push to GitHub (Render auto-deploys)
2. Check health: `GET /api/health`
3. Should return: `{"database": "connected"}`

## ✅ Done!

Your app now has:
- Favorites/My List
- Watch History  
- Continue Watching

**Collections auto-create** - No manual setup needed!

## 📖 Full Guide

See [MONGODB_SETUP.md](./MONGODB_SETUP.md) for detailed instructions.

## 🔑 Connection String Template

```
mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/DATABASE_NAME?retryWrites=true&w=majority
```

**Example:**
```
mongodb+srv://shakibtv:MyPassword123@cluster0.abc123.mongodb.net/shakibtv?retryWrites=true&w=majority
```

