import { isMovieConfigured, searchFns } from "@/lib/api";
import type { Category, SearchResult } from "@/types";
import { AlertTriangle, Loader2, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  type: Category;
  onAdd: (type: Category, item: SearchResult) => void;
  isInCollection: (type: Category, id: string) => boolean;
}

export default function SearchBar({
  type,
  onAdd,
  isInCollection,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const needsConfig =
    (type === "movies" || type === "tvshows") && !isMovieConfigured();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleInput(val: string) {
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

  function handleSelect(item: SearchResult) {
    if (!isInCollection(type, item.id)) {
      onAdd(type, item);
    }
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  return (
    <div ref={containerRef} className="relative">
      {needsConfig ? (
        <div className="flex items-center gap-3 bg-card border border-gold/20 rounded-lg px-5 py-3 text-base text-gold-dim">
          <AlertTriangle size={16} className="text-gold flex-shrink-0" />
          <span className="text-base">
            Defina{" "}
            <code className="font-mono text-gold text-sm bg-gold-glow px-1.5 py-0.5 rounded">
              VITE_TMDB_API_KEY
            </code>{" "}
            no arquivo{" "}
            <code className="font-mono text-gold text-sm bg-gold-glow px-1.5 py-0.5 rounded">
              .env
            </code>{" "}
            para buscar {type}. Obtenha uma chave gratuita em{" "}
            <a
              href="https://www.themoviedb.org/settings/api"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-gold"
            >
              themoviedb.org
            </a>
            .
          </span>
        </div>
      ) : (
        <>
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-text-dim"
            />
            <input
              type="text"
              value={query}
              onChange={(e) => handleInput(e.target.value)}
              placeholder="Buscar para adicionar..."
              className="w-full bg-card border border-border rounded-lg pl-11 pr-10 py-3 text-base text-text placeholder:text-text-dim focus:outline-none focus:border-gold/40 transition-colors font-body"
            />
            {loading && (
              <Loader2
                size={16}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gold animate-spin"
              />
            )}
            {query && !loading && (
              <button
                onClick={() => {
                  setQuery("");
                  setResults([]);
                  setOpen(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-dim hover:text-text transition-colors"
              >
                <X size={16} />
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
                <div className="max-h-[400px] overflow-y-auto">
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
                        className={`w-full flex items-center gap-4 px-4 py-3 text-left transition-colors ${
                          inColl
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-card-hover cursor-pointer"
                        } ${i < results.length - 1 ? "border-b border-border/50" : ""}`}
                      >
                        {item.poster ? (
                          <img
                            src={item.poster}
                            alt=""
                            className="w-10 h-[3.75rem] rounded object-cover flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-[3.75rem] rounded bg-border flex-shrink-0 flex items-center justify-center">
                            <span className="text-text-dim text-xs">?</span>
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm text-text truncate font-medium">
                            {item.title}
                          </p>
                          <p className="text-sm text-text-muted mt-0.5">
                            {item.artist || item.author || ""}
                            {item.year ? ` · ${item.year}` : ""}
                          </p>
                        </div>
                        {inColl && (
                          <span className="text-sm font-mono text-gold tracking-wider uppercase flex-shrink-0">
                            Adicionado
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
