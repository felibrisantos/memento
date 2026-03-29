import type { Category, SearchResult } from '../types';

const TMDB_KEY: string = import.meta.env.VITE_TMDB_API_KEY || '';
const TMDB_BASE = 'https://api.themoviedb.org/3';
const TMDB_IMG = 'https://image.tmdb.org/t/p/w300';

interface TmdbMovieResult {
  id: number;
  title: string;
  release_date?: string;
  poster_path?: string | null;
}

interface TmdbTvResult {
  id: number;
  name: string;
  first_air_date?: string;
  poster_path?: string | null;
}

interface TmdbResponse<T> {
  results?: T[];
}

async function tmdbFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T[]> {
  if (!TMDB_KEY) return [];
  const url = new URL(`${TMDB_BASE}${endpoint}`);
  url.searchParams.set('api_key', TMDB_KEY);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  try {
    const res = await fetch(url.toString());
    if (!res.ok) return [];
    const data: TmdbResponse<T> = await res.json();
    return data.results ?? [];
  } catch {
    return [];
  }
}

export function isMovieConfigured(): boolean {
  return !!TMDB_KEY;
}

export async function searchMovies(query: string): Promise<SearchResult[]> {
  const results = await tmdbFetch<TmdbMovieResult>('/search/movie', { query });
  return results.map(m => ({
    id: `movie-${m.id}`,
    title: m.title,
    year: m.release_date?.slice(0, 4) ?? null,
    poster: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    type: 'movies' as Category,
  }));
}

export async function searchTVShows(query: string): Promise<SearchResult[]> {
  const results = await tmdbFetch<TmdbTvResult>('/search/tv', { query });
  return results.map(m => ({
    id: `tv-${m.id}`,
    title: m.name,
    year: m.first_air_date?.slice(0, 4) ?? null,
    poster: m.poster_path ? `${TMDB_IMG}${m.poster_path}` : null,
    type: 'tvshows' as Category,
  }));
}

export async function searchAlbums(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=album&limit=12`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.results as Array<{
    collectionId: number;
    collectionName: string;
    releaseDate?: string;
    artworkUrl100?: string;
    artistName: string;
  }>).map(a => ({
    id: `album-${a.collectionId}`,
    title: a.collectionName,
    year: a.releaseDate?.slice(0, 4) ?? null,
    poster: a.artworkUrl100?.replace('100x100', '300x300') ?? null,
    artist: a.artistName,
    type: 'albums' as Category,
  }));
}

export async function searchBooks(query: string): Promise<SearchResult[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=12`
  );
  if (!res.ok) return [];
  const data = await res.json();
  return (data.docs as Array<{
    key: string;
    title: string;
    first_publish_year?: number;
    cover_i?: number;
    author_name?: string[];
  }>).map(b => ({
    id: `book-${b.key}`,
    title: b.title,
    year: b.first_publish_year?.toString() ?? null,
    poster: b.cover_i ? `https://covers.openlibrary.org/b/id/${b.cover_i}-M.jpg` : null,
    author: b.author_name?.[0],
    type: 'books' as Category,
  }));
}

export const searchFns: Record<Category, (query: string) => Promise<SearchResult[]>> = {
  movies: searchMovies,
  tvshows: searchTVShows,
  albums: searchAlbums,
  books: searchBooks,
};
