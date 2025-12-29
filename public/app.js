const rowsContainer = document.getElementById('rows-container');
const hero = document.getElementById('hero');
const heroBg = document.getElementById('heroBg');
const heroTitle = document.getElementById('heroTitle');
const heroOverview = document.getElementById('heroOverview');
const heroPlayBtn = document.getElementById('heroPlayBtn');
const heroInfoBtn = document.getElementById('heroInfoBtn');

const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close-modal');
const modalHero = document.getElementById('modalHero');
const modalTitle = document.getElementById('modalTitle');
const modalOverview = document.getElementById('modalOverview');
const modalDate = document.getElementById('modalDate');
const modalRating = document.getElementById('modalRating');
const modalRuntime = document.getElementById('modalRuntime');
const modalGenres = document.getElementById('modalGenres');
const modalPlayBtn = document.getElementById('modalPlayBtn');
const trailerIframe = document.getElementById('trailerIframe');

const playerScreen = document.getElementById('playerScreen');
const playerIframe = document.getElementById('playerIframe');
const playerBackBtn = document.getElementById('playerBackBtn');

const searchInput = document.getElementById('searchInput');
const searchResults = document.getElementById('searchResults');
const searchGrid = document.getElementById('searchGrid');
const playerMovieTitle = document.getElementById('playerMovieTitle');
const playerMovieMeta = document.getElementById('playerMovieMeta');
const playerInteractionLayer = document.getElementById('playerInteractionLayer');

const genreSelector = document.getElementById('genreSelector');
const genreResults = document.getElementById('genreResults');
const genreGrid = document.getElementById('genreGrid');
const genreTitle = document.getElementById('genreTitle');
const backToRowsBtn = document.getElementById('backToRowsBtn');

const IMG_BASE_URL = 'https://image.tmdb.org/t/p/original';
const POSTER_BASE_URL = 'https://image.tmdb.org/t/p/w500';

let currentMovieId = null;

// Hero Cycling State
let heroCycleInterval = null;
let heroMovies = [];
let currentHeroIndex = 0;

// Navigation Links
const navLinks = document.querySelectorAll('.nav-link');
navLinks.forEach(link => {
    link.onclick = (e) => {
        e.preventDefault();
        const type = e.currentTarget.textContent.trim();
        console.log(`[Nav] Navigating to: ${type}`);

        if (type === 'My List') {
            console.log('[Nav] My List clicked - feature not implemented');
            return;
        }

        navLinks.forEach(l => l.classList.remove('active'));
        e.currentTarget.classList.add('active');

        handleNavigation(type);
    };
});

// Mobile Navigation Logic
function setupMobileMenu() {
    const burgerBtn = document.getElementById('burgerBtn');
    const mobileNav = document.getElementById('mobileNav');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const closeMenuBtn = document.getElementById('closeMenuBtn');
    const mobileLinks = document.querySelectorAll('.mobile-nav-link');

    const toggleMenu = () => {
        mobileNav.classList.toggle('open');
        mobileNavOverlay.classList.toggle('open');
        // Prevent body scroll when menu is open
        document.body.style.overflow = mobileNav.classList.contains('open') ? 'hidden' : '';
    };

    if (burgerBtn) burgerBtn.onclick = toggleMenu;
    if (closeMenuBtn) closeMenuBtn.onclick = toggleMenu;
    if (mobileNavOverlay) mobileNavOverlay.onclick = toggleMenu;

    mobileLinks.forEach(link => {
        link.onclick = (e) => {
            e.preventDefault();
            const type = e.currentTarget.textContent.trim();

            // Update mobile nav active state
            mobileLinks.forEach(l => l.classList.remove('active'));
            e.currentTarget.classList.add('active');

            handleNavigation(type);
            toggleMenu(); // Close menu after clicking
        };
    });
}

function handleNavigation(type) {
    // Clear active state from desktop nav links
    navLinks.forEach(l => l.classList.remove('active'));
    // Find and activate the corresponding desktop nav link
    const activeNavLink = Array.from(navLinks).find(link => link.textContent.trim() === type);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }

    // Reset UI state
    rowsContainer.innerHTML = '';
    searchResults.style.display = 'none';
    genreResults.style.display = 'none';
    hero.style.display = 'flex';
    rowsContainer.style.display = 'block';
    genreSelector.style.display = 'none'; // Default to hidden, show if needed

    if (type === 'Home') {
        init(); // Re-init home
    } else if (type === 'TV Shows') {
        loadPage('TV Shows');
    } else if (type === 'Movies') {
        loadPage('Movies');
    }
}

