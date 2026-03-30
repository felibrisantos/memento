import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getStatusColor, getStatusesFor, getStatusLabel } from "@/lib/storage";
import type { Category, CollectionItem, Status } from "@/types";
import { Edit3, Star, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

interface MediaCardProps {
  item: CollectionItem;
  type: Category;
  onRemove: (type: Category, id: string) => void;
  onUpdate: (
    type: Category,
    id: string,
    updates: Partial<CollectionItem>,
  ) => void;
}

export default function MediaCard({
  item,
  type,
  onRemove,
  onUpdate,
}: MediaCardProps) {
  const [editing, setEditing] = useState(false);
  const [editNotes, setEditNotes] = useState(item.notes || "");
  const [editStatus, setEditStatus] = useState<Status>(
    item.status || "completed",
  );
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
      className="group relative bg-card border border-border rounded-xl overflow-hidden transition-all duration-300 hover:border-border-light hover:shadow-[0_0_30px_-5px_rgba(232,196,104,0.15)]"
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
            <span className="font-display text-5xl text-text-muted">
              {item.title?.[0]}
            </span>
          </div>
        )}

        {/* Hover overlay */}
        <div
          className={`absolute inset-0 bg-gradient-to-t from-void/90 via-void/30 to-transparent transition-opacity duration-300 ${hovered ? "opacity-100" : "opacity-0"}`}
        >
          <div className="absolute bottom-4 left-3 right-3 flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setEditing(true)}
                  className="flex-1 bg-card/80 backdrop-blur-sm text-text-muted hover:text-gold"
                >
                  <Edit3 size={13} />
                  <span>Editar</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Editar item</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onRemove(type, item.id)}
                  className="bg-card/80 backdrop-blur-sm text-text-muted hover:text-red"
                >
                  <Trash2 size={13} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remover</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Status indicator */}
        <Badge
          variant="outline"
          className={`absolute top-2.5 right-2.5 text-xs font-mono tracking-wider uppercase bg-void/70 backdrop-blur-sm border-0 ${getStatusColor(type, item.status)}`}
        >
          {getStatusLabel(type, item.status)}
        </Badge>
      </div>

      {/* Info */}
      <div className="p-3 sm:p-4">
        <h3 className="text-sm sm:text-base font-medium text-text truncate leading-snug">
          {item.title}
        </h3>
        <div className="flex items-center justify-between mt-1.5 sm:mt-2">
          <p className="text-xs sm:text-sm text-text-muted truncate mr-1">
            {[item.artist || item.author, item.year]
              .filter(Boolean)
              .join(" · ")}
          </p>
          {/* Star rating */}
          <div className="flex gap-0 sm:gap-0.5 shrink-0">
            {[1, 2, 3, 4, 5].map((n) => (
              <Button
                key={n}
                variant="ghost"
                size="icon-xs"
                onClick={() => handleRate(n === item.rating ? null : n)}
                className="transition-transform hover:scale-125 p-0"
              >
                <Star
                  size={10}
                  className={
                    n <= (item.rating || 0)
                      ? "text-gold fill-gold"
                      : "text-text-muted"
                  }
                />
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="bg-card border-border sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-mono text-gold tracking-wider uppercase">
              Editar
            </DialogTitle>
          </DialogHeader>
          <Separator />
          <div className="space-y-5 pt-2">
            <div className="space-y-2.5">
              <label className="text-sm font-mono text-text-muted tracking-wider uppercase">
                Status
              </label>
              <Select
                value={editStatus}
                onValueChange={(v) => setEditStatus(v as Status)}
              >
                <SelectTrigger className="bg-card border-border text-base font-mono text-text-muted">
                  <SelectValue>
                    {statuses.find((s) => s.value === editStatus)?.label ??
                      editStatus}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2.5">
              <label className="text-sm font-mono text-text-muted tracking-wider uppercase">
                Notas
              </label>
              <Textarea
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Notas pessoais..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          <Separator />
          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(false)}
              className="text-text-muted"
            >
              Cancelar
            </Button>
            <Button
              size="sm"
              onClick={handleSave}
              className="bg-gold text-void hover:bg-gold-dim font-mono text-base tracking-wider uppercase"
            >
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
