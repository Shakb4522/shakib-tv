# Where to Find MongoDB Connection String in Atlas

## Step-by-Step Visual Guide

### 1. Login to MongoDB Atlas
- Go to https://www.mongodb.com/cloud/atlas
- Sign in to your account

### 2. Go to Your Cluster
- You'll see your cluster(s) on the main dashboard
- Look for a cluster card (usually shows "M0" for free tier)

### 3. Click the "Connect" Button
- On your cluster card, click the **"Connect"** button
- It's usually a green button on the right side

### 4. Choose Connection Method
- A modal/popup will appear with connection options:
  - **Connect using MongoDB Compass**
  - **Connect your application** ← **Click this one!**
  - **Connect using VS Code**
  - **Connect using MongoDB Shell**

### 5. Select Driver & Version
- After clicking "Connect your application":
  - **Driver**: Select "Node.js"
  - **Version**: Select "5.5 or later" (or latest)

### 6. Copy the Connection String
- You'll see a connection string like:
  ```
  mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
  ```
- Click the **copy icon** (📋) to copy it

### 7. Replace Placeholders
The connection string has placeholders:
- `<username>` - Replace with your database username
- `<password>` - Replace with your database password

**Example:**
If your username is `shakibtv` and password is `MyPass123`, it becomes:
```
mongodb+srv://shakibtv:MyPass123@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
```

### 8. Add Database Name
Add your database name before the `?`:
```
mongodb+srv://shakibtv:MyPass123@cluster0.xxxxx.mongodb.net/shakibtv?retryWrites=true&w=majority
                                                                    ^^^^^^^^^^
                                                                    Add this!
```

## Quick Visual Path

```
MongoDB Atlas Dashboard
    ↓
Your Cluster Card
    ↓
Click "Connect" Button
    ↓
Choose "Connect your application"
    ↓
Select "Node.js" driver
    ↓
Copy connection string
    ↓
Replace <username> and <password>
    ↓
Add database name before ?
```

## Important Notes

⚠️ **Password Special Characters:**
If your password has special characters like `@`, `#`, `%`, etc., you need to URL-encode them:
- `@` becomes `%40`
- `#` becomes `%23`
- `%` becomes `%25`
- etc.

Or better: Use a password without special characters for easier setup.

✅ **Database Name:**
- MongoDB Atlas creates databases automatically
- Just add `/shakibtv` (or your chosen name) before the `?`
- Collections will be created automatically when you use them

## Still Can't Find It?

1. Make sure your cluster is fully created (not still deploying)
2. Check you're logged into the correct MongoDB Atlas account
3. Try refreshing the page
4. Look for a "Connect" button on the cluster overview page

## Alternative: Direct Link

If you're already in your cluster:
- Look for a "Connect" button in the top right
- Or check the left sidebar for "Connect" option