async function loadPage(type) {
    console.log(`[loadPage] Start: ${type}`);
    rowsContainer.innerHTML = '';
    searchResults.style.display = 'none';
    genreResults.style.display = 'none';
    hero.style.display = 'flex';
    rowsContainer.style.display = 'block';

    try {
        if (type === 'Home') {
            genreSelector.style.display = 'none';
            await fetchHero('/api/movies/trending');
            await fetchRows([
                { title: 'Trending Now', endpoint: '/api/movies/trending' },
                { title: 'Top Rated TV Series', endpoint: '/api/tv/top-rated' },
                { title: 'Top Rated Movies', endpoint: '/api/movies/top-rated' },
                { title: 'Popular on Netflix', endpoint: '/api/movies/popular' }
            ]);
        } else if (type === 'TV Shows') {
            genreSelector.style.display = 'flex';
            fetchAndDisplayGenres('tv');
            await fetchHero('/api/tv/trending');
            await fetchRows([
                { title: 'Trending TV Shows', endpoint: '/api/tv/trending' },
                { title: 'Top Rated TV Shows', endpoint: '/api/tv/top-rated' },
                { title: 'Popular TV Shows', endpoint: '/api/tv/popular' }
            ]);
        } else if (type === 'Movies') {
            genreSelector.style.display = 'flex';
            fetchAndDisplayGenres('movie');
            await fetchHero('/api/movies/popular');
            await fetchRows([
                { title: 'Trending Movies', endpoint: '/api/movies/trending' },
                { title: 'Top Rated Movies', endpoint: '/api/movies/top-rated' },
                { title: 'Blockbuster Movies', endpoint: '/api/movies/popular' }
            ]);
        }
        console.log(`[loadPage] Success: ${type}`);
    } catch (err) {
        console.error(`[loadPage] Error loading ${type}:`, err);
    }
}

// Genre Management
async function fetchAndDisplayGenres(type) {
    try {
        const res = await fetch(`/api/genres/${type}`);
        const data = await res.json();

        genreSelector.innerHTML = '';
        data.genres.forEach(genre => {
            const chip = document.createElement('div');
            chip.className = 'genre-chip';
            chip.textContent = genre.name;
            chip.onclick = (event) => loadGenreCategory(genre.id, genre.name, type, event);
            genreSelector.appendChild(chip);
        });
    } catch (err) {
        console.error('Error fetching genres:', err);
    }
}

async function loadGenreCategory(genreId, genreName, type, event, page = 1) {
    console.log(`[Genre] Loading: ${genreName} (${type}) Page: ${page}`);

    // UI Transitions
    // Keep hero visible but maybe scroll to results? 
    // User said "doesnt show the profile and play", likely they want the functional buttons.
    // I'll keep the hero but update it or just show results below it.
    // Actually, typical Netflix genre pages HAVE a hero. 
    // I'll update fetchHero to take an optional genre category.

    rowsContainer.style.display = 'none';
    searchResults.style.display = 'none';
    genreResults.style.display = 'block';
    genreTitle.textContent = genreName;
    genreGrid.innerHTML = '<div class="loading">Loading...</div>';

    // Highlight active chip
    document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }

    try {
        const res = await fetch(`/api/discover/${type}/${genreId}?page=${page}`);
        const data = await res.json();

        renderGridResults(genreGrid, data.results);
        renderPagination(data.total_pages, data.page, type, genreId, genreName);

        // Scroll to results top
        genreResults.scrollIntoView({ behavior: 'smooth' });
    } catch (err) {
        console.error('Error loading genre results:', err);
        genreGrid.innerHTML = '<div class="error">Failed to load content.</div>';
    }
}

