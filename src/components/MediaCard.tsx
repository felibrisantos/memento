import { Star, Trash2, Edit3, X, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';
import { getStatusesFor, getStatusLabel, getStatusColor } from '../lib/storage';
import type { CollectionItem, Category, Status } from '../types';

interface MediaCardProps {
  item: CollectionItem;
  type: Category;
  onRemove: (type: Category, id: string) => void;
  onUpdate: (type: Category, id: string, updates: Partial<CollectionItem>) => void;
}

export default function MediaCard({ item, type, onRemove, onUpdate }: MediaCardProps) {
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(item.notes || '');
  const [editStatus, setEditStatus] = useState<Status>(item.status || 'completed');
  const [hovered, setHovered] = useState(false);

  const statuses = getStatusesFor(type);

  function handleSave() {
    onUpdate(type, item.id, { notes: editNotes, status: editStatus });
    setEditing(false);
  }

  function handleRate(rating: number | null) {
    onUpdate(type, item.id, { rating });
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, y: -10 }}
      transition={{ duration: 0.25 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-border-light hover:shadow-[0_0_20px_-5px_rgba(232,196,104,0.15)]"
    >
      {/* Poster */}
      <div className="aspect-[2/3] relative overflow-hidden">
        {item.poster ? (
          <img
            src={item.poster}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-border flex items-center justify-center">
            <span className="font-display text-4xl text-text-dim">{item.title?.[0]}</span>
          </div>
        )}

        {/* Hover overlay */}
        <div className={`absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="absolute bottom-3 left-3 right-3 flex gap-2">
            <button
              onClick={() => setEditing(true)}
              className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-card/80 backdrop-blur-sm text-text-muted hover:text-accent transition-colors text-xs"
            >
              <Edit3 size={12} />
              <span>Edit</span>
            </button>
            <button
              onClick={() => onRemove(type, item.id)}
              className="flex items-center justify-center w-8 py-1.5 rounded-md bg-card/80 backdrop-blur-sm text-text-muted hover:text-red transition-colors"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {/* Status indicator */}
        <div className={`absolute top-2 right-2 px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wider uppercase bg-void/70 backdrop-blur-sm ${getStatusColor(type, item.status)}`}>
          {getStatusLabel(type, item.status)}
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-medium text-text truncate leading-tight">{item.title}</h3>
        <div className="flex items-center justify-between mt-1.5">
          <p className="text-[11px] text-text-muted">
            {item.artist || item.author || ''}{item.year ? ` · ${item.year}` : ''}
          </p>
          {/* Star rating */}
          <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map(n => (
              <button
                key={n}
                onClick={() => handleRate(n === item.rating ? null : n)}
                className="transition-transform hover:scale-125"
              >
                <Star
                  size={10}
                  className={n <= (item.rating || 0) ? 'text-accent fill-accent' : 'text-text-dim'}
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="absolute inset-0 bg-void/95 backdrop-blur-sm z-10 flex flex-col p-3" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono text-accent tracking-wider uppercase">Edit</span>
            <div className="flex gap-1">
              <button onClick={handleSave} className="p-1 rounded hover:bg-card text-green transition-colors">
                <Check size={14} />
              </button>
              <button onClick={() => setEditing(false)} className="p-1 rounded hover:bg-card text-text-muted transition-colors">
                <X size={14} />
              </button>
            </div>
          </div>

          <label className="text-[10px] font-mono text-text-dim tracking-wider uppercase mb-1">Status</label>
          <select
            value={editStatus}
            onChange={e => setEditStatus(e.target.value as Status)}
            className="bg-card border border-border rounded-md px-2 py-1.5 text-xs text-text mb-3 focus:outline-none focus:border-accent/40"
          >
            {statuses.map(s => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          <label className="text-[10px] font-mono text-text-dim tracking-wider uppercase mb-1">Notes</label>
          <textarea
            value={editNotes}
            onChange={e => setEditNotes(e.target.value)}
            placeholder="Personal notes..."
            className="flex-1 bg-card border border-border rounded-md px-2 py-1.5 text-xs text-text placeholder:text-text-dim resize-none focus:outline-none focus:border-accent/40"
          />
        </div>
      )}
    </motion.div>
  );
}
