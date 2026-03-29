import { motion, AnimatePresence } from 'motion/react';
import { Film, Tv, Disc3, BookOpen, ArrowRight, Library as LibraryIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCollection } from '../hooks/useCollection';
import MediaCard from '../components/MediaCard';

const categoryMeta = {
  movies: { icon: Film, label: 'Film', color: 'text-accent', path: '/movies' },
  tvshows: { icon: Tv, label: 'TV Shows', color: 'text-blue', path: '/tvshows' },
  albums: { icon: Disc3, label: 'Albums', color: 'text-purple', path: '/albums' },
  books: { icon: BookOpen, label: 'Books', color: 'text-green', path: '/books' },
};

export default function Library() {
  const { collection, remove, update } = useCollection();

  const totalItems = Object.values(collection).flat().length;

  // Get 4 most recently added items across all categories
  const recent = Object.entries(collection)
    .flatMap(([type, items]) => items.map(i => ({ ...i, _type: type })))
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-5 sm:p-8 max-w-[1200px] mx-auto"
    >
      {/* Hero */}
      <div className="mb-12 pt-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-[10px] font-mono text-text-dim tracking-[0.3em] uppercase mb-3"
        >
          Your archive
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display text-6xl text-text leading-[1.05]"
        >
          Collection
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-text-muted mt-3 text-sm"
        >
          {totalItems} item{totalItems !== 1 ? 's' : ''} archived across {Object.keys(categoryMeta).filter(k => collection[k]?.length > 0).length} categories
        </motion.p>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-14">
        {Object.entries(categoryMeta).map(([key, meta], i) => {
          const count = collection[key]?.length || 0;
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.06 }}
            >
              <Link
                to={meta.path}
                className="block bg-card border border-border rounded-xl p-5 transition-all duration-300 hover:border-border-light hover:bg-card-hover group"
              >
                <meta.icon size={18} className={`${meta.color} mb-4`} strokeWidth={1.5} />
                <p className="text-[10px] font-mono text-text-dim tracking-[0.2em] uppercase mb-1">{meta.label}</p>
                <p className="font-display text-3xl text-text">{count}</p>
                <ArrowRight
                  size={12}
                  className="text-text-dim mt-3 group-hover:translate-x-1 group-hover:text-accent transition-all"
                />
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Recently Added */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-[10px] font-mono text-text-dim tracking-[0.3em] uppercase">
              Recently archived
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <AnimatePresence>
              {recent.map(item => (
                <MediaCard
                  key={item.id}
                  item={item}
                  type={item._type}
                  onRemove={remove}
                  onUpdate={update}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* Empty State */}
      {totalItems === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center py-24"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-card border border-border mb-6">
            <LibraryIcon size={24} className="text-text-dim" strokeWidth={1.2} />
          </div>
          <p className="font-display text-3xl text-text-dim mb-3">Nothing here yet</p>
          <p className="text-sm text-text-muted max-w-xs mx-auto leading-relaxed">
            Navigate to a category and search to start building your personal archive.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