function renderPagination(totalPages, currentPage, type, genreId, genreName) {
    const container = document.getElementById('genrePagination');
    if (!container) return;
    container.innerHTML = '';

    const maxVisible = 7;
    let startPage = Math.max(1, currentPage - 3);
    let endPage = Math.min(totalPages, startPage + maxVisible - 1);

    if (endPage - startPage < maxVisible - 1) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }

    const createPageBtn = (p, label, active = false) => {
        const btn = document.createElement('div');
        btn.className = `page-item ${active ? 'active' : ''}`;
        btn.textContent = label || p;
        btn.onclick = () => loadGenreCategory(genreId, genreName, type, null, p);
        return btn;
    };

    if (startPage > 1) {
        container.appendChild(createPageBtn(1));
        if (startPage > 2) container.appendChild(Object.assign(document.createElement('div'), { className: 'page-item dots', textContent: '...' }));
    }

    for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageBtn(i, i, i === currentPage));
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) container.appendChild(Object.assign(document.createElement('div'), { className: 'page-item dots', textContent: '...' }));
        container.appendChild(createPageBtn(totalPages));
    }
}

function renderGridResults(container, items) {
    container.innerHTML = '';
    items.forEach(item => {
        if (!item.poster_path) return;

        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.backgroundImage = `url(${POSTER_BASE_URL}${item.poster_path})`;
        card.style.height = '300px';
        card.innerHTML = `<div class="movie-card-info">${item.title || item.name}</div>`;

        card.onclick = () => showModal(item.id, item);
        container.appendChild(card);
    });
}

backToRowsBtn.onclick = () => {
    genreResults.style.display = 'none';
    hero.style.display = 'flex';
    rowsContainer.style.display = 'block';
    document.querySelectorAll('.genre-chip').forEach(c => c.classList.remove('active'));
};

// Initial Fetch
async function init() {
    await loadPage('Home');
}

// Fetch and Setup Hero
async function fetchHero(endpoint = '/api/movies/trending') {
    try {
        const res = await fetch(endpoint);
        const data = await res.json();
        // Filter to ensure we have backdrops
        heroMovies = data.results.filter(m => m.backdrop_path);

        if (heroMovies.length > 0) {
            currentHeroIndex = 0; // Reset index for new list
            startHeroCycle();
        }
    } catch (err) {
        console.error('Error fetching hero:', err);
    }
}

function startHeroCycle() {
    if (heroCycleInterval) clearInterval(heroCycleInterval);

    // Initial display
    displayHero(heroMovies[currentHeroIndex]);

    // Cycle every 10 seconds
    heroCycleInterval = setInterval(() => {
        currentHeroIndex = (currentHeroIndex + 1) % heroMovies.length;
        displayHero(heroMovies[currentHeroIndex]);
    }, 10000);
}

function displayHero(movie) {
    const heroContent = document.querySelector('.hero-content');
    if (!heroContent) return;

    // Fade out current content
    heroContent.classList.remove('visible');
    heroBg.classList.remove('animating');

    // Wait for fade out before changing
    setTimeout(() => {
        heroBg.style.backgroundImage = `url(${IMG_BASE_URL}${movie.backdrop_path})`;
        heroBg.classList.add('animating'); // Animation only on BG

        heroTitle.textContent = movie.title || movie.name;
        heroOverview.textContent = movie.overview.length > 200 ?
            movie.overview.substring(0, 200) + '...' : movie.overview;

        heroPlayBtn.onclick = (e) => launchPlayer(movie, e);
        heroInfoBtn.onclick = () => showModal(movie.id, movie);

        // Fade back in with "belle" animation
        heroContent.classList.add('visible');
        hero.classList.add('animating');
    }, 1200); // Sync with CSS transitions
}

// Fetch and Setup Rows
async function fetchRows(categories) {
    for (const cat of categories) {
        try {
            const res = await fetch(cat.endpoint);
            const data = await res.json();
            createRow(cat.title, data.results);
        } catch (err) {
            console.error(`Error fetching ${cat.title}:`, err);
        }
    }
}

