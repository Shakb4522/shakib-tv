const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();
const { connectDB, User, Favorite, WatchHistory, ContinueWatching } = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.TMDB_API_KEY || "d37c930cb366013a18131d662c15c22d";
const BASE_URL = "https://api.themoviedb.org/3";

app.use(express.static('public'));
app.use(express.json());

// Initialize MongoDB on startup
(async () => {
    await connectDB();
})();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
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

// Favorites (My List) Endpoints
app.get('/api/user/:userId/favorites', async (req, res) => {
    const { userId } = req.params;
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

app.post('/api/user/:userId/favorites', async (req, res) => {
    const { userId } = req.params;
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

app.delete('/api/user/:userId/favorites/:tmdbId/:mediaType', async (req, res) => {
    const { userId, tmdbId, mediaType } = req.params;
    
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

app.get('/api/user/:userId/favorites/check/:tmdbId/:mediaType', async (req, res) => {
    const { userId, tmdbId, mediaType } = req.params;
    
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
app.get('/api/user/:userId/watch-history', async (req, res) => {
    const { userId } = req.params;
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

app.post('/api/user/:userId/watch-history', async (req, res) => {
    const { userId } = req.params;
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
app.get('/api/user/:userId/continue-watching', async (req, res) => {
    const { userId } = req.params;
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

app.post('/api/user/:userId/continue-watching', async (req, res) => {
    const { userId } = req.params;
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

app.delete('/api/user/:userId/continue-watching/:tmdbId/:mediaType', async (req, res) => {
    const { userId, tmdbId, mediaType } = req.params;
    
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
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1;
    res.json({
        status: 'ok',
        database: dbStatus ? 'connected' : 'not connected',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
