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

const TABLE = 'collection_items';

function rowsToCollection(rows) {
  const collection = { movies: [], tvshows: [], albums: [], books: [] };
  for (const row of rows) {
    collection[row.category].push({
      id: row.id,
      title: row.title,
      year: row.year,
      poster: row.poster,
      artist: row.artist,
      author: row.author,
      addedAt: row.added_at,
      status: row.status,
      rating: row.rating,
      notes: row.notes,
    });
  }
  return collection;
}

function findCategory(local, itemId) {
  for (const [cat, items] of Object.entries(local)) {
    if (items.some(i => i.id === itemId)) return cat;
  }
  return null;
}

export function useCollection() {
  const { user } = useAuth();
  const [collection, setCollection] = useState(() => loadCollection());
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    async function fetchCollection() {
      const { data, error } = await supabase
        .from(TABLE)
        .select('*')
        .eq('user_id', user.id)
        .order('added_at', { ascending: false });

      if (cancelled) return;

      if (!error && data) {
        const coll = rowsToCollection(data);

        // Auto-migrate: if Supabase is empty but localStorage has data, push it up
        if (data.length === 0) {
          const local = loadCollection();
          const localItems = Object.values(local).flat();
          if (localItems.length > 0) {
            const rows = localItems.map(item => ({
              id: item.id,
              user_id: user.id,
              category: findCategory(local, item.id),
              title: item.title,
              year: item.year || null,
              poster: item.poster || null,
              artist: item.artist || null,
              author: item.author || null,
              status: item.status || 'planned',
              rating: item.rating || null,
              notes: item.notes || '',
              added_at: item.addedAt || Date.now(),
            })).filter(r => r.category);

            const { error: migrateError } = await supabase.from(TABLE).insert(rows);
            if (!migrateError && !cancelled) {
              const { data: newData } = await supabase
                .from(TABLE).select('*').eq('user_id', user.id);
              if (newData) {
                const migrated = rowsToCollection(newData);
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

  const add = useCallback(async (type, item) => {
    if (!user) return;

    setCollection(prev => {
      const next = addToCollection(prev, type, item);
      saveCollection(next);
      return next;
    });

    const { error } = await supabase.from(TABLE).insert({
      id: item.id,
      user_id: user.id,
      category: type,
      title: item.title,
      year: item.year || null,
      poster: item.poster || null,
      artist: item.artist || null,
      author: item.author || null,
      status: 'completed',
      rating: null,
      notes: '',
      added_at: Date.now(),
    });

    if (error) {
      const { data } = await supabase
        .from(TABLE).select('*').eq('user_id', user.id);
      if (data) {
        const coll = rowsToCollection(data);
        setCollection(coll);
        saveCollection(coll);
      }
    }
  }, [user]);

  const remove = useCallback(async (type, id) => {
    if (!user) return;

    setCollection(prev => {
      const next = removeFromCollection(prev, type, id);
      saveCollection(next);
      return next;
    });

    await supabase.from(TABLE).delete()
      .eq('user_id', user.id)
      .eq('id', id);
  }, [user]);

  const update = useCallback(async (type, id, updates) => {
    if (!user) return;

    setCollection(prev => {
      const next = updateItem(prev, type, id, updates);
      saveCollection(next);
      return next;
    });

    const row = {};
    if ('status' in updates) row.status = updates.status;
    if ('rating' in updates) row.rating = updates.rating;
    if ('notes' in updates) row.notes = updates.notes;

    await supabase.from(TABLE).update(row)
      .eq('user_id', user.id)
      .eq('id', id);
  }, [user]);

  const isInCollection = useCallback((type, id) => {
    return collection[type]?.some(i => i.id === id) ?? false;
  }, [collection]);

  const totalCount = Object.values(collection).flat().length;

  return { collection, add, remove, update, isInCollection, totalCount, loaded };
}
