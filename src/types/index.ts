import type { User, Session, AuthResponse } from '@supabase/supabase-js';

export type Category = 'movies' | 'tvshows' | 'albums' | 'books';
export type Status = 'completed' | 'in_progress' | 'planned' | 'dropped';

export interface CollectionItem {
  id: string;
  title: string;
  year: string | null;
  poster: string | null;
  artist?: string;
  author?: string;
  addedAt: number;
  status: Status;
  rating: number | null;
  notes: string;
}

export interface Collection {
  movies: CollectionItem[];
  tvshows: CollectionItem[];
  albums: CollectionItem[];
  books: CollectionItem[];
}

export interface CollectionRow {
  id: string;
  user_id: string;
  category: Category;
  title: string;
  year: string | null;
  poster: string | null;
  artist: string | null;
  author: string | null;
  status: Status;
  rating: number | null;
  notes: string;
  added_at: number;
}

export type ItemUpdates = Partial<Pick<CollectionItem, 'status' | 'rating' | 'notes'>>;

export interface SearchResult {
  id: string;
  title: string;
  year: string | null;
  poster: string | null;
  artist?: string;
  author?: string;
  type: Category;
}

export interface StatusOption {
  value: Status;
  label: string;
  color: string;
}

export interface StatusEntry {
  label: string;
  color: string;
}

export type StatusConfig = Record<Category, Partial<Record<Status, StatusEntry | null>>>;

export interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
}
