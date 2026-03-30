import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  Disc3,
  Film,
  Library as LibraryIcon,
  Tv,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "react-router-dom";
import MediaCard from "../components/MediaCard";
import { useCollection } from "../hooks/useCollection";
import type { Category, CollectionItem } from "../types";

interface CategoryMeta {
  icon: LucideIcon;
  label: string;
  color: string;
  path: string;
}

interface RecentItem extends CollectionItem {
  _type: Category;
}

const categoryMeta: Record<Category, CategoryMeta> = {
  movies: { icon: Film, label: "Filmes", color: "text-gold", path: "/movies" },
  tvshows: {
    icon: Tv,
    label: "Séries",
    color: "text-blue",
    path: "/tvshows",
  },
  albums: {
    icon: Disc3,
    label: "Álbuns",
    color: "text-purple",
    path: "/albums",
  },
  books: {
    icon: BookOpen,
    label: "Livros",
    color: "text-green",
    path: "/books",
  },
};

export default function Library() {
  const { collection, remove, update } = useCollection();

  const totalItems = Object.values(collection).flat().length;

  // Get 8 most recently added items across all categories
  const recent: RecentItem[] = (
    Object.entries(collection) as [Category, CollectionItem[]][]
  )
    .flatMap(([type, items]) => items.map((i) => ({ ...i, _type: type })))
    .sort((a, b) => b.addedAt - a.addedAt)
    .slice(0, 8);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 sm:p-10 lg:p-12 max-w-[1200px] mx-auto"
    >
      {/* Hero */}
      <div className="mb-16 pt-16 lg:pt-4">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-sm font-mono text-text-muted tracking-[0.25em] uppercase mb-4"
        >
          Seu arquivo
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="font-display text-[3.5rem] sm:text-[4.5rem] text-text leading-[1.05] tracking-tight"
        >
          Coleção
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-text-muted mt-4 text-base"
        >
          {totalItems} item{totalItems !== 1 ? "s" : ""} arquivado
          {totalItems !== 1 ? "s" : ""} em{" "}
          {
            (Object.keys(categoryMeta) as Category[]).filter(
              (k) => collection[k]?.length > 0,
            ).length
          }{" "}
          categori
          {(Object.keys(categoryMeta) as Category[]).filter(
            (k) => collection[k]?.length > 0,
          ).length !== 1
            ? "as"
            : "a"}
        </motion.p>
      </div>

      {/* Category Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
        {(Object.entries(categoryMeta) as [Category, CategoryMeta][]).map(
          ([key, meta], i) => {
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
                  className="block bg-card border border-border rounded-xl p-6 transition-all duration-300 hover:border-border-light hover:bg-card-hover group"
                >
                  <meta.icon
                    size={22}
                    className={`${meta.color} mb-5`}
                    strokeWidth={1.5}
                  />
                  <p className="text-sm font-mono text-text-muted tracking-[0.15em] uppercase mb-1.5">
                    {meta.label}
                  </p>
                  <p className="font-display text-4xl text-text">{count}</p>
                  <ArrowRight
                    size={14}
                    className="text-text-muted mt-4 group-hover:translate-x-1 group-hover:text-gold transition-all"
                  />
                </Link>
              </motion.div>
            );
          },
        )}
      </div>

      {/* Recently Added */}
      {recent.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-mono text-text-muted tracking-[0.25em] uppercase">
              Adicionados recentemente
            </h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            <AnimatePresence>
              {recent.map((item) => (
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
          className="text-center py-28"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-card border border-border mb-8">
            <LibraryIcon
              size={28}
              className="text-text-muted"
              strokeWidth={1.2}
            />
          </div>
          <p className="font-display text-4xl text-text-muted mb-4">
            Nada aqui ainda
          </p>
          <p className="text-lg text-text-muted max-w-sm mx-auto leading-relaxed">
            Navegue até uma categoria e pesquise para começar a construir seu
            arquivo pessoal.
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