function createRow(title, movies) {
    const row = document.createElement('div');
    row.className = 'movie-row';
    row.innerHTML = `<h2>${title}</h2>`;

    const rowWrapper = document.createElement('div');
    rowWrapper.className = 'row-wrapper';

    const container = document.createElement('div');
    container.className = 'movie-container';

    const leftButton = document.createElement('button');
    leftButton.className = 'slider-btn left';
    leftButton.innerHTML = '‹';

    const rightButton = document.createElement('button');
    rightButton.className = 'slider-btn right';
    rightButton.innerHTML = '›';

    movies.forEach(movie => {
        if (!movie.backdrop_path) return;
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.backgroundImage = `url(${POSTER_BASE_URL}${movie.backdrop_path})`;
        card.innerHTML = `<div class="movie-card-info">${movie.title || movie.name}</div>`;
        card.onclick = () => showModal(movie.id, movie);
        container.appendChild(card);
    });

    leftButton.onclick = () => {
        container.scrollBy({ left: -window.innerWidth * 0.75, behavior: 'smooth' });
    };

    rightButton.onclick = () => {
        container.scrollBy({ left: window.innerWidth * 0.75, behavior: 'smooth' });
    };

    rowWrapper.appendChild(leftButton);
    rowWrapper.appendChild(container);
    rowWrapper.appendChild(rightButton);
    row.appendChild(rowWrapper);
    rowsContainer.appendChild(row);
}

// Modal Logic
async function showModal(id, movieData) {
    console.log('[DEBUG] showModal called for ID:', id, 'Type:', movieData ? movieData.media_type : 'unknown');
    currentMovieId = id;
    try {
        let type = 'movies';
        if (movieData && (movieData.media_type === 'tv' || movieData.first_air_date || !movieData.title)) {
            type = 'tv';
        }

        const res = await fetch(`/api/${type}/${id}`);
        if (!res.ok) throw new Error(`Failed to fetch ${type} details`);

        const movie = await res.json();
        const fullMovieData = { ...movie, ...movieData, type };

        if (!movie.backdrop_path && movieData.backdrop_path) movie.backdrop_path = movieData.backdrop_path;

        modalHero.style.backgroundImage = `url(${IMG_BASE_URL}${movie.backdrop_path})`;
        modalTitle.textContent = movie.title || movie.name;
        modalOverview.textContent = movie.overview || 'No overview available.';
        modalDate.textContent = movie.release_date || movie.first_air_date || '';
        modalRating.textContent = movie.vote_average ? `Rating: ${movie.vote_average.toFixed(1)}/10` : '';
        modalRuntime.textContent = movie.runtime ? `${movie.runtime} min` : '';
        modalGenres.textContent = movie.genres ? movie.genres.map(g => g.name).join(', ') : '';

        // TV Specific Logic
        const tvSelectors = document.getElementById('tvSelectors');
        const episodesList = document.getElementById('modalEpisodesList');

        // Reset TV specific elements
        episodesList.innerHTML = '';
        tvSelectors.style.display = 'none';

        if (type === 'tv' && movie.seasons) {
            tvSelectors.style.display = 'flex';
            episodesList.style.display = 'flex';
            setupTVSelectors(movie);
        } else {
            tvSelectors.style.display = 'none';
            episodesList.style.display = 'none';
        }

        const videos = movie.videos || [];
        const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        if (trailer) {
            trailerIframe.src = `https://www.youtube.com/embed/${trailer.key}`;
            trailerIframe.parentElement.style.display = 'block';
        } else {
            trailerIframe.parentElement.style.display = 'none';
        }

        if (movie.media_type !== 'tv') {
            // Only show main play button for movies, or default to S1E1 for TV if they click it
            modalPlayBtn.onclick = (e) => {
                if (type === 'tv') {
                    launchPlayer({ ...fullMovieData, selectedSeason: 1, selectedEpisode: 1 }, e);
                } else {
                    launchPlayer(fullMovieData, e);
                }
            };
        } else {
            // For TV, the play button on hero plays S1E1
            modalPlayBtn.onclick = (e) => {
                launchPlayer({ ...fullMovieData, selectedSeason: 1, selectedEpisode: 1 }, e);
            };
        }
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    } catch (err) {
        console.error('Error loading modal info:', err);
        alert('Could not load details. Please try again later.');
    }
}

