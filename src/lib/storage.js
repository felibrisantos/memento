const STORAGE_KEY = 'memento_collection';

// Internal status values: completed, in_progress, planned, dropped
// Display labels vary by category for semantic correctness
export const STATUS_CONFIG = {
  movies: {
    completed: { label: 'Watched', color: 'text-green' },
    in_progress: null, // movies are watched in one sitting — no in-progress state
    planned: { label: 'Want to watch', color: 'text-accent' },
    dropped: { label: 'Dropped', color: 'text-red' },
  },
  tvshows: {
    completed: { label: 'Completed', color: 'text-green' },
    in_progress: { label: 'Watching', color: 'text-blue' },
    planned: { label: 'Plan to watch', color: 'text-accent' },
    dropped: { label: 'Dropped', color: 'text-red' },
  },
  albums: {
    completed: { label: 'Listened', color: 'text-green' },
    in_progress: { label: 'Listening', color: 'text-blue' },
    planned: { label: 'Want to listen', color: 'text-accent' },
    dropped: { label: 'Dropped', color: 'text-red' },
  },
  books: {
    completed: { label: 'Read', color: 'text-green' },
    in_progress: { label: 'Reading', color: 'text-blue' },
    planned: { label: 'Want to read', color: 'text-accent' },
    dropped: { label: 'Dropped', color: 'text-red' },
  },
};

// Get available statuses for a category (filters out null entries)
export function getStatusesFor(type) {
  return Object.entries(STATUS_CONFIG[type] || {})
    .filter(([, v]) => v !== null)
    .map(([key, val]) => ({ value: key, label: val.label, color: val.color }));
}

// Get display label for a status in a category
export function getStatusLabel(type, status) {
  return STATUS_CONFIG[type]?.[status]?.label || status;
}

// Get color class for a status in a category
export function getStatusColor(type, status) {
  return STATUS_CONFIG[type]?.[status]?.color || 'text-text-muted';
}

export function loadCollection() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    const collection = data ? JSON.parse(data) : { movies: [], tvshows: [], albums: [], books: [] };
    // Migrate legacy 'watching' status to 'in_progress'
    for (const type of Object.keys(collection)) {
      collection[type] = collection[type].map(item =>
        item.status === 'watching' ? { ...item, status: 'in_progress' } : item
      );
    }
    return collection;
  } catch {
    return { movies: [], tvshows: [], albums: [], books: [] };
  }
}

export function saveCollection(collection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

export function addToCollection(collection, type, item) {
  const exists = collection[type].some(i => i.id === item.id);
  if (exists) return collection;
  // Movies default to 'completed', everything else to 'planned'
  const defaultStatus = type === 'movies' ? 'completed' : 'planned';
  return {
    ...collection,
    [type]: [...collection[type], { ...item, addedAt: Date.now(), status: defaultStatus, rating: null, notes: '' }],
  };
}

export function removeFromCollection(collection, type, id) {
  return {
    ...collection,
    [type]: collection[type].filter(i => i.id !== id),
  };
}

export function updateItem(collection, type, id, updates) {
  return {
    ...collection,
    [type]: collection[type].map(i => i.id === id ? { ...i, ...updates } : i),
  };
}
