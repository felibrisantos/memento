import { useState, useRef, useEffect } from 'react';
import { Search, X, Loader2, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { searchFns, isMovieConfigured } from '../lib/api';

export default function SearchBar({ type, onAdd, isInCollection }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef(null);
  const containerRef = useRef(null);

  const needsConfig = (type === 'movies' || type === 'tvshows') && !isMovieConfigured();

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  function handleInput(val) {
    setQuery(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (val.trim().length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      try {
        const fn = searchFns[type];
        const items = await fn(val);
        setResults(items);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  }

  function handleSelect(item) {
    if (!isInCollection(type, item.id)) {
      onAdd(type, item);
    }
    setQuery('');
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {needsConfig ? (
        <div className="flex items-center gap-2 bg-card border border-accent/20 rounded-lg px-4 py-2.5 text-sm text-accent-dim">
          <AlertTriangle size={14} className="text-accent flex-shrink-0" />
          <span className="text-xs">
            Set <code className="font-mono text-accent text-[11px] bg-accent-glow px-1 py-0.5 rounded">VITE_TMDB_API_KEY</code> in your <code className="font-mono text-accent text-[11px] bg-accent-glow px-1 py-0.5 rounded">.env</code> file to search {type}. Get a free key at <a href="https://www.themoviedb.org/settings/api" target="_blank" rel="noreferrer" className="underline hover:text-accent">themoviedb.org</a>.
          </span>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" />
            <input
              type="text"
              value={query}
              onChange={e => handleInput(e.target.value)}
              placeholder="Search to add..."
              className="w-full bg-card border border-border rounded-lg pl-9 pr-9 py-2.5 text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent/40 transition-colors font-body"
            />
            {loading && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-accent animate-spin" />
            )}
            {query && !loading && (
              <button onClick={() => { setQuery(''); setResults([]); setOpen(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          <AnimatePresence>
            {open && results.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.98 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-2xl shadow-black/40 overflow-hidden z-50"
              >
                <div className="max-h-[360px] overflow-y-auto">
                  {results.map((item, i) => {
                    const inColl = isInCollection(type, item.id);
                    return (
                      <motion.button
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => handleSelect(item)}
                        disabled={inColl}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors ${
                          inColl
                            ? 'opacity-40 cursor-not-allowed'
                            : 'hover:bg-card-hover cursor-pointer'
                        } ${i < results.length - 1 ? 'border-b border-border/50' : ''}`}
                      >
                        {item.poster ? (
                          <img src={item.poster} alt="" className="w-9 h-13 rounded object-cover flex-shrink-0" />
                        ) : (
                          <div className="w-9 h-13 rounded bg-border flex-shrink-0 flex items-center justify-center">
                            <span className="text-text-dim text-[10px]">?</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text truncate font-medium">{item.title}</p>
                          <p className="text-[11px] text-text-muted">
                            {item.artist || item.author || ''}{item.year ? ` · ${item.year}` : ''}
                          </p>
                        </div>
                        {inColl && (
                          <span className="text-[10px] font-mono text-accent tracking-wider uppercase flex-shrink-0">
                            Added
                          </span>
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