async function setupTVSelectors(tvData) {
    const seasonSelect = document.getElementById('seasonSelect');
    const episodesList = document.getElementById('modalEpisodesList');

    seasonSelect.innerHTML = '';

    // Find first valid season to select by default
    let defaultSeason = 1;
    if (tvData.seasons && tvData.seasons.length > 0) {
        const firstSeason = tvData.seasons.find(s => s.season_number > 0);
        if (firstSeason) defaultSeason = firstSeason.season_number;
    }

    tvData.seasons.forEach(s => {
        if (s.season_number > 0) {
            const opt = document.createElement('option');
            opt.value = s.season_number;
            opt.textContent = s.name;
            if (s.season_number === defaultSeason) opt.selected = true;
            seasonSelect.appendChild(opt);
        }
    });

    seasonSelect.onchange = () => updateEpisodes(tvData, seasonSelect.value);

    // Initial episodes
    if (tvData.seasons.length > 0) {
        await updateEpisodes(tvData, seasonSelect.value);
    }
}

async function updateEpisodes(tvData, seasonNumber) {
    const episodesList = document.getElementById('modalEpisodesList');
    episodesList.innerHTML = '<div class="loading">Loading Episodes...</div>';

    try {
        const res = await fetch(`/api/tv/${tvData.id}/season/${seasonNumber}`);
        const data = await res.json();

        episodesList.innerHTML = '';
        data.episodes.forEach(ep => {
            const card = document.createElement('div');
            card.className = 'modal-episode-card';

            const stillPath = ep.still_path ? `${IMG_BASE_URL}${ep.still_path}` : '';

            card.innerHTML = `
                <div class="episode-number">${ep.episode_number}</div>
                <div class="episode-thumbnail-container">
                    ${stillPath ? `<img src="${stillPath}" class="episode-thumbnail" alt="Ep ${ep.episode_number}">` : '<div class="episode-thumbnail" style="background:#333;"></div>'}
                    <div class="episode-play-icon">▶</div>
                </div>
                <div class="episode-details">
                    <div class="episode-title-row">
                        <span class="episode-title">${ep.name}</span>
                        <span class="episode-runtime">${ep.runtime ? ep.runtime + 'm' : ''}</span>
                    </div>
                    <div class="episode-overview">${ep.overview || 'No overview available.'}</div>
                </div>
            `;

            card.onclick = (e) => {
                launchPlayer({ ...tvData, type: 'tv', selectedSeason: seasonNumber, selectedEpisode: ep.episode_number }, e);
            };

            episodesList.appendChild(card);
        });
    } catch (err) {
        console.error('Error fetching episodes:', err);
        episodesList.innerHTML = '<div class="error">Failed to load episodes.</div>';
    }
}

closeModal.onclick = () => {
    modal.style.display = 'none';
    document.body.style.overflow = ''; // Restore scroll
    trailerIframe.src = '';
};

// Close modal when clicking outside content
modal.onclick = (e) => {
    if (e.target === modal) {
        closeModal.onclick();
    }
};

// Player Logic
function launchPlayer(movie, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    const id = movie.id;
    console.log('Launching player for:', movie.title || movie.name);
    if (!id) {
        console.error('No movie ID provided to launchPlayer');
        return;
    }

    // Set player info
    if (playerMovieTitle) playerMovieTitle.textContent = movie.title || movie.name;

    modal.style.display = 'none';
    if (trailerIframe) trailerIframe.src = '';

    if (playerScreen && playerIframe) {
        playerScreen.style.display = 'block';
        document.body.style.overflow = 'hidden';

        let type = movie.type || 'movie';
        if (movie.media_type === 'tv' || movie.first_air_date || !movie.title) {
            type = 'tv';
        }

        const season = movie.selectedSeason || 1;
        const episode = movie.selectedEpisode || 1;

        updatePlayerMeta(movie, type, season, episode);

        let embedUrl = `https://vidsrc-embed.ru/embed/movie/${id}?autoplay=1`;
        if (type === 'tv') {
            embedUrl = `https://vidsrc-embed.ru/embed/tv/${id}/${season}/${episode}?autoplay=1`;
            setupInPlayerEpisodeSwitcher(movie, season, episode);
            setupUpNextTimer(movie, season, episode);
        } else {
            document.getElementById('playerEpisodeSwitcher').style.display = 'none';
            document.getElementById('playerNextEpisodeBtn').style.display = 'none';
        }

        setTimeout(() => {
            playerIframe.src = embedUrl;
        }, 100);
    }
}

