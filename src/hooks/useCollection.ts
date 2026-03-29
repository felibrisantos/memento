import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  loadCollection,
  saveCollection,
  addToCollection,
  removeFromCollection,
  updateItem,
} from '../lib/storage';
import type {
  Collection,
  CollectionRow,
  CollectionItem,
  SearchResult,
  Category,
  ItemUpdates,
} from '../types';

const TABLE = 'collection_items';

function rowsToCollection(rows: CollectionRow[]): Collection {
  const collection: Collection = { movies: [], tvshows: [], albums: [], books: [] };
  for (const row of rows) {
    const items = collection[row.category];
    if (items) {
      items.push({
        id: row.id,
        title: row.title,
        year: row.year,
        poster: row.poster,
        artist: row.artist ?? undefined,
        author: row.author ?? undefined,
        addedAt: row.added_at,
        status: row.status,
        rating: row.rating,
        notes: row.notes,
      });
    }
  }
  return collection;
}

function findCategory(local: Collection, itemId: string): Category | null {
  for (const [cat, items] of Object.entries(local) as [Category, CollectionItem[]][]) {
    if (items.some(i => i.id === itemId)) return cat;
  }
  return null;
}

export function useCollection() {
  const { user } = useAuth();
  const [collection, setCollection] = useState<Collection>(() => loadCollection());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;
    const userId = user.id;
    let cancelled = false;
    async function fetchCollection(): Promise<void> {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', userId)
        .order('added_at', { ascending: false });

      if (cancelled) return;
      if (!error && data) {
        const rows = data as CollectionRow[];
        const coll = rowsToCollection(rows);
        if (rows.length === 0) {
          const local = loadCollection();
          const localItems = Object.values(local).flat();
          if (localItems.length > 0) {
            const rowsToInsert = localItems.map(item => {
              const category = findCategory(local, item.id);
              return {
                id: item.id,
                user_id: userId,
                category,
                title: item.title,
                year: item.year ?? null,
                poster: item.poster ?? null,
                artist: item.artist ?? null,
                author: item.author ?? null,
                status: item.status ?? 'planned',
                rating: item.rating ?? null,
                notes: item.notes ?? '',
                added_at: item.addedAt || Date.now(),
              };
            }).filter((r): r is CollectionRow & { category: Category } => r.category !== null);

            const { error: migrateError } = await supabase.from(TABLE).insert(rowsToInsert);
            if (!migrateError && !cancelled) {
              const { data: newData } = await supabase
                .from(TABLE).select('*').eq('user_id', userId);
              if (newData) {
                const migrated = rowsToCollection(newData as CollectionRow[]);
                setCollection(migrated);
                saveCollection(migrated);
                setLoaded(true);
                return;
              }
            }
          }
        }
        setCollection(coll);
        saveCollection(coll);
      }
      setLoaded(true);
    }

    fetchCollection();
    return () => { cancelled = true; };
  }, [user]);

  const add = useCallback(async (type: Category, item: SearchResult): Promise<void> => {
    if (!user) return;
    const userId = user.id;
    const collectionItem: CollectionItem = {
      ...item,
      addedAt: Date.now(),
      status: type === 'movies' ? 'completed' : 'planned',
      rating: null,
      notes: '',
    };
    setCollection(prev => {
      const next = addToCollection(prev, type, collectionItem);
      saveCollection(next);
      return next;
    });

    const { error } = await supabase.from(TABLE).insert({
      id: item.id,
      user_id: userId,
      category: type,
      title: item.title,
      year: item.year ?? null,
      poster: item.poster ?? null,
      artist: item.artist ?? null,
      author: item.author ?? null,
      status: 'completed',
      rating: null,
      notes: '',
      added_at: Date.now(),
    });

    if (error) {
      const { data } = await supabase
        .from(TABLE).select('*').eq('user_id', userId);
      if (data) {
        const coll = rowsToCollection(data as CollectionRow[]);
        setCollection(coll);
        saveCollection(coll);
      }
    }
  }, [user]);

  const remove = useCallback(async (type: Category, id: string): Promise<void> => {
    if (!user) return;
    const userId = user.id;
    setCollection(prev => {
      const next = removeFromCollection(prev, type, id);
      saveCollection(next);
      return next;
    });

    await supabase.from(TABLE).delete()
      .eq('user_id', userId)
      .eq('id', id);
  }, [user]);

  const update = useCallback(async (type: Category, id: string, updates: ItemUpdates): Promise<void> => {
    if (!user) return;
    const userId = user.id;
    setCollection(prev => {
      const next = updateItem(prev, type, id, updates);
      saveCollection(next);
      return next;
    });

    const row: Partial<CollectionRow> = {};
    if ('status' in updates) row.status = updates.status;
    if ('rating' in updates) row.rating = updates.rating;
    if ('notes' in updates) row.notes = updates.notes;

    await supabase.from(TABLE).update(row)
      .eq('user_id', userId)
      .eq('id', id);
  }, [user]);

  const isInCollection = useCallback((type: Category, id: string): boolean => {
    return collection[type]?.some(i => i.id === id) ?? false;
  }, [collection]);

  const totalCount: number = Object.values(collection).flat().length;

  return { collection, add, remove, update, isInCollection, totalCount, loaded };
}
