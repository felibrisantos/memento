import { Search as SearchIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import MediaCard from "../components/MediaCard";
import SearchBar from "../components/SearchBar";
import { useCollection } from "../hooks/useCollection";
import { getStatusesFor } from "../lib/storage";
import type { Category, CollectionItem, Status } from "../types";

type SortOption = "recent" | "rating" | "title" | "year";

interface CategoryInfo {
  title: string;
  noun: string;
}

interface CategoryPageProps {
  type: Category;
}

const categoryInfo: Record<Category, CategoryInfo> = {
  movies: { title: "Filmes", noun: "filme" },
  tvshows: { title: "Séries", noun: "série" },
  albums: { title: "Álbuns", noun: "álbum" },
  books: { title: "Livros", noun: "livro" },
};

export default function CategoryPage({ type }: CategoryPageProps) {
  const { collection, add, remove, update, isInCollection } = useCollection();
  const items: CollectionItem[] = collection[type] ?? [];
  const info = categoryInfo[type];
  const availableStatuses = getStatusesFor(type);
  const [filter, setFilter] = useState<Status | "all">("all");
  const [sortBy, setSortBy] = useState<SortOption>("recent");

  const filtered = useMemo(() => {
    let list =
      filter === "all" ? items : items.filter((i) => i.status === filter);
    switch (sortBy) {
      case "recent":
        return [...list].sort((a, b) => b.addedAt - a.addedAt);
      case "rating":
        return [...list].sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
      case "title":
        return [...list].sort((a, b) => a.title.localeCompare(b.title));
      case "year":
        return [...list].sort((a, b) =>
          (b.year ?? "").localeCompare(a.year ?? ""),
        );
      default:
        return list;
    }
  }, [items, filter, sortBy]);

  return (
    <motion.div
      key={type}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 lg:p-12 max-w-[1200px] mx-auto"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-10 pt-16 lg:pt-4">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-sm font-mono text-text-muted tracking-[0.25em] uppercase mb-4"
          >
            Categoria
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="font-display text-[3rem] sm:text-[3.5rem] text-text tracking-tight"
          >
            {info.title}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="text-text-muted mt-3 text-lg"
          >
            {items.length} item{items.length !== 1 ? "s" : ""} no seu arquivo
          </motion.p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex-1">
          <SearchBar type={type} onAdd={add} isInCollection={isInCollection} />
        </div>
        <div className="flex gap-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as Status | "all")}
            className="bg-card border border-border rounded-lg px-4 py-3 text-base text-text-muted focus:outline-none focus:border-gold/40 transition-colors font-mono appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23bfb9b0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "34px",
            }}
          >
            <option value="all">Todos os status</option>
            {availableStatuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="bg-card border border-border rounded-lg px-4 py-3 text-base text-text-muted focus:outline-none focus:border-gold/40 transition-colors font-mono appearance-none cursor-pointer"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23bfb9b0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
              paddingRight: "34px",
            }}
          >
            <option value="recent">Recente</option>
            <option value="rating">Avaliação</option>
            <option value="title">Título</option>
            <option value="year">Ano</option>
          </select>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
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
          className="text-center py-28"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-border mb-8">
            <SearchIcon
              size={28}
              className="text-text-muted"
              strokeWidth={1.2}
            />
          </div>
          <p className="font-display text-4xl text-text-muted mb-4">
            {items.length === 0 ? "Nada aqui ainda" : "Sem resultados"}
          </p>
          <p className="text-lg text-text-muted max-w-sm mx-auto leading-relaxed">
            {items.length === 0
              ? `Use a barra de busca acima para encontrar e adicionar itens ao seu arquivo.`
              : "Tente mudar seus filtros."}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