function updatePlayerMeta(movie, type, season, episode) {
    if (!playerMovieMeta) return;
    const year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
    const rating = movie.vote_average ? `★ ${movie.vote_average.toFixed(1)}` : '';
    let metaText = `${year} ${rating ? ' • ' + rating : ''}`;
    if (type === 'tv') {
        metaText += ` • S${season} E${episode}`;
    }
    playerMovieMeta.textContent = metaText;
}

async function setupInPlayerEpisodeSwitcher(tvData, currentSeason, currentEpisode) {
    const switcher = document.getElementById('playerEpisodeSwitcher');
    const episodesBtn = document.getElementById('playerEpisodesBtn');
    const episodesList = document.getElementById('playerEpisodesList');

    switcher.style.display = 'block';

    const renderSeasons = () => {
        episodesList.innerHTML = `<div class="player-switcher-header">Select Season</div>`;
        tvData.seasons.forEach(s => {
            if (s.season_number === 0) return; // Skip specials usually
            const div = document.createElement('div');
            div.className = `season-item ${s.season_number == currentSeason ? 'current' : ''}`;
            div.innerHTML = `
                <span>Season ${s.season_number}</span>
                <span class="episode-item-meta">${s.episode_count} Episodes</span>
            `;
            div.onclick = (e) => {
                e.stopPropagation();
                renderEpisodes(s.season_number);
            };
            episodesList.appendChild(div);
        });
    };

    const renderEpisodes = async (seasonNum) => {
        episodesList.innerHTML = `
            <div class="player-switcher-header">
                <span class="player-switcher-back" id="backToSeasons" title="Back to Seasons">←</span>
                <span>Season ${seasonNum}</span>
            </div>
        `;

        document.getElementById('backToSeasons').onclick = (e) => {
            e.stopPropagation();
            renderSeasons();
        };

        try {
            const res = await fetch(`/api/tv/${tvData.id}/season/${seasonNum}`);
            const data = await res.json();

            data.episodes.forEach(ep => {
                const div = document.createElement('div');
                div.className = `episode-item ${seasonNum == currentSeason && ep.episode_number == currentEpisode ? 'current' : ''}`;
                div.innerHTML = `
                    <span class="episode-item-title">E${ep.episode_number}: ${ep.name}</span>
                    <span class="episode-item-meta">${ep.runtime || '?'} min</span>
                `;
                div.onclick = () => {
                    episodesList.classList.remove('active');
                    launchPlayer({ ...tvData, type: 'tv', selectedSeason: seasonNum, selectedEpisode: ep.episode_number });
                };
                episodesList.appendChild(div);
            });
        } catch (err) {
            console.error('Error fetching episodes:', err);
        }
    };

    episodesBtn.onclick = () => {
        const isActive = episodesList.classList.toggle('active');
        if (isActive) renderSeasons();
        showPlayerUI();
    };
}


playerBackBtn.onclick = () => {
    playerScreen.style.display = 'none';
    playerIframe.src = '';
    document.body.style.overflow = 'auto';
    if (playerUIHideTimeout) clearTimeout(playerUIHideTimeout);
    clearUpNext();
};

// Player UI Idle Hiding Logic
let playerUIHideTimeout;
let upNextTimer;
let upNextCountdown;

const showPlayerUI = () => {
    const controls = document.querySelector('.player-controls-overlay');
    if (!controls) return;

    controls.style.opacity = '1';

    if (playerUIHideTimeout) clearTimeout(playerUIHideTimeout);
    playerUIHideTimeout = setTimeout(() => {
        // Only hide if the episodes list is not open
        const episodesList = document.getElementById('playerEpisodesList');
        if (episodesList && !episodesList.classList.contains('active')) {
            controls.style.opacity = '0';
        }
    }, 4000);
};

