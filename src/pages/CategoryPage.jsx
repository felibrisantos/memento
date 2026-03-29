import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search as SearchIcon } from 'lucide-react';
import { useCollection } from '../hooks/useCollection';
import { getStatusesFor } from '../lib/storage';
import SearchBar from '../components/SearchBar';
import MediaCard from '../components/MediaCard';

const categoryInfo = {
  movies: { title: 'Film', noun: 'film' },
  tvshows: { title: 'Television', noun: 'show' },
  albums: { title: 'Albums', noun: 'album' },
  books: { title: 'Books', noun: 'book' },
};

export default function CategoryPage({ type }) {
  const { collection, add, remove, update, isInCollection } = useCollection();
  const items = collection[type] || [];
  const info = categoryInfo[type];
  const availableStatuses = getStatusesFor(type);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const filtered = useMemo(() => {
    let list = filter === 'all' ? items : items.filter(i => i.status === filter);
    switch (sortBy) {
      case 'recent': return [...list].sort((a, b) => b.addedAt - a.addedAt);
      case 'rating': return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0));
      case 'title': return [...list].sort((a, b) => a.title.localeCompare(b.title));
      case 'year': return [...list].sort((a, b) => (b.year || '').localeCompare(a.year || ''));
      default: return list;
    }
  }, [items, filter, sortBy]);

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-5 sm:p-8 max-w-[1200px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-8 pt-4">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[10px] font-mono text-text-dim tracking-[0.3em] uppercase mb-3"
          >
            Category
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-5xl text-text"
          >
            {info.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-text-muted mt-2 text-sm"
          >
            {items.length} {info.noun}{items.length !== 1 ? 's' : ''} in your archive
          </motion.p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchBar type={type} onAdd={add} isInCollection={isInCollection} />
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2.5 text-xs text-text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7670' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}
          >
            <option value="all">All statuses</option>
            {availableStatuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className="bg-card border border-border rounded-lg px-3 py-2.5 text-xs text-text-muted focus:outline-none focus:border-accent/40 transition-colors font-mono appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%237a7670' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center', paddingRight: '28px' }}
          >
            <option value="recent">Recent</option>
            <option value="rating">Rating</option>
            <option value="title">Title</option>
            <option value="year">Year</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <AnimatePresence>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <MediaCard
                  item={item}
                  type={type}
                  onRemove={remove}
                  onUpdate={update}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-24"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6">
            <SearchIcon size={24} className="text-text-dim" strokeWidth={1.2} />
          </div>
          <p className="font-display text-3xl text-text-dim mb-3">
            {items.length === 0 ? `No ${info.noun}s yet` : 'No matches'}
          </p>
          <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
            {items.length === 0
              ? `Use the search bar above to find and add ${info.noun}s to your archive.`
              : 'Try changing your filters.'}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
