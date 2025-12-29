const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection URI
const MONGODB_URI = process.env.MONGODB_URI || 
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// Connect to MongoDB
async function connectDB() {
    try {
        if (!process.env.MONGODB_URI && !process.env.DB_HOST) {
            console.log('⚠️  MongoDB not configured - running without database features');
            return false;
        }

        await mongoose.connect(MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        
        console.log('✅ MongoDB connected successfully!');
        return true;
    } catch (error) {
        console.error('❌ MongoDB connection error:', error.message);
        return false;
    }
}

// User Schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password_hash: {
        type: String
    }
}, {
    timestamps: true
});

// Favorite Schema (My List)
const favoriteSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdb_id: {
        type: Number,
        required: true
    },
    media_type: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    poster_path: String,
    backdrop_path: String
}, {
    timestamps: true
});

// Create unique index for favorites
favoriteSchema.index({ user_id: 1, tmdb_id: 1, media_type: 1 }, { unique: true });

// Watch History Schema
const watchHistorySchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdb_id: {
        type: Number,
        required: true
    },
    media_type: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    poster_path: String,
    season_number: {
        type: Number,
        default: null
    },
    episode_number: {
        type: Number,
        default: null
    },
    progress_percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    last_watched_at: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for watch history queries
watchHistorySchema.index({ user_id: 1, last_watched_at: -1 });

// Continue Watching Schema
const continueWatchingSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    tmdb_id: {
        type: Number,
        required: true
    },
    media_type: {
        type: String,
        enum: ['movie', 'tv'],
        required: true
    },
    title: {
        type: String,
        required: true
    },
    poster_path: String,
    season_number: {
        type: Number,
        default: null
    },
    episode_number: {
        type: Number,
        default: null
    },
    progress_percent: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    }
}, {
    timestamps: true
});

// Create unique index for continue watching
continueWatchingSchema.index({ user_id: 1, tmdb_id: 1, media_type: 1 }, { unique: true });

// Create Models
const User = mongoose.model('User', userSchema);
const Favorite = mongoose.model('Favorite', favoriteSchema);
const WatchHistory = mongoose.model('WatchHistory', watchHistorySchema);
const ContinueWatching = mongoose.model('ContinueWatching', continueWatchingSchema);

module.exports = {
    connectDB,
    User,
    Favorite,
    WatchHistory,
    ContinueWatching
};

