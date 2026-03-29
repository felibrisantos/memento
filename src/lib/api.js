// TMDB API - Free key from https://www.themoviedb.org/settings/api
// Sign up free, go to Settings > API, copy your "API Key (v3 auth)"
const TMDB_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w300';

async function tmdbFetch(endpoint, params = {}) {
  if (!TMDB_KEY) return [];
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url);
    const data = await res.json();
    return data.results || [];
  } catch {
    return [];
  }
}

export function isMovieConfigured() {
  return !!TMDB_KEY;
}

export async function searchMovies(query) {
  const results = await tmdbFetch('/search/movie', { query });
  return results.map(m => ({
    id: `movie-${m.id}`,
    title: m.title,
    year: m.release_date?.slice(0, 4),
    poster: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    type: 'movies',
  }));
}

export async function searchTVShows(query) {
  const results = await tmdbFetch('/search/tv', { query });
  return results.map(m => ({
    id: `tv-${m.id}`,
    title: m.name,
    year: m.first_air_date?.slice(0, 4),
    poster: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    type: 'tvshows',
  }));
}

export async function searchAlbums(query) {
  const res = await fetch(`https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=12`);
  const data = await res.json();
  return data.results.map(a => ({
    id: `album-${a.collectionId}`,
    title: a.collectionName,
    year: a.releaseDate?.slice(0, 4),
    poster: a.artworkUrl100?.replace('100x100', '300x300'),
    artist: a.artistName,
    type: 'albums',
  }));
}

export async function searchBooks(query) {
  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`);
  const data = await res.json();
  return data.docs.map(b => ({
    id: `book-${b.key}`,
    title: b.title,
    year: b.first_publish_year?.toString(),
    poster: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null,
    author: b.author_name?.[0],
    type: 'books',
  }));
}

export const searchFns = {
  movies: searchMovies,
  tvshows: searchTVShows,
  albums: searchAlbums,
  books: searchBooks,
};