// Next Episode / Auto-Play Logic
async function setupUpNextTimer(tvData, season, episode) {
    clearUpNext();

    // Get episode runtime (default 30m if not found)
    let runtimeMinutes = 30;
    try {
        const res = await fetch(`/api/tv/${tvData.id}/season/${season}`);
        const data = await res.json();
        const currentEp = data.episodes.find(e => e.episode_number == episode);
        if (currentEp && currentEp.runtime) runtimeMinutes = currentEp.runtime;

        // Find next episode
        // Find next episode
        const nextEp = data.episodes.find(e => e.episode_number == (parseInt(episode) + 1));
        let nextData = null;

        if (nextEp) {
            nextData = { ...tvData, type: 'tv', selectedSeason: season, selectedEpisode: nextEp.episode_number, epTitle: nextEp.name };
        } else {
            // Check if there's a next season
            if (tvData.seasons) {
                const nextSeasonIndex = tvData.seasons.findIndex(s => s.season_number == season) + 1;
                if (nextSeasonIndex < tvData.seasons.length) {
                    const nextSeasonNum = tvData.seasons[nextSeasonIndex].season_number;
                    nextData = { ...tvData, type: 'tv', selectedSeason: nextSeasonNum, selectedEpisode: 1, epTitle: `Season ${nextSeasonNum} Premiere` };
                }
            }
        }

        if (nextData) {
            const nextBtn = document.getElementById('playerNextEpisodeBtn');
            nextBtn.style.display = 'block';
            nextBtn.onclick = () => launchPlayer(nextData);

            // Set up prompt for 20s before end
            // Set up prompt for 20s before end
            const runtimeSeconds = runtimeMinutes * 60;
            const triggerTime = Math.max(0, (runtimeSeconds - 20) * 1000);

            console.log(`[Timer] Ep will last ~${runtimeMinutes}m. Prompt in ${triggerTime / 1000}s`);

            upNextTimer = setTimeout(() => {
                showUpNextPrompt(nextData);
            }, triggerTime);
        } else {
            document.getElementById('playerNextEpisodeBtn').style.display = 'none';
        }
    } catch (err) {
        console.error('Error setting up Up Next:', err);
    }
}

function showUpNextPrompt(nextData) {
    const prompt = document.getElementById('upNextPrompt');
    const title = document.getElementById('upNextTitle');
    const playBtn = document.getElementById('playNextNowBtn');
    const dismissBtn = document.getElementById('dismissUpNextBtn');
    const progress = document.getElementById('upNextTimerProgress');

    title.textContent = `S${nextData.selectedSeason} E${nextData.selectedEpisode}: ${nextData.epTitle || ''}`;
    prompt.style.display = 'block';

    playBtn.onclick = () => {
        clearUpNext();
        launchPlayer(nextData);
    };

    dismissBtn.onclick = () => {
        prompt.style.display = 'none';
        clearUpNext(); // Don't auto-play
    };

    // 20s countdown
    let remaining = 20;
    progress.style.width = '100%';

    upNextCountdown = setInterval(() => {
        remaining -= 1;
        progress.style.width = `${(remaining / 20) * 100}%`;

        if (remaining <= 0) {
            clearInterval(upNextCountdown);
            launchPlayer(nextData);
        }
    }, 1000);
}

function clearUpNext() {
    if (upNextTimer) clearTimeout(upNextTimer);
    if (upNextCountdown) clearInterval(upNextCountdown);
    document.getElementById('upNextPrompt').style.display = 'none';
    document.getElementById('playerNextEpisodeBtn').style.display = 'none';
}

if (playerInteractionLayer) {
    playerInteractionLayer.onmousemove = showPlayerUI;
}

// Search Logic
searchInput.oninput = async (e) => {
    const query = e.target.value.trim();
    if (query.length > 2) {
        try {
            const res = await fetch(`/api/movies/search?query=${query}`);
            const data = await res.json();
            renderSearchResults(data.results);
        } catch (err) {
            console.error('Search error:', err);
        }
    } else {
        searchResults.style.display = 'none';
        rowsContainer.style.display = 'block';
        hero.style.display = 'flex';
    }
};

function renderSearchResults(movies) {
    searchGrid.innerHTML = '';
    movies.forEach(movie => {
        if (!movie.poster_path && !movie.backdrop_path) return;
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.style.backgroundImage = `url(${POSTER_BASE_URL}${movie.poster_path || movie.backdrop_path})`;
        card.style.height = '300px'; // Consistent height for grid results
        card.innerHTML = `<div class="movie-card-info">${movie.title || movie.name}</div>`;
        card.onclick = () => showModal(movie.id, movie);
        searchGrid.appendChild(card);
    });

    searchResults.style.display = 'block';
    rowsContainer.style.display = 'none';
    hero.style.display = 'none';
    genreSelector.style.display = 'none';
}

// Scroll Effect for Header
window.onscroll = () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
};

setupMobileMenu();
init();
