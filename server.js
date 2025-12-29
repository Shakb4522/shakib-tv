const express = require('express');
const axios = require('axios');
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { connectDB, User, Favorite, WatchHistory, ContinueWatching } = require('./db');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TMDB_API_KEY || "d37c930cb366013a18131d662c15c22d";
const BASE_URL = "https://api.themoviedb.org/3";
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

app.use(express.static('public'));
app.use(express.json());

// Initialize MongoDB on startup (non-blocking)
(async () => {
    try {
        await connectDB();
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        // Server will continue running without database
    }
})();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ==================== Authentication Routes ====================

// Register
app.post('/api/auth/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ error: 'Username, email, and password are required' });
        }

        // Check if user exists
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }

        // Hash password
        const saltRounds = 10;
        const password_hash = await bcrypt.hash(password, saltRounds);

        // Create user
        const user = new User({
            username,
            email,
            password_hash
        });

        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user
        const user = await User.findOne({ email: email.toLowerCase() });

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isValidPassword = await bcrypt.compare(password, user.password_hash);

        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get current user (protected)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password_hash');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user._id,
            username: user.username,
            email: user.email
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Proxy endpoints for TMDB
app.get('/api/movies/trending', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/movies/top-rated', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/movies/popular', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/movies/search', async (req, res) => {
    const { query } = req.query;
    try {
        // Use multi-search to find both movies and TV shows
        const response = await axios.get(`${BASE_URL}/search/multi?api_key=${API_KEY}&query=${query}`);

        // Filter out people/actors if needed, or keeping them is fine (usually handled by frontend filter)
        // But for netflix clone, we mainly want 'movie' and 'tv'
        const results = response.data.results.filter(item => item.media_type === 'movie' || item.media_type === 'tv');

        res.json({ ...response.data, results });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/movies/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const movie = await axios.get(`${BASE_URL}/movie/${id}?api_key=${API_KEY}`);
        const videos = await axios.get(`${BASE_URL}/movie/${id}/videos?api_key=${API_KEY}`);
        res.json({ ...movie.data, videos: videos.data.results, media_type: 'movie' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// TV Show Endpoints
app.get('/api/tv/trending', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tv/top-rated', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tv/popular', async (req, res) => {
    try {
        const response = await axios.get(`${BASE_URL}/tv/popular?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tv/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const tv = await axios.get(`${BASE_URL}/tv/${id}?api_key=${API_KEY}`);
        const videos = await axios.get(`${BASE_URL}/tv/${id}/videos?api_key=${API_KEY}`);
        res.json({ ...tv.data, videos: videos.data.results, media_type: 'tv' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/tv/:id/season/:seasonNumber', async (req, res) => {
    const { id, seasonNumber } = req.params;
    try {
        const response = await axios.get(`${BASE_URL}/tv/${id}/season/${seasonNumber}?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Genre & Discovery Endpoints
app.get('/api/genres/:type', async (req, res) => {
    const { type } = req.params; // 'movie' or 'tv'
    try {
        const response = await axios.get(`${BASE_URL}/genre/${type}/list?api_key=${API_KEY}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/discover/:type/:genreId', async (req, res) => {
    const { type, genreId } = req.params;
    const { page = 1 } = req.query;
    try {
        const response = await axios.get(`${BASE_URL}/discover/${type}?api_key=${API_KEY}&with_genres=${genreId}&page=${page}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ==================== MongoDB Endpoints ====================

// Helper endpoint to get user favorites (using token)
app.get('/api/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const favorites = await Favorite.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .lean();
        res.json(favorites);
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/favorites', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { tmdb_id, media_type, title, poster_path, backdrop_path } = req.body;
    
    try {
        const favorite = await Favorite.findOneAndUpdate(
            { user_id: userId, tmdb_id, media_type },
            {
                user_id: userId,
                tmdb_id,
                media_type,
                title,
                poster_path,
                backdrop_path
            },
            { upsert: true, new: true }
        );
        res.json({ success: true, favorite });
    } catch (error) {
        console.error('Error adding favorite:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/favorites/:tmdbId/:mediaType', authenticateToken, async (req, res) => {
    const { tmdbId, mediaType } = req.params;
    const userId = req.user.userId;
    
    try {
        await Favorite.findOneAndDelete({
            user_id: userId,
            tmdb_id: parseInt(tmdbId),
            media_type: mediaType
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing favorite:', error);
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/favorites/check/:tmdbId/:mediaType', authenticateToken, async (req, res) => {
    const { tmdbId, mediaType } = req.params;
    const userId = req.user.userId;
    
    try {
        const favorite = await Favorite.findOne({
            user_id: userId,
            tmdb_id: parseInt(tmdbId),
            media_type: mediaType
        });
        res.json({ isFavorite: !!favorite });
    } catch (error) {
        console.error('Error checking favorite:', error);
        res.status(500).json({ error: error.message });
    }
});

// Watch History Endpoints
app.get('/api/watch-history', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const history = await WatchHistory.find({ user_id: userId })
            .sort({ last_watched_at: -1 })
            .limit(50)
            .lean();
        res.json(history);
    } catch (error) {
        console.error('Error fetching watch history:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/watch-history', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { tmdb_id, media_type, title, poster_path, season_number, episode_number, progress_percent } = req.body;
    
    try {
        const history = new WatchHistory({
            user_id: userId,
            tmdb_id,
            media_type,
            title,
            poster_path,
            season_number: season_number || null,
            episode_number: episode_number || null,
            progress_percent: progress_percent || 0,
            last_watched_at: new Date()
        });
        await history.save();
        res.json({ success: true, history });
    } catch (error) {
        console.error('Error adding watch history:', error);
        res.status(500).json({ error: error.message });
    }
});

// Continue Watching Endpoints
app.get('/api/continue-watching', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    try {
        const items = await ContinueWatching.find({ user_id: userId })
            .sort({ updatedAt: -1 })
            .limit(20)
            .lean();
        res.json(items);
    } catch (error) {
        console.error('Error fetching continue watching:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/continue-watching', authenticateToken, async (req, res) => {
    const userId = req.user.userId;
    const { tmdb_id, media_type, title, poster_path, season_number, episode_number, progress_percent } = req.body;
    
    try {
        const item = await ContinueWatching.findOneAndUpdate(
            { user_id: userId, tmdb_id, media_type },
            {
                user_id: userId,
                tmdb_id,
                media_type,
                title,
                poster_path,
                season_number: season_number || null,
                episode_number: episode_number || null,
                progress_percent: progress_percent || 0
            },
            { upsert: true, new: true }
        );
        res.json({ success: true, item });
    } catch (error) {
        console.error('Error updating continue watching:', error);
        res.status(500).json({ error: error.message });
    }
});

app.delete('/api/continue-watching/:tmdbId/:mediaType', authenticateToken, async (req, res) => {
    const { tmdbId, mediaType } = req.params;
    const userId = req.user.userId;
    
    try {
        await ContinueWatching.findOneAndDelete({
            user_id: userId,
            tmdb_id: parseInt(tmdbId),
            media_type: mediaType
        });
        res.json({ success: true });
    } catch (error) {
        console.error('Error removing continue watching:', error);
        res.status(500).json({ error: error.message });
    }
});

// Health check endpoint
app.get('/api/health', async (req, res) => {
    try {
        const mongoose = require('mongoose');
        const dbStatus = mongoose.connection.readyState === 1;
        res.json({
            status: 'ok',
            database: dbStatus ? 'connected' : 'not connected',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.json({
            status: 'ok',
            database: 'not configured',
            timestamp: new Date().toISOString(),
            error: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
