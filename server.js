const express = require('express');
const axios = require('axios');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = "d37c930cb366013a18131d662c15c22d";
const BASE_URL = "https://api.themoviedb.org/3";

app.use(express.static('public'));
app.use(express.json());

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

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
